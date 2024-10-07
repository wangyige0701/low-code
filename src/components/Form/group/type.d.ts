import type { Group } from '../@types/group';
import type { GROUP_SYMBOL } from '../utils/symbol';

export type GroupIns = {
	[K in typeof GROUP_SYMBOL]: true;
} & {
	prop: string;
	bind: Group;
};
