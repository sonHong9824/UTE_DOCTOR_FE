import { AccountStatusEnum } from "@/enum/account-status.enum";
import { GenderEnum } from "@/enum/gender.enum";

// Display-only helpers for the profile UI. These never touch API payloads;
// they only translate already-fetched values into polished, localized text.

const EMPTY_LABEL = "Chưa cập nhật";

export const formatDateVN = (value?: Date | string | null): string => {
  if (!value) return EMPTY_LABEL;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_LABEL;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const displayOrEmpty = (value?: string | null): string =>
  value && value.trim().length > 0 ? value : EMPTY_LABEL;

export const getGenderLabel = (gender?: GenderEnum | string): string => {
  switch (gender) {
    case GenderEnum.MALE:
      return "Nam";
    case GenderEnum.FEMALE:
      return "Nữ";
    case GenderEnum.OTHER:
      return "Khác";
    default:
      return EMPTY_LABEL;
  }
};

export interface StatusMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const getStatusMeta = (status?: AccountStatusEnum | string): StatusMeta => {
  switch (status) {
    case AccountStatusEnum.ACTIVE:
      return {
        label: "Đang hoạt động",
        badgeClass:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60",
        dotClass: "bg-emerald-500",
      };
    case AccountStatusEnum.INACTIVE:
      return {
        label: "Ngưng hoạt động",
        badgeClass:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
        dotClass: "bg-amber-500",
      };
    case AccountStatusEnum.BLOCKED:
      return {
        label: "Đã khóa",
        badgeClass:
          "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60",
        dotClass: "bg-rose-500",
      };
    default:
      return {
        label: "Không xác định",
        badgeClass:
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
        dotClass: "bg-slate-400",
      };
  }
};

export const getInitials = (name?: string): string => {
  if (!name) return "BN";
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return initials || "BN";
};
