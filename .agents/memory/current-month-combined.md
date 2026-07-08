---
name: Overview data source — master sheet only
description: Overview tab uses ONLY master sheet data. CRM is for CRM/Trends tabs only.
---

## Rule — Overview uses master sheet exclusively
In Marketing.tsx `MONTHLY_LIVE`, per-school metrics must come ONLY from the master sheet school tabs. CRM data (`risCrm`/`rpsCrm`) must NOT be used in the MONTHLY_LIVE computation.

| View | Source |
|---|---|
| Combined | DM Overall tab (master sheet) via `live` |
| RIS individual | DM RIS JULY' 26 tab via `risSchool` |
| RPS individual | DM RPS JULY' 26 tab via `rpsSchool` |
| CRM tab | risCrm / rpsCrm (separate CRM sheets) |
| Trends tab | risCrm / rpsCrm (separate CRM sheets) |

Combined ≠ RIS + RPS is acceptable — each tab is an independent authoritative source.

## School tab structure (as of Jul 2026)
The master sheet only has these school tabs:
- `DM RPS JULY' 26` (current, full AY from Aug-25)
- `DM RIS JULY' 26` (current, full AY from Aug-25)
- `DM RPS Feb' 26` (old, pre-March 2026)
- `DM RIS Feb' 26` (old, pre-March 2026)

The school does NOT create a tab every month — they update the current tab and only create a new one periodically. This means when a new tab starts, the PREVIOUS month's subtotals may not yet be entered as a row in the new tab.

## YTD-residual derivation for missing last-completed month
When the last completed month (prevMonthKey = Jun-26 in July) has all-zeros in the school tab, derive it from: `YTD - sum(all other months)`.

This is purely master-sheet data (YTD row + monthly rows from same school tab). Server-side in `fillMissingLastMonth()`.

Example (Jul 2026):
- RPS monthly sum (Aug-25..May-26): 1752 leads
- RPS YTD: 1966 leads  
- Derived RPS Jun-26: 1966 - 1752 = 214 leads ✓

## Previous-tab merging
`fetchPrevSchoolTab()` fetches the prior month's school tab and `mergeSchoolMonthly()` merges them (prefer non-zero data per month). However, because the school skips months and uses abbreviated names ("Feb'" not "FEBRUARY"), the fallback tab is typically the Feb tab which predates June — so the YTD residual is the only reliable fix for the transition gap.

**Why:** The school creates new tabs sporadically, not monthly. When a new July tab starts, June's subtotals are left as zeros in the new tab until manually entered. The YTD residual gives an accurate master-sheet-derived value for the gap month.
