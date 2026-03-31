import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

const activities = [
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Exibhition.jpg",
    title: "Exhibitions",
    description: "Annual Exhibitions for Science, Maths, Social Science, EVS & Language — showcasing student knowledge and creativity.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Field-trip-1-1.jpg",
    title: "Tours & Visits",
    description: "Exciting Recreational, Educational & Cultural Excursions that make learning joyful and hands-on.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-extracurricular-activity-special-assembly.jpg",
    title: "Special Assembly",
    description: "Celebration of Fun & Educational U.N. days, Motivational Speeches & Meaningful Activities to broaden student horizons.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Cultural.jpg",
    title: "Cultural Activities",
    description: "Annual Day, Sports Day, Indian Festivals & School Events celebrating the richness of our diverse heritage.",
  },
];

export default function Extracurriculars() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Extracurricular Activities - Rainbow International School Thane"
        description="Rainbow International School — a FIT INDIA School offering sports, clubs, exhibitions, cultural activities, and tours for holistic student development in Thane West."
        keywords="extracurricular activities Thane school, Rainbow school sports clubs, FIT INDIA school Thane, cultural activities school Thane"
        canonical="https://rainbowinternationalschool.in/extracurriculars/"
      />
      <Navbar />
      <PageBanner
        title="Extracurriculars"
        subtitle="Activity beyond the classroom for all-round excellence."
        breadcrumb={[{ label: "Extracurriculars" }]}
      />

      <main className="flex-grow">
        <section className="py-14 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="bg-primary/10 rounded-2xl p-8 border border-primary/20">
              <h2 className="text-2xl font-serif font-bold text-primary mb-3">We are a FIT INDIA School</h2>
              <p className="text-muted-foreground">
                Our FIT INDIA declaration has been approved by the Ministry of Youth Affairs and Sports. Rainbow International School is an official FIT INDIA School!
              </p>
              <a
                href="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-fit-india-4-1.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-primary font-semibold underline text-sm"
              >
                View Certificate
              </a>
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div>
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-extra-curricular-activities-sports-1.jpg"
                  alt="Sports activities"
                  className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]"
                />
                <h3 className="font-serif font-bold text-xl text-primary mt-4 mb-2">Sports to Add Action</h3>
                <p className="text-muted-foreground text-sm">Cricket, Football, Swimming, Badminton, Skating, Basketball, Karate, Chess and more.</p>
              </div>
              <div>
                <img
                  src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Asset-4-8.png"
                  alt="Clubs"
                  className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3] object-contain bg-muted/20"
                />
                <h3 className="font-serif font-bold text-xl text-primary mt-4 mb-2">Clubs to Provide Intellectual Stimulation</h3>
                <p className="text-muted-foreground text-sm">Literary, Heritage, Eco, Science, Culinary, Interact and Cultural Clubs.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-primary text-center mb-10">Teaching Methodology & Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {activities.map((item, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden shadow border" data-testid={`card-extracurricular-${i}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-lg text-primary mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
