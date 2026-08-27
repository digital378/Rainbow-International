import type { NextFunction, Request, Response } from "express";

const CANONICAL_HOST = "rainbowinternationalschool.in";
const REPLIT_APP_SUFFIX = ".replit.app";

function normalizedHost(host: string | undefined): string {
  return (host || "").toLowerCase();
}

function isCanonicalHost(host: string): boolean {
  return host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;
}

function isReplitAppHost(host: string): boolean {
  return host.endsWith(REPLIT_APP_SUFFIX);
}

export function applyNonCanonicalRobotsPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!isCanonicalHost(normalizedHost(req.hostname))) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  next();
}

export function applyProductionHostRedirect(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const host = normalizedHost(req.hostname);

  if (host.startsWith("www.") && host.includes(CANONICAL_HOST)) {
    res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
    return;
  }

  if (isReplitAppHost(host)) {
    res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
    return;
  }

  next();
}