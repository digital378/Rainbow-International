import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const academicToppers = [
  { subject: "IT", name: "Master Aryan Gulhane", marks: "100 / 100" },
  { subject: "IT", name: "Miss Ketaki Nirbhavane", marks: "100 / 100" },
  { subject: "IT", name: "Miss Ariba Khan", marks: "100 / 100" },
  { subject: "IT", name: "Master Sumedh Totade", marks: "100 / 100" },
  { subject: "Social Studies", name: "Master Aryan Gulhane", marks: "100 / 100" },
  { subject: "English", name: "Miss Sakshi Hiremath", marks: "99 / 100" },
  { subject: "Hindi", name: "Miss Ayushi Trivedi", marks: "98 / 100" },
  { subject: "Mathematics", name: "Master Vidhu Agarwal", marks: "96 / 100" },
  { subject: "Science", name: "Miss Shriya Gawde", marks: "95 / 100" },
];

const sportsAchievements = [
  { sport: "Swimming Championship", name: "Miss Raghavi Ramanunjan", award: "300+ medals till date" },
  { sport: "Badminton Tournament", name: "Master Himanshu Desai", award: "Gold at National Level (Represented Maharashtra for U-17)" },
  { sport: "Cycling U-17 (DSO)", name: "Master Atharva Vaidya", award: "Gold" },
  { sport: "South Zone Speed Skating Championship", name: "Miss Lakshmi Sahithi", award: "Bronze" },
];

export default function StudentAchievements() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Student Achievements"
        description="Rainbow International School student achievements — 100% result in Class X AISSE 2018-19, National and State level sports achievements in Swimming, Badminton, Skating, Chess and more."
        keywords="Rainbow school student achievements, CBSE school results Thane, school sports achievements Thane"
        canonical="https://rainbowinternationalschool.in/student-achievements"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Student Achievements", href: "https://rainbowinternationalschool.in/student-achievements" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Student Achievements — Rainbow International School",
          "description": "100% CBSE results, national and state sports achievements in swimming, badminton, skating and chess at Rainbow International School, Thane.",
          "url": "https://rainbowinternationalschool.in/student-achievements",
          "about": {
            "@type": "EducationalOrganization",
            "name": "Rainbow International School",
            "url": "https://rainbowinternationalschool.in"
          }
        }}
      />
      <Navbar />
      <PageBanner
        title="Student Achievements"
        subtitle="At Rainbow, Student Accomplishments are acknowledged and honored."
        breadcrumb={[{ label: "Student Achievements" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Academic Excellence
            </span>
            <h2 className="text-3xl font-black mb-4" style={{ color: "#0d3b86", fontFamily: "'DM Sans', sans-serif" }}>Result of Class X AISSE — March 2019</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We are extremely proud of the fact that our first batch of Class X students who appeared for the All India Secondary School Examination in March 2019 brought great laurels to their school by bringing cent percent results. In all <strong>43 students</strong> appeared for the examination.
            </p>
            <div className="rounded-3xl p-4 mb-6 text-sm text-gray-600 border border-gray-100" style={{ background: "#f8faff" }}>
              <strong>School Topper:</strong> Master Aryan Gulhane — 96.6% &nbsp;|&nbsp;
              <strong>2nd:</strong> Master Vidhu Agarwal — 96.4% &nbsp;|&nbsp;
              <strong>3rd:</strong> Miss Ariba Khan — 96.2%
            </div>

            <h3 className="text-xl font-black mb-4" style={{ color: "#0d3b86" }}>Subject Wise Toppers</h3>
            <div className="overflow-x-auto rounded-3xl shadow-sm border border-gray-100">
              <table className="w-full text-sm">
                <thead style={{ background: "#0d3b86" }} className="text-white">
                  <tr>
                    <th className="text-left py-3 px-4">Subject</th>
                    <th className="text-left py-3 px-4">Name of the Student</th>
                    <th className="text-left py-3 px-4">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {academicToppers.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 font-semibold" style={{ color: "#0d3b86" }}>{row.subject}</td>
                      <td className="py-3 px-4 text-gray-600">{row.name}</td>
                      <td className="py-3 px-4 font-bold text-amber-500">{row.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-20" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-black mb-6" style={{ color: "#0d3b86" }}>Sports Achievements</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Apart from the In-house Sports Games Competition and the Annual Sports Day, our students actively participated in different Sports Competitions at the National, State, Zonal and District Level in Swimming Championship, Badminton, Karate Championship, Athletics, Chess, Cycling and Skating.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                <img src="/images/students/swimmer.png" alt="Rainbow International School swimmer with medals" className="w-full aspect-square object-cover" width={300} height={300} loading="lazy" decoding="async" />
                <p className="text-xs font-bold text-center py-2 px-2" style={{ color: "#0d3b86" }}>Swimming Champion</p>
              </div>
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                <img src="/images/students/cyclist.png" alt="Rainbow International School cyclist representing Maharashtra" className="w-full aspect-square object-cover" width={300} height={300} loading="lazy" decoding="async" />
                <p className="text-xs font-bold text-center py-2 px-2" style={{ color: "#0d3b86" }}>Cycling Champion</p>
              </div>
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                <img src="/images/students/kickboxer.png" alt="Rainbow International School kickboxer" className="w-full aspect-square object-cover" width={300} height={300} loading="lazy" decoding="async" />
                <p className="text-xs font-bold text-center py-2 px-2" style={{ color: "#0d3b86" }}>Kickboxing</p>
              </div>
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                <img src="/images/students/doctor-student.png" alt="Rainbow International School student achiever" className="w-full aspect-square object-cover" width={300} height={300} loading="lazy" decoding="async" />
                <p className="text-xs font-bold text-center py-2 px-2" style={{ color: "#0d3b86" }}>Student Achiever</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-3xl shadow-sm border border-gray-100">
              <table className="w-full text-sm">
                <thead style={{ background: "#0d3b86" }} className="text-white">
                  <tr>
                    <th className="text-left py-3 px-4">Sport / Game</th>
                    <th className="text-left py-3 px-4">Name of the Participant</th>
                    <th className="text-left py-3 px-4">Award</th>
                  </tr>
                </thead>
                <tbody>
                  {sportsAchievements.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 font-semibold" style={{ color: "#0d3b86" }}>{row.sport}</td>
                      <td className="py-3 px-4 text-gray-600">{row.name}</td>
                      <td className="py-3 px-4 font-bold text-amber-500">{row.award}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
