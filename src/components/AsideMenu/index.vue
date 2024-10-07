<script setup lang="ts">
import type { MenuItem, MenuItemClick, MenuOpen, MenuClose, MenuSelect } from '.';
import AsideMenuItem from './AsideMenu-Item.vue';
import { onBeforeRouteUpdate } from 'vue-router';
import { isArray } from '@wang-yige/utils';
import { decideOpenAndActive } from './utils';

interface Props {
	menuList: MenuItem[];
}

interface Emits {
	(e: 'click', menu: MenuItemClick): void;
	(e: 'open', ...args: MenuOpen): void;
	(e: 'close', ...args: MenuClose): void;
	(e: 'select', ...args: MenuSelect): void;
}

const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits<Emits>();
const Menu = ref<any>();
const MenuList = ref<InstanceType<typeof AsideMenuItem>[]>([]);

function menuItemClick(item: MenuItemClick) {
	emit('click', item);
	const target = position(item.index);
	if (target && target.click) {
		target.click(item);
	}
}

function menuSelect(...args: MenuSelect) {
	emit('select', ...args);
	const target = position(args[0]);
	if (target && target.select) {
		target.select(...args);
	}
}

/** 控制打开菜单的索引 */
let openIndex: string[] = [];

function menuOpen(...args: MenuOpen) {
	emit('open', ...args);
	const target = position(args[0]);
	if (target && target.open) {
		target.open(...args);
	}
	const last = openIndex.splice(0);
	openIndex.push(...args[0].split('-'));
	const temp: string[] = [];
	for (const [index, item] of (last.entries())) {
		temp.push(item);
		const openVal = openIndex[index];
		if (item === openVal) {
			continue;
		}
		Menu?.value?.close(temp.join('-'));
	}
}

function menuClose(...args: MenuClose) {
	emit('close', ...args);
	const target = position(args[0]);
	if (target && target.close) {
		target.close(...args);
	}
	for (const [index, nowClose] of args[0].split('-').entries()) {
		if (nowClose !== openIndex[index]) {
			openIndex.splice(index);
			break;
		}
	}
}

function position(index: string) {
	const arrs = index.split('-');
	let val = props.menuList;
	let target: MenuItem | undefined;
	for (const item of arrs) {
		target = val[Number(item)];
		if (isArray(target.children)) {
			val = target.children;
		} else {
			return target;
		}
	}
	return target;
}

onMounted(() => {
	decideOpenAndActive($global.$route, props, Menu);
	onBeforeRouteUpdate(to => decideOpenAndActive(to, props, Menu));
});

defineOptions({
	inheritAttrs: true,
});
</script>

<template>
	<el-menu ref="Menu" class="home_aside_menu" :router="true" @select="menuSelect" @open="menuOpen" @close="menuClose">
		<template v-for="(item, index) of props.menuList" :key="'home-aside-menu-' + index">
			<AsideMenuItem
				ref="MenuList"
				:route="item.route"
				:title="item.title"
				:icon="item.icon"
				:children="item.children"
				:index="index.toString()"
				:visible="item.visible"
				@click="menuItemClick"
			></AsideMenuItem>
		</template>
	</el-menu>
</template>

<style lang="scss" scoped>
.home_aside_menu {
	:deep(.el-icon.home_aside_menu_icon) {
		color: inherit;
		font-size: var(--el-menu-icon-width);
		margin-right: 2px;
	}
}
</style>
<style lang="scss">
.home_aside_menu {
	--el-menu-text-color: var(--home-menu-text-color);
	--el-menu-hover-text-color: var(--home-menu-hover-text-color);
	--el-menu-bg-color: var(--home-menu-bg-color);
	--el-menu-hover-bg-color: var(--home-menu-hover-bg-color);
	--el-menu-active-color: var(--home-menu-active-color);
	--el-menu-item-font-size: 14px;
	--el-menu-icon-width: $20px;
	border-color: var(--home-menu-bg-color);

	// 选中的菜单样式

	.el-sub-menu {
		&[contains-active='true'] .el-sub-menu__title {
			color: var(--el-menu-active-color);
		}

		.el-icon.el-sub-menu__icon-arrow {
			font-size: 16px;
			color: var(--home-menu-text-color);
		}
	}

	.el-menu-item.is-active {
		background-color: var(--el-menu-hover-bg-color);
	}
}
</style>
