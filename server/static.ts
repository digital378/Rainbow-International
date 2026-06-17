import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectPageTitle, isKnownRoute } from "./pageTitles";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    maxAge: "1y",
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=0, s-maxage=120, stale-while-revalidate=600");
        return;
      }
      const base = path.basename(filePath).toLowerCase();
      if (
        base === "robots.txt" ||
        base === "sitemap.xml" ||
        base === "llms.txt" ||
        base === "llms-full.txt"
      ) {
        res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
      }
    },
  }));

  let cachedIndexHtml: string | null = null;

  app.use("*", (req, res) => {
    if (!cachedIndexHtml) {
      cachedIndexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
    }
    const html = injectPageTitle(cachedIndexHtml, req.originalUrl);
    const status = isKnownRoute(req.originalUrl) ? 200 : 404;
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=120, stale-while-revalidate=600");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(status).send(html);
  });
}
