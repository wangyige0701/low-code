import type { Component } from 'vue';
import type { Types } from '../@types';
import Cascader from './units/Cascader';
import DateComp from './units/Date';
import Input from './units/Input';
import Radio from './units/Radio';
import Select from './units/Select';
import Upload from './units/Upload';

export const COMPONENTS: Record<Types, Component> = {
	cascader: Cascader,
	date: DateComp,
	input: Input,
	radio: Radio,
	select: Select,
	upload: Upload,
};
