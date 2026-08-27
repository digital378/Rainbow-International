import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import {
  applyNonCanonicalRobotsPolicy,
  applyProductionHostRedirect,
} from "../server/productionHostPolicy";

function runHostPolicy(hostname: string, originalUrl = "/") {
  const req = { hostname, originalUrl } as Request;
  const res = {
    setHeader: vi.fn(),
    redirect: vi.fn(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;

  applyNonCanonicalRobotsPolicy(req, res, next);
  applyProductionHostRedirect(req, res, next);

  return { res, next };
}

describe("production host policy", () => {
  it("redirects a Replit host to the canonical site", () => {
    const { res, next } = runHostPolicy("asia-preview.replit.app", "/admin?tab=sync");

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive",
    );
    expect(res.redirect).toHaveBeenCalledWith(
      301,
      "https://rainbowinternationalschool.in/admin?tab=sync",
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("redirects the www canonical-domain host", () => {
    const { res, next } = runHostPolicy("www.rainbowinternationalschool.in", "/blogs");

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      301,
      "https://rainbowinternationalschool.in/blogs",
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});