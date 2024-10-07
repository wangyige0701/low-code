import type { CascaderPayload } from './cascader';
import type { DatePayload } from './date';
import type { InputPayload } from './input';
import type { RadioPayload } from './radio';
import type { SelectPayload } from './select';
import type { UploadPayload } from './upload';

export type Payloads = {
	cascader: CascaderPayload;
	date: DatePayload;
	input: InputPayload;
	radio: RadioPayload;
	select: SelectPayload;
	upload: UploadPayload;
};

export type Types = keyof Payloads & {};
