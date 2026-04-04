import express, { type Express } from "express";
import fs from "fs";
import path from "path";

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
      }
      if (filePath.match(/\.(webp|jpg|jpeg|png|avif|gif|svg|ico)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
      if (filePath.match(/\.(woff2?|ttf|otf|eot)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));

  app.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=120, stale-while-revalidate=600");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
