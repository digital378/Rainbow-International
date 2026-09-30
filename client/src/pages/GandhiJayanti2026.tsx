import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { ArrowLeft, Copy, MessageCircle } from "lucide-react";
import sourceHtml from "../../../attached_assets/gandhi-jayanti-2026-blog-preview-v2_1790747569571.html?raw";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { CODE_OWNED_BLOGS } from "@shared/codeOwnedBlogs";
import { GANDHI_LAYOUT_CSS, GANDHI_PATH, prepareGandhiArticle } from "@shared/gandhiArticleContent";

const PAGE_URL = `https://rainbowinternationalschool.in${GANDHI_PATH}`;
const TITLE = "Gandhi Jayanti 2026: Speech, Essay, Quotes in Hindi & Marathi";
const DESCRIPTION = "Gandhi Jayanti 2026 is Friday, 2 October. Speeches, essays, 10 lines in English, Hindi & Marathi, stories, quotes, slogans, quiz and school ideas.";
const H1 = "Gandhi Jayanti 2026: History, Speech, Essay, Quotes, Stories & Activities for Students";
const FONT_STYLESHEET = "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Noto+Sans+Devanagari:wght@500;600;700&display=swap";

type ArticleParts = {
  css: string;
  html: string;
  jsonLd?: Record<string, unknown>;
  quiz: QuizQuestion[];
};

type QuizQuestion = { q: string; o: string[]; a: number; w: string };

function readSource(): ArticleParts | null {
  if (typeof DOMParser === "undefined") return null;
  const doc = new DOMParser().parseFromString(prepareGandhiArticle(sourceHtml), "text/html");
  const style = doc.querySelector("head style")?.textContent ?? "";
  const hero = doc.querySelector("body > .hero");
  const chapterNav = doc.querySelector("body > .qj");
  const main = doc.querySelector("body > #main");
  const intro = main?.querySelector(":scope > .intro");
  const article = main?.querySelector(":scope > article");
  if (!hero || !chapterNav || !intro || !article) return null;

  hero.querySelector(".crumbs")?.remove();
  const heroShare = hero.querySelector(".share-row");
  if (heroShare) {
    heroShare.innerHTML = "";
    heroShare.setAttribute("data-live-share-host", "");
  }
  const jsonLdScript = doc.querySelector('script[type="application/ld+json"]')?.textContent;
  const quizSource = doc.body.innerHTML.match(/(?:window\.)?QUIZ\s*=\s*(\[[\s\S]*?\]);/)?.[1];
  let jsonLd: Record<string, unknown> | undefined;
  let quiz: QuizQuestion[] = [];
  try { if (jsonLdScript) jsonLd = JSON.parse(jsonLdScript); } catch { /* head metadata remains available through SEO */ }
  try { if (quizSource) quiz = JSON.parse(quizSource); } catch { /* quiz is omitted rather than rendering malformed questions */ }

  // The source CSS is kept in a Shadow DOM so its broad article selectors and
  // palette tokens cannot change the site's shared header, footer, or pages.
  const scopedCss = style
    .replace(/body\.print-reader/g, ":host[data-print-reader]")
    .replace(/:root\b/g, ":host")
    .replace(/\bhtml\b/g, ":host")
    .replace(/\bbody\b/g, ":host")
    .replace(/:host\s*\{/, ":host{display:block;min-width:0;background:var(--bg);color:var(--text);--reader:19px;");
  const markup = [
    hero.outerHTML,
    chapterNav.outerHTML,
    intro.outerHTML,
    article.outerHTML,
  ].join("");
  return { css: `${scopedCss}\n${GANDHI_LAYOUT_CSS}`, html: markup, jsonLd, quiz };
}

const articleParts = readSource();

function shareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${window.location.href}`)}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* attempt the legacy clipboard API below */ }
  const input = document.createElement("textarea");
  input.value = text;
  input.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  return copied;
}

function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const question = questions[questionIndex];

  if (!questions.length) return <p role="status">The quiz is temporarily unavailable.</p>;
  if (!question) {
    const message = score >= 9
      ? "Gandhi scholar! Outstanding."
      : score >= 6 ? "Well done! You know your Bapu." : "Good start. Read the history section and try again.";
    return (
      <div className="qres">
        <b>{score} / {questions.length}</b><p>{message}</p>
        <button className="btn btn-primary" type="button" onClick={() => { setQuestionIndex(0); setScore(0); setChosen(null); }}>Play again</button>{" "}
        <button className="btn btn-ghost" type="button" onClick={() => window.open(shareUrl(`I scored ${score}/${questions.length} in the Gandhi Jayanti quiz by Rainbow International School! Try it:`), "_blank", "noopener,noreferrer")}>Share my score</button>
      </div>
    );
  }

  return (
    <>
      <div className="qprog"><i style={{ width: `${questionIndex / questions.length * 100}%` }} /></div>
      <div className="qmeta">Question {questionIndex + 1} of {questions.length}</div>
      <div className="qq">{question.q}</div>
      <div className="opts">
        {question.o.map((answer, index) => (
          <button
            key={`${questionIndex}-${answer}`}
            type="button"
            className={`opt${chosen !== null && index === question.a ? " right" : ""}${chosen === index && index !== question.a ? " wrong" : ""}`}
            disabled={chosen !== null}
            onClick={() => { setChosen(index); if (index === question.a) setScore(current => current + 1); }}
          >
            <i>{"ABCD"[index]}</i><span>{answer}</span>
          </button>
        ))}
      </div>
      <div className="why" aria-live="polite">
        {chosen !== null && `${chosen === question.a ? "Correct. " : "Not quite. "}${question.w}`}
      </div>
      {chosen !== null && (
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => { setQuestionIndex(current => current + 1); setChosen(null); }}
        >
          {questionIndex === questions.length - 1 ? "See my score" : "Next question"}
        </button>
      )}
    </>
  );
}

export default function GandhiJayanti2026() {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [quizTarget, setQuizTarget] = useState<HTMLElement | null>(null);
  const [shareTarget, setShareTarget] = useState<HTMLElement | null>(null);
  const [toast, setToast] = useState("");
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  const [eventMessage, setEventMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [format, setFormat] = useState("ten");
  const [readerSize, setReaderSize] = useState(19);
  const [activeGenericTabs, setActiveGenericTabs] = useState<number[]>([]);
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const [tocExpanded, setTocExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const relatedPosts = CODE_OWNED_BLOGS
    .filter(post => post.slug !== "gandhi-jayanti-2026")
    .slice(0, 3);

  const canonicalBreadcrumbs = useMemo(() => [
    { name: "Home", href: "https://rainbowinternationalschool.in/" },
    { name: "Blogs", href: "https://rainbowinternationalschool.in/blogs" },
    { name: "Gandhi Jayanti 2026", href: PAGE_URL },
  ], []);

  useEffect(() => {
    // The server provides the complete schema for non-JS crawlers. Once React's
    // SEO component takes over, leave only its copy in the document.
    document.querySelector('script[data-gandhi-source-jsonld]')?.remove();
    const type = document.querySelector<HTMLMetaElement>('meta[property="og:type"]');
    if (type) type.content = "article";
    document.querySelector('meta[property="og:image"]')?.remove();
    document.querySelector('meta[name="twitter:image"]')?.remove();
  }, []);

  useEffect(() => {
    if (!hostRef.current) return;
    const root = hostRef.current.shadowRoot ?? hostRef.current.attachShadow({ mode: "open" });
    shadowRef.current = root;
    setShadowRoot(root);
    const fontLink = document.querySelector<HTMLLinkElement>('link[data-gandhi-fonts]') ?? document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = FONT_STYLESHEET;
    fontLink.dataset.gandhiFonts = "true";
    if (!fontLink.isConnected) document.head.appendChild(fontLink);
  }, []);

  const mountArticle = useCallback((node: HTMLDivElement | null) => {
    if (!node || !articleParts) return;
    // React owns the wrapper, but the supplied article stays a stable DOM
    // island. Do not reapply innerHTML on state changes: that discards portals
    // and resets the quiz, share controls and active tabs.
    if (!node.hasChildNodes()) node.innerHTML = articleParts.html;
    setQuizTarget(node.querySelector<HTMLElement>("#quizbox"));
    setShareTarget(node.querySelector<HTMLElement>("[data-live-share-host]"));
    setActiveGenericTabs(Array.from(node.querySelectorAll("[data-tabs]"), () => 0));
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date("2026-10-02T00:00:00+05:30").getTime();
      const delta = target - Date.now();
      if (delta <= 0) {
        setDaysRemaining(0);
        setHoursRemaining(0);
        setMinutesRemaining(0);
        setEventMessage(Date.now() < target + 86_400_000
          ? "Today is Gandhi Jayanti. Happy Gandhi Jayanti!"
          : "Gandhi Jayanti 2026 was celebrated on 2 October.");
        return;
      }
      setEventMessage("");
      setDaysRemaining(Math.floor(delta / 86_400_000));
      setHoursRemaining(Math.floor(delta % 86_400_000 / 3_600_000));
      setMinutesRemaining(Math.floor(delta % 3_600_000 / 60_000));
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = shadowRef.current;
    if (!root) return;
    const host = root.host as HTMLElement;
    host.toggleAttribute("data-print-reader", isPrinting);
    host.style.setProperty("--reader", `${readerSize}px`);
    const countdown = root.querySelector<HTMLElement>("#cd");
    if (countdown) countdown.hidden = Boolean(eventMessage);
    const day = root.querySelector<HTMLElement>("#cd-d");
    const hour = root.querySelector<HTMLElement>("#cd-h");
    const minute = root.querySelector<HTMLElement>("#cd-m");
    const message = root.querySelector<HTMLElement>("#cdmsg");
    if (day) day.textContent = String(daysRemaining);
    if (hour) hour.textContent = String(hoursRemaining);
    if (minute) minute.textContent = String(minutesRemaining);
    if (message) message.textContent = eventMessage;
    const reader = root.querySelector(".reader");
    if (reader) {
      reader.querySelectorAll<HTMLElement>(".panel").forEach(panel => {
        panel.hidden = panel.dataset.lang !== language || panel.dataset.fmt !== format;
      });
      reader.querySelectorAll<HTMLButtonElement>(".tabs .tab").forEach(tab => {
        const selected = tab.dataset.fmt === format;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        tab.firstChild && (tab.firstChild.textContent = tab.dataset[language] ?? tab.textContent ?? "");
        tab.lang = language;
      });
      reader.querySelectorAll<HTMLButtonElement>("[data-fs]").forEach(button => {
        button.disabled = (readerSize <= 16 && button.dataset.fs === "-1")
          || (readerSize >= 26 && button.dataset.fs === "1");
      });
      reader.querySelectorAll<HTMLButtonElement>("[data-listen]").forEach(button => {
        button.hidden = !("speechSynthesis" in window);
        button.textContent = isSpeaking ? "Stop" : "Listen";
        button.setAttribute("aria-pressed", String(isSpeaking));
      });
    }
    root.querySelectorAll<HTMLButtonElement>(".langsw button").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === language));
    });
    root.querySelectorAll<HTMLDetailsElement>("#faqs details").forEach((item, index) => {
      item.open = openFaqs.includes(index);
    });
    root.querySelectorAll<HTMLElement>("[data-tabs]").forEach((box, index) => {
      const selectedIndex = activeGenericTabs[index] ?? 0;
      box.querySelectorAll<HTMLElement>('[role="tab"]').forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === selectedIndex));
        (tab as HTMLElement).tabIndex = i === selectedIndex ? 0 : -1;
      });
      box.querySelectorAll<HTMLElement>("[data-pane]").forEach((pane, i) => {
        (pane as HTMLElement).hidden = i !== selectedIndex;
      });
    });
    const tocButton = root.querySelector<HTMLButtonElement>("#tocToggle");
    const tocPanel = root.querySelector<HTMLElement>("#tocpanel");
    if (tocButton && tocPanel) {
      tocButton.setAttribute("aria-expanded", String(tocExpanded));
      tocPanel.hidden = !tocExpanded;
    }
  }, [shadowRoot, language, format, readerSize, activeGenericTabs, openFaqs, tocExpanded, isSpeaking, isPrinting, daysRemaining, hoursRemaining, minutesRemaining, eventMessage]);

  useEffect(() => {
    const root = shadowRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(
      "article>section>.container>*, .portal, .quick, .tiles .tile, .q, .card, .story, .poem, .wish, .about",
    ));
    if (!reducedMotion) {
      targets.forEach((element, index) => {
        element.classList.add("reveal");
        element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      });
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    targets.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [shadowRoot]);

  useEffect(() => {
    const update = () => setShowBackToTop(window.scrollY > 1200);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("gandhi-print-reader", isPrinting);
    return () => document.documentElement.classList.remove("gandhi-print-reader");
  }, [isPrinting]);

  useEffect(() => {
    const root = shadowRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>(".tocpanel a, .qj-links a"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active && link.closest(".qj-links")) link.scrollIntoView({ inline: "center", block: "nearest" });
        });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    root.querySelectorAll("article section[id]").forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [shadowRoot]);

  useEffect(() => {
    const speech = window.speechSynthesis;
    return () => speech?.cancel();
  }, [language, format]);

  useEffect(() => {
    if (!isPrinting) return;
    const finish = () => setIsPrinting(false);
    window.addEventListener("afterprint", finish);
    const timer = window.setTimeout(() => window.print(), 60);
    return () => {
      window.removeEventListener("afterprint", finish);
      window.clearTimeout(timer);
    };
  }, [isPrinting]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const setReader = useCallback((nextLanguage?: string, nextFormat?: string) => {
    if (nextLanguage) setLanguage(nextLanguage);
    if (nextFormat) setFormat(nextFormat);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const onArticleClick = useCallback(async (event: React.MouseEvent<HTMLDivElement>) => {
    const root = shadowRef.current;
    const target = event.target as HTMLElement;
    if (!root) return;

    const faqSummary = target.closest<HTMLElement>("#faqs details summary");
    if (faqSummary) {
      event.preventDefault();
      const items = Array.from(root.querySelectorAll("#faqs details"));
      const index = items.indexOf(faqSummary.closest("details")!);
      setOpenFaqs(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index]);
      return;
    }

    const readerLanguageButton = target.closest<HTMLButtonElement>(".langsw button");
    if (readerLanguageButton?.dataset.lang) { setReader(readerLanguageButton.dataset.lang); return; }
    const readerFormatButton = target.closest<HTMLButtonElement>(".reader .tab");
    if (readerFormatButton?.dataset.fmt) { setReader(undefined, readerFormatButton.dataset.fmt); return; }

    const fontSizeButton = target.closest<HTMLButtonElement>("[data-fs]");
    if (fontSizeButton) {
      setReader();
      setReaderSize(size => Math.max(16, Math.min(26, size + Number(fontSizeButton.dataset.fs || 0))));
      return;
    }
    const copyReader = target.closest<HTMLButtonElement>("[data-rcopy]");
    if (copyReader) {
      const panel = copyReader.closest<HTMLElement>(".panel");
      const text = Array.from(panel?.querySelectorAll(".prose p, .prose li") ?? [])
        .map(element => element.textContent?.trim() ?? "").filter(Boolean).join("\n\n");
      setToast(await copyText(text) ? "Text copied" : "Could not copy text");
      return;
    }
    if (target.closest("[data-listen]")) {
      const button = target.closest<HTMLButtonElement>("[data-listen]");
      if (isSpeaking) {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      } else {
        const panel = button?.closest<HTMLElement>(".panel");
        const text = Array.from(panel?.querySelectorAll(".prose p, .prose li") ?? [])
          .map(element => element.textContent?.trim() ?? "").filter(Boolean).join("\n\n");
        if ("speechSynthesis" in window && text) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = ({ en: "en-IN", hi: "hi-IN", mr: "mr-IN" } as Record<string, string>)[panel?.dataset.lang ?? "en"];
          utterance.rate = 0.92;
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          setIsSpeaking(true);
          window.speechSynthesis.speak(utterance);
        }
      }
      return;
    }
    if (target.closest("[data-print]")) { setIsPrinting(true); return; }

    const genericTab = target.closest<HTMLElement>('[data-tabs] [role="tab"]');
    if (genericTab) {
      const box = genericTab.closest<HTMLElement>("[data-tabs]");
      const boxes = Array.from(root.querySelectorAll("[data-tabs]"));
      const index = boxes.indexOf(box!);
      const tabIndex = Array.from(box?.querySelectorAll('[role="tab"]') ?? []).indexOf(genericTab);
      setActiveGenericTabs(current => current.map((active, i) => i === index ? tabIndex : active));
      return;
    }
    const setLanguageLink = target.closest<HTMLAnchorElement>("[data-setlang]");
    if (setLanguageLink?.dataset.setlang) {
      event.preventDefault();
      setReader(setLanguageLink.dataset.setlang, setLanguageLink.dataset.setfmt);
      return;
    }
    const tocButton = target.closest<HTMLButtonElement>("#tocToggle");
    if (tocButton) { setTocExpanded(value => !value); return; }
    const tocLink = target.closest<HTMLAnchorElement>(".tocpanel a");
    if (tocLink) { setTocExpanded(false); }

    const jumpLink = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (jumpLink) {
      const id = decodeURIComponent(jumpLink.hash.slice(1));
      const section = root.getElementById(id);
      if (section) {
        event.preventDefault();
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    const copyLinkButton = target.closest<HTMLElement>("[data-copylink]");
    if (copyLinkButton) {
      event.preventDefault();
      setToast(await copyText(window.location.href) ? "Link copied" : "Could not copy link");
      return;
    }
    const copyTextButton = target.closest<HTMLElement>("[data-copytext]");
    if (copyTextButton) {
      event.preventDefault();
      const copied = await copyText(copyTextButton.getAttribute("data-copytext") ?? "");
      setToast(copied ? "Copied" : "Could not copy text");
      return;
    }
    const whatsApp = target.closest<HTMLElement>("[data-watext]");
    if (whatsApp) {
      event.preventDefault();
      window.open(shareUrl(whatsApp.getAttribute("data-watext") ?? TITLE), "_blank", "noopener,noreferrer");
      return;
    }
  }, [isSpeaking, setReader]);

  const onArticleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.matches(".reader .tab")) {
      const tabs = Array.from(shadowRef.current?.querySelectorAll<HTMLButtonElement>(".reader .tab") ?? []);
      const index = tabs.indexOf(target as HTMLButtonElement);
      let next = -1;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (next >= 0) {
        event.preventDefault();
        const format = tabs[next].dataset.fmt;
        if (format) setReader(undefined, format);
        tabs[next].focus();
      }
    }
    if (target.matches('[data-tabs] [role="tab"]') && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
      const box = target.closest<HTMLElement>("[data-tabs]");
      const tabs = Array.from(box?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
      const index = tabs.indexOf(target);
      const next = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      if (tabs.length) {
        event.preventDefault();
        const boxes = Array.from(shadowRef.current?.querySelectorAll("[data-tabs]") ?? []);
        const boxIndex = boxes.indexOf(box!);
        setActiveGenericTabs(current => current.map((active, i) => i === boxIndex ? next : active));
        tabs[next].focus();
      }
    }
    if (event.key === "Escape") setTocExpanded(false);
  }, [setReader]);

  const showToast = toast ? (
    <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg" role="status" aria-live="polite">
      {toast}
    </div>
  ) : null;

  const shadowArticle = shadowRoot && articleParts ? createPortal(
    <>
      <style>{articleParts.css}</style>
      <div
        ref={mountArticle}
        className="gandhi-article-source"
        onClick={onArticleClick}
        onKeyDown={onArticleKeyDown}
      />
      <button
        id="totop"
        className={showBackToTop ? "on" : ""}
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >↑</button>
    </>,
    shadowRoot,
  ) : null;

  const quiz = quizTarget && articleParts
    ? createPortal(<Quiz questions={articleParts.quiz} />, quizTarget)
    : null;
  const liveShare = shareTarget ? createPortal(
    <div aria-label="Share this article">
      <button type="button" onClick={() => window.open(shareUrl(TITLE), "_blank", "noopener,noreferrer")} className="btn btn-primary">
        <MessageCircle size={16} aria-hidden="true" /> Share on WhatsApp
      </button>
      <button type="button" onClick={async () => setToast(await copyText(window.location.href) ? "Link copied" : "Could not copy link")} className="btn btn-ghost">
        <Copy size={16} aria-hidden="true" /> Copy link
      </button>
    </div>,
    shareTarget,
  ) : null;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media print {
          html.gandhi-print-reader body > #root > div > :not(main) { display: none !important; }
          html.gandhi-print-reader body > #root > div > main > :not(.gandhi-jayanti-article) { display: none !important; }
          html.gandhi-print-reader body > #root > div > main { display: block !important; }
        }
      `}</style>
      <ScrollProgress />
      <SEO
        title={TITLE}
        description={DESCRIPTION}
        keywords="gandhi jayanti 2026, gandhi jayanti speech, gandhi jayanti essay, gandhi jayanti in hindi, gandhi jayanti in marathi, 10 lines on gandhi jayanti, gandhi jayanti quotes, gandhi jayanti slogans, gandhi jayanti stories for kids, gandhi jayanti activities for school, gandhi jayanti quiz, CBSE school Thane blog"
        canonical={PAGE_URL}
        robots="index, follow"
        appendSiteName={false}
        breadcrumbs={canonicalBreadcrumbs}
        jsonLd={articleParts?.jsonLd}
      />
      <Navbar />
      <nav aria-label="Breadcrumb" className="border-b border-[#e6dcc7] bg-[#fffdf9]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm text-slate-600">
          <Link href="/" className="hover:text-blue-800">Home</Link><span aria-hidden="true">›</span>
          <Link href="/blogs" className="hover:text-blue-800">Blogs</Link><span aria-hidden="true">›</span>
          <span className="truncate font-medium text-slate-900" aria-current="page">Gandhi Jayanti 2026</span>
        </div>
      </nav>

      <main>
        <div ref={hostRef} className="gandhi-jayanti-article" aria-label={H1}>
          {!articleParts && <p className="mx-auto max-w-4xl p-8 text-red-700">The Gandhi Jayanti article could not be loaded.</p>}
          {shadowArticle}
          {quiz}
          {liveShare}
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-4 py-8">
          <Link href="/blogs" className="inline-flex items-center gap-2 font-semibold text-[#0d3b86] hover:underline">
            <ArrowLeft size={16} aria-hidden="true" /> All Blogs
          </Link>
          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`${TITLE}\n${PAGE_URL}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
              <MessageCircle size={16} aria-hidden="true" /> Share this guide
            </a>
            <button type="button" onClick={async () => setToast(await copyText(window.location.href) ? "Link copied" : "Could not copy link")} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              <Copy size={16} aria-hidden="true" /> Copy link
            </button>
          </div>
        </div>

        <section aria-labelledby="gandhi-related-title" className="border-t border-[#e6dcc7] bg-[#fffdf9] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#8a623a]">Continue reading</p>
            <h2 id="gandhi-related-title" className="mb-9 text-center font-serif text-3xl text-[#171c25] md:text-4xl">Explore more from Rainbow International School</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedPosts.map(post => (
                <a key={post.slug} href={`/blog/${post.slug}`} className="rounded-2xl border border-[#ece4d7] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#8a623a]">{post.cat}</span>
                  <h3 className="mt-3 font-serif text-xl leading-snug text-[#171c25]">{post.title}</h3>
                  <p className="mt-4 text-sm text-[#68645f]">{post.date} · Read article →</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {showToast}
    </div>
  );
}