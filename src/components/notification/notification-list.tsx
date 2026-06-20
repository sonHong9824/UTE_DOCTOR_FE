import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { renderNotification } from "@/lib/notification/renderNotification";
import { Notification, NotificationType } from "@/types/notification.dto";
import {
  formatApiDateToLocalDateTime,
  formatApiDateToLocalTime,
  parseApiDateTimeToLocal,
} from "@/utils/time.util";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  RefreshCcw,
} from "lucide-react";
import { ComponentType, ReactNode } from "react";

type NotificationListVariant = "dropdown" | "center";

interface Props {
  notifications: Notification[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  onClickNotification?: (notif: Notification) => void;
  selectedNotificationId?: string;
  variant?: NotificationListVariant;
  loadingMore?: boolean;
}

type NotificationItemProps = {
  item: Notification;
  onClickNotification?: (notif: Notification) => void;
  selected?: boolean;
  variant?: NotificationListVariant;
};

const notificationTypeStyleMap: Partial<
  Record<
    NotificationType,
    {
      icon: ReactNode;
      iconClassName: string;
      label: string;
    }
  >
> = {
  COIN_EXPIRY_REMINDER: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconClassName: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60",
    label: "Ví coin",
  },
  APPOINTMENT_SUCCESS: {
    icon: <Calendar className="h-4 w-4" />,
    iconClassName: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60",
    label: "Lịch khám",
  },
  APPOINTMENT_CANCELLED: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconClassName: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
    label: "Lịch khám",
  },
  APPOINTMENT_NO_SHOW: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconClassName: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
    label: "Không đến khám",
  },
  APPOINTMENT_RESCHEDULED: {
    icon: <Calendar className="h-4 w-4" />,
    iconClassName: "bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60",
    label: "Đổi lịch",
  },
  PAYMENT_SUCCESS: {
    icon: <CircleDollarSign className="h-4 w-4" />,
    iconClassName: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60",
    label: "Thanh toán",
  },
  ASSIGNMENT_TASK_CREATED: {
    icon: <ClipboardList className="h-4 w-4" />,
    iconClassName: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60",
    label: "Phân công",
  },
  ASSIGNMENT_TASK_REMINDER: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconClassName: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
    label: "Nhắc việc",
  },
  ASSIGNMENT_TASK_EXPIRED: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconClassName: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60",
    label: "Quá hạn",
  },
  APPOINTMENT_DOCTOR_ASSIGNED: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconClassName: "bg-teal-50 text-teal-600 ring-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:ring-teal-900/60",
    label: "Bác sĩ",
  },
};

const fallbackNotificationStyle = {
  icon: <Bell className="h-4 w-4" />,
  iconClassName: "bg-slate-50 text-slate-600 ring-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800",
  label: "Thông báo",
};

const getNotificationStyle = (type?: string) => {
  if (!type) {
    return fallbackNotificationStyle;
  }

  return notificationTypeStyleMap[type as NotificationType] ?? fallbackNotificationStyle;
};

export const formatNotificationCount = (count: number) => {
  if (count > 99) {
    return "99+";
  }

  return String(Math.max(0, count));
};

export const formatNotificationTimestamp = (value: string | number | Date) => {
  const createdAt = parseApiDateTimeToLocal(value);
  if (!createdAt) {
    return "--:--";
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes >= 0 && diffMinutes < 1) {
    return "Vừa xong";
  }

  if (diffMinutes >= 1 && diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours >= 1 && diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const now = new Date();
  const sameYear = createdAt.getFullYear() === now.getFullYear();
  return sameYear
    ? formatApiDateToLocalDateTime(value).slice(0, 5)
    : formatApiDateToLocalDateTime(value);
};

const NotificationItemShell = ({
  item,
  onClickNotification,
  selected = false,
  variant = "center",
}: NotificationItemProps) => {
  const renderedNotification = renderNotification(item);
  const style = getNotificationStyle(item.type);
  const compact = variant === "dropdown";
  const timestamp = compact
    ? formatNotificationTimestamp(item.createdAt)
    : formatApiDateToLocalTime(item.createdAt);

  return (
    <button
      type="button"
      onClick={() => onClickNotification?.(item)}
      className={cn(
        "group relative flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl border text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
        compact ? "p-3" : "p-4 sm:p-5",
        item.isRead
          ? "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-sky-900 dark:hover:bg-sky-950/20"
          : "border-sky-200 bg-sky-50/70 shadow-[inset_3px_0_0_0_rgb(14_165_233)] hover:bg-sky-50 dark:border-sky-900/70 dark:bg-sky-950/30 dark:shadow-[inset_3px_0_0_0_rgb(56_189_248)]",
        selected && "border-sky-300 bg-sky-50 ring-2 ring-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:ring-sky-900/50"
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl ring-1",
          compact ? "h-9 w-9" : "h-11 w-11",
          style.iconClassName
        )}
        aria-hidden="true"
      >
        {style.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-start justify-between gap-3">
          <span
            className={cn(
              "min-w-0 truncate font-semibold text-slate-900 dark:text-slate-50",
              compact ? "text-sm" : "text-base"
            )}
          >
            {renderedNotification.title}
          </span>
          <span className="shrink-0 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
            {timestamp}
          </span>
        </span>

        <span className="mt-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {style.label}
          </span>
          {!item.isRead && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Chưa đọc
            </span>
          )}
        </span>

        <span
          className={cn(
            "mt-2 block break-words text-slate-600 dark:text-slate-300",
            compact ? "line-clamp-2 text-xs leading-5" : "text-sm leading-6"
          )}
        >
          {renderedNotification.message}
        </span>
      </span>
    </button>
  );
};

const FallbackNotification = (props: NotificationItemProps) => <NotificationItemShell {...props} />;

const notificationComponentMap: Partial<
  Record<NotificationType, ComponentType<NotificationItemProps>>
> = {
  COIN_EXPIRY_REMINDER: NotificationItemShell,
  APPOINTMENT_SUCCESS: NotificationItemShell,
  APPOINTMENT_CANCELLED: NotificationItemShell,
  APPOINTMENT_NO_SHOW: NotificationItemShell,
  APPOINTMENT_RESCHEDULED: NotificationItemShell,
  PAYMENT_SUCCESS: NotificationItemShell,
  ASSIGNMENT_TASK_CREATED: NotificationItemShell,
  ASSIGNMENT_TASK_REMINDER: NotificationItemShell,
  ASSIGNMENT_TASK_EXPIRED: NotificationItemShell,
  APPOINTMENT_DOCTOR_ASSIGNED: NotificationItemShell,
};

export function NotificationListSkeleton({
  count = 4,
  variant = "center",
}: {
  count?: number;
  variant?: NotificationListVariant;
}) {
  const compact = variant === "dropdown";

  return (
    <div className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
            compact ? "p-3" : "p-4"
          )}
        >
          <Skeleton className={cn("shrink-0 rounded-xl", compact ? "h-9 w-9" : "h-11 w-11")} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationEmptyState({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 text-center dark:border-sky-900/70 dark:bg-sky-950/20",
        compact ? "px-4 py-8" : "px-6 py-12"
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-600 ring-1 ring-sky-100 dark:bg-slate-950 dark:text-sky-300 dark:ring-sky-900">
        <Bell className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function NotificationErrorState({
  title = "Không tải được thông báo",
  description = "Vui lòng thử lại sau ít phút.",
  onRetry,
  compact = false,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-200 bg-rose-50/60 text-center dark:border-rose-900/70 dark:bg-rose-950/20",
        compact ? "px-4 py-6" : "px-6 py-10"
      )}
    >
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-rose-600 ring-1 ring-rose-100 dark:bg-slate-950 dark:text-rose-300 dark:ring-rose-900">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-4">
          <RefreshCcw className="h-4 w-4" />
          Thử lại
        </Button>
      )}
    </div>
  );
}

export default function NotificationList({
  notifications,
  onLoadMore,
  hasMore,
  onClickNotification,
  selectedNotificationId,
  variant = "center",
  loadingMore = false,
}: Props) {
  return (
    <div className={cn("flex flex-col", variant === "dropdown" ? "gap-2" : "gap-3")}>
      {notifications.map((item) => {
        const Component =
          notificationComponentMap[item.type as NotificationType] ?? FallbackNotification;

        return (
          <Component
            key={item._id}
            item={item}
            onClickNotification={onClickNotification}
            selected={selectedNotificationId === item._id}
            variant={variant}
          />
        );
      })}

      {hasMore && onLoadMore && (
        <Button
          type="button"
          variant="ghost"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="mt-1 w-full text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/30"
        >
          {loadingMore ? "Đang tải thêm..." : "Xem thêm"}
        </Button>
      )}
    </div>
  );
}
