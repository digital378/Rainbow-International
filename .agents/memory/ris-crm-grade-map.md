---
name: RIS CRM GRADE_MAP variants
description: GRADE_MAP for RIS CRM must cover all real-world grade spellings; unknown grades must fall back to "Other" (never skip rows); monthly totals must use Object.values() sum.
---

## Rule
The RIS CRM "Program" field (col F) uses varied spellings. GRADE_MAP must include:
- Pre-Primary: nursery, playgroup, junior kg, senior kg, kg, jr. kg, jr kg, sr. kg, sr kg, lkg, ukg, jkg, skg, nur, pre-primary, pre primary, pp
- Primary: class 1–5, grade 1–5, std 1–5, 1st–5th
- Middle: class 6–8, grade 6–8, std 6–8, 6th–8th
- Secondary: class 9–10, grade 9–10, std 9–10, 9th–10th
- Senior Secondary: class/grade 11–12 with all stream variants, 11th, 12th

Unknown grade → `"Other"` bucket (never skip the row). Monthly totals must sum `Object.values(risMonthGroup[month])` (all groups including "Other"), not just `GROUP_ORDER_SRV`.

**Why:** Rows skipped due to unrecognized grades are silently dropped from all counts (leads, bookings, admissions). "Grade 1" vs "Class 1" was causing 45+ rows to be missed before the fix.
