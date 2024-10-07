import type { RouteRecordRaw } from 'vue-router';
import type { AutoRouterConfig, FolderCache } from '../@types/auto-router';
import {
	hasProp,
	firstUpperCase as firstStrUpperCase,
	isFunction,
	isUndefined,
} from '@wang-yige/utils';
import { createRouterPaths, insert } from './insert';

/** 配置数据检测逻辑 */
function configCheck(item: RouteRecordRaw) {
	if (item.redirect === item.path) {
		throw new Error(
			`路由配置错误：redirect属性不能与path属性相同，请检查路由配置：${JSON.stringify(
				item
			)}`
		);
	}
}

/** 最终配置数据整理 */
function configArrange(result: RouteRecordRaw[]) {
	for (const item of result) {
		if (
			hasProp(item, 'redirect') &&
			(!hasProp(item, 'children') || item.children!.length === 0)
		) {
			delete item.component;
		}
		configCheck(item);
	}
}

/**
 * 解析路由配置数据
 * @param path
 * @param config
 * @returns
 */
export function parse(
	config: AutoRouterConfig,
	moduleName: string,
	component: Function,
	registedRoutePath: Set<string>,
	folderCache: Map<string, FolderCache>
) {
	// 模块分割数组
	const moduleArray = moduleName.split('/').filter(Boolean);
	// 配置解构
	const {
		meta = {},
		name = void 0,
		path: writtenPath = void 0,
		override = false,
		redirect = void 0,
		alias = void 0,
		props = void 0,
	} = config;
	let startWithSlash = config.startWithSlash;
	// 模块信息
	const moduleArrayLength = moduleArray.length;
	// 子路由首斜杠配置
	if (isUndefined(startWithSlash)) {
		moduleArrayLength > 1
			? (startWithSlash = false)
			: (startWithSlash = true);
	} else if (moduleArrayLength <= 1) {
		// 无父路由时，子路由首斜杠配置无效
		startWithSlash = true;
	}
	/** 当前配置文件夹 */
	const customFolder = moduleArray[moduleArrayLength - 1];
	let cacheMap = folderCache;
	let cacheTarget: FolderCache;
	// 映射数据匹配
	for (let i = 0; i < moduleArrayLength; i++) {
		const key = moduleArray[i];
		if (!cacheMap.has(key)) {
			cacheMap.set(key, {
				use: false,
				cache: new Map(),
			});
		}
		cacheTarget = cacheMap.get(key)!;
		cacheMap = cacheTarget.cache;
	}
	cacheTarget!.override = override;
	cacheTarget!.startWithSlash = startWithSlash;
	// 路由命名覆盖判断
	let routerName: string | false = moduleArray
		.map((item) => {
			// 将短横线命名的文件夹转换为大驼峰命名
			return item.split('-').map(firstStrUpperCase).join('');
		})
		.join('-');
	if (name && !isUndefined(name)) {
		// 保证空字符串也能覆盖
		routerName = name;
	}
	// 复制数组
	let configPath = customFolder;
	if (!isUndefined(writtenPath)) {
		configPath = writtenPath;
	}
	// 生成完整路径
	const fullPath = createRouterPaths(moduleArray);
	// 检测路径是否已经注册过（理论上不可能出现）
	if (registedRoutePath.has(fullPath)) {
		throw new Error(`${fullPath} 路由路径重复`);
	} else {
		registedRoutePath.add(fullPath);
	}
	const usePath = createRouterPaths([configPath]);
	let aliasClone = alias;
	if (isFunction(aliasClone)) {
		aliasClone = aliasClone(usePath);
	}
	// 获取配置对象
	cacheTarget!.router = insert({
		path: usePath,
		name: routerName,
		component,
		meta,
		redirect,
		alias: aliasClone,
		props,
	});
	cacheTarget!.use = true;
}

/**
 * 缓存映射解析
 * @param result 存放路由信息的数组
 */
export function parseCacheMap(
	result: RouteRecordRaw[],
	folderCache: Map<string, FolderCache>
) {
	function _parse(
		map: Map<string, FolderCache>,
		routers: RouteRecordRaw[],
		prefix?: string
	) {
		map.forEach((value, item) => {
			if (value.use) {
				const router = value.router!;
				routers.push(router);
				if (prefix && !value.override) {
					router.path = prefix + router.path;
				}
				router.path = createRouterPaths(
					[router.path],
					routers === result ? false : !value.startWithSlash
				);
				if (value.cache.size > 0) {
					router.children = [] as RouteRecordRaw[];
					_parse(value.cache, router.children);
				}
			} else {
				if (value.cache.size > 0) {
					_parse(
						value.cache,
						routers,
						(prefix ?? '') + createRouterPaths([item])
					);
				}
			}
		});
		configArrange(routers);
		map.clear();
	}
	_parse(folderCache, result);
}
