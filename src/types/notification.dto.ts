export type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  receiverEmail?: string[];
  isBroadcast: boolean;
  createdAt: string;
};
