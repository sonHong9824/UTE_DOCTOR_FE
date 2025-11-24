import { Notification } from "@/types/notification.dto";
import { AlertTriangle, Bell } from "lucide-react";

interface Props {
  notifications: Notification[];
  onLoadMore?: () => void; // callback load thêm
  hasMore?: boolean;        // còn page để load không
  onClickNotification?: (notif: Notification) => void
}

export default function NotificationList({ notifications, onLoadMore, hasMore, onClickNotification  }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {notifications.map((noti) => (
        <div
          key={noti._id}
          onClick={() => onClickNotification?.(noti)}
          className={`
            flex items-start gap-3 p-3 rounded-lg border
            ${noti.isRead ? "bg-gray-100 border-gray-200" : "bg-white border-gray-300"}
            hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition
          `}
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            {noti.title.toLowerCase().includes("cảnh báo") ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{noti.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{noti.message}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date(noti.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      ))}

      {/* Show more button */}
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="py-2 text-center text-sm text-blue-600 hover:underline"
        >
          Show more
        </button>
      )}


    </div>
  );
}
