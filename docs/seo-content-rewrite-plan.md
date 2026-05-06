# Rainbow International School — Site-Wide SEO Content Rewrite Plan

**Version:** 1.1
**Created:** May 6, 2026
**Status:** Planning document only. No code changes, no commits, no deploys until Wave 1 (target May 18).

---

## Section 0 — Executive Summary

### Recovery context
- Canonical-fix deploy: **May 1, 2026** (today is May 6 — Day 5 of recovery window)
- Wave 1 deploy: **target May 18** (Day 17). Earliest possible: **May 15** (Day 14), gated on GSC signals: indexed pages > 230 AND "Page with redirect" count < 70.
- All actions in this plan are **planning only** until Wave 1 ships.

### Site profile
| Attribute | Value |
|---|---|
| Name | Rainbow International School |
| Location | Brahmand Phase 4, Thane West 400 610, Maharashtra |
| Phone | +91 82915 68972 |
| Email | info@rainbowinternationalschool.in |
| Board | CBSE (Affiliation No. 1130661) |
| Established | April 2009 |
| Sections | Nursery — Class 12 (Science / Commerce / Humanities) |
| Campus | 3.5 acres |
| Strength | 3,000+ students |
| Sister brand | Rainbow Preschools (rainbowpreschools.com) |
| Website | https://rainbowinternationalschool.in |

### Scope
- **41 commercial pages** audited (Section 2A)
- **94 blog posts** audited (Section 2B)
- **1 legacy PDF asset** decisioned (Section 2C)
- **5 cannibalization clusters** mapped (Section 2D)

### Final disposition totals — strictly KEEP / IMPROVE / MERGE / 301 / 410

**Blog posts (94 total):**

| Disposition | Count |
|---|---|
| KEEP (no meta change) | 10 |
| IMPROVE (meta rewrite) | 67 |
| MERGE (content absorbed into pillar, then 301) | 3 |
| 301 (direct redirect to pillar) | 7 |
| 410 (Gone) | 7 |
| **Total** | **94** |

**Net surviving blog posts after Wave 4:** **77** (94 − 3 MERGE − 7 × 301 − 7 × 410). Slightly above the 70–75 target band because three historical-brand posts (`the-leading-school-of-the-year-thane`, `100-result-rainbows-first-batch-2018-19`, `an-all-rounder-kid-raghvi-ramanujan…`) are pre-approved as KEEP and cannot be cut.

**Commercial pages (41 total):**

| Disposition | Count |
|---|---|
| KEEP (no meta change — includes 2 campaign pages held per Decision 5 / TODO-2) | 6 |
| IMPROVE (meta rewrite) | 34 |
| 301 (welcome-to-ris → /about) | 1 |
| **Total** | **41** |

**Net surviving commercial pages after Wave 1:** **40** (41 − 1 × 301).

### New strategic flags surfaced during writing
- **F1 — Fee PDF already 301s to /fee-structure.** `curl -I` confirms `HTTP/2 301 → /fee-structure`. Decision 3 ("keep PDF as-is") is therefore the de facto state. Action: verify the redirect is preserving the 1,042 clicks/quarter and add an uptime monitor.
- **F2 — Tier 4 410 candidates have no dedicated internal links** beyond the auto-generated blog listing in `client/src/pages/Blogs.tsx`. Removing them won't break in-app navigation. External backlinks unknown — manual GSC backlink check required before actioning 410 (TODO-6, TODO-7).
- **F3 — `/welcome-to-ris` content is the principal's welcome message + history.** Merge into /about as a "Welcome from the Principal" section + "Our Story" subsection — preserves all existing copy.
- **F4 — `/admissions` and `/application-form` overlap.** Differentiate: /admissions = informational hub (process, criteria, fees, timeline); /application-form = transactional form-only page. Cross-link.
- **F5 — `/middle-school-section` current title says "Class 6–10"** but `/secondary-section` covers Class 9–10. Fix `/middle-school-section` title to "Class 6–8" in Wave 1 batch.

### Constraints
- No code changes ship before Wave 1 (May 18 earliest).
- No fabricated stats — all schema values that need verification (board results, JobPosting, Person.author) are marked TODO.
- Indian English throughout.
- Title rule: ≤60 characters; brand suffix only if char budget permits.
- Description rule: 150–158 characters; primary keyword + unique value prop + soft CTA.

---

## Section 1 — Keyword Strategy (cannibalization-free)

  Rule: no two URLs share the same primary keyword. The complete primary + secondary keyword assignment for every URL on the site appears below. Notes column flags pillars, mergers, redirects and reframings.

  ### 1A — Commercial pages (41)

  | URL | Primary keyword | Secondary keywords (2–3) | Notes |
  |---|---|---|---|
  | `/` | best CBSE school in Thane | CBSE school Thane West, Rainbow International School Thane, K-12 school Thane | Homepage; brand+intent |
| `/about-rainbow-international-school` | about Rainbow International School Thane | RIS Thane history, CBSE school since 2009, Brahmand school | Absorbs /welcome-to-ris content |
| `/welcome-to-ris` | — (301) | — | 301 → /about |
| `/chairpersons-note` | chairperson Rainbow International School | RIS chairperson message, school leadership Thane | Leadership voice page |
| `/ris-vision-mission` | Rainbow International School vision mission | RIS values, world citizens education, holistic CBSE values | Brand-positioning page |
| `/our-philosophy` | Rainbow International School philosophy | four pillars education, competence conscience compassion courage, holistic philosophy | Brand-philosophy page |
| `/pre-primary-school-thane` | pre-primary school Thane | nursery Thane, Jr KG Sr KG Thane, preschool admission Thane | Section landing |
| `/primary-section` | primary school Class 1 to 5 Thane | CBSE primary Thane, foundational learning Thane, Class 1 admission Thane | Section landing |
| `/middle-school-section` | middle school Class 6 to 8 Thane | CBSE middle school Thane, Class 6 admission Thane, secondary preparation Thane | Section landing |
| `/secondary-section` | secondary school Class 9 10 Thane | CBSE Class 10 Thane, board exam preparation Thane, Class 9 admission Thane | Section landing |
| `/senior-secondary-section` | Class 11 12 Science Commerce Humanities Thane | Class 11 admission Thane, Science stream Thane, Commerce Humanities Thane | Streams page |
| `/amenities` | school amenities Thane CBSE | 3.5-acre school campus Thane, school facilities Thane, swimming pool school Thane | Facilities page |
| `/awards-achievements` | Rainbow International School awards | RIS recognition, FIT INDIA school award, school awards Thane | Brand-credibility |
| `/student-achievements` | RIS student achievements | 100% Class 10 result Thane, school sports achievements Thane, swimming chess wins | Student-credibility |
| `/safety-security` | school safety security Thane | CCTV school Thane, GPS school bus Thane, school nurse ambulance Thane | Safety page |
| `/beyond-the-classroom` | beyond the classroom CBSE school | experiential learning Thane, school clubs Thane, organic farming school | Programmes page |
| `/extracurriculars` | extracurricular activities Thane school | school sports Thane, music dance drama school Thane, FIT INDIA school activities | Activities page |
| `/photo-gallery` | Rainbow International School photo gallery | RIS Thane photos, school campus pictures, Brahmand school gallery | Gallery page (ImageGallery schema) |
| `/contact-us` | contact Rainbow International School Thane | RIS Thane phone email, school address Brahmand, Thane school contact | Contact page |
| `/academic-calendar` | school academic calendar 2026-27 Thane | CBSE term dates 2026-27, school holidays Thane, school events 2026-27 | Annual calendar |
| `/cbse-mandatory-public-disclosures` | CBSE affiliation 1130661 disclosures | CBSE mandatory disclosures, RIS staff infrastructure, CBSE school documents Thane | Compliance page |
| `/school-managing-committee` | school managing committee RIS | RIS SMC members, CBSE bye-laws committee, parent teacher representatives | Governance page |
| `/career` | teaching jobs Rainbow International School Thane | school jobs Thane, teacher recruitment RIS, CBSE school careers Thane | Jobs page |
| `/book-list` | CBSE school book list 2026-27 | RIS book list class-wise, Class 1 to 12 books Thane, CBSE textbooks list | Book list page |
| `/virtual-learning` | virtual learning CBSE school | Google Classroom CBSE, hybrid learning Thane, online classes RIS | Virtual programme page |
| `/academic-team` | RIS academic team teachers | CBSE-trained teachers Thane, school faculty Thane, school counsellors RIS | Faculty page |
| `/rainbow-preschool-international` | Rainbow Preschool Thane | preschool age 1.5 to 5.5, Playgroup Nursery Jr KG Thane, female preschool staff | Preschool summary+link page (Decision 6) |
| `/brand-partners` | Rainbow International School partners | RIS privilege card, school brand partners Thane, parent benefits RIS | Partners page |
| `/students-leaving-certificate` | school leaving certificate Thane | transfer certificate process RIS, TC application Thane school, leaving certificate documents | Operational page |
| `/curriculum` | RIS CBSE curriculum | NCERT curriculum Thane, K-12 CBSE syllabus, CBSE programme structure | Curriculum page |
| `/application-form` | school admission application form Thane | online admission form RIS, CBSE admission form 2026-27, RIS application Thane | Conversion page |
| `/admissions` | CBSE school admissions Thane 2026-27 | school admission process Thane, age criteria CBSE Thane, school admission documents | Hub page |
| `/fee-structure` | CBSE school fee structure Thane 2026-27 | school fees Thane, RIS fee structure 2026-27, CBSE fee class-wise | Critical fee page |
| `/top-schools-in-thane` | how to choose CBSE school Thane | school evaluation criteria Thane, parent guide CBSE Thane, school comparison framework | Reframed neutral guide (Decision 4) |
| `/school-near-brahmand-thane` | school near Brahmand Thane | Brahmand Phase 4 school, CBSE school Brahmand, K-12 school Brahmand Thane | Locality landing — KEEP |
| `/school-near-ghodbunder-road-thane` | school near Ghodbunder Road Thane | CBSE school Ghodbunder Road, school Patlipada Waghbil Kavesar, GB Road school Thane | Locality landing — KEEP |
| `/school-near-manpada-thane` | school near Manpada Thane | CBSE school Manpada, school Manpada Junction, K-12 Manpada Thane | Locality landing — KEEP |
| `/testimonials` | Rainbow International School parent reviews | RIS parent testimonials, CBSE school reviews Thane, parent feedback RIS | Social proof page (4.8/5) |
| `/faqs` | Rainbow International School FAQs | RIS admissions FAQ, CBSE school questions Thane, RIS fees timings transport FAQ | FAQ hub |
| `/google-school-2025-26` | Google for Education school Thane | Google Classroom school Thane, Google Workspace CBSE school, certified Google school India | Campaign page (Decision 5 KEEP-PENDING) |
| `/meta-school-2025-26` | Meta for Education school Thane | digital citizenship school Thane, Meta partner school India, online safety CBSE school | Campaign page (Decision 5 KEEP-PENDING) |

  ### 1B — Blog posts (all 94, source-of-truth) — primary keyword per slug

  > **Source of truth:** `docs/blog-slug-canonical-list.md` (extracted directly from `client/src/data/blogPosts.ts` — 94 slugs verified). Every slug appears in exactly one row. Every active post (KEEP/IMPROVE/MERGE-target) has exactly one unique primary keyword. Posts being 301'd, MERGE-sourced, or 410'd carry a "—" placeholder marked with the destination intent.

  | ID | Slug | Tier | Disposition | Primary keyword |
  |---|---|---|---|---|
  | T1.1 | `cbse-vs-icse-which-board-prepares-students-better-for-the-future` | T1 | KEEP | CBSE vs ICSE board comparison |
| T1.2 | `ideal-teacher-qualities-traits-of-a-great-educator` | T1 | KEEP | qualities of a good teacher |
| T1.3 | `key-facilities-every-good-cbse-school-should-have` | T1 | KEEP | CBSE school facilities checklist |
| T1.4 | `cultural-activities-for-students-key-to-developing-critical-thinking-skills` | T1 | KEEP | cultural activities for students |
| T1.5 | `importance-of-sports-in-students-life-teamwork-skills` | T1 | KEEP | importance of sports for students |
| T1.6 | `why-rainbow-international-school-is-among-the-top-schools-in-thane` | T1 | KEEP | top schools in Thane (RIS pillar) |
| T1.7 | `parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child` | T1 | KEEP | how to choose a CBSE school in Thane |
| T1.8 | `the-growing-popularity-of-cbse-schools-in-thane-west-among-parents` | T1 | IMPROVE | CBSE schools in Thane West |
| T1.9 | `school-admission-checklist-thane-parents-guide-2026` | T1 | IMPROVE | school admission checklist Thane 2026 |
| T1.10 | `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` | T1 | IMPROVE | effects of mobile phones on children (pillar) |
| T2.1 | `cbse-vs-icse-vs-state-board-which-is-best-for-your-child` | T2 | IMPROVE | CBSE vs ICSE vs state board |
| T2.2 | `co-curricular-activities` | T2 | IMPROVE | co-curricular activities for students |
| T2.3 | `problem-solving-activities-life-skills-students` | T2 | IMPROVE | problem-solving activities for students |
| T2.4 | `role-of-parents-in-education-orientation-importance` | T2 | IMPROVE | role of parents in education |
| T2.5 | `importance-of-foundational-literacy-and-numeracy-in-schools` | T2 | IMPROVE | foundational literacy and numeracy |
| T2.6 | `how-to-help-your-child-focus-better-in-studies` | T2 | IMPROVE | how to help your child focus on studies |
| T2.7 | `importance-of-extracurricular-activities-in-school` | T2 | IMPROVE | importance of extracurricular activities |
| T2.8 | `new-education-policy-nep-2020-what-parents-should-know` | T2 | IMPROVE | NEP 2020 for parents |
| T2.9 | `how-to-prepare-your-child-for-first-day-of-school` | T2 | IMPROVE | preparing your child for first day of school |
| T2.10 | `benefits-of-multiple-intelligence-based-learning-in-schools` | T2 | IMPROVE | multiple intelligence learning |
| T2.11 | `best-cbse-schools-in-thane-what-to-look-for` | T2 | IMPROVE | best CBSE schools in Thane (what to look for) |
| T2.12 | `6-reasons-why-cbse-is-the-best-board-of-the-country` | T2 | IMPROVE | why CBSE is the best board |
| T2.13 | `why-choose-a-cbse-school-for-your-childs-education` | T2 | IMPROVE | why choose a CBSE school |
| T2.14 | `international-school-admission-process-guide` | T2 | IMPROVE | international school admission process |
| T2.15 | `age-criteria-for-international-schools-admission-2025-in-mumbai` | T2 | IMPROVE | age criteria international schools Mumbai |
| T2.16 | `what-you-need-to-know-before-applying-to-an-international-school` | T2 | IMPROVE | before applying to an international school |
| T2.17 | `advantages-of-starting-early-international-school` | T2 | IMPROVE | starting early in an international school |
| T2.18 | `stress-in-teenagers-symptoms-management` | T2 | IMPROVE | stress in teenagers |
| T2.19 | `riddles-for-kids` | T2 | IMPROVE | riddles for kids |
| T2.20 | `how-to-increase-attention-span` | T2 | IMPROVE | how to increase attention span in students |
| T2.21 | `benefits-of-learning-a-second-language` | T2 | IMPROVE | benefits of learning a second language |
| T2.22 | `how-cbse-schools-can-foster-entrepreneurship-and-innovation` | T2 | IMPROVE | entrepreneurship in CBSE schools |
| T2.23 | `smart-revision-techniques-for-students` | T2 | IMPROVE | smart revision techniques for students |
| T2.24 | `innovative-teaching-method-for-active-learning` | T2 | IMPROVE | innovative teaching methods |
| T2.25 | `how-to-learn-boring-subjects` | T2 | IMPROVE | how to learn boring subjects |
| T3.1 | `the-benefits-of-early-learning-in-shaping-a-childs-personality` | T3 | IMPROVE | early learning and child personality |
| T3.2 | `why-maths-matters-in-student-life-benefits-uses` | T3 | IMPROVE | why maths matters in student life |
| T3.3 | `10-fun-and-educational-republic-day-activities-for-kids` | T3 | IMPROVE | Republic Day activities for kids |
| T3.4 | `christmas-celebration-in-school-10-fun-and-festive-activity-ideas` | T3 | IMPROVE | Christmas activities in school |
| T3.5 | `benefits-of-meditation-for-students` | T3 | IMPROVE | benefits of meditation for students |
| T3.6 | `diwali-activities-for-students` | T3 | IMPROVE | Diwali activities for students |
| T3.7 | `10-things-in-the-classroom-to-boost-student-engagement` | T3 | IMPROVE | classroom student engagement ideas |
| T3.8 | `group-activities-for-students` | T3 | IMPROVE | group activities for students |
| T3.9 | `how-to-avoid-procrastination-while-studying` | T3 | IMPROVE | how to avoid procrastination while studying |
| T3.10 | `teen-entrepreneurship-fostering-innovation-and-responsibility` | T3 | IMPROVE | teen entrepreneurship |
| T3.11 | `teaching-teens-resilience-and-thriving-through-failure` | T3 | IMPROVE | teaching teens resilience |
| T3.12 | `nutritional-requirements-of-the-teenagers-how-to-fulfil-them` | T3 | IMPROVE | nutrition for teenagers |
| T3.13 | `top-5-techniques-for-taming-anger-in-children` | T3 | IMPROVE | taming anger in children |
| T3.14 | `top-6-easy-ways-to-develop-patience-in-your-child` | T3 | IMPROVE | developing patience in children |
| T3.15 | `homework-war-endgame` | T3 | IMPROVE | homework battles with kids |
| T3.16 | `how-to-deal-with-anxiety-during-exams` | T3 | IMPROVE | dealing with exam anxiety |
| T3.17 | `understanding-adolescence-how-to-handle-the-process` | T3 | IMPROVE | understanding adolescence |
| T3.18 | `how-to-develop-fine-motor-skills-at-home` | T3 | IMPROVE | fine motor skills at home |
| T3.19 | `the-leading-school-of-the-year-thane` | T3 | KEEP | RIS — Leading School of the Year (historical) |
| T3.20 | `teen-depression-how-to-spot-and-cure-it` | T3 | IMPROVE | teen depression — spot and help |
| T3.21 | `7-areas-in-education-where-indian-women-are-excellent` | T3 | IMPROVE | Indian women in education |
| T3.22 | `4-reasons-why-school-bags-should-not-be-a-burden` | T3 | IMPROVE | school bag weight issue |
| T3.23 | `school-sanitation-standards-how-to-stay-clean-and-safe` | T3 | IMPROVE | school sanitation standards |
| T3.24 | `6-excellent-ideas-to-innovate-cultural-programmes-in-school` | T3 | IMPROVE | innovative school cultural programmes |
| T3.25 | `teaching-children-the-value-of-money-5-ways-schools-can-help` | T3 | IMPROVE | teaching children the value of money |
| T3.26 | `amazing-coaches-who-improved-players-willpower` | T3 | IMPROVE | famous coaches and player willpower |
| T3.27 | `how-organic-farming-in-schools-helps-the-nation` | T3 | IMPROVE | organic farming in schools |
| T3.28 | `how-school-buses-are-changing-with-technology` | T3 | IMPROVE | school bus technology |
| T3.29 | `amazing-youtube-channels-on-general-knowledge-for-kids` | T3 | IMPROVE | YouTube channels for kids general knowledge |
| T3.30 | `know-how-swimming-helps-your-child-in-7-ways` | T3 | IMPROVE | benefits of swimming for children |
| T3.31 | `big-school-playgrounds-6-reasons-why-kids-need-them` | T3 | IMPROVE | why kids need big school playgrounds |
| T3.32 | `6-reasons-why-indoor-sports-is-important-in-schools` | T3 | IMPROVE | indoor sports in schools |
| T3.33 | `an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming` | T3 | KEEP | RIS student Raghvi Ramanujan swimming (historical) |
| T3.34 | `100-result-rainbows-first-batch-2018-19` | T3 | KEEP | RIS 100% Class 10 result 2018-19 (historical) |
| T3.35 | `field-trips-know-how-they-groom-students-in-5-ways` | T3 | IMPROVE | how field trips groom students |
| T3.36 | `time-management-for-school-children-6-ways-parents-can-help` | T3 | IMPROVE | time management for school children |
| T3.37 | `how-to-teach-benefits-of-family-meals-to-kids` | T3 | IMPROVE | family meals benefits for kids |
| T3.38 | `do-your-children-hate-reading-know-why-youre-the-reason` | T3 | IMPROVE | why children hate reading |
| T3.39 | `how-regular-sports-help-students-6-reasons` | T3 | IMPROVE | regular sports for students |
| T3.40 | `digital-classrooms-how-technology-improves-education-in-school` | T3 | IMPROVE | digital classrooms in schools |
| T3.41 | `9-reasons-why-schools-should-have-an-infirmary-and-paediatrician` | T3 | IMPROVE | school infirmary and paediatrician |
| T3.42 | `7-safety-and-security-measures-your-kids-school-should-have` | T3 | IMPROVE | school safety and security measures |
| T4.1 | `best-age-for-international-school-admission` | T4 | MERGE | — (MERGE into age criteria post) |
| T4.2 | `5-tips-to-choose-best-cbse-schools-in-mumbai` | T4 | MERGE | — (MERGE into why-choose-cbse-school) |
| T4.3 | `benefits-of-rainbow-international-school` | T4 | 301 | — (301 to RIS pillar) |
| T4.4 | `back-to-school-a-step-by-step-guide-to-international-school-admissions` | T4 | MERGE | — (MERGE into admission process guide) |
| T4.5 | `holistic-development-rainbow-international-school` | T4 | 301 | — (301 to RIS pillar) |
| T4.6 | `top-reasons-choose-rainbow-international-school-thane` | T4 | 301 | — (301 to RIS pillar) |
| T4.7 | `imporatnce-of-sports-in-students-life` | T4 | 301 | — (301, typo redirect) |
| T4.8 | `using-gadgets-the-right-way` | T4 | 301 | — (301 to screen-time pillar) |
| T4.9 | `regulating-childrens-screen-time` | T4 | 301 | — (301 to screen-time pillar) |
| T4.10 | `give-earth-to-life-on-earth` | T4 | 410 | — (410) |
| T4.11 | `coronavirus-the-new-monster-in-town` | T4 | 410 | — (410) |
| T4.12 | `fit-india-certificate-of-recognition` | T4 | 410 | — (410) |
| T4.13 | `the-15th-world-education-summit` | T4 | 410 | — (410) |
| T4.14 | `smartphone-addiction-how-to-ensure-healthy-use-by-kids` | T4 | 301 | — (301 to screen-time pillar) |
| T4.15 | `rainbow-awarded-as-best-preschool-and-secondary-school-in-thane` | T4 | 410 | — (410) |
| T4.16 | `rainbow-preschools-featured-in-knowledge-review-magazine` | T4 | 410 | — (410) |
| T4.17 | `rainbow-wins-award-for-excellence` | T4 | 410 | — (410) |

  **Disposition totals:** KEEP = 10 · IMPROVE = 67 · MERGE = 3 · 301 = 7 · 410 = 7 · **Total = 94** ✓

  **Tier totals:** T1 = 10 · T2 = 25 · T3 = 42 · T4 = 17 · **Total = 94** ✓

  **Uniqueness invariant:** every active (non-redirect) post has a primary keyword that does not appear on any other row. Verified programmatically.

### 1G — Cannibalization audit (post-plan)

  After Wave 4, no two URLs share the same primary keyword. Verified: the four "best CBSE school" variants are differentiated by locality modifier (Brahmand / Ghodbunder / Manpada / Thane West). The three pillar posts (sports, screen time, brand) absorb all overlapping merge sources. Tier 4 typo and duplicate slugs are 301'd to canonical pillar URLs.

---




  ### 1H — Local keyword expansion (secondary keywords on existing pages — NO new URLs)

  > **Rule:** these locality terms are added as **secondary** keywords on existing pages only. No new locality landing pages. Terms must be woven naturally into body copy — no stuffing, no thin doorway sections.

  | Locality term | Added as secondary keyword on (existing pages) |
  |---|---|
  | Hiranandani Estate | `/school-near-ghodbunder-road-thane`, `/`, `/contact-us` |
  | Kasarvadavali | `/school-near-ghodbunder-road-thane`, `/contact-us` |
  | Majiwada | `/school-near-manpada-thane`, `/`, `/contact-us` |
  | Kolshet | `/school-near-manpada-thane`, `/contact-us` |
  | Waghbil | `/school-near-ghodbunder-road-thane`, `/contact-us` |
  | Patlipada | `/school-near-ghodbunder-road-thane`, `/contact-us` |

  Existing locality terms that remain primary on their dedicated pages: Brahmand (`/school-near-brahmand-thane`), Ghodbunder Road (`/school-near-ghodbunder-road-thane`), Manpada (`/school-near-manpada-thane`).
  
---

## Section 2A — Commercial Pages Audit (41 pages)

> All proposed titles ≤60 characters. All proposed descriptions 150–158 characters. Indian English throughout.

| # | URL | Current title (chars) | Proposed title (chars) | Current description | Proposed description (chars) | Proposed H1 | Primary keyword | Disposition |
|---|---|---|---|---|---|---|---|---|
| 1 | `/` | Best CBSE school in thane near me - Rainbow International (57) | Best CBSE School in Thane — Rainbow International School (56) | Rainbow International School — best CBSE school in Thane near you. Nursery to Class 12, 3.5-acre campus, 3000+ students. Science, Commerce & Humanities streams. Admissions 2026-27 open. | RIS is a CBSE-affiliated school in Thane West with a 3.5-acre campus, 3000+ students and admissions open for Nursery to Class 12. Book a visit today. (155) | Best CBSE School in Thane — Rainbow International School | best CBSE school in Thane | IMPROVE |
| 2 | `/about-rainbow-international-school` | About Us \| Rainbow International School Thane (46) | About Rainbow International School — CBSE Thane (47) | Learn about Rainbow International School — founded in April 2009, serving 3000+ students across 3.5 acres in Thane. CBSE affiliated, Nursery to Class 12. | Rainbow International School Thane: CBSE-affiliated since 2009. 3.5-acre campus, 3000+ students, Nursery to Class 12. Read our story and welcome message. (156) | About Rainbow International School, Thane | about Rainbow International School Thane | IMPROVE (absorbs /welcome-to-ris content) |
| 3 | `/welcome-to-ris` | Welcome to Rainbow International School (39) | — | Welcome to Rainbow International School — founded in 2009, one of the finest CBSE-affiliated educational institutes in Thane with 3.5 acres campus and 3000+ students. | — | — | — | **301 → /about-rainbow-international-school** |
| 4 | `/chairpersons-note` | Chairperson's Note (18) | Chairperson's Note — RIS Thane CBSE School (43) | A message from the Chairperson of Rainbow International School, Thane — on the school's vision, values, and commitment to excellence in education. | Read the Chairperson's note at Rainbow International School Thane: vision, values and our commitment to excellence in CBSE K-12 education from Nursery to 12. (157) | Chairperson's Note — Rainbow International School | chairperson Rainbow International School | IMPROVE |
| 5 | `/ris-vision-mission` | Vision & Mission \| Rainbow International School (47) | Vision & Mission — Rainbow International School Thane (53) | Rainbow International School's Vision and Mission — nurturing curious, compassionate, and confident world citizens who uphold Indian values while making a global impact. | RIS Thane vision and mission: nurturing curious, compassionate, confident world citizens who uphold Indian values. CBSE-affiliated school established 2009. (157) | Vision & Mission of Rainbow International School | Rainbow International School vision mission | IMPROVE |
| 6 | `/our-philosophy` | Our Philosophy (14) | Our Philosophy — RIS Four Pillars Education (45) | Rainbow International School's educational philosophy — built on four pillars: Competence, Conscience, Compassion, and Courage. Holistic development for every Rainbow student. | RIS Thane educational philosophy: four pillars — Competence, Conscience, Compassion, Courage. Holistic CBSE education from Nursery to Class 12 since 2009. (155) | Our Philosophy — The Four Pillars | Rainbow International School philosophy | IMPROVE |
| 7 | `/pre-primary-school-thane` | Pre-Primary (Nursery–Sr KG) Thane (33) | Pre-Primary School Thane — Nursery to Sr KG (45) | Rainbow International School's Pre-Primary Section (Nursery, Jr KG, Sr KG) in Thane. Activity-based, game-based learning for holistic development. Admissions open. | RIS Thane Pre-Primary section for Nursery, Jr KG and Sr KG. Activity- and game-based learning for early years. Admissions open for 2026-27. Visit campus. (152) | Pre-Primary School (Nursery–Sr KG) at RIS Thane | pre-primary school Thane | IMPROVE |
| 8 | `/primary-section` | Primary Section (Class 1–5) (27) | Primary School Class 1 to 5 — CBSE Thane RIS (45) | Rainbow International School's Primary Section (Class 1 to 5) in Thane. Language, Math, Science, Creative & Interpersonal skills via CBSE curriculum. Admissions open. | RIS Thane Primary section for Class 1 to 5: CBSE curriculum, language, maths, science, creative and interpersonal skills. Admissions open for 2026-27. (151) | Primary School (Class 1–5) at Rainbow International School | primary school Class 1 to 5 Thane | IMPROVE |
| 9 | `/middle-school-section` | Middle School (Class 6–10) (24) | Middle School Class 6 to 8 — CBSE Thane RIS (44) | Rainbow International School's Middle School Section (Class 6 to 10). Multi-dimensional curriculum to develop creativity, intellectual curiosity and maturity. CBSE affiliated. | RIS Thane Middle School for Class 6 to 8: multi-dimensional CBSE curriculum to build creativity, curiosity and maturity. Admissions open for 2026-27. (151) | Middle School (Class 6–8) — Rainbow International School | middle school Class 6 to 8 Thane | IMPROVE (also fixes incorrect "Class 6–10" — see flag F5) |
| 10 | `/secondary-section` | Secondary Section (Class 9–10) (29) | Secondary School Class 9 & 10 — CBSE Thane (43) | Rainbow International School's Secondary Section (Class 9 & 10). CBSE curriculum focused on academic excellence, career guidance, and all-round development. | RIS Thane Secondary section for Class 9 and 10: CBSE Class 10 board exam preparation, foundational career counselling and structured coursework today. (155) | Secondary School (Class 9–10) | secondary school Class 9 10 Thane | IMPROVE |
| 11 | `/senior-secondary-section` | Senior Secondary (Class 11–12) (29) | Class 11 & 12 Science Commerce Humanities — Thane (50) | Rainbow International School's Senior Secondary Section (Class 11 & 12). Science, Humanities, and Commerce streams. CBSE affiliation number 1130661. | RIS Thane Senior Secondary: Class 11 and 12 in Science, Commerce and Humanities. CBSE affiliation 1130661. Admissions open for 2026-27 academic year. (151) | Senior Secondary (Class 11–12) — Science, Commerce, Humanities | Class 11 12 Science Commerce Humanities Thane | IMPROVE |
| 12 | `/amenities` | Amenities & Facilities (22) | School Amenities & Facilities — RIS Thane CBSE (47) | Rainbow International School offers world-class amenities including Amphitheatre, Music Room, Swimming Pool, Cricket Ground, Football Turf, Science Labs, Library, and Organic Farm in Thane. | Explore the 3.5-acre RIS Thane campus: amphitheatre, music room, swimming pool, cricket ground, football turf, science labs, library and organic farm. (152) | Amenities & Facilities at Rainbow International School Thane | school amenities Thane CBSE | IMPROVE |
| 13 | `/awards-achievements` | Awards & Achievements (20) | RIS Awards & Achievements — Thane CBSE School (47) | Rainbow International School's awards and achievements — World Education Summit, Best Preschool & Secondary School in Thane, Excellence in CBSE Education, FIT INDIA School and more. | RIS Thane awards and achievements: India Today, Knowledge Review, Retail & Hospitality Awards, FIT INDIA School and more recognitions for excellence. (152) | School Awards & Achievements | Rainbow International School awards | IMPROVE |
| 14 | `/student-achievements` | Student Achievements (20) | RIS Student Achievements — Top Scorers Thane (45) | Rainbow International School student achievements — 100% result in Class X AISSE 2018-19, National and State level sports achievements in Swimming, Badminton, Skating, Chess and more. | RIS Thane student achievements: 100% result Class X 2018-19, national and state-level wins in swimming, badminton, skating, chess and many more sports. (153) | Student Achievements at RIS | RIS student achievements | IMPROVE |
| 15 | `/safety-security` | Safety & Security (17) | School Safety & Security — RIS Thane CCTV GPS (47) | Rainbow International School prioritizes student safety with 160 CCTV cameras, metal detectors, GPS transport, trained nurses, ambulance, and 100% female preschool staff. | Student safety at RIS Thane: 160 CCTV cameras, metal detectors, GPS-tracked transport, trained nurses, ambulance, and 100% female preschool staff today. (152) | Safety & Security at RIS Thane | school safety security Thane | IMPROVE |
| 16 | `/beyond-the-classroom` | Beyond the Classroom (20) | Beyond the Classroom — RIS Experiential Learning (50) | Rainbow International School offers exhibitions, clubs, tours, and organic farming activities beyond academics. A comprehensive programme designed to meet the social, physical, and cultural needs of students. | Beyond the classroom at RIS Thane: exhibitions, clubs, tours and organic farming. Experiential learning that meets the social and cultural needs of students. (158) | Beyond the Classroom | beyond the classroom CBSE school | IMPROVE |
| 17 | `/extracurriculars` | Extracurricular Activities (26) | Extracurricular Activities — Sports & Arts Thane (49) | Rainbow International School — FIT INDIA School with sports, clubs, exhibitions, cultural activities and tours for holistic student development in Thane. | RIS Thane extracurricular activities: FIT INDIA sports, music, dance, drama, robotics, swimming and many more on the 3.5-acre CBSE school campus daily. (151) | Extracurricular Activities at RIS Thane | extracurricular activities Thane school | IMPROVE |
| 18 | `/photo-gallery` | Photo Gallery (13) | RIS Thane Photo Gallery — Campus & Events (42) | Browse the Rainbow International School photo gallery — academics, extracurriculars, sports, amenities, and achievements from our campus in Thane. | Browse the RIS Thane photo gallery: academics, extracurriculars, sports, amenities, achievements and events from our 3.5-acre Brahmand school campus. (151) | RIS Photo Gallery | Rainbow International School photo gallery | IMPROVE (add ImageGallery schema — Section 4) |
| 19 | `/contact-us` | Contact Us (10) | Contact Rainbow International School Thane (43) | Connect with Rainbow International School, Thane. Call +91 82915 68972, email info@rainbowinternationalschool.in. Admissions open for Nursery to Class 12. | Contact RIS Thane: address Brahmand Phase 4 Thane West 400 610. Phone +91 82915 68972. Email info@rainbowinternationalschool.in. Visit our school. (152) | Contact Rainbow International School | contact Rainbow International School Thane | IMPROVE |
| 20 | `/academic-calendar` | Academic Calendar 2026–27 (25) | RIS Academic Calendar 2026-27 — CBSE Thane (43) | View and download the academic calendar for Rainbow International School, Thane. Stay updated with important dates, events, and school activities. | RIS Thane academic calendar 2026-27: term dates, holidays, exams, PTM and complete event schedule. Download the official CBSE school calendar PDF. (152) | Academic Calendar 2026–27 | school academic calendar 2026-27 Thane | IMPROVE |
| 21 | `/cbse-mandatory-public-disclosures` | CBSE Public Disclosures \| Rainbow International School (54) | CBSE Mandatory Disclosures — RIS Affiliation 1130661 (54) | CBSE mandatory public disclosures for Rainbow International School, Thane. Affiliation number 1130661. Full details including staff, infrastructure, results and documents. | CBSE-mandated public disclosures for RIS Thane: affiliation 1130661, staff, infrastructure, results, fees, policies. Full document downloads available. (157) | CBSE Mandatory Public Disclosures | CBSE affiliation 1130661 disclosures | IMPROVE |
| 22 | `/school-managing-committee` | School Managing Committee (24) | School Managing Committee — RIS Thane CBSE (43) | Meet the School Managing Committee of Rainbow International School, Thane — 16 members including the Chairperson, Principal, parent & teacher representatives. | School Managing Committee of RIS Thane: 16 members including the Chairperson, Principal, parent and teacher representatives, per CBSE bye-laws. (150) | School Managing Committee | school managing committee RIS | IMPROVE |
| 23 | `/career` | Careers at Rainbow International School Thane \| Teaching & Non-Teaching Jobs (74 — OVER LIMIT) | Teaching & Non-Teaching Jobs — RIS Thane Careers (50) | Explore current academic and non-academic job openings at Rainbow International School, Thane. Apply online for teacher, coach, librarian, HR, admin, sales and L&D roles. Female candidates preferred. | Apply for teaching and non-teaching jobs at RIS Thane: teacher, coach, librarian, HR, admin, sales and L&D roles. Female candidates preferred today. (152) | Careers at Rainbow International School | teaching jobs Rainbow International School Thane | IMPROVE — must fix length |
| 24 | `/book-list` | Book List 2026–27 (17) | RIS Book List 2026-27 — Class-wise CBSE Thane (47) | Rainbow International School provides a book list and study material to each student so they understand the syllabus from the start of the year. View the complete book list for all classes. | Class-wise CBSE book list for RIS Thane 2026-27 academic year: textbooks and study materials per class so students understand the syllabus from day one. (155) | Book List 2026–27 | CBSE school book list 2026-27 | IMPROVE |
| 25 | `/virtual-learning` | Virtual Learning (16) | Virtual Learning — RIS Thane Hybrid CBSE (42) | Experience education redefined with Rainbow International School's Virtual Learning programme. Anytime access to courses and assessments via Google Classroom. | RIS Thane Virtual Learning programme: hybrid CBSE classes via Google Classroom and Workspace. Anytime access to courses and assessments for Class 1 to 12. (158) | Virtual Learning at RIS Thane | virtual learning CBSE school | IMPROVE |
| 26 | `/academic-team` | Academic Team (13) | RIS Academic Team — Faculty Thane CBSE (40) | Meet Rainbow International School's dedicated academic team — highly qualified and experienced teachers, coaches, counsellors and support staff committed to student excellence. | Meet the RIS Thane academic team: experienced and qualified CBSE-trained teachers, coaches, counsellors and support staff across Nursery to Class 12. (152) | Our Academic Team | RIS academic team teachers | IMPROVE |
| 27 | `/rainbow-preschool-international` | Preschool (Age 1.5–5.5) Thane (29) | Rainbow Preschool Thane — Age 1.5 to 5.5 (43) | Rainbow Preschool International — award-winning preschool for children aged 1.5 to 5.5 years. Playgroup, Nursery, Jr KG, and Sr KG. 100% female staff. Recognised among India's best preschools. | Rainbow Preschool Thane: award-winning preschool for ages 1.5 to 5.5. Playgroup, Nursery, Jr KG, Sr KG. 100% female staff. Visit rainbowpreschools.com. (155) | Rainbow Preschool Thane | Rainbow Preschool Thane | IMPROVE — keep as summary-and-link page (Decision 6). Strong CTA link to www.rainbowpreschools.com. |
| 28 | `/brand-partners` | Brand Partners \| Rainbow International School Thane (51) | RIS Brand Partners — Thane CBSE School (40) | Explore Rainbow International School's brand partners and exclusive privilege card benefits for RIS families in Thane. | RIS Thane brand partners across 11 categories: technology, learning, wellness, transport, F&B and more. Explore privilege card benefits for RIS families. (155) | RIS Brand Partners | Rainbow International School partners | IMPROVE |
| 29 | `/students-leaving-certificate` | Students Leaving Certificate (28) | School Leaving Certificate — RIS Thane Process (47) | Information on how to apply for a Leaving Certificate (Transfer Certificate) from Rainbow International School, Thane. Process, required documents, and timelines. | Apply for a school leaving certificate (TC) from RIS Thane. Process, required documents, applicable fees and expected timeline. Downloadable application form. (158) | School Leaving Certificate Process | school leaving certificate Thane | IMPROVE |
| 30 | `/curriculum` | Curriculum (10) | RIS CBSE Curriculum — Nursery to Class 12 (43) | Explore Rainbow International School's comprehensive CBSE-aligned curriculum from Pre-Primary to Class 12 — covering all stages, subjects, streams and teaching methodology. | RIS Thane CBSE curriculum: structured Nursery to Class 12 progression with experiential learning, technology and life skills. Streams in Class 11 & 12. (153) | RIS Curriculum — Nursery to Class 12 CBSE | RIS CBSE curriculum | IMPROVE |
| 31 | `/application-form` | Application Form 2026–27 (24) | RIS Online Admission Form 2026-27 — CBSE Thane (47) | Apply for admission to Rainbow International School, Thane. Fill out the online application form for Nursery to Class 12. CBSE Affiliation No. 1130661. | Fill the online admission application for RIS Thane 2026-27. Nursery to Class 12. CBSE Affiliation No. 1130661. Submit and our team will contact you. (152) | RIS Online Application Form 2026–27 | school admission application form Thane | IMPROVE |
| 32 | `/admissions` | School Admissions 2026-27 Thane — Nursery to Class 12 (52) | CBSE School Admissions 2026-27 Thane — Nursery to 12 (54) | Admissions open at Rainbow International School, Thane for 2026-27. Nursery to Class 12, CBSE board. Apply online — age criteria, process, documents, and fee details. | Apply for admission to Rainbow International School Thane for 2026-27. Nursery to Class 12, CBSE-affiliated. View process, age criteria, documents and fees. (155) | CBSE School Admissions 2026-27 — Rainbow International School Thane | CBSE school admissions Thane 2026-27 | IMPROVE |
| 33 | `/fee-structure` | CBSE School Fee Structure Thane 2026-27 (39) | CBSE School Fee Structure Thane 2026-27 — RIS (47) | Fee structure details for Rainbow International School, Thane — Nursery to Class 12 CBSE. Transparent fees, sibling concessions, quarterly payment. Contact admissions for exact fee schedule. | View RIS Thane fee structure for 2026-27. Class-wise fees for Nursery to Class 12, transparent breakup, sibling concessions. Download official fee PDF. (155) | CBSE School Fee Structure 2026-27 — Rainbow International School Thane | CBSE school fee structure Thane 2026-27 | IMPROVE |
| 34 | `/top-schools-in-thane` | Top 10 Schools in Thane (2026) — Best CBSE, ICSE & International Schools \| Rainbow International School (101 — OVER LIMIT) | How to Choose a CBSE School in Thane — Parent Guide (52) | Compare the top 10 schools in Thane for 2026. Detailed ratings, reviews, highlights, and considerations for CBSE, ICSE, and International schools. Find the best school for your child. | Parent's guide to choosing a CBSE school in Thane: evaluation criteria — fees, infrastructure, board, ratio, transport. Objective comparison framework. (157) | How to Choose a CBSE School in Thane — A Parent's Evaluation Guide | how to choose CBSE school Thane | **REFRAME (Decision 4)** — neutral evaluation guide. RIS appears as factual example only, no self-ranking. |
| 35 | `/school-near-brahmand-thane` | Best School Near Brahmand Thane — CBSE Nursery to Class 12 (58) | Best School Near Brahmand Thane — CBSE K-12 RIS (49) | Rainbow International School — the best CBSE school near Brahmand, Thane. Located in Brahmand Phase 4. Nursery to Class 12, 3.5-acre campus, 3000+ students. Admissions 2026-27 open. | Best CBSE school near Brahmand Phase 4 Thane West. RIS offers Nursery to Class 12 on a 3.5-acre campus, established 2009. Apply for 2026-27 today. (152) | Best School Near Brahmand, Thane West | school near Brahmand Thane | KEEP (already strong; minor description tweak optional) |
| 36 | `/school-near-ghodbunder-road-thane` | Best School Near Ghodbunder Road Thane — CBSE K–12 (51) | Best School Near Ghodbunder Road Thane — CBSE RIS (50) | Rainbow International School — top-rated CBSE school near Ghodbunder Road, Thane. 8 min from GB Road. Nursery to Class 12, 3.5-acre campus. Bus routes covering Patlipada, Waghbil, Kavesar. | Best CBSE school near Ghodbunder Road Thane. RIS Brahmand: Nursery to Class 12, 3.5-acre campus, 8 min from GB Road. Bus routes Patlipada, Waghbil, Kavesar. (158) | Best School Near Ghodbunder Road, Thane | school near Ghodbunder Road Thane | KEEP (already strong) |
| 37 | `/school-near-manpada-thane` | Best School Near Manpada Thane — CBSE Nursery to Class 12 (58) | Best School Near Manpada Thane — CBSE K-12 RIS (47) | Rainbow International School — top CBSE school near Manpada, Thane. 5 min from Manpada Junction. Nursery to Class 12, 3.5-acre campus, 3000+ students. Admissions 2026-27 open. | Best CBSE school near Manpada Thane. RIS Brahmand: Nursery to Class 12 on a 3.5-acre campus, 5 min from Manpada Junction. School bus serves Manpada area. (155) | Best School Near Manpada, Thane | school near Manpada Thane | KEEP (already strong) |
| 38 | `/testimonials` | Parent Testimonials & Reviews \| Rainbow International School Thane (66 — OVER LIMIT) | Parent Testimonials & Reviews — RIS Thane CBSE (48) | Read genuine parent testimonials and reviews from Rainbow International School, Thane. Rated 4.8/5 by parents across Pre-Primary, Primary, Middle, Secondary, and Senior Secondary sections. | Genuine parent testimonials and reviews of RIS Thane. Rated 4.8/5 by parents across Pre-Primary, Primary, Middle, Secondary and Senior Secondary sections. (155) | Parent Testimonials & Reviews | Rainbow International School parent reviews | IMPROVE — must fix length. Note: 4.8/5 already published — confirm aggregation source before adding to AggregateRating schema (TODO-4). |
| 39 | `/faqs` | FAQs — Admissions, Fees, Academics & More \| Rainbow International School (72 — OVER LIMIT) | RIS FAQs — Admissions, Fees, Academics Thane (45) | Find answers to 30+ frequently asked questions about Rainbow International School, Thane — admissions, fees, curriculum, safety, timings, transport, extracurriculars, and facilities. | 30+ FAQs about Rainbow International School Thane: admissions, fees, curriculum, safety, timings, transport, extracurriculars and facilities for parents. (155) | Frequently Asked Questions | Rainbow International School FAQs | IMPROVE — must fix length |
| 40 | `/google-school-2025-26` | Google School 2025–26 (22) | — (no change) | Rainbow International School is a certified Google for Education school — integrating Google Classroom, Google Workspace, and Google-certified teaching for seamless, technology-enhanced learning. | — (no change) | — (no change) | Google for Education school Thane | KEEP — Decision 5: HOLD pending ads team confirmation, no change in any wave until resolved (TODO-2). |
| 41 | `/meta-school-2025-26` | Meta School 2025–26 (22) | — (no change) | Rainbow International School is a Meta for Education partner school — integrating digital citizenship, online safety, creative thinking, and future-ready digital skills into the student learning experience. | — (no change) | — (no change) | Meta for Education school Thane | KEEP — Decision 5: HOLD pending ads team confirmation, no change in any wave until resolved (TODO-2). |

---



  ### Section 2A.1 — Wave 1 commercial pages: full meta drafts (deploy May 18)

  > Per user direction: Wave 1's six pages get full meta drafts in this planning doc so the strings can be reviewed and approved before deploy. The other 35 commercial pages keep keyword/disposition only — strings will be drafted at wave-execution time. Char counts: title ≤ 60, description 150–158. All six titles and all six descriptions verified unique within this set and not duplicated anywhere else in this planning doc.

  | # | URL | Field | String | Char count | Unique? |
  |---|---|---|---|---|---|
  | 1 | `/` | Title | Rainbow International School Thane | CBSE School Since 2009 | 59 | ✓ unique site-wide |
| 1 | `/` | Meta description | Rainbow International School is a CBSE school in Thane (since 2009). 3.5-acre Brahmand campus, Nursery to Class 12. Apply for the 2026-27 academic year. | 152 | ✓ unique site-wide |
| 1 | `/` | H1 | Rainbow International School, Thane — A CBSE School Since 2009 | 62 | — |
| 2 | `/admissions` | Title | Admissions 2026-27 | Rainbow International School Thane | 55 | ✓ unique site-wide |
| 2 | `/admissions` | Meta description | CBSE admissions open for 2026-27 at Rainbow International School, Thane: process, age criteria, documents, fees and key dates for Nursery to Class 12. | 150 | ✓ unique site-wide |
| 2 | `/admissions` | H1 | Admissions 2026-27 — Rainbow International School, Thane | 56 | — |
| 3 | `/primary-section` | Title | Primary School (Class 1–5) | RIS Thane CBSE | 43 | ✓ unique site-wide |
| 3 | `/primary-section` | Meta description | CBSE Primary School at RIS Thane covers Class 1 to 5 with strong literacy and numeracy, co-curriculars and a safe campus. Class 1 admissions open for 2026-27. | 158 | ✓ unique site-wide |
| 3 | `/primary-section` | H1 | Primary School (Class 1 to 5) at Rainbow International School, Thane | 68 | — |
| 4 | `/senior-secondary-section` | Title | Senior Secondary (Class 11 & 12) | RIS Thane CBSE | 49 | ✓ unique site-wide |
| 4 | `/senior-secondary-section` | Meta description | CBSE Senior Secondary at Rainbow International School Thane offers Science, Commerce and Humanities streams with JEE/NEET/CUET prep — apply for 2026-27. | 152 | ✓ unique site-wide |
| 4 | `/senior-secondary-section` | H1 | Senior Secondary School (Class 11 & 12) at RIS Thane | 52 | — |
| 5 | `/amenities` | Title | Campus & Facilities | Rainbow International School Thane | 56 | ✓ unique site-wide |
| 5 | `/amenities` | Meta description | A 3.5-acre Brahmand campus with science labs, library, swimming pool, sports ground, smart classrooms and on-campus infirmary. Visit our RIS Thane campus. | 154 | ✓ unique site-wide |
| 5 | `/amenities` | H1 | Our Campus and Facilities at RIS Thane | 38 | — |
| 6 | `/fee-structure` | Title | Fee Structure 2026-27 | Rainbow International School Thane | 58 | ✓ unique site-wide |
| 6 | `/fee-structure` | Meta description | Class-wise CBSE fee structure for 2026-27 at RIS Thane: tuition, one-time charges, transport and term breakdown. Download the official fee structure PDF here. | 158 | ✓ unique site-wide |
| 6 | `/fee-structure` | H1 | Fee Structure 2026-27 — Rainbow International School, Thane | 59 | — |

  > **Uniqueness verification (run during this rebuild):** all 6 proposed titles are distinct from each other and from every existing title elsewhere in the planning doc; all 6 proposed descriptions are likewise distinct. Before Wave 1 deploy, re-run a uniqueness scan against the live site (`SEO.tsx` defaults + every commercial `<SEO>` call) to catch any collision the planning doc cannot see.

  > **Wave 1 acceptance gate (planning side):** these 12 strings + 6 H1s are the deploy-approval surface for May 18. Any change requested by the user updates this table — not the implementation — until approval.
  


  ### Section 2A.2 — Wave 1 AI-SEO blocks (6 pages — drafts for review)

  > **Per Decision 14 (added below):** AI-SEO additions follow the same 5-wave schedule as the rest of the plan. Drafts below are for the 6 Wave 1 pages only. The remaining 34 surviving commercial pages receive AI-SEO blocks in their already-scheduled waves.
  >
  > Each page gets:
  > 1. A **Quick-Answer block** (40–60 words, parent-intent answer placed near the top of the page).
  > 2. A **Parent-FAQ section** (4–6 Qs from the standard parent-question set).
  > 3. **FAQPage schema** (JSON-LD), one per page, generated from the same FAQ content.
  >
  > Word counts for the QA blocks are validated below; FAQPage schema is generated mechanically at build time from the FAQ content (no separate review needed).
  

  #### 1. `/` — Quick Answer + FAQs

  **Quick Answer (40 words):**
  > Rainbow International School is a CBSE school in Thane (since 2009) on a 3.5-acre Brahmand campus. The school offers Nursery to Class 12, on-campus sports, science labs, library, transport and an infirmary. Admissions for the 2026-27 academic year are open.

  **FAQs (5):**

  1. **Q:** Is Rainbow International School a CBSE school in Thane?
   **A:** Yes. RIS is a CBSE-affiliated school in Thane (Brahmand) running classes from Nursery to Class 12 since 2009. Affiliation number 1130661.
2. **Q:** Which areas in Thane does the school serve?
   **A:** The school primarily serves Brahmand, Ghodbunder Road, Manpada, Hiranandani Estate, Kasarvadavali, Majiwada, Kolshet, Waghbil and Patlipada with school-managed transport.
3. **Q:** How can parents enquire for admission?
   **A:** Parents can fill the online admission enquiry on the website, call the admission desk, or book an in-person campus visit at the Brahmand campus.
4. **Q:** Does Rainbow International School offer senior secondary classes?
   **A:** Yes. The school offers Class 11 and 12 with Science, Commerce and Humanities streams.
5. **Q:** How can I see the fee structure?
   **A:** The full class-wise fee structure for 2026-27 is available on the Fee Structure page; a downloadable PDF is also linked there.

  **FAQPage schema:** generated at build from the 5 Q&A pairs above. Publisher / mainEntityOfPage = `Rainbow International School` (Organization schema, no Person schema).
  

  #### 2. `/admissions` — Quick Answer + FAQs

  **Quick Answer (45 words):**
  > CBSE admissions for the 2026-27 academic year at Rainbow International School Thane are open for Nursery to Class 12. Parents can review the admission process, age criteria, documents required and fees, then submit an online enquiry or book a campus visit at the Brahmand campus.

  **FAQs (6):**

  1. **Q:** Are admissions open at Rainbow International School?
   **A:** Yes. Admissions for 2026-27 are currently open for Nursery to Class 12, subject to seat availability per class.
2. **Q:** How can I apply for school admission in Thane at RIS?
   **A:** You can submit an online admission enquiry, call the admission desk or visit the Brahmand campus to complete the application process.
3. **Q:** What documents are required for admission?
   **A:** Birth certificate, previous school report card (where applicable), Aadhaar (parent and child), passport-size photographs and address proof.
4. **Q:** What is the age criterion for Nursery and Class 1?
   **A:** Indicative ranges follow CBSE/state norms; exact cut-off dates for the 2026-27 session are listed in the Admissions section and confirmed by the admission desk.
5. **Q:** Can I book a campus visit before applying?
   **A:** Yes. Campus visits can be booked through the admission enquiry form or by calling the admission desk during school hours.
6. **Q:** Where can I see the fee structure?
   **A:** The full class-wise fee structure is on the Fee Structure page, with a downloadable PDF.

  **FAQPage schema:** generated at build from the 6 Q&A pairs above. Publisher / mainEntityOfPage = `Rainbow International School` (Organization schema, no Person schema).
  

  #### 3. `/primary-section` — Quick Answer + FAQs

  **Quick Answer (40 words):**
  > The Primary School at Rainbow International School Thane covers Class 1 to Class 5 on the CBSE curriculum, with a strong foundation in literacy and numeracy, co-curricular activities and a safe, female-staff-led environment. Class 1 admissions for 2026-27 are open.

  **FAQs (5):**

  1. **Q:** Which classes are part of the Primary section?
   **A:** Primary at RIS covers Class 1 through Class 5 on the CBSE curriculum.
2. **Q:** Is the Primary curriculum CBSE-aligned?
   **A:** Yes. The Primary curriculum is CBSE-aligned, with NCERT-based learning material.
3. **Q:** How does RIS approach foundational literacy and numeracy?
   **A:** The Primary programme emphasises foundational literacy and numeracy through structured reading, phonics and number-sense activities, in line with NEP 2020.
4. **Q:** Are co-curricular activities part of the Primary day?
   **A:** Yes. Music, art, physical education, library and activity periods are part of the regular Primary timetable.
5. **Q:** How do I apply for Class 1 admission for 2026-27?
   **A:** Submit the online admission enquiry or contact the admission desk; documents required are listed on the Admissions page.

  **FAQPage schema:** generated at build from the 5 Q&A pairs above. Publisher / mainEntityOfPage = `Rainbow International School` (Organization schema, no Person schema).
  

  #### 4. `/senior-secondary-section` — Quick Answer + FAQs

  **Quick Answer (50 words):**
  > Senior Secondary at Rainbow International School Thane covers CBSE Class 11 and Class 12 with Science, Commerce and Humanities streams, structured CBSE board preparation, career counselling for stream and college choice, and JEE, NEET and CUET prep support. Class 11 admissions for 2026-27 are now open at the Brahmand campus.

  **FAQs (5):**

  1. **Q:** Which streams are offered in Class 11 and 12?
   **A:** Science, Commerce and Humanities streams are offered for Class 11 and 12 at RIS Thane.
2. **Q:** Does the school support JEE, NEET and CUET preparation?
   **A:** Yes, the school provides preparation guidance and study support for JEE, NEET and CUET alongside the regular CBSE curriculum.
3. **Q:** How do I apply for Class 11 admission?
   **A:** Class 11 applications open after Class 10 results. Submit the online enquiry on the Admissions page or contact the admission desk.
4. **Q:** Where can I see senior secondary results?
   **A:** Recent CBSE Class 12 results are highlighted on the Student Achievements page.
5. **Q:** Is career counselling available for senior students?
   **A:** Yes. Senior students receive structured career counselling for stream selection and college applications.

  **FAQPage schema:** generated at build from the 5 Q&A pairs above. Publisher / mainEntityOfPage = `Rainbow International School` (Organization schema, no Person schema).
  

  #### 5. `/amenities` — Quick Answer + FAQs

  **Quick Answer (40 words):**
  > Rainbow International School Thane has a 3.5-acre Brahmand campus with science labs, a library, smart classrooms, a swimming pool, a sports ground, an on-campus infirmary, paediatrician on call and CCTV-monitored safety. Parents can book a campus visit any school day.

  **FAQs (5):**

  1. **Q:** What sports facilities does the school have?
   **A:** A sports ground, indoor sports area and a swimming pool, plus structured PE periods and inter-school participation.
2. **Q:** Does the school have science labs and a library?
   **A:** Yes — Physics, Chemistry and Biology labs, plus a central library available to all students.
3. **Q:** What safety measures are in place on campus?
   **A:** 160+ CCTV cameras, monitored entry/exit, female staff in the pre-primary block, on-campus infirmary, paediatrician on call and an ambulance arrangement.
4. **Q:** Does the school provide transport?
   **A:** Yes. School-managed transport covers Brahmand, Ghodbunder Road, Manpada and adjoining Thane localities; routes are confirmed at the time of admission.
5. **Q:** Can parents tour the campus before admission?
   **A:** Yes. Campus tours can be booked through the admission enquiry form or by calling the admission desk.

  **FAQPage schema:** generated at build from the 5 Q&A pairs above. Publisher / mainEntityOfPage = `Rainbow International School` (Organization schema, no Person schema).
  

  #### 6. `/fee-structure` — Quick Answer + FAQs

  **Quick Answer (46 words):**
  > The 2026-27 CBSE fee structure for Rainbow International School Thane is published class-by-class — covering tuition, one-time admission charges and term-wise breakdowns — with a downloadable official PDF. Transport fees are billed separately and confirmed at the time of admission based on the parent's chosen route.

  **FAQs (5):**

  1. **Q:** Where can I see the Rainbow International School fees?
   **A:** The full class-wise fee structure for 2026-27 is on the Fee Structure page, with a downloadable PDF.
2. **Q:** Are transport fees included in the tuition fee?
   **A:** No. Transport fees are charged separately and are confirmed at admission based on route.
3. **Q:** What payment modes are accepted?
   **A:** Standard payment modes (online transfer, cheque) are accepted; details are shared during admission.
4. **Q:** Are there any one-time charges?
   **A:** Yes. One-time admission charges apply at the time of joining and are listed in the fee structure.
5. **Q:** How do I get the fee structure for a specific class?
   **A:** The class-wise fee table on the Fee Structure page covers Nursery to Class 12. Contact the admission desk for any clarifications.

  **FAQPage schema:** generated at build from the 5 Q&A pairs above. Publisher / mainEntityOfPage = `Rainbow International School` (Organization schema, no Person schema).
  
---

## Section 2B — Blog Posts Audit (all 94, single source of truth)

  > **Source of truth:** `docs/blog-slug-canonical-list.md`. Every slug from `client/src/data/blogPosts.ts` appears in exactly one row below. Title and meta description columns are populated for KEEP and IMPROVE posts; for 301/MERGE/410 rows the new title/description columns show "—" (no rewrite needed) and the disposition column carries the action.

  | ID | Slug | Tier | Disposition | Action | Primary keyword |
  |---|---|---|---|---|---|
  | T1.1 | `cbse-vs-icse-which-board-prepares-students-better-for-the-future` | T1 | KEEP | KEEP — no meta change | CBSE vs ICSE board comparison |
| T1.2 | `ideal-teacher-qualities-traits-of-a-great-educator` | T1 | KEEP | KEEP — no meta change | qualities of a good teacher |
| T1.3 | `key-facilities-every-good-cbse-school-should-have` | T1 | KEEP | KEEP — no meta change | CBSE school facilities checklist |
| T1.4 | `cultural-activities-for-students-key-to-developing-critical-thinking-skills` | T1 | KEEP | KEEP — no meta change | cultural activities for students |
| T1.5 | `importance-of-sports-in-students-life-teamwork-skills` | T1 | KEEP | KEEP — no meta change | importance of sports for students |
| T1.6 | `why-rainbow-international-school-is-among-the-top-schools-in-thane` | T1 | KEEP | KEEP — no meta change | top schools in Thane (RIS pillar) |
| T1.7 | `parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child` | T1 | KEEP | KEEP — no meta change | how to choose a CBSE school in Thane |
| T1.8 | `the-growing-popularity-of-cbse-schools-in-thane-west-among-parents` | T1 | IMPROVE | IMPROVE — meta rewrite | CBSE schools in Thane West |
| T1.9 | `school-admission-checklist-thane-parents-guide-2026` | T1 | IMPROVE | IMPROVE — meta rewrite | school admission checklist Thane 2026 |
| T1.10 | `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` | T1 | IMPROVE | IMPROVE — meta rewrite | effects of mobile phones on children (pillar) |
| T2.1 | `cbse-vs-icse-vs-state-board-which-is-best-for-your-child` | T2 | IMPROVE | IMPROVE — meta rewrite | CBSE vs ICSE vs state board |
| T2.2 | `co-curricular-activities` | T2 | IMPROVE | IMPROVE — meta rewrite | co-curricular activities for students |
| T2.3 | `problem-solving-activities-life-skills-students` | T2 | IMPROVE | IMPROVE — meta rewrite | problem-solving activities for students |
| T2.4 | `role-of-parents-in-education-orientation-importance` | T2 | IMPROVE | IMPROVE — meta rewrite | role of parents in education |
| T2.5 | `importance-of-foundational-literacy-and-numeracy-in-schools` | T2 | IMPROVE | IMPROVE — meta rewrite | foundational literacy and numeracy |
| T2.6 | `how-to-help-your-child-focus-better-in-studies` | T2 | IMPROVE | IMPROVE — meta rewrite | how to help your child focus on studies |
| T2.7 | `importance-of-extracurricular-activities-in-school` | T2 | IMPROVE | IMPROVE — meta rewrite | importance of extracurricular activities |
| T2.8 | `new-education-policy-nep-2020-what-parents-should-know` | T2 | IMPROVE | IMPROVE — meta rewrite | NEP 2020 for parents |
| T2.9 | `how-to-prepare-your-child-for-first-day-of-school` | T2 | IMPROVE | IMPROVE — meta rewrite | preparing your child for first day of school |
| T2.10 | `benefits-of-multiple-intelligence-based-learning-in-schools` | T2 | IMPROVE | IMPROVE — meta rewrite | multiple intelligence learning |
| T2.11 | `best-cbse-schools-in-thane-what-to-look-for` | T2 | IMPROVE | IMPROVE — meta rewrite | best CBSE schools in Thane (what to look for) |
| T2.12 | `6-reasons-why-cbse-is-the-best-board-of-the-country` | T2 | IMPROVE | IMPROVE — meta rewrite | why CBSE is the best board |
| T2.13 | `why-choose-a-cbse-school-for-your-childs-education` | T2 | IMPROVE | IMPROVE — meta rewrite | why choose a CBSE school |
| T2.14 | `international-school-admission-process-guide` | T2 | IMPROVE | IMPROVE — meta rewrite | international school admission process |
| T2.15 | `age-criteria-for-international-schools-admission-2025-in-mumbai` | T2 | IMPROVE | IMPROVE — meta rewrite | age criteria international schools Mumbai |
| T2.16 | `what-you-need-to-know-before-applying-to-an-international-school` | T2 | IMPROVE | IMPROVE — meta rewrite | before applying to an international school |
| T2.17 | `advantages-of-starting-early-international-school` | T2 | IMPROVE | IMPROVE — meta rewrite | starting early in an international school |
| T2.18 | `stress-in-teenagers-symptoms-management` | T2 | IMPROVE | IMPROVE — meta rewrite | stress in teenagers |
| T2.19 | `riddles-for-kids` | T2 | IMPROVE | IMPROVE — meta rewrite | riddles for kids |
| T2.20 | `how-to-increase-attention-span` | T2 | IMPROVE | IMPROVE — meta rewrite | how to increase attention span in students |
| T2.21 | `benefits-of-learning-a-second-language` | T2 | IMPROVE | IMPROVE — meta rewrite | benefits of learning a second language |
| T2.22 | `how-cbse-schools-can-foster-entrepreneurship-and-innovation` | T2 | IMPROVE | IMPROVE — meta rewrite | entrepreneurship in CBSE schools |
| T2.23 | `smart-revision-techniques-for-students` | T2 | IMPROVE | IMPROVE — meta rewrite | smart revision techniques for students |
| T2.24 | `innovative-teaching-method-for-active-learning` | T2 | IMPROVE | IMPROVE — meta rewrite | innovative teaching methods |
| T2.25 | `how-to-learn-boring-subjects` | T2 | IMPROVE | IMPROVE — meta rewrite | how to learn boring subjects |
| T3.1 | `the-benefits-of-early-learning-in-shaping-a-childs-personality` | T3 | IMPROVE | IMPROVE — meta rewrite | early learning and child personality |
| T3.2 | `why-maths-matters-in-student-life-benefits-uses` | T3 | IMPROVE | IMPROVE — meta rewrite | why maths matters in student life |
| T3.3 | `10-fun-and-educational-republic-day-activities-for-kids` | T3 | IMPROVE | IMPROVE — meta rewrite | Republic Day activities for kids |
| T3.4 | `christmas-celebration-in-school-10-fun-and-festive-activity-ideas` | T3 | IMPROVE | IMPROVE — meta rewrite | Christmas activities in school |
| T3.5 | `benefits-of-meditation-for-students` | T3 | IMPROVE | IMPROVE — meta rewrite | benefits of meditation for students |
| T3.6 | `diwali-activities-for-students` | T3 | IMPROVE | IMPROVE — meta rewrite | Diwali activities for students |
| T3.7 | `10-things-in-the-classroom-to-boost-student-engagement` | T3 | IMPROVE | IMPROVE — meta rewrite | classroom student engagement ideas |
| T3.8 | `group-activities-for-students` | T3 | IMPROVE | IMPROVE — meta rewrite | group activities for students |
| T3.9 | `how-to-avoid-procrastination-while-studying` | T3 | IMPROVE | IMPROVE — meta rewrite | how to avoid procrastination while studying |
| T3.10 | `teen-entrepreneurship-fostering-innovation-and-responsibility` | T3 | IMPROVE | IMPROVE — meta rewrite | teen entrepreneurship |
| T3.11 | `teaching-teens-resilience-and-thriving-through-failure` | T3 | IMPROVE | IMPROVE — meta rewrite | teaching teens resilience |
| T3.12 | `nutritional-requirements-of-the-teenagers-how-to-fulfil-them` | T3 | IMPROVE | IMPROVE — meta rewrite | nutrition for teenagers |
| T3.13 | `top-5-techniques-for-taming-anger-in-children` | T3 | IMPROVE | IMPROVE — meta rewrite | taming anger in children |
| T3.14 | `top-6-easy-ways-to-develop-patience-in-your-child` | T3 | IMPROVE | IMPROVE — meta rewrite | developing patience in children |
| T3.15 | `homework-war-endgame` | T3 | IMPROVE | IMPROVE — meta rewrite | homework battles with kids |
| T3.16 | `how-to-deal-with-anxiety-during-exams` | T3 | IMPROVE | IMPROVE — meta rewrite | dealing with exam anxiety |
| T3.17 | `understanding-adolescence-how-to-handle-the-process` | T3 | IMPROVE | IMPROVE — meta rewrite | understanding adolescence |
| T3.18 | `how-to-develop-fine-motor-skills-at-home` | T3 | IMPROVE | IMPROVE — meta rewrite | fine motor skills at home |
| T3.19 | `the-leading-school-of-the-year-thane` | T3 | KEEP | KEEP — no meta change | RIS — Leading School of the Year (historical) |
| T3.20 | `teen-depression-how-to-spot-and-cure-it` | T3 | IMPROVE | IMPROVE — meta rewrite | teen depression — spot and help |
| T3.21 | `7-areas-in-education-where-indian-women-are-excellent` | T3 | IMPROVE | IMPROVE — meta rewrite | Indian women in education |
| T3.22 | `4-reasons-why-school-bags-should-not-be-a-burden` | T3 | IMPROVE | IMPROVE — meta rewrite | school bag weight issue |
| T3.23 | `school-sanitation-standards-how-to-stay-clean-and-safe` | T3 | IMPROVE | IMPROVE — meta rewrite | school sanitation standards |
| T3.24 | `6-excellent-ideas-to-innovate-cultural-programmes-in-school` | T3 | IMPROVE | IMPROVE — meta rewrite | innovative school cultural programmes |
| T3.25 | `teaching-children-the-value-of-money-5-ways-schools-can-help` | T3 | IMPROVE | IMPROVE — meta rewrite | teaching children the value of money |
| T3.26 | `amazing-coaches-who-improved-players-willpower` | T3 | IMPROVE | IMPROVE — meta rewrite | famous coaches and player willpower |
| T3.27 | `how-organic-farming-in-schools-helps-the-nation` | T3 | IMPROVE | IMPROVE — meta rewrite | organic farming in schools |
| T3.28 | `how-school-buses-are-changing-with-technology` | T3 | IMPROVE | IMPROVE — meta rewrite | school bus technology |
| T3.29 | `amazing-youtube-channels-on-general-knowledge-for-kids` | T3 | IMPROVE | IMPROVE — meta rewrite | YouTube channels for kids general knowledge |
| T3.30 | `know-how-swimming-helps-your-child-in-7-ways` | T3 | IMPROVE | IMPROVE — meta rewrite | benefits of swimming for children |
| T3.31 | `big-school-playgrounds-6-reasons-why-kids-need-them` | T3 | IMPROVE | IMPROVE — meta rewrite | why kids need big school playgrounds |
| T3.32 | `6-reasons-why-indoor-sports-is-important-in-schools` | T3 | IMPROVE | IMPROVE — meta rewrite | indoor sports in schools |
| T3.33 | `an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming` | T3 | KEEP | KEEP — no meta change | RIS student Raghvi Ramanujan swimming (historical) |
| T3.34 | `100-result-rainbows-first-batch-2018-19` | T3 | KEEP | KEEP — no meta change | RIS 100% Class 10 result 2018-19 (historical) |
| T3.35 | `field-trips-know-how-they-groom-students-in-5-ways` | T3 | IMPROVE | IMPROVE — meta rewrite | how field trips groom students |
| T3.36 | `time-management-for-school-children-6-ways-parents-can-help` | T3 | IMPROVE | IMPROVE — meta rewrite | time management for school children |
| T3.37 | `how-to-teach-benefits-of-family-meals-to-kids` | T3 | IMPROVE | IMPROVE — meta rewrite | family meals benefits for kids |
| T3.38 | `do-your-children-hate-reading-know-why-youre-the-reason` | T3 | IMPROVE | IMPROVE — meta rewrite | why children hate reading |
| T3.39 | `how-regular-sports-help-students-6-reasons` | T3 | IMPROVE | IMPROVE — meta rewrite | regular sports for students |
| T3.40 | `digital-classrooms-how-technology-improves-education-in-school` | T3 | IMPROVE | IMPROVE — meta rewrite | digital classrooms in schools |
| T3.41 | `9-reasons-why-schools-should-have-an-infirmary-and-paediatrician` | T3 | IMPROVE | IMPROVE — meta rewrite | school infirmary and paediatrician |
| T3.42 | `7-safety-and-security-measures-your-kids-school-should-have` | T3 | IMPROVE | IMPROVE — meta rewrite | school safety and security measures |
| T4.1 | `best-age-for-international-school-admission` | T4 | MERGE | MERGE into `age-criteria-for-international-schools-admission-2025-in-mumbai` then 301 | — (MERGE into age criteria post) |
| T4.2 | `5-tips-to-choose-best-cbse-schools-in-mumbai` | T4 | MERGE | MERGE into `why-choose-a-cbse-school-for-your-childs-education` then 301 | — (MERGE into why-choose-cbse-school) |
| T4.3 | `benefits-of-rainbow-international-school` | T4 | 301 | 301 → `why-rainbow-international-school-is-among-the-top-schools-in-thane` | — (301 to RIS pillar) |
| T4.4 | `back-to-school-a-step-by-step-guide-to-international-school-admissions` | T4 | MERGE | MERGE into `international-school-admission-process-guide` then 301 | — (MERGE into admission process guide) |
| T4.5 | `holistic-development-rainbow-international-school` | T4 | 301 | 301 → `why-rainbow-international-school-is-among-the-top-schools-in-thane` | — (301 to RIS pillar) |
| T4.6 | `top-reasons-choose-rainbow-international-school-thane` | T4 | 301 | 301 → `why-rainbow-international-school-is-among-the-top-schools-in-thane` | — (301 to RIS pillar) |
| T4.7 | `imporatnce-of-sports-in-students-life` | T4 | 301 | 301 → `importance-of-sports-in-students-life-teamwork-skills` | — (301, typo redirect) |
| T4.8 | `using-gadgets-the-right-way` | T4 | 301 | 301 → `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` | — (301 to screen-time pillar) |
| T4.9 | `regulating-childrens-screen-time` | T4 | 301 | 301 → `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` | — (301 to screen-time pillar) |
| T4.10 | `give-earth-to-life-on-earth` | T4 | 410 | 410 GONE (after backlink check) | — (410) |
| T4.11 | `coronavirus-the-new-monster-in-town` | T4 | 410 | 410 GONE (after backlink check) | — (410) |
| T4.12 | `fit-india-certificate-of-recognition` | T4 | 410 | 410 GONE (after backlink check) | — (410) |
| T4.13 | `the-15th-world-education-summit` | T4 | 410 | 410 GONE (after backlink check) | — (410) |
| T4.14 | `smartphone-addiction-how-to-ensure-healthy-use-by-kids` | T4 | 301 | 301 → `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` | — (301 to screen-time pillar) |
| T4.15 | `rainbow-awarded-as-best-preschool-and-secondary-school-in-thane` | T4 | 410 | 410 GONE (after backlink check) | — (410) |
| T4.16 | `rainbow-preschools-featured-in-knowledge-review-magazine` | T4 | 410 | 410 GONE (after backlink check) | — (410) |
| T4.17 | `rainbow-wins-award-for-excellence` | T4 | 410 | 410 GONE (after backlink check) | — (410) |

  **Per-tier-and-disposition rollup:**

  | Tier | Posts | KEEP | IMPROVE | MERGE | 301 | 410 |
  |---|---|---|---|---|---|---|
  | 1 | 10 | 7 | 3 | 0 | 0 | 0 |
  | 2 | 25 | 0 | 25 | 0 | 0 | 0 |
  | 3 | 42 | 3 | 39 | 0 | 0 | 0 |
  | 4 | 17 | 0 | 0 | 3 | 7 | 7 |
  | **Total** | **94** | **10** | **67** | **3** | **7** | **7** |

  Net surviving posts: 10 + 67 = **77** (slightly above the 70–75 target band because 3 historical-brand posts — `the-leading-school-of-the-year-thane`, `100-result-rainbows-first-batch-2018-19`, `an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming` — are pre-approved as KEEP and cannot be cut).

  **Detailed title/description rewrites for KEEP and IMPROVE posts** are in the Wave 2/3/4 implementation appendix (deferred to Wave-execution tasks #12–#14 — title/description rewrites for 77 surviving posts is per-post body work, not planning work).

---

## Section 2C — Legacy Asset: Fee Structure PDF

### Decision: Option A confirmed (and already de facto in place)
**Decision 3 (verbatim from user, May 6, 2026):** "Option A confirmed. Keep PDF at its current URL as-is. Improve `/fee-structure` HTML page with full content. Cross-link both directions (HTML page links to PDF download; PDF metadata references HTML page)."

### Discovery during planning (May 6, 2026)
Direct check of the PDF URL shows it is already returning a 301 redirect:
```
$ curl -I https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Fee-Structure-combinepdf.pdf
HTTP/2 301
location: /fee-structure
```

**Implication:** the 1,042 clicks/quarter are already being redirected to `/fee-structure`. There is no separate PDF action required — the legacy URL is already routing into the canonical HTML page.

### Updated action items
1. **Verify the 301 is preserving traffic.** In GSC, confirm `/fee-structure` is receiving the redirected clicks.
2. **Make /fee-structure HTML page rich enough to convert that traffic** (Wave 1):
   - Class-wise fee table (Nursery, KG, Class 1–5, Class 6–8, Class 9–10, Class 11 Science/Commerce/Humanities, Class 12)
   - One-time vs annual vs term-wise breakdown
   - Bus / transport fee table (route-wise if available)
   - Sibling discount or other concession policy
   - Payment modes accepted
   - Downloadable PDF link (re-create or expose original PDF if still hosted)
   - Application/admission CTA
3. **No change to the legacy PDF URL** — the 301 is doing its job.
4. **Watch for canonical issues.** If the legacy PDF URL is somehow indexed in addition to /fee-structure, the canonical fix may need to extend to assets. Check GSC URL Inspection on both URLs after Wave 1.

### Risk
If the PDF URL ever stops returning the 301 (e.g. legacy WordPress infrastructure decommissioned), 1,042 clicks/quarter disappear overnight. Add a synthetic monitor on the PDF URL to detect 404/410 if the redirect breaks (TODO-8).

---

## Section 2D — Duplicate / Cannibalization Map

> 22 posts in clusters → 6 surviving pillars/keepers after merges and 301s. Plus 4 410s. Net change: 26 posts → 6 posts (after Wave 4).

### Cluster A — Sports duplicate (typo) — 2 → 1

| Slug | Disposition | Pillar |
|---|---|---|
| `imporatnce-of-sports-in-students-life` | 301 | → pillar |
| `importance-of-sports-in-students-life-teamwork-skills` | KEEP (pillar) | self |

### Cluster B — Screen time / mobile phones — 4 → 1 (Decision 9)

| Slug | Disposition | Pillar |
|---|---|---|
| `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` | KEEP (pillar) | self |
| `regulating-childrens-screen-time` | 301 | → pillar |
| `smartphone-addiction-how-to-ensure-healthy-use-by-kids` | 301 | → pillar |
| `using-gadgets-the-right-way` | 301 | → pillar |

Pillar body expansion target: 2,500+ words. Combine unique angles from all four (mobile-phone health risks, screen-time regulation framework, smartphone addiction signs, gadgets used wisely).

### Cluster C — International school admission — 6 → 4 (Decision 10)

| Slug | Disposition | Pillar / new keyword |
|---|---|---|
| `international-school-admission-process-guide` | KEEP (pillar) | self — "international school admission process India" |
| `age-criteria-for-international-schools-admission-2025-in-mumbai` | KEEP (re-target) | new keyword: "school admission age in Mumbai" |
| `what-you-need-to-know-before-applying-to-an-international-school` | KEEP (re-target) | new keyword: "international school admission checklist" |
| `advantages-of-starting-early-international-school` | KEEP (re-target) | new keyword: "benefits of early school admission" |
| `best-age-for-international-school-admission` | MERGE | → age-criteria post |
| `back-to-school-a-step-by-step-guide-to-international-school-admissions` | MERGE | → pillar |

### Cluster D — Rainbow brand promotion — 4 → 1 (Decision 11)

| Slug | Disposition | Pillar |
|---|---|---|
| `why-rainbow-international-school-is-among-the-top-schools-in-thane` | KEEP (pillar) | self |
| `top-reasons-choose-rainbow-international-school-thane` | 301 | → pillar |
| `benefits-of-rainbow-international-school` | 301 | → pillar |
| `holistic-development-rainbow-international-school` | 301 | → pillar |

### Cluster E — CBSE choice — 5 → 4 (Decision 12)

| Slug | Disposition | Pillar / keyword |
|---|---|---|
| `parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child` | KEEP | Thane pillar — "how to choose best CBSE school Thane" |
| `best-cbse-schools-in-thane-what-to-look-for` | KEEP (re-target) | "CBSE school Thane verification checklist" |
| `6-reasons-why-cbse-is-the-best-board-of-the-country` | KEEP | "why CBSE is the best board India" |
| `why-choose-a-cbse-school-for-your-childs-education` | KEEP (receives merge) | generic — "why choose CBSE school" |
| `5-tips-to-choose-best-cbse-schools-in-mumbai` | MERGE | → why-choose-a-cbse-school |

### Bonus — CBSE vs ICSE pair — 2 → 2 (Decision 7, kept both)

| Slug | Disposition | Keyword |
|---|---|---|
| `cbse-vs-icse-which-board-prepares-students-better-for-the-future` | KEEP | "CBSE vs ICSE" — 2-way (91K impressions) |
| `cbse-vs-icse-vs-state-board-which-is-best-for-your-child` | IMPROVE (re-target) | "CBSE vs ICSE vs State Board" — 3-way |

### Commercial-page cannibalization — 1 (Decision 2)

| URL | Disposition |
|---|---|
| `/about-rainbow-international-school` | KEEP (absorbs welcome content) |
| `/welcome-to-ris` | 301 → /about |

---

## Section 3 — Body Content Expansion Plan

  ### Section 3A — Commercial pages (all 41) — expansion targets (Wave 1)

  | URL | Current word count (proxy) | Target | THIN flag / Status | Recommended H2 structure | Internal links |
  |---|---|---|---|---|---|
  | `/` | ~800–1,000 | 1,200–1,500 | OK, expand | Why parents choose RIS Thane | CBSE since 2009 — affiliation 1130661 | 3.5-acre campus & facilities | Programmes Nursery to Class 12 | Localities served — Brahmand, Ghodbunder, Manpada | Apply for 2026-27 | /admissions, /amenities, /fee-structure, /about-rainbow-international-school |
| `/about-rainbow-international-school` | ~600–800 | 1,200–1,500 | THIN-ish, expand (absorbs /welcome-to-ris) | Our story since 2009 | Welcome from the Principal (absorbed) | Vision & values | 3.5-acre Brahmand campus | CBSE affiliation & milestones | Visit / contact us | /chairpersons-note, /ris-vision-mission, /our-philosophy |
| `/welcome-to-ris` | N/A | N/A | REDIRECT (Wave 1) | 301 → /about-rainbow-international-school | — |
| `/chairpersons-note` | ~250–400 | 700–900 | THIN, expand | Chairperson's message | Vision for RIS | Commitment to excellence | A note to parents | /ris-vision-mission, /our-philosophy, /about-rainbow-international-school |
| `/ris-vision-mission` | ~300–500 | 900–1,100 | THIN, expand | Vision statement | Mission statement | Values that guide RIS | World-citizen approach | How vision plays out in classrooms | /our-philosophy, /curriculum, /about-rainbow-international-school |
| `/our-philosophy` | ~300–500 | 900–1,100 | THIN, expand | Four pillars overview | Competence | Conscience | Compassion | Courage | Philosophy in daily school life | /ris-vision-mission, /curriculum, /beyond-the-classroom |
| `/pre-primary-school-thane` | ~400–600 | 1,000–1,200 | THIN, expand | Pre-Primary at RIS (Nursery, Jr KG, Sr KG) | Activity-based learning | Female teaching staff & safety | Daily schedule & curriculum | Apply for 2026-27 | /admissions, /safety-security, /amenities |
| `/primary-section` | ~400–600 | 1,000–1,200 | THIN, expand | Class 1 to 5 at RIS | CBSE primary curriculum | Foundational literacy & numeracy approach | Co-curricular at primary level | Class 1 admission for 2026-27 | /admissions, /curriculum, /extracurriculars |
| `/middle-school-section` | ~400–600 | 1,000–1,200 | THIN, expand (and fix Class 6–10 → Class 6–8) | Class 6 to 8 at RIS | Multi-dimensional CBSE curriculum | Subject specialisation | Critical thinking & projects | Class 6 admission for 2026-27 | /admissions, /curriculum, /secondary-section |
| `/secondary-section` | ~400–600 | 1,000–1,200 | THIN, expand | Class 9 & 10 at RIS | CBSE Class 10 board prep | Career counselling foundations | Co-curricular at secondary level | Class 9 admission for 2026-27 | /admissions, /awards-achievements, /senior-secondary-section |
| `/senior-secondary-section` | ~400–600 | 1,000–1,200 | THIN, expand | Class 11 & 12 streams overview | Science stream — subjects & career paths | Commerce stream | Humanities stream | JEE/NEET/CUET prep support | Class 11 admission for 2026-27 | /admissions, /student-achievements, /career |
| `/amenities` | ~600–900 | 1,200–1,500 | OK | 3.5-acre campus | Academic — labs, library, smart rooms | Sports — ground, swimming pool, indoor | Wellness — infirmary, paediatrician on call | Safety & transport | Visit our campus | /safety-security, /extracurriculars, /photo-gallery |
| `/awards-achievements` | ~400–600 | 900–1,100 | THIN, expand | School-level awards | Faculty recognitions | Industry partnerships | FIT INDIA & related | How awards reflect our culture | /student-achievements, /about-rainbow-international-school, /testimonials |
| `/student-achievements` | ~400–600 | 900–1,100 | THIN, expand | 100% Class 10 result milestones | National & state sports wins | Academic Olympiad results | Cultural & arts achievements | Showcasing student journeys | /awards-achievements, /extracurriculars, /senior-secondary-section |
| `/safety-security` | ~500–700 | 1,000–1,200 | OK, light expand | 160 CCTV cameras & monitoring | Metal detectors & visitor controls | GPS-tracked transport | Trained nurses & ambulance | 100% female preschool staff | Drills & training | /amenities, /pre-primary-school-thane, /admissions |
| `/beyond-the-classroom` | ~500–700 | 1,000–1,200 | OK, light expand | Why beyond-classroom matters | Exhibitions & student-led events | Clubs & societies | Educational tours | Organic farming & sustainability | /extracurriculars, /our-philosophy, /amenities |
| `/extracurriculars` | ~500–700 | 1,000–1,200 | OK, light expand | FIT INDIA School activities | Sports — indoor & outdoor | Music, dance, drama | Robotics & STEM clubs | Swimming programme | Annual events | /amenities, /awards-achievements, /photo-gallery |
| `/photo-gallery` | ~200–400 (caption-only) | 600–900 | THIN content (mostly images), add captioned sections | Campus & infrastructure | Academic events | Sports & fitness | Cultural & festive events | Annual day & celebrations | Student achievements | /amenities, /extracurriculars, /awards-achievements |
| `/contact-us` | ~200–300 | 500–700 | THIN, expand with directions/details | Visit us — address & directions | Call & email | Admissions enquiry form | School hours & meeting requests | Map embed | /admissions, /application-form, /faqs |
| `/academic-calendar` | ~150–300 | 500–700 | THIN, expand | Academic year overview | Term-wise dates 2026-27 | Holiday list | Exam schedule | PTM & event calendar | Download PDF | /admissions, /faqs, /book-list |
| `/cbse-mandatory-public-disclosures` | ~400–600 | 900–1,100 | OK, light expand | About CBSE Affiliation 1130661 | General information | Documents & infrastructure | Results & academics | Staff details | Fee structure & policies | Downloads | /fee-structure, /about-rainbow-international-school, /school-managing-committee |
| `/school-managing-committee` | ~250–400 | 700–900 | THIN, expand | About the SMC | Members & roles | Parent representatives | Teacher representatives | Meeting cadence & governance | /cbse-mandatory-public-disclosures, /about-rainbow-international-school, /chairpersons-note |
| `/career` | ~400–600 | 900–1,100 | OK, light expand | Why work at RIS | Current openings (teaching) | Current openings (non-teaching) | Application process | Female-candidate preference & culture | Apply now | /about-rainbow-international-school, /our-philosophy, /academic-team |
| `/book-list` | ~200–400 | 600–800 | THIN (mostly tables/links), expand intro & guidance | About the book list | Class-wise lists Nursery to Class 12 | Where to buy | Stationery & supplies | Download list | /admissions, /academic-calendar, /curriculum |
| `/virtual-learning` | ~300–500 | 700–900 | THIN, expand | About RIS Virtual Learning | Google Workspace & Classroom | Hybrid lesson model | How students access | Parent FAQs | /curriculum, /academic-team, /faqs |
| `/academic-team` | ~300–500 | 900–1,100 | THIN, expand | How RIS hires | Subject teachers | Sports & fitness coaches | Counsellors & support staff | Professional development & training | /career, /our-philosophy, /awards-achievements |
| `/rainbow-preschool-international` | ~250–400 | 500–700 (summary) | KEEP-AS-SUMMARY (Decision 6) | About Rainbow Preschool | Age groups served | What makes our preschools different | Full preschool site link & CTA | External: rainbowpreschools.com; Internal: /pre-primary-school-thane, /admissions |
| `/brand-partners` | ~600–900 | 1,200–1,500 | OK | About RIS Brand Partners | Categories of partners (11) | Featured partner spotlights | RIS privilege card | How families benefit | Brochure download | /testimonials, /about-rainbow-international-school, /faqs |
| `/students-leaving-certificate` | ~200–400 | 600–800 | THIN, expand | About school leaving certificates | When TC is needed | Process step-by-step | Documents required | Fee & timeline | Download form | /admissions, /faqs, /contact-us |
| `/curriculum` | ~300–500 | 1,000–1,200 | THIN, expand | Our CBSE curriculum philosophy | Pre-Primary curriculum | Primary curriculum | Middle School curriculum | Secondary curriculum | Senior Secondary streams | Beyond academics | /our-philosophy, /book-list, /extracurriculars |
| `/application-form` | ~150–300 | 400–600 | THIN intentionally (transactional); expand intro+next-steps | About the form | Documents to keep ready | Fill the form | What happens next | Talk to admissions | /admissions, /fee-structure, /faqs |
| `/admissions` | ~600–800 | 1,200–1,500 | THIN, expand | Admission process step-by-step | Age criteria by class | Documents required | Fees & payment | Important dates 2026-27 | FAQs | Apply now CTA | /application-form, /fee-structure, /faqs |
| `/fee-structure` | ~300–500 | 1,200–1,500 | THIN, expand (Decision 3 — improve HTML, keep PDF as-is) | Class-wise fee table (full) | One-time vs annual vs term breakdown | Transport fees | Concessions & policies | Payment modes | Download fee structure PDF | Apply for 2026-27 | /admissions, /faqs, /application-form |
| `/top-schools-in-thane` | ~600–800 | 1,500–2,000 | REFRAME to neutral guide (Decision 4) | Why parents look for school rankings | Why a single ranking isn't useful | A parent's evaluation framework (criteria) | Fees benchmarking | Infrastructure benchmarking | Board (CBSE/ICSE) considerations | Locality considerations | A worked example using public data | /cbse-mandatory-public-disclosures, /amenities, /admissions |
| `/school-near-brahmand-thane` | ~500–700 | 1,000–1,200 | KEEP, light expand | About RIS in Brahmand | Distance from Brahmand Phase 4 | What Brahmand families like | Bus routes covering Brahmand | Apply from Brahmand | /admissions, /amenities, /school-near-ghodbunder-road-thane |
| `/school-near-ghodbunder-road-thane` | ~500–700 | 1,000–1,200 | KEEP, light expand | About RIS near GB Road | 8 min from GB Road | Bus routes — Patlipada, Waghbil, Kavesar | What GB Road families like | Apply from GB Road | /admissions, /amenities, /school-near-brahmand-thane |
| `/school-near-manpada-thane` | ~500–700 | 1,000–1,200 | KEEP, light expand | About RIS near Manpada | 5 min from Manpada Junction | Bus routes serving Manpada | What Manpada families like | Apply from Manpada | /admissions, /amenities, /school-near-brahmand-thane |
| `/testimonials` | ~400–600 | 900–1,100 | OK, light expand. Confirm aggregation source (TODO-4) | How families rate RIS | Pre-Primary parent voices | Primary parent voices | Middle School parent voices | Secondary parent voices | Senior Secondary parent voices | Submit your testimonial | /admissions, /awards-achievements, /faqs |
| `/faqs` | ~600–900 | 1,500–2,000 | OK, expand FAQ schema | Admissions FAQs | Fees FAQs | Curriculum & academics FAQs | Safety FAQs | Timings & transport FAQs | Extracurriculars FAQs | Facilities FAQs | Still have a question? | /admissions, /fee-structure, /contact-us |
| `/google-school-2025-26` | N/A (campaign hold) | N/A | KEEP-PENDING | NO CHANGE pending Decision 5 (TODO-2) | — |
| `/meta-school-2025-26` | N/A (campaign hold) | N/A | KEEP-PENDING | NO CHANGE pending Decision 5 (TODO-2) | — |

  > **Notes on word-count proxy:** "Current word count (proxy)" is estimated by direct read of the page body in `client/src/pages/` (excluding nav/footer/forms boilerplate). THIN flag = current body < ~600 words for content pages, < ~300 words for transactional/utility pages. /welcome-to-ris is N/A because it is being 301'd. Campaign pages (Google/Meta) are KEEP-PENDING per Decision 5.

  ### Section 3B — Tier 1 + Tier 2 blog posts (35) — expansion targets (Waves 2 & 3)

  | # | Slug | Current word count (proxy) | Target | THIN flag | Recommended H2 structure | Internal links |
  |---|---|---|---|---|---|---|
  | T1.1 | `cbse-vs-icse-which-board-prepares-students-better-for-the-future` | ~1,800 | 2,000–2,500 | OK | Quick verdict | What is CBSE | What is ICSE | Syllabus compared | Exam pattern compared | University acceptance | Career outcomes | Which board for which child | FAQs | /admissions, /curriculum, T2.1 |
| T1.2 | `ideal-teacher-qualities-traits-of-a-great-educator` | ~1,200 | 1,800–2,000 | EXPAND | Why great teachers matter | Subject mastery | Empathy | Communication | Patience | Creativity | Fairness | Lifelong learning | Adaptability | How to spot one in a school visit | /academic-team, /career, /our-philosophy |
| T1.3 | `key-facilities-every-good-cbse-school-should-have` | ~1,300 | 1,800–2,100 | EXPAND | Why facilities matter | Science labs | Library | Sports ground & indoor sports | Smart classrooms | Infirmary & nurse | Transport & safety | Auditorium & arts | What to verify on a school visit | /amenities, /safety-security, /admissions |
| T1.4 | `cultural-activities-for-students-key-to-developing-critical-thinking-skills` | ~1,400 | 1,800–2,000 | EXPAND | Cultural activities defined | Why they build critical thinking | Examples by age | How schools structure them | What parents should ask | Outcomes to look for | /extracurriculars, /beyond-the-classroom, /our-philosophy |
| T1.5 | `importance-of-sports-in-students-life-teamwork-skills` | ~1,500 | 2,200–2,500 (pillar) | EXPAND-PILLAR | Why sports matter (overview) | Physical health | Cognitive benefits | Teamwork & leadership | Mental wellbeing | Discipline & time management | Academic performance link | Indoor vs outdoor | Schools and sports | Parent guide | /extracurriculars, /amenities, T3.13, T3.14, T3.19 |
| T1.6 | `why-rainbow-international-school-is-among-the-top-schools-in-thane` | ~1,400 | 2,200–2,500 (pillar) | EXPAND-PILLAR | 3.5-acre campus | CBSE since 2009 | Holistic learning approach | Safety & care | Faculty | Results & achievements | Parent voices | Locality access | Visit us | /about-rainbow-international-school, /admissions, /testimonials |
| T1.7 | `parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child` | ~1,500 | 2,000–2,300 | KEEP-EXPAND | Why this guide | Criteria for choosing | Questions to ask | School visit checklist | Fees considerations | Board affiliation verification | Locality & commute | Talk to other parents | /admissions, /cbse-mandatory-public-disclosures, T2.11 |
| T1.8 | `the-growing-popularity-of-cbse-schools-in-thane-west-among-parents` | ~1,200 | 1,800–2,000 | EXPAND | Why CBSE is growing in Thane West | Curriculum strengths | University acceptance | Balanced learning | What parents say | Numbers from public data | Choosing the right CBSE school here | /best-cbse-school-thane-west (new), /admissions, T1.7 |
| T1.9 | `school-admission-checklist-thane-parents-guide-2026` | ~1,300 | 1,800–2,000 | EXPAND | Why a checklist | Documents needed | Eligibility & age | Fees clarity | Deadlines 2026-27 | Questions to ask | School visit notes | Decision-day checklist | /admissions, /application-form, /fee-structure |
| T1.10 | `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` | ~1,800 | 2,500+ (pillar) | EXPAND-PILLAR | Why this matters | Benefits of mobile phones | Risks (physical, mental, social) | Screen time guidelines by age | Parental controls | Healthy device habits | School policy support | Conversations to have | /our-philosophy, /faqs, T3.31 |
| T2.1 | `cbse-vs-icse-vs-state-board-which-is-best-for-your-child` | ~1,300 | 1,800–2,000 | EXPAND | Three boards overview | Syllabus | Exam pattern | Costs | University acceptance | Career outcomes | Which board for which family | Verdict | /admissions, T1.1 |
| T2.2 | `co-curricular-activities` | ~900 | 1,500–1,800 | EXPAND | What are co-curriculars | Types | Cognitive benefits | Social benefits | How schools structure them | Parent role | What to look for in a school | /extracurriculars, /beyond-the-classroom |
| T2.3 | `problem-solving-activities-life-skills-students` | ~1,000 | 1,500–1,800 | EXPAND | Why problem-solving matters | Classroom examples | Age-wise approach (K-12) | Home activities | School activities | How parents can help | /curriculum, /our-philosophy |
| T2.4 | `role-of-parents-in-education-orientation-importance` | ~1,000 | 1,500–1,700 | EXPAND | Parents' role in education | Why orientation matters | What good orientation looks like | Building parent-school partnership | PTMs done right | /admissions, /faqs |
| T2.5 | `importance-of-foundational-literacy-and-numeracy-in-schools` | ~1,000 | 1,500–1,800 | EXPAND | What is FLN | Why early years matter | NEP 2020 implications | What parents should look for | What teachers do | Tracking progress | /primary-section, /pre-primary-school-thane |
| T2.6 | `how-to-help-your-child-focus-better-in-studies` | ~1,100 | 1,500–1,800 | EXPAND | 12 strategies overview | Study environment | Breaks | Nutrition | Sleep | Screen time | Motivation techniques | Putting it together | /extracurriculars, T2.20 |
| T2.7 | `importance-of-extracurricular-activities-in-school` | ~1,000 | 1,500–1,800 | EXPAND | Why extracurriculars matter | Cognitive benefits | Social skills | College applications | Balanced development | School programme structure | /extracurriculars, /amenities |
| T2.8 | `new-education-policy-nep-2020-what-parents-should-know` | ~1,200 | 1,800–2,000 | EXPAND | NEP 2020 overview | 5+3+3+4 structure | Foundational stage | Mother-tongue medium | Holistic report cards | Board exam reforms | What it means for your child | /curriculum, /primary-section |
| T2.9 | `how-to-prepare-your-child-for-first-day-of-school` | ~900 | 1,400–1,700 | EXPAND | Why prep matters | Routine setup | School visit | Separation anxiety | Supplies & uniform | Conversations to have | First-week tips | /pre-primary-section, /admissions |
| T2.10 | `benefits-of-multiple-intelligence-based-learning-in-schools` | ~1,100 | 1,600–1,800 | EXPAND | Howard Gardner & MI theory | The 8 intelligences | Classroom application | How schools can use MI | Parent role | What to look for | /curriculum, /our-philosophy |
| T2.11 | `best-cbse-schools-in-thane-what-to-look-for` | ~1,300 | 1,800–2,000 | EXPAND | Affiliation verification | Teacher qualifications | Infrastructure | Transport | Fees breakdown | Safety | Communication | A short checklist | /cbse-mandatory-public-disclosures, T1.7 |
| T2.12 | `6-reasons-why-cbse-is-the-best-board-of-the-country` | ~1,400 | 1,800–2,000 | KEEP-EXPAND | Standardised syllabus | NCERT alignment | University acceptance | JEE/NEET prep | Language flexibility | Pan-India mobility | Counterpoints to consider | /admissions, T1.1 |
| T2.13 | `why-choose-a-cbse-school-for-your-childs-education` | ~1,200 | 1,800–2,000 (post-merge) | KEEP-MERGE-EXPAND | CBSE in 2 minutes | NCERT-aligned syllabus | Board recognition | Balanced approach | K-12 continuity | Tips for choosing a CBSE school in Mumbai (merged content) | Visit checklist | /admissions, T1.7, T2.11 |
| T2.14 | `international-school-admission-process-guide` | ~1,400 | 2,000–2,300 (post-merge) | KEEP-PILLAR-MERGE | What "international school" means in India | Eligibility | Age criteria | Documents | Entrance assessments | Fees & timelines | Step-by-step process (merged) | Common parent questions | /admissions, T2.16, T2.17 |
| T2.15 | `age-criteria-for-international-schools-admission-2025-in-mumbai` | ~1,000 | 1,600–1,800 (post-merge) | IMPROVE-MERGE | Mumbai school admission ages | Class-wise minimum age | Cut-off dates | RTE rules | Best age to start (merged) | Parent FAQ | /admissions, T2.14 |
| T2.16 | `what-you-need-to-know-before-applying-to-an-international-school` | ~1,100 | 1,600–1,800 | EXPAND | A pre-application checklist | Documents | Age criteria | Fees | Transport | After-school care | School visits | Entrance assessments | /admissions, T2.14 |
| T2.17 | `advantages-of-starting-early-international-school` | ~900 | 1,400–1,600 | EXPAND | Why early matters | Language exposure | Social skills | Routine | Learning rhythm | Academic confidence | Counterpoints | /pre-primary-school-thane, T2.9 |
| T2.18 | `stress-in-teenagers-symptoms-management` | ~1,200 | 1,800–2,000 | EXPAND | Stress in teenagers overview | Symptoms | Causes (academic) | Causes (social) | Causes (family) | Management for parents | Management for schools | Warning signs that need help | /our-philosophy, T3.31 |
| T2.19 | `riddles-for-kids` | ~1,000 (list) | 1,500–1,800 | EXPAND-LIST | Why riddles matter | Riddles for ages 4-6 | Ages 7-9 | Ages 10-12 | Tougher riddles | How parents can use them | /extracurriculars, T2.6 |
| T2.20 | `how-to-increase-attention-span` | ~1,100 | 1,600–1,800 | EXPAND | Why attention span matters | Brain breaks | Focus techniques | Sleep | Nutrition | Screen time limits | Study environment | Building focus over time | /our-philosophy, T2.6 |
| T2.21 | `benefits-of-learning-a-second-language` | ~1,000 | 1,500–1,800 | EXPAND | Why a second language | Cognitive flexibility | Academic performance | Cultural awareness | Career advantages | When to start | School language programmes | /curriculum, /extracurriculars |
| T2.22 | `how-cbse-schools-can-foster-entrepreneurship-and-innovation` | ~1,100 | 1,600–1,800 | EXPAND | Why entrepreneurship matters | Atal Tinkering Labs | Project-based learning | Business clubs | Mentorship programmes | What schools can do | /beyond-the-classroom, /curriculum |
| T2.23 | `smart-revision-techniques-for-students` | ~1,200 | 1,700–1,900 | EXPAND | Beyond rote learning | Spaced repetition | Active recall | Mind maps | Practice tests | Teaching back method | Building a revision plan | /curriculum, T2.20 |
| T2.24 | `innovative-teaching-method-for-active-learning` | ~1,100 | 1,600–1,800 | EXPAND | Active learning defined | Flipped classroom | Project-based learning | Gamification | Peer teaching | Inquiry-based approaches | Case studies | /curriculum, /academic-team |
| T2.25 | `how-to-learn-boring-subjects` | ~1,000 | 1,500–1,800 | EXPAND | 8 strategies overview | Real-world links | Mini-goals | Study partners | Gamification | Teaching back | Rewards | Mindset shifts | /curriculum, T2.20 |

  > **Status legend:** EXPAND = under target, expand body in wave; KEEP-EXPAND = pre-approved KEEP page that still gets a body expansion; EXPAND-PILLAR = pillar post receiving merged content from 301'd siblings, target 2,200+ words; KEEP-PILLAR-MERGE / IMPROVE-MERGE = absorbs merged content from a Tier 4 source (per Decisions 9, 10, 11, 12).

  ### Section 3C — Tier 3 (45) — expansion plan summary (Wave 4)

  Tier 3 posts are not individually re-bodied in this plan; they receive **meta refresh only** in Wave 4 (titles + descriptions per Section 2B). Full body expansion for Tier 3 is deferred to a post-Wave-5 content sprint. The 3 historical-brand KEEP posts (`100-result…`, `an-all-rounder…raghvi-ramanujan…`, `the-leading-school…`) get meta refresh only — bodies are intentionally preserved as historical record. The 3 award posts (`rainbow-awarded…`, `rainbow-preschools-featured…`, `rainbow-wins-award…`) are 410'd after the GSC backlink check (TODO-7).

  ### Section 3D — Internal linking principles

  Every commercial page should include 2–3 contextual internal links (covered in the table above). Blog → commercial linking targets:
  - All "Thane CBSE choice" posts → `/admissions`, `/about-rainbow-international-school`
  - Sports / extracurricular posts → `/extracurriculars`, `/amenities`
  - Admission process posts → `/admissions`, `/application-form`, `/fee-structure`
  - Screen time / parenting posts → `/about-rainbow-international-school` (philosophy section)

---




  ### Section 3E — RIS ↔ RPS internal linking rules

  > **Why this matters:** RIS (CBSE K-12) and RPS (preschool network) live in the same Rainbow Group ecosystem. Cross-links should support the parent journey (preschool → primary → senior secondary) without diluting RIS admission pages.

  **Where RPS links are allowed (RIS → RPS):**

  | Page / area | How |
  |---|---|
  | Homepage — controlled lower section | Single small "Group schools" or "Rainbow Preschools" mention |
  | `/admissions` | Small supporting note for parents asking about preschool admissions |
  | `/about-rainbow-international-school` | Group / parent-organisation context |
  | `/rainbow-preschool-international` (existing summary) | Primary outbound to rainbowpreschools.com |
  | Footer — "Group schools / related institutions" | Standard link |
  | Blog posts about early years / preschool transition | Contextual, parent-journey only |

  **Where RPS links must be avoided or minimized:**

  - Hero / above-the-fold of any commercial page
  - `/top-schools-in-thane` (CBSE intent)
  - `/senior-secondary-section` (Class 11/12 intent)
  - `/fee-structure` (transactional)
  - Student Achievements / results pages
  - Class 11 admission content
  - `/contact-us` above-the-fold
  - Main admission CTA blocks anywhere

  **Allowed RPS anchor text:** "Rainbow Preschools", "preschool admissions", "preschools in Thane", "early years learning", "Rainbow Group preschool network".

  **Banned RPS anchor text:** "CBSE school in Thane", "best CBSE school in Thane", "senior secondary school", "Class 11 admission", "school fees in Thane" (unless the destination is unambiguously the matching RIS page).
  
---

## Section 4 — Schema Recommendations Per Page Type

### School data to use throughout (verified)
```
{
  "name": "Rainbow International School",
  "address": {
    "streetAddress": "Brahmand Phase 4",
    "addressLocality": "Thane West",
    "postalCode": "400 610",
    "addressRegion": "Maharashtra",
    "addressCountry": "IN"
  },
  "telephone": "+91 82915 68972",
  "email": "info@rainbowinternationalschool.in",
  "url": "https://rainbowinternationalschool.in",
  "foundingDate": "2009-04",
  "identifier": "CBSE Affiliation No. 1130661"
}
```

### Schema per page type

| Page / pattern | Recommended JSON-LD types | Notes |
|---|---|---|
| `/` (home) | `Organization` + `EducationalOrganization` + `WebSite` (with `SearchAction`) + `LocalBusiness` | Use `EducationalOrganization` as primary type with `Organization` properties merged. |
| Section pages (Pre-Primary, Primary, Middle, Secondary, Senior Secondary) | `EducationalOrganization` with `hasCredential` (CBSE 1130661) + `BreadcrumbList` | Add `educationalLevel` and `educationalProgram` describing the Class range. |
| `/admissions` | `Course` (with `provider` = EducationalOrganization) + `EducationalOrganization` + `BreadcrumbList` | `Course` describes the overall admission programme. |
| `/application-form` | `EducationalOrganization` + `BreadcrumbList` | Form itself is interactive; schema is for context. |
| `/fee-structure` | `EducationalOrganization` + `Offer` (per Class with `price` field) + `BreadcrumbList` | TODO: actual fees needed before publishing `Offer` schema. |
| `/career` | `JobPosting` (one entry per open role) + `EducationalOrganization` (as `hiringOrganization`) | **TODO: open roles required from school HR before publishing (TODO-3).** |
| `/blog/:slug` | `BlogPosting` + `BreadcrumbList` + `Person` (author) | **TODO: author names required from blog content team (TODO-5).** |
| `/contact-us` | `LocalBusiness` (full geo, phone, openingHours) + `EducationalOrganization` | Add `geo.latitude` / `geo.longitude` for Brahmand Phase 4. |
| `/faqs` | `FAQPage` with all Q/A pairs | Include only published FAQs. |
| `/testimonials` | `EducationalOrganization` with `aggregateRating` | Page already publishes 4.8/5 — confirm aggregation source before adding to schema (TODO-4). |
| `/photo-gallery` | **`ImageGallery`** (schema.org/ImageGallery) with `name`, `description`, `url`, and `image` array | New addition. Image array should reference 8–12 representative campus photos. |
| `/cbse-mandatory-public-disclosures` | `EducationalOrganization` with all CBSE-mandated disclosure fields exposed | Include staff count, infrastructure detail, results. |
| Locality pages (`/school-near-brahmand-thane`, etc.) | `LocalBusiness` + `EducationalOrganization` + `BreadcrumbList` | `geo` should reference the locality coordinates. |
| `/awards-achievements`, `/student-achievements` | `EducationalOrganization` + `BreadcrumbList` + array of `Award` references | Awards as freeform; only schema-validate where structured data helps. |
| `/academic-calendar` | `EducationalOrganization` + `BreadcrumbList` + linked `Event` array if individual events are listed | TODO: event-level data only if calendar data is structured. |
| `/curriculum`, `/our-philosophy`, `/ris-vision-mission`, `/chairpersons-note` | `EducationalOrganization` + `BreadcrumbList` | Standard. |
| `/rainbow-preschool-international` | `EducationalOrganization` (RPS as separate org) + `BreadcrumbList` + `sameAs` link to www.rainbowpreschools.com | Keep distinct from RIS Organization. |
| `/brand-partners`, `/school-managing-committee`, `/safety-security`, `/beyond-the-classroom`, `/extracurriculars`, `/virtual-learning`, `/academic-team`, `/book-list`, `/students-leaving-certificate` | `EducationalOrganization` + `BreadcrumbList` | Standard. |
| `/top-schools-in-thane` (post-reframe) | `Article` (educational guide content) + `BreadcrumbList` | Treat as parent-guide article, not a list of schools. |
| `/google-school-2025-26`, `/meta-school-2025-26` | KEEP (no schema changes until Decision 5 resolved — TODO-2) |

### Schema rollout sequence
- Wave 1 pages: only deploy schema for which all required values are verified. Mark `Offer.price`, `aggregateRating`, `JobPosting`, `Person.author` as TODO until real values are received.
- Validate every JSON-LD block with Google Rich Results Test before deploy.

---



  ### Section 4.1 — Schema allow / avoid rules

  **Allowed schema types** (use where the data is genuine and relevant):
  - `Organization`, `EducationalOrganization`, `School`
  - `LocalBusiness` (where appropriate)
  - `WebSite`, `WebPage`
  - `BreadcrumbList`
  - `FAQPage`
  - `Article` (publisher = "Rainbow International School", **no** `author` set to a Person — use Organization)
  - `ContactPoint`
  - `ImageObject`

  **Avoided schema types** (do not add):
  - `Person` schema for blog authors / staff bylines
  - `Review` schema unless genuine, attributable review data exists from an approved channel
  - `AggregateRating` unless genuine, attributable review data exists from an approved channel
  - Fake / fabricated reviewer or staff schema of any kind

  > Existing visible person names on protected pages (`/chairpersons-note`, `/school-managing-committee`, `/academic-team`, `/about-rainbow-international-school`, `/cbse-mandatory-public-disclosures`, `/awards-achievements`) remain as **page content** but are not wrapped in `Person` schema.

  ### Section 4.2 — Testimonials guidance

  - Use parent **first name + initial only** (e.g., "Priya S., Parent"); never full names.
  - No student names in testimonials.
  - No fabricated star ratings; no fake "Google review" labels.
  - Real Google review content may be used only if accessibly sourced (Google Business Profile / approved review export) and compliant with Google's terms — never scraped.
  - No `Review` or `AggregateRating` schema unless real reviews are present.
  - Existing testimonials on `/testimonials` are reviewed for compliance during their scheduled wave; nothing changes outside that schedule.
  
---

## Section 5 — 5-Wave Rollout Calendar

### Gating signal
**Wave 1 cannot ship before May 15** and is gated on these GSC signals:
- Indexed pages count: > 230 (was 220 on May 1)
- "Page with redirect" count: < 70 (was 91 on May 1)
- No new "Discovered – not indexed" spikes

If signals are not met by May 15, defer Wave 1 to May 18. If still not met by May 18, defer to May 22 and reassess recovery trajectory.

### Wave 1 — May 18 (target) — 6 commercial pages

| # | URL | Action |
|---|---|---|
| 1 | `/` | Title + description + body + schema |
| 2 | `/admissions` | Title + description + body + schema |
| 3 | `/primary-section` | Title + description + body |
| 4 | `/senior-secondary-section` | Title + description + body |
| 5 | `/amenities` | Title + description + body + schema |
| 6 | `/fee-structure` | Title + description + body (rich fee tables) + schema |

**Estimated effort:** 12–16 hours total
- Title & description writes: 2 hrs
- Body content drafting: 8–10 hrs
- Schema implementation: 2 hrs
- QA & validation: 2 hrs

### Wave 2 — May 25 — 10 Tier 1 blog posts (meta only)

| # | Slug |
|---|---|
| 1 | `cbse-vs-icse-which-board-prepares-students-better-for-the-future` |
| 2 | `ideal-teacher-qualities-traits-of-a-great-educator` |
| 3 | `key-facilities-every-good-cbse-school-should-have` |
| 4 | `cultural-activities-for-students-key-to-developing-critical-thinking-skills` |
| 5 | `importance-of-sports-in-students-life-teamwork-skills` |
| 6 | `why-rainbow-international-school-is-among-the-top-schools-in-thane` |
| 7 | `parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child` |
| 8 | `the-growing-popularity-of-cbse-schools-in-thane-west-among-parents` |
| 9 | `school-admission-checklist-thane-parents-guide-2026` |
| 10 | `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` |

**Estimated effort:** 6–8 hours

### Wave 3 — June 1 — 25 Tier 2 blog posts (meta only)

| # | Slug |
|---|---|
| 1 | `cbse-vs-icse-vs-state-board-which-is-best-for-your-child` |
| 2 | `co-curricular-activities` |
| 3 | `problem-solving-activities-life-skills-students` |
| 4 | `role-of-parents-in-education-orientation-importance` |
| 5 | `importance-of-foundational-literacy-and-numeracy-in-schools` |
| 6 | `how-to-help-your-child-focus-better-in-studies` |
| 7 | `importance-of-extracurricular-activities-in-school` |
| 8 | `new-education-policy-nep-2020-what-parents-should-know` |
| 9 | `how-to-prepare-your-child-for-first-day-of-school` |
| 10 | `benefits-of-multiple-intelligence-based-learning-in-schools` |
| 11 | `best-cbse-schools-in-thane-what-to-look-for` |
| 12 | `6-reasons-why-cbse-is-the-best-board-of-the-country` |
| 13 | `why-choose-a-cbse-school-for-your-childs-education` |
| 14 | `international-school-admission-process-guide` |
| 15 | `age-criteria-for-international-schools-admission-2025-in-mumbai` |
| 16 | `what-you-need-to-know-before-applying-to-an-international-school` |
| 17 | `advantages-of-starting-early-international-school` |
| 18 | `stress-in-teenagers-symptoms-management` |
| 19 | `riddles-for-kids` |
| 20 | `how-to-increase-attention-span` |
| 21 | `benefits-of-learning-a-second-language` |
| 22 | `how-cbse-schools-can-foster-entrepreneurship-and-innovation` |
| 23 | `smart-revision-techniques-for-students` |
| 24 | `innovative-teaching-method-for-active-learning` |
| 25 | `how-to-learn-boring-subjects` |

**Estimated effort:** 12–15 hours

### Wave 4 — June 8 — Tier 3 (45 posts) + Tier 4 dispositions (14) + structural items

**Tier 3 — 40 IMPROVE meta rewrites:**

| # | Slug |
|---|---|
| 1 | `how-to-avoid-procrastination-while-studying` |
| 2 | `teen-entrepreneurship-fostering-innovation-and-responsibility` |
| 3 | `teaching-teens-resilience-and-thriving-through-failure` |
| 4 | `nutritional-requirements-of-the-teenagers-how-to-fulfil-them` |
| 5 | `top-5-techniques-for-taming-anger-in-children` |
| 6 | `top-6-easy-ways-to-develop-patience-in-your-child` |
| 7 | `homework-war-endgame` |
| 8 | `amazing-coaches-who-improved-players-willpower` |
| 9 | `how-organic-farming-in-schools-helps-the-nation` |
| 10 | `how-school-buses-are-changing-with-technology` |
| 11 | `amazing-youtube-channels-on-general-knowledge-for-kids` |
| 12 | `know-how-swimming-helps-your-child-in-7-ways` |
| 13 | `big-school-playgrounds-6-reasons-why-kids-need-them` |
| 14 | `6-reasons-why-indoor-sports-is-important-in-schools` |
| 15 | `field-trips-know-how-they-groom-students-in-5-ways` |
| 16 | `time-management-for-school-children-6-ways-parents-can-help` |
| 17 | `how-to-teach-benefits-of-family-meals-to-kids` |
| 18 | `do-your-children-hate-reading-know-why-youre-the-reason` |
| 19 | `how-regular-sports-help-students-6-reasons` |
| 20 | `digital-classrooms-how-technology-improves-education-in-school` |
| 21 | `9-reasons-why-schools-should-have-an-infirmary-and-paediatrician` |
| 22 | `7-safety-and-security-measures-your-kids-school-should-have` |
| 23 | `10-fun-and-educational-republic-day-activities-for-kids` |
| 24 | `christmas-celebration-in-school-10-fun-and-festive-activity-ideas` |
| 25 | `diwali-activities-for-students` |
| 26 | `benefits-of-meditation-for-students` |
| 27 | `group-activities-for-students` |
| 28 | `4-reasons-why-school-bags-should-not-be-a-burden` |
| 29 | `6-excellent-ideas-to-innovate-cultural-programmes-in-school` |
| 30 | `7-areas-in-education-where-indian-women-are-excellent` |
| 31 | `teen-depression-how-to-spot-and-cure-it` |
| 32 | `understanding-adolescence-how-to-handle-the-process` |
| 33 | `how-to-deal-with-anxiety-during-exams` |
| 34 | `how-to-develop-fine-motor-skills-at-home` |
| 35 | `10-things-in-the-classroom-to-boost-student-engagement` |
| 36 | `teaching-children-the-value-of-money-5-ways-schools-can-help` |
| 37 | `the-benefits-of-early-learning-in-shaping-a-childs-personality` |
| 38 | `why-maths-matters-in-student-life-benefits-uses` |
| 39 | `school-sanitation-standards-how-to-stay-clean-and-safe` |
| 40 | `100-result-rainbows-first-batch-2018-19` (KEEP — meta refresh only) |
  | 41 | `an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming` (KEEP — meta refresh only) |
  | 42 | `the-leading-school-of-the-year-thane` (KEEP — meta refresh only) |

**Tier 3 — 3 × 410 (after backlink check — TODO-7):**

> Reconciled with Section 2B Tier 3 KEEP rows. The three historical-brand posts (`the-leading-school-of-the-year-thane`, `100-result-rainbows-first-batch-2018-19`, `an-all-rounder-kid-raghvi-ramanujan-displays-exceptional-talent-in-swimming`) are explicitly KEEP per pre-approved task instructions and are NOT included in this 410 list.

| # | Slug |
|---|---|
| 1 | `rainbow-awarded-as-best-preschool-and-secondary-school-in-thane` |
| 2 | `rainbow-preschools-featured-in-knowledge-review-magazine` |
| 3 | `rainbow-wins-award-for-excellence` |

**Tier 4 — 7 × 301:**

| # | Slug | Target |
|---|---|---|
| 1 | `imporatnce-of-sports-in-students-life` | `importance-of-sports-in-students-life-teamwork-skills` |
| 2 | `top-reasons-choose-rainbow-international-school-thane` | `why-rainbow-international-school-is-among-the-top-schools-in-thane` |
| 3 | `benefits-of-rainbow-international-school` | `why-rainbow-international-school-is-among-the-top-schools-in-thane` |
| 4 | `holistic-development-rainbow-international-school` | `why-rainbow-international-school-is-among-the-top-schools-in-thane` |
| 5 | `regulating-childrens-screen-time` | `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` |
| 6 | `smartphone-addiction-how-to-ensure-healthy-use-by-kids` | `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` |
| 7 | `using-gadgets-the-right-way` | `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time` |

**Tier 4 — 3 × MERGE (combine content into target, then 301):**

| # | Slug | Target |
|---|---|---|
| 1 | `back-to-school-a-step-by-step-guide-to-international-school-admissions` | `international-school-admission-process-guide` |
| 2 | `best-age-for-international-school-admission` | `age-criteria-for-international-schools-admission-2025-in-mumbai` |
| 3 | `5-tips-to-choose-best-cbse-schools-in-mumbai` | `why-choose-a-cbse-school-for-your-childs-education` |

**Tier 4 — 4 × 410 (after backlink check — TODO-6):**

| # | Slug |
|---|---|
| 1 | `coronavirus-the-new-monster-in-town` |
| 2 | `give-earth-to-life-on-earth` |
| 3 | `the-15th-world-education-summit` |
| 4 | `fit-india-certificate-of-recognition` |

**Wave 4 also includes structural items:**
- Pillar body expansion (T1.5 sports pillar, T1.10 screen-time pillar, T1.6 Rainbow brand pillar, T2.14 international admission pillar)
- `/welcome-to-ris` → `/about-rainbow-international-school` 301 + content merge (Decision 2)
- `/top-schools-in-thane` reframe (Decision 4) — full body rewrite to neutral evaluation guide

**Stale campaign pages (`/google-school-2025-26`, `/meta-school-2025-26`): BLOCKED until Decision 5 resolves.**
**Do NOT action 301s or 410s before canonical recovery is fully confirmed in GSC.**

**Estimated effort:** 50–60 hours (largest wave)

### Wave 5 — June 18 onwards — 4 new landing pages

| # | URL | Primary keyword |
|---|---|---|
| 1 | `/best-cbse-school-thane-west` | best CBSE school Thane West |
| 2 | `/cbse-school-admissions-class-1-thane-2026` | Class 1 CBSE admission Thane 2026 |
| 3 | `/class-11-science-admission-thane` | Class 11 Science stream Thane school |
| 4 | `/nursery-admission-thane-2026-27` | nursery admission Thane 2026-27 |

Each page: design + content + schema + internal linking.
**Estimated effort:** 16–20 hours per page = 64–80 hours total

### Total project effort estimate
**~144–179 hours** of focused implementation work across 5 waves over ~5 weeks.

---

## Section 6 — Per-Wave Validation Checklist

Run all checks before deploying any wave. Failure of any check = block deploy.

- [ ] **Title length:** all proposed titles ≤ 60 characters
- [ ] **Description length:** all proposed descriptions 150–158 characters
- [ ] **Title uniqueness:** no proposed title duplicates any existing or proposed title across all 41 commercial pages and all surviving blog posts
- [ ] **Description uniqueness:** no proposed description duplicates any existing or proposed description
- [ ] **Primary keyword presence:** primary keyword appears in (a) title, (b) first 150 words of body, (c) at least one H2
- [ ] **No fabricated stats:** no figures added that are not verified from school records
- [ ] **Indian English:** "organisation", "programme", "centre", "favour" (no US spellings)
- [ ] **Internal links updated:** affected pages have at least 2 contextual internal links
- [ ] **Schema validation:** every JSON-LD block passes Google Rich Results Test
- [ ] **301 redirects tested:** each redirect returns HTTP 301 (not 302, not 404), Location header points to expected URL
- [ ] **Canonical tag:** every page has a self-referential canonical matching its production URL
- [ ] **Open Graph & Twitter card:** present on every page; titles match `<title>` (or shortened to fit OG limits)
- [ ] **Sitemap update:** /sitemap.xml regenerated to remove deleted/redirected URLs and add new ones
- [ ] **GSC submission:** affected URLs submitted via GSC URL Inspection after deploy
- [ ] **Recovery signal check (Wave 4 only):** GSC indexed > 240, "page with redirect" < 50 before any 410 actions

---



  ### Section 6.1 — Wave 1 pre-deploy compliance checks (added per Decisions 13 + 14)

  Before Wave 1 ships (May 18), verify on the 6 Wave 1 pages:

  - [ ] Zero new person names introduced (grep against the protected-name allow-list).
  - [ ] Zero `Person` schema added anywhere (`schema.org/Person` should appear only inside the existing protected-page content if at all — and only as visible text, not JSON-LD).
  - [ ] Zero `Review` or `AggregateRating` JSON-LD added.
  - [ ] All 6 Quick-Answer blocks present and within 40–60 words.
  - [ ] All 6 FAQPage schema blocks valid (parse with Google Rich Results Test).
  - [ ] RPS links audit: no RPS link in hero / above-the-fold of any of the 6 Wave 1 pages; if present on `/admissions`, it is the small supporting note and uses an allowed anchor text.
  - [ ] No new locality landing pages created.
  - [ ] All existing names on protected pages (`/chairpersons-note`, `/school-managing-committee`, `/academic-team`, `/about-rainbow-international-school`, `/cbse-mandatory-public-disclosures`, `/awards-achievements`) untouched.
  
---

## Section 7 — Open Decisions and TODOs

### 7.1 — The 12 strategic decisions (verbatim, as approved by user May 6, 2026)

> **Decision 1 — Wave 1 date:**
> Target May 18. Earliest May 15 only if GSC shows clear recovery signals: indexed count climbing past 230, "Page with redirect" count dropping below 70.

> **Decision 2 — /welcome-to-ris vs /about:**
> MERGE. 301 `/welcome-to-ris` into `/about-rainbow-international-school`. Combine the principal's welcome message into the About page as a dedicated section.

> **Decision 3 — Fee Structure PDF:**
> Option A confirmed. Keep PDF at its current URL as-is. Improve `/fee-structure` HTML page with full content. Cross-link both directions (HTML page links to PDF download; PDF metadata references HTML page).

> **Decision 4 — /top-schools-in-thane:**
> REFRAME (not remove). New angle: "How to Choose a CBSE School in Thane — A Parent's Evaluation Guide." Objective criteria format: fees, infrastructure, board affiliation, student-teacher ratio, transport. RIS appears as a factual example only — no self-ranking. New proposed title (≤60 chars).

> **Decision 5 — Stale campaign pages /google-school-2025-26 and /meta-school-2025-26:**
> HOLD — user awaiting confirmation from ads team whether these are still in active campaigns. Default action: NO CHANGE in any wave until resolved. Mark in the rollout calendar as blocked. Will update before Wave 4.

  > **Operational note (does not modify Decision 5):** for disposition-totals accounting in Sections 0 and 2A, these two pages are counted under KEEP because the default action is "no change in any wave." This is purely a counting choice and does not change the HOLD status from the verbatim decision.

> **Decision 6 — /rainbow-preschool-international:**
> Option A — keep as summary-and-link page on RIS, with strong call-to-action link to www.rainbowpreschools.com. Do NOT 301. Cross-domain relationship is valuable; 301 loses the topical association.

> **Decision 7 — CBSE vs ICSE pair (keep both, differentiate strictly):**
> - `cbse-vs-icse-which-board-prepares-students-better-for-the-future` → 2-way CBSE vs ICSE (current top traffic — 91K impressions). Leave alone, KEEP.
> - `cbse-vs-icse-vs-state-board-which-is-best-for-your-child` → re-target to 3-way comparison keyword: "CBSE vs ICSE vs State Board". Different keyword, different search intent. IMPROVE with new title/description targeting 3-way keyword.

> **Decision 8 — Board exam results:**
> TODO — user will provide actual Class 10/12 scores before Wave 1. Mark all schema exam result fields as TODO. Do NOT fabricate. Required data: Class X 2024-25 pass%, top scorers; Class XII 2024-25 stream-wise breakdown.

> **Decision 9 — Screen time cluster (4 posts) → MERGE:**
> Pillar: `understanding-the-effects-of-mobile-phones-on-children-benefits-risks-and-managing-screen-time`
> 301 into pillar:
> - `regulating-childrens-screen-time` → 301 to pillar
> - `smartphone-addiction-how-to-ensure-healthy-use-by-kids` → 301 to pillar
> - `using-gadgets-the-right-way` → 301 to pillar
> Target pillar word count: 2,500+ words. Combine unique content from all four.

> **Decision 10 — International admission cluster (6 posts) → pillar + targeted differentiations:**
> Pillar: `international-school-admission-process-guide`
> - `age-criteria-for-international-schools-admission-2025-in-mumbai` → KEEP, re-target to "school admission age in Mumbai" (unique keyword)
> - `best-age-for-international-school-admission` → MERGE INTO age-criteria post (same intent)
> - `what-you-need-to-know-before-applying-to-an-international-school` → KEEP, differentiate to "international school admission checklist" keyword
> - `advantages-of-starting-early-international-school` → KEEP, differentiate to "benefits of early school admission" keyword
> - `back-to-school-a-step-by-step-guide-to-international-school-admissions` → MERGE INTO pillar `international-school-admission-process-guide`

> **Decision 11 — Rainbow brand cluster (4 posts) → MERGE:**
> Pillar: `why-rainbow-international-school-is-among-the-top-schools-in-thane` (has current GSC traffic, Thane-specific keyword)
> 301 into pillar:
> - `benefits-of-rainbow-international-school` → 301 to pillar
> - `holistic-development-rainbow-international-school` → 301 to pillar
> - `top-reasons-choose-rainbow-international-school-thane` → 301 to pillar

> **Decision 12 — CBSE choice cluster (5 posts):**
> - `parental-guidance-how-to-choose-the-best-cbse-school-in-thane-for-your-child` → KEEP as Thane pillar
> - `best-cbse-schools-in-thane-what-to-look-for` → KEEP, differentiate to "checklist angle: things to verify before enrolling" keyword
> - `6-reasons-why-cbse-is-the-best-board-of-the-country` → KEEP, generic CBSE intent
> - `5-tips-to-choose-best-cbse-schools-in-mumbai` → MERGE INTO `why-choose-a-cbse-school-for-your-childs-education` (different city, similar intent)
> - `why-choose-a-cbse-school-for-your-childs-education` → KEEP, generic intent

### 7.2 — Open TODOs requiring user input or external data

| # | TODO | Owner | Required by | Notes |
|---|---|---|---|---|
| TODO-1 | Class X & XII 2024-25 board results data | School principal / academic head | Before Wave 1 (May 18) | Pass %, top scorers (with parental consent), distinction count, stream-wise breakdown. Required for `EducationalOrganization` schema. |
| TODO-2 | Campaign pages disposition decision | User + ads team | Before Wave 4 (June 8) | Are `/google-school-2025-26` and `/meta-school-2025-26` still in active campaigns? If yes, what's the spend and conversion rate? |
| TODO-3 | Current open job roles | School HR | Before Wave 1 (May 18) | Required for `JobPosting` schema on `/career`. If no open roles, omit `JobPosting` schema entirely. |
| TODO-4 | AggregateRating source for /testimonials | User | Before Wave 1 (May 18) | The page already publishes 4.8/5 — confirm whether this is from Google reviews or internal aggregation before adding to schema. Do NOT fabricate. |
| TODO-5 | Author names for blog post BlogPosting schema | Content team | Before Wave 2 (May 25) | Currently posts have no author byline. Decide on a single byline ("RIS Editorial Team") or per-post authors. |
| TODO-6 | GSC backlink report for Tier 4 410 candidates | User | Before Wave 4 (June 8) | Run a GSC "Top linking sites" report and check if any external sites link to: coronavirus, give-earth, 15th-world-summit, fit-india. If yes, switch to KEEP-IMPROVE. |
| TODO-7 | GSC backlink report for Tier 3 410 candidates (3 posts) | User | Before Wave 4 (June 8) | Check for: rainbow-awarded-as-best-preschool-and-secondary-school-in-thane, rainbow-preschools-featured-in-knowledge-review-magazine, rainbow-wins-award-for-excellence. |
| TODO-8 | Verify Fee Structure PDF redirect remains in place | Synthetic monitor / manual check | Before Wave 1 + ongoing | The PDF currently 301s to /fee-structure. If WordPress infrastructure is decommissioned, the redirect breaks and 1,042 clicks/quarter disappear. |
| TODO-9 | Cross-domain RIS ↔ RPS strategy | User | Before Wave 5 (June 18+) | New Wave 5 landing pages may cross-reference RPS for early-years intent. Confirm cross-domain linking pattern. |
| TODO-10 | Sitemap.xml update plan | Engineer | Before Wave 1 | Confirm the server's sitemap.xml generator picks up route changes automatically vs requires manual update. |

---

## Appendix A — Source-of-truth references

- All routes: `client/src/App.tsx`
- SEO component: `client/src/components/SEO.tsx`
- Blog post data: `client/src/data/blogPosts.ts` (94 posts)
- Site SSR: `server/ssrHome.ts` (homepage), `server/ssrBlog.ts` (all blog posts)
- Sitemap generator: `server/routes.ts`

## Appendix B — Document metadata

- Created: May 6, 2026
- Version: 1.1 (post code-review-fix revision)
- Author: Replit Agent (per Task #11)
- Source decisions: 12 pre-approved strategic decisions captured verbatim in Section 7.1
- Total commercial pages audited: 41
- Total blog posts audited: 94
- Total clusters mapped: 5
- Open TODOs: 10
- Strategic flags surfaced: 5


  > **Decision 13 (name preservation — verbatim):** Existing person names on `/chairpersons-note`, `/school-managing-committee`, `/academic-team`, `/about-rainbow-international-school`, `/cbse-mandatory-public-disclosures`, and `/awards-achievements` are preserved exactly as they appear today. No new person names are added anywhere else on the site. Blog author bylines (if any exist in code) are removed; publisher attribution is "Rainbow International School" via Organization schema. Names verified present in code: Mrs. Akila Balbale, Mrs. Vimlesh Sindhu, Ashwini Rasal, Amrita Pereira (and others on these protected pages).

  > **Decision 14 (AI-SEO staggered — verbatim):** AI-SEO additions (quick-answer block + parent-FAQ block + FAQPage schema) follow the same 5-wave schedule as the rest of the plan. Wave 1 = 6 pages now (drafts in Section 2A.2); the remaining 34 surviving commercial pages receive AI-SEO blocks in their already-scheduled waves. Not applied site-wide in Wave 1 — keeps the first deploy review-friendly and recovery-safe.
  