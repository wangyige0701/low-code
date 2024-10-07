import { type Component, unref } from 'vue';
import { isArray, isObject, VOID_OBJECT } from '@wang-yige/utils';
import { UNIT_SYMBOL, CUSTOM_SYMBOL } from '../utils/symbol';
import { COMPONENT_TYPES } from '../components';
import type { Unit } from '../@types/unit';
import type { Types } from '../@types';
import type { UnitIns } from './type';

const __i = Object.freeze({
	[UNIT_SYMBOL]: true,
});

const ignore: (keyof Unit)[] = [
	'type',
	'component',
	'componentProps',
	'payload',
];

function __createUnit<
	Prop extends string,
	Val extends any,
	Type extends Types | undefined,
	Comp extends Component | undefined,
	T extends Unit<Prop, Val, Type, Comp>
>(option: T): UnitIns {
	const result = Object.create(__i);
	const keys = Object.keys(option) as (keyof Unit)[];
	if (keys.includes('type')) {
		const __type = option.type;
		if (__type && COMPONENT_TYPES.includes(__type)) {
			result.type = __type;
			result.payload = option.payload ?? VOID_OBJECT;
			result[CUSTOM_SYMBOL] = false;
		}
	}
	if (!result.type) {
		if (!keys.includes('component')) {
			const __str = option.type
				? `非法'type'参数: ${option.type}`
				: "未传入'type'参数";
			throw new Error(`${__str}；\n必须传入'component'参数`);
		}
		result.component = option.component;
		result.componentProps = option.componentProps ?? VOID_OBJECT;
		result[CUSTOM_SYMBOL] = true;
	}
	result.prop = option.prop;
	const __bind = {} as Record<string, any>;
	for (const key of keys) {
		if (ignore.includes(key)) {
			continue;
		}
		__bind[key] = unref(option[key]);
	}
	result.bind = __bind;
	return Object.freeze(result);
}

class CreateUnit {
	public value: UnitIns[] = [];

	constructor(option: Unit | CreateUnit | CreateUnit[]) {
		if (option instanceof CreateUnit) {
			option = [option];
		}
		if (isArray(option)) {
			for (const unit of option) {
				if (!isUnit(unit)) {
					throw new Error(`[unit] 传入的参数必须是 CreateUnit 实例`);
				}
				this.value.push(
					...unit.value.map((item) => {
						const result = {
							...item,
							bind: { ...item.bind },
						} as any;
						if (isCustomComponent(item)) {
							result.componentProps = { ...item.componentProps };
						} else {
							result.payload = {
								...(item as UnitIns<false>).payload,
							};
						}
						return result;
					})
				);
			}
			return this;
		}
		this.value.push(__createUnit(option as any));
	}

	/**
	 * - 添加一个单元
	 * - 如果传入的是`CreateUnit`实例，则将实例中的数据添加到当前实例中
	 */
	add<
		Prop extends string,
		Val extends any,
		Type extends Types | undefined,
		Comp extends Component | undefined
	>(option: Unit<Prop, Val, Type, Comp> | CreateUnit) {
		const copy = this.copy();
		copy.value.push(...new CreateUnit(option as Unit | CreateUnit).value);
		return copy;
	}

	remove(...props: string[]) {
		const copy = this.copy();
		for (const prop of props) {
			const index = copy.value.findIndex((item) => item.prop === prop);
			if (index < 0) {
				throw new Error(`[unit] 未找到prop为 '${prop}' 的单元`);
			}
			copy.value.splice(index, 1);
		}
		return copy;
	}

	merge(...units: CreateUnit[]) {
		return new CreateUnit(units);
	}

	copy() {
		return new CreateUnit(this);
	}

	change() {
		// TODO 调整属性
	}
}

export type ClzUnit = InstanceType<typeof CreateUnit>;

export function createUnit<
	Prop extends string,
	Val extends any,
	Type extends Types | undefined,
	Comp extends Component | undefined
>(option: Unit<Prop, Val, Type, Comp>) {
	return new CreateUnit(option as any);
}

export function mergeUnits(...units: ClzUnit[]) {
	if (units.length === 0) {
		throw new Error(`[unit] 至少需要传入一个单元实例`);
	}
	return new CreateUnit(units);
}

export function isUnitSymbol(value: any): value is UnitIns {
	return isObject(value) && Object.getPrototypeOf(value)[UNIT_SYMBOL];
}

export function isCustomComponent(value: any): value is UnitIns<true> {
	return isObject(value) && Object.getPrototypeOf(value)[CUSTOM_SYMBOL];
}

export function isUnit(val: any): val is CreateUnit {
	return val instanceof CreateUnit;
}
