import 'element-plus/es/components/cascader/style/css';
import 'element-plus/es/components/input/style/css';
import {
	defineComponent,
	inject,
	ref,
	onMounted,
	createApp,
	h,
	nextTick,
	onBeforeUnmount,
	type ShallowReactive,
} from 'vue';
import { ElCascader, ElInput } from 'element-plus';
import type { CascaderPayload, Options } from '../@types';
import { INJECT_PAYLOAD, INJECT_OPTIONS, READONLY_PLACEHOLDER } from '../utils';
import { bindFocus } from './__focus';
import type { Fn } from '@wang-yige/utils';

function getCascaderValue(
	payload: ShallowReactive<CascaderPayload>,
	attrs: any,
	cb: (str: string) => void
) {
	const div = document.createElement('div');
	const app = createApp({
		data() {
			return {
				value: '',
			};
		},
		mounted() {
			this.$watch('value', (val: string) => cb(val));
		},
		render() {
			return h(ElCascader, {
				ref: 'Cascader',
				props: payload.props,
				options: payload.options,
				modelValue: attrs.modelValue,
				'onUpdate:modelValue': (v) => (this.value = v),
			});
		},
	});
	app.mount(div);
	return () => {
		nextTick(() => {
			app.unmount();
			div.remove();
		});
	};
}

export default defineComponent({
	name: 'FormCascader',
	inheritAttrs: false,
	setup(_, { attrs }) {
		const options = inject(INJECT_OPTIONS) as ShallowReactive<Options>;
		const payload = inject(
			INJECT_PAYLOAD
		) as ShallowReactive<CascaderPayload>;
		const Cascader = ref<InstanceType<typeof ElCascader>>();
		const read = ref('');

		let calcText: Fn;
		if (options.readonly) {
			calcText = getCascaderValue(payload, attrs, (str) => {
				read.value = str;
			});
		}

		onMounted(() => {
			bindFocus(Cascader);
		});

		onBeforeUnmount(() => {
			calcText && calcText();
		});

		return () => {
			if (options.readonly) {
				return (
					<ElInput
						readonly
						placeholder={READONLY_PLACEHOLDER}
						modelValue={read.value}
					/>
				);
			}
			return (
				<ElCascader
					ref={Cascader}
					style={{ flexGrow: 1 }}
					modelValue={attrs.modelValue as any}
					onUpdate:modelValue={attrs['onUpdate:modelValue'] as any}
					disabled={options.disabled || options.readonly}
					clearable={options.clearable}
					placeholder={options.placeholder}
					options={payload.options}
					props={payload.props}
				/>
			);
		};
	},
});
