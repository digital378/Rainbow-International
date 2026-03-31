import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { CheckCircle2 } from "lucide-react";

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
  { num: "50,000+", label: "Students Impacted" },
  { num: "3.5 Acres", label: "Campus Area" },
  { num: "3,000+", label: "Current Students" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="About Rainbow International School - Thane West"
        description="Learn about Rainbow International School — founded in April 2009, serving 3000+ students across 3.5 acres in Thane West. CBSE affiliated, Nursery to Class 12."
        keywords="about Rainbow International School, CBSE school Thane West, best school Thane, Rainbow school history"
        canonical="https://rainbowinternationalschool.in/about-rainbow-international-school/"
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="About Rainbow"
        breadcrumb={[{ label: "About Rainbow" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-gray-900 mb-6" style={{ color: "#0d3b86" }}>
                Welcome to Rainbow International School
              </h2>
              <div className="space-y-4 text-gray-600 text-[15px] leading-[1.8]">
                <p>
                  Founded in <strong>April 2009, Rainbow International School</strong> has touched the lives of more than 50,000 students ever since.
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

        <section className="py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <img
                src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
                alt="Rainbow International School Infrastructure"
                className="rounded-3xl shadow-sm w-full object-cover"
              />
              <img
                src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/01.jpeg"
                alt="Rainbow International School Campus"
                className="rounded-3xl shadow-sm w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">Our Learning Spaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 text-xl mb-5" style={{ color: "#0d3b86" }}>Academic Spaces</h3>
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
                <h3 className="font-black text-gray-900 text-xl mb-5" style={{ color: "#0d3b86" }}>Sports Spaces</h3>
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

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
