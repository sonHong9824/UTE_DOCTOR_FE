"use client";

import { getMessages, markRead } from "@/apis/chat/chat.api";
import { Button } from "@/components/ui/button";
import { useChatSocket } from "@/contexts/ChatSocketContext";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { cn } from "@/lib/utils";
import { ChevronLeft, Loader2, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface ChatWindowProps {
  conversationId: string;
  currentUser: { accountId: string; email?: string };
  onBack?: () => void;
  title?: string;
  receiver?: { name: string; avatarUrl?: string };
  showBack?: boolean;
}

interface ChatMessage {
  _id?: string;
  clientMessageId?: string;
  conversationId?: string;
  senderId?: string;
  senderEmail?: string;
  content: string;
  createdAt?: string;
  at?: string;
}

type ChatMessageResponse = {
  code?: number;
  data?: ChatMessage;
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const getMessageTimestamp = (message: ChatMessage) => message.createdAt || message.at || new Date().toISOString();

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
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
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    } else if (messagesContainerRef.current) {
      const c = messagesContainerRef.current;
      c.scrollTop = c.scrollHeight;
    }
  };

  const handleBack = () => {
    if (onBack) return onBack();
    router.back();
  };

  const handleScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    if (container.scrollTop !== 0 || messages.length === 0 || loadingMore) {
      return;
    }

    const oldestMessage = messages[0];
    setLoadingMore(true);
    try {
      const res = await getMessages(conversationId, getMessageTimestamp(oldestMessage), 20);
      const newMessages: ChatMessage[] = res?.data || [];
      if (newMessages.length > 0) {
        setMessages((prev) => [...newMessages.reverse(), ...prev]);
      }
    } catch (err) {
      console.error("[ChatWindow] Error loading older messages:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getMessages(conversationId, undefined, 20)
      .then((res) => {
        if (!mounted) return;
        const data: ChatMessage[] = res?.data || [];
        setMessages(data.reverse());
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 0);
      })
      .catch((err) => {
        console.error("[ChatWindow] Error loading messages:", err);
        setLoading(false);
      });

    void chatSocket.emitSafe(SocketEventsEnum.CHAT_JOIN_CONVERSATION, { conversationId });

    const handleMessage = (payload: ChatMessageResponse) => {
      if (payload?.data?.conversationId !== conversationId) return;

      setMessages((prev) => {
        const newMsg = payload.data;
        if (!newMsg) return prev;
        const msgId = newMsg._id || newMsg.clientMessageId;
        const exists = msgId ? prev.some((message) => (message._id || message.clientMessageId) === msgId) : false;
        if (exists) return prev;
        return [...prev, newMsg];
      });
    };

    chatSocket.on(SocketEventsEnum.CHAT_MESSAGE_RECEIVED, handleMessage);
    markRead(conversationId).catch(() => {});

    return () => {
      chatSocket.emit(SocketEventsEnum.CHAT_LEAVE_CONVERSATION, { conversationId });
      chatSocket.off(
        SocketEventsEnum.CHAT_MESSAGE_RECEIVED,
        handleMessage as (...args: unknown[]) => void
      );
      mounted = false;
    };
  }, [conversationId, chatSocket]);

  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;
    const container = messagesContainerRef.current;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    const last = messages[messages.length - 1];
    if (!last) return;

    if (last.senderId === currentUser.accountId || nearBottom) {
      scrollToBottom(true);
    }
  }, [messages, currentUser.accountId]);

  useEffect(() => {
    return () => {
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    chatSocket.emit(SocketEventsEnum.CHAT_MESSAGE_SEND, {
      conversationId,
      content,
      clientMessageId: `${currentUser.accountId}-${Date.now()}`,
    });
    setInput("");

    sendTimerRef.current = setTimeout(() => {
      setSending(false);
    }, 300);
  };

  const dateGroups = useMemo(() => {
    const grouped: Record<string, ChatMessage[]> = {};
    messages.forEach((message) => {
      const dateKey = formatDate(getMessageTimestamp(message));
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(message);
    });
    return Object.entries(grouped);
  }, [messages]);

  const canSend = input.trim().length > 0 && !sending;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-slate-950">
      <div className="flex flex-none items-center gap-3 border-b border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        {showBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-9 w-9 rounded-full"
            aria-label="Back to conversations"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : null}
        <div className="flex min-w-0 items-center gap-2">
          {receiver?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={receiver.avatarUrl} alt={receiver.name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {getInitials(receiver?.name || title)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
              {receiver?.name || title || "Chat"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {chatSocket.connected ? "Connected" : "Connecting when needed"}
            </p>
          </div>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/40 p-4 visible-scrollbar dark:bg-slate-950"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loadingMore ? (
          <div className="flex justify-center py-1 text-xs text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading older messages
          </div>
        ) : null}

        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading messages
          </div>
        ) : null}

        {!loading && messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              No messages yet
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Send the first message to start this conversation.
            </p>
          </div>
        ) : null}

        {!loading &&
          dateGroups.map(([dateKey, group]) => (
            <div key={dateKey} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  {dateKey}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              {group.map((message) => {
                const mine = message.senderId === currentUser.accountId;
                const timestamp = getMessageTimestamp(message);

                return (
                  <div
                    key={message._id || message.clientMessageId || `${message.senderId}-${timestamp}`}
                    className={cn("flex", mine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm",
                        mine
                          ? "rounded-br-md bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          mine ? "text-white/65 dark:text-slate-500" : "text-slate-400"
                        )}
                      >
                        {new Date(timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-none gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-600 dark:focus:ring-slate-800"
          placeholder="Type a message"
          disabled={sending}
        />
        <Button
          type="button"
          onClick={sendMessage}
          disabled={!canSend}
          size="icon"
          className="h-10 w-10 rounded-full"
          aria-label="Send message"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
