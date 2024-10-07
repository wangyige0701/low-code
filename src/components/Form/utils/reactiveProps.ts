import type { PromiseResolve } from '@wang-yige/utils';

const ERROR =
	'[Form] 组件配置解析未完成，请通过异步函数 `available` 或 `beforeAvailable` 延迟调用\n`available` 函数不可用await挂起，否则会造成解析异常';

export class ReactiveProps<T extends Record<string, any>> {
	#props: T | undefined;
	#response: Promise<T>;

	constructor(cb: (resolve: PromiseResolve) => void) {
		this.#response = new Promise<T>((resolve) => cb(resolve));
		this.#response.then((props) => {
			this.#props = props;
		});
	}

	#get(key: keyof T) {
		if (!this.#props) {
			throw new Error(ERROR);
		}
		return this.#props[key];
	}

	#set(key: keyof T, value: T[keyof T]) {
		if (!this.#props) {
			throw new Error(ERROR);
		}
		this.#props[key] = value;
	}

	copy() {
		return {
			set: <K extends keyof T>(key: K, value: T[K]) => {
				return this.#set(key, value);
			},
			get: <K extends keyof T>(key: K) => {
				return this.#get(key);
			},
		} as const;
	}
}
