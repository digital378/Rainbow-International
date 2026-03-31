import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

const activities = [
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/HO-web-art-work-for-pranit-04.png",
    title: "Exhibitions",
    description: "Annual Science, Math, Social Science, and EVS Exhibition 'IMPULSE' is organized to showcase the organizational abilities, oratory skills and knowledge of the students.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/HO-web-art-work-for-pranit-07.png",
    title: "Clubs",
    description: "To foster a multi-dimensional personality, students are exposed to various club activities: Health & Wellness Club, Interact Club, Culinary Club, Literary Club, Heritage Club, Science & Maths Club, Eco Club & Cultural Club.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/HO-web-art-work-for-pranit-06.png",
    title: "Tours & Visits",
    description: "To make learning a joyful & hands-on experience, Recreational, Educational & Cultural Tours & Visits are arranged for students throughout the year.",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/HO-web-art-work-for-pranit-05.png",
    title: "Promoting Green",
    description: "Students are encouraged to feel the soil and develop a green thumb. They participate in green activities like sowing seeds in a vegetable garden, planting saplings in a butterfly garden, and more.",
  },
];

export default function BeyondClassroom() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Beyond The Classroom - Rainbow International School Thane"
        description="Rainbow International School offers exhibitions, clubs, tours, and organic farming activities beyond academics. A comprehensive programme designed to meet the social, physical, and cultural needs of students."
        keywords="beyond classroom activities Rainbow School, school clubs Thane, extracurricular activities Thane school, school exhibitions Thane"
        canonical="https://rainbowinternationalschool.in/beyond-the-classroom/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png"
      />
      <Navbar />
      <PageBanner
        title="Beyond The Classroom"
        subtitle="The real aim of education is not only knowledge but also Action."
        breadcrumb={[{ label: "Beyond The Classroom" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png"
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              The real aim of education is not only knowledge but also <strong>Action</strong>. We provide rigorous, comprehensive & cohesive learning programmes that are designed to meet the Social, Physical & Cultural needs of an International student body.
            </p>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {activities.map((item, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow border flex gap-5" data-testid={`card-activity-${i}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-contain shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div>
                    <h3 className="font-serif font-bold text-xl text-primary mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-serif font-bold text-primary mb-8 text-center">Our Clubs</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {["Health & Wellness Club", "Interact Club", "Culinary Club", "Literary Club", "Heritage Club", "Science & Maths Club", "Eco Club", "Cultural Club"].map((club, i) => (
                <span key={i} className="bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm">{club}</span>
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
