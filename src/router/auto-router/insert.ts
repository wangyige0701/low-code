import type { RouteRecordRaw, RouteRecordRedirectOption } from 'vue-router';
import type { VueRouterPRops } from '../@types/auto-router';

/** 删除字符串原有斜杠并根据参数判断是否返回带有前置斜杠的结果 */
function startSlash(path: string, rmStartSlash: boolean = true) {
	const prefix = /^\/+([\S]*)/;
	if (prefix.test(path)) {
		path = path.match(prefix)![1] || '';
	}
	if (!rmStartSlash) {
		return `/${path}`;
	}
	return path;
}

/**
 * 为路径数据添加斜杠
 * @param pathArray 路径数据数组
 * @param rmStartSlash 是否移除路径数据中的首斜杠，默认false
 */
export function createRouterPaths(pathArray: string[], rmStartSlash: boolean = false) {
	return pathArray.reduce((prev, curr) => {
		return prev + startSlash(curr, rmStartSlash);
	}, '');
}

interface InsertConfig {
	path: string;
	name: string | false;
	component: Function;
	meta: any;
	redirect?: RouteRecordRedirectOption;
	alias?: string | string[];
	props?: VueRouterPRops;
}

/** 插入一条路由数据 */
export function insert({
	path: _path,
	name: _name,
	component: _comp,
	meta: _meta,
	redirect,
	alias,
	props,
}: InsertConfig) {
	const config = {
		path: _path,
		...(_name !== false ? { name: _name } : {}),
		component: _comp,
		meta: _meta,
		...(redirect ? { redirect } : {}),
		...(alias ? { alias } : {}),
		...(props ? { props } : {}),
	} as RouteRecordRaw;
	return config;
}
