<script lang="ts" setup>
import type { GroupIns } from '../group';
import type { ParseCLz } from '../parse';
import type { ParseGroupSettings } from '../parse/type';
import type { FormProps } from '../props';
import { isBoolean, toArray } from '@wang-yige/utils';
import { INJECT_FORM_OPTIONS } from './utils';
import GroupRenderUnits from './GroupRenderUnits.vue';

interface Props {
	uniqueId: string;
	parse: ParseCLz;
	settings: ParseGroupSettings;
	instance: GroupIns;
}

const props = defineProps<Props>();
const formProps = inject(INJECT_FORM_OPTIONS) as FormProps;

const id = `${props.uniqueId}-${props.settings.prop}`;
const theReactive = computed(() => props.settings.reactive);
const labelVisible = computed(() => {
	if (!theReactive.value.label) {
		return false;
	}
	if (isBoolean(formProps.groupLabelVisible)) {
		return formProps.groupLabelVisible;
	}
	if (isBoolean(theReactive.value.showLabel)) {
		return theReactive.value.showLabel;
	}
	return false;
});
</script>

<template>
	<div
		:id="'group-' + id"
		:data-prop="props.settings.prop"
		:data-key="id"
		:data-group="true"
		:data-label="(theReactive.label || '').trim()"
		:class="['group', `group-${props.settings.prop}`, ...toArray(formProps.groupClass)]"
		class="flex flex-col flex-nowrap gap-2 bg-white flex-1"
	>
		<el-divider v-if="labelVisible" :content-position="formProps.groupLabelPosition || 'left'">
			<el-text :type="formProps.groupLabelType || 'primary'" :size="formProps.groupLabelSize || 'small'">
				{{ theReactive.label }}
			</el-text>
		</el-divider>
		<div class="w-full relative">
			<GroupRenderUnits :uniqueId="id" :parse="props.parse" :instance="props.instance" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.group {
	padding: 0.5rem 1rem;
}
</style>
