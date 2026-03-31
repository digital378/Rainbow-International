import { Monitor, Music, Heart, Leaf, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const tabs = [
  {
    id: "tech",
    label: "Technology",
    icon: Monitor,
    title: "Technology in Every Classroom",
    description: "E-learning tools for enhanced learning, memory, and future-readiness.",
    points: [
      "Smart boards in every classroom",
      "Digital and e-learning resources",
      "Technology-aided CBSE curriculum",
      "Enhanced memory and retention tools",
    ],
    accent: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    id: "extra",
    label: "Extracurricular",
    icon: Music,
    title: "Rich Extracurricular Life",
    description: "Annual cultural activities, clubs, exhibitions, music, art, organic farming and much more.",
    points: [
      "Annual cultural and sports events",
      "Subject clubs and exhibitions",
      "Music, art & creative programmes",
      "Organic farming and eco projects",
    ],
    accent: "#f97316",
    bg: "#fff7ed",
  },
  {
    id: "personality",
    label: "Personality",
    icon: Heart,
    title: "Personality Development",
    description: "Being mindful of etiquette, teamwork, and self-confidence every single day.",
    points: [
      "Etiquette and social skills training",
      "Collaborative team-building projects",
      "Public speaking & self-confidence",
      "Leadership & responsibility",
    ],
    accent: "#a855f7",
    bg: "#faf5ff",
  },
  {
    id: "sensitivity",
    label: "Sensitivity",
    icon: Leaf,
    title: "Philosophy of Sensitivity",
    description: "Incorporating social and environmental awareness into daily learning.",
    points: [
      "Social awareness programmes",
      "Environmental responsibility",
      "Empathy and compassion building",
      "Anti-bullying and inclusion initiatives",
    ],
    accent: "#22c55e",
    bg: "#f0fdf4",
  },
];

export function Pedagogy() {
  const [active, setActive] = useState("tech");
  const current = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Our Methodology
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">Our Pedagogy</h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Guiding light for achieving milestones in an evolving world.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2.5 justify-center mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                data-testid={`tab-pedagogy-${tab.id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300"
                style={{
                  background: active === tab.id ? tab.accent : "white",
                  color: active === tab.id ? "white" : "#6b7280",
                  border: `2px solid ${active === tab.id ? tab.accent : "#e5e7eb"}`,
                  boxShadow: active === tab.id ? `0 4px 16px ${tab.accent}33` : "none",
                  transform: active === tab.id ? "scale(1.04)" : "scale(1)",
                }}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="rounded-3xl p-8 md:p-12 bg-white border border-gray-100 shadow-sm"
            data-testid={`panel-pedagogy-${active}`}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{ background: current.bg }}
              >
                <current.icon size={28} style={{ color: current.accent }} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 mb-2">{current.title}</h3>
                <p className="text-gray-500 text-[15px] mb-7 leading-relaxed">{current.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} style={{ color: current.accent, flexShrink: 0, marginTop: "2px" }} />
                      <span className="text-gray-700 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
