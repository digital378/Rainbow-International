import { lazy, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Hero } from "@/components/home/Hero";
import { AwardsStrip } from "@/components/home/AwardsStrip";

const AboutPreview = lazy(() => import("@/components/home/AboutPreview").then(m => ({ default: m.AboutPreview })));
const AcademicSections = lazy(() => import("@/components/home/AcademicSections").then(m => ({ default: m.AcademicSections })));
const Pedagogy = lazy(() => import("@/components/home/Pedagogy").then(m => ({ default: m.Pedagogy })));
const DiscoverRainbow = lazy(() => import("@/components/home/DiscoverRainbow").then(m => ({ default: m.DiscoverRainbow })));
const BeyondClassroomSection = lazy(() => import("@/components/home/BeyondClassroomSection").then(m => ({ default: m.BeyondClassroomSection })));
const Testimonials = lazy(() => import("@/components/home/Testimonials").then(m => ({ default: m.Testimonials })));
const ContactForm = lazy(() => import("@/components/home/ContactForm").then(m => ({ default: m.ContactForm })));

function SectionFallback() {
  return <div style={{ minHeight: "200px" }} />;
}

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
      <main className="flex-grow" role="main">
        <article itemScope itemType="https://schema.org/School">
          <meta itemProp="name" content="Rainbow International School" />
          <meta itemProp="description" content="One of the top CBSE-affiliated K-12 schools in Thane West, Maharashtra. Offering world-class education from Nursery to Class 12 with Science, Commerce & Humanities streams." />
          <meta itemProp="address" content="Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra 400607" />
          <meta itemProp="telephone" content="+91 82915 68972" />
          <meta itemProp="url" content="https://rainbowinternationalschool.in" />
          <Hero />
          <AwardsStrip />
          <Suspense fallback={<SectionFallback />}>
            <AboutPreview />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <AcademicSections />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Pedagogy />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <DiscoverRainbow />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <BeyondClassroomSection />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Testimonials />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <ContactForm />
          </Suspense>
        </article>
      </main>
      <Footer />
    </div>
  );
}
