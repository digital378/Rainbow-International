import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";

export const GANDHI_SLUG = "gandhi-jayanti-2026-speech-essay-quotes-students";
const ARTICLE_URL = `/blogs/${GANDHI_SLUG}`;
const SOURCE = "gandhi-jayanti-2026-blog-preview-v2_1790747569571.html";

/** Serve the same article text to crawlers before React mounts for visitors. */
export function registerGandhiJayantiBlog(app: Express) {
  app.get(`/blog/${GANDHI_SLUG}`, (_req, res) => res.redirect(302, ARTICLE_URL));
  app.get(ARTICLE_URL, (_req, res, next) => {
    try {
      const sourcePath = path.join(process.cwd(),
        process.env.NODE_ENV === "production" ? "dist" : "attached_assets", SOURCE);
      const html = fs.readFileSync(sourcePath, "utf8");
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
      const rendered = cleanTemplate
        .replace("</head>", `${head}\n</head>`)
        .replace('<div id="root"></div>', `<div id="root"><style>${css}</style>${hero}${subnav}${main}</div>`);
      res.setHeader("Cache-Control", "no-store");
      res.type("html").send(rendered);
    } catch (error) {
      next(error);
    }
  });
}