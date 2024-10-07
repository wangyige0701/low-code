import { getCurrentInstance, type Ref } from 'vue';
import { isFunction } from '@wang-yige/utils';

export function bindFocus(_ref: Ref<any>) {
	if (_ref.value) {
		const _this = getCurrentInstance()!.proxy;
		if (isFunction(_ref.value.focus)) {
			Object.defineProperty(_this, 'focus', {
				get() {
					return _ref.value.focus;
				},
			});
		}
	}
}
