# Receptionist vital-sign entry lives in an in-screen panel, not a routed visit-detail page

The vital-sign write UI is launched as an in-screen dialog from the existing
`TodayVisitsScreen` and hydrated from the already-loaded visit list item, rather than from a
dedicated `/receptionist/visits/[visitId]` route. We chose this because no
`GET /receptionist/visits/:visitId` endpoint exists: a routed detail page would have to
refetch the whole today list and find the visit by id (fragile on refresh/deep-link, and
empty for any non-today visit), while the list already carries every field the entry panel
needs (`visitId`, `status`, `scheduledAt`, `patientName`, `doctorName`, `appointmentId`).

## Consequences

- Receptionist cannot read the patient's vital-sign history here — `GET /patients/me/health-summary`
  is PATIENT-only — so the panel shows visit metadata, the entry form, and the record it just
  created; it never reads or fakes patient health history.
- If deep-linkable visit detail is needed later, add the backend
  `GET /receptionist/visits/:visitId` endpoint first, then a routed detail page can supersede
  this decision safely.
