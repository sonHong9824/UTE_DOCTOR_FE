# Current Appointment -> Visit -> Billing -> Payment Flow

Last reviewed: 2026-05-25

This document describes the current observable flow in this frontend repository plus the current `api-contract` submodule. The backend implementation source is not present in this workspace, so backend service/function names are taken from `api-contract/api.md`, `api-contract/README_APPOINTMENT_BOOKING_CURRENT_FLOW.md`, and `api-contract/BOOK_APPOINTMENT_REFACTOR_SUMMARY.md`. When frontend code and contract/docs disagree, this document calls that out explicitly.

## Files and Functions Inspected

Frontend booking:
- `src/features/appointment/types/appointment.types.ts`
- `src/features/appointment/hooks/useAppointmentBooking.ts`
- `src/features/appointment/screens/AppointmentBookingScreen.tsx`
- `src/features/appointment/services/appointment.service.ts`
- `src/apis/appointment/appointment.api.ts`
- `src/utils/time.util.ts`

Frontend visits:
- `src/apis/receptionist/receptionist.api.ts`
- `src/features/receptionist-visits/services/receptionist-visit.service.ts`
- `src/features/receptionist-visits/hooks/useTodayVisits.ts`
- `src/features/receptionist-visits/types/visit.types.ts`
- `src/features/receptionist-visits/utils/visit.utils.ts`
- `src/apis/doctor/visits.api.ts`
- `src/types/visit.dto.ts`
- `src/enum/visit-status.enum.ts`
- `src/enum/appointment-status.enum.ts`

Frontend billing/payment:
- `src/apis/receptionist/billing.api.ts`
- `src/features/receptionist-billing/types/billing.types.ts`
- `src/features/receptionist-billing/services/receptionist-billing.service.ts`
- `src/features/receptionist-billing/hooks/useReceptionistBilling.ts`
- `src/features/receptionist-billing/utils/billing-fulfillment.ts`
- `src/apis/receptionist/payment.api.ts`
- `src/apis/payment/payment.api.ts`
- `src/features/payment-result/services/payment-result.service.ts`
- `src/features/payment-result/types/payment-result.types.ts`

Contracts/docs:
- `api-contract/api.md`
- `api-contract/README_APPOINTMENT_BOOKING_CURRENT_FLOW.md`
- `api-contract/BOOK_APPOINTMENT_REFACTOR_SUMMARY.md`

## 1. High-level lifecycle summary

Current visit/billing-oriented lifecycle, based on `api-contract/api.md` and FE modules:

```text
Patient booking request
-> Appointment created
-> Appointment confirmed
-> Visit(CREATED) created
-> Receptionist check-in
-> Visit(CHECKED_IN)
-> Doctor starts visit
-> Visit(IN_PROGRESS)
-> Doctor completes visit
-> MedicalEncounter saved
-> Appointment/Visit marked COMPLETED
-> Billing(DRAFT) created
-> Receptionist applies optional credit/coin draft discounts
-> Receptionist finalizes billing
-> Billing(FINALIZED)
-> Payment(PENDING) created or returned for billingId
-> Payment success via VNPay callback or cash mark-paid
-> Billing(PAID)
```

Verified status enums:
- Appointment FE enum: `PENDING | CONFIRMED | FAILED | COMPLETED | CANCELLED | RESCHEDULED` in `src/enum/appointment-status.enum.ts`.
- Visit FE enum: `CREATED | CHECKED_IN | IN_PROGRESS | COMPLETED` in `src/enum/visit-status.enum.ts`.
- Billing FE type: `DRAFT | FINALIZED | PAID` in `src/features/receptionist-billing/types/billing.types.ts`.
- Receptionist cash payment response type: `SUCCESS | string` in `src/apis/receptionist/payment.api.ts`.
- Legacy payment-result status type: `PENDING | COMPLETED | FAILED` in `src/features/payment-result/types/payment-result.types.ts`.
- Contract billing payment success uses `Payment.status = SUCCESS` and `Billing.status = PAID`.

Important current split:
- The current FE booking screen still sends legacy booking payment metadata (`paymentMethod`, `amount`, `useCoin`, `coinsToUse`), but the receptionist flow uses billing-scoped payment by `billingId`.
- `api-contract/api.md` contains both old appointment-based booking-payment text and new billing-based payment notes. The newer billing/receptionist sections should be treated as the current main flow.

## 2. Stage-by-stage details

### Stage 1: Patient submits booking request

Actual FE behavior:
- Screen: `AppointmentBookingScreen`
- Hook: `useAppointmentBooking`
- Service: `appointmentService.book`
- API function: `bookAppointment`
- Endpoint: `POST /appointment/book`
- Auth: required by contract; FE relies on `axiosClient` interceptor to attach JWT.
- FE DTO/type: `AppointmentBookingPayload` extends `AppointmentBookingFormValues`.
- Contract DTO: `AppointmentBookingRequestDto`.

Request body fields in contract:
- `hospitalName`
- `appointmentDate`
- `bookingDate`
- `date` deprecated alias
- `specialty`
- `timeSlotId`
- `doctor: { id, name, email }`
- `serviceType`
- `paymentMethod`
- `visitType`
- `paymentCategory`
- `depositAmount`
- `amount`
- `reasonForAppointment`
- `coinsToUse`
- `useCoin`

FE defaults in `useAppointmentBooking.initialForm()`:
- `hospitalName`: fixed hospital label.
- `appointmentDate`: local date string from `getTodayLocalDate()`.
- `serviceType`: `KHAM_DICH_VU`.
- `visitType`: `OFFLINE`.
- `paymentCategory`: `DICH_VU`.
- `depositAmount`: `100000`.
- `paymentMethod`: `ONLINE`.
- `amount`: `100000`.
- `useCoin`: `false`.
- `coinsToUse`: `0`.

FE validation/normalization before sending:
- Requires a selected `timeSlotId` from `timeSlots`.
- Builds local scheduled datetime using `buildZonedISO(formData.appointmentDate, selectedSlot.start)`.
- Builds local booking timestamp using current local date and time.
- Validates both values with `assertValidISO`.
- Converts both to UTC with `toUTCISOString`.
- Normalizes `paymentCategory` to `BHYT` or `DICH_VU`.
- Normalizes `depositAmount`: `BHYT -> 0`, `DICH_VU -> max(0, Number(depositAmount) || 0)`.
- Normalizes `paymentMethod`: `BHYT -> OFFLINE`, otherwise `ONLINE`.
- Forces `useCoin = false` and `coinsToUse = 0`.

Date/time handling:
- `src/utils/time.util.ts` is used.
- Client builds timezone-aware local ISO first, then sends UTC ISO.
- This matches AGENTS.md: client uses local time for UI and converts to UTC for requests.
- FE does not manually construct bare timezone-less payload datetime strings in the booking submit path.

Response shape used by FE:
```ts
DataResponse<{
  appointmentId?: string;
  paymentUrl?: string;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
} | null>
```

FE currently treats `res.code === "SUCCESS"` or `res.code === "PENDING"` as successful booking UI. It shows the same success modal copy for both and does not currently redirect to `paymentUrl` from booking.

Business meaning:
- Patient requests a scheduled medical visit.
- This is not the actual examination.
- Booking carries category/deposit/payment metadata that later informs operational and billing flows.

Known stale/gap:
- The booking contract still describes immediate appointment-based ONLINE/VNPAY/CREDIT payment behavior. Current receptionist flow uses billing-based payment by `billingId`.
- FE still sends `paymentMethod=ONLINE` for `DICH_VU`, but it does not use the returned booking `paymentUrl`.

### Stage 2: Slot lock and availability check

Contract-stated backend behavior:
- Service named in docs: `AppointmentBookingService.bookAppointment`.
- Redis lock key: `slot:{doctorId}:{timeSlotId}`.
- Lock command: `SET slot:{doctorId}:{timeSlotId} NX EX 300` in latest endpoint contract.
- Older notes mention TTL aligned with `VN_PAY_EXPIRE_MINUTES`, default 15 minutes.
- DB pre-check: same `(doctorId, appointmentDate, timeSlot)` with status in `PENDING | CONFIRMED`.
- DB unique index: active bookings on `(doctorId, appointmentDate, timeSlot)` where status is `PENDING | CONFIRMED`.
- Duplicate key `11000` should map to `Slot already booked`.

What happens on lock/pre-check failure:
- Contract response example:
```json
{ "code": "ERROR", "message": "Slot already booked", "data": null }
```
- FE booking treats non-`SUCCESS`/`PENDING` response as an error modal with backend message.

Business meaning:
- Redis reduces race contention.
- Database pre-check and unique index are the final correctness gate against double booking.

Known stale/gap:
- The contract still says TTL is aligned with VNPay expiry in the notes, while the current cancel/visit flow implies slot lock should not be used as payment truth.

### Stage 3: Appointment creation

Contract-stated backend behavior:
- Service named in docs: `AppointmentBookingService.bookAppointment`.
- Helper named in old docs: `createAppointmentWithTransaction`.
- Mongo transaction:
  - Insert appointment with `PENDING`.
  - Persist snapshot time and amount fields.
  - Mark `TimeSlotLog.status = booked`.
- Current contract says appointment persists `paymentCategory`, `depositAmount`, `coinDiscountAmount`, and `paymentAmount = finalAmount`.

FE-visible downstream:
- `getAppointments` fetches `/appointment/patient`.
- `getAppointmentById` fetches `/appointment/:id`.
- Appointment list/detail components show `appointmentStatus`, doctor, service, reason, fee.

Field mapping table:

| Field | DTO name | Stored field | Persisted? | Meaning | Notes/Risk |
|---|---|---|---|---|---|
| Hospital | `hospitalName` | `hospitalName` | Contract says yes | Display/notification hospital label | FE sends fixed value. |
| Scheduled datetime | `appointmentDate` | `appointmentDate`, `scheduledAt`, `startTime`, `endTime`, legacy `date` | Contract says yes | When the medical visit should happen | FE sends UTC ISO with timezone. |
| Booking timestamp | `bookingDate` | `bookingDate` | Contract says yes | When booking request was created | FE sends UTC ISO. Server may default if omitted. |
| Legacy date | `date` | legacy alias/fallback | Accepted temporarily | Deprecated alias for scheduled datetime | FE current booking does not send `date`. |
| Specialty | `specialty` | `specialtyId` | Old docs say yes | Specialty reference | FE sends selected specialty `_id`; contract says optional. |
| Time slot | `timeSlotId` | `timeSlot` or slot reference | Contract says yes | Selected slot | Also drives Redis lock and slot update. |
| Doctor id | `doctor.id` | `doctorId` | Yes | Doctor ownership/scheduling | Required by contract. |
| Doctor name/email | `doctor.name`, `doctor.email` | likely snapshots or enrichment only | Unclear | Display/notification helper | Contract requires object but only id is core. |
| Service type | `serviceType` | `serviceType` | Contract says yes | Service category | FE hardcodes `KHAM_DICH_VU`. |
| Payment method | `paymentMethod` | `paymentMethod` and/or payment branch | Contract says yes | Legacy booking payment route | FE sends `OFFLINE` for BHYT, `ONLINE` for DICH_VU. Current main flow is billing-based. |
| Visit type | `visitType` | unclear | Accepted | Offline visit marker | Contract says defaults to `OFFLINE`; persistence not proven from FE. |
| Payment category | `paymentCategory` | `paymentCategory` | Contract says yes | `BHYT` vs `DICH_VU` for billing rules | Used later by billing per contract. |
| Deposit amount | `depositAmount` | `depositAmount`; later `depositUsed` in billing | Contract says yes | Requested/stored deposit metadata | Not proof of collected money in current flow. |
| Amount | `amount` | `amount`, `originalAmount`, `paymentAmount` snapshots | Contract says partly | Original booking amount snapshot | Not proof of actual payment. |
| Reason | `reasonForAppointment` | `reasonForAppointment` | Contract says yes | Patient reason | FE sends text. |
| Coins requested | `coinsToUse` | booking discount input | Contract says legacy active | Requested coin discount | FE currently forces `0`. |
| Use coin | `useCoin` | booking discount input | Contract says legacy active | Whether to apply booking coin discount | FE currently forces `false`. |

Data accepted but likely dropped/unclear:
- `visitType`: accepted and shown in FE form, but contract does not prove persistence.
- `doctor.name/email`: useful for notification/display, but core link is `doctor.id`.

### Stage 4: Booking amount / coin / payment handling

Contract-stated booking calculations:
- `originalAmount = amount`
- `discountAmount = min(availableCoin, requestedCoin?, originalAmount * 10%, 30000)` when `useCoin = true`
- `finalAmount = originalAmount - discountAmount`
- Appointment persists `coinDiscountAmount` and `paymentAmount = finalAmount`.

Current FE behavior:
- FE sends `amount = 100000`.
- FE sends `depositAmount = 100000` for DICH_VU and `0` for BHYT.
- FE sends `useCoin = false`, `coinsToUse = 0`, so booking coin discount is disabled from current booking UI.
- FE does not consume `paymentUrl` from booking response.

Field meaning in current main flow:
- `amount`: booking estimate/snapshot, not actual paid money.
- `originalAmount`, `discountAmount`, `finalAmount`: booking response calculation snapshot.
- `paymentAmount`: contract says persisted as `finalAmount`, but in current visit/billing flow it is not the billing payment evidence.
- `coinDiscountAmount`: booking snapshot only unless backend still executes old booking discount branch.
- `paymentMethod`: legacy booking branch field; receptionist payment is billing-based.
- `paidAt`, `paymentResponseCode`, `paymentTransactionStatus`: old appointment/VNPay metadata. Current billing-based payment success is on `Payment` and `Billing`, not safely inferred from appointment fields.
- `depositAmount`: stored metadata later used as billing `depositUsed`, but not proof that deposit was collected.

Actual collected money:
- In the current receptionist main flow, actual payment evidence is the billing-scoped `Payment` created or returned for `billingId`, then marked paid via VNPay callback or `/receptionist/payments/:paymentId/mark-paid`.
- `depositAmount` and `paymentAmount` should not be treated as collected money unless a real Payment or wallet ledger record proves collection.

Stale/outdated docs:
- `README_APPOINTMENT_BOOKING_CURRENT_FLOW.md` says booking ONLINE/VNPAY creates `Payment` by `appointmentId`, CREDIT deducts wallet at booking, coin spend happens at booking, and VNPay callback confirms appointment. This conflicts with the newer billing-based flow notes and should be treated as stale for the current main flow.
- `api-contract/api.md` still includes old booking-payment behavior under `POST /appointment/book`, but later `Payment (VNPay)` notes say `vnp_TxnRef` is now canonical `billingId`.

### Stage 5: Appointment confirmed and Visit created

Contract-stated behavior:
- Visit is created by event listener on `appointment.booking.success`.
- Visit creation is idempotent by `appointmentId`.
- Visit schema:
  - `appointmentId` unique
  - `doctorId`
  - `patientId`
  - `status`
  - `startedAt`
  - `completedAt`
- Initial status: `CREATED`.
- Status flow: `CREATED -> CHECKED_IN -> IN_PROGRESS -> COMPLETED`.

When appointment becomes `CONFIRMED`:
- Old booking contract says after payment success, CREDIT success, or `finalAmount = 0`.
- Visit check-in contract requires linked appointment status `CONFIRMED`.
- Current FE booking success modal says doctor will confirm the appointment, but the contract also has `PATCH /appointment/:id/confirm` marked public. This is a contract/UI gap.

Events:
- Current contract says `appointment.booking.success` creates Visit.
- Old docs list fanout events such as notification/mail/socket and `doctor.update-schedule`.

Business meaning:
- Appointment is the scheduled booking/intention.
- Visit is the operational care instance.
- `Visit(CREATED)` means the visit exists but has not started.

Known stale/gap:
- Old docs say "Keep appointment booking/payment flow unchanged" under "Visits (Phase 2 Additive)", while the project now uses visit/billing as the main operational/financial flow.

### Stage 6: Receptionist check-in

FE call path:
- API function: `checkInVisit`
- Service: `receptionistVisitService.checkInVisit`
- Hook: `useTodayVisits.checkInVisit`
- Endpoint: `PATCH /receptionist/visits/:visitId/check-in`
- Body: `{}`.
- Auth: required JWT, receptionist role per contract.

Contract validation:
- Visit must exist.
- Visit status must be `CREATED`.
- Linked appointment status must be `CONFIRMED`.

Response:
```json
{
  "code": "SUCCESS",
  "message": "Visit checked in successfully",
  "data": {
    "visitId": "...",
    "status": "CHECKED_IN"
  }
}
```

FE state behavior:
- `useTodayVisits` optimistically updates local visit status to `CHECKED_IN`.
- On backend failure it restores the previous snapshot and shows backend error message.

Business meaning:
- Patient has arrived and the appointment entered the operational visit flow.
- After check-in, cancel/reschedule should be restricted by backend.

### Stage 7: Doctor starts visit

FE call path:
- API function: `startVisit`
- Used in `src/app/doctor/patients/page.tsx`
- Endpoint: `PATCH /doctor/visits/:visitId/start`
- Body: empty.
- Auth: required JWT, doctor role per contract.

Contract validation:
- Visit must exist.
- Doctor must own the visit.
- Allowed transition: `CHECKED_IN -> IN_PROGRESS`.
- Idempotent if already `IN_PROGRESS`.
- `COMPLETED` returns conflict.

Response:
```json
{
  "code": "SUCCESS",
  "message": "Visit started",
  "data": { "visitId": "...", "status": "IN_PROGRESS" }
}
```

FE behavior:
- Doctor visits list endpoint returns only `CHECKED_IN` and `IN_PROGRESS`.
- FE updates the selected visit status to `IN_PROGRESS` locally after successful start.

Business meaning:
- Clinical work begins.

### Stage 8: Doctor completes visit

FE call path:
- API function: `completeVisit`
- Used in `src/app/doctor/patients/page.tsx`
- Endpoint: `POST /doctor/visits/:visitId/complete`
- Auth: required JWT, doctor role per contract.

FE payload type:
```ts
interface CompleteVisitPayload {
  diagnosis?: string;
  note?: string;
  prescriptions: Array<{
    medicineId?: string | null;
    name?: string | null;
    quantity: number;
    note?: string;
  }>;
}
```

Contract DTO:
- `diagnosis`: optional string
- `note`: optional string
- `prescriptions[]` with `medicineId?`, `medicineName?`, `quantity`, `note?`

Contract behavior:
- Visit must exist and have `status === IN_PROGRESS`.
- Doctor must own the visit.
- Completion is wrapped in a MongoDB transaction.
- Shared `MedicalEncounterService` persists encounter and prescriptions.
- Updates `Visit.status = COMPLETED` and `completedAt`.
- Updates linked appointment/time slot states as needed.
- Emits `domain.visit.completed` with `{ visitId, encounterId, completedAt }`.

Response:
```json
{
  "code": "SUCCESS",
  "message": "Visit completed",
  "data": { "visitId": "...", "encounterId": "..." }
}
```

Medicine price behavior:
- Contract says billing medications include `unitPrice` and uses price snapshot for finalization.
- The exact backend `unitPriceSnapshot` source is not visible in FE code. FE billing treats `unitPrice` from `BillingResponseDto.medications[]` as immutable pricing input.

Business meaning:
- Clinical encounter is finalized.
- This is the point that triggers billing creation in the current lifecycle.

Known stale/gap:
- `api-contract/api.md` still lists `PATCH /appointment/complete` as a compatibility endpoint. Current FE doctor workflow uses visit-based completion.
- `README_APPOINTMENT_BOOKING_CURRENT_FLOW.md` centers doctor completion on `PATCH /appointment/complete`; this is stale for the current main doctor flow.

### Stage 9: Draft billing creation

Contract-stated backend behavior:
- Event source: `domain.visit.completed`.
- Billing is created after doctor completes visit.
- Service named by request/context: `BillingService.createDraftBilling`.
- Fetch endpoint: `GET /receptionist/billing/:visitId`.
- FE service: `receptionistBillingService.getBillingByVisitId`.

Billing response FE type:
```ts
interface BillingResponseDto {
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
  medications?: BillingMedicationDto[];
}
```

Contract response also includes `paymentCategory: "BHYT" | "DICH_VU" | null`, but the current FE `BillingResponseDto` does not include `paymentCategory`. This is a FE type gap.

Contract-stated billing calculations:
- Resolves appointment from visit.
- `consultationFee` from appointment/service pricing.
- `medications[]` from completed encounter/prescriptions.
- `medicationFee` as sum of medication line totals.
- `paymentCategory` controls insurance rules.
- BHYT insurance contributes `insuranceAmount`.
- `depositAmount` from appointment is used as billing `depositUsed`.
- Billing initial status: `DRAFT`.

Clarifications:
- `paymentCategory` is used by billing per contract.
- `depositAmount` is consumed as `depositUsed`.
- `depositAmount` is not proof of a paid deposit unless matched to payment evidence.
- `paymentAmount` and `coinDiscountAmount` are not used by current FE billing code; contract does not prove they are used by billing.

Business meaning:
- Draft billing is the financial snapshot created after clinical completion.
- It can still be adjusted by receptionist before finalization.

### Stage 10: Receptionist finalizes billing

FE call path:
- API: `finalizeBilling`
- Service: `receptionistBillingService.finalizeBilling`
- Hook: `useReceptionistBilling.finalizeCurrentBilling`
- Endpoint: `POST /receptionist/billings/:billingId/finalize`
- Auth: required JWT, receptionist role per contract.

FE body:
```ts
interface FinalizeBillingRequestDto {
  medications: Array<{
    medicineId: string;
    dispensedQty: number;
    source: "CLINIC" | "OUTSIDE_PURCHASE";
  }>;
}
```

FE fulfillment logic:
- `normalizeBillingMedications` sanitizes `prescribedQty`, `dispensedQty`, `source`, `unitPrice`.
- `sanitizeMedicationQuantity` truncates non-negative numeric quantities and maps invalid/negative to `0`.
- `sanitizeMedicationSource` maps any non-`OUTSIDE_PURCHASE` value to `CLINIC`.
- `computeMedicationLineTotal`:
  - `OUTSIDE_PURCHASE` -> `0`
  - `dispensedQty = 0` -> `0`
  - otherwise `dispensedQty * unitPrice`
- `buildFinalizeBillingMedicationPayload` sends only `medicineId`, `dispensedQty`, and `source`.

Contract behavior:
- Billing must exist.
- Billing status must be `DRAFT`, except already `FINALIZED` may be idempotent.
- Recomputes medication fee, total amount, insurance, and final payable.
- Sets `billing.status = FINALIZED`.
- Creates a payment record and prepares payment flow.
- After `FINALIZED`, pricing, medications, `creditUsed`, and `coinUsed` are immutable.

Response:
```json
{
  "code": "SUCCESS",
  "message": "Billing finalized",
  "data": {
    "billingId": "...",
    "status": "FINALIZED",
    "paymentId": "...",
    "paymentStatus": "PENDING",
    "amount": 85000,
    "method": "QR"
  }
}
```

Business meaning:
- Receptionist confirms actual fulfillment and locks the bill.
- This is the boundary between editable financial draft and payment collection.

### Stage 11: Payment success

Billing QR/VNPay flow:
- FE API: `getPaymentQR`
- Endpoint: `GET /receptionist/payments/:billingId/qr`
- Contract: creates or returns one active `Payment` for `billingId`.
- FE must not send `amount`; backend derives it from `billing.finalPayable`.
- Response is not wrapped in `DataResponse` in FE type:
```ts
{
  paymentId: string;
  paymentUrl: string;
  amount: number;
}
```

Cash flow:
- FE API: `markCashPaid`
- Endpoint: `POST /receptionist/payments/:paymentId/mark-paid`
- Contract behavior:
  - Idempotent.
  - Marks `Payment.status = SUCCESS`.
  - Marks `Billing.status = PAID`.
  - Commits wallet deductions/rewards transactionally.

VNPay callback:
- Endpoint: `GET /payment/vnpay_return`.
- New billing-based contract note:
  - `vnp_TxnRef` is canonical `billingId`, not `orderId`.
  - Success sets associated `Payment.status = SUCCESS`.
  - Success sets `Billing.status = PAID`.
  - Success commits credit/coin deductions and coin reward.
  - Emits `domain.payment.success`.

FE polling:
- In `useReceptionistBilling`, after opening QR payment, FE polls `GET /receptionist/billing/:visitId` every 3500 ms.
- When returned billing snapshot status becomes `PAID`, FE shows success and closes payment dialog.

Legacy payment-result path:
- `src/apis/payment/payment.api.ts` calls `GET /payments/:orderId`.
- `PaymentResultData` still uses `orderId` and `COMPLETED|FAILED`.
- `api-contract/api.md` now warns FE must not rely on `orderId` for billing-based payments.
- This path is stale/legacy for the current receptionist billing payment flow.

Business meaning:
- Actual payment belongs to finalized billing.
- Payment should be proven by `Payment` and `Billing(PAID)`, not appointment `paymentAmount`.

## 3. Current business meaning of core entities

Appointment:
- Booking/scheduled intention.
- Holds scheduled time, doctor, patient, reason, service/category metadata.
- Holds `paymentCategory` and `depositAmount` metadata that billing later uses.
- Should not be treated as the payment ledger in the current main flow.

Visit:
- Operational medical visit instance.
- One appointment has one visit by contract.
- `CREATED` means visit exists but has not started.
- `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED` represent real care lifecycle.

MedicalEncounter:
- Clinical result/record written when doctor completes the visit.
- Includes diagnosis/note/prescription bundle.
- Used downstream by billing to populate medication lines.

Billing:
- Financial snapshot of a completed visit.
- Draft billing is created after visit completion.
- `DRAFT` can be adjusted for credit/coin and medication fulfillment.
- `FINALIZED` is immutable and ready for payment.
- `PAID` is final successful financial state.

Payment:
- Actual payment evidence for finalized billing in the current main flow.
- Current billing payment uses `billingId`.
- Old appointment-based payment by `appointmentId/orderId` remains in docs and some FE legacy modules.

CreditWallet/Coin:
- Credit is money-equivalent balance.
- Coin is reward/discount balance.
- Billing apply-credit/apply-coin only modifies the billing draft and checks balance; actual deductions happen on payment success per contract.
- Booking UI currently disables coin use by always sending `useCoin=false`, `coinsToUse=0`.

## 4. Current meaning of financial fields

| Field | Current meaning | Actual money collected? | Used by billing? | Safe for refund? | Notes |
|---|---|---:|---:|---:|---|
| `amount` | Booking original estimate sent by FE | No | Not proven; may inform appointment snapshots | No | FE hardcodes 100000. |
| `consultationFee` | Billing consultation charge | No by itself | Yes | No | Billing response field. |
| `originalAmount` | Booking response snapshot from `amount` | No | Not proven | No | Old booking payment field. |
| `discountAmount` | Booking coin discount snapshot | No | Not proven | No | FE booking sends coin disabled. |
| `finalAmount` | Booking final snapshot after discount | No | Not proven | No | Old booking payment field. |
| `paymentAmount` | Contract says appointment stores `finalAmount` | No, snapshot only | Not proven | No | Do not treat as paid. |
| `coinDiscountAmount` | Booking coin discount persisted on appointment | No | Not proven | No | Not a billing deduction unless explicitly migrated. |
| `depositAmount` | Appointment deposit metadata | No | Yes, as source for `depositUsed` per contract | No | Not proof of paid deposit. |
| `depositUsed` | Billing offset from appointment deposit metadata | Not by itself | Yes | No | Only safe if backed by payment evidence. |
| `insuranceAmount` | Billing BHYT coverage/discount | No | Yes | No | Computed by billing. |
| `finalPayable` | Billing amount due after insurance/deposit/credit/coin | Not until paid | Yes | No | Payment amount source. |
| `paymentMethod` | Legacy booking payment route | No | Not in FE billing types | No | Billing payment uses QR/CASH endpoints. |
| `paidAt` | Old appointment/VNPay metadata or payment timestamp | Only if tied to real Payment | Legacy | Maybe, with Payment record | Prefer Payment/Billing. |
| `paymentResponseCode` | Old VNPay response code | No | No | No | Legacy appointment payment field. |
| `paymentTransactionStatus` | Old VNPay transaction status | No | No | No | Legacy appointment payment field. |

Specific answers:
- Is `depositAmount` real paid deposit? No, not by itself. It is stored metadata and later used as `depositUsed`.
- Is `paymentAmount` actual paid money? No. It is a calculated booking amount snapshot in the current main flow.
- Does booking create payment? Old docs say yes for ONLINE/VNPAY/CREDIT. Current billing-based contract says actual payment is by `billingId`; FE booking does not follow a booking payment redirect.
- Does cancel have any safe refundable amount? Only if backend finds real collected payment evidence. `depositAmount`, `paymentAmount`, `finalAmount`, and `coinDiscountAmount` alone are not safe refund sources.
- Which fields should cancel not use for refund? `amount`, `originalAmount`, `discountAmount`, `finalAmount`, `paymentAmount`, `coinDiscountAmount`, `depositAmount`, `depositUsed` unless backed by actual `Payment` or wallet ledger evidence.
- Which fields should reschedule preserve unchanged? `paymentCategory`, `depositAmount`, `paymentMethod`, `amount`, `paymentAmount`, `coinDiscountAmount`, `useCoin`, `coinsToUse`, `paidAt`, `paymentResponseCode`, `paymentTransactionStatus`.

## 5. Cancel/reschedule implications

Cancel:
- Current contract: allowed only when linked `Visit.status === CREATED`.
- Appointment status must be `PENDING` or `CONFIRMED`.
- Must cancel both Appointment and Visit, release slot, and block if `MedicalEncounter`, `Billing`, or related `Payment` exists.
- Should not refund deposit/payment/credit/coin unless a real payment evidence model exists.
- Should block after check-in/start/completion/billing/payment.
- FE cancel mapping added in `src/features/appointment/utils/cancel-appointment-error.ts` handles visit-based blocked reason codes.

Reschedule:
- Means changing appointment date/time slot before visit starts.
- Should only accept scheduled datetime, slot, and reason.
- Should not change financial metadata (`paymentCategory`, `depositAmount`, payment method, coin/credit/payment snapshots).
- Should preserve billing-relevant metadata.
- Current contract says `PATCH /appointment/:id/reschedule` persists snapshot fields and keeps bookingDate.
- Current user requirement says status should remain `CONFIRMED`, not `RESCHEDULED`; old docs say reschedule may set `RESCHEDULED`, which is stale/risky.

## 6. Contract/documentation gaps

Current code vs `api-contract/api.md`:
- FE booking sends the `POST /appointment/book` contract shape and uses timezone utilities correctly.
- FE receptionist billing uses billing-scoped endpoints and `billingId`.
- FE legacy payment-result still uses `/payments/:orderId`, while contract says billing-based FE must not rely on `orderId`.
- FE billing type omits `paymentCategory`, although contract response includes it.
- FE `VisitDto` for doctor excludes `CREATED`, matching doctor endpoint filter, but the broader visit enum includes `CREATED`.

Stale sections in `api-contract/api.md`:
- `POST /appointment/book` still describes booking-time coin deduction, credit deduction, appointment-based Payment record, and online payment URL behavior.
- `Payment (VNPay)` first says success confirms appointment by `orderId`, then immediately says billing-based flow uses `billingId`; the appointment-based lines are stale for receptionist billing flow.
- Socket notes still mention `PAYMENT_VNPAY_URL_CREATED` with `{ appointmentId, paymentUrl }`, which appears booking-payment oriented.

Stale sections in `README_APPOINTMENT_BOOKING_CURRENT_FLOW.md`:
- Title claims "current backend", but it is appointment-payment centered.
- Says ONLINE/VNPAY creates `Payment(status=PENDING)` unique by `appointmentId`.
- Says CREDIT deducts wallet at booking.
- Says coin discount spending happens at booking.
- Says doctor workflow is `PATCH /appointment/complete`.
- Says payment truth is inferred from appointment state.
- Says cancellation/refund side effects are appointment centered.
- Does not describe visit check-in/start/complete or billing finalization as the current main flow.

Stale sections in `BOOK_APPOINTMENT_REFACTOR_SUMMARY.md`:
- Payment unique index on `appointmentId`.
- Repeated online booking payment URL creation by appointment.
- Appointment cancellation/shift cancellation refund guidance to credit wallet without the newer caveat: only refund actual collected payment evidence.
- VNPay return flow summary is appointment-centered.

Contract gaps:
- `POST /appointment/book` should explicitly state whether booking still creates any Payment records in the current deployed backend.
- `POST /appointment/book` should clarify whether `paymentMethod=ONLINE` from current FE is ignored/deferred for billing or still starts legacy payment.
- Billing draft creation contract should document `BillingService.createDraftBilling`, event payload, and field mapping from Appointment/Visit/MedicalEncounter.
- Payment schema contract should explicitly state canonical relation: `billingId` for current main flow, `appointmentId` only legacy.
- Cancel response should include a formal blocked reason response shape, not just reason code list.
- Reschedule contract should state Visit preconditions and whether appointment status remains `CONFIRMED`.

## 7. Recommended follow-up cleanup list

Cancel:
- Keep backend as source of truth for cancel eligibility.
- Ensure cancel checks `Visit.status === CREATED` and absence of MedicalEncounter/Billing/Payment.
- Refund only from real payment/wallet ledger evidence.
- Return structured blocked reason, for example `{ code: "ERROR", reasonCode, message, data: null }`.

Reschedule:
- Require linked Visit to be `CREATED`.
- Accept only date/time slot/reason fields.
- Preserve all financial metadata unchanged.
- Keep appointment status `CONFIRMED` after successful reschedule unless a separate reschedule event log is added.

Deposit/payment evidence:
- Introduce explicit deposit collection evidence if deposits are real.
- Do not use `depositAmount`, `paymentAmount`, or `finalAmount` as refund sources.
- Make `depositUsed` derivation auditable and backed by actual collection when applicable.

Contract cleanup:
- Split legacy appointment-payment contract from current billing-payment contract.
- Update `README_APPOINTMENT_BOOKING_CURRENT_FLOW.md` or mark it archived/stale.
- Update `BOOK_APPOINTMENT_REFACTOR_SUMMARY.md` with the visit/billing migration.
- Remove contradictory `orderId` vs `billingId` language from payment docs.
- Add response DTOs for cancel blocked reasons, billing draft creation, and payment success.

FE integration notes:
- Booking UI should decide whether `paymentMethod` is still needed. If billing-deferred, consider sending `OFFLINE` or a documented deferred method consistently.
- Booking success UI should not imply payment is complete.
- Billing screen should add `paymentCategory` to `BillingResponseDto` if the UI needs to display/branch on it.
- Legacy `/payment-result?orderId=` screen should be marked legacy or adapted to billingId.
- Wallet should refresh after billing payment success, not just after booking/cancel flows.

