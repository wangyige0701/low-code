export {};

/**
 * 使用了generic声明泛型的组件expose数据获取
 */

declare module 'vue' {
	interface ComponentCustomProperties {
		readonly $message: (typeof import('element-plus/es'))['ElMessage'];
		readonly $msgbox: (typeof import('element-plus/es'))['ElMessageBox'];
		readonly $messageBox: (typeof import('element-plus/es'))['ElMessageBox'];
		readonly $alert: (typeof import('element-plus/es'))['ElMessageBox']['alert'];
		readonly $confirm: (typeof import('element-plus/es'))['ElMessageBox']['confirm'];
		readonly $prompt: (typeof import('element-plus/es'))['ElMessageBox']['prompt'];
		vLoading: (typeof import('element-plus/es'))['vLoading'];
		vInfiniteScroll: (typeof import('element-plus/es'))['ElInfiniteScroll'];
	}
}

declare global {
	export type ComponentWithGeneric<T> = Parameters<NonNullable<Parameters<T>['2']>>['0'];
}
