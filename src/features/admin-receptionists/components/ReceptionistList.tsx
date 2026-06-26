import {
  AlertCircle,
  Building2,
  CalendarDays,
  Loader2,
  Mail,
  MapPin,
  Phone,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ReceptionistListItem } from "@/features/admin-receptionists/types/admin-receptionist.types";
import {
  formatApiDateToLocalDate,
  formatApiDateToLocalDateTime,
} from "@/utils/time.util";

interface ReceptionistListProps {
  receptionists: ReceptionistListItem[];
  loading: boolean;
  error: string;
  search: string;
  page: number;
  totalPages: number;
  viewMode: "grid" | "list";
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onClearSearch: () => void;
}

const genderLabel = (gender?: string) => {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  if (gender === "other") return "Khác";
  return "-";
};

const statusClassName = (status?: string) => {
  if (status === "ACTIVE") return "bg-green-100 text-green-800";
  if (status === "BLOCKED") return "bg-red-100 text-red-800";
  if (status === "INACTIVE") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-700";
};

const ReceptionistAvatar = ({
  receptionist,
  compact = false,
}: {
  receptionist: ReceptionistListItem;
  compact?: boolean;
}) => {
  const sizeClass = compact ? "h-10 w-10" : "h-16 w-16";

  if (receptionist.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={receptionist.avatarUrl}
        alt={receptionist.fullName || "Lễ tân"}
        className={`${sizeClass} rounded-full border-4 border-indigo-100 object-cover dark:border-indigo-900`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full border-4 border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950`}
    >
      <UserRound className={compact ? "size-5" : "size-7"} />
    </div>
  );
};

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: Pick<ReceptionistListProps, "page" | "totalPages" | "onPageChange">) => (
  <div className="flex items-center justify-between gap-4">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Hiển thị trang {page} / {Math.max(totalPages, 1)}
    </p>
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹ Trước
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Sau ›
      </Button>
    </div>
  </div>
);

export const ReceptionistList = ({
  receptionists,
  loading,
  error,
  search,
  page,
  totalPages,
  viewMode,
  onPageChange,
  onRetry,
  onClearSearch,
}: ReceptionistListProps) => {
  if (loading) {
    return (
      <Card className="cursor-default hover:scale-100">
        <CardContent className="flex min-h-64 items-center justify-center gap-2 p-12 text-gray-500">
          <Loader2 className="animate-spin" />
          Đang tải danh sách lễ tân...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="cursor-default hover:scale-100">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-12 text-center">
          <AlertCircle className="size-9 text-red-500" />
          <p className="text-red-600">{error}</p>
          <Button type="button" variant="outline" onClick={onRetry}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (receptionists.length === 0) {
    return (
      <Card className="cursor-default hover:scale-100">
        <CardContent className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
            <UsersRound className="size-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Không tìm thấy lễ tân
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {search
              ? "Thử tìm kiếm với từ khóa khác."
              : "Chưa có tài khoản lễ tân trong hệ thống."}
          </p>
          {search ? (
            <Button type="button" variant="outline" onClick={onClearSearch}>
              Xóa bộ lọc
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {receptionists.map((receptionist) => (
            <Card
              key={receptionist.receptionistId}
              className="transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start gap-4">
                  <ReceptionistAvatar receptionist={receptionist} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                      {receptionist.fullName || "Chưa cập nhật tên"}
                    </h3>
                    <span
                      className={`mt-1 inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusClassName(
                        receptionist.accountStatus
                      )}`}
                    >
                      {receptionist.accountStatus || "UNKNOWN"}
                    </span>
                    <div className="mt-2 inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      <Building2 className="size-3" />
                      {receptionist.hospitalName || "Chưa cập nhật cơ sở"}
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="size-3.5 shrink-0" />
                    <span className="truncate">{receptionist.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{receptionist.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="line-clamp-1">{receptionist.address || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CalendarDays className="size-3.5 shrink-0" />
                    <span>
                      {receptionist.dateOfBirth
                        ? formatApiDateToLocalDate(receptionist.dateOfBirth)
                        : "-"}{" "}
                      · {genderLabel(receptionist.gender)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 text-xs text-gray-500">
                  Ngày tạo:{" "}
                  {receptionist.createdAt
                    ? formatApiDateToLocalDateTime(receptionist.createdAt)
                    : "-"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="cursor-default hover:scale-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Lễ tân
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Cơ sở
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Thông tin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {receptionists.map((receptionist) => (
                    <tr
                      key={receptionist.receptionistId}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ReceptionistAvatar
                            receptionist={receptionist}
                            compact
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {receptionist.fullName || "-"}
                            </p>
                            <span
                              className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusClassName(
                                receptionist.accountStatus
                              )}`}
                            >
                              {receptionist.accountStatus || "UNKNOWN"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {receptionist.hospitalName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p>{receptionist.email || "-"}</p>
                        <p className="text-gray-500">{receptionist.phone || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p>{genderLabel(receptionist.gender)}</p>
                        <p className="text-gray-500">
                          {receptionist.dateOfBirth
                            ? formatApiDateToLocalDate(receptionist.dateOfBirth)
                            : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {receptionist.createdAt
                          ? formatApiDateToLocalDateTime(receptionist.createdAt)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
