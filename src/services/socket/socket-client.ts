// socketClient.ts
import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { io, Socket } from 'socket.io-client';

/**
 * Best Practice Socket Client (Production Ready)
 * 
 * Nguyên tắc:
 * - Token chỉ dùng cho handshake (connection authentication)
 * - KHÔNG tự refresh token trong socket layer → để HTTP layer lo
 * - KHÔNG proactive reconnect → chỉ reconnect khi HTTP thông báo
 * - Socket bị reject → auto-reconnect với token mới từ localStorage
 * 
 * Flow:
 * 1. HTTP layer refresh token → dispatch window event
 * 2. Socket client nhận event → reconnect
 * 3. Socket.io auto call token function → lấy token mới từ localStorage
 */
class SocketClient {
  private socket: Socket;
  private baseUrl: string;
  private namespace?: string;

  constructor(baseUrl: string, namespace?: string) {
    this.baseUrl = baseUrl;
    this.namespace = namespace;
    
    // Create socket với token function - lấy token mới mỗi lần connect/reconnect
    this.socket = this.createSocket();

    // Listen for token refresh from HTTP layer
    if (typeof window !== 'undefined') {
      window.addEventListener('token-refreshed', () => {
        console.log('[Socket] Token refreshed by HTTP, reconnecting...');
        this.reconnect();
      });
    }
  }

  /**
   * Tạo socket với token động từ localStorage
   * Socket.io sẽ gọi function này mỗi khi connect/reconnect
   */
  private createSocket(): Socket {
    const url = this.namespace ? `${this.baseUrl}${this.namespace}` : this.baseUrl;

    const socket = io(url, {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      auth: (cb) => {
        // Callback function - socket.io sẽ gọi mỗi lần connect/reconnect
        if (typeof window === 'undefined') {
          cb({ token: '' });
          return;
        }
        const token = localStorage.getItem('accessToken') || '';
        console.log('[Socket] Getting token for auth, length:', token?.length || 0);
        cb({ token });
      },
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log(`[Socket Connected] Namespace: ${this.namespace || '/'}, ID: ${socket.id}`);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connect error:', err.message);
      // JWT errors will cause auto-reconnect, which will call token function again
      if (err.message.includes('Invalid') || err.message.includes('expired')) {
        console.log('[Socket] Auth error - will auto-reconnect with fresh token from localStorage');
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    return socket;
  }

  /**
   * Manual reconnect - được gọi khi HTTP layer refresh token
   * Disconnect rồi connect lại → socket.io sẽ gọi token function để lấy token mới
   */
  public reconnect() {
    console.log('[Socket] Manually reconnecting...');
    if (this.socket.connected) {
      this.socket.disconnect();
    }
    this.socket.connect();
  }

  // ============= Public API =============

  emit<T>(event: SocketEventsEnum, data?: T) {
    if (typeof data === 'undefined') {
      this.socket.emit(event);
    } else {
      this.socket.emit(event, data);
    }
    console.log(`[Socket] Emitted: ${event}`);
  }
  
  async emitSafe<T>(event: SocketEventsEnum, data?: T) {
    if (!this.socket.connected) {
      console.warn(`[Socket] Waiting for connection before emitting ${event}`);
      await new Promise<void>((resolve) => {
        this.socket.once("connect", () => resolve());
      });
    }
    if (typeof data === 'undefined') {
      this.socket.emit(event);
    } else {
      this.socket.emit(event, data);
    }
    console.log(`[Socket] Emitted safely: ${event}`);
  }

  on<T>(event: SocketEventsEnum, callback: (data: T) => void) {
    this.socket.on(event, callback);
    console.log(`[Socket] Listening: ${event}`);
  }

  disconnect() {
    this.socket.disconnect();
    console.log('[Socket] Disconnected');
  }

  once<T>(event: SocketEventsEnum, callback: (data: T) => void) {
    this.socket.once(event, callback);
    console.log(`[Socket] Listening once: ${event}`);
  }

  off(event: SocketEventsEnum, callback?: (...args: any[]) => void) {
    this.socket.off(event, callback);
    console.log(`[Socket] Removed listener: ${event}`);
  }

  async joinRoom(): Promise<void> {
    await this.emitSafe(SocketEventsEnum.JOIN_ROOM);
    console.log('[Socket] JOIN_ROOM emitted');
  }

  // ===== Extra helpers for providers =====
  isConnected(): boolean {
    return this.socket.connected;
  }

  onConnect(cb: () => void) {
    this.socket.on('connect', cb);
  }

  offConnect(cb: () => void) {
    this.socket.off('connect', cb);
  }

  onDisconnect(cb: (reason: Socket.DisconnectReason) => void) {
    this.socket.on('disconnect', cb as any);
  }

  offDisconnect(cb: (reason: Socket.DisconnectReason) => void) {
    this.socket.off('disconnect', cb as any);
  }
}

// ============= Exports =============

const API_BASE = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:3001/api';
const BASE_API = API_BASE.replace(/\/api\/?$/, '');

export const socketClient = new SocketClient(BASE_API);
export const authSocket = new SocketClient(BASE_API, "/auth");
export const createNotiSocket = () => new SocketClient(BASE_API, "/noti");
export const createChatSocket = () => new SocketClient(BASE_API, "/chat");
export const createPatientProfileSocket = () => new SocketClient(BASE_API, "/patient-profile");
export const createAppointmentSocket = () => new SocketClient(BASE_API, "/appointment");
export const createFetchDataFieldsAppointmentSocket = () => new SocketClient(BASE_API, "/appointment/fields-data");
export const createShiftSocket = () => new SocketClient(BASE_API, "/shift");
export const createPaymentVnPaySocket = () => new SocketClient(BASE_API, "/payment/vnpay");
