import { Monitor, Calendar, Heart, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Monitor,
    title: "Technology in Classrooms",
    description: "E-learning resources for better learning & memory. State-of-the-art digital tools enhance every lesson.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: Calendar,
    title: "Extracurricular Activities",
    description: "Annual events, clubs, exhibitions, music, art & organic farming — a rich life beyond textbooks.",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    icon: Heart,
    title: "Personality Development",
    description: "Attention to etiquette, teamwork & self-confidence builds well-rounded, accountable human beings.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon: Sprout,
    title: "Philosophy of Sensitivity",
    description: "Incorporating social & environmental consciousness — empathy, compassion, and respect for all.",
    color: "bg-green-100 text-green-700",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm">Our Approach</span>
          <h2 className="text-4xl font-serif font-bold text-primary mt-3 mb-4">
            Welcome to Rainbow International School
          </h2>
          <p className="text-muted-foreground text-lg">
            Educating Students for Success in an Evolving World
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-card">
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={28} />
                </div>
                <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
