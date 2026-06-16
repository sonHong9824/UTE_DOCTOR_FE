"use client";

import NotificationList, {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationListSkeleton,
  formatNotificationCount,
  formatNotificationTimestamp,
} from "@/components/notification/notification-list";
import { Button } from "@/components/ui/button";
import { useNotificationCenter } from "@/features/notification/hooks/useNotificationCenter";
import { NotificationFilter } from "@/features/notification/types/notification-center.types";
import { renderNotification } from "@/lib/notification/renderNotification";
import { cn } from "@/lib/utils";
import { BellRing, Inbox, RefreshCcw, X } from "lucide-react";
import { useEffect } from "react";

const filterOptions: Array<{ value: NotificationFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "read", label: "Đã đọc" },
];

const getFilterEmptyCopy = (filter: NotificationFilter) => {
  if (filter === "unread") {
    return {
      title: "Không có thông báo chưa đọc",
      description: "Các thông báo mới cần chú ý sẽ xuất hiện tại đây.",
    };
  }

  if (filter === "read") {
    return {
      title: "Chưa có thông báo đã đọc",
      description: "Sau khi bạn mở một thông báo, nó sẽ được chuyển vào nhóm này.",
    };
  }

  return {
    title: "Chưa có thông báo",
    description: "Các cập nhật về lịch khám, thanh toán và phân công sẽ xuất hiện tại đây.",
  };
};

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
    totalLoaded,
    error,
    refresh,
    loadMore,
    openNotification,
  } = useNotificationCenter();
  const renderedSelectedNotification = selectedNotification
    ? renderNotification(selectedNotification)
    : null;
  const filterEmptyCopy = getFilterEmptyCopy(filter);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);

    return () => {
      controller.abort();
    };
  }, [refresh]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900">
              <BellRing className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
                Trung tâm thông báo
              </h1>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Theo dõi cập nhật mới nhất từ hệ thống UTE Doctor.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900">
                  {formatNotificationCount(unreadCount)} chưa đọc
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {unreadInLoadedList} chưa đọc trong danh sách
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="w-full justify-center gap-2 border-slate-200 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-sky-950/30 dark:hover:text-sky-300 sm:w-auto"
          >
            <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Làm mới
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
              Danh sách thông báo
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {totalLoaded > 0
                ? `${totalLoaded} thông báo đã tải`
                : "Chưa có thông báo nào được tải"}
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
            {filterOptions.map((option) => {
              const isActive = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    isActive
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6">
          {loading && totalLoaded === 0 ? (
            <NotificationListSkeleton count={5} />
          ) : error && totalLoaded === 0 ? (
            <NotificationErrorState description={error} onRetry={() => void refresh()} />
          ) : notifications.length === 0 ? (
            <NotificationEmptyState
              title={filterEmptyCopy.title}
              description={filterEmptyCopy.description}
            />
          ) : (
            <NotificationList
              notifications={notifications}
              hasMore={hasMore}
              loadingMore={loadingMore}
              selectedNotificationId={selectedNotification?._id}
              onLoadMore={() => void loadMore()}
              onClickNotification={(item) => void openNotification(item)}
            />
          )}

          {error && totalLoaded > 0 && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-200">
              {error}
            </div>
          )}
        </div>
      </section>

      {selectedNotification && renderedSelectedNotification && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900">
                  <Inbox className="h-3.5 w-3.5" />
                  Chi tiết
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {formatNotificationTimestamp(selectedNotification.createdAt)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                {renderedSelectedNotification.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNotification(null)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              aria-label="Đóng chi tiết thông báo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
            {renderedSelectedNotification.message}
          </p>
        </section>
      )}
    </div>
  );
}
