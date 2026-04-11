import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Eye, Target, Star, Heart, Globe, Lightbulb } from "lucide-react";

const values = [
  { icon: Eye, title: "Vision", description: "To be a globally recognized institution that nurtures curious, compassionate, and confident world citizens who uphold Indian values while making a meaningful impact on the world." },
  { icon: Target, title: "Mission", description: "To provide a holistic, student-centered education that balances academic excellence with character development, creativity, and physical well-being through innovative teaching and a supportive environment." },
];

const coreValues = [
  { icon: Star, title: "Excellence", description: "We pursue the highest standards in everything we do — academic, co-curricular, and personal." },
  { icon: Heart, title: "Compassion", description: "We nurture empathy, kindness, and respect for all people and living beings." },
  { icon: Globe, title: "Global Mindset", description: "We prepare students to thrive in a diverse, interconnected world while remaining rooted in Indian heritage." },
  { icon: Lightbulb, title: "Innovation", description: "We embrace creativity and critical thinking as tools for solving tomorrow's challenges." },
];

export default function VisionMission() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Vision & Mission | Rainbow International School"
        description="Rainbow International School's Vision and Mission — nurturing curious, compassionate, and confident world citizens who uphold Indian values while making a global impact."
        keywords="Rainbow school vision mission, Rainbow International School values, school philosophy Thane"
        canonical="https://rainbowinternationalschool.in/ris-vision-mission"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "About Us", href: "https://rainbowinternationalschool.in/about-rainbow-international-school" },
          { name: "Vision & Mission", href: "https://rainbowinternationalschool.in/ris-vision-mission" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="RIS Vision & Mission"
        breadcrumb={[{ label: "About Us", href: "/about-rainbow-international-school" }, { label: "Vision & Mission" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={i} className="text-white rounded-3xl p-8 shadow-sm" style={{ background: "#0d3b86" }} data-testid={`card-vision-${i}`}>
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-5">
                      <Icon size={28} />
                    </div>
                    <h2 className="text-2xl font-black mb-4">{v.title}</h2>
                    <p className="text-white/85 leading-relaxed">{v.description}</p>
                  </div>
                );
              })}
            </div>

            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>Our Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center" data-testid={`card-value-${i}`}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#fef3c7" }}>
                      <Icon size={22} style={{ color: "#0d3b86" }} />
                    </div>
                    <h3 className="font-black text-lg mb-2" style={{ color: "#0d3b86" }}>{v.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{v.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-14" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>Our Motto</h2>
            <p className="text-4xl font-black mb-4" style={{ color: "#0d3b86" }}>"Passion for Excellence"</p>
            <p className="text-gray-600 leading-relaxed">
              At Rainbow International School, every day is an opportunity to pursue excellence — in the classroom, on the field, and in life.
            </p>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
