const images = [
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/12-300x200.jpg", alt: "Child aspiring to be a doctor", w: 190, h: 210, mt: 0 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/05-1-150x150.jpg", alt: "Child aspiring to be a pilot", w: 160, h: 180, mt: 24 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/03-150x150.jpg", alt: "Child aspiring to be a scientist", w: 130, h: 150, mt: 8 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/09-150x150.jpg", alt: "Child with art palette", w: 140, h: 165, mt: 16 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-homepage-testimonials-anuja-pradhan.jpg", alt: "School students", w: 160, h: 185, mt: 0 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png", alt: "Student achievement", w: 130, h: 150, mt: 28 },
  { src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png", alt: "School security", w: 150, h: 175, mt: 10 },
];

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Our School
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Welcome to Rainbow<br />
            <span style={{ color: "#0d3b86" }}>International School</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Educating Students for Success in an Evolving World
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center items-end">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 overflow-hidden rounded-[22px] shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{ width: img.w, height: img.h, marginTop: img.mt }}
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
