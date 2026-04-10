import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Monitor, BookOpen, Video, MessageSquare, BarChart, Clock } from "lucide-react";
import ScrollProgress from "@/components/home/ScrollProgress";

const features = [
  { icon: Monitor, title: "Google Classroom", description: "All assignments, materials, and feedback are delivered through Google Classroom — accessible anytime, anywhere." },
  { icon: Video, title: "Live Virtual Classes", description: "Interactive live sessions allow students to participate in real-time learning with their teachers." },
  { icon: BookOpen, title: "Digital Study Material", description: "E-books, worksheets, and study resources made available digitally — reducing physical burden." },
  { icon: MessageSquare, title: "Direct Teacher Access", description: "Students and parents can communicate directly with subject teachers via the platform." },
  { icon: BarChart, title: "Progress Tracking", description: "Parents can track their child's academic progress, submissions, and performance in real time." },
  { icon: Clock, title: "Flexible Learning", description: "Recorded sessions allow students to revisit lessons at their own pace for better understanding." },
];

export default function VirtualLearning() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Virtual Learning"
        description="Experience education redefined with Rainbow International School's Virtual Learning programme. Anytime access to courses and assessments via Google Classroom."
        keywords="virtual learning Rainbow School, online classes Rainbow International School, Google Classroom Thane school, digital learning Thane"
        canonical="https://www.rainbowinternationalschool.in/virtual-learning/"
        ogImage="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
      />
      <Navbar />
      <PageBanner
        title="Virtual Learning"
        subtitle="Education redefined — anytime, anywhere."
        breadcrumb={[{ label: "Virtual Learning" }]}
        bgImage="https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              Rainbow International School's Virtual Learning programme brings the classroom to your home. Through a robust digital infrastructure powered by <strong>Google Classroom</strong>, students have access to learning resources, live classes, and assessments — all from the comfort of their homes.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-5">
              Our virtual platform is seamlessly integrated with our offline curriculum, ensuring continuity of learning and zero disruption to academic progress — regardless of circumstances.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Rainbow's Virtual Learning is not just about delivering content — it's about creating an engaging, interactive, and personalized learning experience for every student.
            </p>
          </div>
        </section>

        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>Virtual Learning Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100" data-testid={`card-vl-${i}`}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "#f0f4ff" }}>
                      <Icon size={22} style={{ color: "#0d3b86" }} />
                    </div>
                    <h3 className="font-black text-lg mb-2" style={{ color: "#0d3b86" }}>{f.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-14 text-white text-center" style={{ background: "#0d3b86" }}>
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-2xl font-black mb-4">Access Rainbow's Virtual Learning Platform</h2>
            <p className="text-white/80 mb-6">Existing students can log in using their school-issued Google Classroom credentials. Contact the school for login assistance.</p>
            <a href="https://classroom.google.com" target="_blank" rel="noopener noreferrer" className="inline-block font-bold py-3 px-8 rounded-full bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors">Open Google Classroom</a>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
