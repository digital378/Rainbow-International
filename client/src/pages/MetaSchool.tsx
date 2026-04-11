import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { CheckCircle, Users, Globe, Lightbulb, Shield, TrendingUp } from "lucide-react";

const pillars = [
  { icon: Users, title: "Digital Citizenship", desc: "Students learn to navigate the digital world responsibly — understanding privacy, digital footprint, online safety, and respectful online communication." },
  { icon: Lightbulb, title: "Creative Thinking", desc: "Meta's educational frameworks encourage students to think creatively with technology — developing content, solving problems, and expressing ideas digitally." },
  { icon: Globe, title: "Connected Learning", desc: "Meta's tools support collaborative, connected learning experiences that extend beyond the classroom and build real-world communication skills." },
  { icon: Shield, title: "Online Safety & Wellbeing", desc: "Rainbow integrates Meta's digital wellbeing guidelines into its student curriculum — teaching healthy technology habits from an early age." },
  { icon: TrendingUp, title: "Future-Ready Skills", desc: "Exposure to Meta's platforms and frameworks develops the digital fluency and adaptability that the modern professional world requires." },
  { icon: CheckCircle, title: "Teacher Development", desc: "Our faculty receives ongoing development in digital pedagogy aligned with Meta's education programmes — raising teaching quality across the board." },
];

const highlights = [
  "Meta for Education partnership — 2025–26",
  "Digital citizenship integrated across the curriculum",
  "Online safety and wellbeing programme for all year groups",
  "Social media literacy taught from middle school",
  "Parent workshops on digital parenting aligned with Meta's guidelines",
  "Faculty development in digital-age pedagogy",
];

export default function MetaSchool() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Meta School 2025–26"
        description="Rainbow International School is a Meta for Education partner school — integrating digital citizenship, online safety, creative thinking, and future-ready digital skills into the student learning experience."
        keywords="Meta for Education school Thane, digital citizenship CBSE school, online safety school programme, Rainbow International School Meta school"
        canonical="https://rainbowinternationalschool.in/meta-school-2025-26"
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Meta School 2025–26"
        subtitle="Rainbow International School — Meta for Education Partner"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Meta School 2025–26" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-elearning-classrooms-600x400-1.jpg"
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 px-4 bg-[#f8faff]">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-sm mb-8 border border-blue-100">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full" />
              <span className="font-bold text-[#0d3b86] text-sm">Meta for Education Partner School — 2025–26</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#091a4f] mb-6">
              Preparing Students for a Connected World
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Rainbow International School's partnership with Meta for Education reflects our commitment to
              preparing students not just academically but as responsible, capable, and confident participants
              in the digital world — equipped with the skills, knowledge, and values that digital citizenship requires.
            </p>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#091a4f] text-center mb-10">What the Meta Partnership Means at Rainbow</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map(h => (
                <div key={h} className="flex items-start gap-3 bg-[#f8faff] rounded-xl p-4 border border-blue-100">
                  <CheckCircle className="text-blue-500 mt-0.5 shrink-0" size={18} />
                  <span className="text-sm text-gray-700">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-14 px-4 bg-[#f8faff]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#091a4f] text-center mb-2">Six Pillars of Digital Education</h2>
            <p className="text-center text-gray-500 text-sm mb-10">How the Meta partnership shapes learning at Rainbow</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={22} />
                  </div>
                  <h3 className="font-bold text-[#091a4f] mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statement */}
        <section className="py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-10 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Digital Literacy as a Core Life Skill</h2>
              <p className="text-blue-100 leading-relaxed max-w-2xl mx-auto">
                The children at Rainbow International School will live, work, and lead in a world that is
                profoundly shaped by digital technology and social connectivity. Preparing them for that world
                means more than academic knowledge — it means developing the digital literacy, critical thinking,
                and ethical awareness to navigate the connected world with confidence and responsibility.
                The Meta for Education partnership is one expression of that commitment.
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
