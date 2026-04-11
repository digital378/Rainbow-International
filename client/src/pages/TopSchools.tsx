import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Link } from "wouter";
import { Star, CheckCircle2, ChevronRight, MapPin, Users, BookOpen, Trophy, Shield, Bus } from "lucide-react";

interface School {
  rank: number;
  name: string;
  board: string;
  grades: string;
  location: string;
  rating: number;
  reviews: number;
  highlights: string[];
  considerations: string[];
  featured?: boolean;
}

const schools: School[] = [
  {
    rank: 1,
    name: "Rainbow International School",
    board: "CBSE",
    grades: "Nursery – Class 12",
    location: "Brahmand Phase 4, Thane",
    rating: 4.8,
    reviews: 1240,
    highlights: [
      "3.5-acre green campus with world-class infrastructure",
      "Complete K–12 pathway from Rainbow Preschool to Class 12",
      "CBSE Affiliation No. 1130661 — Science, Commerce & Humanities",
      "Multiple Intelligence pedagogy with experiential learning",
      "30+ extracurricular activities including swimming, skating, robotics",
      "GPS-tracked transport covering 30+ routes across Thane",
      "International School Award by British Council",
      "Times Education Icon Award — Best CBSE School, Thane",
    ],
    considerations: ["High demand — early application recommended"],
    featured: true,
  },
  {
    rank: 2,
    name: "Smt. Sulochanadevi Singhania School",
    board: "ICSE / ISC",
    grades: "Nursery – Class 12",
    location: "Pokhran Road, Thane",
    rating: 4.5,
    reviews: 980,
    highlights: ["Well-established ICSE school", "Strong academic track record", "Good sports facilities"],
    considerations: ["ICSE board only", "Limited bus routes"],
  },
  {
    rank: 3,
    name: "Vasant Vihar High School",
    board: "SSC / CBSE",
    grades: "Nursery – Class 10",
    location: "Majiwada, Thane",
    rating: 4.4,
    reviews: 760,
    highlights: ["Dual board option", "Affordable fee structure", "Community-focused"],
    considerations: ["No Class 11–12", "Smaller campus"],
  },
  {
    rank: 4,
    name: "DAV Public School",
    board: "CBSE",
    grades: "Class 1 – Class 12",
    location: "Thane",
    rating: 4.3,
    reviews: 640,
    highlights: ["Strong CBSE academics", "Value-based education", "Good science labs"],
    considerations: ["No pre-primary section", "Limited extracurriculars"],
  },
  {
    rank: 5,
    name: "Hiranandani Foundation School",
    board: "ICSE",
    grades: "Nursery – Class 10",
    location: "Hiranandani Estate, Thane",
    rating: 4.3,
    reviews: 580,
    highlights: ["Modern campus in Hiranandani Estate", "Strong academics", "ICSE curriculum"],
    considerations: ["No senior secondary", "ICSE board only"],
  },
  {
    rank: 6,
    name: "C.P. Goenka International School",
    board: "IGCSE / IBDP",
    grades: "Nursery – Class 12",
    location: "Pokhran Road, Thane",
    rating: 4.2,
    reviews: 420,
    highlights: ["International curriculum", "Modern infrastructure", "Global exposure"],
    considerations: ["Higher fee structure", "Smaller student body"],
  },
  {
    rank: 7,
    name: "Orchids International School",
    board: "CBSE",
    grades: "Nursery – Class 12",
    location: "Kapurbawdi, Thane",
    rating: 4.1,
    reviews: 390,
    highlights: ["Technology-driven learning", "Chain school with standardised quality", "Good digital infrastructure"],
    considerations: ["Chain school — less personalised attention", "Newer campus"],
  },
  {
    rank: 8,
    name: "Euro School",
    board: "CBSE",
    grades: "Nursery – Class 10",
    location: "Thane",
    rating: 4.1,
    reviews: 350,
    highlights: ["Modern teaching methods", "Well-maintained campus", "Activity-based learning"],
    considerations: ["No senior secondary", "Limited outdoor sports space"],
  },
  {
    rank: 9,
    name: "Billabong High International School",
    board: "CBSE / IGCSE",
    grades: "Nursery – Class 12",
    location: "Waghbil, Thane",
    rating: 4.0,
    reviews: 310,
    highlights: ["Dual curriculum option", "Established brand", "Focus on holistic development"],
    considerations: ["Higher fee bracket", "Bus coverage limited"],
  },
  {
    rank: 10,
    name: "St. John the Baptist High School",
    board: "SSC",
    grades: "Class 1 – Class 10",
    location: "Thane",
    rating: 4.0,
    reviews: 480,
    highlights: ["Long-standing reputation", "Strong community values", "Affordable"],
    considerations: ["SSC board only", "No pre-primary or senior secondary", "Older infrastructure"],
  },
];

const chooseFactors = [
  { icon: BookOpen, title: "Curriculum & Board", desc: "CBSE offers national-level consistency and flexibility for competitive exams. ICSE emphasises detailed understanding. Choose based on your child's future plans." },
  { icon: MapPin, title: "Location & Transport", desc: "A school close to home or with reliable transport reduces daily stress. Look for GPS-tracked buses and multiple routes." },
  { icon: Users, title: "Teacher-Student Ratio", desc: "Smaller class sizes mean more individual attention. A ratio of 1:25 or better is considered ideal for personalised learning." },
  { icon: Trophy, title: "Extracurriculars", desc: "Sports, arts, music, and clubs are essential for holistic development. Look for schools with diverse activity programmes." },
  { icon: Shield, title: "Safety & Infrastructure", desc: "CCTV surveillance, fire safety, trained security, first-aid facilities, and well-maintained buildings are non-negotiable." },
  { icon: Bus, title: "K–12 Pathway", desc: "A school that covers Nursery to Class 12 provides continuity, stability, and avoids disruptive transitions." },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} fill={i <= Math.floor(rating) ? "#fbbf24" : i - 0.5 <= rating ? "#fbbf24" : "none"} stroke={i <= rating ? "#fbbf24" : "#d1d5db"} />
      ))}
      <span className="text-sm font-bold ml-1" style={{ color: "#091a4f" }}>{rating}</span>
    </div>
  );
}

export default function TopSchools() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Top 10 Schools in Thane (2026) — Best CBSE, ICSE & International Schools | Rainbow International School"
        description="Compare the top 10 schools in Thane for 2026. Detailed ratings, reviews, highlights, and considerations for CBSE, ICSE, and International schools. Find the best school for your child."
        keywords="top schools in thane, best schools thane, school comparison thane, best CBSE school thane, best ICSE school thane, top 10 schools thane 2026"
        canonical="https://rainbowinternationalschool.in/top-schools-in-thane"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Top Schools in Thane", href: "https://rainbowinternationalschool.in/top-schools-in-thane" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Top 10 Schools in Thane (2026)",
          description: "A comprehensive comparison of the top 10 schools in Thane covering CBSE, ICSE, and International boards.",
          numberOfItems: 10,
          itemListElement: schools.map(s => ({
            "@type": "ListItem",
            position: s.rank,
            item: {
              "@type": "School",
              name: s.name,
              address: { "@type": "PostalAddress", addressLocality: "Thane", addressRegion: "Maharashtra", addressCountry: "IN" },
            },
          })),
        }}
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Top 10 Schools in Thane (2026)"
        subtitle="A comprehensive comparison to help you choose the best school for your child."
        breadcrumb={[{ label: "Top Schools in Thane" }]}
      />

      <main className="flex-1">
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-base leading-relaxed mb-12 max-w-3xl" style={{ color: "#6b7280" }}>
              Choosing the right school is one of the most important decisions a parent makes. We have compiled this comparison of the top 10 schools in Thane based on infrastructure, academic performance, extracurricular offerings, parent reviews, and overall reputation to help you make an informed choice.
            </p>

            <div className="space-y-6">
              {schools.map(school => (
                <div
                  key={school.rank}
                  className="rounded-2xl border-2 p-6 md:p-8 transition-all"
                  style={{
                    borderColor: school.featured ? "#091a4f" : "#e5e7eb",
                    background: school.featured ? "#f8faff" : "#fff",
                  }}
                  data-testid={`card-school-${school.rank}`}
                >
                  <div className="flex flex-wrap items-start gap-4 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                      style={{
                        background: school.featured ? "#091a4f" : "#f3f4f6",
                        color: school.featured ? "#fbbf24" : "#6b7280",
                      }}
                    >
                      #{school.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-lg md:text-xl font-bold" style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}>{school.name}</h2>
                        {school.featured && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "#fbbf24", color: "#091a4f" }} data-testid="badge-featured">
                            ★ Top Pick
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "#6b7280" }}>
                        <span className="font-medium px-2 py-0.5 rounded" style={{ background: "#eef5ff", color: "#0d3b86" }}>{school.board}</span>
                        <span>{school.grades}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {school.location}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StarRating rating={school.rating} />
                      <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>{school.reviews.toLocaleString()} reviews</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#059669" }}>Highlights</p>
                      <ul className="space-y-1.5">
                        {school.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                            <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#059669" }} /> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#d97706" }}>Things to Consider</p>
                      <ul className="space-y-1.5">
                        {school.considerations.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#d97706" }} /> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {school.featured && (
                    <div className="mt-6 pt-4 flex flex-wrap gap-3" style={{ borderTop: "1px solid #e5e7eb" }}>
                      <Link href="/about-rainbow-international-school" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: "#091a4f" }} data-testid="link-about-rainbow">
                        Learn More <ChevronRight size={14} />
                      </Link>
                      <Link href="/schedule-appointment" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold border" style={{ borderColor: "#091a4f", color: "#091a4f" }} data-testid="link-visit-rainbow">
                        Schedule a Visit <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}>
              How to Choose the Right School
            </h2>
            <p className="text-center text-base max-w-2xl mx-auto mb-12" style={{ color: "#6b7280" }}>
              Beyond rankings, here are the key factors every parent should evaluate when selecting a school in Thane.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chooseFactors.map((f, i) => (
                <div key={i} className="rounded-xl bg-white border p-6" style={{ borderColor: "#e5e7eb" }} data-testid={`card-factor-${i}`}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "#eef5ff" }}>
                    <f.icon size={20} style={{ color: "#0d3b86" }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "#091a4f" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="rounded-2xl p-8 md:p-10" style={{ background: "#091a4f" }}>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Visit Rainbow International School
              </h2>
              <p className="text-sm mb-6" style={{ color: "#d1d5db" }}>
                Experience our 3.5-acre campus, meet our educators, and see why we are Thane's top-rated CBSE school.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/schedule-appointment" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold" style={{ background: "#fbbf24", color: "#091a4f" }} data-testid="link-schedule-cta">
                  Schedule a Campus Visit <ChevronRight size={14} />
                </Link>
                <Link href="/application-form" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold border text-white hover:bg-white/10 transition-all" data-testid="link-apply-cta">
                  Apply Now <ChevronRight size={14} />
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
