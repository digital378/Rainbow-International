import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const streams = [
  {
    icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-40-Traced.png",
    stream: "Science",
    mandatory: "Mandatory English (Core)",
    subjects: ["Hindi (Core)", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
  },
  {
    icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-41-Traced.png",
    stream: "Humanities",
    mandatory: "Mandatory English (Core)",
    subjects: ["Hindi (Core)", "Psychology", "Economics", "History", "Political Science", "Computer Science", "Fine Arts"],
  },
  {
    icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-39-Traced.png",
    stream: "Commerce",
    mandatory: "Mandatory English (Core)",
    subjects: ["Hindi (Core)", "Mathematics", "Economics", "Business Studies", "Accountancy", "Computer Science"],
  },
];

export default function SeniorSecondary() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Senior Secondary Section (Class 11-12) - Rainbow International School"
        description="Rainbow International School's Senior Secondary Section (Class 11 & 12). Science, Humanities, and Commerce streams. CBSE affiliation number 1130661. Preparing students for professional objectives."
        keywords="senior secondary school Thane, Class 11 12 CBSE Thane West, science commerce humanities Thane school, Rainbow school Class 11"
        canonical="https://rainbowinternationalschool.in/senior-secondary-section/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/senior-secondary-768x513.png"
      />
      <Navbar />
      <PageBanner
        title="Senior Secondary Section"
        subtitle="Class 11 & 12"
        breadcrumb={[{ label: "Senior Secondary Section" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/secondary-school-class-9-class-10-international-school-admission-ad-1.jpg"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              A Major Advancement toward Students' Professional Objectives & Aspirations. Through a rigorous accreditation process, RIS has been affiliated to the CBSE Board for <strong>Science, Commerce and Humanities</strong> streams.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-2">
              Details of our affiliation can be found through our affiliation number: <strong>1130661</strong>.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We offer a slew of subject options for our students to choose from, to ensure their education is customised around what their exact career plans are, and to provide the flexibility to explore alternatives that are rarely offered elsewhere.
            </p>
          </div>
        </section>

        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12" style={{ color: "#0d3b86" }}>Streams & Subjects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {streams.map((s, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <img src={s.icon} alt={s.stream} className="w-14 h-14 mb-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <h3 className="font-black text-xl mb-1" style={{ color: "#0d3b86" }}>{s.stream}</h3>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-4">{s.mandatory}</p>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Any Four Subjects:</p>
                  <ul className="space-y-1">
                    {s.subjects.map((sub, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-600 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">Admissions are Open for the Academic Year 2025–26</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full transition-colors border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900">Enquire Now</a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
