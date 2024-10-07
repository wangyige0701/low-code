import {
	createUnit,
	mergeUnits,
	insert,
	cacheUnits,
	type UnitContract,
} from '@/components/Form/index';

const name = cacheUnits(() => {
	return createUnit({
		prop: 'name',
		label: '名称',
		placeholder: '请输入名称',
		type: 'input',
		focus: true,
		validate: { trigger: 'submit', required: true, message: '请输入名称' },
	});
});

export default () => {
	return mergeUnits(name.value);
};
