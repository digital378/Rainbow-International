import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const scholastic = ["English", "Math", "Marathi", "E.V.S", "Hindi", "Computer", "General Knowledge"];
const coScholastic = ["Physical Education", "Sports (Indoor & Outdoor Games)", "Value Education", "Dance & Music", "Personality Development", "Art & Craft"];

const curriculum = [
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-28-Traced.png", subject: "Language Skills", detail: "English, Hindi, Marathi" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-25-Traced-1.png", subject: "Math & Science", detail: "Developing numerical confidence and scientific curiosity" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-27-Traced.png", subject: "General Knowledge", detail: "Awareness of surroundings, past and present" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-3-Traced.png", subject: "Creative Skills", detail: "Art, Craft, Dance, Music & Personality Development" },
];

export default function Primary() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Primary Section (Class 1-5) - Rainbow International School Thane"
        description="Rainbow International School's Primary Section (Class 1 to Class 5) in Thane West. Five Fundamental Skills approach: Language, Math, Science, Creativity & Interpersonal development. CBSE curriculum."
        keywords="primary school Thane West, Class 1 to 5 CBSE school Thane, primary section Rainbow School"
        canonical="https://rainbowinternationalschool.in/primary-section/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png"
      />
      <Navbar />
      <PageBanner
        title="Primary Section"
        subtitle="Class 1 to Class 5"
        breadcrumb={[{ label: "Primary Section" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/PS-01-1024x548.jpeg"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
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
              src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/PS-02-1024x546.jpeg"
              alt="Primary section students"
              className="rounded-3xl shadow-sm w-full object-cover max-h-80"
            />
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-lg mb-3" style={{ color: "#0d3b86" }}>Teaching-Learning Strategies</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To develop core competencies, a variety of creative and innovative classroom strategies are implemented — pair work, group work, project work, and extensive hands-on activities. Digital tools are used to facilitate learning and creativity.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-lg mb-3" style={{ color: "#0d3b86" }}>Evaluation</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A system of Continuous Comprehensive Evaluation is followed. Students are graded regularly based on participation in co-curricular activities, with assessment of competencies in languages, sciences, and mathematics.
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
          <p className="text-white font-bold text-lg mb-4">Admissions are Open for the Academic Year 2025–26</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">Enquire Now</a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
