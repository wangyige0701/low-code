import type { RouteLocationNormalized } from 'vue-router';

const PAGE_BASE_TITLE = 'Page Base Title';

/** 设置标题 */
export function settingTitle(to: RouteLocationNormalized) {
	const {
		meta: { title = '' },
	} = to;
	if (title === false) {
		return;
	}
	if (title.length > 0) {
		document.title = title;
	} else {
		document.title = PAGE_BASE_TITLE;
	}
}
