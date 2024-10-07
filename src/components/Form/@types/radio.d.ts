type RadioOptions = {
	label: string;
	value: string | number | boolean;
}[];

export interface RadioPayload {
	options?: RadioOptions | Promise<RadioOptions> | AnyFunction<() => RadioOptions>;
}

export type RadioKey = 'radio';
