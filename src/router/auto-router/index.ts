import type { RouteRecordRaw } from 'vue-router';
import type { AutoRouterConfig, FolderCache } from '../@types/auto-router';
import { parse, parseCacheMap } from './parse';

/**
 * 自动导入并生成路由配置
 * @returns
 */
export function autoCreateRouterconfig() {
	// 页面配置对象
	const pages = import.meta.glob('../../views/**/page.ts', {
		eager: true,
		import: 'default',
	}) as { [path: string]: AutoRouterConfig };
	// 路由导入对象
	const pageComps = import.meta.glob('../../views/**/index.vue');
	// 数据存放
	const result: RouteRecordRaw[] = [];
	/** 注册过的路由检测 */
	const registedRoutePath = new Set<string>();
	/** 重命名数据缓存映射 */
	const folderCache = new Map<string, FolderCache>();
	const parseMatch = /(^\.\.\/\.\.\/views(.*))\/page.ts$/;
	for (const key in pages) {
		const matchs = key.match(parseMatch);
		// 源路径
		const originPath = matchs?.[1] ?? '';
		// 模块路径
		const moduleName = matchs?.[2] ?? '';
		// 路由导入
		const component = pageComps[originPath + '/index.vue'];
		// 解析模块数据，将路由对象插入result数组
		parse(
			pages[key as keyof typeof pages] as AutoRouterConfig,
			moduleName,
			component,
			registedRoutePath,
			folderCache,
		);
	}
	parseCacheMap(result, folderCache);
	registedRoutePath.clear();
	return result;
}
