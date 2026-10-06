import { PRIMARY_SEO } from "@shared/content/primary";
import { MIDDLE_SEO } from "@shared/content/middle";
import { SECONDARY_SEO } from "@shared/content/secondary";
import { SENIOR_SEO } from "@shared/content/senior";
import { ADM_SEO } from "@shared/content/admissions";
import { HOME_SEO } from "@shared/content/home";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { blogPostsTable } from "@shared/schema";
import { ROUTE_SEO, buildBreadcrumbLd, routeCanonical } from "@shared/routeSeo";
import { normalizeSchemaHtml } from "@shared/orgSchema";
import { blogSlugFromPath, isKnownBlogSlug } from "./blogRoutes";

export async function resolveBlogTitle(slug: string): Promise<string | null> {
  try {
    const rows = await db
      .select({ metaTitle: blogPostsTable.metaTitle })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, slug))
      .limit(1);
    return rows[0]?.metaTitle ?? null;
  } catch {
    return null;
  }
}

const PAGE_TITLES: Record<string, string> = {
  "/": HOME_SEO.title,
  "/about-rainbow-international-school": "About Us | Rainbow International School Thane",
  "/welcome-to-ris": "Welcome to Rainbow International School",
  "/chairpersons-note": "Chairperson's Note | Rainbow International School",
  "/ris-vision-mission": "Vision & Mission | Rainbow International School",
  "/our-philosophy": "Our Philosophy | Rainbow International School",
  "/pre-primary-school-thane": "Pre-Primary (Nursery–Sr KG) Thane | Rainbow International School",
  "/primary-section": PRIMARY_SEO.title,
  "/middle-school-section": MIDDLE_SEO.title,
  "/secondary-section": SECONDARY_SEO.title,
  "/senior-secondary-section": SENIOR_SEO.title,
  "/amenities": "Campus & Facilities | Rainbow International School Thane",
  "/awards-achievements": "Awards & Achievements | Rainbow International School",
  "/student-achievements": "Student Achievements | Rainbow International School",
  "/safety-security": "Safety & Security | Rainbow International School",
  "/beyond-the-classroom": "Beyond the Classroom | Rainbow International School",
  "/extracurriculars": "Extracurricular Activities | Rainbow International School",
  "/photo-gallery": "Photo Gallery | Rainbow International School",
  "/contact-us": "Contact Us | Rainbow International School",
  "/academic-calendar": "Academic Calendar 2026–27 | Rainbow International School",
  "/blogs": "Blogs | Rainbow International School",
  "/cbse-mandatory-public-disclosures": "CBSE Public Disclosures | Rainbow International School",
  "/school-managing-committee": "School Managing Committee | Rainbow International School",
  "/career": "Careers at Rainbow International School Thane | Teaching & Non-Teaching Jobs",
  "/book-list": "Book List 2026–27 | Rainbow International School",
  "/declaration": "Declaration | Rainbow International School",
  "/virtual-learning": "Virtual Learning | Rainbow International School",
  "/academic-team": "Academic Team | Rainbow International School",
  "/rainbow-preschool-international": "Preschool (Age 1.5–5.5) Thane | Rainbow International School",
  "/privacy-policy-and-cookie-policy": "Privacy Policy & Cookie Policy | Rainbow International School",
  "/term-of-use": "Terms of Use - Rainbow International School",
  "/brand-partners": "Brand Partners | Rainbow International School Thane",
  "/students-leaving-certificate": "Students Leaving Certificate | Rainbow International School",
  "/curriculum": "Curriculum | Rainbow International School",
  "/application-form": "Application Form 2027–28 | Rainbow International School Thane",
  "/google-school-2025-26": "Google School 2025–26 | Rainbow International School",
  "/meta-school-2025-26": "Meta School 2025–26 | Rainbow International School",
  "/faqs": "FAQs — Admissions, Fees, Academics & More | Rainbow International School",
  "/fee-structure": "Fee Structure 2026-27 | Rainbow International School Thane",
  "/testimonials": "Parent Testimonials & Reviews | Rainbow International School Thane",
  "/schedule-appointment": "Schedule an Appointment | Rainbow International School",
  "/school-readiness-quiz": "School Readiness Quiz — Is My Child Ready for Grade 1? | Rainbow International School",
  "/thank-you": "Thank You for Your Enquiry | Rainbow International School",
  "/top-schools-in-thane": "Top 10 Schools in Thane (2026) — Best CBSE, ICSE & International Schools | Rainbow International School",
  "/school-near-brahmand-thane": "Best School Near Brahmand Thane — CBSE KG to Class 12 | Rainbow International School",
  "/school-near-ghodbunder-road-thane": "Best School Near Ghodbunder Road Thane — CBSE K–12 | Rainbow International School",
  "/school-near-manpada-thane": "Best School Near Manpada Thane — CBSE KG to Class 12 | Rainbow International School",
  "/admissions": ADM_SEO.title,
  "/rps-sales": "Rainbow Preschool | Rainbow International School",
  "/sales": "Admissions | Rainbow International School",
};

/**
 * Pages that must never appear in search results. Keep this policy here,
 * alongside the server-side head injector, so both Vite development and the
 * production static server emit the tag before React has a chance to run.
 *
 * Dashboard access controls are a separate concern: this prevents indexing
 * even where a page is deliberately reachable to staff who hold its existing
 * passcode or API credential.
 */
const NOINDEX_EXACT_PATHS = new Set([
  "/admin/blog",
  "/admin/alliances/friendship",
  "/admin/ras",
  "/admin/ras/submissions",
  "/admin/walkin-2728",
  "/sales",
  "/marketing",
  "/rps-sales",
  "/declaration",
  "/marketing-27-28",
  "/sales-27-28",
  "/rps-sales-27-28",
  "/internal",
  "/alliances",
  "/thank-you",
  "/book-list",
  "/leads",
  "/overview-27-28",
]);

/** True when a document must receive server-rendered noindex metadata. */
export function isNoindexPath(reqPath: string): boolean {
  const basePath = (reqPath.split("?")[0].replace(/\/$/, "") || "/");
  if (NOINDEX_EXACT_PATHS.has(basePath)) return true;

  // All currently registered routes in these namespaces are intentionally
  // non-indexable: staff pages, lead-capture/kiosk forms, tokenized
  // friendship portals, and printable QR cards.
  return (
    basePath.startsWith("/admin/") ||
    basePath.startsWith("/walkin/") ||
    basePath === "/walkin-ris-27-28" ||
    basePath.startsWith("/walkin-ris-27-28/") ||
    basePath === "/walkin-rps-27-28" ||
    basePath.startsWith("/walkin-rps-27-28/") ||
    basePath.startsWith("/alliances/friendship/")
  );
}

const STATIC_KNOWN_PATHS = new Set([
  ...Object.keys(PAGE_TITLES),
  "/marketing",
  "/alliances",
  "/internal",
  "/marketing-27-28",
  "/sales-27-28",
  "/rps-sales-27-28",
  "/admin/ras/submissions",
  "/admin/ras",
  "/admin/blog",
]);

const DYNAMIC_KNOWN_PATTERNS: RegExp[] = [
  /^\/walkin\/[^/]+$/,
  /^\/admin\/ras\/[^/]+\/qr$/,
];

export function isKnownRoute(reqPath: string): boolean {
  const basePath = (reqPath.split("?")[0].replace(/\/$/, "") || "/");
  if (STATIC_KNOWN_PATHS.has(basePath)) return true;
  // Blog URLs are resolved against the registry rather than a blanket
  // /blog/<anything> pattern. That pattern returned 200 for every conceivable
  // blog URL, so a post that did not exist looked valid to search engines
  // (a soft 404). Real posts — database-backed or code-owned — are known here
  // the moment they are created; anything else is honestly reported missing.
  const blogSlug = blogSlugFromPath(basePath);
  if (blogSlug) return isKnownBlogSlug(blogSlug);
  return DYNAMIC_KNOWN_PATTERNS.some((re) => re.test(basePath));
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Serialize JSON-LD safely for inline <script> (no `</script>` breakout). */
function ldJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/**
 * Inject per-route SEO head tags into the SPA shell — title, description,
 * canonical, and JSON-LD. This is the single server-side injection
 * mechanism; both the dev (vite.ts) and production (static.ts) servers
 * call it. AI crawlers do not execute JavaScript, so nothing here may be
 * left to client-side code.
 *
 * Blog routes keep title-only injection — /blog/* is served full SSR by
 * ssrBlog.ts and never relies on this shell.
 */
export function injectSeoHead(html: string, reqPath: string, overrideTitle?: string): string {
  const basePath = (reqPath.split("?")[0].replace(/\/$/, "") || "/");
  const title = overrideTitle ?? PAGE_TITLES[basePath];
  let out = html;
  if (title) {
    const safe = escHtml(title);
    const socialTitle = escHtml(basePath === "/" ? HOME_SEO.ogTitle : title);
    out = out
      .replace(/<title>[^<]*<\/title>/, `<title>${safe}</title>`)
      .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,  `$1${socialTitle}$2`)
      .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,  `$1${socialTitle}$2`);
  }

  // These routes are intentionally not indexable, including routes that do
  // not have public SEO metadata. Insert a server-rendered tag so crawlers
  // see it without executing the React bundle.
  if (isNoindexPath(basePath) || !isKnownRoute(basePath)) {
    const robotsTag = `<meta name="robots" content="noindex,nofollow">`;
    if (/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i.test(out)) {
      out = out.replace(
        /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
        robotsTag,
      );
    } else {
      out = out.replace(/<\/head>/i, `    ${robotsTag}\n  </head>`);
    }
  }

  // Blog posts (and any route without SEO config) get title-only injection.
  const seo = overrideTitle ? undefined : ROUTE_SEO[basePath];
  if (!seo) return out;

  const desc = escHtml(seo.description);
  const canonical = routeCanonical(basePath);
  out = out
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${desc}$2`);

  if (basePath === "/") {
    out = out
      .replace(/(<meta\s+name="keywords"\s+content=")[^"]*(")/, `$1${escHtml(HOME_SEO.keywords)}$2`)
      .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/, `$1${escHtml(HOME_SEO.ogImage)}$2`)
      .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/, `$1${escHtml(HOME_SEO.ogImage)}$2`);
  }

  // Canonical + JSON-LD go in just before </head>. index.html ships no
  // canonical link at all, so this is an insert, not a replace.
  const jsonLdBlocks: unknown[] = [buildBreadcrumbLd(basePath, seo.crumb)];

  // Each script is tagged with its schema @type via data-seo-server-jsonld
  // so the client-side SEO component can dedupe after hydration (it removes
  // a server script only when it is about to add the same type itself).
  const injection =
    `\n    <link rel="canonical" href="${canonical}" />` +
    jsonLdBlocks
      .map((ld) => {
        const type = (ld as Record<string, unknown>)["@type"];
        const marker = Array.isArray(type) ? type[0] : String(type);
        return `\n    <script type="application/ld+json" data-seo-server-jsonld="${escHtml(marker)}">${ldJson(ld)}</script>`;
      })
      .join("") +
    `\n  </head>`;
  out = out.replace(/<\/head>/, injection);
  return normalizeSchemaHtml(out);
}
