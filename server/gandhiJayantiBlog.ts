import { static as expressStatic, type Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { GANDHI_PATH, GANDHI_OLD_SLUG, GANDHI_LAYOUT_CSS, prepareGandhiArticle } from "../shared/gandhiArticleContent";

const SOURCE = "gandhi-jayanti-2026-blog-preview-v2_1790747569571.html";
const ASSET_PATH = "/blog-assets/gandhi-jayanti-2026";

/** Same source/design as the former React page, without booting the SPA. */
export function renderGandhiStandalone(source: string, chrome: string, siteTemplate: string): string {
  const html = prepareGandhiArticle(source);
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1]
    .replace(/<style>[\s\S]*?<\/style>/, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  const heroStart = html.indexOf('<section class="hero">');
  const navStart = html.indexOf('<nav class="qj"');
  const mainStart = html.indexOf('<main id="main"');
  const articleStart = html.indexOf("<article>", mainStart);
  // Story cards also use <article>; the first closing tag is not the page's
  // closing tag. Balance the nested article elements instead of truncating it.
  let articleEnd = -1;
  let articleDepth = 0;
  const articleTags = /<\/?article\b[^>]*>/g;
  articleTags.lastIndex = Math.max(0, articleStart);
  let tag: RegExpExecArray | null;
  while ((tag = articleTags.exec(html))) {
    articleDepth += tag[0].startsWith("</") ? -1 : 1;
    if (articleDepth === 0) {
      articleEnd = tag.index;
      break;
    }
  }
  if (!head || !style || heroStart < 0 || navStart < heroStart
    || mainStart < navStart || articleStart < mainStart || articleEnd < articleStart
    || chrome.split("{{ARTICLE}}").length !== 2) {
    throw new Error("Gandhi standalone source or chrome is incomplete");
  }
  const hero = html.slice(heroStart, navStart)
    .replace(/<nav class="crumbs"[\s\S]*?<\/nav>/, "")
    .replace(/<div class="share-row">[\s\S]*?<\/div>/,
      '<div class="share-row" data-live-share-host></div>');
  const intro = html.slice(mainStart, articleStart).replace(/^<main[^>]*>/, "");
  const markup = hero + html.slice(navStart, mainStart) + intro
    + html.slice(articleStart, articleEnd + "</article>".length);
  // Keep the same isolation and selectors as the existing article. Declarative
  // Shadow DOM displays it at HTML parse time, including with JS disabled.
  const css = style
    .replace(/body\.print-reader/g, ":host[data-print-reader]")
    .replace(/:root\b/g, ":host")
    .replace(/\bhtml\b/g, ":host")
    .replace(/\bbody\b/g, ":host")
    .replace(/:host\s*\{/, ":host{display:block;min-width:0;background:var(--bg);color:var(--text);--reader:19px;");
  const article = `<div class="gandhi-jayanti-article" aria-label="Gandhi Jayanti 2026: History, Speech, Essay, Quotes, Stories &amp; Activities for Students"><template shadowrootmode="open"><style>${css}\n${GANDHI_LAYOUT_CSS}</style><div class="gandhi-article-source">${markup}</div></template></div>`;
  // Retain the existing site's measurement tags; conversion is not permission
  // to remove tracking. Only the SPA bootstrap is excluded.
  const tracking = [...siteTemplate.matchAll(/<script\b([^>]*)>[\s\S]*?<\/script>/g)]
    .filter(match => !/type=["']module["']/.test(match[1]))
    .map(match => match[0]).join("\n");
  const noscript = [...siteTemplate.matchAll(/<noscript>[\s\S]*?<\/noscript>/g)]
    .map(match => match[0]).join("\n");
  const siteMeta = siteTemplate.match(/<meta name="google-site-verification"[^>]*\/?>/)?.[0] ?? "";
  const icons = [...siteTemplate.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*\/?>/g)]
    .map(match => match[0]).join("\n");
  return `<!DOCTYPE html>
<html lang="en"><head>${head}
${siteMeta}${icons}
<meta name="twitter:title" content="Gandhi Jayanti 2026: Speech, Essay, Quotes in Hindi &amp; Marathi">
<meta name="twitter:description" content="Gandhi Jayanti 2026 is Friday, 2 October. Speeches, essays, 10 lines in English, Hindi &amp; Marathi, stories, quotes, slogans, quiz and school ideas.">
<link rel="stylesheet" href="${ASSET_PATH}/chrome.css">
<style>
@media print {
  html.gandhi-print-reader #gandhi-page > :not(main) { display:none!important; }
  html.gandhi-print-reader #gandhi-page > main > :not(.gandhi-jayanti-article) { display:none!important; }
  html.gandhi-print-reader #gandhi-page > main { display:block!important; }
}
</style>
</head><body>${chrome.replace("{{ARTICLE}}", article)}
${tracking}${noscript}
<script defer src="${ASSET_PATH}/analytics.js"></script>
<script defer src="${ASSET_PATH}/chrome.js"></script>
<script defer src="${ASSET_PATH}/article.js"></script>
</body></html>`;
}

export function registerGandhiJayantiBlog(app: Express) {
  const pageDir = path.join(process.cwd(),
    process.env.NODE_ENV === "production" ? "dist/blog-pages" : "blog-pages", "gandhi-jayanti-2026");
  app.get(`${ASSET_PATH}/site.css`, (_req, res, next) => {
    if (process.env.NODE_ENV === "production") return next();
    const assetDir = path.join(process.cwd(), "dist/public/assets");
    const cssName = fs.existsSync(assetDir)
      ? fs.readdirSync(assetDir).find(name => /^index-.*\.css$/.test(name))
      : undefined;
    if (cssName) return res.sendFile(path.join(assetDir, cssName));
    // Clean workspaces can use Vite's CSS-only response, never its SPA runtime.
    return res.redirect(302, "/src/index.css?direct");
  });
  // Unlike the article's root canonical URL, these are assets, never SPA routes.
  app.use(ASSET_PATH, expressStatic(pageDir));
  for (const oldPath of [`/blog/${GANDHI_OLD_SLUG}`, `/blogs/${GANDHI_OLD_SLUG}`, "/blog/gandhi-jayanti-2026", "/blogs/gandhi-jayanti-2026"]) {
    app.get(oldPath, (_req, res) => res.redirect(301, GANDHI_PATH));
  }
  app.get(GANDHI_PATH, (_req, res, next) => {
    try {
      const sourcePath = path.join(process.cwd(),
        process.env.NODE_ENV === "production" ? "dist" : "attached_assets", SOURCE);
      const template = fs.readFileSync(path.join(process.cwd(),
        process.env.NODE_ENV === "production" ? "dist/public/index.html" : "client/index.html"), "utf8");
      const rendered = renderGandhiStandalone(
        fs.readFileSync(sourcePath, "utf8"),
        fs.readFileSync(path.join(pageDir, "chrome.html"), "utf8"),
        template,
      );
      res.setHeader("Cache-Control", "no-store");
      res.type("html").send(rendered);
    } catch (error) {
      next(error);
    }
  });
}