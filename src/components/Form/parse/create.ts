import { shallowReactive, type Ref, computed } from 'vue';
import type { Unit } from '../@types/unit';
import type { UnitIns } from '../unit';
import type { GroupIns } from '../group';
import type { ClzCollect } from '../collect';
import type {
	ParseGroupSettings,
	ParseUnitSettings,
	UnitComponents,
} from './type';
import type { PromiseResolve } from '@wang-yige/utils';
import { ParallelTask, isUndef, isFunction, isString } from '@wang-yige/utils';
import { useVueStatusRef } from 'status-ref/vue';
import { UnifyWatch } from '@/common/watch';
import type { ParseCLz } from '.';
import { __ParseReactive } from './reactive';
import { UnitUsefulClz } from './unit';
import { GroupUsefulClz } from './group';
import { CUSTOM_SYMBOL } from '../utils/symbol';
import { Cache } from './cache';
import { ReactiveProps } from '../utils/reactiveProps';

interface InsertUseful {
	$unit: UnitUsefulClz<any>;
	$group: GroupUsefulClz;
	available: () => Promise<void>;
	beforeAvailable: () => Promise<void>;
}

export class CreateUseful {
	private parse: ParseCLz;

	constructor(parse: ParseCLz) {
		this.parse = parse;
	}

	create(prop: string): InsertUseful {
		return {
			$unit: new UnitUsefulClz(prop, this.parse),
			$group: new GroupUsefulClz(this.parse),
			available: this.parse.available.bind(this.parse),
			beforeAvailable: this.parse.beforeAvailable.bind(this.parse),
		};
	}
}

export class __Parse {
	/** 组prop -> 组实例 */
	protected __groups = new Map<string, GroupIns>();
	/** 组实例 -> 组对应的单元集合 */
	protected __units = new WeakMap<GroupIns, Map<string, UnitIns>>();
	/** 组实例 -> 组对应的配置项解析对象 */
	protected __parse_group = new WeakMap<GroupIns, ParseGroupSettings>();
	/** 单元实例 -> 单元对应解析数据对象 */
	protected __parse_unit = new WeakMap<UnitIns, ParseUnitSettings>();
	/** 单元实例 -> 单元实际可见性（关联组的可见性，和最终生成的结果相关） */
	protected __visible_result = new WeakMap<UnitIns, Ref<boolean>>();
	protected __components = new WeakMap<UnitIns, UnitComponents<boolean>>();
	protected __usefuls = new WeakMap<UnitIns, InsertUseful>();
	protected __unit_props = new Set<string>();
	/** 提交前执行函数集合 */
	protected __submitStack = new Set<() => Promise<void>>();
	protected __parseReactive = new __ParseReactive();
	protected __base_initial_queue = new ParallelTask(5);
	protected __comps_initial_queue = new ParallelTask(5);
	protected __unifyWatch = new UnifyWatch();
	protected __available: boolean = false;
	private __before_available: boolean = false;
	private __resolve: PromiseResolve<void>[] = [];
	private __before_resolve: PromiseResolve<void>[] = [];
	private __isFocus: boolean = false;
	protected cache = new Cache(
		'unit',
		'groups',
		'units',
		'inGroups',
		'component'
	);

	// @ts-expect-error
	protected useful: CreateUseful;

	protected __status = useVueStatusRef
		.create('initial', 'loading', 'pending')
		.off();

	protected clearCreate() {
		this.__unifyWatch.clearWatch();
		this.__submitStack.clear();
		this.__parseReactive.clear();
		this.__groups.forEach((group) => this.__units.get(group)?.clear?.());
		this.__groups.clear();
		this.__unit_props.clear();
		this.cache.clear();
	}

	/** 基础配置解析完成，组件数据未加载 */
	public async beforeAvailable() {
		return new Promise<void>((resolve) => {
			if (this.__before_available) {
				return resolve();
			}
			this.__before_resolve.push(resolve);
		});
	}

	/** 异步挂起，等待所有配置解析完成 */
	public async available() {
		return new Promise<void>((resolve) => {
			if (this.__available) {
				return resolve();
			}
			this.__resolve.push(resolve);
		});
	}

	constructor(coll: ClzCollect) {
		this.__status.offInitial();
		this.__status.onLoading();
		for (const [groupProp, group, Group] of coll.entries()) {
			this.checkGroupProp(groupProp);
			this.__groups.set(groupProp, group);
			if (!this.__units.has(group)) {
				this.__units.set(group, new Map());
			}
			const unitMap = this.__units.get(group)!;
			const groupReactive = this.createGroupParseResult(groupProp, group);
			for (const [unitProp, unit] of Group.entries()) {
				this.checkUnitProp(unitProp);
				unitMap.set(unitProp, unit);
				this.__unit_props.add(unitProp);
				// 解析单元配置
				this.__base_initial_queue.add(
					async () =>
						await this.parseStack(unitProp, unit, groupReactive)
				);
			}
		}
		this.__base_initial_queue.onEmpty(() => {
			this.__before_available = true;
			this.__before_resolve.splice(0).forEach((resolve) => resolve());
		});
		this.__comps_initial_queue.onEmpty(() => {
			this.__available = true;
			this.__resolve.splice(0).forEach((resolve) => resolve());
			this.__status.offLoading();
			this.__status.onInitial();
		});
	}

	protected getUnit(prop: string) {
		if (this.cache.in.unit.has(prop)) {
			return this.cache.in.unit.get(prop)! as UnitIns;
		}
		for (const group of this.__groups.values()) {
			const unit = this.__units.get(group)?.get(prop);
			if (unit) {
				this.cache.in.unit.set(prop, unit);
				return unit;
			}
		}
	}

	private checkGroupProp(prop: string) {
		if (this.__groups.has(prop)) {
			throw new Error(`[group] 属性名 '${prop}' 已经存在`);
		}
	}

	private checkUnitProp(prop: string) {
		const unit = this.getUnit(prop);
		if (unit) {
			throw new Error(`[unit] 属性名 '${prop}' 已经存在`);
		}
	}

	private createGroupParseResult(prop: string, group: GroupIns) {
		const {
			label,
			showLabel = false,
			visible = true,
			clearable = true,
			disabled = false,
			readonly = false,
		} = group.bind;
		const reactive = shallowReactive({
			label,
			showLabel,
			visible,
			clearable,
			disabled,
			readonly,
		});
		this.__parse_group.set(group, { prop, reactive });
		return reactive;
	}

	private async parseStack(
		prop: string,
		unit: UnitIns,
		groupReactive: ParseGroupSettings['reactive']
	) {
		const bind = unit.bind;
		const value = await this.__parseReactive.reactive<any>(prop, bind);
		const parse = await this.createParseResult(
			prop,
			unit,
			value,
			groupReactive
		);
		this.__usefuls.set(unit, this.useful.create(prop));
		const { placeholder, change, submit } = bind;
		await this.parsePlaceholder(unit, placeholder, (str) => {
			// 赋值
			parse.reactive.placeholder = str;
		});
		await this.parseUsefulFunc(unit, change);
		await this.parseSubmit(unit, submit);
		this.__visible_result.set(
			unit,
			computed(() => {
				if (!groupReactive.visible) {
					return false;
				}
				return parse.reactive.visible;
			})
		);
		this.beforeAvailable().then(() => {
			this.__comps_initial_queue.add(async () => {
				const useful = this.__usefuls.get(unit)!;
				const item = await this.parseComponents<boolean>(unit, useful);
				this.__components.set(unit, item);
			});
		});
	}

	private async createParseResult(
		prop: string,
		unit: UnitIns,
		value: Ref<any>,
		groupReactive: ParseGroupSettings['reactive']
	) {
		let _focus = unit.bind.focus ?? false;
		if (_focus && this.__isFocus) {
			_focus = false;
		} else if (_focus) {
			this.__isFocus = true;
		}
		const focus = _focus;
		const placeholder = void 0;
		const {
			label = String.fromCharCode(32),
			ignore,
			validate,
			required = void 0,
			visible = true,
			disabled = groupReactive.disabled,
			readonly = groupReactive.readonly,
			clearable = groupReactive.clearable,
		} = unit.bind;
		const extendProperties = { required, disabled, readonly, clearable };
		const extendKeys = Object.keys(
			extendProperties
		) as (keyof typeof extendProperties)[];
		const noInitial = extendKeys.filter((item) => {
			return isUndef(extendProperties[item]);
		}) as ('disabled' | 'readonly' | 'clearable')[];
		// prettier-ignore
		const reactive = shallowReactive({label, placeholder, required, disabled, readonly, visible, clearable });
		// 数据更新
		this.__unifyWatch.watchEffect(() => {
			for (const key of noInitial) {
				reactive[key] = groupReactive[key];
			}
		});
		this.__parse_unit.set(unit, {
			prop,
			value,
			focus,
			ignore,
			validate,
			reactive,
		});
		return this.__parse_unit.get(unit)!;
	}

	private async parsePlaceholder(
		unit: UnitIns,
		placeholder: Unit['placeholder'],
		cb: (val: string) => void
	) {
		if (isUndef(placeholder) || isString(placeholder)) {
			return cb(placeholder || '');
		}
		if (isFunction(placeholder)) {
			this.parseUsefulFunc(unit, placeholder);
		}
		cb('');
	}

	private async parseUsefulFunc(unit: UnitIns, change: Unit['change']) {
		if (!isFunction(change)) {
			return;
		}
		this.beforeAvailable().then(() => {
			const useful = this.__usefuls.get(unit)!;
			change(useful);
		});
	}

	private async parseSubmit(unit: UnitIns, submit: Unit['submit']) {
		if (!isFunction(submit)) {
			return;
		}
		this.__submitStack.add(async () => {
			const useful = this.__usefuls.get(unit)!;
			await submit(useful);
		});
	}

	private async parseComponents<T extends boolean>(
		unit: UnitIns<T>,
		useful: InsertUseful
	) {
		const isCustom = unit[CUSTOM_SYMBOL] as T;
		const result = Object.create(
			Object.freeze({
				[CUSTOM_SYMBOL]: isCustom,
			})
		);
		let resolve: PromiseResolve;
		if (isCustom) {
			const { component, componentProps = {} } = unit as UnitIns<true>;
			let _props = componentProps;
			if (isFunction(componentProps)) {
				const useProps = new ReactiveProps<typeof componentProps>(
					(_resolve) => (resolve = _resolve)
				);
				_props = shallowReactive({
					...((await componentProps(useful, useProps.copy())) || {}),
				});
				resolve!(_props);
			} else {
				_props = shallowReactive({ ...componentProps });
			}
			return Object.assign(result, {
				component,
				componentProps: _props,
			}) as UnitComponents<T>;
		} else {
			const { type, payload = {} } = unit as UnitIns<false>;
			let _payload = payload;
			if (isFunction(payload)) {
				const useProps = new ReactiveProps<typeof payload>(
					(_resolve) => (resolve = _resolve)
				);
				_payload = shallowReactive({
					...((await payload(useful, useProps.copy())) || {}),
				});
				resolve!(_payload);
			} else {
				_payload = shallowReactive({ ...payload });
			}
			return Object.assign(result, {
				type,
				payload: _payload,
			}) as UnitComponents<T>;
		}
	}
}
