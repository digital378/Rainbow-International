import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

export type WalkinPageScope = "leads" | "panel";
export type WalkinLeadsAccess = "GROUP" | "RIS" | "RPS";
type SignedPageScope = WalkinPageScope | "leads-ris" | "leads-rps";

const PASSCODE_KEYS: Record<SignedPageScope, string> = {
  leads: "WALKIN_LEADS_PASSCODE",
  "leads-ris": "WALKIN_RIS_LEADS_PASSCODE",
  "leads-rps": "WALKIN_RPS_LEADS_PASSCODE",
  panel: "WALKIN_PANEL_PASSCODE",
};
const SESSION_MS = 8 * 60 * 60 * 1000;

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

function signature(payload: string, scope: SignedPageScope): string {
  const key = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(process.env[PASSCODE_KEYS[scope]]!)
    .digest();
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createWalkinPageSession(scope: WalkinPageScope, passcode: string): string | null {
  const expected = process.env[PASSCODE_KEYS[scope]];
  if (!expected || !process.env.SESSION_SECRET) throw new Error(`Missing page auth configuration for ${scope}`);
  let signedScope: SignedPageScope = scope;
  if (!safeEqual(passcode, expected)) {
    if (scope !== "leads") return null;
    if (process.env.WALKIN_RIS_LEADS_PASSCODE && safeEqual(passcode, process.env.WALKIN_RIS_LEADS_PASSCODE)) signedScope = "leads-ris";
    else if (process.env.WALKIN_RPS_LEADS_PASSCODE && safeEqual(passcode, process.env.WALKIN_RPS_LEADS_PASSCODE)) signedScope = "leads-rps";
    else return null;
  }
  const payload = `wp1.${signedScope}.${Date.now() + SESSION_MS}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${signature(payload, signedScope)}`;
}

function validSignedSession(token: string, scope: SignedPageScope): boolean {
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "wp1" || parts[1] !== scope ||
      !/^\d{13}$/.test(parts[2]) || !/^[\w-]{22}$/.test(parts[3]) ||
      !/^[\w-]{43}$/.test(parts[4])) return false;
  const expires = Number(parts[2]);
  if (expires <= Date.now() || expires > Date.now() + SESSION_MS) return false;
  if (!process.env.SESSION_SECRET || !process.env[PASSCODE_KEYS[scope]]) return false;
  return safeEqual(parts[4], signature(parts.slice(0, 4).join("."), scope));
}

export function validWalkinPageSession(token: string, scope: WalkinPageScope): boolean {
  if (scope === "panel") return validSignedSession(token, "panel");
  return validSignedSession(token, "leads") ||
    validSignedSession(token, "leads-ris") ||
    validSignedSession(token, "leads-rps");
}

function bearer(req: Request): string {
  return (req.headers.authorization || "").match(/^Bearer\s+(\S+)$/i)?.[1] || "";
}

export function hasWalkinPageSession(req: Request, scope: WalkinPageScope): boolean {
  return validWalkinPageSession(bearer(req), scope);
}

export function walkinLeadsAccess(req: Request): WalkinLeadsAccess | null {
  const token = bearer(req);
  if (validSignedSession(token, "leads")) return "GROUP";
  if (validSignedSession(token, "leads-ris")) return "RIS";
  if (validSignedSession(token, "leads-rps")) return "RPS";
  return null;
}

export function isWalkinPageAuthorized(req: Request): boolean {
  const path = req.path;
  if (/^\/api\/walkin\/leads(?:\/|$)/.test(path)) {
    return hasWalkinPageSession(req, "leads");
  }
  const panelPath =
    /^\/api\/walkin\/branches(?:\/|$)/.test(path) ||
    /^\/api\/walkin\/staff(?:\/|$)/.test(path) ||
    /^\/api\/walkin\/lookups(?:\/|$)/.test(path) ||
    /^\/api\/walkin\/sheets\/(?:status|pull-log|pull|resync|resync-master|sync-master-deletions)$/.test(path);
  return panelPath && hasWalkinPageSession(req, "panel");
}