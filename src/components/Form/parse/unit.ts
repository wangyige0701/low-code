import type { UnitUseful, UnitUsefulKey, UnitReactive } from '../@types/useful';
import type { ParseCLz } from '.';
import type { Unit } from '../@types/unit';
import {
	isBoolean,
	isFunction,
	isString,
	isUndef,
	type Fn,
} from '@wang-yige/utils';

const keys: UnitUsefulKey[] = [
	'clearable',
	'disabled',
	'label',
	'readonly',
	'required',
];

export class UnitUsefulClz<T> implements UnitUseful<T>, UnitReactive<T> {
	#prop: string;
	#parse: ParseCLz;

	constructor(prop: string, parse: ParseCLz) {
		this.#prop = prop;
		this.#parse = parse;
	}

	private params(props: string[], cb: (prop: string) => any) {
		if (props.length === 0) {
			props.push(this.#prop);
		}
		for (const prop of props) {
			cb(prop);
		}
	}

	show(...props: string[]) {
		this.params(props, (prop) => {
			this.#parse.show(prop);
		});
		return this;
	}

	hide(...props: string[]) {
		this.params(props, (prop) => {
			this.#parse.hide(prop);
		});
		return this;
	}

	setVisible(prop: string, visible: boolean) {
		this.#parse.updateVisible(prop, visible);
		return this;
	}

	visible(prop?: string) {
		return this.#parse.visible(prop ?? this.#prop);
	}

	visibleChange(
		cb: (visible: boolean) => void | Promise<void>,
		immediate?: boolean | undefined
	): Fn;
	visibleChange(
		prop: string,
		cb: (visible: boolean) => void | Promise<void>,
		immediate?: boolean | undefined
	): Fn;
	visibleChange(
		prop: string | ((visible: boolean) => void | Promise<void>),
		cb?: ((visible: boolean) => void | Promise<void>) | boolean,
		immediate?: boolean
	): Fn {
		if (isFunction(prop)) {
			immediate = isBoolean(cb) ? cb : false;
			cb = prop;
			prop = this.#prop;
		}
		if (isString(prop) && !isFunction(cb)) {
			throw new Error('未传入回调函数');
		}
		return this.#parse.watchVisible(
			prop as string,
			cb as (v: boolean) => any,
			immediate
		);
	}

	clear(...props: string[]) {
		this.params(props, (prop) => {
			this.#parse.clearup(prop);
		});
		return this;
	}

	placeholder(placeholder: string): UnitUsefulClz<T>;
	placeholder(prop: string, placeholder: string): UnitUsefulClz<T>;
	placeholder(prop: string, placeholder?: string) {
		if (isUndef(placeholder)) {
			placeholder = prop;
			prop = this.#prop;
		}
		this.#parse.placeholder(prop, placeholder);
		return this;
	}

	get value() {
		return this.#parse.value(this.#prop);
	}

	get(): T;
	get(prop: string): T;
	get(prop?: unknown): T {
		if (isUndef(prop)) {
			prop = this.#prop;
		}
		return this.#parse.value(prop as string);
	}

	set(value: T): UnitUsefulClz<T>;
	set(prop: string, value: T): UnitUsefulClz<T>;
	set(prop: unknown, value?: unknown): any {
		if (isUndef(value)) {
			value = prop;
			prop = this.#prop;
		}
		this.#parse.update(prop as string, value as T);
		return this;
	}

	setReactive<T extends UnitUsefulKey>(
		key: T,
		value: Unit[T] & {}
	): UnitUsefulClz<T>;
	setReactive<T extends UnitUsefulKey>(
		key: T,
		value: Unit[T] & {},
		prop: string
	): UnitUsefulClz<T>;
	setReactive<T extends UnitUsefulKey>(
		key: T,
		value: Unit[T] & {},
		prop?: string
	) {
		if (!keys.includes(key)) {
			throw new Error(`[key] ${key} 不是合法响应属性`);
		}
		if (isUndef(prop)) {
			prop = this.#prop;
		}
		const reactive = this.#parse.getUnitSettings(prop).reactive;
		if (key === 'label') {
			(value as string) = value.toString();
		}
		reactive[key] = value as any;
		return this;
	}

	getReactive<T extends UnitUsefulKey>(key: T): Unit[T] & {};
	getReactive<T extends UnitUsefulKey>(key: T, prop: string): Unit[T] & {};
	getReactive<T extends UnitUsefulKey>(key: T, prop?: string) {
		if (!keys.includes(key)) {
			throw new Error(`[unit] ${key} 不是合法响应属性`);
		}
		if (isUndef(prop)) {
			prop = this.#prop;
		}
		const reactive = this.#parse.getUnitSettings(prop).reactive;
		return reactive[key];
	}

	watch(cb: (newValue: T, oldValue?: T) => void, immediate?: boolean): Fn;
	watch(
		prop: string,
		cb: (newValue: T, oldValue?: T) => void,
		immediate?: boolean
	): Fn;
	watch(
		prop: string | ((newValue: T, oldValue?: T) => void),
		cb?: ((newValue: T, oldValue?: T) => void) | boolean,
		immediate?: boolean
	) {
		if (isFunction(prop)) {
			immediate = isBoolean(cb) ? cb : false;
			cb = prop;
			prop = this.#prop;
		}
		if (isString(prop) && !isFunction(cb)) {
			throw new Error('未传入回调函数');
		}
		return this.#parse.watch(
			prop,
			cb as (newValue: T, oldValue?: T) => void,
			immediate
		);
	}

	emit(val: T): void;
	emit(prop: string, val: T): void;
	emit(prop: string | T, val?: T) {
		if (isUndef(val)) {
			val = prop as T;
			prop = this.#prop;
		}
		this.#parse.emit(prop as string, val);
	}
}
