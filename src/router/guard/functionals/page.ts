import type { RouteLocationNormalized } from 'vue-router';
import { isNumber } from '@wang-yige/utils';

export function bindPageNumber(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized
) {
	const { __page, __previousPath, __previousName } = from.meta;
	if (isNumber(__page)) {
		const { path, name } = to;
		const match =
			(name && name === __previousName) ||
			(path && path === __previousPath);
		if (match) {
			to.meta.__page = __page;
			return;
		}
		const isChildPage = to.matched.some(
			(item) => item.name === from.name || item.path === from.path
		);
		if (!isChildPage) {
			return;
		}
		to.meta.__page = __page;
		to.meta.__previousPath = from.path;
		to.meta.__previousName = from.name;
	}
}
