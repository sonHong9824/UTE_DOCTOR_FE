"use client";

import { getMessages, markRead } from "@/apis/chat/chat.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatSocket } from "@/contexts/ChatSocketContext";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import type { ChatMessage, ChatReceiverInfo } from "@/features/chat/types/chat.types";
import {
  getMessageDedupeKey,
  mergeChatMessages,
  normalizeChatMessage,
  normalizeChatMessages,
} from "@/features/chat/utils/chat-message.util";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ChatWindowProps {
  conversationId: string;
  currentUser: { accountId: string; email?: string };
  onBack?: () => void;
  title?: string;
  receiver?: ChatReceiverInfo;
  showBack?: boolean;
}

type ChatMessageResponse = {
  code?: number | string;
  data?: unknown;
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase() || "U";
};

const formatMessageDate = (date: string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatMessageTime = (date: string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const getSenderLabel = (message: ChatMessage, receiver?: ChatReceiverInfo) => {
  if (message.isMine) return "Bạn";
  return message.senderName || receiver?.name || message.senderEmail || "Người dùng";
};

export default function ChatWindow({
  conversationId,
  currentUser,
  onBack,
  title,
  receiver,
  showBack = false,
}: ChatWindowProps) {
  const router = useRouter();
  const chatSocket = useChatSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadRequestRef = useRef(0);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
      return;
    }
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 120;
  }, []);

  const loadInitialMessages = useCallback(async () => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const res = await getMessages(conversationId, undefined, 20);
      if (loadRequestRef.current !== requestId) return;
      const data = Array.isArray(res?.data) ? res.data : [];
      setMessages(normalizeChatMessages(data, currentUser.accountId, conversationId));
      setTimeout(() => scrollToBottom(false), 0);
    } catch {
      if (loadRequestRef.current !== requestId) return;
      setError("Không thể tải tin nhắn. Vui lòng thử lại.");
    } finally {
      if (loadRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [conversationId, currentUser.accountId, scrollToBottom]);

  const loadOlderMessages = useCallback(async () => {
    if (messages.length === 0 || loadingMore) return;
    const oldestMessage = messages[0];
    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;

    setLoadingMore(true);
    try {
      const res = await getMessages(conversationId, oldestMessage.createdAt, 20);
      const data = Array.isArray(res?.data) ? res.data : [];
      const olderMessages = normalizeChatMessages(data, currentUser.accountId, conversationId);

      if (olderMessages.length > 0) {
        setMessages((prev) => mergeChatMessages(prev, olderMessages));
        window.requestAnimationFrame(() => {
          if (!container) return;
          container.scrollTop = container.scrollHeight - previousScrollHeight;
        });
      }
    } catch {
      // Older-message pagination failure should not replace the current conversation view.
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, currentUser.accountId, loadingMore, messages]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop <= 8) {
      void loadOlderMessages();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  useEffect(() => {
    let mounted = true;
    setMessages([]);

    void loadInitialMessages();

    const handleConnect = () => {
      void chatSocket.joinConversation(conversationId);
    };

    const handleMessageReceived = (payload: ChatMessageResponse) => {
      const rawMessage = payload?.data;
      const message = normalizeChatMessage(rawMessage, currentUser.accountId, conversationId);
      if (message.conversationId !== conversationId || !mounted) return;

      setMessages((prev) => mergeChatMessages(prev, [message]));
      void markRead(conversationId).catch(() => {});
    };

    chatSocket.onConnect(handleConnect);
    chatSocket.connect();
    if (chatSocket.isConnected()) {
      void chatSocket.joinConversation(conversationId);
    }

    chatSocket.on<ChatMessageResponse>(SocketEventsEnum.CHAT_MESSAGE_RECEIVED, handleMessageReceived);
    void markRead(conversationId).catch(() => {});

    return () => {
      mounted = false;
      void chatSocket.leaveConversation(conversationId);
      chatSocket.offConnect(handleConnect);
      chatSocket.off(
        SocketEventsEnum.CHAT_MESSAGE_RECEIVED,
        handleMessageReceived as (...args: unknown[]) => void
      );
    };
  }, [chatSocket, conversationId, currentUser.accountId, loadInitialMessages]);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.isMine || isNearBottom()) {
      scrollToBottom(true);
    }
  }, [isNearBottom, messages, scrollToBottom]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content) return;

    chatSocket.emit(SocketEventsEnum.CHAT_MESSAGE_SEND, {
      conversationId,
      content,
      clientMessageId: `${currentUser.accountId || "user"}-${Date.now()}`,
    });
    setInput("");
  };

  const groupedMessages = useMemo(() => {
    return messages.reduce<Record<string, ChatMessage[]>>((groups, message) => {
      const dateKey = formatMessageDate(message.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(message);
      return groups;
    }, {});
  }, [messages]);

  const dateGroups = Object.entries(groupedMessages);
  const headerName = receiver?.name || title || "Chat";
  const canSend = input.trim().length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Quay lại">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <Avatar className="h-10 w-10">
          {receiver?.avatarUrl && <AvatarImage src={receiver.avatarUrl} alt={headerName} />}
          <AvatarFallback className="bg-blue-50 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
            {getInitials(headerName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-950 dark:text-gray-50">{headerName}</div>
          <div className="text-xs text-gray-500">{chatSocket.connected ? "Đang hoạt động" : "Đang kết nối..."}</div>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-gray-50 px-3 py-4 dark:bg-gray-900/40 sm:px-4"
      >
        {loadingMore && (
          <div className="mb-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Đang tải tin nhắn cũ...
          </div>
        )}

        {loading && (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-sm text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            Đang tải tin nhắn...
          </div>
        )}

        {!loading && error && (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-center text-sm text-gray-600 dark:text-gray-300">
            <AlertCircle className="h-7 w-7 text-red-500" />
            <div>{error}</div>
            <Button variant="outline" size="sm" onClick={() => void loadInitialMessages()}>
              Thử lại
            </Button>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
            <div className="mb-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
              Chưa có tin nhắn
            </div>
            <p className="max-w-[260px] text-sm text-gray-500">
              Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          dateGroups.map(([dateKey, groupMessages]) => (
            <div key={dateKey} className="space-y-3">
              <div className="sticky top-0 z-10 my-3 flex justify-center">
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-gray-500 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                  {dateKey}
                </span>
              </div>

              {groupMessages.map((message) => {
                const senderLabel = getSenderLabel(message, receiver);
                const avatarName = message.isMine ? "Bạn" : senderLabel;
                const avatarUrl = message.isMine ? undefined : message.senderAvatarUrl || receiver?.avatarUrl;

                return (
                  <div
                    key={getMessageDedupeKey(message)}
                    className={cn("flex items-end gap-2", message.isMine ? "justify-end" : "justify-start")}
                  >
                    {!message.isMine && (
                      <Avatar className="h-8 w-8">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt={avatarName} />}
                        <AvatarFallback className="bg-gray-200 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          {getInitials(avatarName)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={cn("max-w-[78%] sm:max-w-[70%]", message.isMine && "items-end")}>
                      {!message.isMine && (
                        <div className="mb-1 px-1 text-xs font-medium text-gray-500">{senderLabel}</div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                          message.isMine
                            ? "rounded-br-md bg-blue-600 text-white"
                            : "rounded-bl-md bg-white text-gray-900 ring-1 ring-gray-200 dark:bg-gray-950 dark:text-gray-100 dark:ring-gray-800"
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words">{message.content || "(Không có nội dung)"}</div>
                        <div
                          className={cn(
                            "mt-1 text-right text-[11px]",
                            message.isMine ? "text-blue-100" : "text-gray-400"
                          )}
                        >
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            className="h-11 rounded-full bg-gray-50 px-4 dark:bg-gray-900"
            placeholder="Nhập tin nhắn..."
          />
          <Button
            onClick={sendMessage}
            disabled={!canSend}
            size="icon"
            className="h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700"
            aria-label="Gửi tin nhắn"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
