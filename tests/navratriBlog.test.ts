import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { NAVRATRI_HERO_URL, renderNavratriBlog } from "../server/navratriBlog";

const source = fs.readFileSync("blog-pages/navratri-dussehra-2026/index.html", "utf8");

describe("Navratri article early artwork loading", () => {
  it("serves the same hero asset directly and preloads it at high priority", () => {
    const html = renderNavratriBlog(source);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const originalDoc = new DOMParser().parseFromString(source, "text/html");
    const originalCss = originalDoc.querySelector("style")!.textContent!;
    const css = doc.querySelector("style")!.textContent!;
    expect(css).not.toContain("data:image/jpeg;base64,");
    expect(css).toContain(`background-image:url("${NAVRATRI_HERO_URL}")`);
    expect(css).toBe(originalCss.replace(
      /url\("data:image\/jpeg;base64,[^"]+"\)/,
      `url("${NAVRATRI_HERO_URL}")`,
    ));
    const preload = doc.querySelector('link[rel="preload"][as="image"]');
    expect(preload?.getAttribute("href")).toBe(NAVRATRI_HERO_URL);
    expect(preload?.getAttribute("fetchpriority")).toBe("high");
    expect(Buffer.byteLength(source) - Buffer.byteLength(html)).toBeGreaterThan(270_000);
    expect(fs.existsSync(`blog-pages/navratri-dussehra-2026/${NAVRATRI_HERO_URL.split("/").pop()}`)).toBe(true);
    expect(renderNavratriBlog(html)).toBe(html);
    expect(doc.body.innerHTML).toBe(originalDoc.body.innerHTML);
  });

  it("keeps metadata and structured data unchanged while using the requested copy", () => {
    const doc = new DOMParser().parseFromString(renderNavratriBlog(source), "text/html");
    const original = new DOMParser().parseFromString(source, "text/html");
    expect([...doc.querySelectorAll("meta")].map(e => e.outerHTML))
      .toEqual([...original.querySelectorAll("meta")].map(e => e.outerHTML));
    expect(doc.querySelector('script[type="application/ld+json"]')?.textContent)
      .toBe(original.querySelector('script[type="application/ld+json"]')?.textContent);
    expect([...doc.querySelectorAll("h3")].some(e => e.textContent ===
      "Download Free Poster, Images and Wallpapers for Navratri & Dussehra")).toBe(true);
    expect([...doc.querySelectorAll(".callout")].some(e => e.textContent ===
      "Free Story ImagesDownload these Navratri & Dussehra posters and images for WhatsApp Status, Instagram Stories or Facebook Stories.")).toBe(true);
  });
});