"use client";

import {
  askAssistant,
  getAssistantHealth,
  getAssistantSuggestions,
  type AssistantChatResponse,
  type AssistantMode,
} from "@/apis/assistant/assistant.api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import samplePrompts from "@/data/assistant-prompts.json";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Send, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  role: MessageRole;
  content: string;
  imageUrl?: string;
  imagePredictions?: {
    label: string;
    confidence: number;
  }[];
  source?: AssistantChatResponse["source"];
}

interface AttachedImage {
  dataUrl: string;
  fileName: string;
  mimeType: string;
}

interface MedicalAssistantWidgetProps {
  active?: boolean;
}

const STORAGE_KEY = "medical-assistant-history-v1";
const DEFAULT_PROMPTS = samplePrompts as Record<AssistantMode, string[]>;

const MODE_OPTIONS: { label: string; value: AssistantMode }[] = [
  { label: "General", value: "general" },
  { label: "Skin", value: "dermatology" },
  { label: "Booking", value: "appointment" },
  { label: "Availability", value: "availability" },
];

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .map((item) => ({
      role: (item.role === "assistant" ? "assistant" : "user") as MessageRole,
      content: typeof item.content === "string" ? item.content : "",
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
      imagePredictions: Array.isArray(item.imagePredictions)
        ? item.imagePredictions
            .map((prediction) => ({
              label: String(
                (prediction as { label?: unknown })?.label ?? "",
              ).trim(),
              confidence: Number(
                (prediction as { confidence?: unknown })?.confidence ?? 0,
              ),
            }))
            .filter(
              (prediction) =>
                prediction.label.length > 0 &&
                Number.isFinite(prediction.confidence),
            )
        : undefined,
      source:
        item.source === "python-service" ||
        item.source === "fallback" ||
        item.source === "image-classifier" ||
        item.source === "appointment-booking-guide" ||
        item.source === "doctor-availability"
          ? (item.source as AssistantChatResponse["source"])
          : undefined,
    }))
    .filter((item) => item.content.trim().length > 0 || Boolean(item.imageUrl))
    .slice(-16);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });
}

function compressImage(
  dataUrl: string,
  maxWidth = 1280,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = dataUrl;
  });
}

export default function MedicalAssistantWidget({
  active = true,
}: MedicalAssistantWidgetProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMode, setChatMode] = useState<AssistantMode>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(
    DEFAULT_PROMPTS.general,
  );
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(
    null,
  );
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [showPrompts, setShowPrompts] = useState(true);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const loadSuggestions = useCallback(async (mode: AssistantMode) => {
    const response = await getAssistantSuggestions(mode);
    if (response?.suggestions?.length) {
      setSuggestions(response.suggestions);
      return;
    }
    setSuggestions(DEFAULT_PROMPTS[mode] ?? DEFAULT_PROMPTS.general);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawMessages = window.localStorage.getItem(STORAGE_KEY);
      if (rawMessages) {
        setMessages(normalizeMessages(JSON.parse(rawMessages)));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-16)),
    );
  }, [messages]);

  useEffect(() => {
    if (!active) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, active, attachedImage, cameraOpen, sending]);

  useEffect(() => {
    if (!active) {
      stopCamera();
      return;
    }

    void loadSuggestions(chatMode);
    void getAssistantHealth().then((health) => {
      setAiOnline(health?.source === "python-service");
    });
  }, [active, chatMode, loadSuggestions, stopCamera]);

  useEffect(() => {
    if (!cameraOpen) return;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError("");
      } catch {
        setCameraError("Camera is not available on this device.");
        setCameraOpen(false);
      }
    };

    void start();

    return () => {
      stopCamera();
    };
  }, [cameraOpen, stopCamera]);

  const canSend = useMemo(
    () => Boolean(message.trim() || attachedImage) && !sending,
    [message, attachedImage, sending],
  );

  const clearConversation = () => {
    setMessages([]);
    setMessage("");
    setChatMode("general");
    setSuggestions(DEFAULT_PROMPTS.general);
    setAttachedImage(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleModeChange = (mode: AssistantMode) => {
    setChatMode(mode);
    if (mode === "appointment" || mode === "availability") {
      setAttachedImage(null);
      setCameraOpen(false);
      stopCamera();
    }
    void loadSuggestions(mode);
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.");
      return;
    }

    try {
      const rawDataUrl = await fileToDataUrl(file);
      const dataUrl = await compressImage(rawDataUrl);
      setAttachedImage({
        dataUrl,
        fileName: file.name,
        mimeType: "image/jpeg",
      });
      setCameraOpen(false);
    } catch {
      toast.error("Could not read the image file.");
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      toast.error("Camera is not ready.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      try {
        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => {
            cleanup();
            resolve();
          };
          const onError: EventListener = () => {
            cleanup();
            reject(new Error("Video metadata load failed"));
          };
          const cleanup = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("error", onError);
          };
          video.addEventListener("loadedmetadata", onLoaded);
          video.addEventListener("error", onError);
        });
      } catch {
        toast.error("Camera is not ready.");
        return;
      }
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("Could not capture an image from the camera.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.92);

    try {
      const dataUrl = await compressImage(rawDataUrl);
      setAttachedImage({
        dataUrl,
        fileName: `camera-${Date.now()}.jpg`,
        mimeType: "image/jpeg",
      });
      setCameraOpen(false);
      stopCamera();
    } catch {
      toast.error("Could not process the camera image.");
    }
  };

  const sendMessage = async (
    overrideMessage?: string,
    overrideMode?: AssistantMode,
  ) => {
    const content = (overrideMessage ?? message).trim();
    if (!content && !attachedImage) return;
    if (sending) return;

    const nextMode = overrideMode ?? chatMode;
    const isTextOnlyRequest =
      nextMode === "appointment" || nextMode === "availability";
    const userText =
      content ||
      "Please review this medical image and suggest initial next steps.";
    const imageForMessage = isTextOnlyRequest
      ? undefined
      : attachedImage?.dataUrl;
    const nextUserMessage: ChatMessage = {
      role: "user",
      content: userText,
      imageUrl: imageForMessage,
    };
    const nextHistory = [...messages, nextUserMessage];

    setMessages(nextHistory);
    setMessage("");
    setChatMode(nextMode);
    setSending(true);

    const imagePayload =
      attachedImage && !isTextOnlyRequest
        ? {
            imageDataUrl: attachedImage.dataUrl,
            imageFileName: attachedImage.fileName,
            imageMimeType: attachedImage.mimeType,
          }
        : {};

    try {
      const response: AssistantChatResponse | null = await askAssistant({
        message: userText,
        mode: nextMode,
        history: nextHistory
          .slice(-8)
          .map(({ role, content: text }) => ({ role, content: text })),
        ...imagePayload,
      });

      const reply =
        response?.reply?.trim() || "I do not have a suitable answer right now.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          imagePredictions: response?.imagePredictions,
          source: response?.source,
        },
      ]);
      setSuggestions(
        response?.suggestions?.length
          ? response.suggestions
          : DEFAULT_PROMPTS[nextMode],
      );
      setAttachedImage(null);
      setAiOnline(response?.source !== "fallback");

      if (response?.warning) {
        toast.info(response.warning);
      }
    } catch {
      toast.error(
        nextMode === "appointment"
          ? "Could not send the booking guide request."
          : nextMode === "availability"
            ? "Could not check availability right now."
          : "Could not send the request to Medical AI.",
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            nextMode === "appointment"
              ? "Booking guide is temporarily unavailable. Please try again later."
              : nextMode === "availability"
                ? "Availability assistant is temporarily unavailable. Please try again later."
              : "Medical AI is temporarily unavailable. Please try again later.",
        },
      ]);
      setSuggestions(DEFAULT_PROMPTS[nextMode]);
      setAiOnline(false);
    } finally {
      setSending(false);
    }
  };

  const visiblePrompts = suggestions.length
    ? suggestions
    : DEFAULT_PROMPTS[chatMode];
  const isBookingMode = chatMode === "appointment";
  const isAvailabilityMode = chatMode === "availability";
  const isTextOnlyMode = isBookingMode || isAvailabilityMode;

  if (!active) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-slate-950">
      <div className="flex-none border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isBookingMode && "bg-sky-500",
                isAvailabilityMode && "bg-emerald-500",
                !isTextOnlyMode && aiOnline === null && "bg-slate-300",
                !isTextOnlyMode && aiOnline === true && "bg-emerald-500",
                !isTextOnlyMode && aiOnline === false && "bg-amber-500",
              )}
            />
            <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBookingMode
                ? "Booking guide"
                : isAvailabilityMode
                  ? "Availability"
                : aiOnline === null
                  ? "Checking service"
                  : aiOnline
                    ? "Online"
                    : "Fallback mode"}
            </span>
          </div>
          <button
            type="button"
            onClick={clearConversation}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
          {MODE_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleModeChange(item.value)}
              className={cn(
                "h-8 flex-1 rounded-lg px-3 text-xs font-semibold transition",
                chatMode === item.value
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 visible-scrollbar">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            {isBookingMode
              ? "Ask how to book an appointment, pay the deposit, use BHYT, or wait for receptionist assignment."
              : isAvailabilityMode
                ? "Ask whether a doctor or specialty has real available slots for a date or time of day."
              : "Ask about symptoms, appointment prep, FAQs, or upload an image for initial skin guidance."}
          </div>
        ) : null}

        {messages.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={cn(
              "flex w-full",
              item.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm",
                item.role === "user"
                  ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                  : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
              )}
            >
              {item.role === "assistant" &&
              item.source === "image-classifier" ? (
                <div className="mb-2 inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
                  Image result
                </div>
              ) : null}
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt="Attached image"
                  className="mb-2 h-24 w-24 rounded-xl object-cover"
                />
              ) : null}
              {item.content ? (
                <p className="whitespace-pre-wrap">{item.content}</p>
              ) : null}
              {item.imagePredictions?.length ? (
                <div className="mt-3 space-y-2 rounded-xl border border-slate-200/80 bg-white/70 p-2 text-xs dark:border-slate-800 dark:bg-slate-950/50">
                  {item.imagePredictions.slice(0, 3).map((prediction) => (
                    <div
                      key={prediction.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="line-clamp-2">{prediction.label}</span>
                      <span className="shrink-0 font-semibold text-slate-600 dark:text-slate-300">
                        {(prediction.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {sending ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                  className="text-xl leading-none"
                >
                  .
                </motion.span>
              ))}
            </div>
          </div>
        ) : null}

        {attachedImage ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Selected image
              </p>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachedImage.dataUrl}
              alt={attachedImage.fileName}
              className="h-24 w-24 rounded-xl object-cover"
            />
          </div>
        ) : null}

        {cameraOpen ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Camera
              </p>
              <button
                type="button"
                onClick={() => {
                  setCameraOpen(false);
                  stopCamera();
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Close camera
              </button>
            </div>
            {cameraError ? (
              <p className="mb-2 text-xs text-red-500">{cameraError}</p>
            ) : null}
            <video
              ref={videoRef}
              className="h-44 w-full rounded-xl bg-black object-cover"
              playsInline
              muted
              autoPlay
            />
            <Button
              type="button"
              onClick={() => void captureFromCamera()}
              className="mt-3 w-full rounded-full"
            >
              <Camera className="h-4 w-4" />
              Capture
            </Button>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              FAQs
            </p>
            <button
              type="button"
              onClick={() => setShowPrompts((value) => !value)}
              className="text-xs font-medium text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              {showPrompts ? "Hide" : "Show"}
            </button>
          </div>
          {showPrompts ? (
            <div className="flex gap-2 overflow-x-auto pb-1 visible-scrollbar">
              {visiblePrompts.slice(0, 6).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => void sendMessage(item, chatMode)}
                  className="max-w-[220px] shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-[11px] leading-4 text-slate-700 transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={
            isBookingMode
              ? "Ask how to book an appointment..."
              : isAvailabilityMode
                ? "Ask about doctor or specialty availability..."
              : "Describe symptoms or ask a question..."
          }
          rows={2}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          className="resize-none rounded-2xl border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm shadow-none focus-visible:border-slate-400 focus-visible:ring-slate-200 dark:border-slate-800 dark:bg-slate-900"
        />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {!isTextOnlyMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full"
              >
                <Upload className="h-4 w-4" />
                Image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCameraOpen((prev) => !prev)}
                className="rounded-full"
              >
                <ImagePlus className="h-4 w-4" />
                Camera
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={() => void sendMessage()}
            disabled={!canSend}
            className="ml-auto rounded-full px-4"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) =>
          void handleFileSelect(event.target.files?.[0] || null)
        }
      />
    </div>
  );
}
