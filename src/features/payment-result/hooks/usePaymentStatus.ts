"use client";

import { paymentResultService } from "@/features/payment-result/services/payment-result.service";
import {
    PaymentResultData,
    PaymentResultState,
    PaymentViewStatus,
} from "@/features/payment-result/types/payment-result.types";
import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 8;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "response" in error) {
    const response = error as { response?: { data?: { message?: string } } };
    return response.response?.data?.message || "Không thể tải trạng thái thanh toán.";
  }

  return "Không thể tải trạng thái thanh toán.";
};

export const usePaymentStatus = (orderId: string | null): PaymentResultState => {
  const [status, setStatus] = useState<PaymentViewStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentResultData | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttemptRef = useRef(0);
  const requestIdRef = useRef(0);

  const clearPolling = useCallback(() => {
    if (pollingTimeoutRef.current !== null) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const runPolling = useCallback(
    async (isInitialRequest: boolean) => {
      if (!orderId) {
        return;
      }

      const requestId = ++requestIdRef.current;

      if (isInitialRequest) {
        setLoading(true);
        setError(null);
        setStatus(null);
        setPayment(null);
        pollAttemptRef.current = 0;
      }

      try {
        const result = await paymentResultService.fetchPaymentStatus(orderId);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setPayment(result);

        if (result.status === "PENDING") {
          if (pollAttemptRef.current >= MAX_POLL_ATTEMPTS) {
            setStatus("TIMEOUT");
            setLoading(false);
            clearPolling();
            return;
          }

          setStatus("PENDING");
          setLoading(false);
          pollAttemptRef.current += 1;
          clearPolling();
          pollingTimeoutRef.current = setTimeout(() => {
            void runPolling(false);
          }, POLL_INTERVAL_MS);
          return;
        }

        setStatus(result.status);
        setLoading(false);
        clearPolling();
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(getErrorMessage(err));
        setLoading(false);
        clearPolling();
      }
    },
    [clearPolling, orderId]
  );

  const retry = useCallback(() => {
    if (!orderId) {
      return;
    }

    clearPolling();
    pollAttemptRef.current = 0;
    setRetryCount((current) => current + 1);
  }, [clearPolling, orderId]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError(null);
      setStatus(null);
      setPayment(null);
      clearPolling();
      return;
    }

    void runPolling(true);

    return () => {
      requestIdRef.current += 1;
      clearPolling();
    };
  }, [clearPolling, orderId, retryCount, runPolling]);

  return {
    status,
    loading,
    error,
    payment,
    retry,
  };
};