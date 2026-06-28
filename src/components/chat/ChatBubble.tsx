"use client";

import { createConversation, searchContacts } from "@/apis/chat/chat.api";
import { useChatSocket } from "@/contexts/ChatSocketContext";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { getCurrentAuthIdentity } from "@/features/auth/utils/auth-identity";
import { cn } from "@/lib/utils";
import { Loader2, MessageCircle, Plus, Search, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";

type ChatCurrentUser = {
  accountId: string;
  email?: string;
  role: string;
};

interface ChatBubbleProps {
  active?: boolean;
  currentUser?: ChatCurrentUser;
  defaultTitle?: string;
  defaultParticipants?: { accountId: string; email?: string; role: string }[];
  onOpenRequest?: () => void;
}

type ChatMessagePayload = {
  conversationId?: string;
};

type ContactSearchResult = {
  accountId: string;
  email?: string;
  role?: string;
  displayName?: string;
  avatarUrl?: string;
};

const getInitials = (value?: string) => {
  if (!value) return "U";
  const parts = value.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

export default function ChatBubble({
  active = true,
  currentUser: currentUserProp,
  defaultTitle,
  defaultParticipants,
  onOpenRequest,
}: ChatBubbleProps) {
  const chatSocket = useChatSocket();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [receiverInfo, setReceiverInfo] = useState<{ name: string; avatarUrl?: string } | null>(null);
  const [view, setView] = useState<"list" | "search">("list");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ContactSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const fallbackUser = useMemo<ChatCurrentUser>(() => {
    if (typeof window === "undefined") {
      return { accountId: "", email: "", role: "" };
    }

    const identity = getCurrentAuthIdentity();

    return {
      accountId: identity?.id || localStorage.getItem("id") || "",
      email: identity?.email || localStorage.getItem("email") || "",
      role: identity?.role || (localStorage.getItem("role") || "").toUpperCase(),
    };
  }, []);

  const currentUser = currentUserProp ?? fallbackUser;

  useEffect(() => {
    if (!currentUser.accountId) return;

    void chatSocket.emitSafe(SocketEventsEnum.CHAT_JOIN_USER, {
      accountId: currentUser.accountId,
    });

    const handleMessage = (payload: { code: number; data?: ChatMessagePayload }) => {
      const nextConversationId = payload?.data?.conversationId;
      if (!nextConversationId) return;

      if (!conversationId) {
        setConversationId(nextConversationId);
        localStorage.setItem("activeConversationId", nextConversationId);
        onOpenRequest?.();
      }
    };

    chatSocket.on(SocketEventsEnum.CHAT_MESSAGE_RECEIVED, handleMessage);

    return () => {
      chatSocket.emit(SocketEventsEnum.CHAT_LEAVE_USER, {
        accountId: currentUser.accountId,
      });
      chatSocket.off(
        SocketEventsEnum.CHAT_MESSAGE_RECEIVED,
        handleMessage as (...args: unknown[]) => void
      );
    };
  }, [chatSocket, conversationId, currentUser.accountId, onOpenRequest]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("activeConversationId");
    if (stored) setConversationId(stored);
  }, []);

  const ensureConversation = useCallback(async () => {
    if (conversationId) return;
    if (!defaultParticipants || defaultParticipants.length < 2) return;

    const res = await createConversation(defaultParticipants, defaultTitle);
    const id = res?.data?._id || res?.data?.id;
    if (id) {
      setConversationId(id);
      localStorage.setItem("activeConversationId", id);
    }
  }, [conversationId, defaultParticipants, defaultTitle]);

  useEffect(() => {
    if (!active) return;
    void ensureConversation();
  }, [active, ensureConversation]);

  const runSearch = async () => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await searchContacts(q.trim());
      setResults(res?.data || []);
    } finally {
      setSearching(false);
    }
  };

  const startChatWith = async (target: ContactSearchResult) => {
    const participants = [
      { accountId: currentUser.accountId, email: currentUser.email, role: currentUser.role },
      { accountId: target.accountId, email: target.email, role: target.role || "" },
    ];
    const res = await createConversation(participants, undefined);
    const id = res?.data?._id || res?.data?.id;

    if (id) {
      setConversationId(id);
      setReceiverInfo({
        name: target.displayName || target.email || "User",
        avatarUrl: target.avatarUrl,
      });
      localStorage.setItem("activeConversationId", id);
    }
  };

  const handleSelectConversation = (
    convId: string,
    receiver: { name: string; avatarUrl?: string }
  ) => {
    setConversationId(convId);
    setReceiverInfo(receiver);
    localStorage.setItem("activeConversationId", convId);
  };

  const resetToInbox = () => {
    setConversationId(null);
    setReceiverInfo(null);
    setQ("");
    setResults([]);
    setView("list");
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeConversationId");
    }
  };

  if (!active) {
    return null;
  }

  if (conversationId) {
    return (
      <ChatWindow
        conversationId={conversationId}
        currentUser={{ accountId: currentUser.accountId, email: currentUser.email }}
        receiver={receiverInfo || undefined}
        showBack
        onBack={resetToInbox}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-slate-950">
      <div className="flex-none border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
              view === "list"
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            Recent
          </button>
          <button
            type="button"
            onClick={() => setView("search")}
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
              view === "search"
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
      </div>

      {view === "list" ? (
        <ConversationList
          currentUserId={currentUser.accountId}
          onSelectConversation={handleSelectConversation}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-none border-b border-slate-200 p-4 dark:border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Search contacts
            </label>
            <div className="mt-2 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void runSearch();
                  }}
                  placeholder="Name or email"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:ring-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={() => void runSearch()}
                disabled={searching}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                aria-label="Search contacts"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 visible-scrollbar">
            {searching ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Searching contacts...
              </div>
            ) : null}

            {!searching && results.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  <UsersRound className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  No contacts yet
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Search by name or email to start a conversation.
                </p>
              </div>
            ) : null}

            {!searching &&
              results.map((result) => (
                <button
                  key={result.accountId}
                  type="button"
                  onClick={() => void startChatWith(result)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  {result.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.avatarUrl}
                      alt={result.displayName || result.email || "Contact"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {getInitials(result.displayName || result.email)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {result.displayName || result.email || "User"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {result.email || result.role || "No email"}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
