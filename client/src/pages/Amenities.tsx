import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const talentSpaces = [
  { name: "Amphitheatre",       image: "/amenities/amphitheatre.png" },
  { name: "Music Room",         image: "/amenities/music-room.png" },
  { name: "Art and Craft Room", image: "/amenities/art-craft-room.png" },
  { name: "Multipurpose Hall",  image: "/amenities/multipurpose-hall.png" },
];

const sportsSpaces = [
  { name: "Cricket Ground",              image: "/amenities/cricket-ground.png" },
  { name: "Football Turf",               image: "/amenities/football-turf.png" },
  { name: "Skating Rink",                image: "/amenities/skating-rink.png" },
  { name: "Swimming Pool",               image: "/amenities/swimming-pool.png" },
  { name: "Rock Climbing & Rappelling",  image: "/amenities/rock-climbing.png" },
  { name: "Basket Ball",                 image: "/amenities/basketball.png" },
  { name: "Table Tennis",                image: "/amenities/table-tennis.png" },
  { name: "Chess",                       image: "/amenities/chess.png" },
  { name: "Carrom",                      image: "/amenities/carrom.png" },
  { name: "Karate",                      image: "/amenities/karate.png" },
];

const educationalResources = [
  { name: "E-learning enabled Classrooms", image: "/amenities/elearning-classroom.png" },
  { name: "Storage Facility – Bags & Books", image: "/amenities/storage-bags-books.png" },
  { name: "Reading Room",                  image: "/amenities/reading-room.png" },
  { name: "Maths & Science Lab",           image: "/amenities/maths-science-lab.png" },
  { name: "School Library",                image: "/amenities/school-library.png" },
  { name: "Bank",                          image: "/amenities/school-bank.png" },
];

const supportEquipments = [
  { name: "AC Classrooms",          image: "/amenities/ac-classrooms.png" },
  { name: "Generator Backup",       image: "/amenities/generator-backup.png" },
  { name: "Hygiene",                image: "/amenities/hygiene.png" },
  { name: "Fire Compliance",        image: "/amenities/fire-compliance.png" },
  { name: "Infirmary & Trained Nurse", image: "/amenities/infirmary.png" },
  { name: "Ambulance",              image: "/amenities/ambulance.png" },
  { name: "CCTV Surveillance",      image: "/amenities/cctv-surveillance.png" },
  { name: "Metal Detectors",        image: "/amenities/metal-detectors.png" },
];

const organicFarmingImages = [
  "/amenities/organic-farming-1.png",
  "/amenities/organic-farming-2.png",
  "/amenities/organic-farming-3.png",
];

function AmenityCard({ name, image }: { name: string; image: string }) {
  return (
    <div className="group overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = '/amenities/amphitheatre.png'; }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#f97316" }} />
      </div>
      <div className="py-3 px-2 bg-white">
        <p className="font-semibold text-sm text-center text-gray-800 leading-snug">{name}</p>
      </div>
    </div>
  );
}

function SpaceGrid({ title, items, alt }: { title: string; items: { name: string; image: string }[]; alt?: boolean }) {
  return (
    <section className="py-14" style={alt ? { background: "#f8faff" } : { background: "#fff" }}>
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <AmenityCard key={i} name={item.name} image={item.image} />
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

        {/* Intro */}
        <div className="py-10" style={{ background: "#f8faff" }}>
          <p className="text-center text-lg text-gray-600 max-w-2xl mx-auto px-4">
            We offer globally recognized educational resources and state-of-the-art facilities that make Rainbow International School the best international school in Thane.
          </p>
        </div>

        {/* Talent Spaces */}
        <SpaceGrid title="Talent Spaces" items={talentSpaces} />

        {/* Sports Spaces */}
        <SpaceGrid title="Sports Spaces" items={sportsSpaces} alt />

        {/* Educational Resources */}
        <SpaceGrid title="Educational Resources" items={educationalResources} />

        {/* Support Equipments */}
        <SpaceGrid title="Support Equipments" items={supportEquipments} alt />

        {/* Organic Farming */}
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-black text-center mb-4" style={{ color: "#0d3b86" }}>Organic Farming</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 text-sm leading-relaxed">
              10,000 sq.ft. of Organic Vegetable Garden. Children grow seasonal vegetables with the help of a gardener every quarter
              and are allowed to take the produce back home during harvest season. 5,000 sq.ft. of Butterfly Garden.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {organicFarmingImages.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={img}
                      alt={`Organic farming ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/amenities/organic-farming-1.png'; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#f97316" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
