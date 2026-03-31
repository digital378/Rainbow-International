import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

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
    review: "Rainbow International School nurtures each child's natural talents & intelligence to help them achieve their full potential, through Academic Excellence, Outstanding coaching for Sports, Best Infrastructure, Personal Attention and Holistic Development.",
    image: "https://rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-reviews-surabhi-trivedi.jpg",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);

  const prev = () => setCurrent((c) => (c === 0 ? totalPages - 1 : c - 1));
  const next = () => setCurrent((c) => (c === totalPages - 1 ? 0 : c + 1));

  const visible = testimonials.slice(current * perPage, current * perPage + perPage);

  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm">Parents Corner</span>
          <h2 className="text-4xl font-serif font-bold text-primary mt-3 mb-4">What Parents Say</h2>
          <p className="text-muted-foreground text-lg">Explore Parent's Response — real voices from our Rainbow family.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {visible.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-lg border border-border/50 flex flex-col"
              data-testid={`card-testimonial-${current * perPage + i}`}
            >
              <Quote className="text-secondary/40 mb-4" size={32} />
              <p className="text-muted-foreground leading-relaxed flex-grow mb-6 text-sm">{t.review}</p>
              <div className="flex items-center gap-3 mt-auto">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
                  data-testid={`img-testimonial-${current * perPage + i}`}
                />
                <div>
                  <p className="font-bold text-primary text-sm" data-testid={`text-testimonial-name-${current * perPage + i}`}>
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Parent, Rainbow International School</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4">
          <button
            onClick={prev}
            data-testid="button-testimonial-prev"
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/80 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                data-testid={`button-testimonial-page-${i}`}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-primary/30"}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            data-testid="button-testimonial-next"
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/80 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
