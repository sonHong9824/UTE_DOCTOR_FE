import axiosClient from '@/lib/axiosClient';

export type AssistantMode = 'general' | 'dermatology' | 'appointment';

export interface AssistantChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatRequest {
  message: string;
  mode?: AssistantMode;
  history?: AssistantChatTurn[];
  imageDataUrl?: string;
  imageFileName?: string;
  imageMimeType?: string;
}

export interface AssistantChatResponse {
  reply: string;
  mode: AssistantMode;
  source: 'python-service' | 'fallback';
  suggestions: string[];
  warning?: string;
}

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T | null;
}

export async function askAssistant(payload: AssistantChatRequest) {
  try {
    const res = await axiosClient.post<ApiEnvelope<AssistantChatResponse>>('/assistant/chat', payload);
    return res.data.data;
  } catch {
    return askAssistantDirect(payload);
  }
}

async function askAssistantDirect(payload: AssistantChatRequest): Promise<AssistantChatResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_AI_CHAT_SERVICE_URL || 'http://127.0.0.1:8765';
  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Assistant service failed with ${response.status}`);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'reply' in data) {
    return data as AssistantChatResponse;
  }

  if (data && typeof data === 'object' && 'data' in data && data.data) {
    return data.data as AssistantChatResponse;
  }

  throw new Error('Invalid assistant response');
}

export async function getAssistantHealth() {
  try {
    const res = await axiosClient.get<ApiEnvelope<{ status: 'ok'; source: 'python-service' | 'fallback' }>>('/assistant/health');
    return res.data.data;
  } catch {
    return { status: 'ok' as const, source: 'fallback' as const };
  }
}

export async function getAssistantSuggestions(mode: AssistantMode = 'general') {
  try {
    const res = await axiosClient.get<ApiEnvelope<{ mode: AssistantMode; suggestions: string[] }>>('/assistant/suggestions', {
      params: { mode },
    });
    return res.data.data;
  } catch {
    return null;
  }
}
