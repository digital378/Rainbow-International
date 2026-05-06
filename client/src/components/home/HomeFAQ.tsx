import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What board is Rainbow International School affiliated with?",
    a: "Rainbow International School is affiliated with the Central Board of Secondary Education (CBSE), New Delhi. Our affiliation number is 1130661. We follow the CBSE curriculum from Nursery through Class 12, covering Science, Commerce, and Humanities streams in the senior secondary section.",
  },
  {
    q: "What grades does Rainbow International School offer?",
    a: "We offer a complete K–12 education — from Nursery, Jr. KG, and Sr. KG in the Pre-Primary wing, through Class 1–5 (Primary), Class 6–8 (Middle School), Class 9–10 (Secondary), and Class 11–12 (Senior Secondary) with Science, Commerce, and Humanities streams.",
  },
  {
    q: "Where is Rainbow International School located in Thane?",
    a: "Our campus is located at Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra 400607. We are centrally situated and easily accessible from Hiranandani Estate, Manpada, Ghodbunder Road, Patlipada, Kavesar, Pokhran Road, and other neighbourhoods across Thane.",
  },
  {
    q: "How do I apply for admission at Rainbow International School?",
    a: "You can start the admission process by filling out the enquiry form on our website or calling us at +91 82915 68972. Our admissions counsellor will guide you through the process, which includes a campus visit, interaction with the academic team, and age-appropriate assessments for certain grade levels.",
  },
  {
    q: "Does the school provide transport facilities?",
    a: "Yes, we operate a fleet of GPS-tracked school buses covering 30+ routes across Thane, Mulund, Airoli, and surrounding areas. All buses are equipped with safety features and supervised by trained attendants to ensure safe door-to-door commute for students.",
  },
  {
    q: "What extracurricular activities are available?",
    a: "Rainbow offers a wide range of extracurricular activities including sports (football, basketball, swimming, cricket, chess), performing arts (dance, music, drama), visual arts, robotics, coding clubs, debate, Model United Nations, and community service programmes. These activities are integrated into the school calendar to ensure holistic development.",
  },
  {
    q: "What are the school's facilities and campus size?",
    a: "Our 3.5-acre campus features smart classrooms, fully-equipped science and computer labs, a library, a football turf, basketball and badminton courts, a swimming pool, an auditorium, art and music rooms, and landscaped play areas — all designed to support academics and physical development.",
  },
  {
    q: "What is the student-to-teacher ratio?",
    a: "We maintain an optimal student-to-teacher ratio to ensure personalised attention for every child. Our team of 200+ qualified educators are trained in modern pedagogical approaches, including the Multiple Intelligence methodology used in our Pre-Primary section.",
  },
  {
    q: "Is Rainbow International the best CBSE school in Thane?",
    a: "Rainbow International School is consistently recognised as one of the best CBSE schools in Thane. We have received multiple awards for academic excellence, innovative pedagogy, and holistic student development. With a 100% board result in our very first batch, a 3.5-acre campus, and a curriculum that balances academics with sports and the arts, parents across Thane trust Rainbow as a top choice for quality education.",
  },
  {
    q: "Is there a good school near me in Thane?",
    a: "If you live in or around Thane — including Brahmand, Hiranandani Estate, Manpada, Ghodbunder Road, Patlipada, Kavesar, Kolshet, or Pokhran Road — Rainbow International School is likely just minutes from your home. Our central location in Brahmand Phase 4 and a network of 30+ bus routes make us one of the most accessible schools in the area.",
  },
  {
    q: "What makes Rainbow International different from other schools near me?",
    a: "Rainbow stands out through its combination of a rigorous CBSE curriculum, the Multiple Intelligence approach in early years, one-on-one career counselling for senior students, and a 3.5-acre campus with world-class facilities. Unlike many schools in the area, we offer three streams in senior secondary — Science, Commerce, and Humanities — giving students flexibility to pursue their true interests.",
  },
  {
    q: "How do I find the best school near me for my child in Thane?",
    a: "When looking for the best school near you in Thane, consider factors like board affiliation, campus infrastructure, extracurricular programmes, teacher quality, and proximity to your home. Rainbow International School checks every box — CBSE-affiliated, award-winning, located centrally in Thane, and offering Nursery to Class 12 with door-to-door bus transport across the city.",
  },
];

function FAQItem({ faq, index, isOpen, toggle }: { faq: typeof faqs[0]; index: number; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left group"
        aria-expanded={isOpen}
        data-testid={`faq-toggle-${index}`}
      >
        <span className="text-[15px] font-semibold text-gray-800 pr-8 leading-snug group-hover:text-[#0d3b86] transition-colors">{faq.q}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-amber-500" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? "300px" : "0", opacity: isOpen ? 1 : 0 }}
      >
        <p className="text-sm text-gray-500 leading-relaxed pb-5 px-1">{faq.a}</p>
      </div>
    </div>
  );
}

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-14">
          <div className="inline-block mb-4">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Have Questions?</span>
            <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Everything parents want to know about admissions, academics, and life at Rainbow International School, Thane.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 md:px-8" data-testid="faq-list">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              toggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
