import { BookOpen, Palette, Trophy, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Academic Excellence",
    description: "Our rigorous curriculum challenges students to think critically and solve complex problems.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: Trophy,
    title: "Sports Academy",
    description: "State-of-the-art facilities and professional coaching in football, cricket, swimming, and more.",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    icon: Palette,
    title: "Arts & Culture",
    description: "Fostering creativity through music, dance, visual arts, and drama programs.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "International exchange programs and a diverse community preparing students for the world.",
    color: "bg-green-100 text-green-700",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm">Why Choose Us</span>
          <h2 className="text-4xl font-serif font-bold text-primary mt-3 mb-4">Nurturing Potential,<br/>Achieving Excellence</h2>
          <p className="text-muted-foreground text-lg">
            At Rainbow International, we believe in a balanced approach to education that values academic achievement alongside personal growth.
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
