<script lang="ts" setup>
import type { Component } from 'vue';
import type { ElFormItem } from 'element-plus';
import type { Community } from '@/common/communication';
import type { ParseCLz } from '../parse';
import type { ParseUnitSettings } from '../parse/type';
import type { FormProps } from '../props';
import type { UnitIns } from '../unit';
import { isFunction, isObject, toArray } from '@wang-yige/utils';
import { COMPONENTS } from './units';
import {
	COMMUNICATE_CLEAR_VALIDATE,
	COMMUNICATE_SYMBOL,
	CUSTOM_SYMBOL,
	INJECT_FORM_OPTIONS,
	INJECT_OPTIONS,
	INJECT_PAYLOAD,
} from './utils';

interface Props {
	uniqueId: string;
	parse: ParseCLz;
	settings: ParseUnitSettings;
	instance: UnitIns;
}

const props = defineProps<Props>();
const formProps = inject(INJECT_FORM_OPTIONS) as FormProps;
const community = inject(COMMUNICATE_SYMBOL) as Community;

const id = `${props.uniqueId}-${props.settings.prop}`;
const FormItem = ref<InstanceType<typeof ElFormItem>>();
const Item = ref();
const Value = toRef(props.settings.value);
const theReactive = computed(() => proxyForReadonly(props.settings.reactive));
const labelWidth = computed(() => {
	const r = unref(theReactive);
	const length = (r.label ?? '').length;
	if (length > 0) {
		return;
	}
	return '0px';
});
const propValue = computed(() => props.settings.prop);

const render = createRenderComponent();
community.on(COMMUNICATE_CLEAR_VALIDATE, () => {
	if (FormItem.value) {
		FormItem.value.clearValidate();
	}
});

function proxyForReadonly<T extends object>(react: T): T {
	return new Proxy(react, {
		get(target, key) {
			const result = Reflect.get(target, key);
			if (key === 'readonly' && formProps.readonly) {
				return true;
			}
			return result;
		},
		set(target, key, value) {
			return Reflect.set(target, key, value);
		},
	});
}

function createRenderComponent() {
	if (props.instance[CUSTOM_SYMBOL]) {
		const component = props.parse.getComponent<true>(propValue.value);
		return {
			custom: true,
			component: checkComponent(component.component),
			props: component.componentProps,
		};
	} else {
		const component = props.parse.getComponent<false>(propValue.value);
		const payload = component.payload;
		sendProvide(payload);
		return {
			custom: false,
			component: checkComponent(COMPONENTS[component.type]),
			props: payload,
		};
	}
}

function checkComponent<T extends Component>(comp: T): T {
	if (comp && isObject(comp)) {
		return comp;
	}
	throw new Error('组件未传入对象');
}

function sendProvide(payload: any) {
	provide(INJECT_OPTIONS, shallowReactive(theReactive.value));
	provide(INJECT_PAYLOAD, shallowReactive(payload));
}

function customComponentSend() {
	const copy = { ...theReactive.value, ...render.props };
	delete copy.label;
	return copy;
}

onMounted(() => {
	const isFocus = formProps.autoFocus !== false && props.settings.focus;
	if (isFocus && isFunction(Item.value?.focus)) {
		setTimeout(() => {
			Item.value.focus();
		}, 500);
	}
});
</script>

<template>
	<el-form-item
		ref="FormItem"
		:id="'unit-' + id"
		:data-prop="propValue"
		:data-key="id"
		:data-unit="true"
		:data-label="theReactive.label.trim()"
		:class="['unit', `unit-${propValue}`, ...toArray(formProps.unitCLass)]"
		:label="theReactive.label"
		:label-width="labelWidth"
		:required="theReactive.required"
		:prop="propValue"
		:rules="props.settings.validate"
	>
		<template v-if="render.custom">
			<component ref="Item" :is="render.component" v-model="Value" v-bind="customComponentSend()"></component>
		</template>
		<template v-else>
			<component ref="Item" :is="render.component" v-model="Value"></component>
		</template>
	</el-form-item>
</template>
