# UTE Doctor

UTE Doctor coordinates patient care journeys across appointment, reception, clinical visit, and patient-facing health information.

## Reception and clinical measurements

**Check-in**:
The operational transition confirming that a patient has arrived and entered the visit queue. It does not require clinical measurements.
_Avoid_: Health check, vital-sign intake

**Vital-sign record**:
An append-only set of clinical measurements captured for a patient during reception or visit intake. Repeated measurements are separate records rather than replacements.
_Avoid_: Editable health profile, self-reported health data

**Patient health summary**:
A read-only patient view built from the latest non-voided vital-sign record and its measurement history.
_Avoid_: Health ranking, lifestyle score

**Metric classification**:
The backend-owned clinical interpretation of a measured health metric as normal, low, high, or unknown. Clients display this classification but never derive it from raw measurements.
_Avoid_: Frontend threshold, client-side health assessment

**Overall health status**:
The backend-owned aggregate interpretation of the latest vital-sign record. Stability requires every relevant measured metric to be explicitly normal; incomplete classification is unevaluated.
_Avoid_: Health score, frontend aggregate, health ranking

**Vital-sign correction**:
A new active vital-sign record that replaces an earlier record while preserving the earlier measurements as superseded audit history.
_Avoid_: Edit measurement, overwrite

**Voided vital-sign record**:
An invalidated measurement retained with its original values and an explicit reason for auditability.
_Avoid_: Deleted measurement, removed record

**Blood-type snapshot**:
An optional historical value carried by an active vital-sign record for compatibility, not a verified clinical-profile fact. Conflicting snapshots are treated as unverified.
_Avoid_: Authoritative blood type, classifiable vital sign

**BMI measurement**:
Backend-derived clinical data calculated from valid height and weight measurements and returned with its backend classification. Clients neither calculate nor repair it.
_Avoid_: Client-calculated BMI, inferred BMI

**Partial vital-sign record**:
A valid vital-sign record containing at least one captured measurement; absent metrics remain absent. Blood pressure is one paired measurement consisting of systolic and diastolic values.
_Avoid_: Zero-filled measurement, blood-type-only record

**Measurement time**:
The epoch-millisecond instant when a clinical measurement physically occurred, distinct from when its record was persisted or later changed.
_Avoid_: Creation time, formatted local date

**Health summary history**:
A bounded newest-first collection of active vital-sign records used by the patient dashboard. It is not the clinical audit trail.
_Avoid_: Full history, audit history

**Measurement session**:
One vital-sign record grouping the measurements captured together at a particular time and source.
_Avoid_: Individual metric event, synthetic history row

**Measurement source**:
The server-assigned provenance of a vital-sign record. In the current scope, supported records are captured by reception during check-in intake.
_Avoid_: Role-inferred source, client-supplied source

**Latest measurement session**:
The newest active vital-sign record used as the sole source for current metric cards. Older sessions are not used to fill gaps in it.
_Avoid_: Latest value per metric, mixed-session summary
