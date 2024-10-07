import type { Component } from 'vue';
import type { ElInput } from 'element-plus';

type InputType = {
	type?: 'text' | 'password' | 'number' | 'email' | 'tel' | 'url';
	/**
	 * 非textarea时，输入框后置内容
	 */
	append?: string | Component;
	/**
	 * 非textarea时，输入框前置内容
	 */
	prepend?: string | Component;
};

type InputTextarea = {
	type: 'textarea';
	autosize?: InstanceType<typeof ElInput>['autosize'];
};

type Merge<T> = {
	[K in keyof T]: T[K];
};

export type InputPayload = Merge<InputType> | Merge<InputTextarea>;

export type InputKey = 'input';
