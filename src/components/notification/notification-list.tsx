import { Notification, NotificationType } from "@/types/notification.dto";
import { formatApiDateToLocalTime } from "@/utils/time.util";
import { AlertTriangle, Bell, Calendar, CircleDollarSign } from "lucide-react";
import { ComponentType, ReactNode } from "react";
import { renderNotification } from "@/lib/notification/renderNotification";

interface Props {
  notifications: Notification[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  onClickNotification?: (notif: Notification) => void;
}

type NotificationItemProps = {
  item: Notification;
  onClickNotification?: (notif: Notification) => void;
};

const NotificationItemShell = ({
  item,
  icon,
  badgeClassName,
  onClickNotification,
}: {
  item: Notification;
  icon: ReactNode;
  badgeClassName: string;
  onClickNotification?: (notif: Notification) => void;
}) => {
  const renderedNotification = renderNotification(item);

  return (
    <div
      key={item._id}
      onClick={() => onClickNotification?.(item)}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition dark:border-gray-800 ${
        item.isRead ? "bg-white dark:bg-gray-900" : "bg-blue-50 dark:bg-blue-900/20"
      } hover:bg-gray-100 dark:hover:bg-gray-800`}
    >
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${badgeClassName}`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex w-full items-center justify-between">
          <p className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">
            {renderedNotification.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatApiDateToLocalTime(item.createdAt)}
          </p>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
          {renderedNotification.message}
        </p>
      </div>
    </div>
  );
};

const CoinExpiryNotification = ({ item, onClickNotification }: NotificationItemProps) => (
  <NotificationItemShell
    item={item}
    onClickNotification={onClickNotification}
    badgeClassName="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"
    icon={<AlertTriangle className="h-4 w-4" />}
  />
);

const AppointmentNotification = ({ item, onClickNotification }: NotificationItemProps) => (
  <NotificationItemShell
    item={item}
    onClickNotification={onClickNotification}
    badgeClassName="bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400"
    icon={<Calendar className="h-4 w-4" />}
  />
);

const AppointmentCancelledNotification = ({
  item,
  onClickNotification,
}: NotificationItemProps) => (
  <NotificationItemShell
    item={item}
    onClickNotification={onClickNotification}
    badgeClassName="bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-400"
    icon={<AlertTriangle className="h-4 w-4" />}
  />
);

const PaymentNotification = ({ item, onClickNotification }: NotificationItemProps) => (
  <NotificationItemShell
    item={item}
    onClickNotification={onClickNotification}
    badgeClassName="bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
    icon={<CircleDollarSign className="h-4 w-4" />}
  />
);

const notificationComponentMap: Partial<Record<NotificationType, ComponentType<NotificationItemProps>>> = {
  COIN_EXPIRY_REMINDER: CoinExpiryNotification,
  APPOINTMENT_SUCCESS: AppointmentNotification,
  APPOINTMENT_CANCELLED: AppointmentCancelledNotification,
  APPOINTMENT_RESCHEDULED: AppointmentNotification,
  PAYMENT_SUCCESS: PaymentNotification,
  ASSIGNMENT_TASK_CREATED: AppointmentNotification,
  ASSIGNMENT_TASK_REMINDER: AppointmentCancelledNotification,
  ASSIGNMENT_TASK_EXPIRED: AppointmentCancelledNotification,
  APPOINTMENT_DOCTOR_ASSIGNED: AppointmentNotification,
};

const FallbackNotification = ({
  item,
  onClickNotification,
}: {
  item: Notification;
  onClickNotification?: (notif: Notification) => void;
}) => (
  <NotificationItemShell
    item={item}
    onClickNotification={onClickNotification}
    badgeClassName="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
    icon={<Bell className="h-4 w-4" />}
  />
);

export default function NotificationList({
  notifications,
  onLoadMore,
  hasMore,
  onClickNotification,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      {notifications.map((item) => {
        if (!item.type) {
          return (
            <FallbackNotification
              key={item._id}
              item={item}
              onClickNotification={onClickNotification}
            />
          );
        }

        const Component = notificationComponentMap[item.type as NotificationType] ?? FallbackNotification;

        return (
          <Component
            key={item._id}
            item={item}
            onClickNotification={onClickNotification}
          />
        );
      })}

      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="py-2 text-center text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Show more
        </button>
      )}
    </div>
  );
}
