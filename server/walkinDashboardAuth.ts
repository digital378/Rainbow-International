import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

export const WALKIN_DASHBOARD_COOKIE = "walkin_dashboard_session";
export const WALKIN_INTERNAL_COOKIE = "walkin_internal_session";

type DashboardAccess = "RIS" | "RPS" | "GROUP";
export type WalkinDashboardScope = "ris-sales" | "rps-sales" | "overview" | "marketing";

const SCOPE_CONFIG: Record<WalkinDashboardScope, { secretKey: string; access: DashboardAccess }> = {
  "ris-sales": { secretKey: "WALKIN_RIS_DASHBOARD_PASSCODE", access: "RIS" },
  "rps-sales": { secretKey: "WALKIN_RPS_DASHBOARD_PASSCODE", access: "RPS" },
  overview: { secretKey: "WALKIN_OVERVIEW_DASHBOARD_PASSCODE", access: "GROUP" },
  marketing: { secretKey: "WALKIN_MARKETING_DASHBOARD_PASSCODE", access: "GROUP" },
};

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const REMEMBER_TTL_SECONDS = 30 * 24 * 60 * 60;
const sessions = new Map<string, { access: DashboardAccess; expiresAt: number }>();
const internalSessions = new Map<string, number>();

export function walkinDashboardCookieName(scope: WalkinDashboardScope): string {
  return `${WALKIN_DASHBOARD_COOKIE}_${scope.replace("-", "_")}`;
}

function safeEqual(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  try {
    return timingSafeEqual(leftHash, rightHash);
  } catch {
    return false;
  }
}

function parseCookies(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split(";").map((part) => {
      const separator = part.indexOf("=");
      return separator < 0
        ? [part.trim(), ""]
        : [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
    }),
  );
}

export function createWalkinDashboardSession(
  passcode: string,
  scope: WalkinDashboardScope,
  remember = false,
): string | null {
  const config = SCOPE_CONFIG[scope];
  const expectedPasscode = process.env[config.secretKey];
  if (!expectedPasscode) {
    throw new Error(`Missing required dashboard passcode secret: ${config.secretKey}`);
  }
  if (!safeEqual(expectedPasscode, passcode) || !process.env.SESSION_SECRET) return null;

  if (remember) {
    const expiresAt = Date.now() + REMEMBER_TTL_SECONDS * 1000;
    const nonce = randomBytes(16).toString("base64url");
    const payload = `${scope}.${expiresAt}.${nonce}`;
    return `${payload}.${rememberSignature(payload, scope)}`;
  }
  const token = randomBytes(32).toString("base64url");
  sessions.set(token, { access: config.access, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function rememberSignature(payload: string, scope: WalkinDashboardScope): string {
  // Tying the signing key to the current passcode invalidates remembered devices
  // if the dashboard passcode or the session secret is rotated.
  const config = SCOPE_CONFIG[scope];
  const key = createHmac("sha256", process.env.SESSION_SECRET!).update(process.env[config.secretKey] || "").digest();
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function validRememberedSession(token: string, scope: WalkinDashboardScope): boolean {
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== scope || !/^\d{13}$/.test(parts[1]) ||
      !/^[\w-]{22}$/.test(parts[2]) || !/^[\w-]{43}$/.test(parts[3])) return false;
  const expiresAt = Number(parts[1]);
  if (expiresAt <= Date.now() || expiresAt > Date.now() + REMEMBER_TTL_SECONDS * 1000) return false;
  if (!process.env.SESSION_SECRET || !process.env[SCOPE_CONFIG[scope].secretKey]) return false;
  return safeEqual(parts[3], rememberSignature(parts.slice(0, 3).join("."), scope));
}

export function hasWalkinDashboardSession(req: Request, scope: WalkinDashboardScope): boolean {
  const token = parseCookies(req.headers.cookie || "")[walkinDashboardCookieName(scope)];
  if (!token) return false;
  if (validRememberedSession(token, scope)) return true;
  const session = sessions.get(token);
  if (!session) return false;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return session.access === SCOPE_CONFIG[scope].access;
}

export function createTrustedWalkinDashboardSession(scope: WalkinDashboardScope): string | null {
  if (!process.env.SESSION_SECRET) return null;
  const token = randomBytes(32).toString("base64url");
  sessions.set(token, {
    access: SCOPE_CONFIG[scope].access,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function createWalkinInternalSession(passcode: string): string | null {
  const expectedPasscode = process.env.WALKIN_INTERNAL_DASHBOARD_PASSCODE || "MAIN";
  if (!safeEqual(expectedPasscode, passcode) || !process.env.SESSION_SECRET) return null;
  const token = randomBytes(32).toString("base64url");
  internalSessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function hasWalkinInternalAccess(req: Request): boolean {
  const token = parseCookies(req.headers.cookie || "")[WALKIN_INTERNAL_COOKIE];
  if (!token) return false;
  const expiresAt = internalSessions.get(token);
  if (!expiresAt) return false;
  if (expiresAt <= Date.now()) {
    internalSessions.delete(token);
    return false;
  }
  return true;
}

export function revokeWalkinInternalSession(req: Request): void {
  const token = parseCookies(req.headers.cookie || "")[WALKIN_INTERNAL_COOKIE];
  if (token) internalSessions.delete(token);
}

export function hasWalkinDashboardAccess(req: Request, brand: "RIS" | "RPS"): boolean {
  for (const scope of Object.keys(SCOPE_CONFIG) as WalkinDashboardScope[]) {
    if (hasWalkinDashboardSession(req, scope) &&
        (SCOPE_CONFIG[scope].access === "GROUP" || SCOPE_CONFIG[scope].access === brand)) return true;
  }
  return false;
}

export function revokeWalkinDashboardSession(
  req: Request,
  scope: WalkinDashboardScope,
): void {
  const cookie = parseCookies(req.headers.cookie || "")[walkinDashboardCookieName(scope)];
  if (cookie) sessions.delete(cookie);
}
