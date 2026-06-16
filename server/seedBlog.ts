/**
 * Blog seed script — loads blog posts from the committed JSON snapshot and
 * upserts them into the database.  Safe to re-run on any environment.
 *
 * Usage:
 *   npm run db:seed-blog
 *
 * The source of truth is server/data/blogPostsSeed.json which was exported
 * from the original static blogPosts.ts data.  To refresh this snapshot from
 * a live database, query the blog_posts table and write the rows to that file.
 */

import { db } from "./db";
import { blogPostsTable } from "@shared/schema";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.resolve(__dirname, "data", "blogPostsSeed.json");

if (!fs.existsSync(seedFile)) {
  console.error(`Seed file not found: ${seedFile}`);
  process.exit(1);
}

interface PostData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  date: string;
  cat: string;
  thumbUrl?: string | null;
  heroUrl?: string;
  intro?: string;
  sections?: unknown;
  conclusion?: string;
  relatedSlugs?: unknown;
  internalLinks?: unknown;
  faqs?: unknown;
}

function parseDate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return new Date("2022-09-01");
}

async function seed() {
  const posts: PostData[] = JSON.parse(fs.readFileSync(seedFile, "utf-8"));
  console.log(`Seeding ${posts.length} blog posts into the database...`);

  let inserted = 0;
  let updated = 0;

  for (const post of posts) {
    const values = {
      slug: post.slug,
      title: post.title,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      keywords: post.keywords || "",
      date: post.date,
      cat: post.cat,
      thumbUrl: post.thumbUrl ?? null,
      heroUrl: post.heroUrl ?? "",
      intro: post.intro ?? "",
      sections: (post.sections ?? []) as any,
      conclusion: post.conclusion ?? "",
      relatedSlugs: (post.relatedSlugs ?? []) as any,
      internalLinks: (post.internalLinks ?? []) as any,
      faqs: (post.faqs ?? []) as any,
      publishedAt: parseDate(post.date),
    };

    await db
      .insert(blogPostsTable)
      .values(values)
      .onConflictDoUpdate({
        target: blogPostsTable.slug,
        set: {
          title: values.title,
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          keywords: values.keywords,
          date: values.date,
          cat: values.cat,
          thumbUrl: values.thumbUrl,
          heroUrl: values.heroUrl,
          intro: values.intro,
          sections: values.sections,
          conclusion: values.conclusion,
          relatedSlugs: values.relatedSlugs,
          internalLinks: values.internalLinks,
          faqs: values.faqs,
          publishedAt: values.publishedAt,
        },
      });

    inserted++;
  }

  console.log(`Done. Upserted ${inserted} posts (inserted + updated).`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
