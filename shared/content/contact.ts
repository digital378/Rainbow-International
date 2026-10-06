export const CONTACT_SEO = {
  title: "Contact Rainbow International School, Brahmand, Thane West",
  description: "Cosmos Arcade, Brahmand Phase 4, Thane West 400607. Admissions: +91 82915 68972, admin@rainbowinternationalschool.in. Mon to Sat, 9 am to 6 pm.",
  keywords: "Rainbow International School contact number, Rainbow International School address, school in Brahmand contact, Rainbow International School Thane phone",
};

export const CONTACT_BANNER = {
  title: "Contact Us",
  subtitle: "Admissions, campus visits and general queries — Monday to Saturday, 9 am to 6 pm.",
};

export const CONTACT_CARDS = [
  { label: "Phone", lines: ["+91 82915 68972"], href: "tel:+918291568972", testId: "link-contact-phone" },
  { label: "Email", lines: ["admin@rainbowinternationalschool.in"], href: "mailto:admin@rainbowinternationalschool.in", testId: "link-contact-email" },
  { label: "Working Hours", lines: ["Monday – Saturday", "9 am – 6 pm"], href: null, testId: "link-contact-working hours" },
  { label: "Address", lines: ["Cosmos Arcade, Brahmand Phase 4", "Thane West, Maharashtra 400607"], href: "https://maps.google.com/?q=Rainbow+International+School+Thane", testId: "link-contact-locations" },
];

export const CONTACT_TOUR = {
  eyebrow: "Visit Us",
  heading: "Book a Campus Tour",
  introStrong: "We'd love to welcome you to Rainbow International School!",
  introBeforePhone: "Please call us at",
  introAfterPhone: "to schedule your visit, or fill the form and our Admission Counsellor will connect with you.",
};

export const CONTACT_FORM = {
  parentLabel: "Parent Name *",
  parentPlaceholder: "Enter your name",
  phoneLabel: "Phone Number *",
  phonePlaceholder: "10-digit mobile number",
  emailLabel: "Email",
  emailPlaceholder: "Email address (optional)",
  childLabel: "Child's Name",
  childPlaceholder: "Enter child's name",
  programmeLabel: "Programme *",
  programmePlaceholder: "Select programme",
  programmes: [
    "Jr. KG", "Sr. KG",
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11 – Science", "Class 11 – Commerce", "Class 11 – Humanities",
    "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
  ],
  messageLabel: "Message (Optional)",
  messagePlaceholder: "Any questions or specific requirements?",
  consent: "I confirm the details above are correct and authorize Rainbow International School and its representatives to contact me with updates via Email, SMS, WhatsApp and Call. This will override DND/NDNC registry.",
  submitting: "Submitting...",
  submit: "Request Callback",
  whatsapp: "Chat on WhatsApp",
  thankYouHeading: "Thank You!",
  thankYou: "We've received your request. Our admissions team will contact you during office hours (Mon–Sat, 9 am–6 pm).",
  anotherRequest: "Submit Another Request",
};

export const CONTACT_QUOTE = {
  text: '"The secret of getting ahead is getting started."',
  attribution: "— Mark Twain",
};

export const CONTACT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Rainbow International School",
  description: CONTACT_SEO.description,
  url: "https://rainbowinternationalschool.in/contact-us",
  about: { "@id": "https://rainbowinternationalschool.in/#organization" },
};
