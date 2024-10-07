import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/input/style/css';
import {
	h,
	defineComponent,
	inject,
	ref,
	computed,
	onMounted,
	onBeforeUnmount,
	shallowReactive,
	type ShallowReactive,
} from 'vue';
import { ElSelect, ElInput, ElOption, ElOptionGroup } from 'element-plus';
import type { UnifyWatch } from '@/common/watch';
import type { SelectPayload, SelectOptions, Options } from '../@types';
import {
	INJECT_PAYLOAD,
	INJECT_OPTIONS,
	READONLY_PLACEHOLDER,
	WATCH_SYMBOL,
} from '../utils';
import { bindFocus } from './__focus';
import { isFunction, isUndef, ParallelTask, type Fn } from '@wang-yige/utils';
import { useVueStatusRef } from 'status-ref/vue';
import { createUniqueId } from '@/common/unique-id';

const IMMEDIATE = Object.freeze({
	immediate: true,
});

type GroupOptions = Array<{ label: string; options: SelectOptions }>;

export default defineComponent({
	name: 'FormSelect',
	inheritAttrs: false,
	setup(_, { attrs }) {
		const options = inject(INJECT_OPTIONS) as Options;
		const payload = inject(INJECT_PAYLOAD) as SelectPayload;
		const unifyWatch = inject(WATCH_SYMBOL) as UnifyWatch;
		const Select = ref<InstanceType<typeof ElSelect>>();
		const selectOptions: ShallowReactive<SelectOptions> = shallowReactive(
			[]
		);
		const filterMethod = computed(() => {
			if (isFunction(payload.filterMethod)) {
				return async (e: string) =>
					await payload.filterMethod!(e, selectOptions);
			}
			return async () => {};
		});
		const status = useVueStatusRef.create('loading').onLoading();
		const queue = new ParallelTask(1);
		const uniqueId = createUniqueId('form-select');

		const optionRender = computed(() => {
			if (status.loading) {
				return h(ElOption, {
					label: '加载中',
					disabled: true,
					value: false,
				});
			}
			if (payload.group) {
				return renderGroups(payload.group, selectOptions);
			}
			return renderOptions(selectOptions);
		});

		function renderGroups(group: string, opts: SelectOptions) {
			const result: GroupOptions = [];
			for (const opt of opts) {
				const label = opt[group];
				if (isUndef(label)) {
					continue;
				}
				let target = result.find((i) => i.label === label);
				if (!target) {
					target = { label, options: [] };
					result.push(target);
				}
				target.options.push(opt);
			}
			return result.map((g, index) => (
				<ElOptionGroup key={`${uniqueId}-${index}`} label={g.label}>
					{renderOptions(g.options)}
				</ElOptionGroup>
			));
		}

		function renderOptions(opts: SelectOptions) {
			const style1 = { style: { marginRight: '10px' } };
			const style2 = {
				style: {
					color: 'var(--el-text-color-secondary)',
					fontSize: '12px',
				},
			};
			return opts.map((opt, index) => {
				const slots = {} as Record<string, Function>;
				if (payload.template) {
					slots.default = () => h(payload.template!, { data: opt });
				} else if (opt.tip) {
					slots.default = () => [
						h('span', style1, opt.label),
						h('span', style2, opt.tip),
					];
				}
				return (
					<ElOption
						key={`${uniqueId}-${index}`}
						label={opt.label}
						value={opt.value}
					>
						{slots}
					</ElOption>
				);
			});
		}

		async function setOptions(opt: SelectPayload['options']) {
			if (!isFunction(opt)) {
				opt = (async () => opt || []) as () => Promise<SelectOptions>;
			}
			status.onLoading();
			const result = await opt();
			selectOptions.splice(0, selectOptions.length, ...result);
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

		onMounted(() => {
			bindFocus(Select);
		});

		onBeforeUnmount(() => {
			cancel?.cancel?.();
		});

		return () => {
			if (options.readonly) {
				const result = selectOptions.find(
					(item) => item.value === attrs.modelValue
				)?.label;
				return (
					<ElInput
						readonly
						placeholder={READONLY_PLACEHOLDER}
						modelValue={result}
					/>
				);
			}
			return (
				<ElSelect
					ref={Select}
					modelValue={attrs.modelValue as any}
					onUpdate:modelValue={attrs['onUpdate:modelValue'] as any}
					disabled={options.disabled}
					clearable={options.clearable}
					placeholder={options.placeholder}
					filterable={payload.filterable}
					filterMethod={
						payload.filterMethod ? filterMethod.value : void 0
					}
				>
					{optionRender.value}
				</ElSelect>
			);
		};
	},
});
