import express, { type Express, type Request, type Response } from "express";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "./db";
import {
  mcpOauthAccessTokens,
  mcpOauthAuthorizationCodes,
  mcpOauthAuthorizationRequests,
  mcpOauthClients,
  mcpOauthRefreshTokens,
} from "@shared/schema";

const AUTHORIZATION_REQUEST_TTL_MS = 10 * 60_000;
const AUTHORIZATION_CODE_TTL_MS = 5 * 60_000;
const ACCESS_TOKEN_TTL_MS = 60 * 60_000;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60_000;
const GOOGLE_SCOPES = "openid email profile";
const MCP_SCOPE = "mcp";
const MAX_REGISTRATIONS_PER_HOUR = 20;
const registrationWindows = new Map<string, { startedAt: number; count: number }>();
const PKCE_VERIFIER_PATTERN = /^[A-Za-z0-9\-._~]{43,128}$/;
const PKCE_S256_CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type McpAuthPrincipal = {
  auditPrincipal: string;
  idempotencyPrincipal: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function randomToken() {
  return randomBytes(32).toString("base64url");
}

function pkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

function publicOrigin(req: Request) {
  const configured = process.env.MCP_PUBLIC_URL?.trim().replace(/\/+$/, "");
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol !== "https:" || url.origin !== configured) throw new Error("invalid origin");
      return configured;
    } catch {
      throw new Error("MCP_PUBLIC_URL must be an absolute HTTPS origin without a path.");
    }
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("MCP_PUBLIC_URL must be configured in production.");
  }
  return `${req.protocol}://${req.get("host")}`;
}

function googleCallbackUrl(req: Request) {
  return `${publicOrigin(req)}/oauth/google/callback`;
}

function workspaceDomain() {
  const domain = (process.env.MCP_GOOGLE_WORKSPACE_DOMAIN || "rainbowinternationalschool.in").trim().toLowerCase();
  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    throw new Error("MCP_GOOGLE_WORKSPACE_DOMAIN must be a valid domain name.");
  }
  return domain;
}

function googleConfigured() {
  return Boolean(process.env.MCP_GOOGLE_CLIENT_ID && process.env.MCP_GOOGLE_CLIENT_SECRET);
}

function oauthError(res: Response, error: string, description?: string, status = 400) {
  return res.status(status).json({
    error,
    ...(description ? { error_description: description } : {}),
  });
}

function isPermittedRedirectUri(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
    return false;
  }
}

function isAllowedScope(value: string) {
  const scopes = value.trim().split(/\s+/).filter(Boolean);
  return scopes.length === 1 && scopes[0] === MCP_SCOPE;
}

function emailDomain(email: string) {
  const separator = email.lastIndexOf("@");
  return separator > 0 ? email.slice(separator + 1) : "";
}

function enforceRegistrationRateLimit(req: Request, res: Response) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const window = registrationWindows.get(key);
  if (!window || now - window.startedAt >= 60 * 60_000) {
    registrationWindows.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (window.count >= MAX_REGISTRATIONS_PER_HOUR) {
    res.setHeader("Retry-After", "3600");
    oauthError(res, "slow_down", undefined, 429);
    return false;
  }
  window.count += 1;
  return true;
}

function cleanupExpiredOAuthRecords() {
  const now = new Date();
  return Promise.all([
    db.delete(mcpOauthAuthorizationRequests).where(lt(mcpOauthAuthorizationRequests.expiresAt, now)),
    db.delete(mcpOauthAuthorizationCodes).where(lt(mcpOauthAuthorizationCodes.expiresAt, now)),
    db.delete(mcpOauthAccessTokens).where(lt(mcpOauthAccessTokens.expiresAt, now)),
    db.delete(mcpOauthRefreshTokens).where(lt(mcpOauthRefreshTokens.expiresAt, now)),
  ]).catch((error) => console.error("[mcp-oauth] expired record cleanup failed", error));
}

function redirectWithOAuthResult(
  redirectUri: string,
  values: { code?: string; state?: string | null; error?: string },
) {
  const url = new URL(redirectUri);
  if (values.code) url.searchParams.set("code", values.code);
  if (values.error) url.searchParams.set("error", values.error);
  if (values.state) url.searchParams.set("state", values.state);
  return url.toString();
}

async function issueTokenPair(
  input: { clientId: string; principal: string; scope: string },
  executor: any = db,
) {
  const accessToken = randomToken();
  const refreshToken = randomToken();
  const now = Date.now();
  await executor.insert(mcpOauthAccessTokens).values({
    tokenHash: sha256(accessToken),
    clientId: input.clientId,
    principal: input.principal,
    scope: input.scope,
    expiresAt: new Date(now + ACCESS_TOKEN_TTL_MS),
  });
  await executor.insert(mcpOauthRefreshTokens).values({
    tokenHash: sha256(refreshToken),
    clientId: input.clientId,
    principal: input.principal,
    scope: input.scope,
    expiresAt: new Date(now + REFRESH_TOKEN_TTL_MS),
  });
  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_MS / 1000,
    refresh_token: refreshToken,
    scope: input.scope,
  };
}

export async function authenticateMcpBearer(provided: string): Promise<McpAuthPrincipal | null> {
  const adminToken = process.env.MCP_ADMIN_TOKEN;
  if (adminToken && provided.length === adminToken.length) {
    try {
      if (timingSafeEqual(Buffer.from(provided), Buffer.from(adminToken))) {
        return { auditPrincipal: "mcp-bearer", idempotencyPrincipal: "mcp-bearer" };
      }
    } catch {
      // Invalid byte conversion is treated as an unauthenticated request.
    }
  }

  if (!provided) return null;
  const [token] = await db.select().from(mcpOauthAccessTokens).where(and(
    eq(mcpOauthAccessTokens.tokenHash, sha256(provided)),
    isNull(mcpOauthAccessTokens.revokedAt),
    gt(mcpOauthAccessTokens.expiresAt, new Date()),
  )).limit(1);
  if (!token) return null;

  const label = createHash("sha256").update(token.principal).digest("hex").slice(0, 12);
  return {
    auditPrincipal: `google-workspace:${label}`,
    idempotencyPrincipal: `google-workspace:${label}`,
  };
}

export function registerMcpOAuthRoutes(app: Express) {
  app.get("/.well-known/oauth-protected-resource/mcp", (req, res) => {
    const origin = publicOrigin(req);
    res.set("Cache-Control", "no-store");
    res.json({
      resource: `${origin}/mcp`,
      authorization_servers: [origin],
      scopes_supported: [MCP_SCOPE],
      bearer_methods_supported: ["header"],
    });
  });

  app.get("/.well-known/oauth-authorization-server", (req, res) => {
    const origin = publicOrigin(req);
    res.set("Cache-Control", "no-store");
    res.json({
      issuer: origin,
      authorization_endpoint: `${origin}/oauth/authorize`,
      token_endpoint: `${origin}/oauth/token`,
      registration_endpoint: `${origin}/oauth/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      token_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"],
      scopes_supported: [MCP_SCOPE],
    });
  });

  app.post("/oauth/register", express.json({ limit: "16kb" }), async (req, res) => {
    if (!enforceRegistrationRateLimit(req, res)) return;
    void cleanupExpiredOAuthRecords();
    const redirectUris = Array.isArray(req.body?.redirect_uris) ? req.body.redirect_uris : [];
    if (
      redirectUris.length === 0
      || redirectUris.length > 10
      || !redirectUris.every((uri: unknown) => typeof uri === "string" && isPermittedRedirectUri(uri))
      || (req.body?.token_endpoint_auth_method && req.body.token_endpoint_auth_method !== "none")
    ) {
      return oauthError(res, "invalid_client_metadata");
    }

    const clientId = randomUUID();
    await db.insert(mcpOauthClients).values({
      clientId,
      clientName: typeof req.body?.client_name === "string" ? req.body.client_name.slice(0, 200) : null,
      redirectUris,
      tokenEndpointAuthMethod: "none",
      scope: MCP_SCOPE,
    });
    res.status(201).json({
      client_id: clientId,
      client_name: typeof req.body?.client_name === "string" ? req.body.client_name.slice(0, 200) : undefined,
      redirect_uris: redirectUris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: MCP_SCOPE,
    });
  });

  app.get("/oauth/authorize", async (req, res) => {
    const responseType = typeof req.query.response_type === "string" ? req.query.response_type : "";
    const clientId = typeof req.query.client_id === "string" ? req.query.client_id : "";
    const redirectUri = typeof req.query.redirect_uri === "string" ? req.query.redirect_uri : "";
    const codeChallenge = typeof req.query.code_challenge === "string" ? req.query.code_challenge : "";
    const codeChallengeMethod = typeof req.query.code_challenge_method === "string" ? req.query.code_challenge_method : "";
    const scope = typeof req.query.scope === "string" ? req.query.scope : MCP_SCOPE;
    const clientState = typeof req.query.state === "string" ? req.query.state : null;
    if (
      responseType !== "code"
      || !clientId
      || !redirectUri
      || codeChallengeMethod !== "S256"
      || !PKCE_S256_CHALLENGE_PATTERN.test(codeChallenge)
    ) {
      return oauthError(res, "invalid_request");
    }
    if (!isAllowedScope(scope)) return oauthError(res, "invalid_scope");
    if (!googleConfigured()) return oauthError(res, "temporarily_unavailable");

    const [client] = await db.select().from(mcpOauthClients)
      .where(eq(mcpOauthClients.clientId, clientId)).limit(1);
    if (!client || client.tokenEndpointAuthMethod !== "none" || !client.redirectUris.includes(redirectUri)) {
      return oauthError(res, "invalid_client");
    }

    void cleanupExpiredOAuthRecords();
    const state = randomToken();
    await db.insert(mcpOauthAuthorizationRequests).values({
      id: state,
      clientId,
      redirectUri,
      clientState,
      codeChallenge,
      scope: MCP_SCOPE,
      expiresAt: new Date(Date.now() + AUTHORIZATION_REQUEST_TTL_MS),
    });

    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleUrl.searchParams.set("client_id", process.env.MCP_GOOGLE_CLIENT_ID!);
    googleUrl.searchParams.set("redirect_uri", googleCallbackUrl(req));
    googleUrl.searchParams.set("response_type", "code");
    googleUrl.searchParams.set("scope", GOOGLE_SCOPES);
    googleUrl.searchParams.set("state", state);
    googleUrl.searchParams.set("hd", workspaceDomain());
    googleUrl.searchParams.set("prompt", "select_account");
    res.redirect(302, googleUrl.toString());
  });

  app.get("/oauth/google/callback", async (req, res) => {
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const [request] = await db.select().from(mcpOauthAuthorizationRequests)
      .where(eq(mcpOauthAuthorizationRequests.id, state)).limit(1);
    if (!request || request.expiresAt < new Date()) return oauthError(res, "invalid_request");

    const fail = async () => {
      await db.delete(mcpOauthAuthorizationRequests)
        .where(eq(mcpOauthAuthorizationRequests.id, request.id));
      res.redirect(302, redirectWithOAuthResult(request.redirectUri, {
        error: "access_denied",
        state: request.clientState,
      }));
    };

    if (typeof req.query.error === "string" || typeof req.query.code !== "string") {
      await fail();
      return;
    }

    try {
      const form = new URLSearchParams({
        code: req.query.code,
        client_id: process.env.MCP_GOOGLE_CLIENT_ID!,
        client_secret: process.env.MCP_GOOGLE_CLIENT_SECRET!,
        redirect_uri: googleCallbackUrl(req),
        grant_type: "authorization_code",
      });
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      const tokenData = await tokenResponse.json() as { access_token?: string };
      if (!tokenResponse.ok || !tokenData.access_token) {
        await fail();
        return;
      }

      const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileResponse.json() as { email?: string; email_verified?: boolean };
      const email = profile.email?.trim().toLowerCase();
      if (
        !profileResponse.ok
        || profile.email_verified !== true
        || !email
        || emailDomain(email) !== workspaceDomain()
      ) {
        await fail();
        return;
      }

      const authorizationCode = randomToken();
      await db.insert(mcpOauthAuthorizationCodes).values({
        codeHash: sha256(authorizationCode),
        clientId: request.clientId,
        redirectUri: request.redirectUri,
        codeChallenge: request.codeChallenge,
        principal: email,
        scope: request.scope,
        expiresAt: new Date(Date.now() + AUTHORIZATION_CODE_TTL_MS),
      });
      await db.delete(mcpOauthAuthorizationRequests)
        .where(eq(mcpOauthAuthorizationRequests.id, request.id));
      res.redirect(302, redirectWithOAuthResult(request.redirectUri, {
        code: authorizationCode,
        state: request.clientState,
      }));
    } catch {
      await fail();
    }
  });

  app.post("/oauth/token", express.urlencoded({ extended: false, limit: "16kb" }), async (req, res) => {
    const grantType = typeof req.body?.grant_type === "string" ? req.body.grant_type : "";
    const clientId = typeof req.body?.client_id === "string" ? req.body.client_id : "";
    if (!clientId) return oauthError(res, "invalid_request");
    const [client] = await db.select().from(mcpOauthClients)
      .where(eq(mcpOauthClients.clientId, clientId)).limit(1);
    if (!client || client.tokenEndpointAuthMethod !== "none") return oauthError(res, "invalid_client");
    void cleanupExpiredOAuthRecords();

    if (grantType === "authorization_code") {
      const code = typeof req.body?.code === "string" ? req.body.code : "";
      const redirectUri = typeof req.body?.redirect_uri === "string" ? req.body.redirect_uri : "";
      const verifier = typeof req.body?.code_verifier === "string" ? req.body.code_verifier : "";
      if (!code || !redirectUri || !verifier || !PKCE_VERIFIER_PATTERN.test(verifier)) {
        return oauthError(res, "invalid_request");
      }

      const result = await db.transaction(async (tx) => {
        const [record] = await tx.select().from(mcpOauthAuthorizationCodes).where(and(
          eq(mcpOauthAuthorizationCodes.codeHash, sha256(code)),
          eq(mcpOauthAuthorizationCodes.clientId, clientId),
          eq(mcpOauthAuthorizationCodes.redirectUri, redirectUri),
          isNull(mcpOauthAuthorizationCodes.usedAt),
          gt(mcpOauthAuthorizationCodes.expiresAt, new Date()),
        )).limit(1);
        if (!record || pkceChallenge(verifier) !== record.codeChallenge) return null;
        const [redeemed] = await tx.update(mcpOauthAuthorizationCodes)
          .set({ usedAt: new Date() })
          .where(and(
            eq(mcpOauthAuthorizationCodes.codeHash, record.codeHash),
            isNull(mcpOauthAuthorizationCodes.usedAt),
          ))
          .returning();
        if (!redeemed) return null;
        return issueTokenPair({
          clientId: record.clientId,
          principal: record.principal,
          scope: record.scope,
        }, tx);
      });
      if (!result) return oauthError(res, "invalid_grant");
      return res.json(result);
    }

    if (grantType === "refresh_token") {
      const refreshToken = typeof req.body?.refresh_token === "string" ? req.body.refresh_token : "";
      if (!refreshToken) return oauthError(res, "invalid_request");
      const result = await db.transaction(async (tx) => {
        const [record] = await tx.select().from(mcpOauthRefreshTokens).where(and(
          eq(mcpOauthRefreshTokens.tokenHash, sha256(refreshToken)),
          eq(mcpOauthRefreshTokens.clientId, clientId),
          isNull(mcpOauthRefreshTokens.revokedAt),
          gt(mcpOauthRefreshTokens.expiresAt, new Date()),
        )).limit(1);
        if (!record) return null;
        const [redeemed] = await tx.update(mcpOauthRefreshTokens)
          .set({ revokedAt: new Date() })
          .where(and(
            eq(mcpOauthRefreshTokens.tokenHash, record.tokenHash),
            isNull(mcpOauthRefreshTokens.revokedAt),
          ))
          .returning();
        if (!redeemed) return null;
        return issueTokenPair({
          clientId: record.clientId,
          principal: record.principal,
          scope: record.scope,
        }, tx);
      });
      if (!result) return oauthError(res, "invalid_grant");
      return res.json(result);
    }

    return oauthError(res, "unsupported_grant_type");
  });
}