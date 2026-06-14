"use client";

import { createConversation, searchContacts } from "@/apis/chat/chat.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatSocket } from "@/contexts/ChatSocketContext";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { normalizeId } from "@/features/chat/utils/chat-message.util";
import { cn } from "@/lib/utils";
import { MessageCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";

interface ChatBubbleProps {
  defaultTitle?: string;
  defaultParticipants?: { accountId: string; email?: string; role: string }[];
}

type SearchContact = {
  accountId: string;
  email?: string;
  role?: string;
  displayName?: string;
  avatarUrl?: string;
};

export default function ChatBubble({ defaultTitle, defaultParticipants }: ChatBubbleProps) {
  const chatSocket = useChatSocket();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [receiverInfo, setReceiverInfo] = useState<{ name: string; avatarUrl?: string } | null>(null);
  const [view, setView] = useState<"list" | "search">("list");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchContact[]>([]);
  const [searching, setSearching] = useState(false);

  const currentUser = useMemo(
    () => ({
      accountId:
        typeof window !== "undefined"
          ? normalizeId(localStorage.getItem("accountId") || localStorage.getItem("id"))
          : "",
      email: typeof window !== "undefined" ? localStorage.getItem("email") || "" : "",
      role: typeof window !== "undefined" ? localStorage.getItem("role") || "" : "",
    }),
    []
  );

  useEffect(() => {
    if (!currentUser.accountId) return;

    const handleConnect = () => {
      void chatSocket.joinUser();
    };

    const handleMessageReceived = (payload: { code: number; data?: { conversationId?: string } }) => {
      const nextConversationId = payload?.data?.conversationId;
      if (!nextConversationId || conversationId) return;

      setConversationId(nextConversationId);
      localStorage.setItem("activeConversationId", nextConversationId);
      setOpen(true);
    };

    chatSocket.onConnect(handleConnect);
    chatSocket.connect();
    if (chatSocket.isConnected()) {
      void chatSocket.joinUser();
    }

    chatSocket.on(SocketEventsEnum.CHAT_MESSAGE_RECEIVED, handleMessageReceived);

    return () => {
      void chatSocket.leaveUser();
      chatSocket.offConnect(handleConnect);
      chatSocket.off(SocketEventsEnum.CHAT_MESSAGE_RECEIVED, handleMessageReceived as (...args: unknown[]) => void);
    };
  }, [chatSocket, conversationId, currentUser.accountId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("activeConversationId");
    if (stored) setConversationId(stored);
  }, []);

  const positionClass = currentUser.role === "DOCTOR" ? "left-6 bottom-6" : "right-6 bottom-6";

  const runSearch = async () => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await searchContacts(q.trim());
      setResults(Array.isArray(res?.data) ? res.data : []);
    } finally {
      setSearching(false);
    }
  };

  const ensureConversation = async () => {
    if (conversationId) return;
    if (!defaultParticipants || defaultParticipants.length < 2) return;

    const participants = defaultParticipants.map((participant) => ({
      ...participant,
      accountId: normalizeId(participant.accountId),
    }));
    const res = await createConversation(participants, defaultTitle);
    const id = res?.data?._id || res?.data?.id;
    if (id) {
      setConversationId(id);
      localStorage.setItem("activeConversationId", id);
    }
  };

  const startChatWith = async (target: SearchContact) => {
    const participants = [
      { accountId: currentUser.accountId, email: currentUser.email, role: currentUser.role },
      { accountId: normalizeId(target.accountId), email: target.email, role: target.role || "" },
    ];
    const res = await createConversation(participants, undefined);
    const id = res?.data?._id || res?.data?.id;
    if (id) {
      setConversationId(id);
      setReceiverInfo({ name: target.displayName || target.email || "Người dùng", avatarUrl: target.avatarUrl });
      localStorage.setItem("activeConversationId", id);
    }
  };

  const handleSelectConversation = (convId: string, receiver: { name: string; avatarUrl?: string }) => {
    setConversationId(convId);
    setReceiverInfo(receiver);
    localStorage.setItem("activeConversationId", convId);
  };

  return (
    <>
      <button
        className={cn(
          "fixed z-50 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700",
          positionClass
        )}
        onClick={async () => {
          await ensureConversation();
          setOpen(!open);
        }}
        aria-label={open ? "Đóng chat" : "Mở chat"}
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        <span className="hidden sm:inline">{open ? "Đóng chat" : "Chat"}</span>
      </button>

      {open && (
        <div
          className={cn(
            "fixed z-50 flex h-[min(560px,calc(100vh-112px))] w-[calc(100vw-32px)] max-w-[380px] translate-y-[-80px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950 sm:w-[380px]",
            positionClass
          )}
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
                localStorage.removeItem("activeConversationId");
                setQ("");
                setResults([]);
                setView("list");
              }}
            />
          ) : (
            <div className="flex h-full flex-col">
              <div className="border-b border-gray-200 p-3 dark:border-gray-800">
                <div className="mb-3 text-sm font-semibold text-gray-950 dark:text-gray-50">Tin nhắn</div>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
                  <button
                    onClick={() => setView("list")}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition",
                      view === "list"
                        ? "bg-white text-blue-700 shadow-sm dark:bg-gray-800 dark:text-blue-200"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    Gần đây
                  </button>
                  <button
                    onClick={() => setView("search")}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition",
                      view === "search"
                        ? "bg-white text-blue-700 shadow-sm dark:bg-gray-800 dark:text-blue-200"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    Chat mới
                  </button>
                </div>
              </div>

              {view === "list" ? (
                <ConversationList currentUserId={currentUser.accountId} onSelectConversation={handleSelectConversation} />
              ) : (
                <div className="flex flex-1 flex-col p-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="mb-2 font-medium">Tìm liên hệ</div>
                  <div className="mb-3 flex gap-2">
                    <Input
                      value={q}
                      onChange={(event) => setQ(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void runSearch();
                      }}
                      placeholder="Nhập tên hoặc email..."
                      className="h-10"
                    />
                    <Button onClick={() => void runSearch()} size="icon" aria-label="Tìm liên hệ">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {searching && <div className="py-8 text-center text-gray-500">Đang tìm...</div>}
                    {!searching && results.length === 0 && (
                      <div className="py-8 text-center text-gray-500">Không có kết quả</div>
                    )}
                    {!searching &&
                      results.map((result) => (
                        <button
                          key={result.accountId}
                          onClick={() => void startChatWith(result)}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-gray-100 dark:hover:bg-gray-900"
                        >
                          {result.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={result.avatarUrl}
                              alt={result.displayName || result.email || "Người dùng"}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-200">
                              {(result.displayName || result.email || "U").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {result.displayName || result.email || "Người dùng"}
                            </div>
                            {result.email && <div className="truncate text-xs text-gray-500">{result.email}</div>}
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
