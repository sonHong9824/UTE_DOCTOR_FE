import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const ISO_WITH_TZ_REGEX = /(Z|[+-]\d{2}:\d{2})$/;

const resolveBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

export const buildZonedISO = (date: string, time: string): string => {
  const timezoneName = resolveBrowserTimezone();
  const parsed = dayjs.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", timezoneName);

  if (!parsed.isValid()) {
    throw new Error(`Invalid date/time input. Received date=${date}, time=${time}`);
  }

  return parsed.format("YYYY-MM-DDTHH:mm:ssZ");
};

export const ensureHasTimezone = (iso: string): boolean => {
  return ISO_WITH_TZ_REGEX.test(iso);
};

export const assertValidISO = (iso: string): void => {
  if (!dayjs(iso).isValid()) {
    throw new Error(`Invalid ISO datetime: ${iso}`);
  }

  if (!ensureHasTimezone(iso)) {
    throw new Error(`ISO datetime must include timezone: ${iso}`);
  }
};

export const toUTCISOString = (iso: string): string => {
  assertValidISO(iso);
  return dayjs(iso).utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
};

export const toLocalDateInput = (value: Date | string): string => {
  const timezoneName = resolveBrowserTimezone();
  const parsed = dayjs(value).tz(timezoneName);

  if (!parsed.isValid()) {
    throw new Error(`Invalid date value: ${String(value)}`);
  }

  return parsed.format("YYYY-MM-DD");
};

export const getCurrentLocalTimeHHmm = (): string => {
  const timezoneName = resolveBrowserTimezone();
  return dayjs().tz(timezoneName).format("HH:mm");
};

const toEpochMs = (value: number): number => {
  // 10-digit epoch is seconds; 13-digit epoch is milliseconds.
  return value < 1_000_000_000_000 ? value * 1000 : value;
};

export const parseApiDateTimeToLocal = (value: string | number | Date): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const parsedEpoch = new Date(toEpochMs(value));
    return Number.isNaN(parsedEpoch.getTime()) ? null : parsedEpoch;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) {
        const parsedEpoch = new Date(toEpochMs(numeric));
        return Number.isNaN(parsedEpoch.getTime()) ? null : parsedEpoch;
      }
    }

    const parsed = dayjs(trimmed);
    if (!parsed.isValid()) return null;
    return parsed.toDate();
  }

  return null;
};

export const normalizeApiDateToLocalISO = (value: string | number | Date): string => {
  const localDate = parseApiDateTimeToLocal(value);
  if (!localDate) return "";

  const timezoneName = resolveBrowserTimezone();
  return dayjs(localDate).tz(timezoneName).format("YYYY-MM-DDTHH:mm:ssZ");
};

export const formatApiDateToLocalTime = (
  value: string | number | Date,
  locale = "vi-VN"
): string => {
  const localDate = parseApiDateTimeToLocal(value);
  if (!localDate) return "--:--";

  return localDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const normalizeEpochDateInText = (text: string, locale = "vi-VN"): string => {
  if (!text) return text;

  return text.replace(/(ngày\s+)(\d{10,13})/giu, (_, prefix: string, epochRaw: string) => {
    const parsed = parseApiDateTimeToLocal(Number(epochRaw));
    if (!parsed) return `${prefix}${epochRaw}`;
    return `${prefix}${parsed.toLocaleDateString(locale)}`;
  });
};
