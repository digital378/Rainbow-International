import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { AWARDS_SEO, AWARDS_BANNER, AWARDS_INTRO, AWARDS, AWARDS_JSON_LD } from "@shared/content/awards";

export default function Awards() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title={AWARDS_SEO.title}
        appendSiteName={false}
        description={AWARDS_SEO.description}
        keywords={AWARDS_SEO.keywords}
        canonical={AWARDS_SEO.canonical}
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: AWARDS_BANNER.breadcrumb, href: AWARDS_SEO.canonical },
        ]}
        jsonLd={AWARDS_JSON_LD}
      />
      <Navbar />
      <PageBanner
        title={AWARDS_BANNER.title}
        breadcrumb={[{ label: AWARDS_BANNER.breadcrumb }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {AWARDS_INTRO.label}
              </span>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {AWARDS_INTRO.paragraph}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {AWARDS.map((award, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col" data-testid={`card-award-${i}`}>
                  <div className="relative">
                    <img
                      src={award.image}
                      alt={award.title}
                      className="w-full h-52 object-cover"
                      width={600}
                      height={208}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#fbbf24" }} />
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="font-black text-lg mb-3 text-center" style={{ color: "#0d3b86" }}>{award.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{award.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
