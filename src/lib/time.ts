"use client";

export class TimeHelper {
  static toSafeDate(input: string | number | Date): Date | null {
    if (input instanceof Date) {
      return Number.isNaN(input.getTime()) ? null : input;
    }

    const direct = new Date(input);
    if (!Number.isNaN(direct.getTime())) {
      return direct;
    }

    if (typeof input === "string") {
      const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const localDate = new Date(year, month - 1, day);
        if (!Number.isNaN(localDate.getTime())) {
          return localDate;
        }
      }
    }

    return null;
  }

  static formatLocalDateTime(
    input: string | number | Date,
    locale = "vi-VN",
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = TimeHelper.toSafeDate(input);
    if (!date) return "";

    try {
      const formatted = date.toLocaleString(locale, options);
      if (formatted && formatted !== "Invalid Date") {
        return formatted;
      }
    } catch {
      // Fall through to Vietnam time
    }

    return TimeHelper.formatVietnamDateTime(date, locale, options);
  }

  static formatLocalDateOnly(
    input: string | number | Date,
    locale = "en-CA",
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = TimeHelper.toSafeDate(input);
    if (!date) return "";

    const baseOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...options,
    };

    try {
      const formatted = date.toLocaleDateString(locale, baseOptions);
      if (formatted && formatted !== "Invalid Date") {
        return formatted;
      }
    } catch {
      // Fall through to Vietnam time
    }

    try {
      return date.toLocaleDateString(locale, {
        ...baseOptions,
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch {
      return "";
    }
  }

  static formatVietnamDateTime(
    input: string | number | Date,
    locale = "vi-VN",
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = TimeHelper.toSafeDate(input);
    if (!date) return "";

    try {
      return date.toLocaleString(locale, {
        ...options,
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch {
      return "";
    }
  }
}
