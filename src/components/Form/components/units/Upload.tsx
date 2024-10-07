import {
	defineComponent,
	inject,
	computed,
	h,
	type ShallowReactive,
} from 'vue';
import type { UploadPayload, Options } from '../@types';
import { INJECT_PAYLOAD, INJECT_OPTIONS } from '../utils';

export default defineComponent({
	name: 'FormUpload',
	inheritAttrs: false,
	setup(_, { attrs }) {
		const options = inject(INJECT_OPTIONS) as ShallowReactive<Options>;
		const payload = inject(
			INJECT_PAYLOAD
		) as ShallowReactive<UploadPayload>;

		return () => {
			return <div>no completed</div>;
		};
	},
});
