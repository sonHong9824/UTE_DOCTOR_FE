"use client";

import { createConversation, searchContacts } from '@/apis/chat/chat.api';
import { useChatSocket } from '@/contexts/ChatSocketContext';
import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { useEffect, useMemo, useState } from 'react';
import ChatWindow from './ChatWindow';
import ConversationList from './ConversationList';

interface ChatBubbleProps {
  defaultTitle?: string;
  // Optional: if known ahead, pass participants
  defaultParticipants?: { accountId: string; email?: string; role: string }[];
}

export default function ChatBubble({ defaultTitle, defaultParticipants }: ChatBubbleProps) {
  const chatSocket = useChatSocket();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [receiverInfo, setReceiverInfo] = useState<{ name: string; avatarUrl?: string } | null>(null);
  const [view, setView] = useState<'list' | 'search'>('list'); // Toggle between list and search

  const currentUser = useMemo(() => ({
    accountId: typeof window !== 'undefined' ? (localStorage.getItem('id') || '') : '',
    email: typeof window !== 'undefined' ? (localStorage.getItem('email') || '') : '',
    role: typeof window !== 'undefined' ? (localStorage.getItem('role') || '') : '',
  }), []);

  // Join user room using shared socket
  useEffect(() => {
    if (!currentUser.accountId) return;
    chatSocket.emitSafe(SocketEventsEnum.CHAT_JOIN_USER, { accountId: currentUser.accountId });

    // Listen for incoming messages on user room (from new conversations)
    chatSocket.on<{ code: number; data: any }>(SocketEventsEnum.CHAT_MESSAGE_RECEIVED, (payload) => {
      if (payload?.data?.conversationId) {
        // Auto-open conversation when receiving first message
        if (!conversationId) {
          setConversationId(payload.data.conversationId);
          localStorage.setItem('activeConversationId', payload.data.conversationId);
          setOpen(true);
        }
      }
    });

    return () => {
      if (currentUser.accountId) {
        chatSocket.emit(SocketEventsEnum.CHAT_LEAVE_USER, { accountId: currentUser.accountId });
      }
      chatSocket.off(SocketEventsEnum.CHAT_MESSAGE_RECEIVED);
    };
  }, [currentUser.accountId, conversationId, chatSocket]);

  // Load any persisted conversation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('activeConversationId');
    if (stored) setConversationId(stored);
  }, []);

  const positionClass = 'left-6 bottom-6';

  // Search contacts state
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const runSearch = async () => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await searchContacts(q.trim());
      setResults(res?.data || []);
    } finally {
      setSearching(false);
    }
  };

  const ensureConversation = async () => {
    if (conversationId) return;
    if (!defaultParticipants || defaultParticipants.length < 2) return; // cannot auto-create without counterpart
    const res = await createConversation(defaultParticipants, defaultTitle);
    const id = res?.data?._id || res?.data?.id;
    if (id) {
      setConversationId(id);
      localStorage.setItem('activeConversationId', id);
    }
  };

  const startChatWith = async (target: { accountId: string; email?: string; role?: string; displayName?: string; avatarUrl?: string }) => {
    const participants = [
      { accountId: currentUser.accountId, email: currentUser.email, role: currentUser.role },
      { accountId: target.accountId, email: target.email, role: target.role || '' },
    ];
    const res = await createConversation(participants, undefined);
    const id = res?.data?._id || res?.data?.id;
    if (id) {
      setConversationId(id);
      setReceiverInfo({ name: target.displayName || target.email || 'User', avatarUrl: target.avatarUrl });
      localStorage.setItem('activeConversationId', id);
    }
  };

  const handleSelectConversation = (convId: string, receiver: { name: string; avatarUrl?: string }) => {
    setConversationId(convId);
    setReceiverInfo(receiver);
    localStorage.setItem('activeConversationId', convId);
  };

  return (
    <>
      <button
        className={`fixed ${positionClass} z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700`}
        onClick={async () => { await ensureConversation(); setOpen(!open); }}
        aria-label={open ? 'Đóng chat' : 'Mở chat'}
      >
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div className={`fixed ${positionClass} translate-y-[-80px] z-50 w-[360px] h-[520px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col`}
        >
          {conversationId ? (
            <ChatWindow 
              conversationId={conversationId} 
              currentUser={{ accountId: currentUser.accountId, email: currentUser.email }}
              receiver={receiverInfo || undefined}
              showBack={true}
              onBack={() => { 
                setConversationId(null); 
                setReceiverInfo(null);
                setQ(''); 
                setResults([]);
                setView('list');
              }}
            />
          ) : (
            <div className="h-full flex flex-col">
              {/* Header with tabs */}
              <div className="p-3 border-b">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setView('list')}
                    className={`flex-1 py-2 text-sm font-medium rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setView('search')}
                    className={`flex-1 py-2 text-sm font-medium rounded ${view === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                  >
                    New Chat
                  </button>
                </div>
              </div>

              {/* Content */}
              {view === 'list' ? (
                <ConversationList 
                  currentUserId={currentUser.accountId}
                  onSelectConversation={handleSelectConversation}
                />
              ) : (
                <div className="flex-1 flex flex-col p-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="mb-2 font-medium">Tìm liên hệ (tên hoặc email)</div>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
                      placeholder="Nhập tên/email..."
                      className="flex-1 border rounded px-3 py-2 bg-transparent"
                    />
                    <button onClick={runSearch} className="px-3 py-2 rounded bg-blue-600 text-white">Tìm</button>
                  </div>
                  <div className="flex-1 overflow-y-auto visible-scrollbar">
                    {searching && <div className="text-gray-500">Đang tìm...</div>}
                    {!searching && results.length === 0 && <div className="text-gray-500">Không có kết quả</div>}
                    {!searching && results.map((r) => (
                      <button
                        key={r.accountId}
                        onClick={() => startChatWith(r)}
                        className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                      >
                        {r.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.avatarUrl} alt={r.displayName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{r.displayName}</span>
                          <span className="text-xs text-gray-500">{r.email}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
