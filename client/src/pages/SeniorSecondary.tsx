import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

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
    <div className="min-h-screen bg-background flex flex-col">
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
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              A Major Advancement toward Students' Professional Objectives & Aspirations. Through a rigorous accreditation process, RIS has been affiliated to the CBSE Board for <strong>Science, Commerce and Humanities</strong> streams.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-2">
              Details of our affiliation can be found through our affiliation number: <strong>1130661</strong>.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We offer a slew of subject options for our students to choose from, to ensure their education is customised around what their exact career plans are, and to provide the flexibility to explore alternatives that are rarely offered elsewhere.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-primary text-center mb-12">Streams & Subjects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {streams.map((s, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow border">
                  <img src={s.icon} alt={s.stream} className="w-14 h-14 mb-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <h3 className="font-serif font-bold text-xl text-primary mb-1">{s.stream}</h3>
                  <p className="text-xs text-secondary font-bold uppercase tracking-wide mb-4">{s.mandatory}</p>
                  <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Any Four Subjects:</p>
                  <ul className="space-y-1">
                    {s.subjects.map((sub, j) => (
                      <li key={j} className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="bg-secondary py-10 text-center">
          <p className="text-primary font-bold text-lg mb-4">Admissions are Open for the Academic Year 2025–26</p>
          <a href="#contact" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">Enquire Now</a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
