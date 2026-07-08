---
name: Current-month combined vs per-school consistency
description: For in-progress months, DM Overall formula row includes future-week projections making it unreliable; always derive combined from risOut+rpsOut. Guard against all-zeros school tab rows.
---

## Rule
In Marketing.tsx `MONTHLY_LIVE`, the `combinedOut` object must NOT use DM Overall `live` data for the current in-progress month. The DM Overall master sheet's monthly formula row for the current month sums weekly sub-rows, which may include future week projections or carry-over walkins, producing inflated numbers (e.g. 13 walkins when per-school only shows 4).

**Current month**: always `combinedOut.leads = risOut.leads + rpsOut.leads` (and same for walkins, admissions, bookings).
**Completed months**: DM Overall is authoritative and should continue to be used.

## School tab all-zeros guard
The school sometimes creates a placeholder row with all-zeros before actual data arrives. Use `schoolHasData = !!(school && (school.leads > 0 || school.walkins > 0 || school.admissions > 0))` before trusting the school tab's walkins/admissions. Without this guard, an all-zeros row overrides the CRM fallback.

## How to apply
In the `MONTHLY_LIVE` useMemo map callback:
```js
const isCurrentMonth = row.month === MONTHLY_STATIC[CURRENT_IDX]?.month;
const combinedOut = {
  leads:      (!isCurrentMonth && live?.leads != null) ? live.leads : (risOut.leads + rpsOut.leads),
  walkins:    (!isCurrentMonth && live?.walkins != null) ? live.walkins : (risOut.walkins + rpsOut.walkins),
  admissions: (!isCurrentMonth && live?.admissions != null) ? live.admissions : (risOut.admissions + rpsOut.admissions),
  spend: risOut.spend + rpsOut.spend,
  ...
};
```

**Why:** DM Overall formula rows for in-progress months include future weekly projections. Combined ≠ RIS+RPS confused the user. The fix ensures all three views are internally consistent for the current month.
