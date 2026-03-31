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

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const t = testimonials[current];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">Parents Corner</h2>
          <p className="text-gray-500 text-sm">Explore Parent's Response tab down here.</p>
        </div>

        <div className="max-w-2xl mx-auto mt-10 text-center relative">
          <button
            onClick={prev}
            data-testid="button-testimonial-prev"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-12 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div data-testid={`card-testimonial-${current}`}>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 italic">
              {t.review}
            </p>
            <div className="flex justify-center mb-3">
              <img
                src={t.image}
                alt={t.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(t.name) + "&background=random";
                }}
                data-testid={`img-testimonial-${current}`}
              />
            </div>
            <p
              className="font-bold text-base"
              style={{ color: "#e07020" }}
              data-testid={`text-testimonial-name-${current}`}
            >
              {t.name}
            </p>
          </div>

          <button
            onClick={next}
            data-testid="button-testimonial-next"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-12 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                data-testid={`button-testimonial-dot-${i}`}
                className={`rounded-full transition-all duration-200 ${
                  i === current
                    ? "w-5 h-3 bg-orange-400"
                    : "w-3 h-3 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
