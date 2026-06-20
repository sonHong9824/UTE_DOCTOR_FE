const REASON_MESSAGES: Record<string, string> = {
  NOT_OVERDUE: "Lịch khám chưa quá thời gian cho phép để đánh dấu không đến khám.",
  VISIT_CHECKED_IN: "Bệnh nhân đã check-in nên không thể đánh dấu không đến khám.",
  ENCOUNTER_EXISTS: "Lượt khám đã có hồ sơ khám nên không thể đánh dấu không đến khám.",
  BILLING_EXISTS: "Lượt khám đã phát sinh hóa đơn nên không thể đánh dấu không đến khám.",
  NOT_CONFIRMED: "Chỉ lịch khám đã xác nhận mới có thể đánh dấu không đến khám.",
  NOT_ASSIGNED: "Lịch khám chưa được phân bác sĩ hoặc khung giờ.",
  NO_VISIT: "Không tìm thấy lượt khám liên kết.",
};

export const getMarkNoShowErrorMessage = (error: unknown): string => {
  const apiError = error as {
    response?: {
      data?: {
        message?: string | string[];
        data?: { reason?: string };
      };
    };
    message?: string;
  };

  const reason = apiError?.response?.data?.data?.reason;
  if (reason && REASON_MESSAGES[reason]) return REASON_MESSAGES[reason];

  const message = apiError?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || apiError?.message || "Không thể đánh dấu bệnh nhân không đến khám.";
};
