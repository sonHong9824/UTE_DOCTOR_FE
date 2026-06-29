import axiosClient from "@/lib/axiosClient";

export type AssistantMode =
  | "general"
  | "dermatology"
  | "appointment"
  | "availability";

export interface AssistantChatTurn {
  role: "user" | "assistant";
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
  source:
    | "python-service"
    | "fallback"
    | "image-classifier"
    | "appointment-booking-guide"
    | "doctor-availability";
  suggestions: string[];
  imagePredictions?: {
    label: string;
    confidence: number;
  }[];
  warning?: string;
}

export interface AppointmentBookingGuideResponse {
  answer: string;
  source: "appointment-booking-guide";
  scope: "APPOINTMENT_BOOKING_GUIDE";
  model?: string;
  error?: string;
}

export interface AvailabilityAssistantResponse {
  answer: string;
  source: "doctor-availability" | "appointment-booking-guide";
  scope: "DOCTOR_AVAILABILITY" | "APPOINTMENT_BOOKING_GUIDE";
  intent:
    | "DOCTOR_AVAILABILITY"
    | "SPECIALTY_AVAILABILITY"
    | "DOCTOR_SPECIALTY_AVAILABILITY"
    | "BROAD_AVAILABILITY"
    | "INSUFFICIENT_INFORMATION"
    | "BOOKING_GUIDE"
    | "OUT_OF_SCOPE_MEDICAL";
  data?: unknown;
  parser?: "fallback" | "openai";
  error?: string;
}

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T | null;
}

export async function askAssistant(payload: AssistantChatRequest) {
  if (payload.mode === "appointment") {
    return askAppointmentBookingGuide(payload);
  }

  if (payload.mode === "availability") {
    return askAvailabilityAssistant(payload);
  }

  try {
    const res = await axiosClient.post<ApiEnvelope<AssistantChatResponse>>(
      "/assistant/chat",
      payload,
    );
    return res.data.data;
  } catch {
    return askAssistantDirect(payload);
  }
}

async function askAvailabilityAssistant(
  payload: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  try {
    const res = await axiosClient.post<AvailabilityAssistantResponse>(
      "/assistant/availability/ask",
      {
        question: payload.message,
      },
    );

    return {
      reply: res.data.answer,
      mode: "availability",
      source: res.data.source,
      suggestions: [],
      warning: res.data.error,
    };
  } catch (error) {
    const responseData = (
      error as {
        response?: { data?: Partial<AvailabilityAssistantResponse> };
      }
    )?.response?.data;

    if (responseData?.answer) {
      return {
        reply: responseData.answer,
        mode: "availability",
        source:
          responseData.source === "appointment-booking-guide"
            ? responseData.source
            : "doctor-availability",
        suggestions: [],
        warning: responseData.error,
      };
    }

    throw error;
  }
}

async function askAppointmentBookingGuide(
  payload: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  try {
    const res = await axiosClient.post<AppointmentBookingGuideResponse>(
      "/assistant/appointment-booking/ask",
      {
        question: payload.message,
      },
    );

    return {
      reply: res.data.answer,
      mode: "appointment",
      source: res.data.source,
      suggestions: [],
      warning: res.data.error,
    };
  } catch (error) {
    const responseData = (
      error as {
        response?: { data?: Partial<AppointmentBookingGuideResponse> };
      }
    )?.response?.data;

    if (responseData?.answer) {
      return {
        reply: responseData.answer,
        mode: "appointment",
        source:
          responseData.source === "appointment-booking-guide"
            ? responseData.source
            : "appointment-booking-guide",
        suggestions: [],
        warning: responseData.error,
      };
    }

    throw error;
  }
}

async function askAssistantDirect(
  payload: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_AI_CHAT_SERVICE_URL || "http://127.0.0.1:8765";
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Assistant service failed with ${response.status}`);
  }

  const data = await response.json();
  if (data && typeof data === "object" && "reply" in data) {
    const imagePredictions = Array.isArray(
      (data as { image_predictions?: unknown }).image_predictions,
    )
      ? (
          data as {
            image_predictions: Array<{ label?: unknown; confidence?: unknown }>;
          }
        ).image_predictions
          .map((item) => ({
            label: String(item?.label ?? "").trim(),
            confidence: Number(item?.confidence ?? 0),
          }))
          .filter(
            (item) => item.label.length > 0 && Number.isFinite(item.confidence),
          )
      : undefined;

    return {
      reply: String((data as { reply?: unknown }).reply ?? "").trim(),
      mode: String(
        (data as { mode?: unknown }).mode ?? payload.mode,
      ) as AssistantMode,
      source:
        (data as { source?: unknown }).source === "image-classifier"
          ? "image-classifier"
          : "python-service",
      suggestions: Array.isArray(
        (data as { suggestions?: unknown }).suggestions,
      )
        ? (data as { suggestions: unknown[] }).suggestions
            .map((item) => String(item))
            .slice(0, 4)
        : [],
      imagePredictions,
      warning:
        typeof (data as { warning?: unknown }).warning === "string"
          ? String((data as { warning?: unknown }).warning)
          : undefined,
    };
  }

  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data as AssistantChatResponse;
  }

  throw new Error("Invalid assistant response");
}

export async function getAssistantHealth() {
  try {
    const res =
      await axiosClient.get<
        ApiEnvelope<{ status: "ok"; source: "python-service" | "fallback" }>
      >("/assistant/health");
    return res.data.data;
  } catch {
    return { status: "ok" as const, source: "fallback" as const };
  }
}

export async function getAssistantSuggestions(mode: AssistantMode = "general") {
  try {
    const res = await axiosClient.get<
      ApiEnvelope<{ mode: AssistantMode; suggestions: string[] }>
    >("/assistant/suggestions", {
      params: { mode },
    });
    return res.data.data;
  } catch {
    return null;
  }
}
