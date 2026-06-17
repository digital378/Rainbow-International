const PAGE_TITLES: Record<string, string> = {
  "/": "Best CBSE School in Thane | Nursery to Class 12",
  "/about-rainbow-international-school": "About Us | Rainbow International School Thane",
  "/welcome-to-ris": "Welcome to Rainbow International School",
  "/chairpersons-note": "Chairperson's Note | Rainbow International School",
  "/ris-vision-mission": "Vision & Mission | Rainbow International School",
  "/our-philosophy": "Our Philosophy | Rainbow International School",
  "/pre-primary-school-thane": "Pre-Primary (Nursery–Sr KG) Thane | Rainbow International School",
  "/primary-section": "Primary School in Thane | CBSE Class 1 to 5 | Rainbow International School",
  "/middle-school-section": "Middle School in Thane | CBSE Class 6 to 8 | Rainbow International School",
  "/secondary-section": "Secondary School in Thane | CBSE Class 9 & 10 | Rainbow International School",
  "/senior-secondary-section": "Senior Secondary in Thane | CBSE Class 11 & 12 | Rainbow International School",
  "/amenities": "Campus & Facilities | Rainbow International School Thane",
  "/awards-achievements": "Awards & Achievements | Rainbow International School",
  "/student-achievements": "Student Achievements | Rainbow International School",
  "/safety-security": "Safety & Security | Rainbow International School",
  "/beyond-the-classroom": "Beyond the Classroom | Rainbow International School",
  "/extracurriculars": "Extracurricular Activities | Rainbow International School",
  "/photo-gallery": "Photo Gallery | Rainbow International School",
  "/contact-us": "Contact Us | Rainbow International School",
  "/academic-calendar": "Academic Calendar 2026–27 | Rainbow International School",
  "/blogs": "Blogs | Rainbow International School",
  "/cbse-mandatory-public-disclosures": "CBSE Public Disclosures | Rainbow International School",
  "/school-managing-committee": "School Managing Committee | Rainbow International School",
  "/career": "Careers at Rainbow International School Thane | Teaching & Non-Teaching Jobs",
  "/book-list": "Book List 2026–27 | Rainbow International School",
  "/declaration": "Declaration | Rainbow International School",
  "/virtual-learning": "Virtual Learning | Rainbow International School",
  "/academic-team": "Academic Team | Rainbow International School",
  "/rainbow-preschool-international": "Preschool (Age 1.5–5.5) Thane | Rainbow International School",
  "/privacy-policy-and-cookie-policy": "Privacy Policy & Cookie Policy | Rainbow International School",
  "/term-of-use": "Terms of Use - Rainbow International School",
  "/brand-partners": "Brand Partners | Rainbow International School Thane",
  "/students-leaving-certificate": "Students Leaving Certificate | Rainbow International School",
  "/curriculum": "Curriculum | Rainbow International School",
  "/application-form": "Application Form 2026–27 | Rainbow International School Thane",
  "/google-school-2025-26": "Google School 2025–26 | Rainbow International School",
  "/meta-school-2025-26": "Meta School 2025–26 | Rainbow International School",
  "/faqs": "FAQs — Admissions, Fees, Academics & More | Rainbow International School",
  "/fee-structure": "Fee Structure 2026-27 | Rainbow International School Thane",
  "/testimonials": "Parent Testimonials & Reviews | Rainbow International School Thane",
  "/schedule-appointment": "Schedule an Appointment | Rainbow International School",
  "/school-readiness-quiz": "School Readiness Quiz — Is My Child Ready for Grade 1? | Rainbow International School",
  "/thank-you": "Thank You for Your Enquiry | Rainbow International School",
  "/top-schools-in-thane": "Top 10 Schools in Thane (2026) — Best CBSE, ICSE & International Schools | Rainbow International School",
  "/school-near-brahmand-thane": "Best School Near Brahmand Thane — CBSE Nursery to Class 12 | Rainbow International School",
  "/school-near-ghodbunder-road-thane": "Best School Near Ghodbunder Road Thane — CBSE K–12 | Rainbow International School",
  "/school-near-manpada-thane": "Best School Near Manpada Thane — CBSE Nursery to Class 12 | Rainbow International School",
  "/admissions": "Admissions Open 2026–27 | CBSE School in Thane | Rainbow International School",
  "/rps-sales": "Rainbow Preschool | Rainbow International School",
  "/sales": "Admissions | Rainbow International School",
};

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function injectPageTitle(html: string, reqPath: string): string {
  const basePath = (reqPath.split("?")[0].replace(/\/$/, "") || "/");
  const title = PAGE_TITLES[basePath];
  if (!title) return html;
  const safe = escHtml(title);
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${safe}</title>`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,  `$1${safe}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,  `$1${safe}$2`);
}
