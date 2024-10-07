import type { Unit } from './unit';

export interface Group<Prop extends string = string> {
	/**
	 * - 组的索引键值，可以和单元的键值重复
	 */
	prop: Prop;
	/**
	 * - 组标签文本
	 */
	label?: string;
	/**
	 * - 是否显示组标签，默认为true
	 */
	showLabel?: boolean;
	/**
	 * - 是否显示组，默认true
	 */
	visible?: boolean;
	/**
	 * - 是否可清除，默认true
	 */
	clearable?: boolean;
	/**
	 * - 是否禁用，默认false
	 */
	disabled?: boolean;
	/**
	 * - 是否只读，默认false
	 */
	readonly?: boolean;
}
