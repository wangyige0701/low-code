import 'element-plus/es/components/date-picker/style/css';
import { defineComponent, inject, ref, onMounted, type ShallowReactive } from 'vue';
import { ElDatePicker } from 'element-plus';
import type { DatePayload, Options } from '../@types';
import { INJECT_PAYLOAD, INJECT_OPTIONS, READONLY_PLACEHOLDER } from '../utils';
import { bindFocus } from './__focus';

export default defineComponent({
	name: 'FormDate',
	inheritAttrs: false,
	setup(_, { attrs }) {
		const options = inject(INJECT_OPTIONS) as ShallowReactive<Options>;
		const payload = inject(INJECT_PAYLOAD) as ShallowReactive<DatePayload>;
		const Datepick = ref<InstanceType<typeof ElDatePicker>>();

		onMounted(() => {
			bindFocus(Datepick);
		});

		return () => {
			return (
				<ElDatePicker
					ref={Datepick}
					style={{ width: '100%' }}
					modelValue={attrs.modelValue as any}
					onUpdate:modelValue={attrs['onUpdate:modelValue'] as any}
					disabled={options.disabled}
					readonly={options.readonly}
					clearable={options.clearable}
					placeholder={options.readonly ? READONLY_PLACEHOLDER : options.placeholder}
					valueFormat={payload.valueFormat || 'x'}
					format={payload.format || 'YYYY年MM月DD日'}
					type={payload.type}
					editable={false}
				/>
			);
		};
	},
});
