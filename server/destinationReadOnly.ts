import type { NextFunction, Request, Response } from "express";

/**
 * Enables a destination-copy safety mode. It is intentionally opt-in so the
 * established production environment keeps its existing behavior.
 */
export const DESTINATION_READ_ONLY_ENV = "DESTINATION_READ_ONLY";

export class DestinationReadOnlyError extends Error {
  constructor(action: string) {
    super(`Destination copy is read-only; ${action} is disabled`);
    this.name = "DestinationReadOnlyError";
  }
}

export function isDestinationReadOnly(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[DESTINATION_READ_ONLY_ENV]?.trim().toLowerCase() === "true";
}

export function assertDestinationWritable(action: string): void {
  if (isDestinationReadOnly()) {
    throw new DestinationReadOnlyError(action);
  }
}

/**
 * Keeps pages, dashboards, and other safe requests available while preventing
 * any HTTP route from changing the destination database or calling an external
 * service. Background work has its own guards at the service boundaries.
 */
export function blockDestinationMutations(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (
    isDestinationReadOnly()
    && !["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase())
  ) {
    res.status(503).json({
      message: "Destination copy is read-only; write operations are disabled.",
    });
    return;
  }
  next();
}