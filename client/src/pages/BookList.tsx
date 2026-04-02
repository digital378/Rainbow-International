import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { useState } from "react";
import ScrollProgress from "@/components/home/ScrollProgress";

interface BookEntry {
  subject: string;
  books: string[];
}

interface GradeData {
  grade: string;
  books: BookEntry[];
}

const gradeBooks: GradeData[] = [
  {
    grade: "Grade I",
    books: [
      { subject: "English", books: ["English Literature (Broadways) C/B", "Fitzroy Readers Stories (11-20)", "Fitzroy Word Skills 2", "Story Telling-I"] },
      { subject: "Hindi", books: ["Hindi Literature (Khulte Pankh)"] },
      { subject: "Mathematics", books: ["Maths (New Enjoying Maths) Course Book"] },
    ],
  },
  {
    grade: "Grade II",
    books: [
      { subject: "English", books: ["English Literature (Broadways) C/B", "Fitzroy Readers Stories (21-30)", "Fitzroy Word Skills 3", "Story Telling-II"] },
      { subject: "Hindi", books: ["Hindi Literature (Khulte Pankh)"] },
      { subject: "Mathematics", books: ["Maths (New Enjoying Mathematics)"] },
    ],
  },
  {
    grade: "Grade III",
    books: [
      { subject: "English", books: ["English Literature (Broadways) C/B", "English Grammar (Adv with Gram & Compo)", "Fitzroy Readers Stories (31-40)", "Fitzroy Word Skills 4", "Pocket Dictionary"] },
      { subject: "Hindi", books: ["Hindi Literature (Khulte Pankh)", "Hindi Grammar (Vyakaran Pushp)"] },
      { subject: "Mathematics", books: ["Maths - New Enjoy Coursebook"] },
      { subject: "Environmental Science", books: ["E.V.S"] },
    ],
  },
  {
    grade: "Grade IV",
    books: [
      { subject: "English", books: ["English Literature (Broadways)", "English Grammar (Adventure with Gram & Compo)", "Fitzroy Readers Stories (41-50)", "Fitzroy Word Skills 4", "Pocket Dictionary"] },
      { subject: "Hindi", books: ["Hindi Literature (Khulte Pankh)", "Hindi Grammar (Vyakaran Pushp)"] },
      { subject: "Maths", books: ["Maths - Coursebook"] },
      { subject: "EVS", books: ["E.V.S"] },
    ],
  },
  {
    grade: "Grade V",
    books: [
      { subject: "English", books: ["English Literature (Broadways)", "Eng Grammar (Advent with Gram & Compo)", "Fitzroy Read Stories (51-60)", "Fitzroy Word Skills 6A", "Pocket Dictionary"] },
      { subject: "Hindi", books: ["Hindi Literature (Khulte Pankh)", "Hindi Grammar (Vyakaran Pushp)"] },
      { subject: "Mathematics", books: ["Maths - New Enjoying Math"] },
      { subject: "Environmental Science", books: ["EVS", "Map Book (Active Map Practice Book)"] },
      { subject: "French", books: ["Francais C'est Facile T/B", "Francais C'est Facile W/B"] },
      { subject: "Marathi", books: ["Marathi"] },
    ],
  },
  {
    grade: "Grade VI",
    books: [
      { subject: "English", books: ["English Literature (Broadways) C/B", "Eng Grammar (Advent with Gram & Compo)", "Pocket Dictionary"] },
      { subject: "Hindi", books: ["Hindi Literature (Hindi Sahitya)", "Hindi - Basant", "Hindi Grammar (Vyakaran Pushp)"] },
      { subject: "Maths", books: ["Maths"] },
      { subject: "Science", books: ["Science (I Explore)"] },
      { subject: "Social Science", books: ["Integrated Social Science", "Map Book (Geo & Historical)"] },
      { subject: "French (Optional)", books: ["French (Esprit 1)", "French Dictionary (Mini Plus)"] },
      { subject: "Marathi", books: ["Saptarang Marathi"] },
      { subject: "Computer", books: ["Computer"] },
    ],
  },
  {
    grade: "Grade VII",
    books: [
      { subject: "English", books: ["English Literature (Broadways) - Short", "Eng Gram (Advent with Gram & Compo)", "Pocket Dictionary"] },
      { subject: "Hindi", books: ["Hindi - Sahitya", "Hindi Grammar (Vyakaran Pushp)"] },
      { subject: "Maths", books: ["Maths"] },
      { subject: "Science", books: ["Science (I Explore)"] },
      { subject: "Social Science", books: ["Integrated Social Science", "Map Book (Geo & Historical)"] },
      { subject: "French", books: ["French (Esprit 2)", "French Dictionary (Mini Plus)"] },
      { subject: "Marathi", books: ["Saptrang Marathi"] },
      { subject: "Computer", books: ["Computer"] },
    ],
  },
  {
    grade: "Grade VIII",
    books: [
      { subject: "English", books: ["English Lit (Broadways)", "English Gram (Adventure with Gram & Compo)", "Pocket Dictionary (for new admission)"] },
      { subject: "Hindi", books: ["Hindi Lit (Hindi Sahitya)", "Hindi Grammar (Vyakaran Pushp)"] },
      { subject: "Maths", books: ["Maths"] },
      { subject: "Science", books: ["Science (I Explore)"] },
      { subject: "Social Science", books: ["Social & Political Life", "Geo - Resource & Development", "History Our Past - VIII - I", "History Our Past - VIII - II", "Map Book (Geo & Historical)"] },
      { subject: "French", books: ["French Esprit 3", "French Dictionary (Mini Plus)"] },
      { subject: "Marathi", books: ["Saptrang Marathi (Short)"] },
      { subject: "Computer", books: ["Computer I Beans"] },
    ],
  },
  {
    grade: "Grade IX",
    books: [
      { subject: "English", books: ["Beehive", "Moments - Supplementary Reader", "Little Oxford Dictionary Thesaurus & Word Power (Opt)"] },
      { subject: "Hindi", books: ["Sparsh Course B", "Sanchayan Course B", "Hindi Vyakaran Course B"] },
      { subject: "Mathematics", books: ["Mathematics Textbook"] },
      { subject: "Science", books: ["Science Textbook", "Science Lab Manual Set Term 1 & 2 (PB + CB)"] },
      { subject: "Social Science", books: ["India & The Contemporary World - 1 (History)", "Contemporary India Part 1 - Geo", "Economics Textbook", "Democratic Politics - 1", "Disaster Management"] },
      { subject: "Atlas (Optional)", books: ["Macmillan School Atlas"] },
      { subject: "Art - Part 2", books: ["Learn Pencil Shading Portrait - Part 2"] },
      { subject: "Computer (CBSE Code 402)", books: ["Info. Techno. NSQF - Level 1"] },
    ],
  },
  {
    grade: "Grade X",
    books: [
      { subject: "English", books: ["First Flight", "Footprints Without Feet"] },
      { subject: "Hindi", books: ["Sparsh Course B (Part 2)", "Sanchayan Course B (Part 2)"] },
      { subject: "Mathematics", books: ["Mathematics Text Book"] },
      { subject: "Science", books: ["Science Text Book", "Science Lab Manual Set Term B1 & PCB-3"] },
      { subject: "Social Science", books: ["Contemporary World - II (History)", "Contemporary India Part II (Geography)", "Economics Text Book", "Democratic Politics - II", "Disaster Management"] },
      { subject: "Art - Part 2", books: ["Learn Pencil Shading Portrait - Part II"] },
      { subject: "Computer (CBSE Code 402)", books: ["Info. Techno NSQF - Level 2"] },
    ],
  },
];

const gradeLabels = gradeBooks.map((g) => g.grade);

export default function BookList() {
  const [activeGrade, setActiveGrade] = useState(gradeLabels[0]);
  const current = gradeBooks.find((g) => g.grade === activeGrade)!;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Book List - Rainbow International School Thane"
        description="Rainbow International School provides a book list and study material to each student so they understand the syllabus from the start of the year. View book lists for all classes."
        keywords="Rainbow school book list, school books Thane West, CBSE book list Thane, Rainbow International School study material"
        canonical="https://rainbowinternationalschool.in/book-list/"
      />
      <Navbar />
      <PageBanner
        title="Book List"
        subtitle="Study materials for all classes — Academic Year 2026–27."
        breadcrumb={[{ label: "Book List" }]}
      />

      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {gradeLabels.map((grade) => (
              <button
                key={grade}
                onClick={() => setActiveGrade(grade)}
                data-testid={`button-grade-${grade}`}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all border ${
                  activeGrade === grade
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                }`}
                style={activeGrade === grade ? { background: "#0d3b86", borderColor: "#0d3b86" } : {}}
              >
                {grade}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100" style={{ background: "#f0f4ff" }}>
              <h2 className="font-black text-lg" style={{ color: "#0d3b86" }}>{current.grade} — Book List 2026–27</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-booklist">
                <thead>
                  <tr style={{ background: "#091a4f" }}>
                    <th className="text-left text-white font-bold px-6 py-3 uppercase tracking-wider text-xs w-1/4">Subject</th>
                    <th className="text-left text-white font-bold px-6 py-3 uppercase tracking-wider text-xs">Name of Book</th>
                  </tr>
                </thead>
                <tbody>
                  {current.books.map((entry, i) => (
                    entry.books.map((book, j) => (
                      <tr
                        key={`${i}-${j}`}
                        className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                      >
                        {j === 0 && (
                          <td
                            className="px-6 py-3 font-bold align-top"
                            style={{ color: "#0d3b86" }}
                            rowSpan={entry.books.length}
                          >
                            {entry.subject}
                          </td>
                        )}
                        <td className="px-6 py-3 text-gray-700">{book}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 rounded-2xl p-6 border border-gray-100 bg-white text-center">
            <p className="text-gray-600 mb-4">Can't find what you're looking for? Contact the school office directly.</p>
            <a href="tel:+918291568972" className="inline-block text-white font-bold py-2.5 px-8 rounded-full hover:opacity-90 transition-opacity text-sm" style={{ background: "#0d3b86" }}>
              Call +91 82915 68972
            </a>
          </div>
        </div>

        <div className="mt-16">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
