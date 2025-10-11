// socketClient.ts
import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket;

  constructor(baseUrl: string, namespace?: string) {
    const url = namespace ? `${baseUrl}${namespace}` : baseUrl;

    this.socket = io(url, {
      transports: ["websocket"], // nên thêm cho ổn định
      withCredentials: true,
      reconnection: true,        // Tự động reconnect khi mất mạng
      reconnectionAttempts: 5,   // Thử lại tối đa 5 lần
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log(`[Socket Connected] Namespace: ${namespace || '/'}, ID: ${this.socket.id}`);
    });
  }

  emit<T>(event: SocketEventsEnum, data: T) {
    this.socket.emit(event, data);
    console.log(`Emitted event: ${event} with data:`, data);
  }

  on<T>(event: SocketEventsEnum, callback: (data: T) => void) {
    this.socket.on(event, callback);
    console.log(`Listening to event: ${event}`);
  }

  disconnect() {
    this.socket.disconnect();
    console.log("Socket disconnected");
  }

  once<T>(event: SocketEventsEnum, callback: (data: T) => void) {
    this.socket.once(event, callback);
    console.log(`Listening once for event: ${event}`);
  }

  off(event: SocketEventsEnum, callback?: (...args: any[]) => void) {
    this.socket.off(event, callback);
    console.log(`Removed listener for event: ${event}`);
  }

  async emitSafe<T>(event: SocketEventsEnum, data: T) {
    if (!this.socket.connected) {
      console.warn(`[Socket] Waiting for connection before emitting ${event}`);
      await new Promise<void>((resolve) => {
        this.socket.once("connect", () => resolve());
      });
    }

    this.socket.emit(event, data);
    console.log(`Emitted event safely: ${event}`, data);
  }

  async joinRoom(email: string): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit(SocketEventsEnum.JOIN_ROOM, { email }, () => {
        console.log(`[Socket] Joined room: ${email}`);
        resolve();
      });
    });
  }
}

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:3001';
export const socketClient = new SocketClient(BASE_API || 'http://localhost:3001');
export const authSocket = new SocketClient(BASE_API, "/auth");
export const createNotiSocket = () => new SocketClient(BASE_API, "/noti"); // Lazy initialization
export const createChatSocket = () => new SocketClient(BASE_API, "/chat"); // Lazy initialization
export const createPatientProfileSocket = () => new SocketClient(BASE_API, "/patient-profile"); // Lazy initialization
