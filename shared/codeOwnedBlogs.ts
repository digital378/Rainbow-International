/**
 * Blog pages that live in code rather than in the `blog_posts` table.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Bespoke pages (custom SSR modules, static HTML folders) have no database row,
 * so they were invisible to `/api/blog-posts` — which is the only thing the
 * /blogs listing reads. The result: a page could be live and correct at its URL
 * while being completely absent from the blog index, discoverable only if you
 * already knew the link.
 *
 * THE RULE
 * --------
 * A code-owned blog page is described here ONCE. That single entry:
 *   - protects the URL from legacy redirects (server registers the slug), and
 *   - puts a card in the /blogs listing (client renders it alongside DB posts).
 *
 * HOW TO ADD A NEW CODE-OWNED PAGE
 * --------------------------------
 * Add an entry below, then serve it from its route module. Nothing else needs
 * touching: registration, redirect protection and the listing card all follow.
 *
 * Do NOT list a slug here if the post also exists in the database — it would
 * appear twice. (Duplicates are filtered defensively, but keep the list clean.)
 */
export interface CodeOwnedBlog {
  /** URL slug, served at /blog/<slug>. */
  slug: string;
  title: string;
  /** Display date shown on the card, formatted like the database posts. */
  date: string;
  /** ISO date used purely for ordering the listing. */
  publishedAt: string;
  /** Must be one of the categories offered by the /blogs filter bar. */
  cat: string;
  intro: string;
  /** Optional card accents so a seasonal feature can stand out. */
  accentColor?: string;
  emoji?: string;
  badge?: string;
}

export const CODE_OWNED_BLOGS: CodeOwnedBlog[] = [
  {
    slug: "navratri-dussehra-2026",
    title: "Navratri & Dussehra 2026 | Rainbow International School",
    date: "1 Oct 2026",
    publishedAt: "2026-10-01",
    cat: "Events",
    intro:
      "Explore nine nights of Navadurga, Rama and Ravana, trilingual essays and speeches, regional traditions, a classroom quiz and festive graphics for the RIS community.",
    accentColor: "#C9A227",
    emoji: "🪔",
    badge: "NEW",
  },
  {
    slug: "ganesh-chaturthi-2026",
    title: "Ganesh Chaturthi 2026: History, Significance, Speeches, Essays & Celebration Guide",
    date: "7 Sep 2026",
    publishedAt: "2026-09-07",
    cat: "Events",
    intro:
      "A complete Ganesh Chaturthi 2026 guide for students, teachers and parents, with history, significance, speeches and essays in English, Hindi and Marathi, shlokas, quiz, activities and social media resources.",
    accentColor: "#E58A2B",
    emoji: "🐘",
    badge: "NEW",
  },
  {
    slug: "janmashtami-2026",
    title: "Janmashtami 2026: Essays, Speeches & Activities | RIS",
    date: "31 Aug 2026",
    publishedAt: "2026-08-31",
    cat: "Events",
    intro:
      "Complete Janmashtami 2026 guide for CBSE students — history, significance, essays and speeches in English, Hindi and Marathi, quiz, activities and free downloads.",
    accentColor: "#E8B93B",
    emoji: "🪈",
    badge: "NEW",
  },
  {
    slug: "raksha-bandhan-2026",
    title: "Raksha Bandhan 2026: Date, Speech, Essay & Activities for Students",
    date: "14 Aug 2026",
    publishedAt: "2026-08-14",
    cat: "Events",
    intro:
      "Raksha Bandhan 2026 falls on Friday, 28 August. Speeches, essays, 10 lines, classroom activities, rakhi craft ideas and wishes for students, parents and teachers.",
    accentColor: "#d4426e",
    emoji: "🪢",
    badge: "NEW",
  },
  {
    slug: "independence-day-2026",
    title: "Independence Day 2026: Essays, Speeches, Slogans, History & More",
    date: "25 Jul 2026",
    publishedAt: "2026-07-25",
    cat: "Events",
    intro:
      "India's 80th Independence Day — August 15, 2026. Complete resource for students, parents & teachers: essays in English, Hindi & Marathi, school speeches, slogans, freedom fighters, quiz, fun facts & free patriotic images.",
    accentColor: "#FF9933",
    emoji: "🇮🇳",
  },
];

/** Slugs of every code-owned page described above. */
export const CODE_OWNED_BLOG_SLUGS = CODE_OWNED_BLOGS.map((b) => b.slug);
