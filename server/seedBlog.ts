import { db } from "./db";
import { blogPostsTable } from "@shared/schema";
import { blogPosts } from "../client/src/data/blogPosts";
import { sql } from "drizzle-orm";

function parseDate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return new Date("2022-09-01");
}

async function seed() {
  console.log(`Seeding ${blogPosts.length} blog posts into the database...`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      meta_title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      keywords TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      cat TEXT NOT NULL,
      thumb_url TEXT,
      hero_url TEXT NOT NULL DEFAULT '',
      intro TEXT NOT NULL DEFAULT '',
      sections JSONB NOT NULL DEFAULT '[]',
      conclusion TEXT NOT NULL DEFAULT '',
      related_slugs JSONB NOT NULL DEFAULT '[]',
      internal_links JSONB NOT NULL DEFAULT '[]',
      faqs JSONB NOT NULL DEFAULT '[]',
      published_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  let inserted = 0;
  let updated = 0;

  for (const post of blogPosts) {
    const existing = await db.execute(
      sql`SELECT id FROM blog_posts WHERE slug = ${post.slug}`
    );

    const values = {
      slug: post.slug,
      title: post.title,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      keywords: post.keywords || "",
      date: post.date,
      cat: post.cat,
      thumbUrl: post.thumbUrl || null,
      heroUrl: post.heroUrl || "",
      intro: post.intro || "",
      sections: post.sections as any,
      conclusion: post.conclusion || "",
      relatedSlugs: post.relatedSlugs as any,
      internalLinks: post.internalLinks as any,
      faqs: (post.faqs || []) as any,
      publishedAt: parseDate(post.date),
    };

    if (existing.rows.length > 0) {
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
      updated++;
    } else {
      await db.insert(blogPostsTable).values(values);
      inserted++;
    }
  }

  console.log(`Done. Inserted: ${inserted}, Updated: ${updated}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
