"use client";

import NotificationList from "@/components/notification/notification-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationCenter } from "@/features/notification/hooks/useNotificationCenter";
import { NotificationFilter } from "@/features/notification/types/notification-center.types";
import { BellRing, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

const filterOptions: Array<{ value: NotificationFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "read", label: "Đã đọc" },
];

export default function NotificationCenterScreen() {
  const {
    notifications,
    selectedNotification,
    setSelectedNotification,
    filter,
    setFilter,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    unreadCount,
    unreadInLoadedList,
    refresh,
    loadMore,
    openNotification,
  } = useNotificationCenter();

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);

    return () => {
      controller.abort();
    };
  }, [refresh]);

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BellRing className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Trung tâm thông báo
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chưa đọc: {unreadCount} • Trong danh sách hiện tại: {unreadInLoadedList}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {filterOptions.map((option) => {
              const isActive = filter === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Đang tải thông báo...
            </p>
          ) : notifications.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Không có thông báo phù hợp với bộ lọc hiện tại.
            </p>
          ) : (
            <NotificationList
              notifications={notifications}
              hasMore={hasMore}
              onLoadMore={() => void loadMore()}
              onClickNotification={(item) => void openNotification(item)}
            />
          )}

          {loadingMore && (
            <p className="pt-3 text-center text-xs text-gray-500 dark:text-gray-400">
              Đang tải thêm...
            </p>
          )}
        </CardContent>
      </Card>

      {selectedNotification && (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chi tiết thông báo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedNotification.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {selectedNotification.message}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="px-0"
              onClick={() => setSelectedNotification(null)}
            >
              Đóng chi tiết
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
