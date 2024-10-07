export interface MenuItem {
	title: string;
	route?: NonNullable<import('element-plus/es/components/menu/index').MenuItemProps['route']>;
	children?: MenuItem[];
	icon?: string;
	click?: (item: MenuItemClick) => any;
	open?: (...args: MenuOpen) => any;
	close?: (...args: MenuClose) => any;
	select?: (...args: MenuSelect) => any;
	visible?: boolean;
}

export type MenuItemClick = import('element-plus/es/components/menu/src/types').MenuItemRegistered;

export type MenuClose = Parameters<import('element-plus/es/components/menu/index').MenuEmits['close']>;

export type MenuOpen = Parameters<import('element-plus/es/components/menu/index').MenuEmits['open']>;

export type MenuSelect = Parameters<import('element-plus/es/components/menu/index').MenuEmits['select']>;
