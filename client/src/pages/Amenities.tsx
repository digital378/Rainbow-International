import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const talentSpaces = [
  { name: "Amphitheatre", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Amphitheatre--768x512.png" },
  { name: "Music Room", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-music-600x400-1.jpg" },
  { name: "Art and Craft Room", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-arts-crafts-600x400-1.jpg" },
  { name: "Multipurpose Hall", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-multi-purpose-hall-600x400-1.jpg" },
];

const sportsSpaces = [
  { name: "Cricket Ground", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-cricket-ground-600x400-1.jpg" },
  { name: "Football Turf", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-football-turf-600x400-1.jpg" },
  { name: "Skating Rink", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-skating-rink-600x400-1.jpg" },
  { name: "Swimming Pool", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-swimming-pool-600x400-1.jpg" },
  { name: "Rock Climbing & Rappelling", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-rock-climbing-600x400-1.jpg" },
  { name: "Badminton Court", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-badminton-court-600x400-1.jpg" },
];

const academicSpaces = [
  { name: "Science Laboratory", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-science-lab-600x400-1.jpg" },
  { name: "Computer Laboratory", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-computer-lab-600x400-1.jpg" },
  { name: "Library", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-thane-student-aminities-library-600x400-1.jpg" },
  { name: "Organic Farm", image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Organic-farming-1-1024x536-1.jpg" },
];

function SpaceGrid({ title, items, alt }: { title: string; items: { name: string; image: string }[]; alt?: boolean }) {
  return (
    <section className="py-14" style={alt ? { background: "#f8faff" } : { background: "#fff" }}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-black text-center mb-8" style={{ color: "#0d3b86" }}>{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <div key={i} className="group overflow-hidden rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg'; }}
                />
              </div>
              <div className="p-3 bg-white">
                <p className="font-semibold text-sm text-center" style={{ color: "#0d3b86" }}>{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Amenities() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Amenities & Facilities - Rainbow International School Thane"
        description="Rainbow International School offers world-class amenities including Amphitheatre, Music Room, Swimming Pool, Cricket Ground, Football Turf, Science Labs, Library, and Organic Farm in Thane West."
        keywords="Rainbow school amenities Thane, school facilities Thane West, swimming pool school Thane, CBSE school facilities Thane"
        canonical="https://rainbowinternationalschool.in/amenities/"
      />
      <Navbar />
      <PageBanner
        title="Amenities & Facilities"
        breadcrumb={[{ label: "Amenities" }]}
      />

      <main className="flex-grow">
        <div className="py-10" style={{ background: "#f8faff" }}>
          <p className="text-center text-lg text-gray-600 max-w-2xl mx-auto px-4">
            We offer globally recognized educational resources and state-of-the-art facilities that make Rainbow International School the best international school in Thane.
          </p>
        </div>

        <SpaceGrid title="Talent Spaces" items={talentSpaces} />
        <SpaceGrid title="Sports Spaces" items={sportsSpaces} alt />
        <SpaceGrid title="Academic Spaces" items={academicSpaces} />

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
