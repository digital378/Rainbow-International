---
name: Google Sheets month row renaming pattern
description: School renames current-AY month rows in Google Sheets from bare "JUNE"/"JULY" to "June 2026"/"July 2026" each new academic year; parsers must handle both forms.
---

## Rule
When a new academic year begins, the school updates their Google Sheets tabs by renaming the current-cycle June and July monthly rows from the bare label ("June", "July") to a year-qualified label ("June 2026", "July 2026"). This affects both:

1. **Per-school spend section** (`parseSpendRows` / `SPEND_MONTH_MAP`) — the second occurrence of June/July in the spend table may now be "June 2026" / "July 2026" rather than a bare duplicate.
2. **DM Overall master sheet** (`MONTH_MAP`) — the monthly summary row for July (and possibly June) in the current AY may carry "July 2026" not "JULY".

## How to apply
- In `SPEND_MONTH_MAP`, keep both the bare-duplicate sentinel keys (`"June26"`, `"July26"`) **and** explicit year-qualified keys (`"June 2026": "Jun 26"`, `"July 2026": "Jul 26"`).
- In `MONTH_MAP` (DM Overall parser), keep `"JULY 2026": "Jul 26"` and `"JUNE 2026": "Jun 26"` as explicit entries (uppercase lookup via `label.toUpperCase()`).
- The `passedMay && JULY → "Jul 26"` override in the DM Overall parser provides belt-and-suspenders coverage for bare "JULY" labels that still exist.

**Why:** Bare duplicate-detection relies on seeing the same label twice, which breaks if the school uses distinct labels for the current cycle. Explicit year-keyed entries are immune to this assumption.
