import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { INDRA_ALLOWED_ORIGIN } from "./indraIntegration";
import { serveStatic } from "./static";
import { createServer } from "http";
import { autoSeedBlogsIfEmpty } from "./autoSeedBlogs";
import { startSeoMonitor } from "./seoMonitor";
import { bootstrapWalkinSequences, bootstrapWalkinLookups } from "./walkinSheets";

const app = express();
const httpServer = createServer(app);

app.use(compression());

// CORS — allow ChatGPT custom GPT actions (and any other API consumer) to call
// /api/* endpoints cross-origin. Sensitive endpoints are still protected by
// ADMIN_TOKEN; this only removes the browser-level CORS block.
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/indra/")) {
    const origin = req.headers.origin;
    if (origin === INDRA_ALLOWED_ORIGIN) {
      res.setHeader("Access-Control-Allow-Origin", INDRA_ALLOWED_ORIGIN);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, X-Indra-Api-Key");
    if (req.method === "OPTIONS") {
      if (origin !== INDRA_ALLOWED_ORIGIN) {
        res.sendStatus(403);
        return;
      }
      res.sendStatus(204);
      return;
    }
    next();
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Api-Key");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/__repl_health", (_req, res) => {
  res.status(200).send("OK");
});

// Tell search-engine crawlers not to index or follow links on any /admin/* page.
// Using a response header (X-Robots-Tag) is more reliable than a <meta> noindex
// tag because it works even when JavaScript hasn't loaded yet, including SSR and
// before the React bundle has executed.
app.use("/admin", (_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});

app.get("/global-brand-associations", (req, res) => {
  const query = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
  res.redirect(301, "/brand-partners" + query);
});

if (process.env.NODE_ENV === "production") {
  // Block staging / non-production hosts from being indexed by search engines.
  // Production canonical host is rainbowinternationalschool.in.
  app.use((req, res, next) => {
    const host = (req.hostname || "").toLowerCase();
    const isProductionHost =
      host === "rainbowinternationalschool.in" || host === "www.rainbowinternationalschool.in";
    if (!isProductionHost) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
    next();
  });

  app.use((req, res, next) => {
    const host = req.hostname;
    if (host && host.startsWith("www.") && host.includes("rainbowinternationalschool.in")) {
      return res.redirect(301, `https://rainbowinternationalschool.in${req.originalUrl}`);
    }
    if (host && host.includes("replit.app")) {
      return res.redirect(301, `https://rainbowinternationalschool.in${req.originalUrl}`);
    }
    next();
  });

  app.use((req, res, next) => {
    const path = req.path;
    if (path !== "/" && path.endsWith("/")) {
      const query = req.originalUrl.slice(path.length);
      return res.redirect(301, path.slice(0, -1) + query);
    }
    next();
  });
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && !path.startsWith("/api/indra/")) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await autoSeedBlogsIfEmpty();
  await bootstrapWalkinSequences();
  await bootstrapWalkinLookups();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
    // Start the daily SEO regression monitor (fires 60 s after startup, then every 24 h).
    startSeoMonitor();
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
