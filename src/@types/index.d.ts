import 'vue-router';

export {};

declare module 'vue-router' {
	interface RouteMeta {
		/** 标题，可选 */
		title?: string | false;
	}
}
