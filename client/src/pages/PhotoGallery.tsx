import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { X } from "lucide-react";

const BASE = "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/";

const galleryData = [
  {
    category: "Academics",
    images: [
      { src: BASE + "Exhibition-1-1024x536-1.jpg", alt: "Project at the Exhibition" },
      { src: BASE + "Exhibition-2-1024x536-1.jpg", alt: "Exhibition" },
      { src: BASE + "Exhibition-3-1024x536-1.jpg", alt: "Exhibition" },
      { src: BASE + "Exhibition-4-1024x536-1.jpg", alt: "Exhibition" },
      { src: BASE + "Field-Trips-1-1024x536-1.jpg", alt: "Field Trips" },
      { src: BASE + "Field-Trips-2-1024x536-1.jpg", alt: "Field Trips" },
      { src: BASE + "Field-Trips-3-1024x536-1.jpg", alt: "Field Trips" },
      { src: BASE + "Students-shots-1-1024x536-1.jpg", alt: "Students Learning" },
      { src: BASE + "Students-shots-2-1024x536-1.jpg", alt: "Students in the Classroom" },
      { src: BASE + "Students-shots-3-1024x536-1.jpg", alt: "Students with Library Teacher" },
    ],
  },
  {
    category: "Extracurriculars",
    images: [
      { src: BASE + "community-1024x536-1.jpg", alt: "Community" },
      { src: BASE + "Extracurricular-1-1024x536-1.jpg", alt: "Extracurricular" },
      { src: BASE + "Extracurricular-2-1024x536-1.jpg", alt: "Extracurricular" },
      { src: BASE + "Extracurricular-3-1024x536-2.jpg", alt: "Extracurricular" },
      { src: BASE + "Extracurricular-4-1024x536-1.jpg", alt: "Extracurricular" },
      { src: BASE + "Organic-farming-1-1024x536-1.jpg", alt: "Organic Farming" },
      { src: BASE + "Organic-Farming-2-1024x536-1.jpg", alt: "Organic Farming" },
      { src: BASE + "Organic-Farming-3-1024x536-1.jpg", alt: "Organic Farming" },
      { src: BASE + "Organic-Farming-4-1024x536-1.jpg", alt: "Organic Farming" },
    ],
  },
  {
    category: "Sports",
    images: [
      { src: BASE + "Sports-1-1024x536-1.jpg", alt: "Sports" },
      { src: BASE + "Sports-2-1024x536-1.jpg", alt: "Sports" },
      { src: BASE + "Sports-3-1024x536-1.jpg", alt: "Sports" },
      { src: BASE + "Sports-4-1024x536-1.jpg", alt: "Students Playing Chess" },
    ],
  },
  {
    category: "Events",
    images: [
      { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Infrastructure-3-1024x536-1.jpg", alt: "School Infrastructure" },
      { src: "https://rainbowinternationalschool.in/wp-content/uploads/2023/04/picwish.webp", alt: "School Event" },
      { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/HO-web-art-work-for-pranit-04.png", alt: "Exhibition" },
    ],
  },
];

export default function PhotoGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const categories = ["All", ...galleryData.map((g) => g.category)];
  const images =
    activeCategory === "All"
      ? galleryData.flatMap((g) => g.images)
      : galleryData.find((g) => g.category === activeCategory)?.images || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Photo Gallery - Rainbow International School Thane"
        description="Browse the Rainbow International School photo gallery — academics, extracurriculars, sports, organic farming, cultural events and more from our campus in Thane West."
        keywords="Rainbow school photo gallery, school photos Thane West, school campus photos Rainbow International"
        canonical="https://rainbowinternationalschool.in/photo-gallery/"
      />
      <Navbar />
      <PageBanner
        title="Photo Gallery"
        breadcrumb={[{ label: "Photo Gallery" }]}
      />

      <main className="flex-grow py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-testid={`button-category-${cat}`}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="break-inside-avoid cursor-pointer overflow-hidden rounded-xl shadow hover:shadow-xl transition-shadow group"
                onClick={() => setLightbox(img)}
                data-testid={`img-gallery-${i}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
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
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}
