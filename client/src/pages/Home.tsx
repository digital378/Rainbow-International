import { lazy, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Hero } from "@/components/home/Hero";
import { AwardsStrip } from "@/components/home/AwardsStrip";
import { LazyVisible } from "@/components/util/LazyVisible";
import { WaveOneSeoBlock, buildFaqPageSchema, type WaveOneFaq } from "@/components/WaveOneSeoBlock";

const HOME_QUICK_ANSWER =
  "Rainbow International School is a CBSE school in Thane (since 2009) on a 3.5-acre Brahmand campus. The school offers Nursery to Class 12, on-campus sports, science labs, library, transport and an infirmary. Admissions for the 2026-27 academic year are open.";

const HOME_FAQS: WaveOneFaq[] = [
  { q: "Is Rainbow International School a CBSE school in Thane?", a: "Yes. RIS is a CBSE-affiliated school in Thane (Brahmand) running classes from Nursery to Class 12 since 2009. Affiliation number 1130661." },
  { q: "Which areas in Thane does the school serve?", a: "The school primarily serves Brahmand, Ghodbunder Road, Manpada, Hiranandani Estate, Kasarvadavali, Majiwada, Kolshet, Waghbil and Patlipada with school-managed transport." },
  { q: "How can parents enquire for admission?", a: "Parents can fill the online admission enquiry on the website, call the admission desk, or book an in-person campus visit at the Brahmand campus." },
  { q: "Does Rainbow International School offer senior secondary classes?", a: "Yes. The school offers Class 11 and 12 with Science, Commerce and Humanities streams." },
  { q: "How can I see the fee structure?", a: "The full class-wise fee structure for 2026-27 is available on the Fee Structure page; a downloadable PDF is also linked there." },
];

const AboutPreview = lazy(() => import("@/components/home/AboutPreview").then(m => ({ default: m.AboutPreview })));
const AcademicSections = lazy(() => import("@/components/home/AcademicSections").then(m => ({ default: m.AcademicSections })));
const Pedagogy = lazy(() => import("@/components/home/Pedagogy").then(m => ({ default: m.Pedagogy })));
const DiscoverRainbow = lazy(() => import("@/components/home/DiscoverRainbow").then(m => ({ default: m.DiscoverRainbow })));
const Neighbourhood = lazy(() => import("@/components/home/Neighbourhood").then(m => ({ default: m.Neighbourhood })));
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
        title="Rainbow International School Thane | CBSE School Since 2009"
        description="Rainbow International School is a CBSE school in Thane (since 2009). 3.5-acre Brahmand campus, Nursery to Class 12. Apply for the 2026-27 academic year."
        keywords="CBSE school in Thane, Rainbow International School Thane, best CBSE school in Thane, top CBSE school Thane, school near me Thane, international school in Thane, school admission Thane 2026-27, K-12 CBSE school Brahmand"
        canonical="https://rainbowinternationalschool.in/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": ["EducationalOrganization", "School"],
              "name": "Rainbow International School",
              "alternateName": "RIS Thane",
              "url": "https://rainbowinternationalschool.in/",
              "logo": "https://rainbowinternationalschool.in/wp-content/uploads/2024/01/RIS-Logo.png",
              "image": "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg",
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
              }
            },
            buildFaqPageSchema(HOME_FAQS)
          ]
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
          <meta itemProp="url" content="https://rainbowinternationalschool.in" />
          <Hero />
          <AwardsStrip />
          <LazyVisible minHeight={400}>
            <Suspense fallback={<SectionFallback />}>
              <AboutPreview />
            </Suspense>
          </LazyVisible>
          <LazyVisible minHeight={600}>
            <Suspense fallback={<SectionFallback />}>
              <AcademicSections />
            </Suspense>
          </LazyVisible>
          <LazyVisible minHeight={500}>
            <Suspense fallback={<SectionFallback />}>
              <Pedagogy />
            </Suspense>
          </LazyVisible>
          <LazyVisible minHeight={500}>
            <Suspense fallback={<SectionFallback />}>
              <DiscoverRainbow />
            </Suspense>
          </LazyVisible>
          <LazyVisible minHeight={400}>
            <Suspense fallback={<SectionFallback />}>
              <Neighbourhood />
            </Suspense>
          </LazyVisible>
          <LazyVisible minHeight={500}>
            <Suspense fallback={<SectionFallback />}>
              <BeyondClassroomSection />
            </Suspense>
          </LazyVisible>
          <LazyVisible minHeight={500}>
            <Suspense fallback={<SectionFallback />}>
              <Testimonials />
            </Suspense>
          </LazyVisible>
          <LazyVisible minHeight={600}>
            <Suspense fallback={<SectionFallback />}>
              <ContactForm />
            </Suspense>
          </LazyVisible>
          <WaveOneSeoBlock pageId="home" quickAnswer={HOME_QUICK_ANSWER} faqs={HOME_FAQS} />
        </article>
      </main>
      <Footer />
    </div>
  );
}
