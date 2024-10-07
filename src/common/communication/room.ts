import { randomString } from '@/common/unique-id';
import {
	singleton,
	isFunction,
	isString,
	isSymbol,
	type Fn,
} from '@wang-yige/utils';

type Callback = Fn<any[], any>;

export type RoomName = string | symbol;

type Return = { (): void; userName: string };

type Register = {
	(callback: Callback): Return;
	(name: string | symbol, callback: Callback): Return;
	(name: string | symbol | Callback, callback?: Callback): Return;
};

/**
 * 通信房间类
 */
class Room {
	/** 房间映射 */
	private rooms: Map<RoomName, Map<string, Callback>>;
	/** 生成随机字符串 */
	private getRandom: () => string;

	constructor() {
		this.rooms = new Map();
		this.getRandom = randomString();
	}

	/**
	 * 获取房间，没有则创建
	 * @param roomName
	 */
	private getRoom(roomName: RoomName) {
		if (!this.rooms.has(roomName)) {
			this.rooms.set(roomName, new Map());
		}
		return this.rooms.get(roomName)!;
	}

	private static createError = '[communication] 注册事件时，未传入回调函数';

	/**
	 * 创建用户
	 * @param roomName
	 * @param userName
	 */
	public createUser(roomName: RoomName) {
		const room = this.getRoom(roomName);
		const offs: Array<() => void> = [];
		const onEvent: Register = (
			name: string | symbol | Callback,
			callback?: Callback
		) => {
			if (isString(name) || isSymbol(name)) {
				if (!isFunction(callback)) {
					throw new Error(Room.createError);
				}
				const _cb = callback;
				callback = (...args: any[]) => {
					if (args.includes(name)) {
						_cb(...args);
					}
				};
			} else {
				callback = name;
			}
			if (!isFunction(callback)) {
				throw new Error(Room.createError);
			}
			const userName = this.getRandom();
			room.set(userName, callback);
			/** 取消监听 */
			const off = () => {
				this.leave(roomName, userName);
			};
			off.userName = userName;
			offs.push(off);
			return off;
		};
		return {
			/** 注册新事件 */
			on: onEvent,
			/** 发送事件 */
			emit: (...params: any[]) => {
				room.forEach((callback) => {
					callback(...params);
				});
			},
			/** 关闭全部事件 */
			off: () => {
				offs.forEach((off) => off());
			},
			clear: () => {
				this.leave(roomName);
			},
		};
	}

	/**
	 * 离开房间后的检测
	 * @param roomName
	 * @param userName
	 */
	private leave(roomName: RoomName, userName?: string) {
		const room = this.getRoom(roomName);
		if (isString(userName)) {
			if (room.has(userName)) {
				room.delete(userName);
			}
		} else {
			room.clear();
		}
		if (room.size === 0) {
			this.rooms.delete(roomName);
		}
	}
}

/**
 * 创建一个通信实例
 */
export const Communication = singleton(Room);
