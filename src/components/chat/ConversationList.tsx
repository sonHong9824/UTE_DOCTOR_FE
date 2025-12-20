"use client";

import { listConversations } from '@/apis/chat/chat.api';
import { useEffect, useState } from 'react';

interface Participant {
  accountId: string;
  email?: string;
  role: string;
  displayName: string;
  avatarUrl?: string;
}

interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  participants: Participant[];
  title?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  updatedAt: string;
}

interface ConversationListProps {
  currentUserId: string;
  onSelectConversation: (conversationId: string, receiver: { name: string; avatarUrl?: string }) => void;
}

export default function ConversationList({ currentUserId, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const loadConversations = async (reset = false) => {
    const currentSkip = reset ? 0 : skip;
    setLoading(true);
    try {
      const res = await listConversations(currentUserId, currentSkip, limit);
      const newData = res?.data?.data || [];
      const total = res?.data?.total || 0;
      
      if (reset) {
        setConversations(newData);
        setSkip(limit);
      } else {
        setConversations((prev) => [...prev, ...newData]);
        setSkip((prev) => prev + limit);
      }
      
      setHasMore(currentSkip + newData.length < total);
    } catch (err) {
      console.error('[ConversationList] Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) loadConversations(true);
  }, [currentUserId]);

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  const getReceiver = (conv: Conversation) => {
    const receiver = conv.participants.find(p => p.accountId !== currentUserId);
    return receiver || conv.participants[0];
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
        {loading && conversations.length === 0 && (
          <div className="text-center py-8 text-gray-500">Loading conversations...</div>
        )}
        
        {!loading && conversations.length === 0 && (
          <div className="text-center py-8 text-gray-400">No conversations yet</div>
        )}
        
        {conversations.map((conv) => {
          const receiver = getReceiver(conv);
          const isUnread = false; // TODO: implement unread logic
          
          return (
            <button
              key={conv._id}
              onClick={() => onSelectConversation(conv._id, { name: receiver.displayName, avatarUrl: receiver.avatarUrl })}
              className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b transition-colors"
            >
              {/* Avatar */}
              {receiver.avatarUrl ? (
                <img src={receiver.avatarUrl} alt={receiver.displayName} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {getInitials(receiver.displayName)}
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className={`font-medium truncate ${isUnread ? 'text-blue-600' : ''}`}>
                    {conv.title || receiver.displayName}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTime(conv.updatedAt)}
                  </span>
                </div>
                
                {conv.lastMessage && (
                  <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                    {conv.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                    {conv.lastMessage.content}
                  </p>
                )}
              </div>
              
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
              )}
            </button>
          );
        })}
        
        {hasMore && (
          <button
            onClick={() => loadConversations(false)}
            disabled={loading}
            className="w-full p-4 text-sm text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        )}
    </div>
  );
}
