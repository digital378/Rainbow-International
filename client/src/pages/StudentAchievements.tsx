import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";

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
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Student Achievements - Rainbow International School Thane"
        description="Rainbow International School student achievements — 100% result in Class X AISSE 2018-19, National and State level sports achievements in Swimming, Badminton, Skating, Chess and more."
        keywords="Rainbow school student achievements, CBSE school results Thane, school sports achievements Thane West"
        canonical="https://rainbowinternationalschool.in/student-achievements/"
      />
      <Navbar />
      <PageBanner
        title="Student Achievements"
        subtitle="At Rainbow, Student Accomplishments are acknowledged and honored."
        breadcrumb={[{ label: "Student Achievements" }]}
      />

      <main className="flex-grow">
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Result of Class X AISSE — March 2019</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We are extremely proud of the fact that our first batch of Class X students who appeared for the All India Secondary School Examination in March 2019 brought great laurels to their school by bringing cent percent results. In all <strong>43 students</strong> appeared for the examination.
            </p>
            <div className="bg-muted/30 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
              <strong>School Topper:</strong> Master Aryan Gulhane — 96.6% &nbsp;|&nbsp;
              <strong>2nd:</strong> Master Vidhu Agarwal — 96.4% &nbsp;|&nbsp;
              <strong>3rd:</strong> Miss Ariba Khan — 96.2%
            </div>

            <h3 className="text-xl font-serif font-bold text-primary mb-4">Subject Wise Toppers</h3>
            <div className="overflow-x-auto rounded-xl shadow border">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="text-left py-3 px-4">Subject</th>
                    <th className="text-left py-3 px-4">Name of the Student</th>
                    <th className="text-left py-3 px-4">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {academicToppers.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                      <td className="py-3 px-4 font-medium text-primary">{row.subject}</td>
                      <td className="py-3 px-4 text-muted-foreground">{row.name}</td>
                      <td className="py-3 px-4 font-bold text-secondary">{row.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-serif font-bold text-primary mb-6">Sports Achievements</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Apart from the In-house Sports Games Competition and the Annual Sports Day, our students actively participated in different Sports Competitions at the National, State, Zonal and District Level in Swimming Championship, Badminton, Karate Championship, Athletics, Chess, Cycling and Skating.
            </p>
            <div className="overflow-x-auto rounded-xl shadow border">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="text-left py-3 px-4">Sport / Game</th>
                    <th className="text-left py-3 px-4">Name of the Participant</th>
                    <th className="text-left py-3 px-4">Award</th>
                  </tr>
                </thead>
                <tbody>
                  {sportsAchievements.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                      <td className="py-3 px-4 font-medium text-primary">{row.sport}</td>
                      <td className="py-3 px-4 text-muted-foreground">{row.name}</td>
                      <td className="py-3 px-4 font-bold text-secondary">{row.award}</td>
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
