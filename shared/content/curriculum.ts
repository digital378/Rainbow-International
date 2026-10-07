import { HOME_CONTACT } from "./home";

export const CURRICULUM_SEO = {
  title: "CBSE Curriculum, KG to Class 12 | Rainbow International School, Thane",
  description:
    "CBSE curriculum at Rainbow International School, Thane West: Jr KG to Class 12, Spanish from KG to Grade 8, and Science, Commerce and Humanities in Class 11 and 12.",
  keywords:
    "CBSE curriculum Thane West, CBSE subjects Class 1 to 10 Thane, CBSE streams Class 11 Thane, Rainbow International School curriculum",
  canonical: "https://rainbowinternationalschool.in/curriculum",
  homeUrl: "https://rainbowinternationalschool.in/",
  crumb: "Curriculum",
  homeCrumb: "Home",
};

export const CURRICULUM_BANNER = {
  title: "CBSE Curriculum",
  subtitle: "A balanced, future-ready CBSE curriculum from KG to Class 12.",
};

export const CURRICULUM_LINKS = {
  cbse: "https://cbseacademic.nic.in//curriculum_2024.html",
  stages: [
    { label: "Pre-Primary", href: "/pre-primary-school-thane" },
    { label: "Primary (Class 1–5)", href: "/primary-section" },
    { label: "Middle School (Class 6–8)", href: "/middle-school-section" },
    { label: "Secondary (Class 9–10)", href: "/secondary-section" },
    { label: "Senior Secondary (Class 11–12)", href: "/senior-secondary-section" },
  ],
};

export const CURRICULUM_FRAMEWORK = {
  heading: "Our Curriculum Framework",
  introBeforeBold:
    "Rainbow International School follows the ",
  introBold: "CBSE (Central Board of Secondary Education)",
  introAfterBold:
    " curriculum — renowned for its academic rigour, balanced approach and student-centric philosophy.",
  paragraphs: [
    "Our curriculum is designed to develop the whole child — building academic excellence alongside creative, physical, social and emotional competencies. We ensure every student at RIS has the skills, knowledge and values to thrive in an evolving world.",
    "CBSE's National Curriculum Framework emphasises critical thinking, problem-solving, and the application of knowledge — principles that are embedded in every classroom at Rainbow.",
  ],
  stageLinksLead: "See each stage: ",
  cbseLinkLabel: "View CBSE Curriculum 2024",
};

export const CURRICULUM_HIGHLIGHT = {
  title: "CBSE National Curriculum Framework 2024",
  description:
    "Access the official CBSE curriculum document for all classes — the same framework our school follows.",
  linkLabel: "Visit CBSE Academic Website",
};

export const CURRICULUM_PILLARS = {
  heading: "Curriculum Pillars",
  subtitle: "The four dimensions of learning at Rainbow International School",
  items: [
    {
      title: "Scholastic Areas",
      description:
        "Core subjects following CBSE guidelines — Languages, Mathematics, Science, Social Science — building foundational knowledge and analytical thinking.",
    },
    {
      title: "Co-Scholastic Areas",
      description:
        "Work education, art education, health & physical education, and discipline — nurturing creativity, wellness and character alongside academics.",
    },
    {
      title: "Life Skills",
      description:
        "Thinking skills, social skills and emotional skills woven into daily learning — equipping students for real-world challenges beyond the classroom.",
    },
    {
      title: "Values & Attitude",
      description:
        "Encouraging positive national identity, respect for diversity, and a sense of global citizenship — building tomorrow's responsible leaders today.",
    },
  ],
};

export interface CurriculumStream {
  name: string;
  subjects: string[];
}

export interface CurriculumStage {
  label: string;
  grades: string;
  tagline: string;
  focus: string[];
  subjects?: string[];
  streams?: CurriculumStream[];
  streamNote?: string;
}

export const CURRICULUM_STAGE_SECTION = {
  heading: "Stage-wise Curriculum",
  subtitle: "Subjects, focus areas and learning outcomes at every stage of schooling",
  focusLabel: "Key Focus Areas",
  streamsLabel: "Streams & Subjects",
  subjectsLabel: "Subjects Offered",
};

export const CURRICULUM_STAGES: CurriculumStage[] = [
  {
    label: "Pre-Primary",
    grades: "Jr. KG · Sr. KG",
    tagline: "Learning through play, exploration and joy",
    focus: [
      "Play-based and activity-based learning",
      "Early literacy — phonics, storytelling, rhymes",
      "Early numeracy — counting, shapes, patterns",
      "Social skills — sharing, cooperation, communication",
      "Sensory and motor skill development",
      "Introduction to environment awareness",
      "Introduction to Spanish",
    ],
    subjects: [
      "English",
      "Hindi / Marathi",
      "EVS",
      "Maths Readiness",
      "Art & Craft",
      "Music & Movement",
      "Physical Education",
    ],
  },
  {
    label: "Primary",
    grades: "Class 1 – 5",
    tagline: "Building strong foundations across all domains",
    focus: [
      "CBSE-aligned scholastic subjects with activity-based teaching",
      "Balanced scholastic and co-scholastic development",
      "Concept-based Mathematics and Science",
      "Language proficiency in English and Hindi",
      "Introduction to Computer education",
      "Creative expression through arts and sports",
      "Spanish language classes",
    ],
    subjects: [
      "English",
      "Hindi",
      "Mathematics",
      "Environmental Science (EVS)",
      "General Knowledge",
      "Computer Science",
      "Art & Craft",
      "Physical Education",
    ],
  },
  {
    label: "Middle School",
    grades: "Class 6 – 8",
    tagline: "Deepening knowledge and nurturing curiosity",
    focus: [
      "In-depth subject study with critical thinking emphasis",
      "Science divided into Physics, Chemistry and Biology concepts",
      "Project-based and experiential learning activities",
      "Language skills: reading, writing, comprehension",
      "Introduction to Social Science: History, Geography, Civics, Economics",
      "SUPW and co-curricular integration",
      "Spanish up to Grade 8",
    ],
    subjects: [
      "English",
      "Hindi / Sanskrit",
      "Mathematics",
      "Science",
      "Social Science",
      "Computer Applications",
      "Art Education",
      "Health & Physical Education",
    ],
  },
  {
    label: "Secondary",
    grades: "Class 9 – 10",
    tagline: "Board-readiness with conceptual rigour",
    focus: [
      "Structured CBSE Board preparation (Class 10)",
      "Conceptual clarity through diagnostic and formative assessments",
      "Subject-specific labs: Science, Computer, Language",
    ],
    subjects: [
      "English (Core)",
      "Hindi / Sanskrit",
      "Mathematics (Standard)",
      "Science",
      "Social Science",
      "Information Technology / Computer Applications",
    ],
  },
  {
    label: "Senior Secondary",
    grades: "Class 11 – 12",
    tagline: "Stream-focused learning with career clarity",
    streams: [
      {
        name: "Science",
        subjects: [
          "Physics",
          "Chemistry",
          "Biology / Mathematics / Computer Science",
          "English Core",
          "Physical Education / Informatics Practices",
        ],
      },
      {
        name: "Commerce",
        subjects: [
          "Accountancy",
          "Business Studies",
          "Economics",
          "English Core",
          "Mathematics / Informatics Practices",
        ],
      },
      {
        name: "Humanities",
        subjects: [
          "History",
          "Political Science",
          "Geography / Psychology / Sociology",
          "English Core",
          "Economics / Legal Studies",
        ],
      },
    ],
    streamNote: "Subject combinations for each batch are confirmed by the admissions team.",
    focus: [
      "CBSE Class 12 Board examination preparation",
      "Experiential and project-based learning",
    ],
  },
];

export const CURRICULUM_ASSESSMENT = {
  heading: "Assessment Framework",
  subtitle: "How we evaluate and support student growth at Rainbow International School",
  items: [
    {
      title: "Formative Assessment",
      description:
        "Ongoing class activities, assignments, projects, oral assessment and quizzes that track progress throughout the term.",
    },
    {
      title: "Summative Assessment",
      description:
        "Term-end examinations aligned to CBSE guidelines that evaluate cumulative learning and subject mastery.",
    },
    {
      title: "Portfolio & Projects",
      description:
        "Long-term individual and group projects that demonstrate applied thinking, research skills and creativity.",
    },
    {
      title: "Co-Scholastic Grading",
      description:
        "Structured grading of extracurricular participation, discipline, health & physical education as per CBSE norms.",
    },
  ],
};

export const CURRICULUM_METHODOLOGY = {
  heading: "Teaching Methodology",
  subtitle:
    "Innovative approaches that make learning engaging, meaningful and effective",
  items: [
    {
      title: "Activity-Based Learning",
      description:
        "Hands-on experiments, manipulatives and creative tasks make abstract concepts tangible and memorable.",
    },
    {
      title: "Experiential Learning",
      description:
        "Field visits, labs, demonstrations and real-world projects bridge classroom theory with practical experience.",
    },
    {
      title: "Technology Integration",
      description:
        "Digital tools and audio-visual aids support classroom teaching and engagement.",
    },
    {
      title: "Collaborative Learning",
      description:
        "Group work, debates and presentations build communication, teamwork and critical thinking skills.",
    },
    {
      title: "Differentiated Instruction",
      description:
        "Teachers adapt methods and pace to suit each learner's strengths, ensuring no child is left behind.",
    },
    {
      title: "Assessment for Learning",
      description:
        "Regular diagnostic tests inform teaching adjustments so instruction stays responsive to student needs.",
    },
  ],
};

export const CURRICULUM_REFERENCE = {
  eyebrow: "Official Reference",
  title: "CBSE Curriculum 2024",
  description:
    "Rainbow International School strictly follows the CBSE National Curriculum Framework. For the complete and most up-to-date syllabus, subject codes, and curriculum guidelines, please refer to the official CBSE Academic website.",
  linkLabel: "Open CBSE Curriculum",
};

export const CURRICULUM_CTA = {
  title: "Admissions are Open for the Academic Year 2027–28",
  linkLabel: "Enquire Now",
};

export const CURRICULUM_IMAGE_ALT = "Rainbow International School curriculum";
export const CURRICULUM_CONTACT = {
  title: HOME_CONTACT.title,
  phone: HOME_CONTACT.phone,
  phoneHref: HOME_CONTACT.phoneHref,
};

export const CURRICULUM_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${CURRICULUM_SEO.canonical}#webpage`,
  name: CURRICULUM_SEO.title,
  description: CURRICULUM_SEO.description,
  url: CURRICULUM_SEO.canonical,
  about: { "@id": "https://rainbowinternationalschool.in/#organization" },
};
