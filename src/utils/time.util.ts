import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const ISO_WITH_TZ_REGEX = /(Z|[+-]\d{2}:\d{2})$/;

export const resolveBrowserTimezone = (): string => {
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

export const formatApiDateToLocalDate = (
  value: string | number | Date,
  locale = "vi-VN"
): string => {
  const localDate = parseApiDateTimeToLocal(value);
  if (!localDate) return "--/--/----";

  const timezoneName = resolveBrowserTimezone();
  return localDate.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezoneName,
  });
};

export const formatApiDateToLocalTime = (
  value: string | number | Date,
  locale = "vi-VN"
): string => {
  const localDate = parseApiDateTimeToLocal(value);
  if (!localDate) return "--:--";

  const timezoneName = resolveBrowserTimezone();

  return localDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezoneName,
  });
};

export const formatApiDateToLocalTimeWithSeconds = (
  value: string | number | Date,
  locale = "vi-VN"
): string => {
  const localDate = parseApiDateTimeToLocal(value);
  if (!localDate) return "--:--:--";

  const timezoneName = resolveBrowserTimezone();

  return localDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezoneName,
  });
};

export const formatApiDateToLocalDateTime = (
  value: string | number | Date,
  locale = "vi-VN",
  includeSeconds = false
): string => {
  const date = formatApiDateToLocalDate(value, locale);
  if (date === "--/--/----") {
    return includeSeconds ? "--/--/---- --:--:--" : "--/--/---- --:--";
  }

  const time = includeSeconds
    ? formatApiDateToLocalTimeWithSeconds(value, locale)
    : formatApiDateToLocalTime(value, locale);

  return `${date} ${time}`;
};

export const normalizeEpochDateInText = (text: string, locale = "vi-VN"): string => {
  if (!text) return text;

  const textWithLocalIsoDateTime = text.replace(
    /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})\b/g,
    (rawIsoDateTime: string) => {
      const formatted = formatApiDateToLocalDateTime(rawIsoDateTime, locale, true);
      if (formatted.includes("--/--/----")) {
        return rawIsoDateTime;
      }

      return formatted;
    }
  );

  const textWithLabeledEpochDateTime = textWithLocalIsoDateTime.replace(
    /(ngày|date|thời\s*gian|time|lúc|at)\s*[:=-]?\s*(\d{10,13})/giu,
    (_full: string, label: string, epochRaw: string) => {
      const formattedDateTime = formatApiDateToLocalDateTime(Number(epochRaw), locale, true);
      if (formattedDateTime.includes("--/--/----")) {
        return `${label} ${epochRaw}`;
      }

      return `${label} ${formattedDateTime}`;
    }
  );

  const textWithDateTimeKeys = textWithLabeledEpochDateTime.replace(
    /(["']?(?:appointmentDate|bookingDate|date|dateTime|time|appointmentTime|startTime|endTime|expiresAt|createdAt|updatedAt)["']?\s*[:=]\s*)(\d{10,13})/giu,
    (_full: string, keyPrefix: string, epochRaw: string) => {
      const formattedDateTime = formatApiDateToLocalDateTime(Number(epochRaw), locale, true);
      if (formattedDateTime.includes("--/--/----")) {
        return `${keyPrefix}${epochRaw}`;
      }

      return `${keyPrefix}${formattedDateTime}`;
    }
  );

  return textWithDateTimeKeys.replace(/(ngày\s+)(\d{10,13})/giu, (_, prefix: string, epochRaw: string) => {
    const formattedDate = formatApiDateToLocalDate(Number(epochRaw), locale);
    if (formattedDate === "--/--/----") return `${prefix}${epochRaw}`;
    return `${prefix}${formattedDate}`;
  });
};
