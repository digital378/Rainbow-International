import { useState } from "react";

// Map each blog category to a local AI-generated thumbnail
const CAT_IMAGE: Record<string, string> = {
  "CBSE School":        "/blog/cat-school.png",
  "About Rainbow":      "/blog/cat-school.png",
  "School Selection":   "/blog/cat-school.png",
  "School":             "/blog/cat-school.png",
  "Academics":          "/blog/cat-education.png",
  "Education":          "/blog/cat-education.png",
  "Parenting":          "/blog/cat-parenting.png",
  "Student Health":     "/blog/cat-health.png",
  "Student Wellbeing":  "/blog/cat-health.png",
  "Student Wellness":   "/blog/cat-health.png",
  "Sports":             "/blog/cat-sports.png",
  "Beyond the Classroom": "/blog/cat-sports.png",
  "Study Skills":       "/blog/cat-study.png",
  "Study Tips":         "/blog/cat-study.png",
  "Student Development":"/blog/cat-development.png",
  "Student Life":       "/blog/cat-development.png",
  "Early Learning":     "/blog/cat-early.png",
  "Pre-Primary":        "/blog/cat-early.png",
  "Awards":             "/blog/cat-awards.png",
  "Events":             "/blog/cat-events.png",
  "Admissions":         "/blog/cat-school.png",
  "General":            "/blog/cat-education.png",
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
