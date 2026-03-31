import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { Download } from "lucide-react";

const bookLists = [
  { grade: "Nursery", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Jr. KG", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Sr. KG", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 1", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 2", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 3", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 4", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 5", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 6", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 7", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 8", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 9", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 10", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 11 – Science", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 11 – Commerce", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 11 – Humanities", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 12 – Science", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 12 – Commerce", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
  { grade: "Class 12 – Humanities", year: "2025–26", href: "https://rainbowinternationalschool.in/book-list/" },
];

export default function BookList() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Book List - Rainbow International School Thane"
        description="Rainbow International School provides a book list and study material to each student so they understand the syllabus from the start of the year. Download book lists for all classes."
        keywords="Rainbow school book list, school books Thane West, CBSE book list Thane, Rainbow International School study material"
        canonical="https://rainbowinternationalschool.in/book-list/"
      />
      <Navbar />
      <PageBanner
        title="Book List"
        subtitle="Study materials for all classes — Academic Year 2025–26."
        breadcrumb={[{ label: "Book List" }]}
      />

      <main className="flex-grow py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10 text-amber-800 text-sm">
            <strong>Note:</strong> The book lists below are for the academic year 2025–26. Please contact the school office or visit the school's official website for the downloadable PDFs. For queries, call <a href="tel:+918655003366" className="underline font-semibold">+91 86550 03366</a>.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookLists.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between bg-card border rounded-xl p-4 shadow hover:shadow-md hover:border-primary/30 transition-all"
                data-testid={`card-booklist-${i}`}
              >
                <div>
                  <span className="font-serif font-bold text-primary">{item.grade}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{item.year}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Download size={16} className="text-primary" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-4">Can't find what you're looking for? Contact the school office directly.</p>
            <a href="tel:+918655003366" className="inline-block bg-primary text-white font-bold py-2.5 px-8 rounded-lg hover:bg-primary/90 transition-colors text-sm">
              Call +91 86550 03366
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
