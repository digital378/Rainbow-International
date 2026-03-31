import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const scholastic = ["English", "Hindi", "Maths", "Science", "Social Science", "Marathi / French", "Computer (ICT)"];
const coScholastic = ["Sports (Indoor & Outdoor Games)", "Physical Education", "Value Education", "Dance & Music", "Yoga", "Personality Development", "Art & Craft"];

const curriculum = [
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-28-Traced.png", subject: "Language Skills", detail: "English, Hindi, Option to Choose Between Marathi/French" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-25-Traced-1.png", subject: "Math & Science", detail: "Rigorous focus on learning the natural & physical sciences" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-27-Traced.png", subject: "Social Science", detail: "Awareness of our surroundings, our past & our present" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-3-Traced.png", subject: "Creative Skills", detail: "Art, Craft, Dance, Music, Yoga & Personality Development" },
];

export default function MiddleSchool() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Middle School Section (Class 6-10) - Rainbow International School Thane"
        description="Rainbow International School's Middle School Section (Class 6 to 10). Multi-dimensional curriculum to develop creativity, intellectual curiosity and maturity. CBSE affiliated."
        keywords="middle school Thane West, Class 6 to 10 CBSE Thane, Rainbow International School middle section"
        canonical="https://rainbowinternationalschool.in/middle-school-section/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-section-768x513.png"
      />
      <Navbar />
      <PageBanner
        title="Middle Section"
        subtitle="Class 6 to Class 10"
        breadcrumb={[{ label: "Middle Section" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/MS-01-1024x545.jpeg"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              Our multi-dimensional curriculum is designed to develop creativity, intellectual curiosity, and maturity. The curriculum is laid down according to the Secondary School curriculum designed by CBSE, with technology extensively used in day-to-day teaching.
            </p>
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>Scholastic Subjects</h2>
                <ul className="space-y-2">
                  {scholastic.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>Co-Scholastic Subjects</h2>
                <ul className="space-y-2">
                  {coScholastic.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/MS-02-1024x559.jpeg"
              alt="Excited middle school students"
              className="rounded-3xl shadow-sm w-full object-cover max-h-80"
            />
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-lg mb-3" style={{ color: "#0d3b86" }}>CBSE Curriculum</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The curriculum is laid down according to the Secondary School curriculum designed by CBSE. A variety of instructional strategies to assess the strengths, needs, and interests of the students are adopted.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-lg mb-3" style={{ color: "#0d3b86" }}>Evaluation Pattern</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Two terms with two Summative Assessments. Four Formatives spread over two in each term. Technology is extensively used in day-to-day teaching in classrooms.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>Curriculum</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {curriculum.map((item, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm text-center border border-gray-100">
                  <img src={item.icon} alt={item.subject} className="w-14 h-14 mx-auto mb-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <h3 className="font-black text-lg mb-2" style={{ color: "#0d3b86" }}>{item.subject}</h3>
                  <p className="text-sm text-gray-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">Admissions are Open for the Academic Year 2026–27</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">Enquire Now</a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
