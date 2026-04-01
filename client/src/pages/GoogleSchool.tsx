import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { CheckCircle, Monitor, BookOpen, Users, BarChart2, Globe } from "lucide-react";

const tools = [
  { icon: Monitor, title: "Google Classroom", desc: "All assignments, lesson materials, and teacher feedback are delivered and managed through Google Classroom — accessible on any device, anytime." },
  { icon: Globe, title: "Google Workspace for Education", desc: "Students and teachers use Docs, Sheets, Slides, Drive, Meet, and Gmail as integrated daily tools for learning, collaboration, and communication." },
  { icon: BookOpen, title: "Digital Textbooks & Resources", desc: "Supplementary learning content, e-books, and curated educational resources available instantly through Google platforms." },
  { icon: Users, title: "Collaborative Learning", desc: "Students collaborate on projects in real time through Google Docs and Slides — developing teamwork and communication alongside subject knowledge." },
  { icon: BarChart2, title: "Progress Tracking", desc: "Teachers and parents can monitor assignment completion, grades, and learning progress in real time through integrated dashboards." },
  { icon: CheckCircle, title: "Google Certified Teachers", desc: "Rainbow's teachers include Google-certified educators, trained in the most effective use of Google tools for student engagement and learning." },
];

const highlights = [
  "Official Google for Education certified school",
  "1:1 device access in upper-primary and secondary classes",
  "Google Classroom used across all subjects and year groups",
  "Google-certified faculty across subject departments",
  "Seamless home–school learning continuity via Google platforms",
  "Safe, managed accounts for every student from Std. 1 upwards",
];

export default function GoogleSchool() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Google School 2025–26 | Rainbow International School Thane"
        description="Rainbow International School is a certified Google for Education school — integrating Google Classroom, Google Workspace, and Google-certified teaching for seamless, technology-enhanced learning."
        keywords="Google for Education school Thane, Google Classroom CBSE school, Rainbow International School Google certified, digital school Thane West"
        canonical="/google-school-2025-26"
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Google School 2025–26"
        subtitle="Rainbow International School — Certified Google for Education Partner"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Google School 2025–26" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-smart-classroom.jpg"
      />

      <main className="flex-1">
        {/* Hero statement */}
        <section className="py-16 px-4 bg-[#f8faff]">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm mb-8 border border-blue-100">
              <img src="https://rainbowinternationalschool.in/wp-content/uploads/2022/08/education.png" alt="Google for Education" className="h-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-bold text-[#0d3b86] text-sm">Certified Google for Education School — 2025–26</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#091a4f] mb-6">
              Technology That Enhances Every Lesson
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Rainbow International School's certification as a Google for Education school reflects our commitment
              to integrating world-class digital tools into the learning experience — not as a novelty but as
              a genuine enhancement to teaching quality, student engagement, and learning outcomes.
            </p>
          </div>
        </section>

        {/* Highlights checklist */}
        <section className="py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#091a4f] text-center mb-10">What Google for Education Means at Rainbow</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map(h => (
                <div key={h} className="flex items-start gap-3 bg-[#f8faff] rounded-xl p-4 border border-blue-100">
                  <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={18} />
                  <span className="text-sm text-gray-700">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools grid */}
        <section className="py-14 px-4 bg-[#f8faff]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#091a4f] text-center mb-2">Google Tools in Daily Learning</h2>
            <p className="text-center text-gray-500 text-sm mb-10">How Google's platform shapes the Rainbow classroom experience</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-[#0d3b86]" size={22} />
                  </div>
                  <h3 className="font-bold text-[#091a4f] mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pedagogy statement */}
        <section className="py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#0d3b86] to-[#091a4f] rounded-2xl p-10 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Technology in Service of Teaching</h2>
              <p className="text-blue-100 leading-relaxed max-w-2xl mx-auto">
                At Rainbow International School, technology is not a replacement for great teaching — it is an amplifier.
                Our Google-certified teachers use digital tools purposefully, in ways that deepen understanding,
                broaden access to knowledge, and prepare students for the digitally integrated professional world
                they will enter. The school's Google certification reflects the quality of this integration —
                assessed and recognised by Google's own standards.
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 px-4 bg-[#f8faff]">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#091a4f] text-center mb-8">Enquire About Admissions</h2>
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
