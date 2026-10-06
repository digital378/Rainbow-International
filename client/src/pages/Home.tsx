import { lazy, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Hero } from "@/components/home/Hero";
import { AwardsStrip } from "@/components/home/AwardsStrip";
import { AdmissionJourney } from "@/components/home/AdmissionJourney";
import { LazyVisible } from "@/components/util/LazyVisible";
import { buildFaqPageSchema, type WaveOneFaq } from "@/components/WaveOneSeoBlock";

const HOME_QUICK_ANSWER =
  "Rainbow International School is the best CBSE school in Thane (since 2009) on a 3.5-acre Brahmand campus. The school offers KG to Class 12, on-campus sports, science labs, library, transport and an infirmary. Admissions for the 2027-28 academic year are open.";

const HOME_FAQS: WaveOneFaq[] = [
  { q: "Is Rainbow International School a CBSE school in Thane?",       a: "Yes. RIS is a CBSE-affiliated school in Thane (Brahmand) running classes from KG to Class 12 since 2009. Affiliation number 1130661." },
  { q: "Which classes are admissions open for in 2027-28?",             a: "Admissions are open for KG to Class 12 for the 2027-28 academic year, subject to seat availability per class." },
  { q: "What is the admission process at RIS?",                          a: "Submit enquiry → counsellor calls back → campus visit → student interaction and document review → admission confirmation and fee payment." },
  { q: "How can parents book a campus visit?",                           a: "Book through the admissions page on the website, call +91 82915 68972, or start a WhatsApp conversation. Visits are available Mon–Sat, 9 AM–5 PM." },
  { q: "Is transport available?",                                        a: "Yes. GPS-tracked school buses with trained attendants cover 30+ routes across Thane — Brahmand, Ghodbunder Road, Manpada, Hiranandani and more." },
  { q: "Which areas in Thane does the school serve?",                   a: "The school primarily serves Brahmand, Ghodbunder Road, Manpada, Hiranandani Estate, Kasarvadavali, Majiwada, Kolshet, Waghbil and Patlipada." },
  { q: "What documents are required for admission?",                     a: "Birth certificate, Aadhaar (child and parent), passport photos, address proof, previous school transfer certificate, last two years' report cards, and a medical fitness certificate." },
  { q: "Is there an interaction or assessment before admission?",        a: "For Nursery to Class 8, an informal interaction is held — no written test. For Class 9 and above, a written assessment in core subjects is required." },
  { q: "Does RIS offer senior secondary classes?",                      a: "Yes. The school offers Class 11 and 12 in Science (PCM/PCB), Commerce and Humanities streams with JEE, NEET and CUET prep support." },
  { q: "How can I see the fee structure?",                              a: "The full class-wise fee structure for 2026-27 is available on the Fee Structure page; a downloadable PDF is also linked there." },
  { q: "What are the school timings?",                                  a: "Office hours are Monday to Saturday, 9:00 AM to 6:00 PM. Academic hours for students vary by section and are confirmed at the time of admission." },
];

const AboutPreview        = lazy(() => import("@/components/home/AboutPreview").then(m => ({ default: m.AboutPreview })));
const RainbowTheatre      = lazy(() => import("@/components/home/RainbowTheatre").then(m => ({ default: m.RainbowTheatre })));
const AcademicSections    = lazy(() => import("@/components/home/AcademicSections").then(m => ({ default: m.AcademicSections })));
const Pedagogy            = lazy(() => import("@/components/home/Pedagogy").then(m => ({ default: m.Pedagogy })));
const DiscoverRainbow     = lazy(() => import("@/components/home/DiscoverRainbow").then(m => ({ default: m.DiscoverRainbow })));
const Neighbourhood       = lazy(() => import("@/components/home/Neighbourhood").then(m => ({ default: m.Neighbourhood })));
const BeyondClassroomSection = lazy(() => import("@/components/home/BeyondClassroomSection").then(m => ({ default: m.BeyondClassroomSection })));
const Testimonials        = lazy(() => import("@/components/home/Testimonials").then(m => ({ default: m.Testimonials })));
const ContactForm         = lazy(() => import("@/components/home/ContactForm").then(m => ({ default: m.ContactForm })));
const WaveOneSeoBlock     = lazy(() => import("@/components/WaveOneSeoBlock").then(m => ({ default: m.WaveOneSeoBlock })));

function SectionFallback() { return <div style={{ minHeight: "200px" }} />; }

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Best CBSE School in Thane | Nursery to Class 12"
        description="Rainbow International School is a CBSE school in Thane for KG to Class 12 with academics, sports, safety, transport and holistic learning."
        keywords="best CBSE school in Thane, CBSE school in Thane, CBSE school near me, KG to Class 12 school in Thane, top CBSE school in Thane, school in Brahmand Thane, school near Hiranandani Estate, school near Ghodbunder Road"
        canonical="https://rainbowinternationalschool.in/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"
        appendSiteName={false}
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
              "description": "Best CBSE school in Thane — Rainbow International School is a CBSE-affiliated K-12 school in Thane, Maharashtra. Founded in 2009, serving 3000+ students from KG to Class 12.",
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
              "geo": { "@type": "GeoCoordinates", "latitude": 19.2287, "longitude": 72.9637 },
              "telephone": "+91-82915-68972",
              "email": "admin@rainbowinternationalschool.in",
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
            buildFaqPageSchema(HOME_FAQS),
          ]
        }}
      />
      <ScrollProgress />
      <Navbar />
      <main className="flex-grow" role="main">
        <article itemScope itemType="https://schema.org/School">
          <meta itemProp="name" content="Rainbow International School — Best CBSE School in Thane" />
          <meta itemProp="description" content="Best CBSE-affiliated K-12 school in Thane, Maharashtra. KG to Class 12 with 3.5-acre campus, strong academics, sports, safety and holistic learning." />
          <meta itemProp="address" content="Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra 400607" />
          <meta itemProp="telephone" content="+91 82915 68972" />
          <meta itemProp="url" content="https://rainbowinternationalschool.in" />

          <Hero />
          <AwardsStrip />
          <AdmissionJourney />

          <LazyVisible minHeight={520}>
            <Suspense fallback={<SectionFallback />}><RainbowTheatre /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={400}>
            <Suspense fallback={<SectionFallback />}><AboutPreview /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={600}>
            <Suspense fallback={<SectionFallback />}><AcademicSections /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={500}>
            <Suspense fallback={<SectionFallback />}><Pedagogy /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={500}>
            <Suspense fallback={<SectionFallback />}><DiscoverRainbow /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={400}>
            <Suspense fallback={<SectionFallback />}><Neighbourhood /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={500}>
            <Suspense fallback={<SectionFallback />}><BeyondClassroomSection /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={500}>
            <Suspense fallback={<SectionFallback />}><Testimonials /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={600}>
            <Suspense fallback={<SectionFallback />}><ContactForm /></Suspense>
          </LazyVisible>
          <LazyVisible minHeight={300}>
            <Suspense fallback={<SectionFallback />}>
              <WaveOneSeoBlock pageId="home" quickAnswer={HOME_QUICK_ANSWER} faqs={HOME_FAQS} />
            </Suspense>
          </LazyVisible>
        </article>
      </main>
      <Footer />
    </div>
  );
}
