import type { ElDatePicker } from 'element-plus';

export interface DatePayload {
	type: InstanceType<typeof ElDatePicker>['type'];
	format: InstanceType<typeof ElDatePicker>['format'];
	valueFormat: InstanceType<typeof ElDatePicker>['valueFormat'];
}

export type DateKey = 'date';
