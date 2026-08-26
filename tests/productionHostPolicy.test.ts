import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import {
  DESTINATION_REPLIT_PREVIEW_ENV,
  applyNonCanonicalRobotsPolicy,
  applyProductionHostRedirect,
} from "../server/productionHostPolicy";

const originalPreviewSetting = process.env[DESTINATION_REPLIT_PREVIEW_ENV];

afterEach(() => {
  if (originalPreviewSetting === undefined) {
    delete process.env[DESTINATION_REPLIT_PREVIEW_ENV];
  } else {
    process.env[DESTINATION_REPLIT_PREVIEW_ENV] = originalPreviewSetting;
  }
});

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
  it("redirects a Replit host to the canonical site when destination preview is disabled", () => {
    delete process.env[DESTINATION_REPLIT_PREVIEW_ENV];

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

  it("allows the destination Replit host while retaining its noindex header", () => {
    process.env[DESTINATION_REPLIT_PREVIEW_ENV] = "true";

    const { res, next } = runHostPolicy("asia-preview.replit.app", "/admin");

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive",
    );
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("continues redirecting the www canonical-domain host even when destination preview is enabled", () => {
    process.env[DESTINATION_REPLIT_PREVIEW_ENV] = "true";

    const { res, next } = runHostPolicy("www.rainbowinternationalschool.in", "/blogs");

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      301,
      "https://rainbowinternationalschool.in/blogs",
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});