import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { X } from "lucide-react";
import ScrollProgress from "@/components/home/ScrollProgress";

const CDN = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09";

const galleryData = [
  {
    category: "Academics",
    images: [
      { src: `${CDN}/Exhibition-1-1024x536-1.jpg`,    alt: "Science Exhibition – student projects" },
      { src: `${CDN}/Exhibition-2-1024x536-1.jpg`,    alt: "Science Exhibition – space models" },
      { src: `${CDN}/Exhibition-3-1024x536-1.jpg`,    alt: "Science Exhibition – display boards" },
      { src: `${CDN}/Exhibition-4-1024x536-1.jpg`,    alt: "Science Exhibition – hands-on activity" },
      { src: `${CDN}/Field-Trips-1-1024x536-1.jpg`,   alt: "Field Trip – classroom activity" },
      { src: `${CDN}/Field-Trips-2-1024x536-1.jpg`,   alt: "Field Trip – outdoor learning" },
      { src: `${CDN}/Field-Trips-3-1024x536-1.jpg`,   alt: "Field Trip – group activity" },
      { src: `${CDN}/Students-shots-1-1024x536-1.jpg`, alt: "Students with laptops in class" },
      { src: `${CDN}/Students-shots-2-1024x536-1.jpg`, alt: "Students working on computers" },
      { src: `${CDN}/Students-shots-3-1024x536-1.jpg`, alt: "Students with library teacher" },
    ],
  },
  {
    category: "Extracurriculars",
    images: [
      { src: `${CDN}/community-1024x536-1.jpg`,          alt: "Community event" },
      { src: `${CDN}/Extracurricular-1-1024x536-1.jpg`,  alt: "Annual day cultural performance" },
      { src: `${CDN}/Extracurricular-2-1024x536-1.jpg`,  alt: "Dance performance on stage" },
      { src: `${CDN}/Extracurricular-3-1024x536-2.jpg`,  alt: "Theatre and drama performance" },
      { src: `${CDN}/Extracurricular-4-1024x536-1.jpg`,  alt: "Students at cultural activity" },
      { src: `${CDN}/Organic-farming-1-1024x536-1.jpg`,  alt: "Students tending vegetable garden" },
      { src: `${CDN}/Organic-Farming-2-1024x536-1.jpg`,  alt: "Organic farming – planting" },
      { src: `${CDN}/Organic-Farming-3-1024x536-1.jpg`,  alt: "Organic farming – harvest" },
      { src: `${CDN}/Organic-Farming-4-1024x536-1.jpg`,  alt: "Butterfly garden activity" },
    ],
  },
  {
    category: "Sports",
    images: [
      { src: `${CDN}/Sports-1-1024x536-1.jpg`,  alt: "Students playing chess" },
      { src: `${CDN}/Sports-2-1024x536-1.jpg`,  alt: "Cricket on school ground" },
      { src: `${CDN}/Sports-3-1024x536-1.jpg`,  alt: "Karate practice" },
      { src: `${CDN}/Sports-4-1024x536-1.jpg`,  alt: "Skating on rink" },
      { src: `${CDN}/Sports-5-1024x536-1.jpg`,  alt: "Track and field event" },
      { src: `${CDN}/Sports-6-1024x536-1.jpg`,  alt: "Basketball practice" },
      { src: `${CDN}/Sports-7-1024x536-1.jpg`,  alt: "Annual sports day march past" },
      { src: `${CDN}/Sports-8-1024x536-1.jpg`,  alt: "Martial arts demonstration" },
      { src: `${CDN}/Sports-9-1024x536-1.jpg`,  alt: "Pyramid formation sports day" },
      { src: `${CDN}/Sports-10-1024x536-1.jpg`, alt: "Swimming competition" },
      { src: `${CDN}/Sports-11-1024x536-1.jpg`, alt: "Sports day event" },
      { src: `${CDN}/Sports-12-1024x536-1.jpg`, alt: "Outdoor games" },
      { src: `${CDN}/Sports-13-1024x536-1.jpg`, alt: "Football on turf" },
    ],
  },
  {
    category: "Amenities",
    images: [
      { src: "/images/gallery/talent/amphitheatre.png",           alt: "Amphitheatre and outdoor stage" },
      { src: "/images/gallery/talent/multipurpose-hall.png",      alt: "Multipurpose hall" },
      { src: "/images/gallery/talent/music-room.png",             alt: "Music Room" },
      { src: "/images/gallery/talent/art-craft-room.png",         alt: "Art and Craft Room" },
      { src: "/images/gallery/educational/e-learning-classrooms.png", alt: "E-learning enabled Classrooms" },
      { src: "/images/gallery/educational/school-library.png",    alt: "School Library" },
      { src: "/images/gallery/educational/reading-room.png",      alt: "Reading Room" },
      { src: "/images/gallery/educational/maths-science-lab.png", alt: "Maths & Science Lab" },
      { src: "/images/gallery/educational/storage-facility.jpg",  alt: "Storage Facility – Bags & Books" },
      { src: "/images/gallery/sports/cricket-ground.png",         alt: "Cricket Ground" },
      { src: "/images/gallery/sports/football-turf.png",          alt: "Football Turf" },
      { src: "/images/gallery/sports/swimming-pool.png",          alt: "Swimming Pool" },
      { src: "/images/gallery/sports/skating-rink.png",           alt: "Skating Rink" },
      { src: "/images/gallery/sports/basketball.png",             alt: "Basketball Court" },
      { src: "/images/gallery/sports/chess.png",                  alt: "Chess" },
      { src: "/images/gallery/sports/carrom.png",                 alt: "Carrom" },
      { src: "/images/gallery/sports/karate.png",                 alt: "Karate" },
      { src: "/images/gallery/organic-farming/organic-farming-1.webp", alt: "Organic Farming" },
      { src: "/images/gallery/organic-farming/organic-farming-2.webp", alt: "Organic Farming" },
      { src: "/images/gallery/about/welcome-to-ris.jpg",          alt: "Welcome to Rainbow International School" },
    ],
  },
  {
    category: "Achievements",
    images: [
      { src: `${CDN}/Achievements-1-1024x536-1.jpg`, alt: "Student achievement – karate medals" },
      { src: `${CDN}/Achievements-2-1024x536-1.jpg`, alt: "Student achievement – swimming medals" },
      { src: `${CDN}/Achievements-3-1024x536-1.jpg`, alt: "Students receiving karate awards" },
      { src: `${CDN}/rainbow-international-school-gallery-achievements-world-education-summit-2019.jpg`, alt: "World Education Summit 2019 award" },
      { src: `${CDN}/rainbow-international-school-thane-best-Preschool-and-Secondary-school.jpg`,        alt: "Best Preschool and Secondary School in Thane" },
      { src: `${CDN}/rainbow-international-school-thane-gallery-achievements-100-results.jpg`,           alt: "100% Class X result 2018-19" },
      { src: `${CDN}/rainbow-international-school-thane-gallery-achievements-featured-in-knowledge-review-magazine.jpg`, alt: "Featured in Knowledge Review Magazine" },
      { src: `${CDN}/rainbow-international-school-thane-gallery-achievements-fit-india-1.jpg`,           alt: "FIT INDIA School certificate" },
      { src: `${CDN}/rainbow-international-school-thane-gallery-achievements-wins-excellence-awards.jpg`, alt: "Excellence in Education award – India Today" },
      { src: `${CDN}/rainbow-international-school-thane-student-achievements-gallery-1.jpg`,             alt: "Student achievement – competition winners" },
      { src: `${CDN}/rainbow-international-school-thane-student-achievements-gallery-2.jpg`,             alt: "Student achievement – awards ceremony" },
      { src: `${CDN}/rainbow-international-school-thane-student-achievements-gallery-3.jpg`,             alt: "Student achievement – swimming championship" },
      { src: `${CDN}/rainbow-international-school-thane-student-achievements-gallery-4.jpg`,             alt: "Student achievement – national competition" },
      { src: `${CDN}/rainbow-international-school-thane-student-achievements-gallery.jpg`,               alt: "Student achievements gallery" },
    ],
  },
  {
    category: "Students",
    images: [
      { src: "/images/students/pre-primary-running.jpg",      alt: "Pre-Primary kids running in colorful uniforms" },
      { src: "/images/students/pre-primary-teacher.jpg",      alt: "Pre-Primary teacher engaging with young students" },
      { src: "/images/students/pre-primary-running-2.jpg",    alt: "Pre-Primary kids outdoor activity" },
      { src: "/images/students/primary-section.jpg",          alt: "Primary student raising hand in classroom" },
      { src: "/images/students/primary-classroom-hand.jpg",   alt: "Primary students in classroom" },
      { src: "/images/students/primary-group-work.jpg",       alt: "Primary students working together" },
      { src: "/images/students/primary-walking.png",          alt: "Primary students walking with school bags" },
      { src: "/images/students/middle-section.jpg",           alt: "Middle school students in classroom" },
      { src: "/images/students/secondary-students.png",       alt: "Secondary students in navy blazers" },
      { src: "/images/students/secondary-students-2.png",     alt: "Secondary students group photo" },
      { src: "/images/students/senior-secondary-girls.jpg",   alt: "Senior Secondary girls reading together" },
      { src: "/images/students/senior-secondary-group.jpg",   alt: "Senior Secondary students in blazers" },
      { src: "/images/students/physics-lab.png",              alt: "Student in physics lab" },
      { src: "/images/students/chemistry-lab.png",            alt: "Student in chemistry lab" },
      { src: "/images/students/swimmer.png",                  alt: "Swimming champion with medals" },
      { src: "/images/students/cyclist.png",                  alt: "Cycling champion – Team Maharashtra" },
      { src: "/images/students/kickboxer.png",                alt: "Kickboxing student" },
      { src: "/images/students/actor.png",                    alt: "Student achiever" },
      { src: "/images/students/doctor-student.png",           alt: "Student in doctor coat" },
    ],
  },
];

export default function PhotoGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const categories = ["All", ...galleryData.map((g) => g.category)];
  const filtered =
    activeCategory === "All"
      ? galleryData.flatMap((g) => g.images)
      : galleryData.find((g) => g.category === activeCategory)?.images || [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Photo Gallery - Rainbow International School Thane"
        description="Browse the Rainbow International School photo gallery — academics, extracurriculars, sports, amenities, and achievements from our campus in Thane West."
        keywords="Rainbow school photo gallery, school photos Thane West, school campus photos Rainbow International"
        canonical="https://rainbowinternationalschool.in/photo-gallery/"
      />
      <Navbar />
      <PageBanner
        title="Photo Gallery"
        breadcrumb={[{ label: "Photo Gallery" }]}
      />

      <main className="flex-grow py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-testid={`button-category-${cat}`}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === cat
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:text-white"
                }`}
                style={activeCategory === cat ? { background: "#0d3b86" } : {}}
                onMouseEnter={(e) => { if (activeCategory !== cat) (e.currentTarget as HTMLElement).style.background = "#0d3b86"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { if (activeCategory !== cat) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = ""; } }}
              >
                {cat}
              </button>
            ))}
          </div>

          {activeCategory === "All" ? (
            galleryData.map((group) => (
              <div key={group.category} className="mb-14">
                <h2 className="text-2xl font-black mb-6 text-center" style={{ color: "#0d3b86" }}>{group.category}</h2>
                <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                  {group.images.map((img, i) => (
                    <GalleryCard key={i} img={img} index={i} onClick={() => setLightbox(img)} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {filtered.map((img, i) => (
                <GalleryCard key={i} img={img} index={i} onClick={() => setLightbox(img)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
            onClick={() => setLightbox(null)}
            data-testid="button-close-lightbox"
          >
            <X size={24} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            decoding="async"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 text-white/80 text-sm">{lightbox.alt}</p>
        </div>
      )}

      <Footer />
    </div>
  );
}

function GalleryCard({ img, index, onClick }: { img: { src: string; alt: string }; index: number; onClick: () => void }) {
  return (
    <div
      className="break-inside-avoid cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100 mb-3"
      onClick={onClick}
      data-testid={`img-gallery-${index}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={img.src}
          alt={img.alt}
          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.target as HTMLImageElement).closest('div.break-inside-avoid')?.remove(); }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
          <p className="w-full text-white text-xs px-3 py-2 font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
            {img.alt}
          </p>
        </div>
      </div>
    </div>
  );
}
