// socketClient.ts
import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url);
  }

  emit<T>(event: SocketEventsEnum, data: T) {
    this.socket.emit(event, data);
  }

  on<T>(event: SocketEventsEnum, callback: (data: T) => void) {
    this.socket.on(event, callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export const socketClient = new SocketClient(process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:3001');
