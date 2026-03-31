import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

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
    <div className="min-h-screen bg-background flex flex-col">
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
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              Our multi-dimensional curriculum is designed to develop creativity, intellectual curiosity, and maturity. The curriculum is laid down according to the Secondary School curriculum designed by CBSE, with technology extensively used in day-to-day teaching.
            </p>
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-serif font-bold text-primary mb-4">Scholastic Subjects</h2>
                <ul className="space-y-2">
                  {scholastic.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-primary mb-4">Co-Scholastic Subjects</h2>
                <ul className="space-y-2">
                  {coScholastic.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/MS-02-1024x559.jpeg"
              alt="Excited middle school students"
              className="rounded-2xl shadow-lg w-full object-cover max-h-80"
            />
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-card rounded-xl p-6 shadow border">
                <h3 className="font-serif font-bold text-lg text-primary mb-3">CBSE Curriculum</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The curriculum is laid down according to the Secondary School curriculum designed by CBSE. A variety of instructional strategies to assess the strengths, needs, and interests of the students are adopted.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow border">
                <h3 className="font-serif font-bold text-lg text-primary mb-3">Evaluation Pattern</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Two terms with two Summative Assessments. Four Formatives spread over two in each term. Technology is extensively used in day-to-day teaching in classrooms.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-serif font-bold text-primary text-center mb-10">Curriculum</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {curriculum.map((item, i) => (
                <div key={i} className="bg-card rounded-xl p-6 shadow text-center border">
                  <img src={item.icon} alt={item.subject} className="w-14 h-14 mx-auto mb-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <h3 className="font-serif font-bold text-lg text-primary mb-2">{item.subject}</h3>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
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
