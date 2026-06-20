"use client";

import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { renderNotification } from "@/lib/notification/renderNotification";
import { Notification, NotificationType } from "@/types/notification.dto";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  X,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ReactNode } from "react";
import { formatNotificationTimestamp } from "./notification-list";

type NotificationDetailModalProps = {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type NotificationVisualMeta = {
  icon: ReactNode;
  label: string;
  iconClassName: string;
  surfaceClassName: string;
};

const visualMetaByType: Partial<Record<NotificationType, NotificationVisualMeta>> = {
  COIN_EXPIRY_REMINDER: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Ví coin",
    iconClassName: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60",
    surfaceClassName: "from-rose-50/80 to-white dark:from-rose-950/20 dark:to-slate-950",
  },
  APPOINTMENT_SUCCESS: {
    icon: <Calendar className="h-5 w-5" />,
    label: "Lịch khám",
    iconClassName: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60",
    surfaceClassName: "from-sky-50/90 to-white dark:from-sky-950/25 dark:to-slate-950",
  },
  APPOINTMENT_CANCELLED: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Lịch khám",
    iconClassName: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
    surfaceClassName: "from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-950",
  },
  APPOINTMENT_NO_SHOW: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Không đến khám",
    iconClassName: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
    surfaceClassName: "from-slate-100/80 to-white dark:from-slate-900/60 dark:to-slate-950",
  },
  APPOINTMENT_RESCHEDULED: {
    icon: <Calendar className="h-5 w-5" />,
    label: "Đổi lịch",
    iconClassName: "bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60",
    surfaceClassName: "from-indigo-50/80 to-white dark:from-indigo-950/20 dark:to-slate-950",
  },
  PAYMENT_SUCCESS: {
    icon: <CircleDollarSign className="h-5 w-5" />,
    label: "Thanh toán",
    iconClassName: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60",
    surfaceClassName: "from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-slate-950",
  },
  ASSIGNMENT_TASK_CREATED: {
    icon: <ClipboardList className="h-5 w-5" />,
    label: "Phân công",
    iconClassName: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60",
    surfaceClassName: "from-sky-50/90 to-white dark:from-sky-950/25 dark:to-slate-950",
  },
  ASSIGNMENT_TASK_REMINDER: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Nhắc việc",
    iconClassName: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
    surfaceClassName: "from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-950",
  },
  ASSIGNMENT_TASK_EXPIRED: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Quá hạn",
    iconClassName: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60",
    surfaceClassName: "from-rose-50/80 to-white dark:from-rose-950/20 dark:to-slate-950",
  },
  APPOINTMENT_DOCTOR_ASSIGNED: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    label: "Bác sĩ",
    iconClassName: "bg-teal-50 text-teal-600 ring-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:ring-teal-900/60",
    surfaceClassName: "from-teal-50/80 to-white dark:from-teal-950/20 dark:to-slate-950",
  },
};

const fallbackMeta: NotificationVisualMeta = {
  icon: <Bell className="h-5 w-5" />,
  label: "Thông báo",
  iconClassName: "bg-slate-50 text-slate-600 ring-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800",
  surfaceClassName: "from-sky-50/70 to-white dark:from-sky-950/20 dark:to-slate-950",
};

const getVisualMeta = (notification: Notification): NotificationVisualMeta => {
  return visualMetaByType[notification.type as NotificationType] ?? fallbackMeta;
};

export default function NotificationDetailModal({
  notification,
  open,
  onOpenChange,
}: NotificationDetailModalProps) {
  if (!notification) {
    return null;
  }

  const renderedNotification = renderNotification(notification);
  const meta = getVisualMeta(notification);
  const readStateText = notification.isRead ? "Đã đọc" : "Chưa đọc";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[70] bg-slate-950/45 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby="notification-detail-description"
          className={cn(
            "fixed inset-x-0 bottom-0 z-[71] max-h-[88vh] overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/15 outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4 duration-200",
            "dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30",
            "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(560px,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
            "sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:slide-out-to-bottom-0"
          )}
        >
          <div className={cn("bg-gradient-to-b px-5 pb-4 pt-5 sm:px-6", meta.surfaceClassName)}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-800 sm:hidden" />
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
                  meta.iconClassName
                )}
                aria-hidden="true"
              >
                {meta.icon}
              </span>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100 dark:bg-slate-900/70 dark:text-sky-300 dark:ring-sky-900/70">
                    {meta.label}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                      notification.isRead
                        ? "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
                        : "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800"
                    )}
                  >
                    {readStateText}
                  </span>
                </div>
                <DialogTitle className="break-words text-left text-lg font-semibold leading-7 text-slate-950 dark:text-slate-50 sm:text-xl">
                  {renderedNotification.title}
                </DialogTitle>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {formatNotificationTimestamp(notification.createdAt)}
                </p>
              </div>

              <DialogPrimitive.Close
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                aria-label="Đóng chi tiết thông báo"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="max-h-[48vh] overflow-y-auto px-5 py-5 sm:max-h-[52vh] sm:px-6">
            <DialogDescription
              id="notification-detail-description"
              className="whitespace-pre-wrap break-words text-left text-sm leading-7 text-slate-700 dark:text-slate-300"
            >
              {renderedNotification.message || "Thông báo này không có nội dung chi tiết."}
            </DialogDescription>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6">
            <DialogPrimitive.Close className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 active:bg-sky-800 sm:w-auto sm:min-w-28">
              Đã hiểu
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
