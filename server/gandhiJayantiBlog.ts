import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { GANDHI_PATH, GANDHI_OLD_SLUG, GANDHI_LAYOUT_CSS, prepareGandhiArticle } from "../shared/gandhiArticleContent";

const SOURCE = "gandhi-jayanti-2026-blog-preview-v2_1790747569571.html";

/** Serve the same article text to crawlers before React mounts for visitors. */
export function registerGandhiJayantiBlog(app: Express) {
  for (const oldPath of [`/blog/${GANDHI_OLD_SLUG}`, `/blogs/${GANDHI_OLD_SLUG}`, "/blog/gandhi-jayanti-2026", "/blogs/gandhi-jayanti-2026"]) {
    app.get(oldPath, (_req, res) => res.redirect(301, GANDHI_PATH));
  }
  app.get(GANDHI_PATH, (_req, res, next) => {
    try {
      const sourcePath = path.join(process.cwd(),
        process.env.NODE_ENV === "production" ? "dist" : "attached_assets", SOURCE);
      const html = prepareGandhiArticle(fs.readFileSync(sourcePath, "utf8"));
      const template = fs.readFileSync(path.join(process.cwd(),
        process.env.NODE_ENV === "production" ? "dist/public/index.html" : "client/index.html"), "utf8");
      const head = html.slice(html.indexOf("<head>") + 6, html.indexOf("</head>"))
        .replace(/<style>[\s\S]*?<\/style>/, "")
        .replace('<script type="application/ld+json">', '<script type="application/ld+json" data-gandhi-source-jsonld>')
        .replace(/<!--[\s\S]*?-->/g, "");
      const css = html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>"));
      const hero = html.slice(html.indexOf('<section class="hero">'), html.indexOf('<nav class="qj"'))
        .replace(/<nav class="crumbs"[\s\S]*?<\/nav>/, "");
      const mainStart = html.indexOf('<main id="main"');
      const subnav = html.slice(html.indexOf('<nav class="qj"'), mainStart);
      const main = html.slice(mainStart, html.indexOf('<div class="cta" id="enquire">')) + "</main>";
      if (!hero || !main.includes("<article>") || !head.includes("<title>")) throw new Error("Article source is incomplete");
      const cleanTemplate = template
        .replace(/<title>[\s\S]*?<\/title>/, "")
        .replace(/<meta (?:name="(?:description|keywords|robots|twitter:[^"]+)"|property="og:[^"]+") [^>]*\/?>/g, "")
        .replace(/<link rel="preload" as="image"[^>]*\/>/g, "");
      // Backend HTML routes bypass Vite's transformIndexHtml. The React plugin
      // needs its development preamble before main.tsx or the SPA never mounts.
      const devPreamble = process.env.NODE_ENV === "production" ? "" : `<script type="module">
import RefreshRuntime from "/@react-refresh";
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;
</script>`;
      const rendered = cleanTemplate
        .replace("</head>", `${devPreamble}\n</head>`)
        .replace("</head>", `${head}\n</head>`)
        .replace('<div id="root"></div>', `<div id="root"><style>${css}\n${GANDHI_LAYOUT_CSS}</style>${hero}${subnav}${main}</div>`);
      res.setHeader("Cache-Control", "no-store");
      res.type("html").send(rendered);
    } catch (error) {
      next(error);
    }
  });
}