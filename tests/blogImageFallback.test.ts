import { describe, expect, it } from "vitest";
import type { BlogPost } from "@shared/schema";
import { BLOG_IMAGE_FALLBACK, resolveBlogImageUrl } from "@shared/blogImage";
import { renderHeadMeta } from "../server/ssrBlogShared";
import { renderImmersiveArticle } from "../server/ssrBlogImmersive";

const legacyAbsolute =
  "https://rainbowinternationalschool.in/wp-content/uploads/2025/12/article.jpg";
const codeOwnedImage = "/blog-assets/raksha-bandhan-2026/raksha-bandhan-2026-og.svg";

function postWithHero(heroUrl: string): BlogPost {
  return {
    id: "test",
    slug: "test-post",
    title: "Test post",
    metaTitle: "Test post",
    metaDescription: "Test description",
    keywords: "test",
    date: "26 Aug 2026",
    cat: "Education",
    thumbUrl: legacyAbsolute,
    heroUrl,
    intro: "Intro",
    sections: [],
    conclusion: "Conclusion",
    relatedSlugs: [],
    internalLinks: [],
    faqs: [],
  };
}

describe("blog image fallback", () => {
  it("resolves absolute and relative legacy WordPress paths to the fallback", () => {
    expect(resolveBlogImageUrl(legacyAbsolute)).toBe(BLOG_IMAGE_FALLBACK);
    expect(resolveBlogImageUrl("/wp-content/uploads/2025/12/article.jpg")).toBe(BLOG_IMAGE_FALLBACK);
  });

  it("leaves code-owned blog assets untouched", () => {
    expect(resolveBlogImageUrl(codeOwnedImage)).toBe(codeOwnedImage);
    expect(resolveBlogImageUrl("/blog-assets/raksha-bandhan-2026/hero.webp")).toBe(
      "/blog-assets/raksha-bandhan-2026/hero.webp",
    );
  });

  it("uses the fallback in Open Graph and BlogPosting metadata without changing the post", () => {
    const post = postWithHero(legacyAbsolute);
    const head = renderHeadMeta(post);

    expect(head).toContain(`<meta property="og:image" content="${BLOG_IMAGE_FALLBACK}" />`);
    expect(head).toContain(`"image":"${BLOG_IMAGE_FALLBACK}"`);
    expect(post.heroUrl).toBe(legacyAbsolute);
  });

  it("uses the fallback in immersive heroes while preserving code-owned assets", () => {
    const legacyHtml = renderImmersiveArticle(postWithHero(legacyAbsolute), []);
    expect(legacyHtml).toContain(`background-image: url('${BLOG_IMAGE_FALLBACK}')`);

    const codeOwnedHtml = renderImmersiveArticle(postWithHero(codeOwnedImage), []);
    expect(codeOwnedHtml).toContain(`background-image: url('${codeOwnedImage}')`);
  });
});