---
name: Academic Year Rollover Pitfall
description: Every August, hardcoded AY month arrays in server/routes.ts break data parsing for the new academic year — what to fix and how.
---

## The Rule
Every August when a new academic year starts, three places in `server/routes.ts` must cover the new AY months or data silently returns zeros for the current month.

**Why:** The parsing functions (`parseSchoolRows`, `parseSpendRows`, DM Overall loop) use lookup maps keyed by month names. Any sheet row whose month label isn't in the map is silently skipped.

## The Three Places to Update (in `server/routes.ts`)

### 1. `_AY_SCHOOL_MONTHS` (feeds `SCHOOL_MONTH_KEY` → `parseSchoolRows`)
**Was:** hardcoded array `["Aug-25"..."Jul-26"]`.
**Fix applied:** replaced with a dynamic generator that covers `[currentAYStart-1, currentAYStart]` academic years, so it auto-extends every August without manual intervention.

### 2. `MONTH_MAP` (feeds DM Overall tab → `monthlyTotals`)
Maps bare/year-qualified month row labels to `"Mon YY"` keys. Bare months (AUGUST, SEPTEMBER…) are handled by AY 25-26 entries; new-AY months come in year-qualified (e.g. "AUGUST 2026") so explicit keys must be added each year.
**Fix applied:** added all AY 26-27 year-qualified entries (`"AUGUST 2026": "Aug 26"` … `"MAY 2027": "May 27"`). Also added `passedJul26` flag so bare AUGUST after Jul 26 → "Aug 26".

### 3. `SPEND_MONTH_MAP` (feeds `parseSpendRows` → per-school spend data)
Same pattern. Added `"August 2026": "Aug 26"` year-qualified entry plus `"August26": "Aug 26"` sentinel (for sheets where "August" appears twice). Also updated the sentinel detection condition:
```typescript
(rawMonth === "August" && seenInThisSheet.has("Aug 25")) ? "August26" : rawMonth
```

## How to Apply Next Year (August 2027)
1. `_AY_SCHOOL_MONTHS` — **no action needed** (now dynamic).
2. `MONTH_MAP` — add `"AUGUST 2027": "Aug 27"` … `"MAY 2028": "May 28"` and update `passedJul27` logic.
3. `SPEND_MONTH_MAP` — add `"August 2027": "Aug 27"`, sentinel `"August27": "Aug 27"`, update sentinel detection.

## Frontend (shared/marketingData.ts)
The `_HISTORICAL_ROWS` auto-extend loop already adds blank rows for the current month dynamically — no manual update needed there. `CURRENT_IDX` and `MAY_IDX` are also derived automatically.
