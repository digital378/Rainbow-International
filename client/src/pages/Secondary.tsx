import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const curriculum = [
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-28-Traced.png", subject: "Language Skills", detail: "Two Languages at Secondary Level: English, Hindi" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-25-Traced-1.png", subject: "Math & Science", detail: "Advanced concepts in Mathematics and Sciences" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-27-Traced.png", subject: "Social Science", detail: "History, Geography, Civics & Economics" },
  { icon: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/image-3-Traced.png", subject: "Co-Scholastic", detail: "Sports, Arts, Languages for physical & mental health" },
];

export default function Secondary() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Secondary Section (Class 9-10) - Rainbow International School Thane"
        description="Rainbow International School's Secondary Section (Class 9 & 10). CBSE curriculum focused on academic excellence, career guidance, and all-round development. One-on-one career counseling."
        keywords="secondary school Thane, Class 9 10 CBSE Thane West, Rainbow school secondary section admission"
        canonical="https://rainbowinternationalschool.in/secondary-section/"
        ogImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-school-class-6-class-8-international-school-admission-ad-2.jpg"
      />
      <Navbar />
      <PageBanner
        title="Secondary Section"
        subtitle="Class 9 and Class 10"
        breadcrumb={[{ label: "Secondary Section" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/middle-school-class-6-class-8-international-school-admission-ad.jpg"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              For the final lap of their schooling years, Rainbow ensures, above all, the students are ready to take on the world outside of the school and are prepared for the directions their varied careers would take them on.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              Our zestful curriculum is entirely focused on quality learning, one that would shape them for a future not only in India, but globally as well. It is designed to keep them intrigued and engaged, developing them into responsible, confident, and independent thinkers.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              Keeping in mind the importance of their over-all growth, we ensure their continued involvement in Sports, Arts, and Languages to maintain their physical and mental health in light of their academic commitments.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Rainbow, our higher graders receive <strong>one-on-one career guidance</strong> from counselors to ensure they have a medium where they may voice out their concerns, sort through their dilemmas, and navigate through several layers of career options to find one that suits their interests best.
            </p>
          </div>
        </section>

        <section className="py-14" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/SS-02-1024x554.jpeg"
              alt="Secondary section students"
              className="rounded-3xl shadow-sm w-full object-cover max-h-80"
            />
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>Curriculum</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
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

        <section className="py-14" style={{ background: "#f0f4ff" }}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h3 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>100% Result — Rainbow's First Batch (2018–19)</h3>
            <p className="text-gray-600">
              We are extremely proud that our first batch of Class X students who appeared for the All India Secondary School Examination in March 2019 achieved <strong>100% results</strong> — with topper Master Aryan Gulhane scoring 96.6%.
            </p>
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
