import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { CheckCircle2, Target, Eye, BookOpen, Heart, Star, Users } from "lucide-react";

const academicSpaces = [
  "State-of-the-art Laboratories",
  "Library & Reading Room",
  "Multipurpose Hall",
  "Music Room",
  "Art & Craft Room",
  "Amphitheater",
  "Organic Farming Area",
  "Infirmary",
];

const sportsSpaces = [
  "Football Field",
  "Adventure Sports Field",
  "Skating Rink",
  "Swimming Pool",
  "Multipurpose Courts",
  "Cricket Ground",
  "Indoor Sports Facility",
];

const stats = [
  { num: "2009", label: "Founded" },
  { num: "1 Lac+", label: "Students Impacted" },
  { num: "3.5 Acres", label: "Campus Area" },
  { num: "3,000+", label: "Current Students" },
];

const philosophyPillars = [
  {
    icon: BookOpen,
    title: "Holistic Learning",
    desc: "We believe education extends beyond textbooks. Our curriculum integrates academics, arts, sports, and life skills to develop well-rounded individuals.",
  },
  {
    icon: Heart,
    title: "Values First",
    desc: "Empathy, integrity, and respect form the foundation of everything we do. We nurture character alongside intellect, preparing students to be compassionate citizens.",
  },
  {
    icon: Star,
    title: "Excellence in All",
    desc: "We set high standards — not just in examinations, but in sports, arts, community service, and personal growth. Every student is encouraged to give their best.",
  },
  {
    icon: Users,
    title: "Community & Belonging",
    desc: "Rainbow is a family. We build an inclusive environment where every child feels seen, celebrated, and supported — by teachers, peers, and parents alike.",
  },
];

const missionPoints = [
  "Deliver world-class CBSE education that equips students for a rapidly changing world",
  "Foster intellectual curiosity, critical thinking, and a lifelong love of learning",
  "Nurture physical, emotional, and social development alongside academic excellence",
  "Build a diverse, inclusive community that celebrates every child's unique potential",
  "Partner with families to create a seamless support system around each student",
];

export default function About() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="About Us | Rainbow International School Thane"
        description="Learn about Rainbow International School — founded in April 2009, serving 3000+ students across 3.5 acres in Thane. CBSE affiliated, Nursery to Class 12."
        keywords="about Rainbow International School, CBSE school Thane, best school Thane, Rainbow school history"
        canonical="https://www.rainbowinternationalschool.in/about-rainbow-international-school/"
        breadcrumbs={[
          { name: "Home", href: "https://www.rainbowinternationalschool.in/" },
          { name: "About Us", href: "https://www.rainbowinternationalschool.in/about-rainbow-international-school" },
        ]}
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Welcome to RIS"
        subtitle="Building tomorrow's leaders since April 2009"
        breadcrumb={[{ label: "About Us" }, { label: "Welcome to RIS" }]}
        bgImage="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
      />

      <main className="flex-grow">

        {/* ── Welcome to RIS ─────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-6" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                About the School
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: "#0d3b86" }}>
                Welcome to Rainbow International School
              </h2>
              <div className="space-y-4 text-gray-600 text-[15px] leading-[1.8]">
                <p>
                  Founded in <strong>April 2009, Rainbow International School</strong> has touched the lives of more than 1 lac students ever since.
                </p>
                <p>
                  Being one of the finest educational institutes in Thane, Rainbow International School has a campus that spans over <strong>3.5 acres</strong>. In addition to being a visible landmark, we are also enormous in terms of many other factors — more than <strong>3,000 students</strong> are enrolled across two shifts.
                </p>
                <p>
                  In addition to being synonymous with quality education, we at Rainbow International School are committed to all-around growth in our students. Rainbow allows its students to explore human excellence through competence, conscience, and compassion.
                </p>
                <p>
                  Our teaching methods integrate comfort, colors, and technology within classrooms, which enables our students not only to learn more effectively but also quickly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Campus images */}
        <section className="py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <img
                src="/images/extra/campus/school-front.jpg"
                alt="Rainbow International School — Main entrance with Rainbow logo"
                className="rounded-3xl shadow-sm w-full object-cover"
                width={800}
                height={533}
                loading="lazy"
                decoding="async"
              />
              <img
                src="/images/extra/campus/school-building.jpg"
                alt="Rainbow International School — Campus building and courtyard"
                className="rounded-3xl shadow-sm w-full object-cover"
                width={800}
                height={533}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6">
              <img
                src="/images/extra/classroom/science-lab.jpg"
                alt="Students doing experiments in science lab"
                className="rounded-2xl shadow-sm w-full object-cover aspect-[4/3]"
                width={400} height={300} loading="lazy" decoding="async"
              />
              <img
                src="/images/extra/classroom/students-turf.jpg"
                alt="Primary students enjoying time on the green turf"
                className="rounded-2xl shadow-sm w-full object-cover aspect-[4/3]"
                width={400} height={300} loading="lazy" decoding="async"
              />
              <img
                src="/images/extra/campus/swimming-pool.jpg"
                alt="Olympic-standard swimming pool at Rainbow International School"
                className="rounded-2xl shadow-sm w-full object-cover aspect-[4/3]"
                width={400} height={300} loading="lazy" decoding="async"
              />
              <img
                src="/images/extra/campus/monument.jpg"
                alt="Historical monument at Rainbow International School campus"
                className="rounded-2xl shadow-sm w-full object-cover aspect-[4/3]"
                width={400} height={300} loading="lazy" decoding="async"
              />
            </div>
          </div>
        </section>

        {/* Learning Spaces */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">Our Learning Spaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                <h3 className="font-black text-xl mb-5" style={{ color: "#0d3b86" }}>Academic Spaces</h3>
                <ul className="space-y-2.5">
                  {academicSpaces.map((s, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-gray-600 text-sm">
                      <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: "#0d3b86" }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                <h3 className="font-black text-xl mb-5" style={{ color: "#10b981" }}>Sports Spaces</h3>
                <ul className="space-y-2.5">
                  {sportsSpaces.map((s, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-gray-600 text-sm">
                      <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: "#10b981" }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Rainbow at a Glance */}
        <section className="py-20" style={{ background: "#091a4f" }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-white mb-12">Rainbow at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/10 rounded-3xl p-6 border border-white/10">
                  <div className="text-3xl font-black mb-2" style={{ color: "#fbbf24" }}>{s.num}</div>
                  <div className="text-white/70 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Chairperson's Note ────────────────────────────────── */}
        <section id="chairpersons-note" className="py-20 bg-white scroll-mt-32">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Leadership
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">Chairperson's Note</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="flex-shrink-0 flex flex-col items-center gap-4">
                  <div
                    className="w-52 h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white flex items-center justify-center"
                    style={{ boxShadow: "0 20px 60px -10px rgba(13,59,134,0.25)", background: "#f1f5f9" }}
                  >
                  </div>
                  <div className="text-center">
                    <p className="font-black text-gray-900 text-base">Chairperson</p>
                    <p className="text-sm text-gray-500">Rainbow International School</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div
                    className="rounded-3xl p-8 md:p-10 relative"
                    style={{ background: "#f8faff", border: "1.5px solid #dbeafe" }}
                  >
                    <span className="absolute -top-5 left-8 text-7xl leading-none font-serif" style={{ color: "#0d3b86", opacity: 0.15 }}>"</span>
                    <div className="space-y-5 text-gray-600 text-[15px] leading-[1.9] relative">
                      <p>
                        Dear Students, Parents, and Well-wishers,
                      </p>
                      <p>
                        It is with immense pride and a heart full of gratitude that I welcome you to <strong>Rainbow International School</strong> — a place where every child's story matters, and where the journey of learning is celebrated every single day.
                      </p>
                      <p>
                        When we founded Rainbow International School in <strong>April 2009</strong>, our vision was simple yet profound: to build an institution that nurtures not just academic brilliance, but also the values of empathy, perseverance, and global citizenship. Over the years, we have grown into a community of over <strong>3,000 students</strong> — each one a testament to what is possible when passionate educators, committed families, and curious young minds come together.
                      </p>
                      <p>
                        Education, in its truest sense, is about preparing children for life — not just examinations. At Rainbow, we believe that every child is uniquely gifted, and it is our responsibility to help each one discover, develop, and deploy their gifts in service of the world.
                      </p>
                      <p>
                        I invite you to experience the Rainbow difference — where tradition meets innovation, and every child dares to dream.
                      </p>
                      <p className="font-bold text-gray-800">
                        With warm regards,<br />
                        <span style={{ color: "#0d3b86" }}>Mrs. Akila Balbale</span><br />
                        <span style={{ color: "#0d3b86" }}>Chairperson</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIS Vision & Mission ──────────────────────────────── */}
        <section id="vision-mission" className="py-20 scroll-mt-32" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Our Purpose
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">RIS Vision & Mission</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-14">
              {/* Vision */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "#eef5ff" }}
                >
                  <Eye size={26} style={{ color: "#0d3b86" }} />
                </div>
                <h3 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>Our Vision</h3>
                <p className="text-gray-600 text-[15px] leading-[1.8]">
                  To be a <strong>globally respected centre of learning</strong> that empowers every student to discover their unique potential, embrace lifelong learning, and contribute meaningfully to society — grounded in strong values and an unwavering commitment to excellence.
                </p>
                <div
                  className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[40px] opacity-[0.06]"
                  style={{ background: "#0d3b86" }}
                />
              </div>

              {/* Mission */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "#fff7ed" }}
                >
                  <Target size={26} style={{ color: "#f97316" }} />
                </div>
                <h3 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>Our Mission</h3>
                <ul className="space-y-3">
                  {missionPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-600 text-[14px] leading-[1.7]">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black text-white"
                        style={{ background: "#0d3b86" }}
                      >
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div
                  className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[40px] opacity-[0.04]"
                  style={{ background: "#f97316" }}
                />
              </div>
            </div>

            {/* Core Values strip */}
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-sm font-bold tracking-widest uppercase text-gray-400 mb-6">Our Core Values</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {["Integrity", "Empathy", "Excellence", "Innovation", "Inclusion", "Responsibility", "Curiosity", "Resilience"].map((v, i) => (
                  <span
                    key={i}
                    className="px-5 py-2.5 rounded-full text-sm font-bold"
                    style={{ background: "#eef5ff", color: "#0d3b86", border: "1.5px solid #c7dbf8" }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Philosophy ────────────────────────────────────── */}
        <section id="our-philosophy" className="py-20 bg-white scroll-mt-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                How We Think
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Our Philosophy</h2>
              <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
                Education is not the filling of a pail, but the lighting of a fire. At Rainbow, we believe every child carries within them a spark — our role is to help it blaze.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-14">
              {philosophyPillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={i}
                    className="rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: "#eef5ff" }}
                    >
                      <Icon size={22} style={{ color: "#0d3b86" }} />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-3">{pillar.title}</h3>
                    <p className="text-gray-500 text-sm leading-[1.75]">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Philosophy quote banner */}
            <div
              className="max-w-4xl mx-auto rounded-3xl px-10 py-12 text-center"
              style={{ background: "linear-gradient(135deg, #0a2763 0%, #0d3b86 100%)" }}
            >
              <p className="text-white/90 text-lg md:text-xl leading-[1.8] font-light italic mb-5">
                "We do not teach children what to think. We teach them <strong className="font-black text-white not-italic">how</strong> to think — with courage, clarity, and compassion."
              </p>
              <p className="text-white/60 text-sm tracking-widest uppercase font-semibold">— Rainbow International School</p>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
