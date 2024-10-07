<script lang="ts" setup>
import type { ElForm } from 'element-plus';
import type { ButtonStatus, FormEmits, FormProps, Render } from './props';
import {
	COMMUNICATE_CLEAR_VALIDATE,
	COMMUNICATE_SYMBOL,
	INJECT_FORM_OPTIONS,
	INJECT_FORM_SLOTS,
	WATCH_SYMBOL,
} from './utils/symbol';
import { StatusRef, type StatusRefClazz } from '@myvue/reactive/status';
import { isFunction, isNumber, isObject } from '@common/utils/types';
import { createUniqueId } from '@common/core/unique-id';
import { createCommunication } from '@common/core/communication';
import { UnifyWatch } from '@myvue/watch';
import { IMMEDIATE } from '@config/options/watch';
import { debounce } from '@common/utils/useful/debounce';
import { useHomeViewStore } from '@stores/home';
import { parse, type ParseCLz } from './parse';
import Room from '@comps/utils/Room.vue';
import IndexRenderGroups from './IndexRenderGroups.vue';

type UseButtonStatus = { status: [StatusRefClazz<['loading', 'disabled']>, ButtonStatus] };

const props = withDefaults(defineProps<FormProps>(), {
	viewerLoading: true,
	footer: true,
	submit: true,
	reset: true,
	autoFocus: true,
	groupDirection: 'column',
	groupLayout: 'flex',
	transition: true,
	transitionName: 'form',
	transitionDuration: 300,
	transitionTimingFunction: 'ease',
});
const emits = defineEmits<FormEmits>();
const slots = useSlots();

provide(INJECT_FORM_OPTIONS, reactive({ ...props }));
provide(INJECT_FORM_SLOTS, { ...slots });

const FormRef = ref<InstanceType<typeof ElForm>>();
const renderFunc = computed(() => {
	if (!isFunction(props.render)) {
		return async () => props.render as Render;
	}
	return async () => await (props.render as AnyFunction<() => Render>)();
});
const render = shallowReactive({
	parse: void 0 as ParseCLz | undefined,
});
const model = computed(() => {
	if (render.parse) {
		return render.parse.model;
	}
	return {} as Record<string, any>;
});
const Size = {
	mainHeight: ref({ height: 0 }),
	containerHeight: ref({ height: 0 }),
	footerHeight: ref({ height: 0 }),
};
const animationDuration = computed(() => {
	if (isObject(props.transitionDuration)) {
		return props.transitionDuration;
	}
	return { enter: props.transitionDuration, leave: props.transitionDuration };
});
/** 根据滚动条容器约束外层容器高度 */
const scrollBarHeight = ref<number>(0);

const status = StatusRef('initial', 'resize').offInitial().onResize();
const uniqueId = createUniqueId();
const community = createCommunication(COMMUNICATE_SYMBOL);
const unifyWatch = new UnifyWatch();
provide(COMMUNICATE_SYMBOL, community);
provide(WATCH_SYMBOL, unifyWatch);

if (props.viewerLoading) {
	// prettier-ignore
	unifyWatch.watch(() => status.initial, newValue => {
		if (newValue) {
			useHomeViewStore().offLoading(true);
		} else {
			useHomeViewStore().onLoading();
		}
	}, IMMEDIATE);
}

unifyWatch.watch(
	() => Size.mainHeight.value.height,
	(n, o) => {
		if (Math.round(n) !== Math.round(o)) {
			status.onResize();
		}
	},
);

unifyWatch.watch(
	() => Size.containerHeight.value.height,
	() => {
		status.onResize();
	},
);

const setScrollbarHeight = debounce(() => {
	const Form = FormRef.value!.$el as HTMLElement;
	const formHeight = Form.offsetHeight;
	const footerHeight = unref(Size.footerHeight).height;
	const containerHeight = unref(Size.containerHeight).height;
	const rest = footerHeight + 1;
	if (formHeight <= rest) {
		scrollBarHeight.value = Math.round(containerHeight) || 9999;
	} else {
		scrollBarHeight.value = Math.round(Math.min(containerHeight, formHeight - rest));
	}
	status.offResize();
}, 100);

async function getRenderGroups() {
	const data = await renderFunc.value();
	const value = parse(data);
	await value.available();
	return value;
}

function getResult() {
	return render.parse?.result ?? {};
}

async function submit() {
	if (!render.parse) {
		return;
	}
	if (!FormRef.value) {
		return;
	}
	try {
		await FormRef.value.validate().catch(err => {
			let result = '';
			if (err && isObject(err)) {
				const keys = Object.keys(err);
				FormRef.value?.scrollToField?.(keys[0]);
				if (keys.length > 1) {
					result = `${keys.length}处数据校验失败`;
				} else {
					result = err[keys[0]][0]?.message;
				}
			}
			$global.$message.error(result ? result : '数据校验错误');
			return Promise.reject();
		});
		await render.parse.available();
		emits('submit', getResult());
	} catch (error) {
		/**/
	}
}

async function reset() {
	if (!render.parse) {
		return;
	}
	await render.parse.available();
	render.parse.reset();
	community.emit(COMMUNICATE_CLEAR_VALIDATE);
}

function durationUnit(val?: number) {
	if (isNumber(val) && !isNaN(val)) {
		return val + 'ms';
	}
	return '';
}

function createButtonStatus() {
	const _status = StatusRef('loading', 'disabled').offLoading().offDisabled();
	const loading = { on: () => _status.onLoading(), off: () => _status.offLoading() };
	const disabled = { on: () => _status.onDisabled(), off: () => _status.offDisabled() };
	return [_status, { loading, disabled }];
}

onMounted(() => {
	unifyWatch.watchEffect(() => {
		if (status.refResize.value && FormRef.value) {
			nextTick(setScrollbarHeight);
		}
	});
});

onBeforeMount(() => {
	getRenderGroups().then(parse => {
		render.parse = parse;
		nextTick(() => {
			status.onInitial();
		});
	});
});

onBeforeUnmount(() => {
	setScrollbarHeight.pause();
	community.off();
	unifyWatch.clearWatch();
	if (render.parse) {
		render.parse.clear();
	}
});

defineExpose({
	get result() {
		return getResult();
	},
	async reset() {
		return await reset();
	},
	async submit() {
		return await submit();
	},
	validate() {
		if (FormRef.value) {
			return FormRef.value.validate();
		}
	},
	clearValidate() {
		community.emit(COMMUNICATE_CLEAR_VALIDATE);
	},
});

const RootCls =
	'custom_form_container w-full h-full overflow-y-scroll flex flex-col flex-nowrap justify-center justify-items-start';
const FooterStyle = 'w-full min-h-[45px] flex flex-row items-center justify-start sticky bottom-0 bg-white';
</script>

<template>
	<el-container v-observe.size="{ sizeRef: Size.mainHeight, sizeDelay: 17 }" :class="RootCls">
		<el-form
			ref="FormRef"
			:id="'form-' + uniqueId"
			:model="model"
			:validate-on-rule-change="false"
			:label-position="props.labelPosition"
			label-width="auto"
			class="form_target w-full max-h-full overflow-hidden"
		>
			<el-scrollbar
				v-if="!useHomeViewStore().isProgress && status.initial"
				:data-direction="props.groupDirection"
				:data-layout="props.groupLayout"
				:noresize="true"
				:max-height="unref(status.refResize) ? void 0 : scrollBarHeight + 'px'"
				class="group_container"
				:style="{
					'--group-width': props.groupWidth || '100%',
					'--group-direction': props.groupDirection || 'column',
					'--transition-enter-duration': durationUnit(animationDuration.enter),
					'--transition-leave-duration': durationUnit(animationDuration.leave),
					'--transition-timing-function': props.transitionTimingFunction,
					'--transition-property': props.transitionProperty,
					height: 'auto',
					maxHeight: unref(status.refResize) ? void 0 : scrollBarHeight + 'px',
				}"
			>
				<div
					v-observe.size="{ sizeRef: Size.containerHeight, sizeDelay: 20 }"
					class="group_container_view w-full relative overflow-x-hidden"
					:class="[`container-${uniqueId}`]"
				>
					<template v-if="render.parse">
						<IndexRenderGroups :unique-id="uniqueId" :parse="render.parse" />
					</template>
				</div>
			</el-scrollbar>
			<div class="side_line"></div>
			<div
				v-if="status.initial && props.footer && !props.readonly"
				v-observe.size="{ sizeRef: Size.footerHeight, sizeDelay: 20 }"
				class="form_fotter"
				:class="[FooterStyle, `footer-${uniqueId}`]"
			>
				<el-button v-if="props.submit" type="primary" native-type="submit" @click.prevent="submit">
					提交
				</el-button>
				<el-button v-if="props.reset" type="default" @click.prevent="reset"> 重置 </el-button>
				<template v-for="(item, index) of props.buttons ?? []" :key="`${uniqueId}-footer-button-${index}`">
					<Room
						:type="/*prettier-ignore*/(Object as InferType<UseButtonStatus>)"
						:status="createButtonStatus()"
					>
						<template #default="{ status: [_status, use] }">
							<el-button
								:loading="_status.loading"
								:disabled="_status.disabled"
								:type="item.type"
								@click.prevent="item.callback(getResult(), use)"
							>
								{{ item.text }}
							</el-button>
						</template>
					</Room>
				</template>
			</div>
		</el-form>
	</el-container>
</template>

<style lang="scss" scoped>
.form_target {
	--margin-vertical: 20px;
	gap: var(--el-main-padding);

	.group_container {
		@mixin flex-layout {
			display: flex;
			:deep(.group[group='true']) {
				width: var(--group-width);
				flex: 1;
			}
		}

		// 视图布局
		&[data-layout='flex'] .group_container_view {
			@include flex-layout;
			flex-direction: var(--group-direction);
		}

		// 容器设置
		:deep(.el-scrollbar__wrap) {
			width: 100%;
			overflow-y: scroll;
		}
	}

	.side_line {
		width: calc(100% - 2.4rem);
		margin: 0 auto;
		border-bottom: 1px solid var(--el-color-info-light-8);
	}

	.form_fotter {
		padding: calc(0.5rem + 18px) 1.2rem 0.8rem;
	}

	:deep(.form-move) :deep(.form-enter-active),
	:deep(.form-leave-active) {
		--default-property: opacity, transform;
		transition-property: var(--transition-property, var(--default-property));
		transition-timing-function: var(--transition-timing-function, ease);
	}
	:deep(.form-move) {
		transition-duration: max(var(--transition-enter-duration, 0.3s), var(--transition-leave-duration, 0.3s));
	}
	:deep(.form-enter-active) {
		transition-duration: var(--transition-enter-duration, 0.3s);
	}
	:deep(.form-leave-active) {
		position: absolute;
		transition-duration: var(--transition-leave-duration, 0.3s);
	}
	:deep(.form-enter-from),
	:deep(.form-leave-to) {
		opacity: 0;
		transform: translateX(30px) scaleY(0.5);
	}
}
</style>
