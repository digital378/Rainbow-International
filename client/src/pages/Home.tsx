import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { AboutPreview } from "@/components/home/AboutPreview";
import { Events } from "@/components/home/Events";
import { ContactForm } from "@/components/home/ContactForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <AboutPreview />
        <Events />
        <ContactForm />
        
        {/* Call to Action Section */}
        <section className="py-24 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6">Ready to Join the Rainbow Family?</h2>
            <p className="text-xl text-primary/80 max-w-2xl mx-auto mb-10">
              Admissions are open for the upcoming academic year. Secure your child's future with us today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:-translate-y-1">
                Apply Online
              </button>
              <button className="bg-transparent border-2 border-primary text-primary font-bold py-4 px-8 rounded-lg hover:bg-primary/10 transition-colors">
                Download Brochure
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
