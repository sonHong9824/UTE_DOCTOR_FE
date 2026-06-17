"use client";

import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { createChatSocket } from '@/services/socket/socket-client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Bounded queue item with timestamp for expiry
interface QueueItem {
  event: SocketEventsEnum;
  data: unknown;
  timestamp: number;
}

interface ChatSocketContextValue {
  connected: boolean;
  connecting: boolean;
  queueSize: number;
  emit: (event: SocketEventsEnum, data: unknown) => void;
  emitSafe: (event: SocketEventsEnum, data: unknown) => Promise<boolean>;
  on: <T = any>(event: SocketEventsEnum, cb: (payload: T) => void) => void;
  off: (event: SocketEventsEnum, cb?: (...args: unknown[]) => void) => void;
  onConnect: (cb: () => void) => void;
  offConnect: (cb: () => void) => void;
  isConnected: () => boolean;
  connect: () => boolean;
  reconnect: () => void;
  disconnect: () => void;
  joinUser: () => Promise<boolean>;
  leaveUser: () => Promise<boolean>;
  joinConversation: (conversationId: string) => Promise<boolean>;
  leaveConversation: (conversationId: string) => Promise<boolean>;
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

    console.log('[ChatSocketProvider] Creating new chat socket...');
    setConnecting(true);
    const s = createChatSocket();
    socketRef.current = s;

    // Lifecycle
    const onConnect = () => {
      console.log('[ChatSocketProvider] Socket connected!');
      setConnected(true);
      setConnecting(false);
      flushQueue();
    };

    const onDisconnect = (reason: unknown) => {
      console.log('[ChatSocketProvider] Socket disconnected, reason:', reason);
      setConnected(false);
      setConnecting(false);
    };

    s.onConnect(onConnect);
    s.onDisconnect(onDisconnect);

    return s;
  }, [flushQueue]);

  useEffect(() => {
    console.log('[ChatSocketProvider] Mount effect running');
    
    // Autoconnect when provider mounts and token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    console.log('[ChatSocketProvider] Token exists:', !!token, 'length:', token?.length || 0);
    
    if (token) {
      console.log('[ChatSocketProvider] Auto-connecting on mount...');
      ensureSocket().connect();
    }

    // Listen for login event to connect socket immediately after login
    const onLogin = () => {
      console.log('[ChatSocketProvider] user-logged-in → connect socket');
      ensureSocket().connect();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('user-logged-in', onLogin);
    }

    // Cleanup on unmount
    return () => {
      console.log('[ChatSocketProvider] Component unmounting');
      if (typeof window !== 'undefined') {
        window.removeEventListener('user-logged-in', onLogin);
      }
      
      const s = socketRef.current;
      if (!s) return;
      s.disconnect();
      socketRef.current = null;
      queueRef.current = [];
      setConnected(false);
      setConnecting(false);
    };
  }, []); // Empty deps - only run once on mount

  const emit = useCallback((event: SocketEventsEnum, data: unknown) => {
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

  const emitSafe = useCallback(async (event: SocketEventsEnum, data: unknown) => {
    const s = ensureSocket();
    return await s.emitSafe(event, data);
  }, [ensureSocket]);

  const value: ChatSocketContextValue = useMemo(() => ({
    connected,
    connecting,
      queueSize: queueRef.current.length,
      emit,
      emitSafe,
      on: (event, cb) => ensureSocket().on(event, cb),
      off: (event, cb) => ensureSocket().off(event, cb),
      onConnect: (cb) => ensureSocket().onConnect(cb),
      offConnect: (cb) => ensureSocket().offConnect(cb),
      isConnected: () => ensureSocket().isConnected(),
      connect: () => ensureSocket().connect(),
      reconnect: () => ensureSocket().reconnect(),
    disconnect: () => {
      const s = socketRef.current;
      if (!s) return;
      s.disconnect();
      setConnected(false);
    },
      joinUser: () => ensureSocket().joinUser(),
      leaveUser: () => ensureSocket().leaveUser(),
      joinConversation: (conversationId) => ensureSocket().joinConversation(conversationId),
      leaveConversation: (conversationId) => ensureSocket().leaveConversation(conversationId),
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
