import 'element-plus/es/components/input/style/css';
import {
	defineComponent,
	inject,
	ref,
	onMounted,
	h,
	computed,
	type ShallowReactive,
} from 'vue';
import { ElInput } from 'element-plus';
import type { InputPayload, Options } from '../@types';
import { INJECT_PAYLOAD, INJECT_OPTIONS, READONLY_PLACEHOLDER } from '../utils';
import { bindFocus } from './__focus';
import { isString } from '@wang-yige/utils';

function isTextarea<T extends InputPayload>(
	payload: T
): payload is T & { type: 'textarea' } {
	return payload.type === 'textarea';
}

export default defineComponent({
	name: 'FormInput',
	inheritAttrs: false,
	setup(_, { attrs }) {
		const options = inject(INJECT_OPTIONS) as ShallowReactive<Options>;
		const payload = inject(INJECT_PAYLOAD) as ShallowReactive<InputPayload>;
		const Input = ref<InstanceType<typeof ElInput>>();
		const slots = computed(() => {
			const result = {} as Record<string, Function>;
			if (payload.type === 'textarea') {
				return result;
			}
			if (payload.append) {
				const append = payload.append;
				result.append = () => (isString(append) ? append : h(append));
			}
			if (payload.prepend) {
				const prepend = payload.prepend;
				result.prepend = () =>
					isString(prepend) ? prepend : h(prepend);
			}
			return result;
		});

		onMounted(() => {
			bindFocus(Input);
		});

		return () => {
			return (
				<ElInput
					ref={Input}
					modelValue={attrs.modelValue as any}
					onUpdate:modelValue={attrs['onUpdate:modelValue'] as any}
					disabled={options.disabled}
					readonly={options.readonly}
					clearable={options.clearable}
					placeholder={
						options.readonly
							? READONLY_PLACEHOLDER
							: options.placeholder
					}
					type={payload.type}
					autosize={
						isTextarea(payload)
							? payload.autosize || { minRows: 2, maxRows: 6 }
							: void 0
					}
					autocomplete="false"
					resize="none"
				>
					{{ ...slots.value }}
				</ElInput>
			);
		};
	},
});
