import { Navbar } from "@/components/layout/Navbar";
import {
  FEES_SEO, FEES_BANNER, FEES_OVERVIEW, FEES_SECTIONS_HEADING, FEES_SECTION_CARDS,
  FEES_INCLUSIONS_HEADING, FEES_INCLUSIONS, FEES_CTA, FEES_QUICK_HEADING,
  FEES_QUICK_ANSWER, FEES_FAQ_HEADING, FEES_FAQS,
} from "@shared/content/fees";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Phone, IndianRupee, Shield, Bus, BookOpen, Stethoscope } from "lucide-react";
import { WaveOneSeoBlock } from "@/components/WaveOneSeoBlock";

const inclusions = [BookOpen, Bus, Shield, Stethoscope].map((icon, i) => ({
  ...FEES_INCLUSIONS[i],
  icon,
}));

export default function Fees() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title={FEES_SEO.title}
        description={FEES_SEO.description}
        keywords={FEES_SEO.keywords}
        appendSiteName={false}
        canonical="https://rainbowinternationalschool.in/fee-structure"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: FEES_SEO.crumb, href: "https://rainbowinternationalschool.in/fee-structure" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: FEES_SEO.title,
          description: FEES_SEO.description,
          url: "https://rainbowinternationalschool.in/fee-structure",
        }}
      />
      <Navbar />
      <PageBanner
        title={FEES_BANNER.title}
        subtitle={FEES_BANNER.subtitle}
        bgImage="/images/students/hero-senior-secondary.webp"
      />

      <main className="flex-grow" role="main">
        <section className="py-16 bg-gradient-to-b from-white to-gray-50" data-testid="section-overview">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-6">{FEES_OVERVIEW.heading}</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {FEES_OVERVIEW.paragraph}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6" data-testid="fee-note">
              <div className="flex items-start gap-3">
                <IndianRupee className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#091a4f] mb-1">{FEES_OVERVIEW.noticeTitle}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {FEES_OVERVIEW.noticeText.split(FEES_CTA.phone)[0]}<strong>{FEES_CTA.phone}</strong>{FEES_OVERVIEW.noticeText.split(FEES_CTA.phone)[1]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-sections">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">{FEES_SECTIONS_HEADING}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEES_SECTION_CARDS.map((item, i) => (
                <a key={i} href={item.link} className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group" data-testid={`section-${i}`}>
                  <h3 className="font-['DM_Sans'] font-bold text-[#091a4f] mb-1 group-hover:text-[#0d3b86]">{item.section}</h3>
                  <p className="text-sm text-amber-600 font-medium mb-2">{item.grades}</p>
                  <p className="text-xs text-gray-500">{item.note}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50" data-testid="section-inclusions">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-8 text-center">{FEES_INCLUSIONS_HEADING}</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {inclusions.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-testid={`inclusion-${i}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#091a4f]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#091a4f]" />
                    </div>
                    <div>
                      <h3 className="font-['DM_Sans'] font-bold text-[#091a4f] mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50" data-testid="section-cta">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="font-['DM_Sans'] font-black text-2xl md:text-3xl text-[#091a4f] mb-4">{FEES_CTA.heading}</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">{FEES_CTA.paragraph}</p>
            <a href="tel:+918291568972" className="inline-flex items-center gap-2 bg-[#091a4f] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#0d3b86] transition mb-8" data-testid="btn-call">
              <Phone className="w-4 h-4" /> {FEES_CTA.phone}
            </a>
          </div>
          <div className="container mx-auto px-4 max-w-5xl">
            <ContactForm />
          </div>
        </section>
        <WaveOneSeoBlock pageId="fee-structure" quickAnswerHeading={FEES_QUICK_HEADING} quickAnswer={FEES_QUICK_ANSWER} faqHeading={FEES_FAQ_HEADING} faqs={FEES_FAQS} />
      </main>
      <Footer />
    </div>
  );
}
