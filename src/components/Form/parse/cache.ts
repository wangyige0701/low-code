import { debounce } from '@wang-yige/utils';

interface SimpleMap {
	get(key: string): any;
	set(key: string, value: any): void;
	has(key: string): boolean;
	clear(): void;
}

type CacheValue<T extends string> = {
	[K in T]: SimpleMap;
};

type CacheResult<V extends string[]> = ((...keys: V) => any) extends (
	key0: infer X,
	key1: infer Y
) => any
	? CacheValue<X & string> & CacheValue<Y & string>
	: ((...keys: V) => any) extends (key0: infer X, ...keys: infer R) => any
	? CacheValue<X & string> &
			CacheResult<// @ts-expect-error
			R>
	: {};

export class Cache<T extends string[]> {
	#time: number = 1000 * 60 * 1;
	#cache: Map<string, Map<string, any>> = new Map();
	#pick: CacheResult<T>;

	expired(time: number) {
		this.#time = time;
		return this;
	}

	constructor(...containers: T) {
		this.#pick = {} as CacheResult<T>;
		containers.forEach((container) => {
			const map = () => {
				if (!this.#cache.has(container)) {
					this.#cache.set(container, new Map());
				}
				return this.#cache.get(container)!;
			};
			const gcTree = {} as Record<string, Function>;
			const gc = (key: string) => {
				if (!gcTree[key]) {
					gcTree[key] = debounce(() => {
						const _map = map();
						_map.delete(key);
						delete gcTree[key];
						if (_map.size === 0) {
							this.#cache.delete(container);
						}
					}, this.#time);
				}
				gcTree[key]?.();
			};
			const result = {
				get(key: string) {
					gc(key);
					return map().get(key);
				},
				set: (key: string, value: any) => {
					map().set(key, value);
					gc(key);
				},
				has: (key: string) => {
					return map().has(key);
				},
				clear() {
					map().clear();
				},
			};
			Object.defineProperty(this.#pick, container, {
				get: () => result,
			});
		});
	}

	get in() {
		return this.#pick;
	}

	clear() {
		this.#cache.clear();
		(this.#pick as unknown as undefined) = void 0;
	}
}
