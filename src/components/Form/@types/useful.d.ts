import type { ref, Component } from 'vue';
import type { Unit } from './unit';
import type { Group } from './group';

type PickProps<T> = T extends Component<infer P> ? P : never;

export type GetProps<C> = PickProps<C>['$props'];

export type ParseValue<T> = T extends ref<infer R> ? R : T;

export type DefaultValue<T> = T | AnyFunction<() => T>;

export type Placeholder<T, Return = string> = string | AnyFunction<(useful: Useful<T>) => Return>;

export type Change<T> = Exclude<Placeholder<T, void>, string>;

export type Submit = AnyFunction<(useful: Useful<T>) => void>;

export type Useful<T> = {
	$unit: UnitReactive<T> & UnitUseful<T>;
	$group: GroupUseful;
	/** 全局配置解析完成异步函数，组件配置中不可使用await阻塞，否则会造成解析异常 */
	available: () => Promise<void>;
	/** 除组件以外配置解析完成 */
	beforeAvailable: () => Promise<void>;
};

export interface UnitReactive<T = any> {
	/** - 当前数据改变触发 */
	watch(cb: (newValue: T, oldValue?: T) => void | Promise<void>, immediate?: boolean): VoidFunc;
	/** - 指定数据改变触发 */
	watch(prop: string, cb: (newValue: T, oldValue?: T) => void | Promise<void>, immediate?: boolean): VoidFunc;
	/** - 只传入value，改变当前数据，不会触发 `watch` */
	emit(val: T): void;
	/** - 第一个参数传入属性名，改变指定数据 */
	emit(prop: string, val: T): void;
}

type UnitUsefulKey = keyof Pick<Unit, 'label' | 'required' | 'disabled' | 'readonly' | 'clearable'>;

type GroupUsefulKey = keyof Pick<Group, 'label' | 'clearable' | 'disabled' | 'readonly' | 'showLabel'>;

export interface UnitUseful<T = any> {
	/** 隐藏当前单元 */
	hide(): UnitUseful<T>;
	/** 隐藏指定单元 */
	hide(...prop: string[]): UnitUseful<T>;
	/** 显示当前单元 */
	show(): UnitUseful<T>;
	/** 显示指定单元 */
	show(...prop: string[]): UnitUseful<T>;
	/** 当前单元可见性 */
	visible(): boolean;
	/** 指定单元可见性 */
	visible(prop: string): boolean;
	/** 设置指定单元可见性 */
	setVisible(prop: string, visible: boolean): UnitUseful<T>;
	/** 追踪当前单元可见性改变 */
	visibleChange(cb: (visible: boolean) => void | Promise<void>, immediate?: boolean): VoidFunc;
	/** 追踪指定单元可见性改变 */
	visibleChange(prop: string, cb: (visible: boolean) => void | Promise<void>, immediate?: boolean): VoidFunc;
	/** 清空当前单元 */
	clear(): UnitUseful<T>;
	/** 清空指定单元 */
	clear(...prop: string[]): UnitUseful<T>;
	/** 设置当前单元占位文本 */
	placeholder(placeholder: string): UnitUseful<T>;
	/** 设置指定单元占位文本 */
	placeholder(prop: string, placeholder: string): UnitUseful<T>;
	get value(): T;
	get(): T;
	get(prop: string): T;
	set(value: T): UnitUseful<T>;
	set(prop: string, value: T): UnitUseful<T>;
	/** 修改当前单元数据 */
	setReactive<T extends UnitUsefulKey>(key: T, value: Unit[T] & {}): UnitUseful<T>;
	/** 修改指定单元数据 */
	setReactive<T extends UnitUsefulKey>(key: T, value: Unit[T] & {}, prop: string): UnitUseful<T>;
	/** 获取当前单元数据 */
	getReactive<T extends UnitUsefulKey>(key: T): Unit[T] & {};
	/** 获取指定单元数据 */
	getReactive<T extends UnitUsefulKey>(key: T, prop: string): Unit[T] & {};
}

export interface GroupUseful {
	hide(prop: string): GroupUseful;
	show(prop: string): GroupUseful;
	visible(prop: string): boolean;
	setReactive<T extends GroupUsefulKey>(key: T, value: Group[T] & {}, prop: string): GroupUseful;
	getReactive<T extends GroupUsefulKey>(key: T, prop: string): Group[T] & {};
}
