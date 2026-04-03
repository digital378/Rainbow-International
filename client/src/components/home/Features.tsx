const images = [
  { src: "/images/students/pre-primary-running.jpg", alt: "Pre-Primary kids running at Rainbow campus", w: 200, h: 240 },
  { src: "/images/students/primary-classroom-hand.jpg", alt: "Primary student raising hand in classroom", w: 170, h: 200 },
  { src: "/images/students/primary-group-work.jpg", alt: "Students collaborating in classroom", w: 140, h: 170 },
  { src: "/images/students/pre-primary-teacher.jpg", alt: "Teacher engaging with pre-primary students", w: 150, h: 185 },
  { src: "/images/students/secondary-students.png", alt: "Secondary students in navy blazers", w: 170, h: 210 },
  { src: "/images/students/senior-secondary-group.jpg", alt: "Senior Secondary students group", w: 140, h: 170 },
  { src: "/images/students/middle-section.jpg", alt: "Middle school students in classroom", w: 160, h: 195 },
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
              style={{ width: img.w, height: img.h, borderRadius: "16px" }}
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
