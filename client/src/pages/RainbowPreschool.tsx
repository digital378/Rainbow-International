import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Link } from "wouter";
import ScrollProgress from "@/components/home/ScrollProgress";

const programs = [
  { name: "Playgroup", age: "1.5 – 2.5 years", description: "A gentle introduction to structured learning through play, music, and sensory activities." },
  { name: "Nursery", age: "2.5 – 3.5 years", description: "Building social skills, language development, and early numeracy through hands-on learning." },
  { name: "Jr. KG", age: "3.5 – 4.5 years", description: "Developing reading readiness, creative thinking, and motor skills in a safe environment." },
  { name: "Sr. KG", age: "4.5 – 5.5 years", description: "Preparing children for primary school with structured academics, activities, and self-confidence." },
];

export default function RainbowPreschool() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Rainbow Preschool International - Thane West"
        description="Rainbow Preschool International — a nurturing preschool environment for children aged 1.5 to 5.5 years. Playgroup, Nursery, Jr KG, and Sr KG programmes in Thane West."
        keywords="Rainbow Preschool International, preschool Thane West, playgroup Thane, nursery admission Thane, Rainbow pre-primary school"
        canonical="https://rainbowinternationalschool.in/rainbow-preschool-international/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-preschool-playgroup-banner-1.jpg"
      />
      <Navbar />
      <PageBanner
        title="Rainbow Preschool International"
        subtitle="Where Little Dreamers Begin Their Journey"
        breadcrumb={[{ label: "Rainbow Preschool" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-preschool-playgroup-banner-1.jpg"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              Rainbow Preschool International is a warm, nurturing environment where children between the ages of <strong>1.5 to 5.5 years</strong> begin their educational journey. Built on the pillars of play-based and activity-based learning, our preschool develops the whole child — emotionally, cognitively, socially, and physically.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              Our preschool has been recognized among the <strong>Best Preschools in India</strong> by The Knowledge Review Magazine, and was awarded at the 15th World Education Summit for "Profound Technology usage in Early Childhood Teaching."
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              <strong>100% female staff</strong> ensures a safe and nurturing environment for every child. Our educators are trained in early childhood development, ensuring the best start for your little one.
            </p>
          </div>
        </section>

        <section className="py-14" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/PPS-02.jpg"
              alt="Rainbow Preschool students"
              className="rounded-3xl shadow-sm w-full object-cover max-h-80"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>Our Programmes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {programs.map((prog, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center" data-testid={`card-preschool-${i}`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black" style={{ background: "#fef3c7", color: "#0d3b86" }}>{i + 1}</div>
                  <h3 className="font-black text-xl mb-1" style={{ color: "#0d3b86" }}>{prog.name}</h3>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-3">{prog.age}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{prog.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <h2 className="text-2xl font-black text-white mb-4">Admissions Open for 2025–26</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">Limited seats available. Enquire today to secure your child's place at Rainbow Preschool International.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/pre-primary-school-thane" className="inline-block text-gray-900 font-bold py-3 px-8 rounded-full bg-amber-400 hover:bg-amber-300 transition-colors">
              View Pre-Primary Page
            </Link>
            <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-white/30 hover:border-white transition-colors">
              Enquire Now
            </a>
          </div>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
