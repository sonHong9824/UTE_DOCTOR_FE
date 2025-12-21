import { Notification } from "@/types/notification.dto";
import { AlertTriangle, Bell, Calendar, MessageSquare } from "lucide-react";

interface Props {
  notifications: Notification[];
  onLoadMore?: () => void; // callback load thêm
  hasMore?: boolean;        // còn page để load không
  onClickNotification?: (notif: Notification) => void
}

export default function NotificationList({ notifications, onLoadMore, hasMore, onClickNotification  }: Props) {
  const renderIcon = (noti: Notification) => {
    const title = (noti.title || "").toLowerCase();
    const type = (noti as any).type as string | undefined;

    if (title.includes("cảnh báo")) return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    if (type === 'message') return <MessageSquare className="w-4 h-4" />;
    if (type === 'appointment') return <Calendar className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  const getBadgeClasses = (noti: Notification) => {
    const type = (noti as any).type as string | undefined;
    if (type === 'appointment') return "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400";
    if (type === 'message') return "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400";
    if (type === 'reminder') return "bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400";
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
  };

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((noti) => (
        <div
          key={noti._id}
          onClick={() => onClickNotification?.(noti)}
          className={`flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer transition
            ${noti.isRead ? "bg-white dark:bg-gray-900" : "bg-blue-50 dark:bg-blue-900/20"}
            hover:bg-gray-100 dark:hover:bg-gray-800`}
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getBadgeClasses(noti)}`}>
            {renderIcon(noti)}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{noti.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(noti.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{noti.message}</p>
          </div>
        </div>
      ))}

      {/* Show more button */}
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="py-2 text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Show more
        </button>
      )}


    </div>
  );
}
