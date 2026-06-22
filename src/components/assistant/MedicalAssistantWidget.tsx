"use client";

import { askAssistant, getAssistantHealth, getAssistantSuggestions, type AssistantChatResponse, type AssistantMode } from '@/apis/assistant/assistant.api';
import samplePrompts from '@/data/assistant-prompts.json';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Send, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  role: MessageRole;
  content: string;
  imageUrl?: string;
}

interface AttachedImage {
  dataUrl: string;
  fileName: string;
  mimeType: string;
}

const STORAGE_KEY = 'medical-assistant-history-v1';

const DEFAULT_PROMPTS = samplePrompts as Record<AssistantMode, string[]>;

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      role: (item.role === 'assistant' ? 'assistant' : 'user') as MessageRole,
      content: typeof item.content === 'string' ? item.content : '',
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : undefined,
    }))
    .filter((item) => item.content.trim().length > 0 || Boolean(item.imageUrl))
    .slice(-16);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });
}

function compressImage(dataUrl: string, maxWidth = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => reject(new Error('Unable to load image'));
    image.src = dataUrl;
  });
}

export default function MedicalAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMode, setChatMode] = useState<AssistantMode>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_PROMPTS.general);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const loadSuggestions = useCallback(async (mode: AssistantMode) => {
    const response = await getAssistantSuggestions(mode);
    if (response?.suggestions?.length) {
      setSuggestions(response.suggestions);
      return;
    }
    setSuggestions(DEFAULT_PROMPTS[mode] ?? DEFAULT_PROMPTS.general);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-16)));
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open, attachedImage, cameraOpen, sending]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }

    void loadSuggestions(chatMode);
    void getAssistantHealth().then((health) => {
      setAiOnline(health?.source === 'python-service');
    });
  }, [open, chatMode, loadSuggestions]);

  useEffect(() => {
    if (!cameraOpen) return;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError('');
      } catch (err) {
        setCameraError('Không thể mở camera trên thiết bị này.');
        setCameraOpen(false);
      }
    };

    void start();

    return () => {
      stopCamera();
    };
  }, [cameraOpen]);

  const stopCamera = () => {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const canSend = useMemo(() => Boolean(message.trim() || attachedImage) && !sending, [message, attachedImage, sending]);

  const clearConversation = () => {
    setMessages([]);
    setMessage('');
    setChatMode('general');
    setSuggestions(DEFAULT_PROMPTS.general);
    setAttachedImage(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const removeAttachment = () => {
    setAttachedImage(null);
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một file ảnh hợp lệ.');
      return;
    }

    try {
      const rawDataUrl = await fileToDataUrl(file);
      const dataUrl = await compressImage(rawDataUrl);
      setAttachedImage({
        dataUrl,
        fileName: file.name,
        mimeType: 'image/jpeg',
      });
      setCameraOpen(false);
    } catch {
      toast.error('Không thể đọc file ảnh.');
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      toast.error('Camera chưa sẵn sàng.');
      return;
    }

    // If video dimensions are not yet available, wait for loadedmetadata
    if (!video.videoWidth || !video.videoHeight) {
      try {
        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error('Video metadata load failed'));
          };
          const cleanup = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError as any);
          };
          video.addEventListener('loadedmetadata', onLoaded);
          video.addEventListener('error', onError as any);
        });
      } catch {
        toast.error('Camera chưa sẵn sàng.');
        return;
      }
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      toast.error('Không thể chụp ảnh từ camera.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    try {
      const dataUrl = await compressImage(rawDataUrl);
      setAttachedImage({
        dataUrl,
        fileName: `camera-${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      });
      setCameraOpen(false);
      stopCamera();
    } catch {
      toast.error('Không thể xử lý ảnh từ camera.');
    }
  };

  const sendMessage = async (overrideMessage?: string, overrideMode?: AssistantMode) => {
    const content = (overrideMessage ?? message).trim();
    if (!content && !attachedImage) return;
    if (sending) return;

    const nextMode = overrideMode ?? chatMode;
    const userText = content || 'Hãy phân tích hình ảnh y khoa này và cho tôi hướng xử lý ban đầu.';
    const imageForMessage = attachedImage?.dataUrl;
    const nextUserMessage: ChatMessage = {
      role: 'user',
      content: userText,
      imageUrl: imageForMessage,
    };
    const nextHistory = [...messages, nextUserMessage];

    setMessages(nextHistory);
    setMessage('');
    setChatMode(nextMode);
    setSending(true);

    const imagePayload = attachedImage
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
        history: nextHistory.slice(-8).map(({ role, content: text }) => ({ role, content: text })),
        ...imagePayload,
      });

      const reply = response?.reply?.trim() || 'Tôi chưa có câu trả lời phù hợp ngay lúc này.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setSuggestions(response?.suggestions?.length ? response.suggestions : DEFAULT_PROMPTS[nextMode]);
      setAttachedImage(null);
      setAiOnline(response?.source === 'python-service');

      if (response?.warning) {
        toast.info(response.warning);
      }
    } catch {
      toast.error('Không gửi được yêu cầu tới trợ lý AI.');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Hiện tại tôi chưa kết nối được tới dịch vụ AI. Vui lòng thử lại sau ít phút.' }]);
      setSuggestions(DEFAULT_PROMPTS[nextMode]);
      setAiOnline(false);
    } finally {
      setSending(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const visiblePrompts = suggestions.length ? suggestions : DEFAULT_PROMPTS[chatMode];

  return (
    <>
      <motion.button
        type="button"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full',
          'bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 text-white shadow-[0_12px_32px_rgba(14,165,233,0.35)]',
          'border border-white/25 backdrop-blur-md transition-transform'
        )}
        aria-label="Mở trợ lý AI y khoa"
      >
        <Sparkles className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
                'fixed bottom-[4.75rem] right-4 z-[60] w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.2)]',
                'dark:border-slate-800 dark:bg-slate-950 sm:right-5 sm:w-[420px]',
                'h-[66vh] flex flex-col'
              )}
          >
            <div className="border-b border-slate-200/70 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 px-4 py-3.5 text-white dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Medical AI</p>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        aiOnline === null && 'bg-white/15 text-white/80',
                        aiOnline === true && 'bg-emerald-400/20 text-emerald-50',
                        aiOnline === false && 'bg-amber-400/20 text-amber-50'
                      )}
                    >
                      {/* <span className={cn('h-1.5 w-1.5 rounded-full', aiOnline ? 'bg-emerald-200' : 'bg-amber-200')} />
                      {aiOnline === null ? 'Đang kiểm tra' : aiOnline ? 'Sẵn sàng' : 'Chế độ dự phòng'} */}
                    </span>
                  </div>
                  {/* <h2 className="mt-1 text-base font-semibold">Tư vấn y khoa thông minh</h2>
                  <p className="mt-0.5 text-[11px] text-white/80">
                    Hỏi triệu chứng, gửi ảnh hoặc chụp camera để được định hướng ban đầu.
                  </p> */}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={clearConversation}
                    className="rounded-full p-1.5 text-white/85 transition hover:bg-white/10 hover:text-white"
                    aria-label="Xóa lịch sử"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-1.5 text-white/85 transition hover:bg-white/10 hover:text-white"
                    aria-label="Đóng trợ lý"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 visible-scrollbar">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                    Nhập câu hỏi, chọn ảnh từ máy hoặc chụp bằng camera để AI phân tích ban đầu.
                  </div>
                </div>
              ) : null}

              {messages.map((item, index) => (
                <div key={`${item.role}-${index}`} className={cn('flex w-full', item.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm',
                      item.role === 'user'
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                    )}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="Ảnh đính kèm" className="mb-2 h-24 w-24 rounded-xl object-cover" />
                    ) : null}
                    {item.content ? <p className="whitespace-pre-wrap">{item.content}</p> : null}
                  </div>
                </div>
              ))}

              {sending ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 flex items-center gap-1">
                    <motion.span
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="text-2xl"
                    >
                      •
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                      className="text-2xl"
                    >
                      •
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="text-2xl"
                    >
                      •
                    </motion.span>
                  </div>
                </div>
              ) : null}

              {attachedImage ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Ảnh đã chọn</p>
                    <button type="button" onClick={removeAttachment} className="text-xs font-medium text-red-500 hover:text-red-600">
                      Xóa ảnh
                    </button>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={attachedImage.dataUrl} alt={attachedImage.fileName} className="h-24 w-24 rounded-xl object-cover" />
                </div>
              ) : null}

              {cameraOpen ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Camera</p>
                    <button type="button" onClick={() => { setCameraOpen(false); stopCamera(); }} className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      Đóng camera
                    </button>
                  </div>
                  {cameraError ? <p className="mb-2 text-xs text-red-500">{cameraError}</p> : null}
                  <video ref={videoRef} className="h-44 w-full rounded-xl bg-black object-cover" playsInline muted autoPlay />
                  <div className="mt-3 flex items-center gap-2">
                    <Button type="button" onClick={() => void captureFromCamera()} className="flex-1 rounded-full">
                      <Camera className="h-4 w-4" />
                      Chụp ảnh
                    </Button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex-none border-t border-slate-200/70 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-950">
              {/* <div className="mb-2.5 flex flex-wrap gap-2">
                {[
                  { label: 'Tổng quát', value: 'general' },
                  { label: 'Da liễu', value: 'dermatology' },
                  { label: 'Đặt lịch', value: 'appointment' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      const mode = item.value as AssistantMode;
                      setChatMode(mode);
                      void loadSuggestions(mode);
                    }}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold transition',
                      chatMode === item.value
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div> */}

              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Câu hỏi phổ biến
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPrompts((v) => !v)}
                    className="text-xs font-medium text-sky-600 hover:underline"
                  >
                    {showPrompts ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {showPrompts && (
                  <div className="flex flex-wrap gap-2">
                    {visiblePrompts.slice(0, 4).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => void sendMessage(item, chatMode)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-[11px] leading-4 text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Mô tả triệu chứng hoặc câu hỏi của bạn..."
                  rows={3}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  className="resize-none rounded-2xl border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm shadow-none focus-visible:border-sky-400 focus-visible:ring-sky-400/20 dark:border-slate-800 dark:bg-slate-900"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={openFilePicker} className="rounded-full">
                    <Upload className="h-4 w-4" />
                    Chọn ảnh
                  </Button>
                  {/* <Button type="button" variant="outline" size="sm" onClick={() => setCameraOpen((prev) => !prev)} className="rounded-full">
                    <Camera className="h-4 w-4" />
                    Camera
                  </Button> */}
                  <Button type="button" size="sm" onClick={() => void sendMessage()} disabled={!canSend} className="ml-auto rounded-full px-4">
                    <Send className="h-4 w-4" />
                    Gửi
                  </Button>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleFileSelect(event.target.files?.[0] || null)}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
