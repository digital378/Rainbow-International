import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

const departments = [
  {
    dept: "Languages",
    members: ["English Department", "Hindi Department", "Marathi Department", "French Department"],
    color: "bg-blue-50 border-blue-200",
  },
  {
    dept: "STEM",
    members: ["Mathematics Department", "Physics Department", "Chemistry Department", "Biology Department", "Computer Science Department"],
    color: "bg-green-50 border-green-200",
  },
  {
    dept: "Social Studies",
    members: ["History & Civics", "Geography Department", "Economics Department", "Psychology Department"],
    color: "bg-orange-50 border-orange-200",
  },
  {
    dept: "Co-Scholastic",
    members: ["Physical Education", "Music Department", "Art & Craft Department", "Dance Department"],
    color: "bg-purple-50 border-purple-200",
  },
  {
    dept: "Pre-Primary",
    members: ["Nursery Teachers", "Jr. KG Teachers", "Sr. KG Teachers", "Activity Co-ordinators"],
    color: "bg-pink-50 border-pink-200",
  },
  {
    dept: "Support Staff",
    members: ["Library Staff", "Counsellors", "Infirmary Staff", "Administrative Team"],
    color: "bg-yellow-50 border-yellow-200",
  },
];

export default function AcademicTeam() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5 max-w-3xl">
              At Rainbow International School, our academic team comprises <strong>highly qualified, trained, and passionate educators</strong> who are dedicated to bringing out the best in every student. Our teachers are not just instructors — they are mentors, guides, and role models.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl">
              With regular professional development workshops, training sessions, and a collaborative work culture, Rainbow ensures that our teaching team stays at the forefront of modern pedagogy.
            </p>

            <h2 className="text-2xl font-serif font-bold text-primary mb-8 text-center">Our Academic Departments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((d, i) => (
                <div key={i} className={`rounded-xl p-6 border ${d.color}`} data-testid={`card-dept-${i}`}>
                  <h3 className="font-serif font-bold text-xl text-primary mb-4">{d.dept}</h3>
                  <ul className="space-y-1.5">
                    {d.members.map((m, j) => (
                      <li key={j} className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-primary/5">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">Join Our Academic Team</h2>
            <p className="text-muted-foreground mb-6">Passionate about education? We are always looking for talented educators to join the Rainbow family.</p>
            <a href="/career" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">View Career Opportunities</a>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
