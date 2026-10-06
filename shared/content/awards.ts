import { HOME_CONTACT } from "./home";

export const AWARDS_SEO = {
  title: "Awards & Achievements | Rainbow International School, Thane",
  description: "Rainbow International School, Thane West: Best Dynamic School 2026 (Maharashtra Educators Summit), Excellence in CBSE Education (India Today, 2017), FIT INDIA School and more.",
  keywords: "Rainbow International School awards, CBSE school awards Thane, school achievements Thane West, Rainbow International School recognition",
  canonical: "https://rainbowinternationalschool.in/awards-achievements",
};

export const AWARDS_BANNER = {
  title: "Awards & Achievements",
  breadcrumb: "Awards & Achievements",
};

export const AWARDS_INTRO = {
  label: "Our Achievements",
  paragraph: "Awards and recognition received by Rainbow International School, Brahmand, Thane West, and Rainbow Preschool International. Our most recent: Best Dynamic School 2026 at the Maharashtra Educators Summit.",
};

const CDN = "https://rainbowinternationalschool.in/wp-content/uploads";

export const AWARDS = [
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-world-education-summit-mumbai.jpg`,
    title: "15th World Education Summit in Mumbai!",
    description: "Won awards in the following categories:\n1) Innovation in Campus Infrastructure – Rainbow International School\n2) Profound Technology usage in Early Childhood Teaching – Rainbow Preschool International.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-featured-knowledge-review-magazine-international-school-ad.jpg`,
    title: "Featured in Knowledge Review Magazine",
    description: "Yet another Milestone achieved by Rainbow Preschool International. It's a Proud moment for Rainbow Preschools to get featured in 'The 10 Best Preschools in India' in The Knowledge Review Magazine.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-hundred-percent-results-international-school-ad.jpg`,
    title: "100% Result: Rainbow's First Batch (2018-19)",
    description: "100% Result: The Times Of India At Rainbow International School, we feel really proud to announce 100% Result of our 10th standard students for the academic year 2018-19. As per The Times Of India, Rainbow International.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-1.jpg`,
    title: "Best Preschool & Secondary School in Thane",
    description: "Rainbow awarded as Best Preschool and Secondary School in Thane. It gives us a great sense of pride that Rainbow Preschools and Rainbow International School have been awarded 'The Best Preschool and Secondary School in Thane'.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-awards-excellence-international-school-ad.jpg`,
    title: "Rainbow Wins Award For Excellence",
    description: "It gives us immense pleasure to announce that we were awarded 'Excellence in Preschool Education' and 'Excellence in CBSE Education' in Thane by India Today on Saturday, 7th October 2017.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-thane-fit-india.jpg`,
    title: "We are a FIT INDIA School",
    description: "FIT INDIA Certificate of Recognition Rainbow International School proud to announce that our declaration has been approved by the Ministry of Youth Affairs and Sports and we are a FIT INDIA School!",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-thane-awards-swach.jpg`,
    title: "Swachatam Vidyalay Award",
    description: "Swachh Survekshan League – 2020 Rainbow Preschools is felicitated by Thane Municipal Corporation for its cleanliness and hygiene on campus.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-akila-balbale-thane-icon.jpg`,
    title: "'Icon of Thane' Award",
    description: "Its indeed a proud moment to share with all of you our Chairperson – Hon. Akila Balbale has been presented with an award by Economic Times for 'Icon of Thane', for contributing exemplary education services in Thane city. A commendable service to our society.",
  },
  {
    image: `${CDN}/2022/09/rainbow-international-school-awards-raghvi-ramanujan-international-school-ad.jpg`,
    title: "An All Rounder Kid Raghvi Ramanujan",
    description: "An All Rounder Kid Raghvi Ramanujan Displays Exceptional Talent in Swimming. 8-year-old Raghvi Ramanujan is an all rounder. She has also developed a niche interest – swimming! She has just bagged her 101st medal at the Rotary Club Swimming Competition held at Thane.",
  },
  {
    image: `${CDN}/2022/09/Mask-group.png`,
    title: "First Prize in Bharat Vikas Parishad QUIZ COMPETITION",
    description: "Rainbow International School won the First Prize in Bharat Vikas Parishad QUIZ COMPETITION for the Senior Category at the Branch Level.",
  },
  {
    image: `${CDN}/2022/09/Mask-group-1.png`,
    title: "48th JUNIOR NATIONAL AQUATIC CHAMPIONSHIP",
    description: "850 participants from all over India participated in the 48th JUNIOR AQUATIC NATIONAL CHAMPIONSHIP in Bhubaneswar. Maharashtra was represented by Rainbow International School student RAGHVI RAMANUJAN, who is the only medallist from Thane City with two silver and three bronze medals.",
  },
  {
    image: `${CDN}/2022/09/Mask-group-2.png`,
    title: "Big win for Rainbow at SGEF 2022!",
    description: "We are elated to have won the following awards at @scoonewsindia Global Educators Fest 2022:\n• Emerging Pre-School Chain of the Year – Editor's Choice: Rainbow Preschool International\n• Emerging School of the Year, West India Division: Rainbow International School\nOur respected Chairperson, Mrs. Akila Balbale received the awards along with the Director of Academics, Mrs. Vimlesh Sindhu.",
  },
  {
    image: `${CDN}/2022/10/Mask-group.png`,
    title: "Going Plastic Free Drive",
    description: "Under the 'Going Plastic Free Drive,' Samarth Bharat Vyaspeeth has set the following goals with the intention of establishing a plastic-free environment. Rainbow International School has since 2019 participated in the 'Going Plastic Free Drive'.",
  },
];

export const AWARDS_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      url: AWARDS_SEO.canonical,
      name: AWARDS_SEO.title,
      about: { "@id": "https://rainbowinternationalschool.in/#organization" },
      mainEntity: { "@id": `${AWARDS_SEO.canonical}#awards` },
    },
    {
      "@type": "ItemList",
      "@id": `${AWARDS_SEO.canonical}#awards`,
      itemListElement: AWARDS.map((award, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: award.title,
        url: AWARDS_SEO.canonical,
      })),
    },
  ],
};

// Reuse the existing visitor contact introduction without changing its form.
export const AWARDS_CONTACT = HOME_CONTACT;
