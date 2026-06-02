---
name: RIS CRM Walk-In Date column
description: RIS CRM sheet "Nur to Class 12" column K is "Walk-In Date"; CLOSED leads with a non-empty K are "CLOSED AFTER WALKIN" equivalents that must be counted as bookings.
---

## Rule
When parsing RIS CRM rows, read `r[10]` (column K = "Walk-In Date"). If `status === "CLOSED"` and `r[10]` is non-empty, set `effectiveStatus = "CLOSED AFTER WALKIN"` and count as a booking. Use `effectiveStatus` everywhere (funnel counts, statusSummary) instead of the raw `status`.

**Why:** The RIS sheet never uses the "CLOSED AFTER WALKIN" status label that RPS uses. Leads that walked in but were later closed simply remain "CLOSED", but they have a Walk-In Date in column K. Without this fix, 52+ bookings are silently missed, making the bookings–walk-ins gap unrealistically small (108 vs the correct ~160).

**How to apply:** In `server/routes.ts`, inside `for (const r of risCrmRows.slice(1))`, derive `effectiveStatus` before any funnel logic, and use it for all booking/walkin/admission/statusSummary increments.

## Column map for RIS CRM "Nur to Class 12!A:L"
| Index | Column | Field          |
|-------|--------|----------------|
| r[0]  | A      | Enquiry Date   |
| r[1]  | B      | Month          |
| r[2]  | C      | Parent's Name  |
| r[3]  | D      | Child's Name   |
| r[4]  | E      | Phone Number   |
| r[5]  | F      | Program (grade)|
| r[6]  | G      | Status         |
| r[7]  | H      | Remark         |
| r[8]  | I      | Lead Owner     |
| r[9]  | J      | Source         |
| r[10] | K      | Walk-In Date   |
| r[11] | L      | Revisit Date   |
