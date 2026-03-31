import { Monitor, Music, Heart, Leaf, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const tabs = [
  {
    id: "tech",
    label: "Technology",
    icon: Monitor,
    title: "Technology in Classrooms",
    description: "E-learning tools for enhanced Learning and Memory",
    points: [
      "Smart boards in every classroom",
      "Digital learning resources",
      "E-learning tools and platforms",
      "Enhanced memory and retention",
    ],
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    id: "extra",
    label: "Extracurricular",
    icon: Music,
    title: "Extracurricular Activities",
    description: "Annual Activities / Cultural Activities, Clubs, Exhibitions, Music & Art, Organic Farming and Much More.",
    points: [
      "Annual cultural activities",
      "Clubs and exhibitions",
      "Music & Art programmes",
      "Organic farming experience",
    ],
    color: "#f97316",
    bg: "#fff7ed",
  },
  {
    id: "personality",
    label: "Personality",
    icon: Heart,
    title: "Personality Development",
    description: "Being mindful of etiquette, teamwork & self-confidence",
    points: [
      "Etiquette and social skills",
      "Team-building activities",
      "Self-confidence programmes",
      "Leadership development",
    ],
    color: "#a855f7",
    bg: "#faf5ff",
  },
  {
    id: "sensitivity",
    label: "Sensitivity",
    icon: Leaf,
    title: "Philosophy of Sensitivity",
    description: "Incorporating social & environmental awareness",
    points: [
      "Social awareness programmes",
      "Environmental responsibility",
      "Empathy and compassion",
      "Anti-bullying initiatives",
    ],
    color: "#22c55e",
    bg: "#f0fdf4",
  },
];

export function Pedagogy() {
  const [active, setActive] = useState("tech");
  const current = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <section className="py-20" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0d3b86" }} />
            Our Methodology
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Our Pedagogy</h2>
          <p className="text-gray-500 text-base">Guiding Light for achieving Milestones in Evolving World</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                data-testid={`tab-pedagogy-${tab.id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300"
                style={{
                  background: active === tab.id ? tab.color : "white",
                  color: active === tab.id ? "white" : "#6b7280",
                  border: `2px solid ${active === tab.id ? tab.color : "#e5e7eb"}`,
                  boxShadow: active === tab.id ? `0 4px 14px ${tab.color}40` : "none",
                }}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="rounded-3xl p-8 md:p-12 border border-gray-100 bg-white shadow-sm transition-all duration-300"
            data-testid={`panel-pedagogy-${active}`}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: current.bg }}>
                  <current.icon size={30} style={{ color: current.color }} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 mb-2">{current.title}</h3>
                <p className="text-gray-500 text-base mb-6">{current.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.points.map((point, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={16} style={{ color: current.color, flexShrink: 0 }} />
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
