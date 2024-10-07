import 'element-plus/es/components/radio/style/css';
import 'element-plus/es/components/radio-group/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/text/style/css';
import {
	defineComponent,
	inject,
	shallowReactive,
	onBeforeUnmount,
	computed,
	type ShallowReactive,
} from 'vue';
import { ElRadio, ElRadioGroup, ElInput, ElText } from 'element-plus';
import type { UnifyWatch } from '@/common/watch';
import type { RadioPayload, RadioOptions, Options } from '../@types';
import {
	INJECT_PAYLOAD,
	INJECT_OPTIONS,
	READONLY_PLACEHOLDER,
	WATCH_SYMBOL,
} from '../utils';
import { useVueStatusRef } from 'status-ref/vue';
import { isFunction, ParallelTask, type Fn } from '@wang-yige/utils';
import { createUniqueId } from '@/common/unique-id';

const IMMEDIATE = Object.freeze({
	immediate: true,
});

export default defineComponent({
	name: 'FormRadio',
	inheritAttrs: false,
	setup(_, { attrs }) {
		const options = inject(INJECT_OPTIONS) as ShallowReactive<Options>;
		const payload = inject(INJECT_PAYLOAD) as ShallowReactive<RadioPayload>;
		const unifyWatch = inject(WATCH_SYMBOL) as UnifyWatch;
		const radioOptions: ShallowReactive<RadioOptions> = shallowReactive([]);
		const status = useVueStatusRef.create('loading').onLoading();
		const queue = new ParallelTask(1);
		const uniqueId = createUniqueId('form-radio');

		const radioRender = computed(() => {
			if (status.loading) {
				return <ElText type="info">加载中...</ElText>;
			}
			return radioOptions.map((opt, index) => {
				return (
					<ElRadio key={`${uniqueId}-${index}`} value={opt.value}>
						{opt.label}
					</ElRadio>
				);
			});
		});

		async function setOptions(opt: RadioPayload['options']) {
			if (!isFunction(opt)) {
				const _v = opt;
				opt = (async () => _v || []) as () => Promise<RadioOptions>;
			}
			status.onLoading();
			const result = await opt();
			radioOptions.splice(0, radioOptions.length, ...result);
			status.offLoading();
			cancel = void 0;
		}

		type PromiseWithCancel<T> = Promise<T> & {
			cancel: Fn;
		};
		let cancel: PromiseWithCancel<any> | undefined;

		unifyWatch.watch(
			() => payload.options,
			(newValue) => {
				cancel?.cancel?.();
				cancel = queue.add(setOptions.bind(null, newValue));
			},
			IMMEDIATE
		);

		onBeforeUnmount(() => {
			cancel?.cancel?.();
		});

		return () => {
			if (options.readonly) {
				const result = radioOptions.find(
					(item) => item.value === attrs.modelValue
				)?.label;
				return (
					<ElInput
						readonly
						placeholder={
							options.placeholder || READONLY_PLACEHOLDER
						}
						modelValue={result}
					/>
				);
			}
			return (
				<ElRadioGroup
					modelValue={attrs.modelValue as any}
					onUpdate:modelValue={attrs['onUpdate:modelValue'] as any}
					disabled={options.disabled}
				>
					{radioRender.value}
					<ElInput
						style={{ display: 'none' }}
						class=" opacity-0 hidden invisible h-0 overflow-hidden"
					/>
				</ElRadioGroup>
			);
		};
	},
});
