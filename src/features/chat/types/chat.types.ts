export type ChatParticipant = {
  accountId: string;
  email?: string;
  role?: string;
  displayName?: string;
  avatarUrl?: string | null;
};

export type ChatMessageType = "text" | "image" | "file" | "system";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  senderEmail?: string;
  senderName?: string;
  senderAvatarUrl?: string;
  content: string;
  type: ChatMessageType;
  clientMessageId?: string;
  createdAt: string;
  updatedAt?: string;
  isMine: boolean;
  raw: unknown;
};

export type ChatReceiverInfo = {
  accountId?: string;
  name: string;
  avatarUrl?: string;
};
