---
name: School tab monthly parser pitfalls
description: Four traps when parsing DM RIS/RPS school tracker tabs for monthly leads/walkins/admissions/spend
---

## The rule
Use **last-occurrence Map** (not first-occurrence Set) for month deduplication, match on **col0 only** (never col1 fallback), add a separate `parseSchoolYtd()` that reads the `TOTAL (TILL DATE)` row, and handle **both "June" and "July" appearing twice** in the spend table.

**Why:**
Four independent bugs in the original parser:

1. **New-cycle rows at top of tab** — each school tab opens with a summary section listing JUNE and JULY near the top (rows 2–3). These are AY 26-27 new-cycle figures (tiny: 8 leads). The correct AY 25-26 month-end subtotals appear much later in the tab (row 199 for JUNE, row 247 for JULY TOTAL) after all daily entries for those months. First-occurrence wrongly locked in the new-cycle values.

2. **Spend-summary rows** — the tab ends with a spend breakdown table where the month name sits in col1 (col0 is blank) and col5 contains rupee spend (e.g. `["", "March", "125000", "₹3,011", "₹72,040", "₹75,051", ...]`). The original code checked col1 as a fallback; this caused spend values to be read as walkins (col5 = wCol).

3. **TOTAL (TILL DATE) row ignored** — row 249 contains the single authoritative YTD total the school maintains. It must be read separately with `parseSchoolYtd()`.

4. **Spend table: July appears twice** — the spend section has two separate "July" rows: first occurrence = July 2025 (₹0, top summary section), second occurrence = July 2026 (real spend, bottom table). The SPEND_MONTH_MAP duplicate sentinel must cover BOTH "June26":"Jun 26" AND "July26":"Jul 26". Same pattern: `if (rawMonth === "July" && seenInThisSheet.has("Jul 25")) lookupKey = "July26"`.

5. **Year-qualified month labels not recognized** — the school uses FOUR label forms in the same tab: bare ("JUNE"), bare+TOTAL ("JUNE TOTAL"), year-qualified ("JUNE 2026" — subtotal row for a completed month), and year+TOTAL ("JUNE 2026 TOTAL" — bottom total for the current month). `SCHOOL_MONTH_KEY` must carry ALL FOUR forms or real subtotals are silently ignored. Add:
   ```js
   SCHOOL_MONTH_KEY[upper + " " + year4] = key;              // "JUNE 2026"
   SCHOOL_MONTH_KEY[upper + " " + year4 + " TOTAL"] = key;  // "JUNE 2026 TOTAL"
   ```
   With last-occurrence-wins, the bottom TOTAL row (most accurate) always overrides any earlier placeholder row with the same month key.

**How to apply:**
- `parseSchoolRows`: iterate all rows, `crmKey = SCHOOL_MONTH_KEY[row[0].trim().toUpperCase()]` only; use `seen.set(crmKey, data)` (Map, overwrites every match → last wins).
- `SCHOOL_MONTH_KEY` must include FOUR forms per month: bare, bare+TOTAL, year-qualified, year+TOTAL.
- `fillMissingLastMonth`: use `if (prev && prev.leads > 0 ...)` not `if (!prev || ...)` so it also derives when the row is completely absent.
- `parseSchoolYtd`: scan col0 for a value that includes both "TOTAL" and ("DATE" or "TILL"); parse leads/walkins/admissions from standard column indices.
- `parseSpendRows`: detect second occurrence of "June" → "June26" and second occurrence of "July" → "July26" sentinel keys.
- In Marketing.tsx: `schoolYtd` (from `risSchoolYtd`/`rpsSchoolYtd`) drives the YTD header cards; `risSchoolMonthly`/`rpsSchoolMonthly` drive per-month charts.
- The "Total RIS July'26" / "Total RPS July'26" master-sheet tabs track ALL physical walk-ins including revisits — they are NOT the source for dashboard walkin metrics.
