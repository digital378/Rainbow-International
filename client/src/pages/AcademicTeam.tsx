import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const departments = [
  {
    dept: "Languages",
    members: ["English Department", "Hindi Department", "Marathi Department", "French Department"],
    accent: "#3b82f6",
  },
  {
    dept: "STEM",
    members: ["Mathematics Department", "Physics Department", "Chemistry Department", "Biology Department", "Computer Science Department"],
    accent: "#22c55e",
  },
  {
    dept: "Social Studies",
    members: ["History & Civics", "Geography Department", "Economics Department", "Psychology Department"],
    accent: "#f97316",
  },
  {
    dept: "Co-Scholastic",
    members: ["Physical Education", "Music Department", "Art & Craft Department", "Dance Department"],
    accent: "#a855f7",
  },
  {
    dept: "Pre-Primary",
    members: ["Nursery Teachers", "Jr. KG Teachers", "Sr. KG Teachers", "Activity Co-ordinators"],
    accent: "#ec4899",
  },
  {
    dept: "Support Staff",
    members: ["Library Staff", "Counsellors", "Infirmary Staff", "Administrative Team"],
    accent: "#fbbf24",
  },
];

export default function AcademicTeam() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Academic Team - Rainbow International School Thane"
        description="Meet Rainbow International School's dedicated academic team — highly qualified and experienced teachers and staff committed to student excellence in Thane West."
        keywords="Rainbow school teachers, academic team Rainbow International School, school faculty Thane West"
        canonical="https://rainbowinternationalschool.in/academic-team/"
      />
      <Navbar />
      <PageBanner
        title="Academic Team"
        subtitle="Our passionate educators — the heart of Rainbow International School."
        breadcrumb={[{ label: "Academic Team" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-5 max-w-3xl">
              At Rainbow International School, our academic team comprises <strong>highly qualified, trained, and passionate educators</strong> who are dedicated to bringing out the best in every student. Our teachers are not just instructors — they are mentors, guides, and role models.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-12 max-w-3xl">
              With regular professional development workshops, training sessions, and a collaborative work culture, Rainbow ensures that our teaching team stays at the forefront of modern pedagogy.
            </p>

            <h2 className="text-2xl font-black mb-8 text-center" style={{ color: "#0d3b86" }}>Our Academic Departments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((d, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm" style={{ borderLeft: `4px solid ${d.accent}` }} data-testid={`card-dept-${i}`}>
                  <h3 className="font-black text-xl mb-4" style={{ color: "#0d3b86" }}>{d.dept}</h3>
                  <ul className="space-y-1.5">
                    {d.members.map((m, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-600 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.accent }} />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>Join Our Academic Team</h2>
            <p className="text-gray-600 mb-6">Passionate about education? We are always looking for talented educators to join the Rainbow family.</p>
            <a href="/career" className="inline-block text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity" style={{ background: "#0d3b86" }}>View Career Opportunities</a>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
