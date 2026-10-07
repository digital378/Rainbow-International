export interface WaveOneFaq {
  q: string;
  a: string;
  answerLink?: { text: string; href: string };
}

export function buildFaqPageSchema(faqs: WaveOneFaq[]) {
  return {
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };
}

interface WaveOneSeoBlockProps {
  pageId: string;
  quickAnswer: string;
  quickAnswerHeading?: string;
  faqs: WaveOneFaq[];
  faqHeading?: string;
}

export function WaveOneSeoBlock({
  pageId,
  quickAnswer,
  quickAnswerHeading = "Quick answer",
  faqs,
  faqHeading = "Frequently asked questions",
}: WaveOneSeoBlockProps) {
  return (
    <section
      aria-labelledby={`wave1-qa-${pageId}`}
      className="bg-[#f8faff] border-b border-gray-100"
      data-testid={`section-quick-answer-${pageId}`}
    >
      <div className="container mx-auto px-4 max-w-4xl py-10 md:py-12">
        <h2
          id={`wave1-qa-${pageId}`}
          className="font-['DM_Sans'] font-black text-xl md:text-2xl text-[#091a4f] mb-3"
        >
          {quickAnswerHeading}
        </h2>
        <p
          className="text-gray-700 leading-relaxed text-[15px] md:text-base"
          data-testid={`text-quick-answer-${pageId}`}
        >
          {quickAnswer}
        </p>

        <h3 className="font-['DM_Sans'] font-black text-lg md:text-xl text-[#091a4f] mt-8 mb-3">
          {faqHeading}
        </h3>
        <div className="divide-y divide-gray-200 rounded-2xl bg-white border border-gray-100">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group p-4 md:p-5"
              data-testid={`faq-${pageId}-q${i + 1}`}
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[15px] font-semibold text-[#091a4f]">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 text-amber-500 text-xl leading-none transition-transform group-open:rotate-45 select-none"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {f.answerLink ? (
                  <>
                    {f.a.split(f.answerLink.text)[0]}
                    <a href={f.answerLink.href}>{f.answerLink.text}</a>
                    {f.a.split(f.answerLink.text)[1]}
                  </>
                ) : f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
