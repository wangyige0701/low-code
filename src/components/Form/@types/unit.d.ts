import type { ref, Component } from 'vue';
import type { FormItemRule } from 'element-plus';
import type { Types, Payloads } from './type';
import type { GetProps, ParseValue, DefaultValue, Placeholder, Change, Submit, Useful } from './useful';
import type { ReactiveProps } from '../utils/reactiveProps';

export type { FormItemRule };

export interface Unit<
	Prop extends string = string,
	Value extends any = any,
	Type extends Types | undefined = undefined,
	Comp extends Component | undefined = undefined,
> {
	/** 类型收缩 */
	extract?: {
		(...arg: any[]): Value;
	};
	/**
	 * - 表单对象键名，必填项
	 * - 如果不需要出现在最终数据集中，则设置`ignore`为`true`
	 */
	prop: Prop;
	/**
	 * - 标签文本，未传则默认为`&nbsp;`
	 */
	label?: string;
	/**
	 * - 表单绑定数据
	 * - 如果传ref对象会进行转发，通过`watch`和`emit`导出方法分别监听和修改
	 */
	value?: Value;
	/**
	 * - 提示内容
	 * - 可传入函数或者字符串
	 * - 接收一个参数时，传入当前数据的newValue
	 * - 接收两个参数时，传入当前数据的 `newValue` 和 `oldValue`
	 * - 接收三个参数时，传入改变数据的 `key` 、 `oldValue` 以及 `newValue`
	 * - 函数可以异步执行
	 */
	placeholder?: Placeholder<Value>;
	/**
	 * - 默认值
	 */
	defaultValue?: DefaultValue<Value>;
	/**
	 * - 单元类型
	 * - 传入函数时，入参为类型的枚举
	 */
	type?: Type;
	/**
	 * - 单元载荷
	 */
	payload?:
		| Payloads[Type]
		| AnyFunction<
				<Result extends Payloads[Type]>(
					useful: Useful<Value>,
					prop: ReturnType<ReactiveProps<Result>['copy']>,
				) => Result
		  >;
	/**
	 * - 是否忽略当前单元数据在数据集中
	 * - 如果传入true，则最终结果一定不会有此数据
	 * - 如果传入false，则无论显隐，最终结果一定有此数据
	 */
	ignore?: boolean;
	/**
	 * - 是否必填，默认`false`
	 */
	required?: boolean;
	/**
	 * - 是否禁用，默认`false`
	 * - 未传值时，优先继承组
	 */
	disabled?: boolean;
	/**
	 * - 是否只读，默认`false`
	 * - 未传值时，优先继承组
	 */
	readonly?: boolean;
	/**
	 * - 是否显示，默认为`true`
	 * - 未传值时，优先继承组
	 */
	visible?: boolean;
	/**
	 * - 是否可清除
	 * - 未传值时优先继承组，其次为`true`
	 */
	clearable?: boolean;
	/**
	 * - 是否聚焦，有多个单元设置时只聚焦所有组中的第一个
	 */
	focus?: boolean;
	/**
	 * - 表单验证规则
	 */
	validate?: Arrayable<FormItemRule>;
	/**
	 * - 自定义输入格式
	 * - 加载时触发一次
	 * - 数据更新时触发
	 */
	formatter?: (val: any) => Value;
	/**
	 * - 自定义解析格式，修改数据集中绑定的值
	 */
	parser?: (val: Value) => any;
	/**
	 * - 表单提交之前触发
	 * - 第一个参数为当前单元数据
	 * - 第二个参数接收对象可以操作组集合所有数据
	 * - 抛出错误会终止提交，并通过组件的error事件抛出
	 */
	submit?: Submit;
	/**
	 * - 数据改变时触发
	 * - 接收一个参数时，传入当前数据的newValue
	 * - 接收两个参数时，传入当前数据的 `newValue` 和 `oldValue`
	 * - 接收三个参数时，传入改变数据的 `key` 、 `oldValue` 以及 `newValue`
	 * - 函数可以异步执行
	 */
	change?: Change<Value>;
	/**
	 * - 自定义组件
	 * - 传入type且满足`Types`时，会忽略`component`
	 */
	component?: Comp;
	/**
	 * - 自定义组件属性
	 * - 为函数时，会传入一个包含`watch`和`emit`的对象
	 */
	componentProps?:
		| GetProps<Comp>
		| AnyFunction<
				<Result extends GetProps<Comp>>(
					useful: Useful<Value>,
					prop: ReturnType<ReactiveProps<Result>['copy']>,
				) => Result
		  >;
}
