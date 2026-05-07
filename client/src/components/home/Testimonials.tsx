import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, MessageCircle } from "lucide-react";

const testimonials = [
  {
    name: "Mark D'Souza",
    location: "Parent · Rainbow International School",
    review: "It's a great educational establishment to entrust your kids to, with an excellent infrastructure and warm-hearted, friendly and cooperative staff. I will recommend Rainbow International School for your kids.",
    initials: "MD",
  },
  {
    name: "Mohan Ramaswamy",
    location: "Parent · Rainbow International School",
    review: "Good school, caring teachers, extremely supportive staff who put in a lot of effort. It's always a partnership between institutions and parents to give the best to children, and it has worked well for us. Keep up the good work!",
    initials: "MR",
  },
  {
    name: "Ruchi Verma",
    location: "Parent · Rainbow International School",
    review: "I will recommend this school. It gave us so much in terms of values and it is very well organized. Teachers communicate wonderfully and the picnic was beyond expectations — so well organized!",
    initials: "RV",
  },
  {
    name: "Ratish Pradhan",
    location: "Parent · Rainbow International School",
    review: "We are very happy with the school, authorities and the management. Teachers are nice and ensure all kids get the required attention. Extracurricular activities are also well looked after.",
    initials: "RP",
  },
  {
    name: "Alok Srivastava",
    location: "Parent · Rainbow International School",
    review: "A progressive school with very supportive management. Teachers and support staff are very cooperative. Most importantly, if there are any issues, the school always puts forward an issue-resolving approach.",
    initials: "AS",
  },
  {
    name: "Anuja Pradhan",
    location: "Parent · Rainbow International School",
    review: "Highly recommended. Most lively atmosphere. The warmth makes every child comfortable. Practical activities, great hygiene — undoubtedly the best school in Thane.",
    initials: "AP",
  },
  {
    name: "Surabhi Trivedi",
    location: "Parent · Rainbow International School",
    review: "Feeling privileged to share my view. Just one word — Fantastic! The teachers are professional, caring and well organized. Infrastructure is outstanding. Children grow intellectually and in co-curricular activities.",
    initials: "ST",
  },
  {
    name: "Dhaval Lodaya",
    location: "Parent · Rainbow International School",
    review: "I would highly recommend Rainbow International School without hesitation. RIS gave my child a stellar foundation and a nurturing environment that made the school an extension of our family.",
    initials: "DL",
  },
];

const colors = ["#091a4f", "#0d3b86", "#f59e0b", "#1550b8", "#d97706", "#164e63", "#7c3aed", "#059669"];

export function Testimonials() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="py-20" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="inline-block mb-4">
              <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Parents' Corner</span>
              <div className="w-8 h-0.5 bg-amber-400 mt-2" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-1 tracking-tight">What Parents Say About RIS</h2>
            <p className="text-gray-500 text-[15px]">Authentic voices from our school community.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 border border-gray-100 shadow-sm rounded-full">
            <div className="flex">
              {[1,2,3,4,5].map((s) => <Star key={s} size={15} className="fill-amber-400 text-amber-400" />)}
            </div>
            <span className="font-extrabold text-gray-900 text-lg">4.8</span>
            <span className="text-gray-400 text-sm">· Google Reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {visible.map((t, i) => {
            const globalIndex = page * perPage + i;
            return (
              <div
                key={i}
                className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col"
                style={{ borderRadius: "16px" }}
                data-testid={`card-testimonial-${globalIndex}`}
              >
                <Quote size={28} className="mb-3 flex-shrink-0 text-amber-200" />
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow italic">"{t.review}"</p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div
                    className="w-11 h-11 overflow-hidden border-2 border-amber-100 flex-shrink-0 flex items-center justify-center text-sm font-extrabold text-white"
                    style={{ background: colors[globalIndex % colors.length], borderRadius: "12px" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm leading-none mb-1" data-testid={`text-testimonial-name-${globalIndex}`}>{t.name}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={11} className="fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            data-testid="button-testimonial-prev"
            aria-label="Previous testimonials"
            className="w-11 h-11 border-2 flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-30"
            style={{ borderColor: "#091a4f", color: "#091a4f", borderRadius: "12px" }}
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
                className="transition-all duration-300 min-h-[44px] flex items-center"
                style={{ padding: "17px 0" }}
              >
                <span className="block" style={{ width: i === page ? "28px" : "10px", height: "4px", background: i === page ? "#091a4f" : "#d1d5db", borderRadius: "2px", transition: "all 0.3s" }} />
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            data-testid="button-testimonial-next"
            aria-label="Next testimonials"
            className="w-11 h-11 border-2 flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-30"
            style={{ borderColor: "#091a4f", color: "#091a4f", borderRadius: "12px" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Counsellor CTA */}
        <div className="text-center">
          <a
            href="/admissions"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 font-bold text-[#091a4f] text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg"
            style={{ background: "#fbbf24", borderRadius: "9999px" }}
            data-testid="btn-speak-counsellor"
          >
            <MessageCircle size={16} />
            Speak to an Admissions Counsellor
          </a>
        </div>
      </div>
    </section>
  );
}
