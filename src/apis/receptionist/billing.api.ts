import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

import {
    ApplyCoinRequestDto,
    ApplyCreditRequestDto,
    BillingResponseDto,
    FinalizeBillingResponseDto,
} from "@/features/receptionist-billing/types/billing.types";

type ApplyCreditResponseDto = DataResponse<Pick<BillingResponseDto, "billingId" | "creditUsed" | "finalPayable">>;
type ApplyCoinResponseDto = DataResponse<Pick<BillingResponseDto, "billingId" | "coinUsed" | "finalPayable">>;
type BillingSnapshotResponseDto = DataResponse<BillingResponseDto>;
type FinalizeBillingApiResponseDto = DataResponse<FinalizeBillingResponseDto>;

export const getBillingByVisitId = async (visitId: string) => {
  const res = await axiosClient.get<BillingSnapshotResponseDto>(`/receptionist/billing/${visitId}`);
  return res.data;
};

export const applyCredit = async (billingId: string, creditToUse: number) => {
  const payload: ApplyCreditRequestDto = { creditToUse };
  const res = await axiosClient.patch<ApplyCreditResponseDto>(
    `/receptionist/billings/${billingId}/apply-credit`,
    payload
  );

  return res.data;
};

export const applyCoin = async (billingId: string, coinToUse: number) => {
  const payload: ApplyCoinRequestDto = { coinToUse };
  const res = await axiosClient.patch<ApplyCoinResponseDto>(
    `/receptionist/billings/${billingId}/apply-coin`,
    payload
  );

  return res.data;
};

export const finalizeBilling = async (billingId: string) => {
  const res = await axiosClient.post<FinalizeBillingApiResponseDto>(
    `/receptionist/billings/${billingId}/finalize`
  );

  return res.data;
};
