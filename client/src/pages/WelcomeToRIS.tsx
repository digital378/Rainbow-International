import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Link } from "wouter";
import ScrollProgress from "@/components/home/ScrollProgress";

export default function WelcomeToRIS() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Welcome to Rainbow International School"
        description="Welcome to Rainbow International School — founded in 2009, one of the finest CBSE-affiliated educational institutes in Thane with 3.5 acres campus and 3000+ students."
        keywords="Welcome Rainbow International School, about Rainbow school, Rainbow International School Thane"
        canonical="https://www.rainbowinternationalschool.in/about-rainbow-international-school"
      />
      <Navbar />
      <PageBanner
        title="Welcome to Rainbow International School"
        breadcrumb={[{ label: "About Us", href: "/about-rainbow-international-school" }, { label: "Welcome to RIS" }]}
        bgImage="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black mb-6" style={{ color: "#0d3b86" }}>A Legacy of Excellence Since 2009</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>Founded in <strong>April 2009</strong>, Rainbow International School has touched the lives of more than <strong>1 lac students</strong> ever since.</p>
                  <p>Being one of the finest educational institutes in Thane, Rainbow International School is considered to have a campus that spans over <strong>3.5 acres</strong>. More than <strong>3,000 students</strong> are enrolled across two shifts.</p>
                  <p>In addition to being synonymous with quality education, we at Rainbow International School are committed to all-around growth in our students. Rainbow allows its students to explore human excellence through <strong>Competence, Conscience, and Compassion</strong>.</p>
                  <p>Our teaching methods integrate comfort, colors, and technology within classrooms, which enables our students not only to learn more effectively but also quickly.</p>
                </div>
                <div className="mt-6 flex gap-3 flex-wrap">
                  <Link href="/chairpersons-note" className="inline-block text-white font-semibold py-2.5 px-6 rounded-full hover:opacity-90 transition-opacity text-sm" style={{ background: "#0d3b86" }}>
                    Chairperson's Note
                  </Link>
                  <Link href="/ris-vision-mission" className="inline-block font-semibold py-2.5 px-6 rounded-full border-2 transition-colors text-sm" style={{ borderColor: "#0d3b86", color: "#0d3b86" }}>
                    Vision & Mission
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                <img
                  src="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
                  alt="Rainbow International School"
                  className="rounded-3xl shadow-sm w-full object-cover"
                  width={1024}
                  height={536}
                  loading="lazy"
                  decoding="async"
                />
                <div className="grid grid-cols-2 gap-4">
                  {[["2009", "Founded"], ["1 Lac+", "Students Impacted"], ["3.5 Acres", "Campus Size"], ["3,000+", "Current Students"]].map(([val, label], i) => (
                    <div key={i} className="rounded-3xl p-4 text-center border border-gray-100" style={{ background: "#f8faff" }}>
                      <div className="text-2xl font-black" style={{ color: "#0d3b86" }}>{val}</div>
                      <div className="text-xs text-gray-500 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
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
