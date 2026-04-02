import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Mark D'Souza",
    location: "Parent · Rainbow International School",
    review: "It's a great educational establishment to entrust your kids to, with an excellent infrastructure and warm-hearted, friendly and cooperative staff. I will recommend Rainbow International School for your kids.",
    initials: "MD",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-mark-dsouza.jpg",
  },
  {
    name: "Mohan Ramaswamy",
    location: "Parent · Rainbow International School",
    review: "Good school, caring teachers, extremely supportive staff who put in a lot of effort. It's always a partnership between institutions and parents to give the best to children, and it has worked well for us. Keep up the good work!",
    initials: "MR",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-mohan-ramaswamy.jpg",
  },
  {
    name: "Ruchi Verma",
    location: "Parent · Rainbow International School",
    review: "I will recommend this school. It gave us so much in terms of values and it is very well organized. Teachers communicate wonderfully and the picnic was beyond expectations — so well organized!",
    initials: "RV",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-ruchi-verma.jpg",
  },
  {
    name: "Ratish Pradhan",
    location: "Parent · Rainbow International School",
    review: "We are very happy with the school, authorities and the management. Teachers are nice and ensure all kids get the required attention. Extracurricular activities are also well looked after.",
    initials: "RP",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-ratish-pradhan.jpg",
  },
  {
    name: "Alok Srivastava",
    location: "Parent · Rainbow International School",
    review: "A progressive school with very supportive management. Teachers and support staff are very cooperative. Most importantly, if there are any issues, the school always puts forward an issue-resolving approach.",
    initials: "AS",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-alok-shrivastava.jpg",
  },
  {
    name: "Anuja Pradhan",
    location: "Parent · Rainbow International School",
    review: "Highly recommended. Most lively atmosphere. The warmth makes every child comfortable. Practical activities, great hygiene — undoubtedly the best school in Thane.",
    initials: "AP",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-homepage-testimonials-anuja-pradhan.jpg",
  },
  {
    name: "Surabhi Trivedi",
    location: "Parent · Rainbow International School",
    review: "Feeling privileged to share my view. Just one word — Fantastic! The teachers are professional, caring and well organized. Infrastructure is outstanding. Children grow intellectually and in co-curricular activities.",
    initials: "ST",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-surabhi-trivedi.jpg",
  },
  {
    name: "Dhaval Lodaya",
    location: "Parent · Rainbow International School",
    review: "I would highly recommend Rainbow International School without hesitation. RIS gave my child a stellar foundation and a nurturing environment that made the school an extension of our family.",
    initials: "DL",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-dhaval-lodaya.jpg",
  },
];

export function Testimonials() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="py-24" style={{ background: "#f8faff" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-5" style={{ background: "#eef5ff", color: "#0d3b86" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-1">Parents' Corner</h2>
            <p className="text-gray-500 text-[15px]">What parents say about us.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex">
              {[1,2,3,4,5].map((s) => <Star key={s} size={15} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="font-black text-gray-900 text-lg">4.8</span>
            <span className="text-gray-400 text-sm">· Google Reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {visible.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              data-testid={`card-testimonial-${page * perPage + i}`}
            >
              <Quote size={28} className="mb-3 flex-shrink-0" style={{ color: "#e8f0ff" }} />
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow italic">
                "{t.review}"
              </p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div
                  className="w-11 h-11 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0 flex items-center justify-center text-sm font-black"
                  style={{ background: "#eef5ff", color: "#0d3b86" }}
                >
                  <img
                    src={t.image}
                    alt={t.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    data-testid={`img-testimonial-${page * perPage + i}`}
                  />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm leading-none mb-1" data-testid={`text-testimonial-name-${page * perPage + i}`}>
                    {t.name}
                  </p>
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={11} className="fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            data-testid="button-testimonial-prev"
            aria-label="Previous testimonials"
            className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
            style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                data-testid={`button-testimonial-dot-${i}`}
                aria-label={`Go to testimonials page ${i + 1}`}
                className="rounded-full transition-all duration-300 min-h-[44px] flex items-center"
                style={{ padding: "17px 0" }}
              >
                <span className="rounded-full block" style={{
                  width: i === page ? "28px" : "10px",
                  height: "10px",
                  background: i === page ? "#0d3b86" : "#9ca3af",
                }} />
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            data-testid="button-testimonial-next"
            aria-label="Next testimonials"
            className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
            style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
