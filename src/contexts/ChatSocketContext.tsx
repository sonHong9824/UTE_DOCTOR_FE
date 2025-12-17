"use client";

import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { createChatSocket } from '@/services/socket/socket-client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Bounded queue item with timestamp for expiry
interface QueueItem {
  event: SocketEventsEnum;
  data: any;
  timestamp: number;
}

interface ChatSocketContextValue {
  connected: boolean;
  connecting: boolean;
  queueSize: number;
  emit: (event: SocketEventsEnum, data: any) => void;
  emitSafe: (event: SocketEventsEnum, data: any) => Promise<void>;
  on: <T = any>(event: SocketEventsEnum, cb: (payload: T) => void) => void;
  off: (event: SocketEventsEnum, cb?: (...args: any[]) => void) => void;
  reconnect: () => void;
  disconnect: () => void;
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<ReturnType<typeof createChatSocket> | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const queueRef = useRef<QueueItem[]>([]);
  const MAX_QUEUE = 100;
  const QUEUE_EXPIRE_MS = 5 * 60 * 1000; // 5 minutes

  const flushQueue = useCallback(() => {
    const s = socketRef.current;
    if (!s || !s.isConnected()) return;
    if (queueRef.current.length === 0) return;
    
    // Filter out expired items (> 5 min old)
    const now = Date.now();
    const validItems = queueRef.current.filter(item => now - item.timestamp < QUEUE_EXPIRE_MS);
    const expiredCount = queueRef.current.length - validItems.length;
    
    queueRef.current = [];
    validItems.forEach(({ event, data }) => s.emit(event, data));
    console.log(`[ChatSocketProvider] Flushed ${validItems.length} queued emits (dropped ${expiredCount} expired)`);
    
    if (expiredCount > 0) {
      console.warn(`[ChatSocketProvider] ${expiredCount} messages expired (older than 5 min)`);
    }
  }, []);

  const ensureSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;

    setConnecting(true);
    const s = createChatSocket();
    socketRef.current = s;

    // Lifecycle
    const onConnect = () => {
      setConnected(true);
      setConnecting(false);
      flushQueue();
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    s.onConnect(onConnect);
    s.onDisconnect(onDisconnect);

    // React to HTTP token refresh
    if (typeof window !== 'undefined') {
      const onTokenRefreshed = () => {
        console.log('[ChatSocketProvider] token-refreshed → reconnect');
        s.reconnect();
      };
      window.addEventListener('token-refreshed', onTokenRefreshed);

      const onLogout = () => {
        console.log('[ChatSocketProvider] auth-logout → disconnect & clear queue');
        queueRef.current = [];
        s.disconnect();
      };
      window.addEventListener('auth-logout', onLogout);

      // Cleanup window listeners on unmount
      (socketRef as any).currentCleanup = () => {
        window.removeEventListener('token-refreshed', onTokenRefreshed);
        window.removeEventListener('auth-logout', onLogout);
      };
    }

    return s;
  }, [flushQueue]);

  useEffect(() => {
    // Autoconnect when provider mounts and token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) ensureSocket();

      // Listen for login event to connect socket immediately after login
      const onLogin = () => {
        console.log('[ChatSocketProvider] user-logged-in → connect socket');
        ensureSocket();
      };
      window.addEventListener('user-logged-in', onLogin);

      return () => {
        window.removeEventListener('user-logged-in', onLogin);
      };
    }
    return () => {
      const s = socketRef.current;
      if (!s) return;
      const cleanup = (socketRef as any).currentCleanup;
      if (cleanup) cleanup();
      s.disconnect();
      socketRef.current = null;
      queueRef.current = [];
      setConnected(false);
      setConnecting(false);
    };
  }, [ensureSocket]);

  const emit = useCallback((event: SocketEventsEnum, data: any) => {
    const s = ensureSocket();
    if (s.isConnected()) {
      s.emit(event, data);
      return;
    }
    // enqueue with timestamp
    if (queueRef.current.length >= MAX_QUEUE) {
      // drop oldest
      queueRef.current.shift();
      console.warn('[ChatSocketProvider] Queue full, dropped oldest message');
    }
    queueRef.current.push({ event, data, timestamp: Date.now() });
    console.log('[ChatSocketProvider] Enqueued emit (offline)', event, `queue: ${queueRef.current.length}/${MAX_QUEUE}`);
  }, [ensureSocket]);

  const emitSafe = useCallback(async (event: SocketEventsEnum, data: any) => {
    const s = ensureSocket();
    if (s.isConnected()) {
      s.emit(event, data);
      return;
    }
    // wait until connect then emit
    await new Promise<void>((resolve) => {
      s.onConnect(() => resolve());
    });
    s.emit(event, data);
  }, [ensureSocket]);

  const value: ChatSocketContextValue = useMemo(() => ({
    connected,
    connecting,
    queueSize: queueRef.current.length,
    emit,
    emitSafe,
    on: (event, cb) => ensureSocket().on(event, cb),
    off: (event, cb) => ensureSocket().off(event, cb),
    reconnect: () => ensureSocket().reconnect(),
    disconnect: () => {
      const s = socketRef.current;
      if (!s) return;
      s.disconnect();
      setConnected(false);
    },
  }), [connected, connecting, emit, emitSafe, ensureSocket]);

  return (
    <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>
  );
}

export function useChatSocket(): ChatSocketContextValue {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) throw new Error('useChatSocket must be used within ChatSocketProvider');
  return ctx;
}
