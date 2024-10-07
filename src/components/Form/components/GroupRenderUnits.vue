<script lang="ts" setup>
import type { GroupIns } from '../group';
import type { ParseCLz } from '../parse';
import type { FormProps } from '../props';
import { INJECT_FORM_OPTIONS } from './utils';
import Unit from './Unit.vue';

interface Props {
	uniqueId: string;
	parse: ParseCLz;
	instance: GroupIns;
}

const props = defineProps<Props>();

const formProps = inject(INJECT_FORM_OPTIONS) as FormProps;

const units = computed(() => {
	return [...props.parse.unitEntries(props.instance)];
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
		<template v-for="[settings, unit] of units" :key="`${props.uniqueId}-${unit.prop}`">
			<Unit
				v-if="settings.reactive.visible"
				:uniqueId="props.uniqueId"
				:parse="props.parse"
				:settings="settings"
				:instance="unit"
			/>
		</template>
	</TransitionGroup>
</template>
