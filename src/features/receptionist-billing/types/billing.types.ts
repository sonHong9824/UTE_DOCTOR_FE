export interface BillingResponseDto {
  billingId: string;
  visitId: string;
  status: "DRAFT" | "FINALIZED" | "PAID";

  consultationFee: number;
  medicationFee: number;
  totalAmount: number;

  insuranceAmount: number;
  depositUsed: number;

  creditUsed: number;
  coinUsed: number;

  finalPayable: number;
}

export interface ApplyCreditRequestDto {
  creditToUse: number;
}

export interface ApplyCoinRequestDto {
  coinToUse: number;
}

export interface FinalizeBillingResponseDto {
  billingId: string;
  status: "FINALIZED";
}
