import type { Ref } from 'vue';
import type {
	RouteLocationMatched,
	RouteLocationNamedRaw,
	RouteLocationNormalizedLoaded,
	RouteLocationPathRaw,
	RouteRecordName,
} from 'vue-router';
import type { ElMenu } from 'element-plus/es/components';
import type { MenuItem } from '.';
import { isFunction, isString, nextTick } from '@wang-yige/utils';

interface Props {
	menuList: MenuItem[];
}

interface RouteCollect {
	name?: RouteRecordName;
	path: string;
	rName?: RouteRecordName;
	rPath?: string;
}

interface MenuCollect {
	index: string[];
	name?: RouteRecordName;
	path?: string;
	parent?: MenuCollect;
}

const isActive = 'is-active';
const containsActive = 'contains-active';

function routeCollect(list: RouteLocationMatched[]): RouteCollect[] {
	const collect: RouteCollect[] = [];
	for (const [_index, item] of list.reverse().entries()) {
		const { name, path } = item;
		let redirect = item.redirect;
		if (isFunction(redirect)) {
			redirect = {};
		} else if (isString(redirect)) {
			redirect = {
				path: redirect,
			};
		}
		collect.push({
			name,
			path,
			rName: (redirect as RouteLocationNamedRaw)?.name,
			rPath: (redirect as RouteLocationPathRaw)?.path,
		});
	}
	return collect;
}

function menuCollect(list: MenuItem[]): MenuCollect[] {
	const root: MenuCollect[] = [];
	function cycle(
		itemlist: MenuItem[],
		passed: string[] = [],
		parent?: MenuCollect
	) {
		for (const [index, item] of itemlist.entries()) {
			const copy = [...passed];
			const { route, children } = item;
			const target = {
				index: [...passed, index],
				name: (route as RouteLocationNamedRaw)?.name,
				path: (route as RouteLocationPathRaw)?.path,
				parent,
			} as MenuCollect;
			if (children) {
				copy.push(index.toString());
				cycle(children, copy, target);
			} else {
				root.push(target);
			}
		}
	}
	cycle(list);
	return root;
}

/** 设置菜单初始位置 */
export function decideOpenAndActive(
	route: RouteLocationNormalizedLoaded,
	props: Props,
	Menu: Ref<typeof ElMenu>
) {
	const ElMenuVal = Menu?.value;
	const node = ElMenuVal.$el as HTMLElement;
	if (!ElMenuVal || !node) {
		return;
	}
	const routeCollected = routeCollect(route.matched);
	const menuCollected = menuCollect(props.menuList);
	function menuChecked(val: RouteCollect) {
		const { name, path, rName, rPath } = val;
		function _check(menu: MenuCollect) {
			const { index, name: menuName, path: menuPath, parent } = menu;
			if (
				(menuName && (menuName === name || menuName === rName)) ||
				(menuPath && (menuPath === path || menuPath === rPath))
			) {
				return { index, parent };
			}
			if (parent) {
				return _check(parent);
			}
		}
		for (const menu of menuCollected) {
			const result = _check(menu);
			if (result) {
				return result;
			}
		}
	}
	let checkedResult: ReturnType<typeof menuChecked> | undefined;
	for (const route of routeCollected) {
		checkedResult = menuChecked(route);
		if (checkedResult) {
			break;
		}
	}
	const actived: HTMLElement | null = node.querySelector(
		'.el-menu-item.' + isActive
	);
	if (checkedResult) {
		try {
			ElMenuVal.open(checkedResult.parent?.index?.join?.('-') ?? '');
		} catch (error) {
			/** */
		}
		const el = node.querySelector(
			`.el-menu-item[position="item#${checkedResult.index.join('-')}"`
		);
		if (actived === el) {
			return;
		}
		el && el.classList.add(isActive);
	} else if (actived) {
		const dataset = actived.dataset;
		ElMenuVal.close(dataset?.parentIndex ?? dataset?.index ?? '');
	}
	actived && actived.classList.remove(isActive);
	nextTick(menuSelectChange, Menu, checkedResult?.parent?.index ?? []);
}

/**
 * 父级菜单选中样式
 */
function menuSelectChange(Menu: Ref<typeof ElMenu>, indexPath: string[]) {
	const node = Menu.value.$el as HTMLElement;
	if (!node) {
		return;
	}
	const parents = node.querySelectorAll(
		`.el-sub-menu[${containsActive}="true"]`
	);
	parents.forEach((el) => {
		if (el) {
			el.setAttribute(containsActive, 'false');
		}
	});
	for (const item of indexPath) {
		const el = node.querySelector(`.el-sub-menu[position="sub#${item}"]`);
		if (el) {
			el.setAttribute(containsActive, 'true');
		}
	}
}
