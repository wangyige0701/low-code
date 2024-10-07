export type * from '../../@types/cascader';
export type * from '../../@types/date';
export type * from '../../@types/input';
export type * from '../../@types/radio';
export type * from '../../@types/select';
export type * from '../../@types/upload';

import type { ParseUnitSettings } from '../../parse/type';
export type Options = Pick<ParseUnitSettings['reactive'], 'disabled' | 'placeholder' | 'readonly' | 'clearable'>;
