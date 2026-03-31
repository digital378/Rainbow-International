import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { AboutPreview } from "@/components/home/AboutPreview";
import { AcademicSections } from "@/components/home/AcademicSections";
import { ContactForm } from "@/components/home/ContactForm";
import { Pedagogy } from "@/components/home/Pedagogy";
import { DiscoverRainbow } from "@/components/home/DiscoverRainbow";
import { BeyondClassroomSection } from "@/components/home/BeyondClassroomSection";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <AboutPreview />
        <AcademicSections />
        <ContactForm />
        <Pedagogy />
        <DiscoverRainbow />
        <BeyondClassroomSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
