import { type Ref } from 'vue';
import type {
	ParseGroupSettings,
	ParseUnitSettings,
	UnitComponents,
} from './type';
import { createUnit, isUnit, type ClzUnit, type UnitIns } from '../unit';
import { createGroup, isGroup, type ClzGroup, type GroupIns } from '../group';
import { createCollect, isCollect, type ClzCollect } from '../collect';
import { __ParseReactive } from './reactive';
import { CreateUseful, __Parse } from './create';
import { DEFAULT_GROUP } from './constants';
import {
	isDef,
	isUndef,
	isFunction,
	isString,
	type Fn,
	type Awaitable,
} from '@wang-yige/utils';

class Parse extends __Parse {
	constructor(...args: ConstructorParameters<typeof __Parse>) {
		super(...args);
		this.useful = new CreateUseful(this);
	}

	private exception(msg: string) {
		if (!this.__available) {
			return new Error(
				`解析器初始化未完成，请使用 '${this.available.name}' 方法异步调用`
			);
		}
		return new Error(msg);
	}

	*enteries() {
		let index = 0;
		for (const [key, groupIns] of this.__groups.entries()) {
			yield [this.getGroupSettings(key), groupIns, index++] as const;
		}
	}

	*unitEntries(group: GroupIns) {
		if (!this.__units.has(group)) {
			throw this.exception('组数据不存在');
		}
		let index = 0;
		for (const [key, unitIns] of this.__units.get(group)!.entries()) {
			yield [this.getUnitSettings(key), unitIns, index++] as const;
		}
	}

	*allUnitEntries() {
		for (const [_, group] of this.enteries()) {
			for (const [$1, $2, $3] of this.unitEntries(group)) {
				yield [$1, $2, $3] as const;
			}
		}
	}

	getGroupSettings(prop: string = DEFAULT_GROUP) {
		if (this.cache.in.groups.has(prop)) {
			return this.cache.in.groups.get(prop)! as ParseGroupSettings;
		}
		const group = this.__groups.get(prop);
		if (group) {
			const result = this.__parse_group.get(group);
			if (result) {
				this.cache.in.groups.set(prop, result);
				return result;
			}
			throw this.exception(`组 '${prop}' 解析对象不存在`);
		}
		throw this.exception(`组 '${prop}' 不存在`);
	}

	getUnitsInGroup(prop: string = DEFAULT_GROUP) {
		if (this.cache.in.inGroups.has(prop)) {
			return this.cache.in.inGroups.get(prop)! as Map<string, UnitIns>;
		}
		const group = this.__groups.get(prop);
		if (group) {
			const result = this.__units.get(group);
			if (result) {
				this.cache.in.inGroups.set(prop, result);
				return result;
			}
			throw this.exception(`组 '${prop}' 单元集合不存在`);
		}
		throw this.exception(`组 '${prop}' 不存在`);
	}

	getUnitSettings(prop: string) {
		if (this.cache.in.units.has(prop)) {
			return this.cache.in.units.get(prop)! as ParseUnitSettings;
		}
		const unit = this.getUnit(prop);
		if (unit) {
			const parse = this.__parse_unit.get(unit)!;
			if (parse) {
				this.cache.in.units.set(prop, parse);
				return parse;
			}
			throw this.exception(`单元 '${prop}' 解析对象不存在`);
		}
		throw this.exception(`单元 '${prop}' 不存在`);
	}

	getComponent<T extends boolean>(prop: string): UnitComponents<T> {
		if (this.cache.in.component.has(prop)) {
			return this.cache.in.component.get(prop)! as UnitComponents<T>;
		}
		const unit = this.getUnit(prop);
		if (unit) {
			const component = this.__components.get(unit)!;
			if (component) {
				this.cache.in.component.set(prop, component);
				return component as UnitComponents<T>;
			}
			throw this.exception(`单元 '${prop}' 组件不存在`);
		}
		throw this.exception(`单元 '${prop}' 不存在`);
	}

	/** 对应单元触发更新 */
	trigger(prop: string) {
		this.__parseReactive.trigger(prop);
	}

	/** 获取绑定的响应式对象 */
	ractive(prop: string) {
		return this.getUnitSettings(prop).reactive;
	}

	/** 获取单元属性值对应的响应对象 */
	ref<T extends any = any>(prop: string) {
		return this.getUnitSettings(prop).value as Ref<T>;
	}

	/** 获取单元属性值对应的value */
	value<T extends any = any>(prop: string) {
		return this.ref<T>(prop).value;
	}

	/** 更新指定单元数据 */
	update(prop: string, value: any) {
		const theRef = this.ref(prop);
		theRef.value = value;
	}

	/** 清空指定单元数据 */
	clearup(prop: string) {
		this.update(prop, this.__parseReactive.getDefaultValue(prop));
	}

	/** 获取指定单元最终结果，需要进行解析 */
	resultValue(prop: string) {
		const value = this.value(prop);
		const parser = this.__parseReactive.getParser(prop);
		if (parser) {
			return parser(value);
		}
		return value;
	}

	/** 更新单元提示文本 */
	placeholder(prop: string, value: string) {
		const unit = this.getUnitSettings(prop);
		unit.reactive.placeholder = value;
	}

	/** 监听指定属性 */
	watch(
		prop: string,
		cb: (newValue: any, oldValue?: any) => any,
		immediate: boolean = false
	) {
		const func = async (newValue: any, oldValue: any) => {
			await cb(newValue, oldValue);
		};
		this.__parseReactive.watch(prop, func);
		if (immediate) {
			cb(this.value(prop));
		}
		return () => {
			this.__parseReactive.unwatch(prop, func);
		};
	}

	/** 不触发监听的情况下修改数据 */
	emit(prop: string, value: any) {
		this.__parseReactive.closeNextWatch(prop);
		this.update(prop, value);
	}

	/** 获取单元对应的可见性 */
	visible(prop: string) {
		return this.getUnitSettings(prop).reactive.visible;
	}

	watchVisible(
		prop: string,
		cb: (visible: boolean) => any,
		immediate: boolean = false
	) {
		const unit = this.getUnitSettings(prop);
		return this.__unifyWatch.watch(() => unit.reactive.visible, cb, {
			immediate,
		});
	}

	updateVisible(prop: string, state: boolean) {
		const reactive = this.getUnitSettings(prop).reactive;
		reactive.visible = state;
		this.trigger(prop);
	}

	show(prop: string) {
		return this.updateVisible(prop, true);
	}

	hide(prop: string) {
		return this.updateVisible(prop, false);
	}

	#filter: boolean = false;

	/** 获取合并对象是是否过滤undefined，null，NaN */
	get filter() {
		this.#filter = true;
		return this;
	}

	get unfilter() {
		this.#filter = false;
		return this;
	}

	/** 校验字符串分割 */
	#strsplit = /^[^\s\.]+(?:\.[^\s\.]+)+/;

	/** 解析所有单元数据合并成对象 */
	get result() {
		const _r = {} as Record<string, any>;
		for (const [unit] of this.allUnitEntries()) {
			if (unit.ignore !== false && !unit.reactive.visible) {
				continue;
			}
			const value = unit.value.value;
			if (this.#filter && (isUndef(value) || isNaN(value))) {
				continue;
			}
			const prop = unit.prop;
			const parser = this.__parseReactive.getParser(prop);
			if (parser) {
				_r[prop] = parser(value);
			} else {
				_r[prop] = value;
			}
			if (this.#strsplit.test(prop)) {
				// 嵌套属性校验
				const props = prop.split('.');
				if (props.length <= 1) {
					continue;
				}
				let _v = _r;
				for (let i = 0; i < props.length - 1; i++) {
					const k = props[i];
					if (isUndef(_v[k])) {
						_v[k] = {};
					}
					_v = _v[k];
				}
				const data = _r[prop];
				if (isDef(data)) {
					_v[props[props.length - 1]] = data;
				}
				delete _r[prop];
			}
		}
		this.#filter = false;
		return _r;
	}

	/** 数据提交前调用 */
	async submit(cb?: (val: Record<string, any>) => any) {
		for (const [func] of this.__submitStack.entries()) {
			await func();
		}
		const result = this.result;
		cb?.(result);
		return result;
	}

	/** 数据重置 */
	reset() {
		for (const [unit] of this.allUnitEntries()) {
			const prop = unit.prop;
			const defaultValue = this.__parseReactive.getDefaultValue(prop);
			this.update(prop, defaultValue);
		}
	}

	get model() {
		const result = [...this.__unit_props.entries()].reduce((prev, curr) => {
			prev[curr[0]] = this.value(curr[0]);
			return prev;
		}, {} as Record<string, any>);
		return new Proxy(result, {
			get: (_target, prop) => {
				if (isString(prop) && this.__unit_props.has(prop)) {
					return this.value(prop);
				}
				return;
			},
			set: (_target, prop, value) => {
				if (isString(prop) && this.__unit_props.has(prop)) {
					this.update(prop, value);
					return true;
				}
				return true;
			},
		});
	}

	//  ------  组  --------

	/** 获取组对应的可见性 */
	groupVisible(prop: string) {
		return this.getGroupSettings(prop).reactive.visible;
	}

	/** 更新组对应的可见性 */
	updateGroupVisible(prop: string, state: boolean) {
		const reactive = this.getGroupSettings(prop).reactive;
		reactive.visible = state;
		const units = this.getUnitsInGroup(prop);
		for (const unit of units.keys()) {
			this.trigger(unit);
		}
	}

	groupShow(prop: string) {
		return this.updateGroupVisible(prop, true);
	}

	groupHide(prop: string) {
		return this.updateGroupVisible(prop, false);
	}

	get loading() {
		return this.__status.loading;
	}

	onLoading() {
		this.__status.onLoading();
	}

	offLoading() {
		this.__status.offLoading();
	}

	get pending() {
		return this.__status.pending;
	}

	onPending() {
		this.__status.onPending();
	}

	offPending() {
		this.__status.offPending();
	}

	/** 是否初始化完成 */
	get initial() {
		return this.__status.initial;
	}

	clear() {
		this.clearCreate();
	}
}

export type ParseCLz = InstanceType<typeof Parse>;

export function parse(data: ClzUnit | ClzGroup | ClzCollect) {
	if (isUnit(data)) {
		data = createGroup({
			prop: DEFAULT_GROUP,
		}).add(data);
	}
	if (isGroup(data)) {
		data = createCollect(data);
	}
	if (!isCollect(data)) {
		throw new Error(`
            [Form] 参数解析异常，组件 'data' 属性只接收 'ClzUnit' 'ClzGroup' 'ClzCollect' 类型。\n
            必须使用指定函数 '${createUnit.name}' '${createGroup.name}' 或 '${createCollect.name}' 创建对象
        `);
	}
	return new Parse(data);
}

/**
 * 通过 `prop` 作为索引将数据插入配置的 `defaultValue` 位置
 */
export async function insert<T extends ClzUnit | ClzGroup | ClzCollect>(
	data: T,
	values:
		| Record<string, any>
		| Promise<Record<string, any>>
		| Fn<[], Awaitable<Record<string, any>>>
): Promise<T> {
	if (!isFunction(values)) {
		const _v = values;
		values = async () => _v;
	}
	const _data = data.copy() as T;
	try {
		const result = await (
			values as Fn<[], Awaitable<Record<string, any>>>
		)();
		for (const unit of recursive(_data)) {
			const prop = unit.prop;
			if (prop in result) {
				unit.bind.defaultValue = result[prop];
			}
		}
	} catch (error) {
		/** */
	}
	return _data;
}

function* recursive(data: ClzUnit | ClzGroup | ClzCollect) {
	if (isUnit(data)) {
		for (const unit of data.value) {
			yield unit;
		}
		return;
	}
	if (isGroup(data)) {
		for (const [_, unit] of data.entries()) {
			yield unit;
		}
		return;
	}
	if (isCollect(data)) {
		for (const [_, _$_, group] of data.entries()) {
			for (const [_$, unit] of group.entries()) {
				yield unit;
			}
		}
	}
}
