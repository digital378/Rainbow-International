const careerImages = [
  {
    src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/12-300x200.jpg",
    alt: "Child as doctor",
    className: "col-start-2 row-start-1 w-36 h-44 rounded-2xl object-cover shadow-lg",
  },
  {
    src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/03-150x150.jpg",
    alt: "Child as scientist",
    className: "col-start-3 row-start-1 w-24 h-28 rounded-2xl object-cover shadow-lg self-end",
  },
  {
    src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/05-1-150x150.jpg",
    alt: "Child as pilot",
    className: "col-start-4 row-start-1 w-36 h-44 rounded-2xl object-cover shadow-lg",
  },
  {
    src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/09-150x150.jpg",
    alt: "Child with art palette",
    className: "col-start-1 row-start-2 w-24 h-28 rounded-2xl object-cover shadow-lg self-start",
  },
  {
    src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-homepage-testimonials-anuja-pradhan.jpg",
    alt: "School students",
    className: "col-start-2 row-start-2 w-32 h-36 rounded-2xl object-cover shadow-lg",
  },
  {
    src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/Primary-scetion-768x513.png",
    alt: "Primary students",
    className: "col-start-3 row-start-2 w-20 h-24 rounded-2xl object-cover shadow-lg self-center",
  },
  {
    src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad-2.png",
    alt: "Student achievement",
    className: "col-start-4 row-start-2 w-28 h-32 rounded-2xl object-cover shadow-lg",
  },
  {
    src: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/security-768x610.png",
    alt: "Security",
    className: "col-start-3 row-start-3 w-20 h-24 rounded-2xl object-cover shadow-lg",
  },
];

export function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="relative overflow-hidden" style={{ background: "#e8f4fb" }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full" style={{ display: "block", marginTop: "-2px" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M0,80 C180,120 360,40 540,80 C720,120 900,40 1080,80 C1260,120 1350,60 1440,80 L1440,0 L0,0 Z" fill="white" />
        </svg>
        <div className="pb-8" />
      </div>

      <div className="container mx-auto px-4 text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Welcome to<br />Rainbow International School
        </h2>
        <p className="text-gray-500 text-base">Educating Students for Success in an Evolving World</p>
      </div>

      <div className="container mx-auto px-4 flex justify-center">
        <div className="grid grid-cols-4 grid-rows-3 gap-3 items-center" style={{ minHeight: "320px" }}>
          {careerImages.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              className={img.className}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
