---
name: Overview data source — master sheet only
description: Overview tab uses ONLY master sheet data. CRM is for CRM/Trends tabs only.
---

## Rule — Overview uses master sheet exclusively
In Marketing.tsx `MONTHLY_LIVE`, per-school metrics must come ONLY from the master sheet school tabs. CRM data (`risCrm`/`rpsCrm`) must NOT be used in the MONTHLY_LIVE computation.

| View | Source |
|---|---|
| Combined | DM Overall tab (master sheet) via `live` |
| RIS individual | DM RIS tab (master sheet) via `risSchool` |
| RPS individual | DM RPS tab (master sheet) via `rpsSchool` |
| CRM tab | risCrm / rpsCrm (separate CRM sheets) |
| Trends tab | risCrm / rpsCrm (separate CRM sheets) |

Combined ≠ RIS + RPS is acceptable — each tab is an independent authoritative source in the master sheet.

## How to apply
In the `MONTHLY_LIVE` useMemo map callback:
```js
// No risMon / rpsMon lookup here
const risBase = risSchool
  ? { ...row.ris, leads: risSchool.leads, bookings: risSchool.bookings, walkins: risSchool.walkins, admissions: risSchool.admissions }
  : row.ris;  // fallback to static estimate, never to CRM
const combinedOut = {
  leads: live?.leads ?? (risOut.leads + rpsOut.leads),  // DM Overall for all months
  ...
};
```

**Why:** CRM data introduces a different data pipeline than the master sheet — they capture leads at different times and with different logic. Mixing them into Overview created numbers that didn't match what the school's own trackers show. Using master-sheet-only data makes the Overview a clean mirror of what the marketing team sees in their own Google Sheet.

## All-zeros school tab rows
If the school creates a placeholder row (all zeros) before actual data arrives, the zero values are shown directly — this is accurate per the master sheet. The school will update the row when data is available.
