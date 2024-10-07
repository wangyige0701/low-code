import type { Router } from 'vue-router';
import { settingTitle } from './functionals/title';
import { bindPageNumber } from './functionals/page';

/**
 * 注册路由全局前置守卫
 * @param router
 */
export function registerBeforeEach(router: Router) {
	router.beforeEach(async (to, from) => {
		bindPageNumber(to, from);
	});

	router.beforeResolve(async (to, from) => {
		settingTitle(to);
	});
}
