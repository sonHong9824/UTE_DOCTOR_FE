import type { ChatMessage, ChatParticipant } from "@/features/chat/types/chat.types";

type LooseRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === "object" && value !== null;

export const normalizeId = (value: unknown): string => {
  if (value === null || typeof value === "undefined") return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    return String(value).trim();
  }
  if (isRecord(value)) {
    return normalizeId(value.accountId ?? value.id ?? value._id);
  }
  return String(value).trim();
};

const readString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" || typeof value === "bigint") return String(value);
  }
  return "";
};

const readRecord = (value: unknown): LooseRecord => (isRecord(value) ? value : {});

export const normalizeDateString = (value: unknown, fallback = new Date().toISOString()) => {
  const raw = readString(value);
  if (!raw) return fallback;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
};

export const getMessageDedupeKey = (message: Pick<ChatMessage, "id" | "clientMessageId" | "senderId" | "createdAt" | "content">) =>
  message.clientMessageId || message.id || `${message.senderId}:${message.createdAt}:${message.content}`;

export const sortMessagesChronologically = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => {
    const byCreatedAt = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (byCreatedAt !== 0) return byCreatedAt;
    return a.id.localeCompare(b.id);
  });

export const mergeChatMessages = (existing: ChatMessage[], incoming: ChatMessage[]) => {
  const byKey = new Map<string, ChatMessage>();
  [...existing, ...incoming].forEach((message) => {
    byKey.set(getMessageDedupeKey(message), message);
  });
  return sortMessagesChronologically(Array.from(byKey.values()));
};

export const normalizeChatMessage = (
  rawMessage: unknown,
  currentAccountId: unknown,
  fallbackConversationId?: string
): ChatMessage => {
  const raw = readRecord(rawMessage);
  const sender = readRecord(raw.sender);
  const receiver = readRecord(raw.receiver);
  const createdAt = normalizeDateString(raw.createdAt ?? raw.sentAt ?? raw.at ?? raw.timestamp);
  const id = readString(raw._id, raw.id, raw.messageId, raw.clientMessageId);
  const senderId = normalizeId(
    raw.senderId ??
      raw.senderAccountId ??
      raw.fromAccountId ??
      raw.from ??
      sender.accountId ??
      sender.id ??
      sender._id
  );
  const currentId = normalizeId(currentAccountId);

  return {
    id,
    conversationId: normalizeId(raw.conversationId) || fallbackConversationId || "",
    senderId,
    receiverId: normalizeId(
      raw.receiverId ??
        raw.receiverAccountId ??
        raw.toAccountId ??
        raw.to ??
        receiver.accountId ??
        receiver.id ??
        receiver._id
    ),
    senderEmail: readString(raw.senderEmail, sender.email),
    senderName: readString(raw.senderName, sender.displayName, sender.fullName, sender.name, sender.email),
    senderAvatarUrl: readString(raw.senderAvatarUrl, sender.avatarUrl),
    content: readString(raw.content, raw.text, raw.message),
    type: (readString(raw.type) || "text") as ChatMessage["type"],
    clientMessageId: readString(raw.clientMessageId),
    createdAt,
    updatedAt: normalizeDateString(raw.updatedAt, createdAt),
    isMine: Boolean(currentId && senderId && normalizeId(senderId) === currentId),
    raw: rawMessage,
  };
};

export const normalizeChatMessages = (
  rawMessages: unknown[],
  currentAccountId: unknown,
  fallbackConversationId?: string
) => sortMessagesChronologically(rawMessages.map((message) => normalizeChatMessage(message, currentAccountId, fallbackConversationId)));

export const getOtherParticipant = (participants: ChatParticipant[] = [], currentAccountId: unknown) => {
  const currentId = normalizeId(currentAccountId);
  return participants.find((participant) => normalizeId(participant.accountId) !== currentId) || participants[0];
};
