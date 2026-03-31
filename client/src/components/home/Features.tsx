const careerImages = [
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/12-300x200.jpg", alt: "Child as doctor", w: 200, h: 220 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/03-150x150.jpg", alt: "Child as scientist", w: 140, h: 160 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/05-1-150x150.jpg", alt: "Child as pilot", w: 190, h: 220 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/09-150x150.jpg", alt: "Child with palette", w: 130, h: 150 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-homepage-testimonials-anuja-pradhan.jpg", alt: "School students", w: 170, h: 190 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png", alt: "Achievement", w: 140, h: 160 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png", alt: "Security", w: 160, h: 180 },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0d3b86" }} />
            Our School
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
            Welcome to Rainbow<br />
            <span style={{ color: "#0d3b86" }}>International School</span>
          </h2>
          <p className="text-gray-500 text-lg">Educating Students for Success in an Evolving World</p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center items-end">
          {careerImages.map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 flex-shrink-0"
              style={{ width: img.w, height: img.h }}
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
