import { Monitor, Music, Heart, Leaf } from "lucide-react";

const items = [
  {
    icon: Monitor,
    title: "Technology in Classrooms",
    description: "E-learning tools for enhanced Learning and Memory",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    accent: "#3b82f6",
  },
  {
    icon: Music,
    title: "Extracurricular Activities",
    description: "Annual Activities / Cultural Activities, Clubs, Exhibitions, Music & Art, Organic Farming and Much More.",
    gradient: "from-orange-400 to-orange-500",
    bg: "bg-orange-50",
    accent: "#f97316",
  },
  {
    icon: Heart,
    title: "Personality Development",
    description: "Being mindful of etiquette, teamwork & self-confidence",
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    accent: "#a855f7",
  },
  {
    icon: Leaf,
    title: "Philosophy of Sensitivity",
    description: "Incorporating social & environmental awareness",
    gradient: "from-green-500 to-green-600",
    bg: "bg-green-50",
    accent: "#22c55e",
  },
];

export function Pedagogy() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-4 py-1.5 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a" }}>
            Our Approach
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Our Pedagogy</h2>
          <p className="text-gray-500 text-base max-w-sm mx-auto">Guiding Light for achieving Milestones in Evolving World</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-2"
              data-testid={`card-pedagogy-${i}`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} rounded-t-2xl`} />
              <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon style={{ color: item.accent }} size={26} />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
