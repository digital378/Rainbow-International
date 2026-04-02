import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";

const BASE = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09";
const BASE2 = "https://rainbowinternationalschool.in/wp-content/uploads";

const talentSpaces = [
  { name: "Amphitheatre",       image: `${BASE}/Amphitheatre--768x512.png`,                                                                          fallback: "/amenities/amphitheatre.png" },
  { name: "Music Room",         image: `${BASE}/rainbow-international-school-thane-student-aminities-music-600x400-1.jpg`,                            fallback: "/amenities/music-room.png" },
  { name: "Art and Craft Room", image: `${BASE}/rainbow-international-school-thane-student-aminities-arts-crafts-600x400-1.jpg`,                      fallback: "/amenities/art-craft-room.png" },
  { name: "Multipurpose Hall",  image: `${BASE}/rainbow-international-school-thane-student-aminities-multi-purpose-hall-600x400-1.jpg`,               fallback: "/amenities/multipurpose-hall.png" },
];

const sportsSpaces = [
  { name: "Cricket Ground",             image: `${BASE}/rainbow-international-school-thane-student-aminities-cricket-ground-600x400-1.jpg`,           fallback: "/amenities/cricket-ground.png" },
  { name: "Football Turf",              image: `${BASE}/rainbow-international-school-thane-student-aminities-football-turf-600x400-1.jpg`,            fallback: "/amenities/football-turf.png" },
  { name: "Skating Rink",               image: `${BASE}/rainbow-international-school-thane-student-aminities-skating-rink-600x400-1.jpg`,             fallback: "/amenities/skating-rink.png" },
  { name: "Swimming Pool",              image: `${BASE}/rainbow-international-school-thane-student-aminities-swimming-pool-600x400-1.jpg`,            fallback: "/amenities/swimming-pool.png" },
  { name: "Rock Climbing & Rappelling", image: `${BASE}/rainbow-international-school-thane-student-aminities-rock-climbing-600x400-1.jpg`,            fallback: "/amenities/rock-climbing.png" },
  { name: "Basket Ball",                image: `${BASE}/rainbow-international-school-thane-student-aminities-basketball-600x400-1.jpg`,               fallback: "/amenities/basketball.png" },
  { name: "Table Tennis",               image: `${BASE}/rainbow-international-school-thane-student-aminities-table-tennis-600x400-1.jpg`,             fallback: "/amenities/table-tennis.png" },
  { name: "Chess",                      image: `${BASE}/rainbow-international-school-thane-student-aminities-chess-600x400-1.jpg`,                    fallback: "/amenities/chess.png" },
  { name: "Carrom",                     image: `${BASE}/rainbow-international-school-thane-student-aminities-carrom-600x400-1.jpg`,                   fallback: "/amenities/carrom.png" },
  { name: "Karate",                     image: `${BASE}/rainbow-international-school-thane-student-aminities-karate-600x400-1.jpg`,                   fallback: "/amenities/karate.png" },
];

const educationalResources = [
  { name: "E-learning enabled Classrooms", image: `${BASE}/rainbow-international-school-thane-student-aminities-elearning-classrooms-600x400-1.jpg`, fallback: "/amenities/elearning-classroom.png" },
  { name: "Storage Facility – Bags & Books", image: `${BASE}/rainbow-international-school-thane-student-aminities-storage-bags-books-600x400-1.jpg`, fallback: "/amenities/storage-bags-books.png" },
  { name: "Reading Room",                  image: `${BASE}/rainbow-international-school-thane-student-aminities-reading-room-600x400-1.jpg`,          fallback: "/amenities/reading-room.png" },
  { name: "Maths & Science Lab",           image: `${BASE}/rainbow-international-school-thane-student-aminities-science-lab-600x400-1.jpg`,           fallback: "/amenities/maths-science-lab.png" },
  { name: "School Library",                image: `${BASE}/rainbow-international-school-thane-student-aminities-library-600x400-1.jpg`,               fallback: "/amenities/school-library.png" },
  { name: "Bank",                          image: `${BASE}/rainbow-international-school-thane-student-aminities-bank-600x400-1.jpg`,                   fallback: "/amenities/school-bank.png" },
];

const supportEquipments = [
  { name: "AC Classrooms",             image: `${BASE}/rainbow-international-school-thane-student-aminities-ac-classrooms-600x400-1.jpg`,             fallback: "/amenities/ac-classrooms.png" },
  { name: "Generator Backup",          image: `${BASE}/rainbow-international-school-thane-student-aminities-generator-backup-600x400-1.jpg`,          fallback: "/amenities/generator-backup.png" },
  { name: "Hygiene",                   image: `${BASE}/rainbow-international-school-thane-student-aminities-hygiene-600x400-1.jpg`,                   fallback: "/amenities/hygiene.png" },
  { name: "Fire Compliance",           image: `${BASE}/rainbow-international-school-thane-student-aminities-fire-compliance-600x400-1.jpg`,           fallback: "/amenities/fire-compliance.png" },
  { name: "Infirmary & Trained Nurse", image: `${BASE}/rainbow-international-school-thane-student-aminities-infirmary-trained-nurse-600x400-1.jpg`,  fallback: "/amenities/infirmary.png" },
  { name: "Ambulance",                 image: `${BASE}/rainbow-international-school-thane-student-aminities-ambulance-600x400-1.jpg`,                 fallback: "/amenities/ambulance.png" },
  { name: "CCTV Surveillance",         image: `${BASE}/rainbow-international-school-thane-student-aminities-cctv-surveillance-600x400-1.jpg`,         fallback: "/amenities/cctv-surveillance.png" },
  { name: "Metal Detectors",           image: `${BASE}/rainbow-international-school-thane-student-aminities-metal-detectors-600x400-1.jpg`,           fallback: "/amenities/metal-detectors.png" },
];

const organicFarmingImages = [
  { src: `${BASE2}/2022/09/Organic-farming-1-1024x536-1.jpg`,   fallback: "/amenities/organic-farming-1.png" },
  { src: `${BASE2}/2022/09/Organic-farming-2-1024x536-1.jpg`,   fallback: "/amenities/organic-farming-2.png" },
  { src: `${BASE2}/2023/04/rainbow-international-school-beyond-the-classroom-organic-farming-1024x683.jpg`, fallback: "/amenities/organic-farming-3.png" },
];

function AmenityCard({ name, image, fallback }: { name: string; image: string; fallback: string }) {
  return (
    <div className="group overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          width={600}
          height={400}
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#f97316" }} />
      </div>
      <div className="py-3 px-2 bg-white">
        <p className="font-semibold text-sm text-center text-gray-800 leading-snug">{name}</p>
      </div>
    </div>
  );
}

function SpaceGrid({ title, items, alt }: { title: string; items: { name: string; image: string; fallback: string }[]; alt?: boolean }) {
  return (
    <section className="py-14" style={alt ? { background: "#f8faff" } : { background: "#fff" }}>
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl font-black text-center mb-10" style={{ color: "#0d3b86" }}>{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <AmenityCard key={i} name={item.name} image={item.image} fallback={item.fallback} />
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
                      src={img.src}
                      alt={`Organic farming ${i + 1}`}
                      className="w-full h-full object-cover"
                      width={1024}
                      height={536}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).src = img.fallback; }}
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
