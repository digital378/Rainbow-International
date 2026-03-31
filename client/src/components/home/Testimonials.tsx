import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Mark D'Souza",
    location: "Parent, Rainbow International School",
    review: "It's a great educational establishment to entrust your kids too, with an excellent infrastructure and warm-hearted, friendly and cooperative staff. I will recommend Rainbow International School for your kids.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-mark-dsouza.jpg",
    initials: "MD",
  },
  {
    name: "Mohan Ramaswamy",
    location: "Parent, Rainbow International School",
    review: "Good school, caring teachers, extremely supportive staff who put in a lot of effort and the experience has been good for us. It's always a partnership between Institutions and parents to give the best to children and has therefore worked well for us. Keep up the good work!",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-mohan-ramaswamy.jpg",
    initials: "MR",
  },
  {
    name: "Ruchi Verma",
    location: "Parent, Rainbow International School",
    review: "I will recommend this school as this school given up so much in terms of values and well organized. It was first time I sent my daughter for outstation picnic and beyond expectations it was really very well organized and communication between teachers and parents are always welcome.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-ruchi-verma.jpg",
    initials: "RV",
  },
  {
    name: "Ratish Pradhan",
    location: "Parent, Rainbow International School",
    review: "We are very Happy with the school, authorities and the management. Teachers are also nice and ensure all the kids get the required attention. Extra curricular activities are also looked after and appreciated.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-ratish-pradhan.jpg",
    initials: "RP",
  },
  {
    name: "Alok Srivastava",
    location: "Parent, Rainbow International School",
    review: "A Progressive School with Very Supportive Management. Teachers & Support staff are very cooperative. Most Importantly, even if there are any issues, School always puts forward an issue resolving approach.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-alok-shrivastava.jpg",
    initials: "AS",
  },
  {
    name: "Anuja Pradhan",
    location: "Parent, Rainbow International School",
    review: "Highly recommended school. Most lively atmosphere. The warmth in the school makes every child comfortable. Lot of extra efforts taken by the management to introduce practical activities for students. Hygiene is their forte — undoubtedly the best school in Thane.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-homepage-testimonials-anuja-pradhan.jpg",
    initials: "AP",
  },
  {
    name: "Surabhi Trivedi",
    location: "Parent, Rainbow International School",
    review: "Hello...feeling privileged to share my view on this page. Just a word... Fantastic school. The teachers are Professional, caring and well organized.. infrastructure is outstanding. Children grow intellectually as well as in other co Curricular activities.. teachers really care & truly want the best for a child...",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-surabhi-trivedi.jpg",
    initials: "ST",
  },
  {
    name: "Dhaval Lodaya",
    location: "Parent, Rainbow International School",
    review: "I would highly recommend Rainbow International School without hesitation. RIS gave my child a stellar foundation plus a nurturing environment that made the school an extension of our family. To watch the excellent teachers at Rainbow International School in action is truly a sight!",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-dhaval-lodaya.jpg",
    initials: "DL",
  },
];

export function Testimonials() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0d3b86" }} />
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-1">Parents Corner</h2>
            <p className="text-gray-500 text-base">Explore Parent's Response tab down here.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map((s) => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="font-black text-gray-900">4.8</span>
            <span className="text-gray-400 text-sm">· Google Reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {visible.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`card-testimonial-${page * perPage + i}`}
            >
              <div className="flex mb-3">
                {[1,2,3,4,5].map((s) => <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{t.review}"</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.style.background = "#e8f4fb";
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="color:#0d3b86;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${t.initials}</span>`;
                    }}
                    data-testid={`img-testimonial-${page * perPage + i}`}
                  />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm" data-testid={`text-testimonial-name-${page * perPage + i}`}>{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.location}</p>
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
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110"
            style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                data-testid={`button-testimonial-dot-${i}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === page ? "24px" : "10px",
                  height: "10px",
                  background: i === page ? "#0d3b86" : "#d1d5db",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            data-testid="button-testimonial-next"
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110"
            style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
