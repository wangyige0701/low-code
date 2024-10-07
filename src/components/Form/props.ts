import type { Transition, FunctionalComponent } from 'vue';
import type { ElText, ElDivider, ElForm, ElButton } from 'element-plus';
import type { ClzUnit } from './unit';
import type { ClzGroup } from './group';
import type { ClzCollect } from './collect';
import type { Awaitable, Fn } from '@wang-yige/utils';

type TransitionProps = typeof Transition extends FunctionalComponent<infer P>
	? P
	: never;

export type Render = ClzUnit | ClzGroup | ClzCollect;

type ButtonUse = { on: VoidFunction; off: VoidFunction };

export type ButtonStatus = { loading: ButtonUse; disabled: ButtonUse };

interface Buttons {
	type?: InstanceType<typeof ElButton>['type'];
	text: string;
	callback: (e: Record<string, any>, status: ButtonStatus) => any;
}

export interface FormProps {
	render: Render | Promise<Render> | Fn<[], Awaitable<Render>>;
	/** 是否触发视图加载图标 */
	viewerLoading?: boolean;
	labelPosition?: InstanceType<typeof ElForm>['labelPosition'];
	/** 按钮区域是否显示 */
	footer?: boolean;
	submit?: boolean;
	reset?: boolean;
	/** 强制控制全局只读，为true时覆盖单元的readonly配置 */
	readonly?: boolean;
	groupLabelType?: InstanceType<typeof ElText>['type'];
	groupLabelSize?: InstanceType<typeof ElText>['size'];
	groupLabelPosition?: InstanceType<typeof ElDivider>['contentPosition'];
	/** 控制组标签显隐的最高优先级 */
	groupLabelVisible?: boolean;
	/** 组的分布方式 */
	groupDirection?: '' | 'column' | 'row' | 'column-reverse' | 'row-reverse';
	groupLayout?: 'flex' | 'grid';
	groupWidth?: string;
	/** 为false时，所有 `focus` 配置都没有作用 */
	autoFocus?: boolean;
	buttons?: Array<Buttons>;
	groupClass?: string | string[];
	unitCLass?: string | string[];

	// 动画
	/** 是否应用动画 */
	transition?: boolean;
	/** 默认 `form` */
	transitionName?: string;
	/** 动画时间，单位毫秒 */
	transitionDuration?: TransitionProps['duration'];
	/**
	 * @deprecated 动画组件改为 `TransitionGroup`，不使用mode
	 */
	transitionMode?: TransitionProps['mode'];
	transitionProperty?: string;
	transitionTimingFunction?:
		| 'ease'
		| 'linear'
		| 'ease-in'
		| 'ease-out'
		| 'ease-in-out'
		| 'step-start'
		| 'step-end'
		| (string & {});
}

export interface FormEmits {
	(e: 'submit', data: any): void;
}
