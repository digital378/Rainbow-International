import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Download } from "lucide-react";
import ScrollProgress from "@/components/home/ScrollProgress";

const calendars = [
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2025/09/rainbow_calendar.jpeg",
    label: "Academic Calendar 2025–26",
    href: "https://rainbowinternationalschool.in/wp-content/uploads/2025/09/rainbow_calendar.jpeg",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-academic-calendar-feb-2020-1024x727-1.png",
    label: "Academic Calendar — February 2020",
    href: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-academic-calendar-feb-2020-1024x727-1.png",
  },
  {
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-academic-calendar-march-2020-1024x725-1.png",
    label: "Academic Calendar — March 2020",
    href: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-academic-calendar-march-2020-1024x725-1.png",
  },
];

export default function AcademicCalendar() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Academic Calendar 2026–27"
        description="View and download the academic calendar for Rainbow International School, Thane West. Stay updated with important dates, events, and school activities."
        keywords="Rainbow school academic calendar, school calendar Thane West, Rainbow International School events schedule"
        canonical="https://rainbowinternationalschool.in/academic-calendar/"
      />
      <Navbar />
      <PageBanner
        title="Academic Calendar"
        breadcrumb={[{ label: "Academic Calendar" }]}
      />

      <main className="flex-grow py-16 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-lg text-gray-600 mb-12 max-w-xl mx-auto">
            Stay updated with our academic schedule. View and download the official Rainbow International School academic calendars.
          </p>

          <div className="space-y-12 max-w-4xl mx-auto">
            {calendars.map((cal, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <img
                  src={cal.image}
                  alt={cal.label}
                  className="w-full object-contain bg-gray-50"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="p-5 flex items-center justify-between">
                  <span className="font-semibold" style={{ color: "#0d3b86" }}>{cal.label}</span>
                  <a
                    href={cal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-full text-sm hover:opacity-90 transition-opacity"
                    style={{ background: "#0d3b86" }}
                    data-testid={`link-calendar-${i}`}
                  >
                    <Download size={16} />
                    View Calendar
                  </a>
                </div>
              </div>
            ))}
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
