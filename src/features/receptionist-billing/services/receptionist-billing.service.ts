import { /*getPaymentStatus as fetchPaymentStatus, PaymentStatusDto*/ } from "@/apis/payment/payment.api";
import { applyCoin, applyCredit, finalizeBilling, getBillingByVisitId, getWalletSummary } from "@/apis/receptionist/billing.api";
import { markCashPaid as confirmReceptionistCashPaid, getPaymentQR as fetchReceptionistPaymentQR } from "@/apis/receptionist/payment.api";
import { getTodayVisits, VisitApiItem } from "@/apis/receptionist/receptionist.api";
import { BillingResponseDto, FinalizeBillingRequestDto, WalletSummaryDto } from "@/features/receptionist-billing/types/billing.types";

export const receptionistBillingService = {
  async getTodayVisits(): Promise<VisitApiItem[]> {
    const res = await getTodayVisits();
    return Array.isArray(res?.data) ? res.data : [];
  },

  async getBillingByVisitId(visitId: string): Promise<BillingResponseDto> {
    const res = await getBillingByVisitId(visitId);
    return res?.data;
  },

  async applyCredit(billingId: string, creditToUse: number) {
    const res = await applyCredit(billingId, creditToUse);
    return res?.data;
  },

  async applyCoin(billingId: string, coinToUse: number) {
    const res = await applyCoin(billingId, coinToUse);
    return res?.data;
  },

  async finalizeBilling(billingId: string, payload: FinalizeBillingRequestDto) {
    const res = await finalizeBilling(billingId, payload);
    return res?.data;
  },

  async getPaymentQR(billingId: string) {
    return fetchReceptionistPaymentQR(billingId);
  },

  async markCashPaid(paymentId: string) {
    return confirmReceptionistCashPaid(paymentId);
  },

  async getWalletSummary(billingId: string): Promise<WalletSummaryDto | null> {
    try {
      const res = await getWalletSummary(billingId);
      return res?.data ?? null;
    } catch (error) {
      console.error("Failed to fetch wallet summary", error);
      return null;
    }
  },
};
