import { debounce, isBoolean } from '@wang-yige/utils';

export * from './unit';
export * from './group';
export * from './collect';
export * from './parse';
export * from './utils/symbol';

export type UnitContract<T> = { (): T };

export function toNumber(v: any) {
	return Number(v) || 0;
}

export function toString(v: any) {
	return String(v) || '';
}

export function toBoolean(v: any) {
	if (isBoolean(v)) {
		return v;
	}
	if (v === 'true') {
		return true;
	}
	if (v === 'false') {
		return false;
	}
	return false;
}

export const cacheUnits = (() => {
	const weakMap = new WeakMap<any, { clear: () => any; result: any }>();
	const delayTime = 1000 * 60 * 1;
	return function <T>(cb: () => T): { value: T } {
		function get() {
			if (weakMap.has(cb)) {
				const value = weakMap.get(cb)!;
				value.clear();
				return value.result;
			}
			const fn = debounce(() => {
				weakMap.delete(cb);
			}, delayTime);
			const result = cb();
			weakMap.set(cb, { clear: fn, result });
			fn();
			return result;
		}
		return Object.defineProperty({} as { value: T }, 'value', {
			get() {
				return get();
			},
		});
	};
})();
