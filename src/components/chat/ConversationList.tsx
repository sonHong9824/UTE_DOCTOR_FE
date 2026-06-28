"use client";

import { listConversations } from "@/apis/chat/chat.api";
import { cn } from "@/lib/utils";
import { Inbox, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Participant {
  accountId: string;
  email?: string;
  role: string;
  displayName: string;
  avatarUrl?: string;
}

interface Conversation {
  _id: string;
  type: "direct" | "group";
  participants: Participant[];
  title?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt?: string;
    at?: string;
  };
  updatedAt: string;
}

interface ConversationListProps {
  currentUserId: string;
  onSelectConversation: (conversationId: string, receiver: { name: string; avatarUrl?: string }) => void;
}

const limit = 20;

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const formatTime = (date: string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "--";

  const now = new Date();
  const isSameDay = d.toDateString() === now.toDateString();
  if (isSameDay) {
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
};

export default function ConversationList({ currentUserId, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);

  const loadConversations = useCallback(
    async (offset: number, reset = false) => {
      setLoading(true);
      try {
        const res = await listConversations(offset, limit);
        const newData: Conversation[] = res?.data?.data || [];
        const total = res?.data?.total || 0;

        if (reset) {
          setConversations(newData);
          setSkip(offset + limit);
        } else {
          setConversations((prev) => [...prev, ...newData]);
          setSkip(offset + limit);
        }

        setHasMore(offset + newData.length < total);
      } catch (err) {
        console.error("[ConversationList] Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (currentUserId) void loadConversations(0, true);
  }, [currentUserId, loadConversations]);

  const getReceiver = (conv: Conversation) => {
    const receiver = conv.participants.find((participant) => participant.accountId !== currentUserId);
    return receiver || conv.participants[0];
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-white p-2 visible-scrollbar dark:bg-slate-950">
      {loading && conversations.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading conversations
        </div>
      ) : null}

      {!loading && conversations.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            No conversations yet
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Start a new chat to contact another user.
          </p>
        </div>
      ) : null}

      {conversations.map((conv) => {
        const receiver = getReceiver(conv);
        const latestTimestamp = conv.lastMessage?.at || conv.lastMessage?.createdAt || conv.updatedAt;
        const receiverName = receiver?.displayName || receiver?.email || "User";
        const isOwnLastMessage = conv.lastMessage?.senderId === currentUserId;

        return (
          <button
            key={conv._id}
            type="button"
            onClick={() => onSelectConversation(conv._id, { name: receiverName, avatarUrl: receiver?.avatarUrl })}
            className="flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            {receiver?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={receiver.avatarUrl} alt={receiverName} className="h-11 w-11 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {getInitials(receiverName)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {conv.title || receiverName}
                </span>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {formatTime(latestTimestamp)}
                </span>
              </div>

              <p
                className={cn(
                  "mt-1 truncate text-xs",
                  conv.lastMessage ? "text-slate-500 dark:text-slate-400" : "text-slate-400"
                )}
              >
                {conv.lastMessage
                  ? `${isOwnLastMessage ? "You: " : ""}${conv.lastMessage.content}`
                  : "No messages yet"}
              </p>
            </div>
          </button>
        );
      })}

      {hasMore ? (
        <button
          type="button"
          onClick={() => void loadConversations(skip, false)}
          disabled={loading}
          className="mt-2 rounded-xl p-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      ) : null}
    </div>
  );
}
