import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────

const leadership = [
  { name: "Vimlesh Sindhu",    role: "Director Academics" },
  { name: "Ashwini Rasal",     role: "Vice Principal" },
  { name: "Fauzia Malvi",      role: "Vice Principal" },
  { name: "Nazneen Themali",   role: "Head – Curriculum & Training" },
  { name: "Aayushi Satra",     role: "Academic Incharge – Pre-Primary" },
];

const prePrimaryHeads = [
  { name: "Mohita Parkar",  class: "Nursery" },
  { name: "Namami Khaire",  class: "Jr. KG" },
  { name: "Sheetal Ubale",  class: "Jr. KG – Class Assistant" },
  { name: "Ruchita Jain",   class: "Sr. KG" },
  { name: "Mrunali Raut",   class: "Sr. KG – Class Assistant" },
];

const classTeachers = [
  { sr: 1,  name: "Usha Vikas",          class: "1 – A" },
  { sr: 2,  name: "Pooja Gogia",         class: "1 – B" },
  { sr: 3,  name: "Kimaya Pandhare",     class: "1 – C" },
  { sr: 4,  name: "Anindita Dutta",      class: "2 – A" },
  { sr: 5,  name: "Priyanka Bhattacharya", class: "2 – B" },
  { sr: 6,  name: "Megha Rathaur",       class: "2 – C" },
  { sr: 7,  name: "Harminder Kaur",      class: "3 – B" },
  { sr: 8,  name: "Tabassum Kaliwala",   class: "3 – C" },
  { sr: 9,  name: "Monica Dsouza",       class: "4 – A" },
  { sr: 10, name: "Preksha Seth",        class: "4 – B" },
  { sr: 11, name: "Preeti Singh",        class: "4 – C" },
  { sr: 12, name: "Mukti Dubey",         class: "5 – A" },
  { sr: 13, name: "Bhavika Pandya",      class: "5 – B" },
  { sr: 14, name: "Neelam Maurya",       class: "5 – C" },
  { sr: 15, name: "Vanita Nikam",        class: "5 – D" },
  { sr: 16, name: "Fareena Khan",        class: "6 – A" },
  { sr: 17, name: "Naina Multani",       class: "6 – B" },
  { sr: 18, name: "Trupti Pawar",        class: "6 – C" },
  { sr: 19, name: "Sheekha Mohpaa",      class: "7 – A" },
  { sr: 20, name: "Nazia Ali",           class: "7 – B" },
  { sr: 21, name: "Dhruvi Samani",       class: "7 – C" },
  { sr: 22, name: "Savita Vyas",         class: "8 – A" },
  { sr: 23, name: "Sneha Nair",          class: "8 – B" },
  { sr: 24, name: "Ninjal Savla",        class: "8 – C" },
  { sr: 25, name: "Riddhi Shah",         class: "9 – A" },
  { sr: 26, name: "Sudeshna Gothi",      class: "9 – B" },
  { sr: 27, name: "Sriporna Sen",        class: "9 – C" },
  { sr: 28, name: "Anupama Rao",         class: "10 – A" },
  { sr: 29, name: "Hina Jain",           class: "10 – B" },
  { sr: 30, name: "Parneet Sodhi",       class: "10 – C" },
];

const seniorSecondaryTeachers = [
  { sr: 1,  name: "Ruchi Kharat",        subject: "PGT Physics / Math" },
  { sr: 2,  name: "Kavita Rana",         subject: "PGT Physics" },
  { sr: 3,  name: "Rajashree Patil",     subject: "PGT Physics" },
  { sr: 4,  name: "Pooja Shete",         subject: "PGT Chemistry" },
  { sr: 5,  name: "Neha Pandey",         subject: "PGT Chemistry" },
  { sr: 6,  name: "Sayali Waghmare",     subject: "PGT Painting" },
  { sr: 7,  name: "Pronita Gupta",       subject: "PGT Biology" },
  { sr: 8,  name: "Archana Soni",        subject: "PGT Biology" },
  { sr: 9,  name: "Kanchan Rao",         subject: "PGT English" },
  { sr: 10, name: "Samiksha Malhotra",   subject: "PGT English" },
  { sr: 11, name: "Priya Supekar",       subject: "PGT Mathematics" },
  { sr: 12, name: "Pooja Yeolekar",      subject: "PGT Computer Science" },
  { sr: 13, name: "Zarin Shaffi",        subject: "PGT History / Political Science" },
  { sr: 14, name: "Rupali Paradkar",     subject: "PGT History / Political Science" },
  { sr: 15, name: "Sana Sayyed",         subject: "PGT Economics / Business Studies" },
  { sr: 16, name: "Simran Gabeja",       subject: "PGT Accountancy" },
  { sr: 17, name: "Vidushi More",        subject: "PGT Physical Education" },
  { sr: 18, name: "Priyanka Bahadur",    subject: "PGT Physical Education" },
];

const subjectTeachers = [
  { sr: 1,  name: "Divya Unnikrishnan",  subject: "PRT English" },
  { sr: 2,  name: "Jyoti Mouje",         subject: "PRT English / Social Science" },
  { sr: 3,  name: "Manjudevi Verma",     subject: "PRT Hindi" },
  { sr: 4,  name: "Anita Gupta",         subject: "TGT Hindi" },
  { sr: 5,  name: "Kalpana Rathod",      subject: "PRT Marathi" },
  { sr: 6,  name: "Kadambari Khedekar",  subject: "PRT Marathi" },
  { sr: 7,  name: "Sayali Jadhav",       subject: "TGT Marathi" },
  { sr: 8,  name: "Ashwini Sarawade",    subject: "TGT Marathi" },
  { sr: 9,  name: "Snehal More",         subject: "PRT ICT" },
  { sr: 10, name: "Priyanka Mishra",     subject: "TGT ICT" },
];

const artsSportsStaff = [
  { sr: 1,  name: "Trupti Jere",              role: "PRT Art" },
  { sr: 2,  name: "Sampada Chavan",           role: "Bollywood Dance" },
  { sr: 3,  name: "Rajnigandha Prajapati",    role: "Contemporary Dance" },
  { sr: 4,  name: "Laxmi Yadav",              role: "Athletics Coach" },
  { sr: 5,  name: "Razia Khan",               role: "Karate Coach" },
  { sr: 6,  name: "Reena Shete",              role: "Skating Coach" },
  { sr: 7,  name: "Shweta Korde",             role: "Swimming Coach" },
  { sr: 8,  name: "Anita Rawat",              role: "Football Coach" },
  { sr: 9,  name: "Kavita Kale",              role: "Basketball Coach" },
  { sr: 10, name: "Aditi Kale",               role: "Cricket Coach" },
  { sr: 11, name: "Seeta Tripathi",           role: "Class Assistant" },
  { sr: 12, name: "Nidhi Pandey",             role: "Class Assistant" },
  { sr: 13, name: "Aparna Pandey",            role: "Class Assistant" },
  { sr: 14, name: "Kavita Pathak",            role: "Class Assistant" },
];

const nonAcademicStaff = [
  { sr: 1, name: "Sai Rasal",          role: "Counselor" },
  { sr: 2, name: "Sarita Mahale",      role: "Librarian" },
  { sr: 3, name: "Nikita Pawar",       role: "Assistant Librarian" },
  { sr: 4, name: "Pratiksha Dhanwate", role: "Lab Assistant" },
  { sr: 5, name: "Sakshi Otawkar",     role: "Lab Assistant" },
  { sr: 6, name: "Smita Randive",      role: "Nurse" },
];

// ── Mini table ────────────────────────────────────────────────────
function StaffTable({ cols, rows, testPrefix }: {
  cols: string[];
  rows: (string | number)[][];
  testPrefix: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#0d3b86" }}>
            {cols.map((c, i) => (
              <th key={i} className="text-white font-bold text-left px-4 py-3 text-xs">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-blue-50/40 transition-colors" data-testid={`${testPrefix}-${i + 1}`}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "text-gray-400 font-semibold w-10" : j === 1 ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Accordion section ─────────────────────────────────────────────
function Section({
  title, count, accent, bg, children, defaultOpen = false,
}: {
  title: string; count: number; accent: string; bg: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
      <button
        className="w-full flex items-center justify-between px-7 py-5 text-left"
        style={{ background: bg }}
        onClick={() => setOpen(o => !o)}
        data-testid={`toggle-section-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          <span className="font-black text-lg" style={{ color: accent }}>{title}</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: accent + "22", color: accent }}>
            {count} member{count !== 1 ? "s" : ""}
          </span>
        </div>
        {open ? <ChevronUp size={18} style={{ color: accent }} /> : <ChevronDown size={18} style={{ color: accent }} />}
      </button>
      {open && <div className="px-7 pb-7 pt-4">{children}</div>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function AcademicTeam() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Academic Team"
        description="Meet Rainbow International School's dedicated academic team — highly qualified and experienced teachers, coaches, counsellors and support staff committed to student excellence."
        keywords="Rainbow school teachers, academic team Rainbow International School, school faculty Thane, CBSE school staff"
        canonical="https://www.rainbowinternationalschool.in/academic-team"
      />
      <Navbar />
      <PageBanner
        title="Academic Team"
        subtitle="Our passionate educators — the heart of Rainbow International School."
        breadcrumb={[{ label: "Academic Team" }]}
      />

      <main className="flex-grow">

        {/* ── Intro ───────────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
              {[
                { num: "30+", label: "Class Teachers" },
                { num: "18", label: "Senior Secondary Faculty" },
                { num: "10+", label: "Sports Coaches" },
                { num: "100+", label: "Total Staff" },
              ].map((s, i) => (
                <div key={i} className="rounded-3xl p-6 text-center border border-gray-100 shadow-sm" style={{ background: "#f8faff" }}>
                  <p className="text-4xl font-black mb-1" style={{ color: "#0d3b86" }}>{s.num}</p>
                  <p className="text-xs font-semibold text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 leading-relaxed mb-3 max-w-3xl">
              At Rainbow International School, our academic team comprises <strong>highly qualified, trained and passionate educators</strong> who are dedicated to bringing out the best in every student. Our teachers are not just instructors — they are mentors, guides and role models.
            </p>
            <p className="text-gray-600 leading-relaxed max-w-3xl">
              The following is the complete Academic Staff List for the Academic Year 2024–2025.
            </p>
          </div>
        </section>

        {/* ── Leadership ──────────────────────────────────────────── */}
        <section className="py-6 pb-12" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-black mb-6" style={{ color: "#0d3b86" }}>Academic Leadership</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {leadership.map((m, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4" data-testid={`card-leadership-${i + 1}`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0" style={{ background: "#e0edff", color: "#0d3b86" }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-sm text-gray-800">{m.name}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: "#0d3b86" }}>{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Accordion Sections ──────────────────────────────────── */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-5xl space-y-5">

            <Section title="Pre-Primary Academic Heads" count={prePrimaryHeads.length} accent="#ec4899" bg="#fdf2f8" defaultOpen>
              <StaffTable
                cols={["Sr.", "Name", "Class"]}
                rows={prePrimaryHeads.map((m, i) => [i + 1, m.name, m.class])}
                testPrefix="row-pp-head"
              />
            </Section>

            <Section title="Class Teachers (Std 1 – 10)" count={classTeachers.length} accent="#0d3b86" bg="#e0edff">
              <StaffTable
                cols={["Sr.", "Name", "Class"]}
                rows={classTeachers.map(m => [m.sr, m.name, m.class])}
                testPrefix="row-class-teacher"
              />
            </Section>

            <Section title="Senior Secondary Teachers (Class 11 – 12)" count={seniorSecondaryTeachers.length} accent="#047857" bg="#e0f7f0">
              <StaffTable
                cols={["Sr.", "Name", "Subject"]}
                rows={seniorSecondaryTeachers.map(m => [m.sr, m.name, m.subject])}
                testPrefix="row-sr-sec"
              />
            </Section>

            <Section title="Subject Teachers (Primary & Middle)" count={subjectTeachers.length} accent="#d97706" bg="#fff7e0">
              <StaffTable
                cols={["Sr.", "Name", "Subject"]}
                rows={subjectTeachers.map(m => [m.sr, m.name, m.subject])}
                testPrefix="row-subject"
              />
            </Section>

            <Section title="Arts, Dance, Sports & Activity Staff" count={artsSportsStaff.length} accent="#6d28d9" bg="#f3e0ff">
              <StaffTable
                cols={["Sr.", "Name", "Role"]}
                rows={artsSportsStaff.map(m => [m.sr, m.name, m.role])}
                testPrefix="row-arts-sports"
              />
            </Section>

            <Section title="Non-Academic Support Staff" count={nonAcademicStaff.length} accent="#0369a1" bg="#f0f9ff">
              <StaffTable
                cols={["Sr.", "Name", "Role"]}
                rows={nonAcademicStaff.map(m => [m.sr, m.name, m.role])}
                testPrefix="row-support"
              />
            </Section>

          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <div className="py-14 text-center" style={{ background: "#091a4f" }}>
          <p className="text-white font-bold text-lg mb-4">Admissions are Open for the Academic Year 2026–27</p>
          <a href="#contact" className="inline-block text-white font-bold py-3 px-8 rounded-full border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors">
            Enquire Now
          </a>
        </div>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
