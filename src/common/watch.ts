import type {
	WatchStopHandle,
	WatchSource,
	WatchOptions,
	WatchCallback,
	Ref,
	UnwrapNestedRefs,
	ShallowRef,
	ShallowReactive,
	ComputedRef,
} from 'vue';
import { watch, watchEffect, isRef, isReactive } from 'vue';
import { isGeneralObject, VOID_FUNCTION } from '@wang-yige/utils';

const NONE_DEEP_AND_IMMEDIATE = Object.freeze({
	immediate: true,
	deep: false,
});

type MapSources<T, Immediate> = {
	[K in keyof T]: T[K] extends WatchSource<infer V>
		? Immediate extends true
			? V | undefined
			: V
		: T[K] extends object
		? Immediate extends true
			? T[K] | undefined
			: T[K]
		: never;
};

type MultiWatchSources = (WatchSource<unknown> | object)[];

type CanWatch<T> =
	| Ref<T>
	| UnwrapNestedRefs<T>
	| ShallowRef<T>
	| ShallowReactive<T>
	| ComputedRef<T>;

type WatchTrackImmediate<
	Immediate extends Readonly<boolean>,
	T extends object,
	K extends keyof T
> = Immediate extends true ? T[K] | undefined : T[K];

/** 判断是否可以监听 */
function canWatch<T>(value: any): value is CanWatch<T> {
	return isRef(value) || isReactive(value);
}

/** 统一处理`watch`和`watchEffect`的取消监听 */
export class UnifyWatch {
	readonly cache: WatchStopHandle[] = [];

	constructor() {}

	watch<
		T extends MultiWatchSources,
		Immediate extends Readonly<boolean> = false
	>(
		sources: [...T],
		cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
		options?: WatchOptions<Immediate>
	): WatchStopHandle;
	watch<
		T extends Readonly<MultiWatchSources>,
		Immediate extends Readonly<boolean> = false
	>(
		source: T,
		cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
		options?: WatchOptions<Immediate>
	): WatchStopHandle;
	watch<T, Immediate extends Readonly<boolean> = false>(
		source: WatchSource<T>,
		cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
		options?: WatchOptions<Immediate>
	): WatchStopHandle;
	watch<T extends object, Immediate extends Readonly<boolean> = false>(
		source: T,
		cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
		options?: WatchOptions<Immediate>
	): WatchStopHandle;
	watch<T extends object>(
		source: T,
		cb: WatchCallback,
		options?: WatchOptions
	) {
		const stopWatch = watch(source, cb, options);
		this.cache.push(stopWatch);
		return stopWatch;
	}

	watchEffect(
		...params: Parameters<typeof watchEffect>
	): ReturnType<typeof watchEffect> {
		const stopWatch = watchEffect(...params);
		this.cache.push(stopWatch);
		return stopWatch;
	}

	/** 跟踪监听对象的属性，如果属性值也是一个可监听对象，则会在对应属性值被替换后继续监听 */
	watchTrack<
		T extends object,
		K extends keyof T & string,
		Immediate extends Readonly<boolean> = false
	>(
		target: T,
		propertyName: K,
		callback: WatchCallback<T[K], WatchTrackImmediate<Immediate, T, K>>,
		options?: WatchOptions<Immediate>
	) {
		if (!isGeneralObject(target) || !(propertyName in target)) {
			return VOID_FUNCTION;
		}
		let origin = target[propertyName];
		if (canWatch(target) && !isGeneralObject(origin)) {
			const stopWatch = this.watch(
				() => target[propertyName],
				callback,
				options
			);
			this.cache.push(stopWatch);
			(origin as unknown) = null;
			return stopWatch;
		}
		if (canWatch(origin)) {
			let targetWatch: WatchStopHandle;
			const { immediate = false } = options || {};
			const settingOptions = {
				...options,
				immediate: false as Immediate,
			};
			const originTrack = this.watch(
				() => target[propertyName], // 函数形式监听对应属性是否整体改变，即属性名对应的对象是否替换
				(newVal, oldVal, onCleanup) => {
					if (newVal === oldVal) {
						return;
					}
					// 设置了立即执行则需要在绑定对象改变时触发一次回调，而对象的监听不会立即执行
					immediate &&
						callback(
							newVal,
							oldVal as WatchTrackImmediate<Immediate, T, K>,
							onCleanup
						);
					targetWatch?.();
					if (canWatch(newVal)) {
						targetWatch = this.watch(
							newVal as WatchSource<T[K]>,
							callback,
							settingOptions
						);
					}
				},
				NONE_DEEP_AND_IMMEDIATE
			);
			function stopWatchTrack() {
				targetWatch?.();
				originTrack();
			}
			this.cache.push(stopWatchTrack);
			(origin as unknown) = null;
			return stopWatchTrack;
		}
		(origin as unknown) = null;
		return VOID_FUNCTION;
	}

	clearWatch() {
		this.cache.forEach((fn) => {
			fn?.();
		});
		this.cache.length = 0;
	}

	/**
	 * 移除指定监听回调函数
	 * @param func 需要移除的函数
	 * @param execute 移除时是否执行一次，默认执行
	 */
	remove(
		func: WatchStopHandle | undefined | null | void,
		execute: boolean = true
	) {
		if (func && this.cache.includes(func)) {
			execute && func?.();
			this.cache.splice(this.cache.indexOf(func), 1);
		}
	}
}
