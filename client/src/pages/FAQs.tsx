import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Link } from "wouter";
import { ChevronDown, Search, ChevronRight } from "lucide-react";

interface FAQ {
  q: string;
  a: string;
  links?: { label: string; href: string }[];
}

interface FAQCategory {
  id: string;
  title: string;
  faqs: FAQ[];
}

const faqCategories: FAQCategory[] = [
  {
    id: "admissions",
    title: "Admissions",
    faqs: [
      { q: "What is the admission process at Rainbow International School?", a: "The admission process includes submitting an online application form, followed by an interaction session with the child and parents. For senior classes (Class 9 onwards), there is a written assessment. Applications are accepted on a first-come, first-served basis, subject to seat availability.", links: [{ label: "Apply Online", href: "/application-form" }, { label: "Schedule a Visit", href: "/schedule-appointment" }] },
      { q: "What is the age criteria for admission?", a: "For Nursery, the child should be 2.5 years old as on 31st March of the academic year. For Jr KG, the child should be 3.5 years, and for Sr KG, 4.5 years. For Class 1, the child must be 6 years old as on 31st March. Age criteria follow CBSE norms." },
      { q: "When do admissions open for the new academic year?", a: "Admissions for the academic year 2026–27 are currently open. We recommend applying early as seats fill up quickly, especially for Pre-Primary and Grade 1." },
      { q: "Is there a waiting list?", a: "Yes, once a class reaches full capacity, applicants are placed on a waiting list. Families on the waiting list are contacted if a seat becomes available." },
      { q: "Can my child join mid-year?", a: "Mid-year admissions are possible subject to seat availability. Please contact our admissions office to check current availability for the desired class." },
    ],
  },
  {
    id: "fees",
    title: "Fees",
    faqs: [
      { q: "What is the fee structure?", a: "The fee structure varies by grade level. Detailed fee information is shared during the admission interaction or upon request. Rainbow offers a transparent fee policy with no hidden charges." },
      { q: "Are there any sibling discounts?", a: "Yes, Rainbow International School offers a sibling discount for families enrolling more than one child. Details are available from the admissions office." },
      { q: "What are the payment options?", a: "Fees can be paid annually, semi-annually, or quarterly. Payment is accepted via bank transfer, cheque, or online payment. EMI options are not currently available." },
      { q: "Is the transport fee separate?", a: "Yes, the transport fee is charged separately based on the distance of pickup and drop. GPS-tracked buses cover 30+ routes across Thane.", links: [{ label: "Learn About Transport", href: "/amenities" }] },
    ],
  },
  {
    id: "academics",
    title: "Academics & Curriculum",
    faqs: [
      { q: "Which board is Rainbow International School affiliated to?", a: "Rainbow International School is affiliated to the Central Board of Secondary Education (CBSE), New Delhi. Our affiliation number is 1130661.", links: [{ label: "CBSE Public Disclosures", href: "/cbse-mandatory-public-disclosures" }] },
      { q: "What streams are available in Class 11–12?", a: "We offer three streams in the Senior Secondary section: Science (Physics, Chemistry, Mathematics/Biology), Commerce (Accountancy, Business Studies, Economics), and Humanities (Psychology, Sociology, Political Science, History).", links: [{ label: "Senior Secondary Section", href: "/senior-secondary-section" }] },
      { q: "What teaching methodology does the school follow?", a: "Rainbow follows a Multiple Intelligence-based pedagogy that combines experiential learning, project-based activities, digital integration, and collaborative learning. This ensures holistic development across all intelligences — linguistic, logical, spatial, musical, kinesthetic, interpersonal, intrapersonal, and naturalistic.", links: [{ label: "Our Philosophy", href: "/our-philosophy" }] },
      { q: "Does the school provide extra coaching for board exams?", a: "Yes, starting from Class 9, the school provides structured revision programmes, mock tests, doubt-clearing sessions, and personalised support to help students prepare for CBSE board examinations." },
      { q: "How does the school support students with learning difficulties?", a: "Rainbow has a dedicated counselling team that works with students who need additional academic or emotional support. Individualised learning plans, remedial classes, and parent counselling are part of our inclusive education approach." },
    ],
  },
  {
    id: "safety",
    title: "Safety & Security",
    faqs: [
      { q: "What safety measures are in place?", a: "The campus has 200+ CCTV cameras, trained security guards at all entry and exit points, fire safety systems, an on-campus infirmary with a paediatrician, card-based entry for parents, and GPS-tracked school buses with attendants on every route.", links: [{ label: "Safety & Security Details", href: "/safety-security" }] },
      { q: "Is there a school nurse or doctor?", a: "Yes, Rainbow has a full-time infirmary staffed by trained medical professionals. A visiting paediatrician is available for regular health check-ups and emergencies." },
      { q: "How does the school handle bullying?", a: "Rainbow has a zero-tolerance policy for bullying. The school counsellor conducts regular anti-bullying workshops. Any reported incidents are investigated promptly, and appropriate action is taken in coordination with parents." },
    ],
  },
  {
    id: "timings",
    title: "Timings & Calendar",
    faqs: [
      { q: "What are the school timings?", a: "Pre-Primary (Nursery to Sr KG): 8:30 AM to 12:30 PM. Primary (Class 1–5): 7:30 AM to 2:00 PM. Middle & Secondary (Class 6–12): 7:30 AM to 2:30 PM. Timings may vary slightly for special activities." },
      { q: "How many days a week does the school operate?", a: "The school operates Monday to Saturday. Saturdays typically have a shorter schedule and are used for enrichment activities, sports, or special programmes." },
      { q: "When does the academic year start?", a: "The academic year begins in June and ends in April, following the CBSE academic calendar. A detailed academic calendar is shared with parents at the start of the year.", links: [{ label: "Academic Calendar", href: "/academic-calendar" }] },
    ],
  },
  {
    id: "transport",
    title: "Transport",
    faqs: [
      { q: "Does the school provide bus transport?", a: "Yes, Rainbow operates a fleet of GPS-tracked school buses covering 30+ routes across all of Thane. Each bus has a trained attendant. Parents can track the bus location in real time via the school app." },
      { q: "What areas does the bus service cover?", a: "Bus routes cover all major areas across Thane. New routes are added based on demand. Please contact the transport office for route availability in your specific area." },
      { q: "Is the transport fee charged monthly or annually?", a: "Transport fees are charged along with the tuition fees on a quarterly or annual basis, depending on the payment plan chosen by the parent." },
    ],
  },
  {
    id: "extracurriculars",
    title: "Extracurriculars",
    faqs: [
      { q: "What extracurricular activities are available?", a: "Rainbow offers 30+ activities including swimming, skating, football, cricket, basketball, taekwondo, chess, robotics, coding, art, music, dance, drama, public speaking, MUN, and organic farming.", links: [{ label: "Extracurriculars", href: "/extracurriculars" }, { label: "Beyond the Classroom", href: "/beyond-the-classroom" }] },
      { q: "Are extracurricular activities included in the fees?", a: "Most in-school activities are included in the tuition fee. Specialised coaching programmes (e.g., advanced swimming, competitive sports, robotics) may have a nominal additional charge." },
      { q: "Does the school participate in inter-school competitions?", a: "Yes, students regularly participate and win at district, state, and national-level competitions in academics, sports, arts, and cultural events.", links: [{ label: "Awards & Achievements", href: "/awards-achievements" }] },
    ],
  },
  {
    id: "facilities",
    title: "Facilities",
    faqs: [
      { q: "What facilities does the campus have?", a: "The 3.5-acre campus includes smart classrooms, science and computer labs, a library, swimming pool, skating rink, football field, cricket ground, basketball and tennis courts, amphitheatre, art and music rooms, an organic farm, and a dedicated infirmary.", links: [{ label: "Amenities & Facilities", href: "/amenities" }] },
      { q: "Does the school have a cafeteria?", a: "Yes, Rainbow has a cafeteria that serves nutritious meals and snacks. The menu is curated to ensure balanced nutrition. Outside food vendors are not permitted." },
      { q: "Is there a library?", a: "Yes, the school has a well-stocked library with age-appropriate books across genres — fiction, non-fiction, reference, comics, and periodicals. Library periods are a regular part of the timetable." },
      { q: "Does the school use digital/smart classrooms?", a: "Yes, all classrooms from Class 1 onwards are equipped with interactive smart boards and digital learning tools. The pre-primary section uses age-appropriate audio-visual aids." },
    ],
  },
];

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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="FAQs — Admissions, Fees, Academics & More | Rainbow International School"
        description="Find answers to 30+ frequently asked questions about Rainbow International School, Thane — admissions, fees, curriculum, safety, timings, transport, extracurriculars, and facilities."
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
