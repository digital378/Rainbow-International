import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function AboutPreview() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="grid grid-cols-2 gap-3 relative">
              <img
                src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/09-150x150.jpg"
                alt="Student with colour palette"
                className="rounded-2xl shadow-lg w-full object-cover aspect-square"
              />
              <img
                src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/12-300x200.jpg"
                alt="Child dressed as surgeon"
                className="rounded-2xl shadow-lg w-full object-cover aspect-square"
              />
              <img
                src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/03-150x150.jpg"
                alt="Boy with beakers"
                className="rounded-2xl shadow-lg w-full object-cover aspect-square"
              />
              <img
                src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/05-1-150x150.jpg"
                alt="Young astronaut"
                className="rounded-2xl shadow-lg w-full object-cover aspect-square"
              />
            </div>
          </div>

          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Why Rainbow?</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mt-3 mb-6">
              A Trailblazer in <span className="text-primary underline decoration-secondary decoration-4 underline-offset-4">Education</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
              Rainbow International School is a trailblazer in the arena of education with a passion for excellence. We are considered as one of the top CBSE schools in Thane West because we emphasize that the child enjoys his learning, dares to dream, and becomes a lifelong learner.
            </p>
            <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
              Our expert educators provide a conducive environment with their multicultural perspectives. Social ethics like empathy, compassion, and respect for others is inculcated in the pedagogy. We provide state-of-the-art facilities, technologies, and infrastructure to optimize teaching and learning outcomes.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              At Rainbow, students are encouraged to build a positive self-image and evolve into well-disciplined, resourceful, and accountable human beings. We are proud to consistently deliver world-class education and remain the best international school in Thane West.
            </p>
            <div className="flex gap-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 shadow-md group">
                About Us <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
