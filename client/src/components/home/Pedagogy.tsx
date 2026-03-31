import { Monitor, Music, Leaf, Heart } from "lucide-react";

const pedagogyItems = [
  {
    icon: Monitor,
    title: "Technology in Classrooms",
    description: "E-learning tools for enhanced Learning and Memory",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Music,
    title: "Extracurricular Activities",
    description: "Annual Activities / Cultural Activities, Clubs, Exhibitions, Music & Art, Organic Farming and Much More.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Heart,
    title: "Personality Development",
    description: "Being mindful of etiquette, teamwork & self-confidence",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: Leaf,
    title: "Philosophy of Sensitivity",
    description: "Incorporating social & environmental awareness",
    color: "text-green-500",
    bg: "bg-green-50",
  },
];

export function Pedagogy() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Our Pedagogy</h2>
          <p className="text-gray-500 text-sm md:text-base">
            Guiding Light for achieving Milestones in Evolving World
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pedagogyItems.map((item, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`card-pedagogy-${i}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.bg}`}>
                <item.icon className={item.color} size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
