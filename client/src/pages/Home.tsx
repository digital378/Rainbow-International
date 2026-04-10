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
const Neighbourhood = lazy(() => import("@/components/home/Neighbourhood").then(m => ({ default: m.Neighbourhood })));
const BeyondClassroomSection = lazy(() => import("@/components/home/BeyondClassroomSection").then(m => ({ default: m.BeyondClassroomSection })));
const Testimonials = lazy(() => import("@/components/home/Testimonials").then(m => ({ default: m.Testimonials })));
const HomeFAQ = lazy(() => import("@/components/home/HomeFAQ").then(m => ({ default: m.HomeFAQ })));
const ContactForm = lazy(() => import("@/components/home/ContactForm").then(m => ({ default: m.ContactForm })));

function SectionFallback() {
  return <div style={{ minHeight: "200px" }} />;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Best CBSE school in thane near me - Rainbow International"
        description="Rainbow International School — best CBSE school in Thane near you. Nursery to Class 12, 3.5-acre campus, 3000+ students. Science, Commerce & Humanities streams. Admissions 2026-27 open."
        keywords="best CBSE school in Thane near me, CBSE school Thane, Rainbow International School, best school near me Thane, international school Thane, top CBSE school Thane, school admissions Thane 2026, K-12 school near me Thane"
        canonical="https://www.rainbowinternationalschool.in/"
        ogImage="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": ["EducationalOrganization", "School"],
          "name": "Rainbow International School",
          "alternateName": "RIS Thane",
          "url": "https://www.rainbowinternationalschool.in/",
          "logo": "https://www.rainbowinternationalschool.in/wp-content/uploads/2024/01/RIS-Logo.png",
          "image": "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
          "description": "Rainbow International School is a CBSE-affiliated K-12 school in Thane, Maharashtra. Founded in 2009, serving 3000+ students from Nursery to Class 12.",
          "foundingDate": "2009-04-01",
          "numberOfStudents": 3000,
          "numberOfEmployees": { "@type": "QuantitativeValue", "value": 200 },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Cosmos Arcade, Brahmand Phase 4",
            "addressLocality": "Thane",
            "addressRegion": "Maharashtra",
            "postalCode": "400607",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 19.2287,
            "longitude": 72.9637
          },
          "telephone": "+918291568972",
          "email": "info@rainbowinternationalschool.in",
          "sameAs": [
            "https://www.facebook.com/RainbowInternationalSchoolThane",
            "https://www.instagram.com/rainbowinternationalschool",
            "https://www.youtube.com/@RainbowInternationalSchool"
          ],
          "areaServed": { "@type": "City", "name": "Thane" },
          "priceRange": "$$",
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            "opens": "09:00",
            "closes": "18:00"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "250",
            "bestRating": "5"
          }
        }}
      />
      <ScrollProgress />
      <Navbar />
      <main className="flex-grow" role="main">
        <article itemScope itemType="https://schema.org/School">
          <meta itemProp="name" content="Rainbow International School" />
          <meta itemProp="description" content="One of the top CBSE-affiliated K-12 schools in Thane, Maharashtra. Offering world-class education from Nursery to Class 12 with Science, Commerce & Humanities streams." />
          <meta itemProp="address" content="Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra 400607" />
          <meta itemProp="telephone" content="+91 82915 68972" />
          <meta itemProp="url" content="https://www.rainbowinternationalschool.in" />
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
            <Neighbourhood />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <BeyondClassroomSection />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Testimonials />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <HomeFAQ />
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
