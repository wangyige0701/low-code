<script lang="ts" setup>
import type { MenuItem, MenuItemClick } from '.';
import AsideMenuItem from './AsideMenu-Item.vue';
import { isArray } from '@wang-yige/utils';

interface Props {
	route?: MenuItem['route'];
	index: string;
	parent?: Props;
	title: string;
	children?: MenuItem[];
	icon?: string;
	visible?: boolean;
}
interface Emits {
	(e: 'click', item: MenuItemClick): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

function calcIndex(prev: string, next: string) {
	return prev ? prev + '-' + next : next;
}
</script>

<template>
	<template v-if="isArray(props.children)">
		<el-sub-menu
			v-if="props.visible !== false"
			:index="props.index"
			:position="'sub#' + props.index"
			:data-index="props.index"
			:data-parent-index="props.parent?.index ?? ''"
		>
			<template #title>
				<span class="whitespace-nowrap">
					<el-icon v-if="props.icon" class="home_aside_menu_icon" :class="props.icon"></el-icon>
					{{ props.title }}
				</span>
			</template>
			<template
				v-for="(item, index) of props.children"
				:key="'home-aside-menu-sub' + calcIndex(props.index, index.toString())"
			>
				<AsideMenuItem
					:route="item.route"
					:title="item.title"
					:children="item.children"
					:icon="item.icon"
					:index="calcIndex(props.index, index.toString())"
					:parent="props"
					:visible="item.visible"
					@click="e => emits('click', e)"
				></AsideMenuItem>
			</template>
		</el-sub-menu>
	</template>
	<template v-else>
		<el-menu-item
			v-if="props.visible !== false"
			:index="props.index"
			:route="props.route || { name: '' }"
			@click="e => emits('click', e)"
			:position="'item#' + props.index"
			:data-index="props.index"
			:data-parent-index="props.parent?.index ?? ''"
		>
			<template #title>
				<span class="whitespace-nowrap">
					<el-icon v-if="props.icon" class="home_aside_menu_icon" :class="props.icon"></el-icon>
					{{ props.title }}
				</span>
			</template>
		</el-menu-item>
	</template>
</template>
