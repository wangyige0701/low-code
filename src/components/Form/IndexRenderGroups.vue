<script lang="ts" setup>
import type { ParseCLz } from './parse';
import { INJECT_FORM_OPTIONS } from './utils/symbol';
import type { FormProps } from './props';
import Group from './components/Group.vue';

interface Props {
	uniqueId: string;
	parse: ParseCLz;
}

const props = defineProps<Props>();

const formProps = inject(INJECT_FORM_OPTIONS) as FormProps;

const groups = computed(() => {
	return [...props.parse.enteries()];
});

defineOptions({
	inheritAttrs: false,
});
</script>

<template>
	<TransitionGroup
		:css="formProps.transition"
		:name="formProps.transitionName"
		:duration="formProps.transitionDuration"
	>
		<template v-for="[settings, group] of groups" :key="`${props.uniqueId}-${group.prop}`">
			<Group
				v-if="settings.reactive.visible"
				:unique-id="props.uniqueId"
				:parse="props.parse"
				:settings="settings"
				:instance="group"
			/>
		</template>
	</TransitionGroup>
</template>
