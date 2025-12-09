import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import classroomImage from "@assets/generated_images/bright_modern_elementary_classroom_with_students_learning.png";

export function AboutPreview() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            <img 
              src={classroomImage} 
              alt="Classroom learning" 
              className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3] hover:scale-[1.02] transition-transform duration-500"
            />
            
            <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-xl shadow-xl max-w-xs hidden lg:block border border-border">
              <p className="font-serif text-lg text-primary font-bold mb-2">"Education is not the filling of a pail, but the lighting of a fire."</p>
              <p className="text-sm text-muted-foreground font-medium">- W.B. Yeats</p>
            </div>
          </div>

          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-sm">About Our School</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mt-3 mb-6">
              A Tradition of <span className="text-primary underline decoration-secondary decoration-4 underline-offset-4">Excellence</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Founded in 1995, Rainbow International School has been a pioneer in providing quality education. Our campus is a vibrant community where students are encouraged to explore their passions and discover their potential.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We offer a comprehensive curriculum that integrates the best of national and international standards, ensuring our students are well-prepared for higher education and beyond.
            </p>
            <div className="flex gap-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 shadow-md group">
                Read Our Story <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
