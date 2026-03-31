import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Trophy, Star } from "lucide-react";

export function Hero() {
  return (
    <div className="relative w-full h-[90vh] min-h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://rainbowinternationalschool.in/wp-content/uploads/2023/04/picwish.webp)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl animate-in slide-in-from-left duration-700 fade-in">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-secondary/90 text-secondary-foreground text-sm font-bold tracking-wide uppercase backdrop-blur-sm shadow-lg">
            CBSE Affiliated · Nursery to Class 12th
          </div>
          <p className="text-lg md:text-xl text-secondary font-bold tracking-wider uppercase mb-2">
            World-Class Education, Indian Values:
          </p>
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-6 leading-[1.1]">
            Rainbow<br />
            <span className="text-secondary">International</span><br />
            School
          </h1>
          <p className="text-xl text-gray-200 mb-8 font-light max-w-lg leading-relaxed">
            One of the top CBSE schools in Thane West — where every child dares to dream and becomes a lifelong learner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14 px-8 shadow-xl">
                Know More
              </Button>
            </a>
            <a href="#academics">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-md text-lg h-14 px-8">
                Explore Programs
              </Button>
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 backdrop-blur text-white py-6 hidden md:block border-t border-white/10">
          <div className="container mx-auto px-4 flex justify-around max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full text-secondary">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">Nursery–12</div>
                <div className="text-sm text-gray-300">All Classes</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full text-secondary">
                <Star size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">CBSE</div>
                <div className="text-sm text-gray-300">Affiliated</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full text-secondary">
                <Trophy size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">Top Ranked</div>
                <div className="text-sm text-gray-300">School in Thane West</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full text-secondary">
                <Users size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">Holistic</div>
                <div className="text-sm text-gray-300">Development</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
