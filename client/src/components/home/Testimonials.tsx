import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Mark D'Souza",
    review: "It's a great educational establishment to entrust your kids too, with an excellent infrastructure and warm-hearted, friendly and cooperative staff. I will recommend Rainbow International School for your kids.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-mark-dsouza.jpg",
  },
  {
    name: "Mohan Ramaswamy",
    review: "Good school, caring teachers, extremely supportive staff who put in a lot of effort and the experience has been good for us. It's always a partnership between Institutions and parents to give the best to children and has therefore worked well for us. Keep up the good work!",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-mohan-ramaswamy.jpg",
  },
  {
    name: "Ruchi Verma",
    review: "I will recommend this school as this school given up so much in terms of values and well organized. It was first time I sent my daughter for outstation picnic and beyond expectations it was really very well organized and communication between teachers and parents are always welcome.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-ruchi-verma.jpg",
  },
  {
    name: "Ratish Pradhan",
    review: "We are very Happy with the school, authorities and the management. Teachers are also nice and ensure all the kids get the required attention. Extra curricular activities are also looked after and appreciated.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-ratish-pradhan.jpg",
  },
  {
    name: "Alok Srivastava",
    review: "A Progressive School with Very Supportive Management. Teachers & Support staff are very cooperative. Most Importantly, even if there are any issues, School always puts forward an issue resolving approach.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-testimonials-alok-shrivastava.jpg",
  },
  {
    name: "Anuja Pradhan",
    review: "Highly recommended school. Most lively atmosphere. The warmth in the school makes every child comfortable. Lot of extra efforts taken by the management to introduce practical activities for students. Hygiene is their forte — undoubtedly the best school in Thane.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-homepage-testimonials-anuja-pradhan.jpg",
  },
  {
    name: "Chandrasekhar Ella",
    review: "The study pattern in Rainbow is very well balanced between books & extra activity. My 8 year old son explains everything he learned — this means he is enjoying, which was not the case when he was in another school. Great going Rainbow teachers!",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-chandrasekhar-ella-1.jpg",
  },
  {
    name: "Amrapali Koonapareddy",
    review: "My daughter Aarya goes to this school. It is a great school with amazing infrastructure. Safety is the most important thing that they have. Teachers are very supportive. My most liked feature is their own organic farm where kids learn things practically.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-amrapali-koonapareddy.jpg",
  },
  {
    name: "Dhaval Lodaya",
    review: "I would highly recommend Rainbow International School without hesitation. RIS gave my child a stellar foundation plus a nurturing environment that made the school an extension of our family. To watch the excellent teachers at Rainbow International School in action is truly a sight!",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-dhaval-lodaya.jpg",
  },
  {
    name: "Surabhi Trivedi",
    review: "Hello...feeling privileged to share my view on this page. Just a word... Fantastic school. The teachers are Professional, caring and well organized.. infrastructure is outstanding. Children grow intellectually as well as in other co Curricular activities.. teachers really care & truly want the best for a child...",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-surabhi-trivedi.jpg",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const t = testimonials[current];

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "#f8faff" }}>
      <div className="absolute top-10 left-10 text-9xl font-black opacity-5 select-none" style={{ color: "#0d3b86", lineHeight: 1 }}>"</div>
      <div className="absolute bottom-10 right-10 text-9xl font-black opacity-5 select-none" style={{ color: "#0d3b86", lineHeight: 1, transform: "rotate(180deg)" }}>"</div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-4 py-1.5 rounded-full" style={{ background: "#e8f4fb", color: "#0d3b86" }}>
            Parent Voices
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Parents Corner</h2>
          <p className="text-gray-500 text-base">Explore Parent's Response tab down here.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-10 md:p-14 relative border border-gray-100" data-testid={`card-testimonial-${current}`}>
            <div className="text-6xl font-black leading-none mb-4" style={{ color: "#ffd600" }}>"</div>

            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 italic font-light">
              {t.review}
            </p>

            <div className="flex items-center gap-4">
              <img
                src={t.image}
                alt={t.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-yellow-300 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0d3b86&color=fff`;
                }}
                data-testid={`img-testimonial-${current}`}
              />
              <div>
                <p className="font-black text-lg" style={{ color: "#e07020" }} data-testid={`text-testimonial-name-${current}`}>
                  {t.name}
                </p>
                <p className="text-gray-400 text-sm">Parent, Rainbow International School</p>
              </div>
              <div className="ml-auto flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              data-testid="button-testimonial-prev"
              className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  data-testid={`button-testimonial-dot-${i}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? "24px" : "10px",
                    height: "10px",
                    background: i === current ? "#0d3b86" : "#d1d5db",
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              data-testid="button-testimonial-next"
              className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ borderColor: "#0d3b86", color: "#0d3b86" }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
