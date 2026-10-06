import { HOME_CONTACT } from "./home";

export type AboutTextPart = { text: string; strong?: boolean; href?: string };

export const ABOUT_SEO = {
  title: "About Rainbow International School, Thane | CBSE since 2009",
  description: "Rainbow International School, Brahmand, Thane West: a CBSE school since April 2009, KG to Class 12, with a 3.5-acre campus and 3,000+ students across two shifts.",
  keywords: "about Rainbow International School, CBSE school in Thane West, CBSE school Brahmand Thane, Rainbow International School history, K-12 CBSE school Thane",
  crumb: "About Us",
};

export const ABOUT_BANNER = {
  title: "About Rainbow International School",
  subtitle: "CBSE school in Brahmand, Thane West, since April 2009",
};

export const ABOUT_WELCOME = {
  eyebrow: "About the School",
  heading: "Welcome to Rainbow International School",
  paragraphs: [
    [
      { text: "Founded in " }, { text: "April 2009", strong: true },
      { text: ", Rainbow International School has touched the lives of more than 1 lakh students since then." },
    ],
    [
      { text: "Our campus in Brahmand, Thane West spans " }, { text: "3.5 acres", strong: true },
      { text: ", and more than " }, { text: "3,000 students", strong: true },
      { text: " are enrolled across two shifts." },
    ],
    [{ text: "In addition to being synonymous with quality education, we at Rainbow International School are committed to all-around growth in our students. Rainbow allows its students to explore human excellence through competence, conscience, and compassion." }],
    [{ text: "Our teaching methods integrate comfort, colors, and technology within classrooms, which enables our students not only to learn more effectively but also quickly." }],
    [
      { text: "We follow the CBSE curriculum from Kindergarten to Class 12 (CBSE Affiliation No. 1130661, School Code 30562): " },
      { text: "Primary, Class 1 to 5", href: "/primary-section" }, { text: ", " },
      { text: "Middle School, Class 6 to 8", href: "/middle-school-section" }, { text: ", " },
      { text: "Secondary, Class 9 and 10", href: "/secondary-section" }, { text: " and " },
      { text: "Senior Secondary, Class 11 and 12", href: "/senior-secondary-section" },
      { text: " with Science, Commerce and Humanities. See " },
      { text: "Admissions 2027-28", href: "/admissions" }, { text: " or " },
      { text: "contact us", href: "/contact-us" }, { text: "." },
    ],
  ] satisfies AboutTextPart[][],
};

export const ABOUT_IMAGE_ALTS = [
  "Rainbow International School — Main entrance with Rainbow logo",
  "Rainbow International School — Campus building and courtyard",
  "Students doing experiments in science lab",
  "Primary students enjoying time on the green turf",
  "Swimming pool at Rainbow International School",
  "Monument on the Rainbow International School campus",
];

export const ABOUT_LEARNING = {
  heading: "Our Learning Spaces",
  academicHeading: "Academic Spaces",
  sportsHeading: "Sports Spaces",
  academic: [
    "State-of-the-art Laboratories", "Library & Reading Room", "Multipurpose Hall",
    "Music Room", "Art & Craft Room", "Amphitheater", "Organic Farming Area", "Infirmary",
  ],
  sports: [
    "Football Field", "Adventure Sports Field", "Skating Rink", "Swimming Pool",
    "Multipurpose Courts", "Cricket Ground", "Indoor Sports Facility",
  ],
};

export const ABOUT_STATS = {
  heading: "Rainbow at a Glance",
  items: [
    { num: "2009", label: "Founded" },
    { num: "1 Lakh+", label: "Students Impacted" },
    { num: "3.5 Acres", label: "Campus Area" },
    { num: "3,000+", label: "Current Students" },
  ],
};

export const ABOUT_CHAIRPERSON = {
  eyebrow: "Leadership",
  heading: "Chairperson's Note",
  role: "Chairperson",
  school: "Rainbow International School",
  quoteMark: '"',
  paragraphs: [
    [{ text: "Dear Students, Parents, and Well-wishers," }],
    [
      { text: "It is with immense pride and a heart full of gratitude that I welcome you to " },
      { text: "Rainbow International School", strong: true },
      { text: " — a place where every child's story matters, and where the journey of learning is celebrated every single day." },
    ],
    [
      { text: "When we founded Rainbow International School in " }, { text: "April 2009", strong: true },
      { text: ", our vision was simple yet profound: to build an institution that nurtures not just academic brilliance, but also the values of empathy, perseverance, and global citizenship. Over the years, we have grown into a community of over " },
      { text: "3,000 students", strong: true },
      { text: " — each one a testament to what is possible when passionate educators, committed families, and curious young minds come together." },
    ],
    [{ text: "Education, in its truest sense, is about preparing children for life — not just examinations. At Rainbow, we believe that every child is uniquely gifted, and it is our responsibility to help each one discover, develop, and deploy their gifts in service of the world." }],
    [{ text: "I invite you to experience the Rainbow difference — where tradition meets innovation, and every child dares to dream." }],
  ] satisfies AboutTextPart[][],
  signoff: "With warm regards,",
  name: "Mrs. Akila Balbale",
};

export const ABOUT_PURPOSE = {
  eyebrow: "Our Purpose",
  heading: "RIS Vision & Mission",
  visionHeading: "Our Vision",
  vision: [
    { text: "To be a " }, { text: "globally respected centre of learning", strong: true },
    { text: " that empowers every student to discover their unique potential, embrace lifelong learning, and contribute meaningfully to society — grounded in strong values and an unwavering commitment to excellence." },
  ] satisfies AboutTextPart[],
  missionHeading: "Our Mission",
  mission: [
    "Deliver CBSE education that equips students for a rapidly changing world",
    "Foster intellectual curiosity, critical thinking, and a lifelong love of learning",
    "Nurture physical, emotional, and social development alongside academic excellence",
    "Build a diverse, inclusive community that celebrates every child's unique potential",
    "Partner with families to create a seamless support system around each student",
  ],
  valuesHeading: "Our Core Values",
  values: ["Integrity", "Empathy", "Excellence", "Innovation", "Inclusion", "Responsibility", "Curiosity", "Resilience"],
};

export const ABOUT_PHILOSOPHY = {
  eyebrow: "How We Think",
  heading: "Our Philosophy",
  intro: "Education is not the filling of a pail, but the lighting of a fire. At Rainbow, we believe every child carries within them a spark — our role is to help it blaze.",
  pillars: [
    { title: "Holistic Learning", desc: "We believe education extends beyond textbooks. Our curriculum integrates academics, arts, sports, and life skills to develop well-rounded individuals." },
    { title: "Values First", desc: "Empathy, integrity, and respect form the foundation of everything we do. We nurture character alongside intellect, preparing students to be compassionate citizens." },
    { title: "Excellence in All", desc: "We set high standards — not just in examinations, but in sports, arts, community service, and personal growth. Every student is encouraged to give their all." },
    { title: "Community & Belonging", desc: "Rainbow is a family. We build an inclusive environment where every child feels seen, celebrated, and supported — by teachers, peers, and parents alike." },
  ],
  quoteBefore: '"We do not teach children what to think. We teach them ',
  quoteStrong: "how",
  quoteAfter: ' to think — with courage, clarity, and compassion."',
  attribution: "— Rainbow International School",
};

// The existing shared contact component is unchanged; its shared copy is reused
// here for the crawler's final section rather than duplicating it.
export const ABOUT_CONTACT = HOME_CONTACT;

export const ABOUT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: "https://rainbowinternationalschool.in/about-rainbow-international-school",
  name: ABOUT_SEO.title,
  about: { "@id": "https://rainbowinternationalschool.in/#organization" },
};
