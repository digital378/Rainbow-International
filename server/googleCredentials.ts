import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { eq } from "drizzle-orm";
import { googleOauthCredentials } from "@shared/schema";
import { db } from "./db";

const PROVIDER = "google";
const ALGORITHM = "aes-256-gcm";
const KEY_CONTEXT = "rainbow-google-oauth-refresh-token:v1";

let initialized = false;
let activeRefreshToken: string | null = null;

function encryptionKey(): Buffer {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be configured to read encrypted Google OAuth credentials");
  }

  return createHash("sha256")
    .update(KEY_CONTEXT)
    .update("\0")
    .update(sessionSecret)
    .digest();
}

export function encryptGoogleRefreshToken(refreshToken: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(refreshToken, "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedRefreshToken: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptGoogleRefreshToken(record: {
  encryptedRefreshToken: string;
  iv: string;
  authTag: string;
}): string {
  try {
    const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(record.iv, "base64"));
    decipher.setAuthTag(Buffer.from(record.authTag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(record.encryptedRefreshToken, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("Unable to decrypt the stored Google OAuth credential");
  }
}

/**
 * Loads the encrypted token at startup. If an encrypted record exists, a
 * malformed record or absent encryption key is a fatal configuration error;
 * falling back to the plaintext legacy secret would hide a real security or
 * data-loss issue. The legacy secret remains supported only while no encrypted
 * record has been saved.
 */
export async function initializeGoogleCredentials(): Promise<void> {
  const [storedCredential] = await db
    .select()
    .from(googleOauthCredentials)
    .where(eq(googleOauthCredentials.provider, PROVIDER))
    .limit(1);

  if (storedCredential) {
    activeRefreshToken = decryptGoogleRefreshToken(storedCredential);
  } else {
    activeRefreshToken = process.env.GOOGLE_REFRESH_TOKEN || null;
  }

  initialized = true;
}

export function getGoogleRefreshToken(): string | null {
  if (!initialized) {
    // The running application always calls initializeGoogleCredentials() before
    // registering routes or starting sync workers. This narrow fallback keeps
    // isolated module tests usable without weakening the production rule: if an
    // encrypted row exists but cannot decrypt, startup throws before this
    // function can be reached.
    return process.env.GOOGLE_REFRESH_TOKEN || null;
  }
  return activeRefreshToken;
}

export async function storeGoogleRefreshToken(refreshToken: string): Promise<void> {
  if (!refreshToken) throw new Error("Cannot store an empty Google refresh token");

  const encrypted = encryptGoogleRefreshToken(refreshToken);
  await db
    .insert(googleOauthCredentials)
    .values({
      provider: PROVIDER,
      ...encrypted,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: googleOauthCredentials.provider,
      set: {
        ...encrypted,
        updatedAt: new Date(),
      },
    });

  activeRefreshToken = refreshToken;
  initialized = true;
}

export function googleOAuthSuccessPage(): string {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Google connected</title></head>
  <body style="font-family:system-ui,sans-serif;padding:2rem;background:#0f172a;color:#f8fafc">
    <h2 style="color:#22c55e">Google connected successfully</h2>
    <p>Your authorization was stored securely on the server. No credential is displayed in this browser.</p>
    <p style="color:#94a3b8;font-size:0.9rem">You can close this page.</p>
  </body>
</html>`;
}