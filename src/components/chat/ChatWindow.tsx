"use client";

import { getMessages, markRead } from '@/apis/chat/chat.api';
import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { createChatSocket } from '@/services/socket/socket-client';
import { useEffect, useRef, useState } from 'react';

interface ChatWindowProps {
  conversationId: string;
  currentUser: { accountId: string; email?: string };
}

export default function ChatWindow({ conversationId, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<ReturnType<typeof createChatSocket> | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMessages(conversationId, undefined, 20).then((res) => {
      if (!mounted) return;
      const data = res?.data || [];
      setMessages(data.reverse()); // chronological
      setLoading(false);
    }).catch(() => setLoading(false));

    const s = createChatSocket();
    socketRef.current = s;

    // join conversation room
    s.emitSafe(SocketEventsEnum.CHAT_JOIN_CONVERSATION, { conversationId });

    // receive new messages
    s.on<{ code: number; data: any }>(SocketEventsEnum.CHAT_MESSAGE_RECEIVED, (payload) => {
      if (payload?.data?.conversationId === conversationId) {
        setMessages((prev) => {
          const newMsg = payload.data;
          const msgId = newMsg._id || newMsg.clientMessageId;
          // Check if message already exists
          const exists = prev.some(m => (m._id || m.clientMessageId) === msgId);
          if (exists) {
            console.log('[ChatWindow] Duplicate message ignored:', msgId);
            return prev;
          }
          return [...prev, newMsg];
        });
      }
    });

    // mark read on load
    markRead(conversationId, currentUser.accountId).catch(() => {});

    return () => {
      s.emit(SocketEventsEnum.CHAT_LEAVE_CONVERSATION, { conversationId });
      s.disconnect();
      mounted = false;
    };
  }, [conversationId]);

  const sendMessage = () => {
    const s = socketRef.current;
    if (!s || !input.trim()) return;
    const msg = input.trim();
    s.emit(SocketEventsEnum.CHAT_MESSAGE_SEND, {
      conversationId,
      senderId: currentUser.accountId,
      senderEmail: currentUser.email,
      content: msg,
      clientMessageId: `${currentUser.accountId}-${Date.now()}`,
    });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full border rounded-md">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {!loading && messages.map((m) => (
          <div key={m._id || m.clientMessageId} className={`max-w-[70%] p-2 rounded-md ${m.senderId === currentUser.accountId ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-gray-200'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="p-3 flex gap-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message"
        />
        <button onClick={sendMessage} className="px-4 py-2 rounded bg-blue-600 text-white">Send</button>
      </div>
    </div>
  );
}
