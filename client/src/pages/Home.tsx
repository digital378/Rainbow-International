import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { AboutPreview } from "@/components/home/AboutPreview";
import { AcademicSections } from "@/components/home/AcademicSections";
import { DiscoverRainbow } from "@/components/home/DiscoverRainbow";
import { Events } from "@/components/home/Events";
import { Testimonials } from "@/components/home/Testimonials";
import { ContactForm } from "@/components/home/ContactForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <AboutPreview />
        <AcademicSections />
        <DiscoverRainbow />
        <Events />
        <Testimonials />
        <ContactForm />

        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6">Ready to Join the Rainbow Family?</h2>
            <p className="text-xl text-primary/80 max-w-2xl mx-auto mb-10">
              Admissions are open. Secure your child's future at one of the best international schools in Thane West.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact">
                <button className="bg-primary text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:-translate-y-1">
                  Apply Online
                </button>
              </a>
              <a href="https://rainbowinternationalschool.in/wp-content/uploads/2025/02/Brand-Partners-Brochure-2024-22.10.2024.pdf" target="_blank" rel="noopener noreferrer">
                <button className="bg-transparent border-2 border-primary text-primary font-bold py-4 px-8 rounded-lg hover:bg-primary/10 transition-colors">
                  Download Brochure
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
