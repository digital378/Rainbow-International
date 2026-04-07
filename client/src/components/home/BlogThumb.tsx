import { useState } from "react";

// Map each blog category to a real school CDN image as fallback
const CAT_IMAGE: Record<string, string> = {
  "CBSE School":        "https://rainbowinternationalschool.in/wp-content/uploads/2025/12/how-cbse-schools-can-foster-entrepreneurship-and-innovation-among-students.jpg",
  "About Rainbow":      "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/benefits-rainbow-international-school.jpg",
  "School Selection":   "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/tips-choose-cbse-school-mumbai.jpg",
  "School":             "https://rainbowinternationalschool.in/wp-content/uploads/2025/12/how-cbse-schools-can-foster-entrepreneurship-and-innovation-among-students.jpg",
  "Academics":          "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/why-maths-matters-student-life.jpg",
  "Education":          "https://rainbowinternationalschool.in/wp-content/uploads/2025/03/problem-solving-activities-life-skills.jpg",
  "Parenting":          "https://rainbowinternationalschool.in/wp-content/uploads/2025/02/role-of-parents-in-education.jpg",
  "Student Health":     "https://rainbowinternationalschool.in/wp-content/uploads/2025/02/nutritional-requirements-teenagers.jpg",
  "Student Wellbeing":  "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/benefits-meditation-students.jpg",
  "Student Wellness":   "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/benefits-meditation-students.jpg",
  "Sports":             "https://rainbowinternationalschool.in/wp-content/uploads/coaches-willpower.jpg",
  "Beyond the Classroom": "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/importance-sports-students-teamwork.jpg",
  "Study Skills":       "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/how-to-learn-boring-subjects.jpg",
  "Study Tips":         "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/how-to-learn-boring-subjects.jpg",
  "Student Development":"https://rainbowinternationalschool.in/wp-content/uploads/2025/02/teen-entrepreneurship.jpg",
  "Student Life":       "https://rainbowinternationalschool.in/wp-content/uploads/2025/03/riddles-for-kids.jpg",
  "Early Learning":     "https://rainbowinternationalschool.in/wp-content/uploads/2025/02/fine-motor-skills-at-home.jpg",
  "Pre-Primary":        "https://rainbowinternationalschool.in/wp-content/uploads/2025/02/fine-motor-skills-at-home.jpg",
  "Awards":             "https://rainbowinternationalschool.in/wp-content/uploads/2025/02/leading-school-year-thane.jpg",
  "Events":             "https://rainbowinternationalschool.in/wp-content/uploads/2025/02/earth-day-school.jpg",
  "Admissions":         "https://rainbowinternationalschool.in/wp-content/uploads/2025/01/age-criteria-international-school-admission.jpg",
  "Safety & Security":  "https://rainbowinternationalschool.in/wp-content/uploads/school-bus-technology.jpg",
  "Student Achievements":"https://rainbowinternationalschool.in/wp-content/uploads/raghvi-ramanujan-swimming.jpg",
  "General":            "https://rainbowinternationalschool.in/wp-content/uploads/2025/03/problem-solving-activities-life-skills.jpg",
};

interface BlogThumbProps {
  src?: string | null;
  alt: string;
  cat: string;
}

export function BlogThumb({ src, alt, cat }: BlogThumbProps) {
  // Try the provided src first; fall back to category image; fall back to gradient
  const catFallback = CAT_IMAGE[cat] ?? "/blog/cat-education.png";
  const [primary, setPrimary] = useState(src || catFallback);
  const [usedCatFallback, setUsedCatFallback] = useState(!src);
  const [finalFail, setFinalFail] = useState(false);

  const handleError = () => {
    if (!usedCatFallback) {
      // First failure: switch to category image
      setPrimary(catFallback);
      setUsedCatFallback(true);
    } else {
      // Second failure: show gradient placeholder
      setFinalFail(true);
    }
  };

  if (finalFail) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center"
        style={{ background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 100%)" }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fbbf24" }}
        >
          {cat}
        </span>
        <span className="text-white font-black text-sm leading-tight">
          Rainbow International School
        </span>
        <span className="text-white/50 text-xs">Thane, Maharashtra</span>
      </div>
    );
  }

  return (
    <img
      src={primary}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
