import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

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
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
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
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              The real aim of education is not only knowledge but also <strong>Action</strong>. We provide rigorous, comprehensive & cohesive learning programmes that are designed to meet the Social, Physical & Cultural needs of an International student body.
            </p>
          </div>
        </section>

        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {activities.map((item, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex gap-5" data-testid={`card-activity-${i}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-contain shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div>
                    <h3 className="font-black text-xl mb-2" style={{ color: "#0d3b86" }}>{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-black mb-8 text-center" style={{ color: "#0d3b86" }}>Our Clubs</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {["Health & Wellness Club", "Interact Club", "Culinary Club", "Literary Club", "Heritage Club", "Science & Maths Club", "Eco Club", "Cultural Club"].map((club, i) => (
                <span key={i} className="font-semibold px-4 py-2 rounded-full text-sm border border-gray-200" style={{ color: "#0d3b86", background: "#f0f4ff" }}>{club}</span>
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
