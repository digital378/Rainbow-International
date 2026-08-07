import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Link } from "wouter";
import { ChevronDown, Search, ChevronRight } from "lucide-react";
import { FAQ_PAGE_CATEGORIES, ALL_FAQS_PAGE_ITEMS, buildFaqPageLd, type FaqCategory } from "@shared/faqData";
import { ROUTE_SEO } from "@shared/routeSeo";

// FAQ content lives in shared/faqData.ts — the same data the server uses
// to inject FAQPage JSON-LD into the raw HTML. Edit it there, not here.
const faqCategories: FaqCategory[] = FAQ_PAGE_CATEGORIES;

const allFaqs = faqCategories.flatMap(cat => cat.faqs.map(f => ({ ...f, category: cat.title })));

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = useCallback((key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const filteredCategories = faqCategories
    .map(cat => ({
      ...cat,
      faqs: cat.faqs.filter(f => {
        const matchesSearch = !searchQuery || f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = activeCategory === "all" || cat.id === activeCategory;
        return matchesSearch && matchesCat;
      }),
    }))
    .filter(cat => cat.faqs.length > 0);

  const faqJsonLd = buildFaqPageLd(ALL_FAQS_PAGE_ITEMS);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="FAQs — Admissions, Fees, Academics & More | Rainbow International School"
        description={ROUTE_SEO["/faqs"].description}
        keywords="rainbow international school faq, school admission questions thane, CBSE school faq, school fees thane, rainbow school admissions, school timings thane"
        canonical="https://rainbowinternationalschool.in/faqs"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "FAQs", href: "https://rainbowinternationalschool.in/faqs" },
        ]}
        jsonLd={faqJsonLd}
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about Rainbow International School."
        breadcrumb={[{ label: "FAQs" }]}
      />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="relative mb-8">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#e5e7eb", color: "#1f2937" }}
                aria-label="Search frequently asked questions"
                data-testid="input-search-faq"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setActiveCategory("all")}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: activeCategory === "all" ? "#091a4f" : "#f3f4f6",
                  color: activeCategory === "all" ? "#fff" : "#6b7280",
                }}
                data-testid="button-filter-all"
              >
                All
              </button>
              {faqCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: activeCategory === cat.id ? "#091a4f" : "#f3f4f6",
                    color: activeCategory === cat.id ? "#fff" : "#6b7280",
                  }}
                  data-testid={`button-filter-${cat.id}`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium" style={{ color: "#6b7280" }}>No questions match your search.</p>
                <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); }} className="mt-3 text-sm font-semibold underline" style={{ color: "#091a4f" }} data-testid="button-clear-search">Clear search</button>
              </div>
            ) : (
              <div className="space-y-10">
                {filteredCategories.map(cat => (
                  <div key={cat.id} id={cat.id}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}>{cat.title}</h2>
                    <div className="space-y-3">
                      {cat.faqs.map((faq, idx) => {
                        const key = `${cat.id}-${idx}`;
                        const isOpen = openItems.has(key);
                        return (
                          <div key={key} className="rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }} data-testid={`faq-item-${cat.id}-${idx}`}>
                            <button
                              id={`faq-trigger-${key}`}
                              onClick={() => toggleItem(key)}
                              className="w-full text-left p-5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                              aria-expanded={isOpen}
                              aria-controls={`faq-answer-${key}`}
                              data-testid={`button-faq-${cat.id}-${idx}`}
                            >
                              <span className="text-sm font-semibold pr-4" style={{ color: "#091a4f" }}>{faq.q}</span>
                              <ChevronDown
                                size={18}
                                className="flex-shrink-0 transition-transform duration-300"
                                style={{ color: "#9ca3af", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                              />
                            </button>
                            <div
                              id={`faq-answer-${key}`}
                              role="region"
                              aria-labelledby={`faq-trigger-${key}`}
                              className="overflow-hidden transition-all duration-300"
                              style={{ maxHeight: isOpen ? "500px" : "0px", opacity: isOpen ? 1 : 0 }}
                            >
                              <div className="px-5 pb-5">
                                <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{faq.a}</p>
                                {faq.links && faq.links.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {faq.links.map((lnk, li) => (
                                      <Link key={li} href={lnk.href} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:shadow-sm" style={{ background: "#eef5ff", color: "#0d3b86" }} data-testid={`link-faq-${cat.id}-${idx}-${li}`}>
                                        {lnk.label} <ChevronRight size={12} />
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="rounded-2xl p-8 md:p-10" style={{ background: "#091a4f" }}>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Still Have Questions?
              </h2>
              <p className="text-sm mb-6" style={{ color: "#d1d5db" }}>
                Our admissions team is happy to help. Reach out or visit our campus for a personal conversation.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/contact-us" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold" style={{ background: "#fbbf24", color: "#091a4f" }} data-testid="link-contact-us">
                  Contact Us <ChevronRight size={14} />
                </Link>
                <Link href="/schedule-appointment" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold border text-white hover:bg-white/10 transition-all" data-testid="link-schedule-visit">
                  Schedule a Visit <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
