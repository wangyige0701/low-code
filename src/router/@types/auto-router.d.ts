import type { RouteMeta, RouteRecordRedirectOption, RouteLocationNormalized } from 'vue-router';

export type VueRouterPRops = boolean | Record<string, any> | ((to: RouteLocationNormalized) => Record<string, any>);

export interface AutoRouterConfig {
	meta: RouteMeta;
	/** 自定义路由命名，为false表示不传name */
	name?: string | false;
	/**
	 * 子路由是否以斜杠开头，默认`false`，没有父路由时，默认为true；
	 * 子路由中path如果是相对路径则需要去掉首斜杠
	 */
	startWithSlash?: boolean;
	/** 覆写路径名，等于改写根据目录结构自动生成的path名 */
	path?: string;
	/**
	 * 假设当前文件夹有父文件夹并且父文件夹没有路由配置，如果不希望父文件夹的路径被写入，可以设置override为true
	 * @example /root/parent/child/page.ts   /root/page.ts   ==>  { override: true, path: 'child' } ==>  { path: /root/child }
	 */
	override?: boolean;
	/** 别名 */
	alias?: string | string[] | ((path: string) => string | string[]);
	/** 重定向 */
	redirect?: RouteRecordRedirectOption;
	/** 组件传参配置 */
	props?: VueRouterPRops;
}

export type FolderCache = {
	router?: RouteRecordRaw;
	use: boolean;
	cache: typeof folderCache;
	override?: boolean;
	startWithSlash?: boolean;
};
