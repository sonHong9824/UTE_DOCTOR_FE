"use client";

import { listConversations } from "@/apis/chat/chat.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChatParticipant } from "@/features/chat/types/chat.types";
import { getOtherParticipant, normalizeId } from "@/features/chat/utils/chat-message.util";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Conversation {
  _id: string;
  type: "direct" | "group";
  participants: ChatParticipant[];
  title?: string;
  lastMessage?: {
    content: string;
    senderId: string | number;
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

const formatTime = (date: string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const isSameDay = d.toDateString() === now.toDateString();
  if (isSameDay) {
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";

  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase() || "U";
};

export default function ConversationList({ currentUserId, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const skipRef = useRef(0);

  const loadConversations = useCallback(
    async (reset = false) => {
      const currentSkip = reset ? 0 : skipRef.current;
      setLoading(true);
      setError(null);
      try {
        const res = await listConversations(currentSkip, limit);
        const newData = Array.isArray(res?.data?.data) ? res.data.data : [];
        const total = Number(res?.data?.total || 0);

        if (reset) {
          setConversations(newData);
          skipRef.current = limit;
        } else {
          setConversations((prev) => [...prev, ...newData]);
          skipRef.current = currentSkip + limit;
        }

        setHasMore(currentSkip + newData.length < total);
      } catch {
        setError("Không thể tải danh sách trò chuyện.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (currentUserId) void loadConversations(true);
  }, [currentUserId, loadConversations]);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        Đang tải cuộc trò chuyện...
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-sm text-gray-600 dark:text-gray-300">
        <AlertCircle className="h-7 w-7 text-red-500" />
        <div>{error}</div>
        <Button variant="outline" size="sm" onClick={() => void loadConversations(true)}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {!loading && conversations.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
            Chưa có cuộc trò chuyện
          </div>
          <p className="text-sm text-gray-500">Tìm liên hệ để bắt đầu nhắn tin.</p>
        </div>
      )}

      {conversations.map((conversation) => {
        const receiver = getOtherParticipant(conversation.participants, currentUserId);
        const receiverName = receiver?.displayName || receiver?.email || conversation.title || "Người dùng";
        const latestTimestamp = conversation.lastMessage?.at || conversation.lastMessage?.createdAt || conversation.updatedAt;
        const isMine = normalizeId(conversation.lastMessage?.senderId) === normalizeId(currentUserId);

        return (
          <button
            key={conversation._id}
            onClick={() =>
              onSelectConversation(conversation._id, {
                name: receiverName,
                avatarUrl: receiver?.avatarUrl || undefined,
              })
            }
            className="flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-gray-900"
          >
            <Avatar className="h-11 w-11">
              {receiver?.avatarUrl && <AvatarImage src={receiver.avatarUrl} alt={receiverName} />}
              <AvatarFallback className="bg-gray-200 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {getInitials(receiverName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-gray-950 dark:text-gray-50">
                  {conversation.title || receiverName}
                </span>
                <span className="shrink-0 text-xs text-gray-500">{formatTime(latestTimestamp)}</span>
              </div>

              {conversation.lastMessage ? (
                <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                  {isMine ? "Bạn: " : ""}
                  {conversation.lastMessage.content || "(Không có nội dung)"}
                </p>
              ) : (
                <p className="truncate text-sm text-gray-400">Chưa có tin nhắn</p>
              )}
            </div>
          </button>
        );
      })}

      {hasMore && (
        <button
          onClick={() => void loadConversations(false)}
          disabled={loading}
          className="w-full p-4 text-sm font-medium text-blue-600 transition hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-900"
        >
          {loading ? "Đang tải..." : "Tải thêm"}
        </button>
      )}
    </div>
  );
}
