import type { ElUpload } from 'element-plus';

type ElUploadType = InstanceType<typeof ElUpload>;

export interface UploadPayload {
	multiple?: ElUploadType['multiple'];
	drag?: ElUploadType['drag'];
	accept?: ElUploadType['accept'];
	crossorigin?: ElUploadType['crossorigin'];
	listType?: ElUploadType['listType'];
	autoUpload?: ElUploadType['autoUpload'];
	limit?: ElUploadType['limit'];
	/**
	 * 上传后文件保存的目录前缀
	 */
	folder?: string;
	/**
	 * 是否允许下载
	 */
	download?: boolean;
    /**
     * 提示文本
     */
    tip?: string;
}

export type UploadKey = 'upload';
