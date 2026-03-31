import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Hero } from "@/components/home/Hero";
import { AwardsStrip } from "@/components/home/AwardsStrip";
import { Features } from "@/components/home/Features";
import { AboutPreview } from "@/components/home/AboutPreview";
import { AcademicSections } from "@/components/home/AcademicSections";
import { Pedagogy } from "@/components/home/Pedagogy";
import { DiscoverRainbow } from "@/components/home/DiscoverRainbow";
import { BeyondClassroomSection } from "@/components/home/BeyondClassroomSection";
import { Testimonials } from "@/components/home/Testimonials";
import { ContactForm } from "@/components/home/ContactForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Best CBSE School in Thane West — Admissions 2026–27 Open"
        description="Rainbow International School is one of the top CBSE K–12 schools in Thane West, Maharashtra. Offering world-class education from Nursery to Class 12 with Science, Commerce & Humanities streams. Admissions open for 2026–27."
        keywords="Rainbow International School Thane, CBSE school Thane, best international school Thane West, K-12 school Thane, school admissions Thane 2026, CBSE admissions Thane, top school Thane West Maharashtra"
        canonical="https://rainbowinternationalschool.in/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"
      />
      <ScrollProgress />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <AwardsStrip />
        <Features />
        <AboutPreview />
        <AcademicSections />
        <Pedagogy />
        <DiscoverRainbow />
        <BeyondClassroomSection />
        <Testimonials />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
