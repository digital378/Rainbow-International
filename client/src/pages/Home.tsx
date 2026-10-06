import { lazy, Suspense, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Hero } from "@/components/home/Hero";
import { AwardsStrip } from "@/components/home/AwardsStrip";
import { AdmissionJourney } from "@/components/home/AdmissionJourney";
import { LazyVisible } from "@/components/util/LazyVisible";
import { HOME_SEO, HOME_QUICK_ANSWER, HOME_FAQS } from "@shared/content/home";
import { buildOrgNode, buildWebsiteNode } from "@shared/orgSchema";

const HOME_PAGE_LD = { "@context": "https://schema.org", "@graph": [buildOrgNode(), buildWebsiteNode()] };

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
  // The shared SEO component has no separate social-title prop. Keep its API frozen.
  useEffect(() => {
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      for (const tag of document.head.querySelectorAll(selector)) {
        if (tag.getAttribute("content") !== HOME_SEO.ogTitle) tag.setAttribute("content", HOME_SEO.ogTitle);
      }
    }
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={HOME_SEO.title}
        description={HOME_SEO.description}
        keywords={HOME_SEO.keywords}
        canonical={HOME_SEO.canonical}
        ogImage={HOME_SEO.ogImage}
        appendSiteName={false}
        jsonLd={HOME_PAGE_LD}
      />
      <ScrollProgress />
      <Navbar />
      <main className="flex-grow" role="main">
        <article>

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
