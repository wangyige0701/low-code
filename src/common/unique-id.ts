/** 获取一个随机字符串 */
export function randomString() {
	const basicStr =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const basicStrLen = basicStr.length;
	const cache = new Set<string>();
	function _create() {
		const result = (Math.random() * Date.now())
			.toString(16)
			.substring(1, 9)
			.replace(
				/\./g,
				basicStr.charAt(Math.floor(Math.random() * basicStrLen))
			);
		if (cache.has(result)) {
			return _create();
		} else {
			cache.add(result);
			return result;
		}
	}
	return _create;
}

const index: number = 0;

const createRandom = randomString();

export function createUniqueId(prefix?: string) {
	return `${prefix ? prefix + '-' : ''}${createRandom()}-${index.toString(
		16
	)}`;
}
