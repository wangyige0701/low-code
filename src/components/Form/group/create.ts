import { type Component } from 'vue';
import { isObject } from '@wang-yige/utils';
import { GROUP_SYMBOL } from '../utils/symbol';
import { createUnit, isUnit, mergeUnits, type ClzUnit } from '../unit';
import type { GroupIns } from './type';
import type { Group } from '../@types/group';
import type { Types } from '../@types';
import type { Unit } from '../@types/unit';

const __i = Object.freeze({
	[GROUP_SYMBOL]: true,
});

function __createGroup<Prop extends string>(option: Group<Prop>): GroupIns {
	const result = Object.create(__i);
	result.prop = option.prop;
	result.bind = { ...option };
	return Object.freeze(result);
}

class CreateGroup {
	public value: GroupIns;
	public __children: ClzUnit | undefined;

	constructor(option: Group | CreateGroup) {
		if (option instanceof CreateGroup) {
			// 拷贝
			this.value = { ...option.value, bind: { ...option.value?.bind } };
			this.__children = option.__children?.copy?.();
			return this;
		}
		this.value = __createGroup(option);
	}

	get children() {
		return this.__children?.value ?? [];
	}

	/** 添加子单元 */
	add<
		Prop extends string,
		Val extends any,
		Type extends Types | undefined,
		Comp extends Component | undefined
	>(option: Unit<Prop, Val, Type, Comp> | ClzUnit) {
		const copy = this.copy();
		if (!copy.__children) {
			if (isUnit(option)) {
				copy.__children = mergeUnits(option);
			} else {
				copy.__children = createUnit(option);
			}
		} else {
			copy.__children = copy.__children.add(option);
		}
		return copy;
	}

	/** 移除子单元 */
	remove(...props: string[]) {
		const copy = this.copy();
		if (!copy.__children) {
			return copy;
		}
		copy.__children.remove(...props);
		return copy;
	}

	/** 合并子单元 */
	merge(...units: ClzUnit[]) {
		const copy = this.copy();
		copy.__children = mergeUnits(units[0]);
		return this;
	}

	copy() {
		return new CreateGroup(this);
	}

	*entries() {
		for (const child of this.children) {
			if (!child.prop) {
				if (import.meta.env.DEV) {
					throw new Error('[unit] 单元属性名不存在');
				}
				continue;
			}
			yield [child.prop, child] as const;
		}
	}
}

export type ClzGroup = InstanceType<typeof CreateGroup>;

export function createGroup<Prop extends string>(option: Group<Prop>) {
	return new CreateGroup(option);
}

export function isGroupSymbol(value: any): value is GroupIns {
	return isObject(value) && Object.getPrototypeOf(value)[GROUP_SYMBOL];
}

export function isGroup(value: any): value is CreateGroup {
	return value instanceof CreateGroup;
}
