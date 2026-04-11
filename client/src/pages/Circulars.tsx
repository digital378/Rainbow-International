import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { FileText, Download } from "lucide-react";

const circulars = [
  {
    year: "2025–26",
    items: [
      { title: "Annual Day Programme Schedule", date: "March 2026", category: "Events" },
      { title: "Summer Vacation Notice — Class 1 to 10", date: "April 2026", category: "Holidays" },
      { title: "Mid-Term Examination Timetable", date: "September 2025", category: "Examinations" },
      { title: "Sports Day Circular", date: "December 2025", category: "Events" },
      { title: "School Timings Revision — Winter Schedule", date: "November 2025", category: "General" },
      { title: "Parent-Teacher Meeting Circular — Term 1", date: "October 2025", category: "PTM" },
      { title: "Diwali Celebration & Dress Code", date: "October 2025", category: "Events" },
      { title: "Admission Open 2026–27 Circular", date: "August 2025", category: "Admissions" },
    ],
  },
  {
    year: "2024–25",
    items: [
      { title: "Annual Examination Timetable — Class 1 to 9", date: "February 2025", category: "Examinations" },
      { title: "Board Examination Guidelines — Class 10 & 12", date: "January 2025", category: "Examinations" },
      { title: "Independence Day Celebration Circular", date: "August 2024", category: "Events" },
      { title: "Parent-Teacher Meeting Circular — Term 2", date: "January 2025", category: "PTM" },
      { title: "Republic Day Programme Schedule", date: "January 2025", category: "Events" },
    ],
  },
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  Events:      { bg: "#e0edff", text: "#0d3b86" },
  Holidays:    { bg: "#e0f7f0", text: "#047857" },
  Examinations:{ bg: "#fff7e0", text: "#b45309" },
  PTM:         { bg: "#fdf2f8", text: "#be185d" },
  General:     { bg: "#f3f4f6", text: "#374151" },
  Admissions:  { bg: "#f3e0ff", text: "#6d28d9" },
};

export default function Circulars() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Circulars & Notices"
        description="School circulars and notices from Rainbow International School, Thane. Examination schedules, event notices, PTM dates, and general announcements."
        keywords="Rainbow school circulars Thane, school notices Thane, Rainbow International School announcements"
        canonical="https://rainbowinternationalschool.in/circulars"
      />
      <Navbar />
      <PageBanner
        title="Circulars"
        subtitle="School notices, examination schedules and important announcements."
        breadcrumb={[{ label: "Circulars" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion.png"
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-gray-500 text-sm text-center mb-12">
              All official circulars are published here for parents and students. Please check this page regularly for the latest announcements from Rainbow International School.
            </p>

            {circulars.map((group, gi) => (
              <div key={gi} className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1" style={{ background: "#e5e7eb" }} />
                  <span className="text-sm font-black px-4 py-1.5 rounded-full text-white" style={{ background: "#0d3b86" }}>
                    Academic Year {group.year}
                  </span>
                  <div className="h-px flex-1" style={{ background: "#e5e7eb" }} />
                </div>

                <div className="space-y-3">
                  {group.items.map((item, ii) => {
                    const cat = categoryColors[item.category] ?? categoryColors["General"];
                    return (
                      <div key={ii} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow" data-testid={`circular-${gi}-${ii}`}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat.bg }}>
                          <FileText size={18} style={{ color: cat.text }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                        </div>
                        <span className="hidden sm:inline text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0" style={{ background: cat.bg, color: cat.text }}>
                          {item.category}
                        </span>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0" aria-label="Download">
                          <Download size={15} className="text-gray-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
