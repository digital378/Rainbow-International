import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import ScrollProgress from "@/components/home/ScrollProgress";
import { Link } from "wouter";
import { CheckCircle2, RotateCcw, ChevronRight, ArrowRight } from "lucide-react";

interface Question {
  id: number;
  category: string;
  text: string;
  options: { label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    category: "Academic Readiness",
    text: "Can your child recognise and name most letters of the alphabet?",
    options: [
      { label: "Yes, all or most letters", score: 3 },
      { label: "Some letters", score: 2 },
      { label: "Very few or none", score: 1 },
    ],
  },
  {
    id: 2,
    category: "Academic Readiness",
    text: "Can your child count to 20 and recognise numbers 1–10?",
    options: [
      { label: "Yes, confidently", score: 3 },
      { label: "With some help", score: 2 },
      { label: "Not yet", score: 1 },
    ],
  },
  {
    id: 3,
    category: "Social Skills",
    text: "How comfortable is your child playing and sharing with other children?",
    options: [
      { label: "Very comfortable — enjoys group play", score: 3 },
      { label: "Somewhat comfortable — needs encouragement", score: 2 },
      { label: "Prefers to play alone", score: 1 },
    ],
  },
  {
    id: 4,
    category: "Social Skills",
    text: "Can your child follow simple instructions from adults other than parents?",
    options: [
      { label: "Yes, consistently", score: 3 },
      { label: "Sometimes", score: 2 },
      { label: "Rarely", score: 1 },
    ],
  },
  {
    id: 5,
    category: "Emotional Maturity",
    text: "How does your child handle being away from you for a few hours?",
    options: [
      { label: "Settles in quickly and happily", score: 3 },
      { label: "Upset initially but calms down", score: 2 },
      { label: "Gets very distressed", score: 1 },
    ],
  },
  {
    id: 6,
    category: "Emotional Maturity",
    text: "Can your child express feelings using words (happy, sad, angry)?",
    options: [
      { label: "Yes, uses words to express feelings", score: 3 },
      { label: "Sometimes uses words, sometimes acts out", score: 2 },
      { label: "Mostly acts out emotions physically", score: 1 },
    ],
  },
  {
    id: 7,
    category: "Physical Development",
    text: "Can your child hold a pencil or crayon and draw basic shapes?",
    options: [
      { label: "Yes, draws shapes and attempts letters", score: 3 },
      { label: "Can hold a pencil but shapes are rough", score: 2 },
      { label: "Struggles with grip", score: 1 },
    ],
  },
  {
    id: 8,
    category: "Physical Development",
    text: "Can your child manage tasks like buttoning a shirt or using a zipper?",
    options: [
      { label: "Yes, independently", score: 3 },
      { label: "With some assistance", score: 2 },
      { label: "Needs full help", score: 1 },
    ],
  },
  {
    id: 9,
    category: "Independence",
    text: "Can your child use the washroom independently?",
    options: [
      { label: "Yes, fully independent", score: 3 },
      { label: "Mostly, but needs occasional reminders", score: 2 },
      { label: "Needs regular assistance", score: 1 },
    ],
  },
  {
    id: 10,
    category: "Independence",
    text: "Can your child eat a meal independently using a spoon or fork?",
    options: [
      { label: "Yes, eats independently", score: 3 },
      { label: "Mostly, but can be messy", score: 2 },
      { label: "Needs to be fed", score: 1 },
    ],
  },
];

const categories = ["Academic Readiness", "Social Skills", "Emotional Maturity", "Physical Development", "Independence"];

function getResult(total: number) {
  if (total >= 25) return { tier: "Ready", color: "#059669", bg: "#ecfdf5", icon: "🎉", heading: "Your Child Is Ready for Grade 1!", description: "Your child shows strong readiness across all developmental areas. They are well-prepared for the structured learning environment of Grade 1. This is a great time to explore admission at Rainbow International School." };
  if (total >= 18) return { tier: "Almost Ready", color: "#d97706", bg: "#fffbeb", icon: "🌟", heading: "Your Child Is Almost Ready!", description: "Your child is developing well and is close to being school-ready. A few areas could benefit from focused practice over the coming months. Our Pre-Primary programme at Rainbow is designed to bridge exactly these gaps." };
  return { tier: "Give It Time", color: "#6366f1", bg: "#eef2ff", icon: "💛", heading: "Give It a Little More Time", description: "Your child is still developing key readiness skills — and that is perfectly normal. Every child grows at their own pace. Consider our Nursery or Jr KG programmes which are specifically designed to build these foundations through play-based learning." };
}

function getCategoryScore(answers: Record<number, number>, cat: string) {
  const catQs = questions.filter(q => q.category === cat);
  const total = catQs.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
  const max = catQs.length * 3;
  return { total, max, pct: Math.round((total / max) * 100) };
}

export default function SchoolReadinessQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = useCallback((questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  }, [currentQ]);

  const resetQuiz = useCallback(() => {
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
  }, []);

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const result = getResult(totalScore);
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  const quizJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "School Readiness Quiz — Is My Child Ready for Grade 1?",
    description: "A research-backed 10-question quiz covering academic readiness, social skills, emotional maturity, physical development, and independence to help parents assess school readiness.",
    educationalLevel: "Preschool to Grade 1",
    provider: {
      "@type": "School",
      name: "Rainbow International School",
      url: "https://rainbowinternationalschool.in",
    },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="School Readiness Quiz — Is My Child Ready for Grade 1? | Rainbow International School"
        description="Take our free 10-question school readiness quiz to find out if your child is prepared for Grade 1. Covers academic, social, emotional, physical, and independence skills."
        keywords="school readiness quiz, is my child ready for school, grade 1 readiness test, school readiness checklist, preschool to grade 1, child development assessment"
        canonical="https://rainbowinternationalschool.in/school-readiness-quiz"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "School Readiness Quiz", href: "https://rainbowinternationalschool.in/school-readiness-quiz" },
        ]}
        jsonLd={quizJsonLd}
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="School Readiness Quiz"
        subtitle="Is your child ready for Grade 1? Take our free 2-minute assessment to find out."
        breadcrumb={[{ label: "School Readiness Quiz" }]}
      />

      <main className="flex-1">
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            {!showResult ? (
              <>
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" style={{ color: "#6b7280" }}>Question {currentQ + 1} of {questions.length}</span>
                    <span className="text-sm font-semibold" style={{ color: "#091a4f" }}>{Math.round(progress)}% complete</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: "#e5e7eb" }}>
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #091a4f, #fbbf24)" }} />
                  </div>
                </div>

                <div className="rounded-2xl border p-8 md:p-10" style={{ borderColor: "#e5e7eb" }}>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "#eef5ff", color: "#0d3b86" }} data-testid={`badge-category-${currentQ}`}>
                    {questions[currentQ].category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold mb-8" style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }} data-testid={`text-question-${currentQ}`}>
                    {questions[currentQ].text}
                  </h2>
                  <div className="space-y-3" role="radiogroup" aria-label={questions[currentQ].text}>
                    {questions[currentQ].options.map((opt, idx) => {
                      const isSelected = answers[questions[currentQ].id] === opt.score;
                      return (
                        <button
                          key={idx}
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleAnswer(questions[currentQ].id, opt.score)}
                          className="w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
                          style={{
                            borderColor: isSelected ? "#091a4f" : "#e5e7eb",
                            background: isSelected ? "#f0f4ff" : "#fff",
                          }}
                          data-testid={`button-option-${currentQ}-${idx}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: isSelected ? "#091a4f" : "#d1d5db" }}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#091a4f" }} />}
                            </div>
                            <span className="font-medium" style={{ color: "#1f2937" }}>{opt.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                    disabled={currentQ === 0}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-30"
                    style={{ color: "#091a4f", border: "1px solid #e5e7eb" }}
                    data-testid="button-prev"
                  >
                    ← Previous
                  </button>
                  {answers[questions[currentQ].id] && currentQ < questions.length - 1 && (
                    <button
                      onClick={() => setCurrentQ(currentQ + 1)}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
                      style={{ background: "#091a4f" }}
                      data-testid="button-next"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div>
                <div className="rounded-2xl p-8 md:p-10 text-center mb-10" style={{ background: result.bg, border: `2px solid ${result.color}20` }}>
                  <div className="text-5xl mb-4">{result.icon}</div>
                  <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-3" style={{ background: result.color, color: "#fff" }} data-testid="text-result-tier">
                    {result.tier} — {totalScore}/30
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }} data-testid="text-result-heading">{result.heading}</h2>
                  <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: "#374151" }} data-testid="text-result-description">{result.description}</p>
                </div>

                <h3 className="text-xl font-bold mb-6" style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}>Score Breakdown by Category</h3>
                <div className="space-y-4 mb-10">
                  {categories.map(cat => {
                    const { total, max, pct } = getCategoryScore(answers, cat);
                    return (
                      <div key={cat} className="rounded-xl border p-5" style={{ borderColor: "#e5e7eb" }} data-testid={`category-score-${cat.toLowerCase().replace(/\s+/g, "-")}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm" style={{ color: "#091a4f" }}>{cat}</span>
                          <span className="text-sm font-bold" style={{ color: pct >= 80 ? "#059669" : pct >= 55 ? "#d97706" : "#6366f1" }}>{total}/{max}</span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: "#e5e7eb" }}>
                          <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 80 ? "#059669" : pct >= 55 ? "#d97706" : "#6366f1" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <h3 className="text-xl font-bold mb-6" style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}>Your Answers</h3>
                <div className="space-y-3 mb-10">
                  {questions.map((q, idx) => {
                    const selected = q.options.find(o => o.score === answers[q.id]);
                    return (
                      <div key={q.id} className="rounded-xl border p-4 flex gap-3" style={{ borderColor: "#e5e7eb" }}>
                        <span className="text-sm font-bold flex-shrink-0 w-6" style={{ color: "#9ca3af" }}>{idx + 1}.</span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#1f2937" }}>{q.text}</p>
                          <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: "#059669" }}>
                            <CheckCircle2 size={14} /> {selected?.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <button
                    onClick={resetQuiz}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold border transition-all hover:shadow-md"
                    style={{ borderColor: "#091a4f", color: "#091a4f" }}
                    data-testid="button-retake"
                  >
                    <RotateCcw size={16} /> Take Quiz Again
                  </button>
                  <Link
                    href="/schedule-appointment"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:shadow-lg"
                    style={{ background: "#091a4f" }}
                    data-testid="link-schedule-visit"
                  >
                    Schedule a Campus Visit <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-16" style={{ background: "#f8faff" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: "#091a4f", fontFamily: "'DM Sans', sans-serif" }}>
              About This Quiz
            </h2>
            <p className="text-center text-base leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "#6b7280" }}>
              This quiz is based on widely accepted school readiness research, covering five key developmental domains that educators look for in children transitioning to formal schooling.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {categories.map(cat => (
                <div key={cat} className="rounded-xl p-4 text-center" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
                  <p className="text-sm font-semibold" style={{ color: "#091a4f" }}>{cat}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: "#091a4f" }}>
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Ready to Explore Rainbow International School?
              </h3>
              <p className="text-sm mb-6" style={{ color: "#d1d5db" }}>
                Our Pre-Primary and Primary programmes are designed to support every child's unique developmental journey.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/pre-primary-school-thane" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110" style={{ background: "#fbbf24", color: "#091a4f" }} data-testid="link-pre-primary">
                  Pre-Primary <ChevronRight size={14} />
                </Link>
                <Link href="/primary-section" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold border text-white transition-all hover:bg-white/10" data-testid="link-primary">
                  Primary Section <ChevronRight size={14} />
                </Link>
                <Link href="/application-form" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold border text-white transition-all hover:bg-white/10" data-testid="link-apply">
                  Apply Now <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
