import type { Component } from 'vue';
import type { Unit } from '../@types/unit';
import type { Types, Payloads } from '../@types';
import type { UNIT_SYMBOL, CUSTOM_SYMBOL } from '../utils/symbol';

type NonNullComponents<T extends boolean> = T extends false
	? {
			type: Types;
			payload: Unit<string, any, Types, undefined>['payload'];
		}
	: {
			component: Component;
			componentProps: Unit<string, any, undefined, Component>['componentProps'];
		};

export type UnitIns<T extends boolean = boolean> = {
	[K in typeof UNIT_SYMBOL]: true;
} & {
	[K in typeof CUSTOM_SYMBOL]: T;
} & {
	prop: string;
	bind: Omit<Unit, 'type' | 'payload' | 'component' | 'componentProps'>;
} & NonNullComponents<T>;
