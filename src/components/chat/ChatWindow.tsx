"use client";

import { getMessages, markRead } from '@/apis/chat/chat.api';
import { useChatSocket } from '@/contexts/ChatSocketContext';
import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface ChatWindowProps {
  conversationId: string;
  currentUser: { accountId: string; email?: string };
  onBack?: () => void;
  title?: string;
  receiver?: { name: string; avatarUrl?: string };
  showBack?: boolean;
}

export default function ChatWindow({ conversationId, currentUser, onBack, title, receiver, showBack = false }: ChatWindowProps) {
  const router = useRouter();
  const chatSocket = useChatSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // using shared chat socket via context
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    } else if (messagesContainerRef.current) {
      const c = messagesContainerRef.current;
      c.scrollTop = c.scrollHeight;
    }
  };

  const handleBack = () => {
    if (onBack) return onBack();
    router.back();
  };

  // Load more messages when scrolling up
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop === 0 && messages.length > 0 && !loadingMore) {
      const oldestMessage = messages[0];
      console.log('[ChatWindow] Loading older messages before:', oldestMessage.createdAt);
      setLoadingMore(true);
      try {
        const res = await getMessages(conversationId, oldestMessage.createdAt, 20);
        const newMessages = res?.data || [];
        if (newMessages.length > 0) {
          const olderReversed = newMessages.reverse();
          setMessages((prev) => [...olderReversed, ...prev]);
          console.log('[ChatWindow] Loaded', newMessages.length, 'older messages');
        }
      } catch (err) {
        console.error('[ChatWindow] Error loading older messages:', err);
      }
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    console.log('[ChatWindow] Loading messages for conversation:', conversationId);
    
    getMessages(conversationId, undefined, 20)
      .then((res) => {
        if (!mounted) return;
        console.log('[ChatWindow] API response:', res);
        const data = res?.data || [];
        console.log('[ChatWindow] Messages loaded count:', data.length);
        console.log('[ChatWindow] Messages data:', data);
        setMessages(data.reverse()); // chronological (oldest first)
        setLoading(false);
        // Scroll to bottom after initial load
        setTimeout(() => scrollToBottom(false), 0);
      })
      .catch((err) => {
        console.error('[ChatWindow] Error loading messages:', err);
        setLoading(false);
      });

    // socket managed by ChatSocketProvider

    // join conversation room
    chatSocket.emitSafe(SocketEventsEnum.CHAT_JOIN_CONVERSATION, { conversationId });

    // receive new messages
    chatSocket.on<{ code: number; data: any }>(SocketEventsEnum.CHAT_MESSAGE_RECEIVED, (payload) => {
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
      chatSocket.emit(SocketEventsEnum.CHAT_LEAVE_CONVERSATION, { conversationId });
      chatSocket.off(SocketEventsEnum.CHAT_MESSAGE_RECEIVED);
      mounted = false;
    };
  }, [conversationId, chatSocket]);

  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;
    const c = messagesContainerRef.current;
    const nearBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 120;
    const last = messages[messages.length - 1];
    if (!last) return;
    // Auto-scroll on new own message, or when user is near bottom
    if (last.senderId === currentUser.accountId || nearBottom) {
      scrollToBottom(true);
    }
  }, [messages, currentUser.accountId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    chatSocket.emit(SocketEventsEnum.CHAT_MESSAGE_SEND, {
      conversationId,
      senderId: currentUser.accountId,
      senderEmail: currentUser.email,
      content: msg,
      clientMessageId: `${currentUser.accountId}-${Date.now()}`,
    });
    setInput('');
  };

  // Group messages by date
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  };

  const groupedMessages: { [key: string]: any[] } = {};
  messages.forEach((msg) => {
    const dateKey = formatDate(msg.createdAt);
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(msg);
  });

  const dateGroups = Object.entries(groupedMessages);

  return (
    <div className="flex flex-col h-full border rounded-md">
      <div className="flex items-center gap-3 p-3 border-b">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Back"
          >
            {/* Chevron Left Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L9.06 12l6.72 6.72a.75.75 0 11-1.06 1.06l-7.25-7.25a.75.75 0 010-1.06l7.25-7.25a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          {receiver?.avatarUrl ? (
            <img src={receiver.avatarUrl} alt={receiver.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
              {getInitials(receiver?.name)}
            </div>
          )}
          <div className="font-medium truncate">{receiver?.name || title || 'Chat'}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3" ref={messagesContainerRef} onScroll={handleScroll}>
        {loadingMore && <div className="text-sm text-gray-500 text-center py-2">Loading older messages...</div>}
        {loading && <div className="text-sm text-gray-500 text-center py-4">Loading messages...</div>}
        {!loading && messages.length === 0 && <div className="text-sm text-gray-400 text-center py-4">No messages yet</div>}
        {!loading && dateGroups.map(([dateKey, msgs]) => (
          <div key={dateKey}>
            {/* Date separator */}
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-xs text-gray-500 px-2">{dateKey}</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            {/* Messages for this date */}
            <div className="space-y-2">
              {msgs.map((m) => (
                <div
                  key={m._id || m.clientMessageId}
                  className={`flex ${m.senderId === currentUser.accountId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-2 rounded-md text-sm ${m.senderId === currentUser.accountId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    <div>{m.content}</div>
                    <div className={`text-xs mt-1 ${m.senderId === currentUser.accountId ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
