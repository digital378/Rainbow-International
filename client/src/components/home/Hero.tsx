import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, GraduationCap, Trophy, Users } from "lucide-react";
import heroImage from "@assets/generated_images/modern_school_building_exterior_with_happy_students.png";

export function Hero() {
  return (
    <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background Image with Parallax-like effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl animate-in slide-in-from-left duration-700 fade-in">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-secondary/90 text-secondary-foreground text-sm font-bold tracking-wide uppercase backdrop-blur-sm shadow-lg">
            Admissions Open for 2025-26
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-6 leading-[1.1] shadow-sm">
            Inspiring Minds, <br/>
            <span className="text-secondary">Shaping Futures.</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 font-light max-w-lg leading-relaxed">
            We provide a world-class holistic education that empowers students to become global citizens and leaders of tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14 px-8 shadow-xl">
              Start Application
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md text-lg h-14 px-8">
              Virtual Tour
            </Button>
          </div>
        </div>

        {/* Quick Stats at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 backdrop-blur text-white py-8 hidden md:block border-t border-white/10">
          <div className="container mx-auto px-4 flex justify-between max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full text-secondary">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">100%</div>
                <div className="text-sm text-gray-300">University Placement</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full text-secondary">
                <Users size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">1:12</div>
                <div className="text-sm text-gray-300">Teacher-Student Ratio</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full text-secondary">
                <Trophy size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">50+</div>
                <div className="text-sm text-gray-300">Sports Awards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
