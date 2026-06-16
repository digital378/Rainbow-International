import { storage } from "./storage";
import seedData from "./data/blogPostsSeed.json";

function seedLog(msg: string) {
  const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  console.log(`${t} [seed] ${msg}`);
}

type SeedPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  date: string;
  cat: string;
  thumbUrl?: string;
  heroUrl?: string;
  intro?: string;
  sections?: Array<{ heading?: string; body: string; list?: string[] }>;
  conclusion?: string;
  relatedSlugs?: string[];
  internalLinks?: Array<{ label: string; href: string }>;
};

export async function autoSeedBlogsIfEmpty(): Promise<void> {
  try {
    const existing = await storage.getAllBlogPosts();
    if (existing.length > 0) {
      return;
    }

    seedLog(`Blog posts table is empty — seeding ${seedData.length} posts…`);

    const posts = seedData as SeedPost[];
    const BATCH = 10;
    for (let i = 0; i < posts.length; i += BATCH) {
      const batch = posts.slice(i, i + BATCH);
      await Promise.all(
        batch.map((p) =>
          storage.upsertBlogPost({
            slug: p.slug,
            title: p.title,
            metaTitle: p.metaTitle,
            metaDescription: p.metaDescription,
            keywords: p.keywords ?? "",
            date: p.date,
            cat: p.cat,
            thumbUrl: p.thumbUrl ?? null,
            heroUrl: p.heroUrl ?? "",
            intro: p.intro ?? "",
            sections: p.sections ?? [],
            conclusion: p.conclusion ?? "",
            relatedSlugs: p.relatedSlugs ?? [],
            internalLinks: p.internalLinks ?? [],
            faqs: [],
            publishedAt: new Date(p.date),
          }),
        ),
      );
      seedLog(`  seeded posts ${i + 1}–${Math.min(i + BATCH, posts.length)}`);
    }

    seedLog(`Seeding complete — ${posts.length} blog posts inserted.`);
  } catch (err) {
    seedLog(`Auto-seed failed: ${err}`);
  }
}
