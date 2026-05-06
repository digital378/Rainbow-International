# Wave 1 Implementation Checklist (planning only — no code yet)

> **Status:** AWAITING EXPLICIT APPROVAL TO IMPLEMENT after the canonical-recovery check (target deploy date per plan: **2026-05-18**).
>
> **Source of truth:** `docs/seo-content-rewrite-plan.md` (do not duplicate content from there — this checklist references sections by number).
>
> **Scope:** the 6 Wave 1 commercial pages only. No blog posts, no other commercial pages, no redirects in this wave.

---

## 0. Pre-flight (do before any code edit)

- [ ] **Recovery go/no-go check** — confirm the canonical-recovery 14-day window has cleared without regression (per Section 5 — 5-Wave Rollout Calendar). Block implementation if any regression flag is open.
- [ ] **User approval recorded** — explicit "begin Wave 1 implementation" message from the user, dated and pasted into the commit message.
- [ ] **Branch / working state clean** — `git --no-optional-locks status` shows no unrelated WIP.
- [ ] **Confirm no plan changes since approval** — re-diff `docs/seo-content-rewrite-plan.md` against the approved version (commit `cf2cddb`).

---

## 1. The 6 Wave 1 pages (in deploy order)

| # | Route | Page file | Meta source | AI-SEO source |
|---|---|---|---|---|
| 1 | `/` | `client/src/pages/Home.tsx` | Section 2A.1 row 1 | Section 2A.2 page 1 |
| 2 | `/admissions` | `client/src/pages/Admissions.tsx` | Section 2A.1 row 2 | Section 2A.2 page 2 |
| 3 | `/primary-section` | `client/src/pages/PrimarySection.tsx` | Section 2A.1 row 3 | Section 2A.2 page 3 |
| 4 | `/senior-secondary-section` | `client/src/pages/SeniorSecondarySection.tsx` | Section 2A.1 row 4 | Section 2A.2 page 4 |
| 5 | `/amenities` | `client/src/pages/Amenities.tsx` | Section 2A.1 row 5 | Section 2A.2 page 5 |
| 6 | `/fee-structure` | `client/src/pages/FeeStructure.tsx` | Section 2A.1 row 6 | Section 2A.2 page 6 |

> Page filenames above are the expected names. Confirm against `client/src/pages/` and `client/src/App.tsx` route map at implementation time.

---

## 2. Per-page implementation steps (apply to all 6)

For each page, do these in order. Do **not** batch across pages — finish one fully before moving to the next so a regression is easy to bisect.

### 2A. Meta tags (from Section 2A.1)
- [ ] Update `<title>` via the page's `<SEO>` component to the exact string in Section 2A.1 (≤60 chars).
- [ ] Update `<meta name="description">` via `<SEO>` to the exact string in Section 2A.1 (150–158 chars).
- [ ] Confirm self-referencing canonical is set to the page's own absolute URL.
- [ ] Confirm `og:title`, `og:description`, `twitter:title`, `twitter:description` mirror the new strings.
- [ ] Do NOT remove or overwrite `og:image` / `twitter:image`.

### 2B. Quick-Answer block (from Section 2A.2)
- [ ] Insert the page's Quick-Answer copy near the top of the page (after H1, before the first marketing block).
- [ ] Use a stable, semantic wrapper (`<section aria-labelledby="quick-answer-…">` with an `<h2>`).
- [ ] Word count must match Section 2A.2 (40–60 words). Do not paraphrase.
- [ ] Add `data-testid="text-quick-answer-{page-slug}"`.

### 2C. Parent-FAQ block (from Section 2A.2)
- [ ] Insert the page's 4–6 Q&A pairs as an accessible disclosure section (use existing FAQ component if one exists, otherwise reuse the same accordion primitive used elsewhere — do not introduce a new dependency).
- [ ] Use the exact Q and A strings from Section 2A.2.
- [ ] Add `data-testid="faq-{page-slug}-q{n}"` per question.

### 2D. FAQPage JSON-LD schema
- [ ] Generate `FAQPage` JSON-LD mechanically from the same FAQ array used in 2C (no duplication of strings).
- [ ] Inject via the `<SEO>` component or a sibling `<script type="application/ld+json">` rendered server-side (so SSR for `/` includes it; the other 5 pages currently render via Vite).
- [ ] `mainEntityOfPage` / publisher = `Organization` named "Rainbow International School".
- [ ] **Do NOT** add `Person`, `Review`, or `AggregateRating` schema.

### 2E. Internal linking compliance (Section 3E)
- [ ] On `/admissions` only: confirm any RPS link is the small supporting note, in body (not hero/CTA), with allowed anchor text.
- [ ] On `/`, `/primary-section`, `/senior-secondary-section`, `/amenities`, `/fee-structure`: confirm RPS links are absent from hero/above-the-fold and from main admission CTAs. Footer RPS link (if any) is allowed.

---

## 3. Pre-deploy compliance gate (Section 6.1 — verbatim, all 8 checks must pass)

Run these on a build of the changed branch before merging:

- [ ] Zero new person names introduced (grep page diffs against the protected-name allow-list).
- [ ] Zero `Person` schema added anywhere on the 6 pages (`schema.org/Person` JSON-LD must not appear).
- [ ] Zero `Review` or `AggregateRating` JSON-LD added.
- [ ] All 6 Quick-Answer blocks present and within 40–60 words (count words in rendered HTML, not the source).
- [ ] All 6 FAQPage schema blocks valid — paste each into Google's Rich Results Test and confirm "Eligible".
- [ ] RPS link audit: no RPS link in hero/above-the-fold of any of the 6 Wave 1 pages; if present on `/admissions`, it is the small supporting note and uses an allowed anchor text from Section 3E.
- [ ] No new locality landing pages created (compare `client/src/App.tsx` route map before/after — must be identical).
- [ ] All existing names on `/chairpersons-note`, `/school-managing-committee`, `/academic-team`, `/about-rainbow-international-school`, `/cbse-mandatory-public-disclosures`, `/awards-achievements` untouched (those page files must not appear in the Wave 1 diff at all).

---

## 4. Post-implementation verification (before announcing Wave 1 complete)

- [ ] **Build passes:** `npm run build` (esbuild + Vite) clean, no new warnings.
- [ ] **SSR check for `/`:** `curl -s http://localhost:5000/ | grep -E '<title>|description|FAQPage'` shows new title, new description, FAQPage JSON-LD.
- [ ] **Client check for the other 5:** load each in the preview, view-source, confirm `<title>` and `<meta name="description">` reflect the new strings (after React mount).
- [ ] **Sitemap unchanged:** `sitemap.xml` route count identical to pre-Wave-1 (no new URLs).
- [ ] **404 check:** all 6 routes still return 200; no accidental rename.
- [ ] **Lighthouse SEO score** on each of the 6 pages ≥ pre-Wave-1 score.
- [ ] **e2e smoke test** via the testing skill on `/` and `/admissions` (admission enquiry form still submits; no JS errors).
- [ ] **Screenshot before/after** of each of the 6 pages saved into the implementation PR description.

---

## 5. Rollback plan (if any check in §3 or §4 fails)

- [ ] Revert the Wave 1 commit(s) on main.
- [ ] Confirm sitemap and routes return to pre-Wave-1 state.
- [ ] Log the failure mode in `docs/seo-content-rewrite-plan.md` Section 7 as a new decision so Wave 2 can avoid it.
- [ ] Do NOT proceed to Wave 2 until the root cause is fixed in the plan.

---

## 6. What is explicitly OUT of scope for Wave 1

- ❌ Any blog post edit (those follow Wave 2/3/4/5 per Section 2B).
- ❌ Any of the 35 other commercial pages.
- ❌ The 7 × 301 redirects and 7 × 410 gones (those have their own scheduled wave).
- ❌ The 3 MERGE operations.
- ❌ Any change to `/chairpersons-note`, `/school-managing-committee`, `/academic-team`, `/about-rainbow-international-school`, `/cbse-mandatory-public-disclosures`, `/awards-achievements`.
- ❌ Adding/removing any URL or route.
- ❌ Adding `Person`, `Review`, or `AggregateRating` schema anywhere.
- ❌ Adding any new person name anywhere on the site.
- ❌ Creating any new top-level documentation file.

---

## 7. Sign-off

- Approved planning version of source-of-truth doc: commit `cf2cddb` (`docs/seo-content-rewrite-plan.md`, 1,262 lines).
- This checklist version: **v1.0 — 2026-05-06**, planning only, no code touched.
- Implementation start requires: explicit user message "begin Wave 1 implementation" + recovery go/no-go pass.
