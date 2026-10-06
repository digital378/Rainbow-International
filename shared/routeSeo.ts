/**
 * Single source of truth for per-route SEO metadata served in the raw HTML.
 *
 * Consumed by:
 *   - server/pageTitles.ts  (injectSeoHead — SPA shell served to browsers)
 *   - server/ssrPages.ts    (bot-SSR pages — description pulled from here)
 *
 * Rules:
 *   - description must be under 155 characters
 *   - never use "Best", "No. 1" or "World-Class" in a description
 *   - crumb is the short name used in the BreadcrumbList JSON-LD
 */

import { buildOrgNode } from "./orgSchema";

export interface RouteSeo {
  description: string;
  crumb: string;
}

export const SITE_ORIGIN = "https://rainbowinternationalschool.in";

export function routeCanonical(basePath: string): string {
  return basePath === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${basePath}`;
}

export const ROUTE_SEO: Record<string, RouteSeo> = {
  "/": {
    description:
      "Rainbow International School is a CBSE school in Thane for KG to Class 12 with academics, sports, safety, transport and holistic learning.",
    crumb: "Home",
  },
  "/about-rainbow-international-school": {
    description:
      "Rainbow International School, founded in 2009, is a CBSE K-12 school in Thane with a 3.5-acre campus and 3000+ students, KG to Class 12.",
    crumb: "About Us",
  },
  "/welcome-to-ris": {
    description:
      "Welcome to Rainbow International School, Thane — a CBSE K-12 school on a 3.5-acre Brahmand campus, nurturing students from KG to Class 12.",
    crumb: "Welcome",
  },
  "/chairpersons-note": {
    description:
      "Read the Chairperson's note on the vision, values and educational approach behind Rainbow International School, Thane.",
    crumb: "Chairperson's Note",
  },
  "/ris-vision-mission": {
    description:
      "Our vision and mission — how Rainbow International School, Thane builds confident, capable and compassionate learners through CBSE education.",
    crumb: "Vision & Mission",
  },
  "/our-philosophy": {
    description:
      "The teaching philosophy of Rainbow International School, Thane — Multiple Intelligence pedagogy, experiential learning and holistic development.",
    crumb: "Our Philosophy",
  },
  "/pre-primary-school-thane": {
    description:
      "Pre-primary school in Thane — Nursery, Jr KG and Sr KG with play-based learning, 100% female staff and CBSE-aligned curriculum. Admissions open.",
    crumb: "Pre-Primary",
  },
  "/primary-section": {
    description:
      "Primary School at Rainbow International School, Thane — CBSE Class 1 to 5 with strong academics, activities, safety and care.",
    crumb: "Primary",
  },
  "/middle-school-section": {
    description:
      "Middle School at Rainbow International School, Thane — CBSE Class 6 to 8 with academics, activities and confidence building.",
    crumb: "Middle School",
  },
  "/secondary-section": {
    description:
      "Secondary School at Rainbow International School, Thane — CBSE Class 9 and 10 with structured board exam preparation.",
    crumb: "Secondary",
  },
  "/senior-secondary-section": {
    description:
      "Senior Secondary at Rainbow International School, Thane — CBSE Class 11 and 12 with Science, Commerce and Humanities streams.",
    crumb: "Senior Secondary",
  },
  "/amenities": {
    description:
      "Campus amenities at Rainbow International School, Thane — smart classrooms, labs, swimming pool, skating rink, amphitheatre, library, organic farm.",
    crumb: "Campus & Facilities",
  },
  "/awards-achievements": {
    description:
      "Awards and recognition of Rainbow International School, Thane — British Council ISA, Google for Education, Fit India and more.",
    crumb: "Awards",
  },
  "/student-achievements": {
    description:
      "Student achievements at Rainbow International School, Thane — academics and national or state level sports in swimming, badminton, skating, chess.",
    crumb: "Student Achievements",
  },
  "/safety-security": {
    description:
      "Safety at Rainbow International School, Thane — 200+ CCTV cameras, card-based entry, infirmary, GPS-tracked buses and trained security.",
    crumb: "Safety & Security",
  },
  "/beyond-the-classroom": {
    description:
      "Beyond the classroom at Rainbow International School, Thane — exhibitions, clubs, educational tours and organic farming for holistic growth.",
    crumb: "Beyond the Classroom",
  },
  "/extracurriculars": {
    description:
      "30+ extracurricular activities at Rainbow International School, Thane — sports, arts, STEM and leadership programmes for every student.",
    crumb: "Extracurriculars",
  },
  "/photo-gallery": {
    description:
      "Photo gallery of Rainbow International School, Thane — campus, events, activities and student life in pictures.",
    crumb: "Photo Gallery",
  },
  "/contact-us": {
    description:
      "Contact Rainbow International School, Thane. Phone +91 82915 68972, email admin@rainbowinternationalschool.in. Cosmos Arcade, Brahmand Phase 4.",
    crumb: "Contact Us",
  },
  "/academic-calendar": {
    description:
      "Academic calendar 2026-27 for Rainbow International School, Thane — term dates, examinations, events and holidays.",
    crumb: "Academic Calendar",
  },
  "/blogs": {
    description:
      "Articles from Rainbow International School, Thane on education, parenting, CBSE, student wellness, admissions and sports.",
    crumb: "Blogs",
  },
  "/cbse-mandatory-public-disclosures": {
    description:
      "CBSE mandatory public disclosures for Rainbow International School, Thane — affiliation 1130661, staff, infrastructure, results, documents.",
    crumb: "CBSE Disclosures",
  },
  "/school-managing-committee": {
    description:
      "School Managing Committee of Rainbow International School, Thane — members, roles and governance details as per CBSE norms.",
    crumb: "Managing Committee",
  },
  "/career": {
    description:
      "Careers at Rainbow International School, Thane — teaching and non-teaching openings at a CBSE K-12 school. Apply online.",
    crumb: "Careers",
  },
  "/book-list": {
    description:
      "Book list 2026-27 for Rainbow International School, Thane — prescribed books and stationery by class, Nursery to Class 12.",
    crumb: "Book List",
  },
  "/declaration": {
    description:
      "Declaration from Rainbow International School, Thane — CBSE affiliation compliance and mandatory public information.",
    crumb: "Declaration",
  },
  "/virtual-learning": {
    description:
      "Virtual learning at Rainbow International School, Thane — online classes, digital resources and continuity of learning.",
    crumb: "Virtual Learning",
  },
  "/academic-team": {
    description:
      "Meet the academic team of Rainbow International School, Thane — 150+ qualified educators across Pre-Primary to Senior Secondary.",
    crumb: "Academic Team",
  },
  "/rainbow-preschool-international": {
    description:
      "Rainbow Preschool International, Thane — preschool for ages 1.5 to 5.5 years with play-based learning and 100% female staff.",
    crumb: "Rainbow Preschool",
  },
  "/privacy-policy-and-cookie-policy": {
    description:
      "Privacy policy and cookie policy of the Rainbow International School, Thane website — what data we collect and how we use it.",
    crumb: "Privacy Policy",
  },
  "/term-of-use": {
    description:
      "Terms of use for the Rainbow International School, Thane website.",
    crumb: "Terms of Use",
  },
  "/brand-partners": {
    description:
      "Brand partners of Rainbow International School, Thane — local businesses offering privileges and discounts to RIS families.",
    crumb: "Brand Partners",
  },
  "/students-leaving-certificate": {
    description:
      "Students Leaving Certificate information for Rainbow International School, Thane — samples and process as per CBSE norms.",
    crumb: "Leaving Certificate",
  },
  "/curriculum": {
    description:
      "CBSE-aligned curriculum at Rainbow International School, Thane — Pre-Primary to Class 12, subjects, streams and teaching methodology.",
    crumb: "Curriculum",
  },
  "/application-form": {
    description:
      "Apply online for admission to Rainbow International School, Thane — 2027-28 applications open for KG to Class 12.",
    crumb: "Application Form",
  },
  "/google-school-2025-26": {
    description:
      "Rainbow International School, Thane — CBSE KG to Class 12. Admissions open for 2027-28. Book a campus visit today.",
    crumb: "Admissions",
  },
  "/meta-school-2025-26": {
    description:
      "Rainbow International School, Thane — CBSE K-12 school in Brahmand. Admissions open 2027-28. Enquire online or book a visit.",
    crumb: "Admissions",
  },
  "/faqs": {
    description:
      "Answers to 30+ frequently asked questions about Rainbow International School, Thane — admissions, fees, curriculum, safety, transport, facilities.",
    crumb: "FAQs",
  },
  "/fee-structure": {
    description:
      "Fee structure 2026-27 for Rainbow International School, Thane — KG to Class 12 CBSE. Transparent fees, sibling concessions, quarterly payment.",
    crumb: "Fee Structure",
  },
  "/testimonials": {
    description:
      "Parent testimonials and reviews for Rainbow International School, Thane — rated 4.8 out of 5 by parents across all sections.",
    crumb: "Testimonials",
  },
  "/schedule-appointment": {
    description:
      "Book a campus visit or appointment with the Rainbow International School, Thane admissions team.",
    crumb: "Schedule Appointment",
  },
  "/school-readiness-quiz": {
    description:
      "Free 10-question school readiness quiz — find out if your child is prepared for Grade 1 at Rainbow International School, Thane.",
    crumb: "Readiness Quiz",
  },
  "/thank-you": {
    description:
      "Thank you for your enquiry to Rainbow International School, Thane. Our admissions team will contact you shortly.",
    crumb: "Thank You",
  },
  "/top-schools-in-thane": {
    description:
      "Compare the top 10 schools in Thane for 2026 — ratings, reviews and highlights for CBSE, ICSE and international schools.",
    crumb: "Top Schools in Thane",
  },
  "/school-near-brahmand-thane": {
    description:
      "Rainbow International School — CBSE school near Brahmand, Thane, located in Brahmand Phase 4. KG to Class 12 on a 3.5-acre campus.",
    crumb: "School Near Brahmand",
  },
  "/school-near-ghodbunder-road-thane": {
    description:
      "Rainbow International School — CBSE school near Ghodbunder Road, Thane, 8 min from GB Road. Bus routes across Patlipada, Waghbil, Kavesar.",
    crumb: "School Near Ghodbunder Road",
  },
  "/school-near-manpada-thane": {
    description:
      "Rainbow International School — CBSE school near Manpada, Thane, 5 min from Manpada Junction. KG to Class 12 on a 3.5-acre campus.",
    crumb: "School Near Manpada",
  },
  "/admissions": {
    description:
      "Admissions open 2027-28 at Rainbow International School, a CBSE school in Thane for KG to Class 12. Enquire or book a campus visit.",
    crumb: "Admissions",
  },
};

/** BreadcrumbList JSON-LD — Home > current page. */
export function buildBreadcrumbLd(basePath: string, crumb: string) {
  const itemListElement: Record<string, unknown>[] = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
  ];
  if (basePath !== "/") {
    itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: crumb,
      item: routeCanonical(basePath),
    });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

/**
 * EducationalOrganization schema for the homepage — identical in shape to
 * what the bot-SSR homepage (server/ssrHome.ts) emits.
 */
export const HOME_ORG_LD = buildOrgNode();
