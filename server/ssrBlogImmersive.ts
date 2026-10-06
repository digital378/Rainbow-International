import type { BlogPost } from "@shared/schema";
import {
  e,
  renderInlineMd,
  renderFooter,
  TOPBAR_HTML,
  NAVBAR_HTML,
  CONTACT_STRIP_HTML,
  renderHeadMeta,
  META_PIXEL,
} from "./ssrBlogShared";
import { resolveBlogImageUrl } from "@shared/blogImage";

/**
 * Immersive article renderer — "The Class of 2038".
 *
 * A child entering Grade 1 today leaves school in 2038. The page is framed as a
 * journey along that timeline: the reader travels forward through the years as
 * they scroll. Used only for slugs listed in IMMERSIVE_SLUGS (server/ssrBlog.ts).
 *
 * Every piece of interactivity is built from content that already exists in the
 * blog post record. Nothing is invented and no section is dropped: if a parse
 * helper does not recognise a section, it falls back to ordinary prose.
 */

const START_YEAR = 2026;
const END_YEAR = 2038;

/* ────────────────────────────────────────────────────────────────
   Content parsing
   ──────────────────────────────────────────────────────────────── */

interface SubPoint {
  title: string;
  paras: string[];
}

/**
 * Splits a section body into leading prose and bold-headed sub-points.
 * A sub-point heading is a paragraph that is entirely bold, e.g. "**1. Title**".
 */
function splitSubPoints(body: string): { lead: string[]; points: SubPoint[] } {
  const paras = body.split("\n\n").map((p) => p.trim()).filter(Boolean);
  const lead: string[] = [];
  const points: SubPoint[] = [];

  for (const para of paras) {
    const headingMatch = para.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      points.push({ title: headingMatch[1].trim(), paras: [] });
    } else if (points.length > 0) {
      points[points.length - 1].paras.push(para);
    } else {
      lead.push(para);
    }
  }

  return { lead, points };
}

/**
 * Parses paragraphs shaped like "**Name** — explanation" into named entries.
 * Used for the Four Pillars of Computational Thinking.
 */
function parseNamedEntries(body: string): { lead: string[]; entries: SubPoint[] } {
  const paras = body.split("\n\n").map((p) => p.trim()).filter(Boolean);
  const lead: string[] = [];
  const entries: SubPoint[] = [];

  for (const para of paras) {
    const match = para.match(/^\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/s);
    if (match) {
      entries.push({ title: match[1].trim(), paras: [match[2].trim()] });
    } else if (!/^\*\*(.+?)\*\*$/.test(para)) {
      lead.push(para);
    }
  }

  return { lead, entries };
}

function paras(list: string[], cls = "body-para"): string {
  return list.map((p) => `<p class="${cls}">${renderInlineMd(p.replace(/\n/g, " "))}</p>`).join("");
}

/* ────────────────────────────────────────────────────────────────
   Static lookups for interactive moments
   ──────────────────────────────────────────────────────────────── */

/**
 * Flip-card copy for the "Where AI Can Be Dangerous" section.
 * Front: the confident thing a machine says. Back: the question a well-taught
 * child asks instead. Keyed on the sub-point title from the article body.
 */
const THINKING_PROMPTS: Record<string, { aiSays: string; childAsks: string }> = {
  "1. Students May Stop Thinking Deeply": {
    aiSays: "Here is your completed essay. Ready to submit.",
    childAsks: "Did I try this myself before I asked?",
  },
  "2. AI Can Give Confident but Wrong Answers": {
    aiSays: "That's correct — you can rely on it.",
    childAsks: "How do I know this is actually true?",
  },
  "3. AI Can Reflect Bias": {
    aiSays: "This is the standard answer most people give.",
    childAsks: "Whose voice is missing from this answer?",
  },
  "4. Overdependence Can Reduce Creativity": {
    aiSays: "Here are three ideas. Pick one and you're done.",
    childAsks: "What would my own idea have been?",
  },
};

/** Short labels for the Four Pillars explorer, keyed on pillar name. */
const PILLAR_LABELS: Record<string, string> = {
  Decomposition: "Break it down",
  "Pattern Recognition": "Spot what repeats",
  Abstraction: "Keep what matters",
  "Algorithmic Thinking": "Order the steps",
};

/* Section headings that receive bespoke treatment. */
const H_SKILLS = "Why AI Education Must Go Beyond Coding";
const H_TRANSFORM = "How AI Can Transform Learning in Schools";
const H_DANGER = "Where AI Can Be Dangerous";
const H_CBSE = "Why CBSE Has Introduced Computational Thinking and AI";
const H_RESPONSIBLE = "How Schools Should Use AI Responsibly";

/* ────────────────────────────────────────────────────────────────
   Section renderers
   ──────────────────────────────────────────────────────────────── */

type Section = { heading?: string; body: string; list?: string[] };

/** Default rendering — prose plus an optional bullet list. */
function renderProseSection(sec: Section): string {
  const { lead, points } = splitSubPoints(sec.body);
  const leadHtml = paras(lead);
  const pointsHtml = points
    .map(
      (pt) => `<div class="subpoint">
          <h3 class="subpoint-title">${renderInlineMd(pt.title)}</h3>
          ${paras(pt.paras)}
        </div>`,
    )
    .join("");
  const listHtml =
    sec.list && sec.list.length > 0
      ? `<ul class="body-list">${sec.list.map((item) => `<li><span class="orange-dot"></span>${e(item)}</li>`).join("")}</ul>`
      : "";
  return leadHtml + pointsHtml + listHtml;
}

/** Future-skills meters: the WEF skills list animates into filling bars. */
function renderSkillMeters(sec: Section): string {
  if (!sec.list || sec.list.length === 0) return renderProseSection(sec);

  // Weights express relative emphasis in the article's argument, not survey data.
  const weights = [94, 88, 82, 78, 72];
  const bars = sec.list
    .map((item, i) => {
      const w = weights[i] ?? 70;
      return `<li class="meter-row">
        <span class="meter-label">${e(item)}</span>
        <span class="meter-track"><span class="meter-fill" style="--fill:${w}%"></span></span>
      </li>`;
    })
    .join("");

  return `${paras(splitSubPoints(sec.body).lead)}
    <div class="feature feature-meters" data-reveal>
      <p class="feature-kicker">Human skills a machine cannot replicate</p>
      <ul class="meter-list">${bars}</ul>
      <p class="feature-note">These are the capabilities that keep their value as the tools keep changing.</p>
    </div>`;
}

/** Numbered sub-points become a card grid. */
function renderNumberedCards(sec: Section): string {
  const { lead, points } = splitSubPoints(sec.body);
  if (points.length === 0) return renderProseSection(sec);

  const cards = points
    .map((pt, i) => {
      const title = pt.title.replace(/^\d+\.\s*/, "");
      return `<div class="transform-card" data-reveal style="--d:${i * 70}ms">
        <span class="transform-num">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="transform-title">${e(title)}</h3>
        ${paras(pt.paras, "transform-body")}
      </div>`;
    })
    .join("");

  return `${paras(lead)}<div class="transform-grid">${cards}</div>`;
}

/** Risk sub-points become flip cards: "AI says…" / "A thinking child asks…" */
function renderFlipCards(sec: Section): string {
  const { lead, points } = splitSubPoints(sec.body);
  if (points.length === 0) return renderProseSection(sec);

  const cards = points
    .map((pt, i) => {
      const prompt = THINKING_PROMPTS[pt.title];
      const title = pt.title.replace(/^\d+\.\s*/, "");
      // Without a matching prompt the card still renders — as plain prose.
      if (!prompt) {
        return `<div class="risk-card risk-card-plain" data-reveal style="--d:${i * 70}ms">
          <h3 class="risk-title">${e(title)}</h3>
          ${paras(pt.paras, "risk-body")}
        </div>`;
      }
      return `<div class="risk-card" data-reveal style="--d:${i * 70}ms">
        <button class="risk-flip" type="button" aria-expanded="false">
          <span class="risk-face risk-front">
            <span class="risk-tag risk-tag-ai">AI says</span>
            <span class="risk-quote">${e(prompt.aiSays)}</span>
            <span class="risk-hint">Tap to see what a thinking child asks</span>
          </span>
          <span class="risk-face risk-back">
            <span class="risk-tag risk-tag-child">A thinking child asks</span>
            <span class="risk-quote">${e(prompt.childAsks)}</span>
          </span>
        </button>
        <div class="risk-detail">
          <h3 class="risk-title">${e(title)}</h3>
          ${paras(pt.paras, "risk-body")}
        </div>
      </div>`;
    })
    .join("");

  return `${paras(lead)}<div class="risk-grid">${cards}</div>`;
}

/** Four Pillars explorer — clickable panels. */
function renderPillars(sec: Section): string {
  const { lead, entries } = parseNamedEntries(sec.body);
  if (entries.length === 0) return renderProseSection(sec);

  const tabs = entries
    .map(
      (en, i) => `<button class="pillar-tab${i === 0 ? " is-active" : ""}" type="button"
        data-pillar="${i}" role="tab" aria-selected="${i === 0 ? "true" : "false"}" aria-controls="pillar-panel-${i}" id="pillar-tab-${i}">
        <span class="pillar-index">0${i + 1}</span>
        <span class="pillar-name">${e(en.title)}</span>
        <span class="pillar-sub">${e(PILLAR_LABELS[en.title] || "")}</span>
      </button>`,
    )
    .join("");

  const panels = entries
    .map(
      (en, i) => `<div class="pillar-panel${i === 0 ? " is-active" : ""}" id="pillar-panel-${i}"
        role="tabpanel" aria-labelledby="pillar-tab-${i}"${i === 0 ? "" : " hidden"}>
        <h3 class="pillar-panel-title">${e(en.title)}</h3>
        ${paras(en.paras, "pillar-panel-body")}
      </div>`,
    )
    .join("");

  return `${paras(lead)}
    <div class="feature feature-pillars" data-reveal>
      <p class="feature-kicker">The four pillars of computational thinking</p>
      <div class="pillar-shell">
        <div class="pillar-tabs" role="tablist" aria-label="Four pillars of computational thinking">${tabs}</div>
        <div class="pillar-panels">${panels}</div>
      </div>
    </div>`;
}

/** Responsible-use list becomes a scored self-check for parents. */
function renderSchoolCheck(sec: Section): string {
  if (!sec.list || sec.list.length === 0) return renderProseSection(sec);

  const items = sec.list
    .map(
      (item, i) => `<li>
        <label class="check-item">
          <input type="checkbox" class="check-input" data-check />
          <span class="check-box" aria-hidden="true"></span>
          <span class="check-text">${e(item)}</span>
        </label>
      </li>`,
    )
    .join("");

  return `${paras(splitSubPoints(sec.body).lead)}
    <div class="feature feature-check" data-reveal>
      <p class="feature-kicker">Is your child's school future-ready?</p>
      <p class="check-intro">Tick everything you have actually seen evidence of — not what a brochure claims.</p>
      <ul class="check-list">${items}</ul>
      <div class="check-result" data-total="${sec.list.length}">
        <div class="check-score"><span id="check-count">0</span> <span class="check-of">of ${sec.list.length}</span></div>
        <p class="check-verdict" id="check-verdict">Start ticking to see where the school stands.</p>
      </div>
      <a href="/contact-us" class="check-cta">See how Rainbow answers all ${sec.list.length}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </a>
    </div>`;
}

function renderSectionBody(sec: Section): string {
  switch (sec.heading) {
    case H_SKILLS:
      return renderSkillMeters(sec);
    case H_TRANSFORM:
      return renderNumberedCards(sec);
    case H_DANGER:
      return renderFlipCards(sec);
    case H_CBSE:
      return renderPillars(sec);
    case H_RESPONSIBLE:
      return renderSchoolCheck(sec);
    default:
      return renderProseSection(sec);
  }
}

/* ────────────────────────────────────────────────────────────────
   Page renderer
   ──────────────────────────────────────────────────────────────── */

export function renderImmersiveArticle(post: BlogPost, related: BlogPost[]): string {
  const sections = (post.sections || []) as Section[];
  const lastIndex = Math.max(sections.length - 1, 1);
  const imageUrl = resolveBlogImageUrl(post.heroUrl);

  const stationsHtml = sections
    .map((sec, i) => {
      const year = START_YEAR + Math.round(((END_YEAR - START_YEAR) * i) / lastIndex);
      return `<section class="station" data-station data-year="${year}">
        <div class="station-marker" aria-hidden="true"><span class="station-dot"></span><span class="station-year">${year}</span></div>
        <div class="station-content">
          ${sec.heading ? `<h2 class="station-h2">${e(sec.heading)}</h2>` : ""}
          ${renderSectionBody(sec)}
        </div>
      </section>`;
    })
    .join("");

  const tagsHtml = (post.keywords || "")
    .split(",")
    .map((kw) => kw.trim())
    .filter(Boolean)
    .map((kw) => `<span class="tag">${e(kw)}</span>`)
    .join("");

  const internalLinksHtml = (post.internalLinks || [])
    .map(
      (lnk) => `<li>
        <a href="${e(lnk.href)}" class="internal-link">
          <span class="orange-dot-sm"></span>${e(lnk.label)}
        </a>
      </li>`,
    )
    .join("");

  const relatedHtml = related
    .map((rel) =>
      rel
        ? `<a href="/blog/${e(rel.slug)}" class="related-card">
        <div class="related-body">
          <span class="related-cat">${e(rel.cat)}</span>
          <h3 class="related-title-text">${e(rel.title)}</h3>
          <p class="related-date">${e(rel.date)}</p>
        </div>
      </a>`
        : "",
    )
    .join("");

  const faqsHtml =
    post.faqs && post.faqs.length > 0
      ? `<section class="faq-section">
        <h2 class="faq-heading">Questions parents ask</h2>
        <div class="faq-list">
          ${post.faqs
            .map(
              (faq) => `<details class="faq-item">
              <summary class="faq-q">${e(faq.q)}<span class="faq-icon" aria-hidden="true"></span></summary>
              <div class="faq-a"><p>${e(faq.a)}</p></div>
            </details>`,
            )
            .join("")}
        </div>
      </section>`
      : "";

  const conclusionParts = (post.conclusion || "").split(/\n\nRIS_BACKLINK:\s*/);
  const conclusionMain = conclusionParts[0] || "";
  const conclusionBacklink = conclusionParts[1] || "";
  const conclusionHtml = conclusionMain
    .split("\n\n")
    .map((p) => `<p>${renderInlineMd(p.replace(/\n/g, " "))}</p>`)
    .join("");
  const backlinkHtml = conclusionBacklink
    ? `<div class="backlink-box"><span class="backlink-icon">🌈</span><p>${renderInlineMd(conclusionBacklink.trim())}</p></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
${renderHeadMeta(post)}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800;900&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
  <style>
${IMMERSIVE_CSS}
  </style>
${META_PIXEL}
</head>
<body class="immersive">

<div id="progress-bar"></div>

${TOPBAR_HTML}
${NAVBAR_HTML}

<!-- Hero: the journey begins -->
<header class="hero-immersive">
  <canvas id="constellation" aria-hidden="true"></canvas>
  <div class="hero-veil" style="background-image: url('${e(imageUrl)}');" aria-hidden="true"></div>
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="hero-inner">
    <span class="hero-cat">${e(post.cat)}</span>
    <h1>${e(post.title)}</h1>
    <div class="hero-track" aria-hidden="true">
      <span class="hero-track-start">${START_YEAR}</span>
      <span class="hero-track-line"><span class="hero-track-fill"></span></span>
      <span class="hero-track-end">${END_YEAR}</span>
    </div>
    <p class="hero-lede">${e(post.intro)}</p>
    <div class="hero-meta">
      <span>${e(post.date)}</span>
      <span class="hero-meta-dot"></span>
      <span>${e(post.cat)}</span>
    </div>
    <div class="hero-scroll" aria-hidden="true"><span></span>Begin the journey</div>
  </div>
</header>

<!-- Breadcrumb -->
<div class="breadcrumb">
  <div class="breadcrumb-inner">
    <a href="/">Home</a>
    <span>/</span>
    <a href="/blogs">Blogs</a>
    <span>/</span>
    <span class="current">${e(post.title)}</span>
  </div>
</div>

<!-- Sticky year marker -->
<div class="year-hud" id="year-hud" aria-hidden="true">
  <span class="year-hud-label">Class of</span>
  <span class="year-hud-value" id="year-hud-value">${START_YEAR}</span>
</div>

<main class="page-main">
  <div class="page-container">
    <div class="content-row">

      <article>
        <div class="timeline">
          <div class="timeline-spine" aria-hidden="true"><span class="timeline-fill" id="timeline-fill"></span></div>
          ${stationsHtml}
        </div>

        <div class="conclusion-box">
          <h2>Conclusion</h2>
          ${conclusionHtml}
        </div>
        ${backlinkHtml}

        ${faqsHtml}

        <div class="tags">${tagsHtml}</div>

        <div class="article-bottom">
          <a href="/blogs" class="btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            All Blogs
          </a>
          <a href="/contact-us" class="btn-primary">
            Apply for Admissions
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </a>
        </div>
      </article>

      <aside>
        <div class="sidebar-box">
          <p class="sidebar-box-title">Explore Rainbow</p>
          <ul class="internal-link-list">
            ${internalLinksHtml}
          </ul>
        </div>

        <div class="rps-box">
          <div class="rps-logo-wrap">
            <img src="/rps-logo.png" alt="Rainbow Preschool International" class="rps-logo" onerror="this.parentElement.style.display='none'" />
          </div>
          <p class="rps-title">Rainbow Preschool International</p>
          <p class="rps-desc">Explore our award-winning preschool chain — the perfect foundation before joining Rainbow International School.</p>
          <a href="https://www.rainbowpreschools.com" target="_blank" rel="noopener noreferrer" class="rps-btn">
            Visit RPS
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>

        <div class="admissions-box">
          <div class="admissions-emoji">🎓</div>
          <p class="admissions-title">Admissions Open</p>
          <p class="admissions-sub">2027–28 admissions are now open for KG to Class 12.</p>
          <a href="/contact-us" class="admissions-btn">Apply Now</a>
        </div>
      </aside>
    </div>

    ${
      related.length > 0
        ? `<div class="related-section">
        <h2 class="related-title">Related Articles</h2>
        <div class="related-grid">
          ${relatedHtml}
        </div>
      </div>`
        : ""
    }
  </div>

${CONTACT_STRIP_HTML}
</main>

${renderFooter()}

<script>
${IMMERSIVE_JS}
</script>

</body>
</html>`;
}

/* ────────────────────────────────────────────────────────────────
   Styles
   ──────────────────────────────────────────────────────────────── */

const IMMERSIVE_CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    :root {
      --ink: #04091c;
      --deep: #071b42;
      --deep-2: #0d2a5e;
      --amber: #ffc247;
      --cyan: #76ddff;
      --orange: #f97316;
      --paper: rgba(233, 240, 252, 0.88);
      --paper-dim: rgba(203, 216, 238, 0.66);
      --line: rgba(118, 221, 255, 0.16);
      --card: rgba(255, 255, 255, 0.045);
    }
    body.immersive {
      font-family: 'Poppins', system-ui, sans-serif;
      background: var(--ink);
      color: var(--paper);
      line-height: 1.75;
      overflow-x: hidden;
    }
    body.immersive::before {
      content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background:
        radial-gradient(900px 520px at 78% -8%, rgba(118,221,255,0.11), transparent 62%),
        radial-gradient(760px 460px at 4% 22%, rgba(255,194,71,0.075), transparent 60%);
    }
    body.immersive > * { position: relative; z-index: 1; }

    #progress-bar { position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: linear-gradient(90deg, var(--cyan), var(--amber)); z-index: 9999; transition: width 0.1s; }

    /* ── Top bar ── */
    .topbar { background: #030713; color: rgba(255,255,255,0.72); font-size: 12px; padding: 6px 16px; display: flex; gap: 24px; align-items: center; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .topbar a { color: rgba(255,255,255,0.72); text-decoration: none; display: flex; align-items: center; gap: 5px; }
    .topbar a:hover { color: var(--amber); }
    .topbar-icon { width: 13px; height: 13px; }

    /* ── Navbar ── */
    .navbar { background: rgba(4,9,28,0.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid rgba(118,221,255,0.12); padding: 0 16px; display: flex; align-items: center; justify-content: space-between; height: 64px; position: sticky; top: 0; z-index: 100; }
    .nav-brand { font-family: 'League Spartan', sans-serif; font-size: 18px; font-weight: 900; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .nav-brand-logo { height: 44px; width: auto; }
    .nav-links { display: flex; gap: 24px; list-style: none; align-items: center; }
    .nav-links a { color: var(--paper-dim); text-decoration: none; font-weight: 500; font-size: 14px; }
    .nav-links a:hover { color: var(--cyan); }
    .nav-cta { background: var(--orange); color: #fff !important; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 14px; }
    .nav-cta:hover { background: #ea6c0a !important; }
    @media(max-width: 768px) { .nav-links { display: none; } }

    /* ── Hero ── */
    .hero-immersive { position: relative; overflow: hidden; padding: 96px 16px 104px; min-height: 88vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(180deg, #061537 0%, #04091c 100%); }
    #constellation { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.85; }
    .hero-veil { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.10; mix-blend-mode: luminosity; }
    .hero-glow { position: absolute; left: 50%; top: 46%; width: 1000px; height: 1000px; transform: translate(-50%,-50%); background: radial-gradient(circle, rgba(118,221,255,0.13) 0%, transparent 58%); }
    .hero-inner { position: relative; z-index: 2; max-width: 900px; margin: 0 auto; }
    .hero-cat { display: inline-block; background: rgba(249,115,22,0.16); border: 1px solid rgba(249,115,22,0.45); color: #ffb27a; font-weight: 600; font-size: 11px; padding: 5px 16px; border-radius: 999px; margin-bottom: 26px; text-transform: uppercase; letter-spacing: 0.16em; }
    .hero-immersive h1 { font-family: 'League Spartan', sans-serif; font-size: clamp(30px, 6vw, 62px); color: #fff; line-height: 1.06; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 34px; text-wrap: balance; }
    .hero-track { display: flex; align-items: center; gap: 14px; justify-content: center; margin: 0 auto 30px; max-width: 420px; font-family: 'League Spartan', sans-serif; font-weight: 800; font-size: 13px; letter-spacing: 0.1em; }
    .hero-track-start { color: var(--amber); }
    .hero-track-end { color: var(--cyan); }
    .hero-track-line { flex: 1; height: 2px; background: rgba(255,255,255,0.14); position: relative; overflow: hidden; border-radius: 2px; }
    .hero-track-fill { position: absolute; inset: 0; width: 0%; background: linear-gradient(90deg, var(--amber), var(--cyan)); transition: width 1.6s cubic-bezier(.2,.7,.2,1); }
    .hero-lede { color: var(--paper-dim); font-size: clamp(15px, 1.6vw, 17px); line-height: 1.85; max-width: 720px; margin: 0 auto 28px; }
    .hero-meta { color: rgba(255,255,255,0.45); font-size: 13px; display: flex; gap: 14px; justify-content: center; align-items: center; flex-wrap: wrap; }
    .hero-meta-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.28); }
    .hero-scroll { margin-top: 46px; color: rgba(255,255,255,0.42); font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .hero-scroll span { display: block; width: 1px; height: 42px; background: linear-gradient(180deg, transparent, var(--cyan)); animation: scrollPulse 2.4s ease-in-out infinite; }
    @keyframes scrollPulse { 0%,100% { opacity: 0.25; transform: scaleY(0.7); } 50% { opacity: 1; transform: scaleY(1); } }

    /* ── Breadcrumb ── */
    .breadcrumb { background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); }
    .breadcrumb-inner { max-width: 1280px; margin: 0 auto; padding: 12px 16px; font-size: 13px; color: var(--paper-dim); display: flex; align-items: center; gap: 8px; }
    .breadcrumb-inner a { color: var(--paper-dim); text-decoration: none; }
    .breadcrumb-inner a:hover { color: var(--cyan); }
    .breadcrumb-inner .current { color: #fff; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px; }

    /* ── Year HUD ── */
    .year-hud { position: fixed; right: 22px; top: 50%; transform: translateY(-50%); z-index: 60; text-align: right; opacity: 0; transition: opacity 0.5s; pointer-events: none; }
    .year-hud.is-on { opacity: 1; }
    .year-hud-label { display: block; font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
    .year-hud-value { display: block; font-family: 'League Spartan', sans-serif; font-size: 40px; font-weight: 900; line-height: 1; background: linear-gradient(180deg, #fff, var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
    @media(max-width: 1100px) { .year-hud { display: none; } }

    /* ── Layout ── */
    .page-main { background: transparent; }
    .page-container { max-width: 1280px; margin: 0 auto; padding: 64px 16px; display: flex; flex-direction: column; }
    .content-row { display: flex; gap: 56px; }
    @media(max-width: 1023px) { .content-row { flex-direction: column; } }
    article { flex-grow: 1; min-width: 0; }

    /* ── Timeline ── */
    .timeline { position: relative; padding-left: 74px; }
    @media(max-width: 640px) { .timeline { padding-left: 40px; } }
    .timeline-spine { position: absolute; left: 21px; top: 6px; bottom: 6px; width: 2px; background: rgba(255,255,255,0.09); border-radius: 2px; }
    @media(max-width: 640px) { .timeline-spine { left: 9px; } }
    .timeline-fill { position: absolute; left: 0; top: 0; width: 100%; height: 0%; background: linear-gradient(180deg, var(--amber), var(--cyan)); border-radius: 2px; }

    .station { position: relative; margin-bottom: 68px; opacity: 0; transform: translateY(26px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(.2,.7,.2,1); }
    .station.is-visible { opacity: 1; transform: none; }
    .station-marker { position: absolute; left: -74px; top: 4px; width: 44px; display: flex; flex-direction: column; align-items: center; gap: 7px; }
    @media(max-width: 640px) { .station-marker { left: -40px; width: 20px; } .station-year { display: none; } }
    .station-dot { width: 11px; height: 11px; border-radius: 50%; background: var(--ink); border: 2px solid rgba(118,221,255,0.45); transition: background 0.4s, box-shadow 0.4s, border-color 0.4s; }
    .station.is-visible .station-dot { background: var(--cyan); border-color: var(--cyan); box-shadow: 0 0 0 5px rgba(118,221,255,0.14); }
    .station-year { font-family: 'League Spartan', sans-serif; font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.32); letter-spacing: 0.04em; }
    .station.is-visible .station-year { color: var(--amber); }

    .station-h2 { font-family: 'League Spartan', sans-serif; font-size: clamp(21px, 3vw, 31px); font-weight: 900; color: #fff; line-height: 1.15; letter-spacing: -0.015em; margin-bottom: 18px; text-wrap: balance; }
    .body-para { color: var(--paper-dim); line-height: 1.85; margin-bottom: 16px; font-size: 15.5px; }
    .body-list { margin-top: 14px; list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .body-list li { display: flex; align-items: flex-start; gap: 12px; color: var(--paper-dim); font-size: 15px; line-height: 1.7; }
    .orange-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--orange); flex-shrink: 0; margin-top: 9px; }
    .subpoint { margin-top: 24px; }
    .subpoint-title { font-family: 'League Spartan', sans-serif; font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 10px; }
    .text-link { color: var(--cyan); text-decoration: underline; text-underline-offset: 3px; }
    .text-link:hover { color: #fff; }

    /* ── Feature blocks ── */
    .feature { margin: 30px 0 8px; padding: 30px; border-radius: 22px; background: var(--card); border: 1px solid var(--line); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
    @media(max-width: 640px) { .feature { padding: 22px 18px; } }
    .feature-kicker { font-size: 10.5px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--amber); margin-bottom: 20px; }
    .feature-note { margin-top: 20px; font-size: 13px; color: rgba(203,216,238,0.5); font-style: italic; }

    /* ── Skill meters ── */
    .meter-list { list-style: none; display: flex; flex-direction: column; gap: 15px; }
    .meter-row { display: grid; grid-template-columns: 1fr 128px; align-items: center; gap: 18px; }
    @media(max-width: 640px) { .meter-row { grid-template-columns: 1fr; gap: 7px; } }
    .meter-label { font-size: 14.5px; color: #fff; font-weight: 500; }
    .meter-track { height: 6px; border-radius: 6px; background: rgba(255,255,255,0.08); overflow: hidden; }
    .meter-fill { display: block; height: 100%; width: 0%; border-radius: 6px; background: linear-gradient(90deg, var(--amber), var(--cyan)); transition: width 1.1s cubic-bezier(.2,.7,.2,1); }
    .is-visible .meter-fill, .feature-meters.is-visible .meter-fill { width: var(--fill); }

    /* ── Transform cards ── */
    .transform-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(255px, 1fr)); gap: 16px; margin-top: 26px; }
    .transform-card { padding: 24px; border-radius: 18px; background: var(--card); border: 1px solid rgba(255,255,255,0.07); opacity: 0; transform: translateY(18px); transition: opacity 0.6s ease var(--d, 0ms), transform 0.6s cubic-bezier(.2,.7,.2,1) var(--d, 0ms), border-color 0.3s, background 0.3s; }
    .transform-card.is-visible { opacity: 1; transform: none; }
    .transform-card:hover { border-color: rgba(118,221,255,0.32); background: rgba(255,255,255,0.06); }
    .transform-num { font-family: 'League Spartan', sans-serif; font-size: 30px; font-weight: 900; color: rgba(118,221,255,0.28); line-height: 1; display: block; margin-bottom: 12px; }
    .transform-title { font-family: 'League Spartan', sans-serif; font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px; line-height: 1.3; }
    .transform-body { color: var(--paper-dim); font-size: 14px; line-height: 1.75; margin-bottom: 10px; }

    /* ── Risk flip cards ── */
    .risk-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(285px, 1fr)); gap: 18px; margin-top: 26px; }
    .risk-card { opacity: 0; transform: translateY(18px); transition: opacity 0.6s ease var(--d, 0ms), transform 0.6s cubic-bezier(.2,.7,.2,1) var(--d, 0ms); }
    .risk-card.is-visible { opacity: 1; transform: none; }
    .risk-flip { width: 100%; border: 0; padding: 0; background: none; cursor: pointer; perspective: 1200px; display: block; text-align: left; font: inherit; min-height: 172px; position: relative; }
    .risk-flip:focus-visible { outline: 2px solid var(--cyan); outline-offset: 4px; border-radius: 18px; }
    .risk-face { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; gap: 12px; padding: 24px; border-radius: 18px; backface-visibility: hidden; -webkit-backface-visibility: hidden; transition: transform 0.65s cubic-bezier(.2,.7,.2,1); }
    .risk-front { background: linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.10); transform: rotateY(0deg); }
    .risk-back { background: linear-gradient(160deg, rgba(255,194,71,0.16), rgba(118,221,255,0.10)); border: 1px solid rgba(255,194,71,0.42); transform: rotateY(180deg); }
    .risk-flip[aria-expanded="true"] .risk-front { transform: rotateY(-180deg); }
    .risk-flip[aria-expanded="true"] .risk-back { transform: rotateY(0deg); }
    .risk-tag { font-size: 9.5px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; }
    .risk-tag-ai { color: rgba(203,216,238,0.55); }
    .risk-tag-child { color: var(--amber); }
    .risk-quote { font-family: 'League Spartan', sans-serif; font-size: 19px; font-weight: 800; color: #fff; line-height: 1.28; }
    .risk-hint { font-size: 11px; color: rgba(118,221,255,0.62); margin-top: auto; }
    .risk-detail { padding: 20px 4px 0; }
    .risk-title { font-family: 'League Spartan', sans-serif; font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 9px; }
    .risk-body { color: var(--paper-dim); font-size: 14px; line-height: 1.75; margin-bottom: 10px; }
    .risk-card-plain { padding: 24px; border-radius: 18px; background: var(--card); border: 1px solid rgba(255,255,255,0.07); }
    /* No-JS: cards cannot flip, so show both faces stacked. */
    .no-js .risk-flip { min-height: 0; perspective: none; }
    .no-js .risk-face { position: static; transform: none !important; margin-bottom: 10px; }
    .no-js .risk-hint { display: none; }

    /* ── Pillars ── */
    .pillar-shell { display: grid; grid-template-columns: 232px 1fr; gap: 22px; }
    @media(max-width: 760px) { .pillar-shell { grid-template-columns: 1fr; } }
    .pillar-tabs { display: flex; flex-direction: column; gap: 8px; }
    @media(max-width: 760px) { .pillar-tabs { flex-direction: row; overflow-x: auto; padding-bottom: 6px; } .pillar-tab { min-width: 152px; } }
    .pillar-tab { text-align: left; cursor: pointer; font: inherit; padding: 13px 15px; border-radius: 13px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); color: var(--paper-dim); transition: background 0.25s, border-color 0.25s, transform 0.25s; }
    .pillar-tab:hover { background: rgba(255,255,255,0.07); transform: translateX(3px); }
    @media(max-width: 760px) { .pillar-tab:hover { transform: none; } }
    .pillar-tab:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
    .pillar-tab.is-active { background: linear-gradient(135deg, rgba(255,194,71,0.15), rgba(118,221,255,0.09)); border-color: rgba(255,194,71,0.45); }
    .pillar-index { display: block; font-family: 'League Spartan', sans-serif; font-size: 10px; font-weight: 800; color: var(--amber); letter-spacing: 0.14em; }
    .pillar-name { display: block; font-family: 'League Spartan', sans-serif; font-size: 15px; font-weight: 800; color: #fff; margin-top: 3px; }
    .pillar-sub { display: block; font-size: 11.5px; color: rgba(203,216,238,0.55); margin-top: 1px; }
    .pillar-panels { padding: 22px; border-radius: 16px; background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.06); }
    .pillar-panel-title { font-family: 'League Spartan', sans-serif; font-size: 19px; font-weight: 900; color: var(--cyan); margin-bottom: 12px; }
    .pillar-panel-body { color: var(--paper-dim); font-size: 15px; line-height: 1.85; }
    .pillar-panel { animation: fadeUp 0.45s ease; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
    .no-js .pillar-panel[hidden] { display: block !important; }

    /* ── School check ── */
    .check-intro { color: var(--paper-dim); font-size: 14.5px; margin-bottom: 20px; }
    .check-list { list-style: none; display: flex; flex-direction: column; gap: 9px; }
    .check-item { display: flex; align-items: flex-start; gap: 13px; cursor: pointer; padding: 12px 15px; border-radius: 12px; background: rgba(255,255,255,0.028); border: 1px solid rgba(255,255,255,0.06); transition: background 0.22s, border-color 0.22s; }
    .check-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(118,221,255,0.24); }
    .check-input { position: absolute; opacity: 0; width: 0; height: 0; }
    .check-box { width: 19px; height: 19px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.26); flex-shrink: 0; margin-top: 2px; position: relative; transition: background 0.22s, border-color 0.22s; }
    .check-box::after { content: ""; position: absolute; left: 5px; top: 1px; width: 4px; height: 9px; border: solid var(--ink); border-width: 0 2px 2px 0; transform: rotate(45deg) scale(0); transition: transform 0.22s cubic-bezier(.2,.7,.2,1); }
    .check-input:checked + .check-box { background: var(--amber); border-color: var(--amber); }
    .check-input:checked + .check-box::after { transform: rotate(45deg) scale(1); }
    .check-input:focus-visible + .check-box { outline: 2px solid var(--cyan); outline-offset: 3px; }
    .check-text { font-size: 14.5px; color: var(--paper); line-height: 1.6; }
    .check-result { margin-top: 22px; padding: 18px 20px; border-radius: 14px; background: rgba(0,0,0,0.26); border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
    .check-score { font-family: 'League Spartan', sans-serif; font-size: 30px; font-weight: 900; color: var(--amber); line-height: 1; }
    .check-of { font-size: 14px; color: rgba(203,216,238,0.5); font-weight: 600; }
    .check-verdict { font-size: 14px; color: var(--paper-dim); flex: 1; min-width: 200px; margin: 0; }
    .check-cta { display: inline-flex; align-items: center; gap: 7px; margin-top: 18px; padding: 11px 22px; border-radius: 999px; background: var(--orange); color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; transition: background 0.22s, transform 0.22s; }
    .check-cta:hover { background: #ea6c0a; transform: translateY(-2px); }
    .no-js .check-result, .no-js .check-box { display: none; }

    /* ── Conclusion ── */
    .conclusion-box { margin-top: 40px; border-radius: 22px; padding: 34px; background: linear-gradient(150deg, rgba(118,221,255,0.09), rgba(255,194,71,0.05)); border: 1px solid var(--line); }
    @media(max-width: 640px) { .conclusion-box { padding: 24px 20px; } }
    .conclusion-box h2 { font-family: 'League Spartan', sans-serif; font-size: 23px; font-weight: 900; color: #fff; margin-bottom: 16px; }
    .conclusion-box p { color: var(--paper-dim); line-height: 1.85; font-size: 15.5px; margin-bottom: 12px; }
    .backlink-box { margin-top: 22px; border-radius: 16px; padding: 22px; display: flex; align-items: center; gap: 16px; background: rgba(255,194,71,0.10); border: 1px solid rgba(255,194,71,0.34); }
    .backlink-icon { font-size: 24px; flex-shrink: 0; }
    .backlink-box p { color: var(--paper); font-size: 14px; line-height: 1.65; margin: 0; }

    /* ── FAQ ── */
    .faq-section { margin-top: 52px; }
    .faq-heading { font-family: 'League Spartan', sans-serif; font-size: 25px; font-weight: 900; color: #fff; margin-bottom: 22px; }
    .faq-list { display: flex; flex-direction: column; gap: 10px; }
    .faq-item { border-radius: 14px; background: var(--card); border: 1px solid rgba(255,255,255,0.07); overflow: hidden; transition: border-color 0.25s; }
    .faq-item[open] { border-color: rgba(118,221,255,0.3); }
    .faq-q { cursor: pointer; list-style: none; padding: 17px 20px; font-family: 'League Spartan', sans-serif; font-size: 15.5px; font-weight: 700; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .faq-q::-webkit-details-marker { display: none; }
    .faq-q:focus-visible { outline: 2px solid var(--cyan); outline-offset: -2px; }
    .faq-icon { width: 13px; height: 13px; flex-shrink: 0; position: relative; }
    .faq-icon::before, .faq-icon::after { content: ""; position: absolute; background: var(--amber); border-radius: 2px; transition: transform 0.28s; }
    .faq-icon::before { left: 0; top: 5.5px; width: 13px; height: 2px; }
    .faq-icon::after { left: 5.5px; top: 0; width: 2px; height: 13px; }
    .faq-item[open] .faq-icon::after { transform: rotate(90deg); }
    .faq-a { padding: 0 20px 18px; }
    .faq-a p { color: var(--paper-dim); font-size: 14.5px; line-height: 1.8; }

    /* ── Tags ── */
    .tags { margin-top: 34px; display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { padding: 4px 12px; border-radius: 999px; font-size: 11.5px; font-weight: 500; background: rgba(255,255,255,0.055); color: rgba(203,216,238,0.62); border: 1px solid rgba(255,255,255,0.05); }

    /* ── Bottom nav ── */
    .article-bottom { margin-top: 38px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 26px; flex-wrap: wrap; gap: 12px; }
    .btn-ghost { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--cyan); text-decoration: none; }
    .btn-ghost:hover { color: #fff; }
    .btn-primary { display: flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 999px; background: var(--orange); color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.22s, background 0.22s; }
    .btn-primary:hover { background: #ea6c0a; transform: translateY(-2px); }

    /* ── Sidebar ── */
    aside { width: 296px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; align-self: flex-start; position: sticky; top: 88px; }
    @media(max-width: 1023px) { aside { width: 100%; position: static; } }
    .sidebar-box { border-radius: 18px; border: 1px solid rgba(255,255,255,0.07); padding: 24px; background: var(--card); }
    .sidebar-box-title { font-family: 'League Spartan', sans-serif; font-size: 15px; font-weight: 900; color: #fff; margin-bottom: 15px; }
    .internal-link-list { list-style: none; display: flex; flex-direction: column; gap: 3px; }
    .internal-link { display: flex; align-items: center; gap: 9px; font-size: 14px; color: var(--paper-dim); text-decoration: none; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.045); transition: color 0.2s, padding-left 0.2s; }
    .internal-link:hover { color: var(--cyan); padding-left: 4px; }
    .orange-dot-sm { width: 6px; height: 6px; border-radius: 50%; background: var(--orange); flex-shrink: 0; }
    .rps-box { border-radius: 18px; padding: 24px; background: linear-gradient(150deg, var(--deep-2), var(--deep)); border: 1px solid rgba(118,221,255,0.18); color: #fff; }
    .rps-logo-wrap { background: #fff; border-radius: 8px; padding: 8px 12px; display: inline-flex; align-items: center; margin-bottom: 12px; }
    .rps-logo { height: 32px; width: auto; }
    .rps-title { font-family: 'League Spartan', sans-serif; font-size: 15px; font-weight: 900; margin-bottom: 8px; }
    .rps-desc { color: rgba(255,255,255,0.72); font-size: 12px; line-height: 1.65; margin-bottom: 16px; }
    .rps-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 999px; background: #fff; color: var(--deep); text-decoration: none; }
    .admissions-box { border-radius: 18px; border: 1px solid rgba(249,115,22,0.32); padding: 24px; background: rgba(249,115,22,0.07); text-align: center; }
    .admissions-emoji { font-size: 30px; margin-bottom: 8px; }
    .admissions-title { font-family: 'League Spartan', sans-serif; font-size: 15px; font-weight: 900; color: #fff; margin-bottom: 8px; }
    .admissions-sub { color: var(--paper-dim); font-size: 12px; margin-bottom: 16px; }
    .admissions-btn { display: block; width: 100%; padding: 11px; border-radius: 999px; background: var(--orange); color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; }
    .admissions-btn:hover { background: #ea6c0a; }

    /* ── Related ── */
    .related-section { margin-top: 70px; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 48px; }
    .related-title { font-family: 'League Spartan', sans-serif; font-size: 27px; font-weight: 900; color: #fff; margin-bottom: 30px; text-align: center; }
    .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media(max-width: 767px) { .related-grid { grid-template-columns: 1fr; } }
    .related-card { display: block; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); text-decoration: none; background: var(--card); transition: transform 0.25s, border-color 0.25s; }
    .related-card:hover { transform: translateY(-4px); border-color: rgba(118,221,255,0.32); }
    .related-body { padding: 22px; }
    .related-cat { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--amber); }
    .related-title-text { font-size: 14.5px; font-weight: 700; margin-top: 7px; line-height: 1.45; color: #fff; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .related-date { font-size: 12px; color: rgba(203,216,238,0.45); margin-top: 8px; }

    /* ── Contact strip ── */
    .contact-strip { background: linear-gradient(135deg, #b8480f 0%, #8a3208 100%); }
    .contact-strip-inner { max-width: 1000px; margin: 0 auto; padding: 44px 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    @media(max-width: 767px) { .contact-strip-inner { grid-template-columns: repeat(2, 1fr); } }
    .contact-card { border-radius: 16px; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; background: rgba(255,255,255,0.10); text-decoration: none; transition: background 0.22s; }
    .contact-card:hover { background: rgba(255,255,255,0.18); }
    .contact-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .contact-icon svg { width: 20px; height: 20px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .contact-label { font-weight: 800; color: #fff; font-size: 14px; }
    .contact-val { color: rgba(255,255,255,0.88); font-size: 12px; line-height: 1.6; }

    /* ── Footer ── */
    footer { background: #030713; color: rgba(255,255,255,0.62); border-top: 1px solid rgba(255,255,255,0.06); }
    .footer-inner { max-width: 1280px; margin: 0 auto; padding: 48px 16px 32px; display: grid; grid-template-columns: 2fr 1fr 1fr 1.2fr; gap: 40px; }
    @media(max-width: 767px) { .footer-inner { grid-template-columns: 1fr; gap: 24px; } }
    .footer-brand { font-family: 'League Spartan', sans-serif; font-size: 18px; font-weight: 900; color: #fff; margin-bottom: 12px; }
    .footer-desc { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.5); margin-bottom: 16px; }
    .footer-socials { display: flex; gap: 10px; }
    .footer-social-btn { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; }
    .footer-social-btn:hover { background: rgba(118,221,255,0.18); }
    .footer-social-btn svg { width: 16px; height: 16px; stroke: rgba(255,255,255,0.7); fill: none; stroke-width: 2; }
    .footer-col-title { font-family: 'League Spartan', sans-serif; font-size: 14px; font-weight: 900; color: #fff; margin-bottom: 16px; }
    .footer-link-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .footer-link-list a { font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none; }
    .footer-link-list a:hover { color: var(--cyan); }
    .footer-contact-item { display: flex; gap: 10px; margin-bottom: 12px; font-size: 13px; color: rgba(255,255,255,0.5); }
    .footer-contact-item svg { width: 15px; height: 15px; stroke: rgba(255,255,255,0.42); fill: none; stroke-width: 2; flex-shrink: 0; margin-top: 2px; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); }
    .footer-bottom-inner { max-width: 1280px; margin: 0 auto; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.3); }
    .footer-bottom-inner a { color: rgba(255,255,255,0.3); text-decoration: none; }
    .footer-bottom-inner a:hover { color: rgba(255,255,255,0.65); }

    /* ── Reduced motion: show everything in its final state ── */
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      #constellation { display: none; }
      .station, .transform-card, .risk-card { opacity: 1 !important; transform: none !important; transition: none !important; }
      .meter-fill { width: var(--fill) !important; transition: none !important; }
      .hero-track-fill { transition: none !important; }
      .hero-scroll span { animation: none; }
      .risk-face { transition: none !important; }
      .pillar-panel { animation: none; }
      * { scroll-behavior: auto !important; }
    }
`;

/* ────────────────────────────────────────────────────────────────
   Behaviour
   ──────────────────────────────────────────────────────────────── */

const IMMERSIVE_JS = `
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var START_YEAR = ${START_YEAR};
  var END_YEAR = ${END_YEAR};

  /* ── Scroll progress + timeline fill + year HUD ── */
  var progress = document.getElementById('progress-bar');
  var timelineFill = document.getElementById('timeline-fill');
  var timeline = document.querySelector('.timeline');
  var hud = document.getElementById('year-hud');
  var hudValue = document.getElementById('year-hud-value');
  var ticking = false;

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';

    if (timeline && timelineFill) {
      var rect = timeline.getBoundingClientRect();
      var mid = window.innerHeight * 0.5;
      var pct = (mid - rect.top) / rect.height;
      pct = Math.max(0, Math.min(1, pct));
      timelineFill.style.height = (pct * 100) + '%';

      if (hud && hudValue) {
        var inRange = rect.top < window.innerHeight * 0.6 && rect.bottom > 0;
        hud.classList.toggle('is-on', inRange);
        hudValue.textContent = String(Math.round(START_YEAR + (END_YEAR - START_YEAR) * pct));
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ── Reveal on scroll ── */
  var revealTargets = [].slice.call(
    document.querySelectorAll('.station, [data-reveal], .transform-card, .risk-card')
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ── Hero year track ── */
  var track = document.querySelector('.hero-track-fill');
  if (track) {
    if (reduceMotion) { track.style.width = '100%'; }
    else { setTimeout(function () { track.style.width = '100%'; }, 420); }
  }

  /* ── Risk flip cards ── */
  [].slice.call(document.querySelectorAll('.risk-flip')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ── Four pillars explorer ── */
  var pillarTabs = [].slice.call(document.querySelectorAll('.pillar-tab'));
  var pillarPanels = [].slice.call(document.querySelectorAll('.pillar-panel'));

  function selectPillar(index) {
    pillarTabs.forEach(function (tab, i) {
      var active = i === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    pillarPanels.forEach(function (panel, i) {
      var active = i === index;
      panel.classList.toggle('is-active', active);
      if (active) { panel.removeAttribute('hidden'); } else { panel.setAttribute('hidden', ''); }
    });
  }

  pillarTabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectPillar(i); });
    tab.addEventListener('keydown', function (ev) {
      var next = null;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') next = (i + 1) % pillarTabs.length;
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') next = (i - 1 + pillarTabs.length) % pillarTabs.length;
      if (next !== null) { ev.preventDefault(); selectPillar(next); pillarTabs[next].focus(); }
    });
  });

  /* ── School readiness self-check ── */
  var checks = [].slice.call(document.querySelectorAll('[data-check]'));
  var countEl = document.getElementById('check-count');
  var verdictEl = document.getElementById('check-verdict');

  function verdictFor(score, total) {
    if (score === 0) return 'Start ticking to see where the school stands.';
    var ratio = score / total;
    if (ratio < 0.4) return 'Worth asking harder questions before you decide.';
    if (ratio < 0.75) return 'A reasonable start — ask how the remaining gaps are being closed.';
    if (ratio < 1) return 'Strong. Ask to see the last one or two in practice, not just on paper.';
    return 'This is what genuinely future-ready looks like.';
  }

  if (checks.length && countEl && verdictEl) {
    var total = checks.length;
    checks.forEach(function (input) {
      input.addEventListener('change', function () {
        var score = checks.filter(function (c) { return c.checked; }).length;
        countEl.textContent = String(score);
        verdictEl.textContent = verdictFor(score, total);
      });
    });
  }

  /* ── Hero constellation ── */
  var canvas = document.getElementById('constellation');
  if (canvas && !reduceMotion && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var raf = null;
    var running = false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    }

    function seed() {
      var rect = size();
      var target = Math.min(64, Math.round((rect.width * rect.height) / 20000));
      nodes = [];
      for (var i = 0; i < target; i++) {
        nodes.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.5 + 0.6
        });
      }
    }

    function frame() {
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > rect.width) n.vx *= -1;
        if (n.y < 0 || n.y > rect.height) n.vy *= -1;

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 132) {
            ctx.strokeStyle = 'rgba(118,221,255,' + (0.16 * (1 - dist / 132)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }

        ctx.fillStyle = i % 7 === 0 ? 'rgba(255,194,71,0.75)' : 'rgba(174,222,255,0.5)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = window.requestAnimationFrame(frame);
    }

    function start() { if (!running) { running = true; frame(); } }
    function stop() { running = false; if (raf) { window.cancelAnimationFrame(raf); raf = null; } }

    seed();
    start();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(seed, 200);
    });

    // Stop painting once the hero scrolls out of view.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.isIntersecting ? start() : stop(); });
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }
})();
`;
