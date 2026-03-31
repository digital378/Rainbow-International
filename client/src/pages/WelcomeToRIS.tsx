import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Link } from "wouter";

export default function WelcomeToRIS() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Welcome to Rainbow International School - Thane West"
        description="Welcome to Rainbow International School — founded in 2009, one of the finest CBSE-affiliated educational institutes in Thane West with 3.5 acres campus and 3000+ students."
        keywords="Welcome Rainbow International School, about Rainbow school, Rainbow International School Thane"
        canonical="https://rainbowinternationalschool.in/about-rainbow-international-school/"
      />
      <Navbar />
      <PageBanner
        title="Welcome to Rainbow International School"
        breadcrumb={[{ label: "About Us", href: "/about-rainbow-international-school" }, { label: "Welcome to RIS" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold text-primary mb-6">A Legacy of Excellence Since 2009</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>Founded in <strong>April 2009</strong>, Rainbow International School has touched the lives of more than <strong>50,000 students</strong> ever since.</p>
                  <p>Being one of the finest educational institutes in Thane, Rainbow International School is considered to have a campus that spans over <strong>3.5 acres</strong>. More than <strong>3,000 students</strong> are enrolled across two shifts.</p>
                  <p>In addition to being synonymous with quality education, we at Rainbow International School are committed to all-around growth in our students. Rainbow allows its students to explore human excellence through <strong>Competence, Conscience, and Compassion</strong>.</p>
                  <p>Our teaching methods integrate comfort, colors, and technology within classrooms, which enables our students not only to learn more effectively but also quickly.</p>
                </div>
                <div className="mt-6 flex gap-3 flex-wrap">
                  <Link href="/chairpersons-note" className="inline-block bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    Chairperson's Note
                  </Link>
                  <Link href="/ris-vision-mission" className="inline-block border-2 border-primary text-primary font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/5 transition-colors text-sm">
                    Vision & Mission
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
                  alt="Rainbow International School"
                  className="rounded-2xl shadow-lg w-full object-cover"
                />
                <div className="grid grid-cols-2 gap-4">
                  {[["2009", "Founded"], ["50,000+", "Students Impacted"], ["3.5 Acres", "Campus Size"], ["3,000+", "Current Students"]].map(([val, label], i) => (
                    <div key={i} className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
                      <div className="text-2xl font-bold font-serif text-primary">{val}</div>
                      <div className="text-xs text-muted-foreground mt-1">{label}</div>
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
