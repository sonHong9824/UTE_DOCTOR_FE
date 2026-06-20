"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { receptionistVisitService } from "@/features/receptionist-visits/services/receptionist-visit.service";
import {
  EMPTY_VITAL_SIGN_FORM,
  type VitalSignFieldErrors,
  type VitalSignFieldKey,
  type VitalSignFormValues,
  type VitalSignRecord,
} from "@/features/receptionist-visits/types/vital-sign.types";
import {
  buildVitalSignPayload,
  hasVitalSignErrors,
  validateVitalSignForm,
} from "@/features/receptionist-visits/utils/vital-sign.utils";

const getErrorMessage = (error: unknown): string => {
  const apiError = error as {
    response?: { data?: { message?: unknown } };
    message?: unknown;
  };
  const apiMessage = apiError?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage) return apiMessage;
  if (typeof apiError?.message === "string" && apiError.message) return apiError.message;
  return "Không thể ghi nhận chỉ số. Vui lòng thử lại.";
};

interface UseVitalSignFormArgs {
  visitId: string;
  onSaved?: (record: VitalSignRecord) => void;
}

export const useVitalSignForm = ({ visitId, onSaved }: UseVitalSignFormArgs) => {
  const [values, setValues] = useState<VitalSignFormValues>({ ...EMPTY_VITAL_SIGN_FORM });
  const [touched, setTouched] = useState<Partial<Record<VitalSignFieldKey, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<VitalSignRecord | null>(null);

  const errors = useMemo<VitalSignFieldErrors>(() => validateVitalSignForm(values), [values]);

  const setField = useCallback((key: VitalSignFieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    // A new edit invalidates a prior server rejection for that attempt.
    setServerError(null);
  }, []);

  const blurField = useCallback((key: VitalSignFieldKey) => {
    setTouched((current) => ({ ...current, [key]: true }));
  }, []);

  /** A field error is shown once the field is touched or the user attempted to submit. */
  const visibleError = useCallback(
    (key: VitalSignFieldKey): string | undefined => {
      if (!submitAttempted && !touched[key]) return undefined;
      return errors[key];
    },
    [errors, submitAttempted, touched]
  );

  const formError = submitAttempted ? errors.form : undefined;

  const reset = useCallback(() => {
    setValues({ ...EMPTY_VITAL_SIGN_FORM });
    setTouched({});
    setSubmitAttempted(false);
    setServerError(null);
    setSavedRecord(null);
  }, []);

  const submit = useCallback(async () => {
    setSubmitAttempted(true);

    const validationErrors = validateVitalSignForm(values);
    if (hasVitalSignErrors(validationErrors)) {
      return;
    }

    setServerError(null);
    setSubmitting(true);

    try {
      const record = await receptionistVisitService.recordVitalSign(
        visitId,
        buildVitalSignPayload(values)
      );
      setSavedRecord(record);
      toast.success("Đã ghi nhận chỉ số sinh hiệu");
      onSaved?.(record);
    } catch (error) {
      // Surface the backend's rejection inline; never fake success.
      setServerError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [onSaved, values, visitId]);

  return {
    values,
    setField,
    blurField,
    visibleError,
    formError,
    submitting,
    serverError,
    savedRecord,
    submit,
    reset,
  };
};
