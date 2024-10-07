import { Communication, type RoomName } from './room';

/**
 * 创建一个通信对象
 * @param id
 * @returns
 */
export function createCommunication(id: RoomName) {
	const communication = new Communication();
	return communication.createUser(id);
}

export type Community = ReturnType<typeof createCommunication>;
