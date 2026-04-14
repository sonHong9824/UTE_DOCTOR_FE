import axiosClient from '@/lib/axiosClient';

export async function createConversation(participants: { accountId: string; email?: string; role: string }[], title?: string) {
  const res = await axiosClient.post('/chat/conversations', { participants, title });
  return res.data;
}

export async function listConversations(skip = 0, limit = 20) {
  const res = await axiosClient.get('/chat/conversations', { params: { skip, limit } });
  return res.data;
}

export async function getMessages(conversationId: string, before?: string, limit = 20) {
  const res = await axiosClient.get(`/chat/conversations/${conversationId}/messages`, { params: { before, limit } });
  return res.data;
}

export async function markRead(conversationId: string) {
  const res = await axiosClient.post(`/chat/conversations/${conversationId}/read`);
  return res.data;
}

export async function searchContacts(q: string, role?: string, limit = 10) {
  const res = await axiosClient.get('/chat/contacts/search', { params: { q, role, limit } });
  return res.data;
}
