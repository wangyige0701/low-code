import { customRef, unref } from 'vue';
import {
	isFunction,
	isString,
	isDef,
	isUndef,
	type Fn,
} from '@wang-yige/utils';
import type { UnitIns } from '../unit';

type SelfCb = (newValue: any, oldValue?: any) => any;
type GlobalCb = (newValue: any, oldValue?: any, prop?: string) => any;

/**
 * 包含响应和触发方法，传递给需要手动触发的函数
 */
export class __ParseReactive {
	private __default_value = new Map<string, any>();
	private __parsers = new Map<string, (val: any) => any>();
	private __triggers = new Map<string, Fn>();
	/** 仅在自身改变时触发 */
	private __self = new Map<string, Set<SelfCb>>();
	/** 全局改变时触发 */
	private __global = new Set<GlobalCb>();
	private __watch_time = new Map<string, boolean>();

	clear() {
		this.__parsers.clear();
		this.__triggers.clear();
		this.__self.clear();
		this.__global.clear();
	}

	getDefaultValue(prop: string) {
		return this.__default_value.get(prop);
	}

	getParser(prop: string) {
		return this.__parsers.get(prop);
	}

	trigger(prop: string) {
		const trigger = this.__triggers.get(prop);
		if (trigger) {
			return trigger();
		}
		throw new Error(`单元 '${prop}' 不存在`);
	}

	async reactive<T>(prop: string, unitBind: UnitIns['bind']) {
		const { value, formatter, parser } = unitBind;
		if (parser) {
			this.__parsers.set(prop, parser);
		}
		let __value = unref(value);
		if (isUndef(value)) {
			let defaultValue = unitBind.defaultValue;
			if (isFunction(defaultValue)) {
				defaultValue = await defaultValue();
			}
			if (isDef(defaultValue)) {
				__value = defaultValue;
				this.__default_value.set(prop, defaultValue);
			}
		}
		if (formatter) {
			__value = formatter(__value);
		}
		const result = customRef<T>((track, trigger) => {
			this.__triggers.set(prop, trigger);
			return {
				get: () => {
					track();
					return __value;
				},
				set: (value) => {
					const oldValue = __value;
					if (formatter) {
						// 格式化在响应体中，解析在提取数据中
						__value = formatter(value);
					} else {
						__value = value;
					}
					const unwatch = this.__watch_time.has(prop);
					if (unwatch) {
						this.__watch_time.delete(prop);
					} else {
						this.change(prop, __value, oldValue);
					}
					trigger();
				},
			};
		});
		return result;
	}

	watch(fn: GlobalCb): void;
	watch(prop: string, fn: SelfCb): void;
	watch(prop: string | SelfCb | GlobalCb, fn?: SelfCb | GlobalCb) {
		if (isString(prop) && isFunction(fn)) {
			if (!this.__self.has(prop)) {
				this.__self.set(prop, new Set());
			}
			const set = this.__self.get(prop)!;
			set.add(fn as SelfCb);
		} else if (isFunction(prop)) {
			this.__global.add(prop as GlobalCb);
		}
	}

	unwatch(fn: SelfCb | GlobalCb): void;
	unwatch(prop: string, fn: SelfCb | GlobalCb): void;
	unwatch(prop: string | SelfCb | GlobalCb, fn?: SelfCb | GlobalCb) {
		if (isString(prop) && isFunction(fn)) {
			if (this.__self.has(prop)) {
				const set = this.__self.get(prop)!;
				set.delete(fn as SelfCb);
			}
		} else if (isFunction(prop)) {
			this.__global.delete(prop as GlobalCb);
		}
	}

	closeNextWatch(prop: string) {
		this.__watch_time.set(prop, true);
	}

	/** 触发监听时调用 */
	private change(key: string, newValue: any, oldValue: any) {
		const selfSet = this.__self.get(key);
		if (selfSet) {
			selfSet.forEach((fn) => fn(newValue, oldValue));
		}
		this.__global.forEach((fn) => fn(newValue, oldValue, key));
	}
}
