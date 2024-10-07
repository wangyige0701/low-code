import type { ClzGroup } from '../group';

class CreateCollect {
	public value: ClzGroup[] = [];

	constructor(option: ClzGroup[] | CreateCollect) {
		if (option instanceof CreateCollect) {
			this.value.push(...option.value.map(group => group.copy()));
			return this;
		}
		this.value.push(...option);
	}

	*entries() {
		for (const val of this.value) {
			if (!val.value.prop) {
				if (import.meta.env.DEV) {
					throw new Error('[group] 组名不存在');
				}
				continue;
			}
			yield [val.value.prop, val.value, val] as const;
		}
	}

	copy() {
		return new CreateCollect(this);
	}
}

export type ClzCollect = InstanceType<typeof CreateCollect>;

export function createCollect(...vals: ClzGroup[]) {
	if (vals.length === 0) {
		throw new Error(`[collect] 至少需要传入一个组实例`);
	}
	return new CreateCollect(vals);
}

export function isCollect(val: any): val is ClzCollect {
	return val instanceof CreateCollect;
}
