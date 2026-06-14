# 📗 README – Frontend Integration (Refactor Phases)

## 🎯 Overview

Tài liệu này mô tả cách **frontend integrate theo từng phase**, dựa trên contract từ backend.

---

# 🔹 PHASE 0.5 – Receptionist Module

## Mục tiêu

* Tạo entry point cho receptionist

## Implementation

* Route: `/receptionist`
* Role guard
* Layout:

  * Sidebar (Visits, Billing, Payments)
* Call API:

  * `/receptionist/test`

---

# 🔹 PHASE 1 – Booking UI

## Implementation

* Add:

  * paymentCategory
* Behavior:

  * BHYT → hide deposit
  * DỊCH VỤ → show deposit
* Remove:

  * coin UI
  * payment method UI

---

# 🔹 PHASE 2 – Visit UI

## Implementation

* Receptionist:

  * Check-in button
* Doctor:

  * View visits
  * Start visit

---

# 🔹 PHASE 3 – Complete Visit UI

## Implementation

* Form:

  * diagnosis
  * prescriptions
* Checkbox:

  * isDispensed

---

# 🔹 PHASE 4 – Billing UI

## Implementation

* Show:

  * consultation fee
  * medication fee
  * total
* Actions:

  * Edit (DRAFT)
  * Finalize

---

# 🔹 PHASE 5 – Payment UI

## Implementation

* Show:

  * QR
  * Mark cash paid
* States:

  * PENDING
  * SUCCESS

---

# 🔹 PHASE 6 – Full Flow

## Implementation

* Flow UI hoàn chỉnh:

  * booking → visit → billing → payment

---

# ⚠️ Notes

* Không assume data tồn tại sớm
* Follow BE contract (submodule)
* Implement theo phase, không làm all-in
