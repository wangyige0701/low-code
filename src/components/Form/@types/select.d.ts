import type { Component } from 'vue';
import type { ElSelect } from 'element-plus';

export type SelectOptions = Array<
	{
		label: string;
		value: string | number;
		tip?: string;
	} & Record<string, any>
>;

export interface SelectPayload {
	/**
	 * - 下拉选项
	 * - 支持异步获取
	 */
	options?: SelectOptions | Promise<SelectOptions> | AnyFunction<() => SelectOptions>;
	/**
	 * 自定义模板
	 */
	template?: Component;
	/**
	 * 分组时的字段
	 */
	group?: string;
	/**
	 * 是否可筛选
	 */
	filterable?: boolean;
	/**
	 * 	自定义筛选方法
	 */
	filterMethod?: AnyFunction<(e: string, options: SelectOptions) => void>;
}

export type SelectKey = 'select';
