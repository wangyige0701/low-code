import type { ParseCLz } from '.';
import type { Group } from '../@types/group';
import type { GroupUseful, GroupUsefulKey } from '../@types/useful';

const keys: GroupUsefulKey[] = ['clearable', 'disabled', 'label', 'readonly', 'showLabel'];

export class GroupUsefulClz implements GroupUseful {
	#parse: ParseCLz;

	constructor(parse: ParseCLz) {
		this.#parse = parse;
	}

	show(prop: string) {
		this.#parse.groupShow(prop);
		return this;
	}

	hide(prop: string) {
		this.#parse.groupHide(prop);
		return this;
	}

	visible(prop: string) {
		return this.#parse.groupVisible(prop);
	}

	setReactive<T extends GroupUsefulKey>(key: T, value: Group[T] & {}, prop: string) {
		if (!keys.includes(key)) {
			throw new Error(`[group] ${key} 不是合法响应属性`);
		}
		const reactive = this.#parse.getGroupSettings(prop).reactive;
		reactive[key] = value as any;
		return this;
	}

	getReactive<T extends GroupUsefulKey>(key: T, prop: string) {
		if (!keys.includes(key)) {
			throw new Error(`[group] ${key} 不是合法响应属性`);
		}
		const reactive = this.#parse.getGroupSettings(prop).reactive;
		return reactive[key] as Group[T] & {};
	}
}
