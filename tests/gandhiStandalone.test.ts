import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { renderGandhiStandalone } from "../server/gandhiJayantiBlog";
import { prepareGandhiArticle } from "../shared/gandhiArticleContent";

const source = fs.readFileSync("attached_assets/gandhi-jayanti-2026-blog-preview-v2_1790747569571.html", "utf8");
const chrome = fs.readFileSync("blog-pages/gandhi-jayanti-2026/chrome.html", "utf8");
const site = fs.readFileSync("client/index.html", "utf8");

describe("Gandhi standalone document parity", () => {
  it("keeps canonical metadata, schema, and article content without the SPA", () => {
    const output = renderGandhiStandalone(source, chrome, site);
    const doc = new DOMParser().parseFromString(output, "text/html");
    const original = new DOMParser().parseFromString(prepareGandhiArticle(source), "text/html");
    expect(doc.title).toBe(original.title);
    for (const key of ["description", "keywords", "robots", "theme-color"]) {
      expect(doc.querySelector(`meta[name="${key}"]`)?.getAttribute("content"))
        .toBe(original.querySelector(`meta[name="${key}"]`)?.getAttribute("content"));
    }
    for (const key of ["og:title", "og:url", "og:image", "og:description", "og:type",
      "article:published_time", "article:modified_time"]) {
      expect(doc.querySelector(`meta[property="${key}"]`)?.getAttribute("content"))
        .toBe(original.querySelector(`meta[property="${key}"]`)?.getAttribute("content"));
    }
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href"))
      .toBe("https://rainbowinternationalschool.in/gandhi-jayanti-2026");
    expect(JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!))
      .toEqual(JSON.parse(original.querySelector('script[type="application/ld+json"]')!.textContent!));
    const content = doc.querySelector<HTMLTemplateElement>('template[shadowrootmode="open"]')!.content;
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(doc.querySelector("h1")?.textContent).toBe(original.querySelector("h1")?.textContent);
    expect(doc.querySelector("h1")?.textContent).toBe(
      "Gandhi Jayanti 2026 History, Speech, Essay, Quotes, Stories & Activities for Students",
    );
    expect(doc.querySelector("h1")?.getAttribute("slot")).toBe("gandhi-heading");
    expect(doc.querySelector("h1")?.closest(".gandhi-jayanti-article")).not.toBeNull();
    expect(content.querySelector("h1")).toBeNull();
    expect(content.querySelector('slot[name="gandhi-heading"]')).not.toBeNull();
    expect(doc.querySelector("h1")?.hasAttribute("hidden")).toBe(false);
    expect([...content.querySelectorAll("article section")].map(e => e.textContent))
      .toEqual([...original.querySelectorAll("article section")].map(e => e.textContent));
    expect(doc.querySelector('script[type="module"]')).toBeNull();
    expect(output).not.toContain("/src/main.tsx");
    expect(output).not.toMatch(/\/assets\/index-.*\.js/);
    expect(doc.querySelector("header[role=banner]")).not.toBeNull();
    expect(doc.querySelector("footer")).not.toBeNull();
  });

  it("retains site tracking and functional page scripts", () => {
    const output = renderGandhiStandalone(source, chrome, site);
    for (const id of ["GTM-P694WJXH", "G-DN4GB6MVJJ", "AW-18140772845", "1280590747364170", "m20umgnikz"]) {
      expect(output).toContain(id);
    }
    expect(output).toContain('/blog-assets/gandhi-jayanti-2026/article.js');
    expect(output).toContain('/blog-assets/gandhi-jayanti-2026/chrome.js');
    expect(output).toContain('/blog-assets/gandhi-jayanti-2026/analytics.js');
    expect(output).not.toContain("{{ARTICLE}}");
  });

  it("rejects incomplete content rather than silently serving an empty article", () => {
    expect(() => renderGandhiStandalone("", chrome, site)).toThrow("incomplete");
    expect(() => renderGandhiStandalone(source, "<main></main>", site)).toThrow("incomplete");
  });

  it("preserves paid attribution and mobile/footer measurement events", () => {
    window.history.replaceState({}, "", "/gandhi-jayanti-2026?gclid=test-click&gad_campaignid=campaign");
    sessionStorage.clear();
    document.body.innerHTML = `<header role="banner"><a id="mobile-call" href="tel:+918291568972">Book Visit</a></header>
      <footer><a id="footer-call" href="tel:+918291568972">Phone</a>
      <a data-testid="link-campus-map" href="https://maps.app.goo.gl/mfJjMMkksCkcXzMCA">Map</a></footer>`;
    window.dataLayer = [];
    window.gtag = (...args: unknown[]) => { window.dataLayer.push(args); };
    const tracking = fs.readFileSync("blog-pages/gandhi-jayanti-2026/analytics.js", "utf8");
    new Function("window", "document", "location", "sessionStorage", tracking)(
      window, document, window.location, sessionStorage,
    );
    expect(JSON.parse(sessionStorage.getItem("ris_utm_params")!)).toMatchObject({
      utm_source: "google", utm_medium: "cpc", utm_campaign: "campaign", gclid: "test-click",
    });
    for (const link of document.querySelectorAll("a")) {
      link.addEventListener("click", e => e.preventDefault());
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    }
    const events = window.dataLayer as unknown[][];
    expect(events.filter(e => e[1] === "page_view")).toHaveLength(1);
    expect(events.filter(e => e[1] === "call_click").map(e => e[2])).toEqual([
      { phone: "+91 82915 68972", source_page: "/gandhi-jayanti-2026", send_to: "G-DN4GB6MVJJ" },
      { phone: "+91 82915 68972", source_page: "/gandhi-jayanti-2026", send_to: "G-DN4GB6MVJJ" },
    ]);
    expect(events.filter(e => e[1] === "conversion")).toHaveLength(2);
    expect(events.filter(e => e[1] === "directions_click")).toHaveLength(1);
  });
});