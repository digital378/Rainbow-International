const images = [
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/12-300x200.jpg", alt: "Child aspiring to be a doctor", w: 200, h: 240 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/05-1-150x150.jpg", alt: "Child aspiring to be a pilot", w: 170, h: 200 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/03-150x150.jpg", alt: "Child aspiring to be a scientist", w: 140, h: 170 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/09-150x150.jpg", alt: "Child with art palette", w: 150, h: 185 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-homepage-testimonials-anuja-pradhan.jpg", alt: "School students", w: 170, h: 210 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png", alt: "Student achievement", w: 140, h: 170 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png", alt: "School security", w: 160, h: 195 },
];

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Our School</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
            Welcome to Rainbow<br />
            <span style={{ color: "#091a4f" }}>International School</span>
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            Educating Students for Success in an Evolving World
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center items-end">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{ width: img.w, height: img.h, borderRadius: "4px" }}
            >
              <img
                src={img.src}
                alt={img.alt}
                width={img.w}
                height={img.h}
                loading="lazy"
                decoding="async"
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
