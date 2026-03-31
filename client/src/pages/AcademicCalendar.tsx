import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Download } from "lucide-react";

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
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Academic Calendar - Rainbow International School Thane"
        description="View and download the academic calendar for Rainbow International School, Thane West. Stay updated with important dates, events, and school activities."
        keywords="Rainbow school academic calendar, school calendar Thane West, Rainbow International School events schedule"
        canonical="https://rainbowinternationalschool.in/academic-calendar/"
      />
      <Navbar />
      <PageBanner
        title="Academic Calendar"
        breadcrumb={[{ label: "Academic Calendar" }]}
      />

      <main className="flex-grow py-16 bg-background">
        <div className="container mx-auto px-4">
          <p className="text-center text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            Stay updated with our academic schedule. View and download the official Rainbow International School academic calendars.
          </p>

          <div className="space-y-12 max-w-4xl mx-auto">
            {calendars.map((cal, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-lg border">
                <img
                  src={cal.image}
                  alt={cal.label}
                  className="w-full object-contain bg-gray-50"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="p-5 flex items-center justify-between">
                  <span className="font-semibold text-primary">{cal.label}</span>
                  <a
                    href={cal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors"
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
