const careerImages = [
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/12-300x200.jpg", alt: "Child as doctor", size: "large" },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/03-150x150.jpg", alt: "Child as scientist", size: "small" },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/05-1-150x150.jpg", alt: "Child as pilot", size: "large" },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/09-150x150.jpg", alt: "Child with palette", size: "small" },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-homepage-testimonials-anuja-pradhan.jpg", alt: "School students", size: "medium" },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png", alt: "Achievement", size: "small" },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png", alt: "Security", size: "medium" },
];

const heightMap: Record<string, string> = { large: "h-52", medium: "h-40", small: "h-28" };

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
            Our School
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Welcome to<br />
            <span style={{ color: "#0d3b86" }}>Rainbow International School</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">Educating Students for Success in an Evolving World</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center items-end">
          {careerImages.map((img, i) => (
            <div
              key={i}
              className={`flex-shrink-0 overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1 ${heightMap[img.size]}`}
              style={{ width: img.size === "large" ? "200px" : img.size === "medium" ? "160px" : "120px" }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
