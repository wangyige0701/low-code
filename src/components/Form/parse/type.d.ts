import type { Ref, ShallowReactive, Component } from 'vue';
import type { GroupUseful } from '../@types/useful';
import type { Unit } from '../@types/unit';
import type { CUSTOM_SYMBOL } from '../utils/symbol';
import type { Types, Payloads } from '../@types';

interface CustomComponent {
	[CUSTOM_SYMBOL]: true;
	component: Component;
	componentProps: ShallowReactive<any>;
}

interface BuildinComponent {
	[CUSTOM_SYMBOL]: false;
	type: Types;
	payload: ShallowReactive<Payloads[Types]>;
}

type UnitItem<T extends boolean> = T extends true ? CustomComponent : BuildinComponent;

export interface ParseUnitSettings<T extends boolean = false> {
	prop: string;
	value: Ref<any>;
	ignore?: boolean;
	validate?: Unit['validate'];
	focus: boolean;
	reactive: ShallowReactive<{
		label: string;
		placeholder?: string;
		required?: boolean;
		disabled: boolean;
		readonly: boolean;
		visible: boolean;
		clearable: boolean;
	}>;
}

export type UnitComponents<T extends boolean> = UnitItem<T>;

export interface ParseGroupSettings {
	prop: string;
	reactive: ShallowReactive<{
		label?: string;
		showLabel: boolean;
		visible: boolean;
		clearable: boolean;
		disabled: boolean;
		readonly: boolean;
	}>;
}
