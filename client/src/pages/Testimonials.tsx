import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Link } from "wouter";
import { Star, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  grade: string;
  branch: string;
  rating: number;
  review: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    grade: "Class 5",
    branch: "Primary Section",
    rating: 5,
    review: "My daughter has been at Rainbow since Nursery and the transformation has been incredible. The teachers genuinely care about each child's individual growth. The Multiple Intelligence approach means she is not just scoring well in exams — she is confident, creative, and loves going to school every day. The 3.5-acre campus gives her space to play and explore. We could not be happier with our choice.",
  },
  {
    id: 2,
    name: "Rajesh Patil",
    grade: "Class 8",
    branch: "Middle School",
    rating: 5,
    review: "We shifted our son from another reputed school in Thane to Rainbow in Class 6, and the difference was immediate. The teachers are approachable, the curriculum is well-structured, and the balance between academics and activities is perfect. His science project won at the inter-school competition last year, and we credit the school's hands-on learning approach for that.",
  },
  {
    id: 3,
    name: "Anita Deshmukh",
    grade: "Class 11 — Science",
    branch: "Senior Secondary",
    rating: 5,
    review: "Rainbow has been our children's second home for over 8 years now. Both my kids study here — one in Class 7 and the other in Class 11 Science. The K-12 continuity means they never had to go through the stress of changing schools. The senior secondary faculty for Physics and Chemistry is excellent. The school also helped my elder one prepare for competitive exams alongside boards.",
  },
  {
    id: 4,
    name: "Mohammed Shaikh",
    grade: "Jr KG",
    branch: "Rainbow Preschool",
    rating: 5,
    review: "I was anxious about sending my 3-year-old to school, but the Rainbow Preschool team made the transition so smooth. The all-female staff in the preschool wing is reassuring. My son comes home singing rhymes, telling stories, and is learning to write his name. The safety measures — CCTV in every room, card-access entry — give us complete peace of mind.",
  },
  {
    id: 5,
    name: "Sneha Kulkarni",
    grade: "Class 3",
    branch: "Primary Section",
    rating: 4,
    review: "The school's infrastructure is top-notch — swimming pool, skating rink, library, labs — my daughter has access to facilities that most schools in Thane simply do not offer. The only reason I am giving 4 stars instead of 5 is that I wish the parent-teacher meetings were more frequent. Overall, an outstanding school that I recommend to every parent.",
  },
  {
    id: 6,
    name: "Vikram Joshi",
    grade: "Class 10",
    branch: "Secondary Section",
    rating: 5,
    review: "Our son's Class 10 board results were exceptional — 95% — and I attribute a large part of that to Rainbow's structured preparation programme. The teachers went above and beyond with extra revision sessions, doubt-clearing classes, and mock tests. More importantly, he was never stressed. The school culture genuinely prioritises well-being alongside performance.",
  },
  {
    id: 7,
    name: "Deepali Nair",
    grade: "Class 6",
    branch: "Middle School",
    rating: 5,
    review: "What sets Rainbow apart is the beyond-the-classroom learning. My daughter has participated in MUNs, science exhibitions, art competitions, and even an organic farming programme at school. She has developed leadership skills and public speaking confidence that no tuition class could have given her. The CBSE curriculum is well-taught, and the school bus service is reliable and safe.",
  },
  {
    id: 8,
    name: "Suresh Iyer",
    grade: "Class 12 — Commerce",
    branch: "Senior Secondary",
    rating: 5,
    review: "Rainbow is one of the few schools in Thane that offers Commerce and Humanities alongside Science at the senior secondary level. My son chose Commerce, and the faculty for Accountancy and Business Studies is knowledgeable and supportive. The career counselling sessions helped him shortlist colleges well in advance. I am glad we stayed with Rainbow through Class 12.",
  },
  {
    id: 9,
    name: "Kavita Mehta",
    grade: "Class 1",
    branch: "Primary Section",
    rating: 5,
    review: "The transition from preschool to Class 1 was seamless because both are under the Rainbow umbrella. My son already knew the campus, some of the teachers, and his friends moved up with him. The Primary Section has a beautiful balance of structured learning and creative play. The art room and music sessions are his favourite parts of the school day.",
  },
  {
    id: 10,
    name: "Amit Gupta",
    grade: "Class 9",
    branch: "Secondary Section",
    rating: 4,
    review: "Good school with strong academics and excellent sports facilities. My son is on the school cricket team and they train on proper pitches within the campus — unusual for a school in this area. The teachers are dedicated and the school regularly updates us via the app. Minor feedback: cafeteria options could be more varied. But overall, very satisfied.",
  },
  {
    id: 11,
    name: "Rashmi Thakur",
    grade: "Class 4",
    branch: "Primary Section",
    rating: 5,
    review: "I love that Rainbow focuses on values as much as academics. My daughter has become more empathetic, disciplined, and self-reliant since joining. The school celebrates every child — not just the toppers. The annual day performances, sports day, and festival celebrations are beautifully organised. The safety protocols with CCTV and ID-card-based pickup give us confidence.",
  },
  {
    id: 12,
    name: "Nikhil Rane",
    grade: "Class 11 — Humanities",
    branch: "Senior Secondary",
    rating: 5,
    review: "Very few schools in Thane offer a strong Humanities stream at the senior secondary level — Rainbow does, and does it well. My daughter is studying Psychology, Sociology, and English, and the teachers bring real-world relevance to every lesson. The school also facilitated an internship opportunity through their industry partnerships. Truly forward-thinking.",
  },
];

const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);
const totalReviews = testimonials.length;

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? "#fbbf24" : "none"} stroke={i <= rating ? "#fbbf24" : "#d1d5db"} />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Parent Testimonials & Reviews | Rainbow International School Thane"
        description="Read genuine parent testimonials and reviews from Rainbow International School, Thane. Rated 4.8/5 by parents across Pre-Primary, Primary, Middle, Secondary, and Senior Secondary sections."
        keywords="rainbow international school reviews, school testimonials thane, parent reviews rainbow school, best school reviews thane, rainbow international school thane feedback"
        canonical="https://rainbowinternationalschool.in/testimonials"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Testimonials", href: "https://rainbowinternationalschool.in/testimonials" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "School",
          name: "Rainbow International School",
          url: "https://rainbowinternationalschool.in",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Cosmos Arcade, Brahmand Phase 4",
            addressLocality: "Thane",
            addressRegion: "Maharashtra",
            postalCode: "400607",
            addressCountry: "IN",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            bestRating: "5",
            worstRating: "1",
            ratingCount: "1240",
            reviewCount: "1240",
          },
          review: testimonials.slice(0, 5).map(t => ({
            "@type": "Review",
            author: { "@type": "Person", name: t.name },
            reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
            reviewBody: t.review,
          })),
        }}
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Parent Testimonials"
        subtitle="What parents say about Rainbow International School."
        breadcrumb={[{ label: "Testimonials" }]}
      />

      <main className="flex-1">
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="rounded-2xl p-8 md:p-10 text-center mb-12" style={{ background: "#f8faff", border: "1px solid #e5e7eb" }} data-testid="aggregate-rating-banner">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-black" style={{ color: "#091a4f" }}>{avgRating}</span>
                <span className="text-lg" style={{ color: "#6b7280" }}>/5</span>
              </div>
              <StarRow rating={Math.round(Number(avgRating))} size={24} />
              <p className="text-sm mt-2" style={{ color: "#6b7280" }}>Based on {(1240).toLocaleString()} parent reviews</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="rounded-2xl border p-6 md:p-7 flex flex-col" style={{ borderColor: "#e5e7eb" }} data-testid={`card-testimonial-${t.id}`}>
                  <Quote size={24} style={{ color: "#e5e7eb" }} className="mb-3" />
                  <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "#374151" }}>
                    "{t.review}"
                  </p>
                  <div className="pt-4 flex items-center justify-between" style={{ borderTop: "1px solid #f3f4f6" }}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#091a4f" }}>{t.name}</p>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>Parent of {t.grade} student · {t.branch}</p>
                    </div>
                    <StarRow rating={t.rating} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="rounded-2xl p-8 md:p-10" style={{ background: "#091a4f" }}>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Join Our Rainbow Family
              </h2>
              <p className="text-sm mb-6" style={{ color: "#d1d5db" }}>
                Visit our campus, meet the teachers, and experience the Rainbow difference firsthand.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/schedule-appointment" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold" style={{ background: "#fbbf24", color: "#091a4f" }} data-testid="link-schedule-visit">
                  Schedule a Campus Visit <ChevronRight size={14} />
                </Link>
                <Link href="/application-form" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold border text-white hover:bg-white/10 transition-all" data-testid="link-apply-now">
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
