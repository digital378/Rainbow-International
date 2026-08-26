import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";

const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT = 5;
const IP_CHALLENGE_THRESHOLD = 4;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_LIMIT = 2;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const CHALLENGE_DIFFICULTY = 3;

export type InquiryProtectionInput = {
  ipAddress: string;
  parentName: string;
  studentName: string;
  phone: string;
  email?: string | null;
  grade: string;
  honeypot?: unknown;
  formStartedAt?: unknown;
  challengeToken?: unknown;
  challengeAnswer?: unknown;
};

export type InquiryProtectionResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "honeypot" | "too_fast" | "rate_limited" | "duplicate" | "challenge_required" | "challenge_unavailable";
      challenge?: InquiryChallenge;
    };

export type InquiryChallenge = {
  token: string;
  expiresAt: number;
  difficulty: number;
};

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function asTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d{10,13}$/.test(value)) {
    const parsed = Number(value);
    return parsed < 10_000_000_000 ? parsed * 1000 : parsed;
  }
  return null;
}

function normalizeContact(input: InquiryProtectionInput): string {
  return [
    input.phone.replace(/\D/g, ""),
    (input.email || "").trim().toLowerCase(),
  ].join("|");
}

async function consumeBucket(key: string, limit: number, windowMs: number): Promise<number> {
  const result = await db.execute(sql`
    INSERT INTO inquiry_abuse_buckets (bucket_key, window_started_at, request_count, updated_at)
    VALUES (${key}, now(), 1, now())
    ON CONFLICT (bucket_key) DO UPDATE
      SET request_count = CASE
        WHEN inquiry_abuse_buckets.window_started_at <= now() - (${windowMs} * interval '1 millisecond')
          THEN 1
        ELSE inquiry_abuse_buckets.request_count + 1
      END,
      window_started_at = CASE
        WHEN inquiry_abuse_buckets.window_started_at <= now() - (${windowMs} * interval '1 millisecond')
          THEN now()
        ELSE inquiry_abuse_buckets.window_started_at
      END,
      updated_at = now()
    RETURNING request_count
  `);
  const count = Number((result.rows[0] as { request_count?: number | string } | undefined)?.request_count ?? limit + 1);
  return count;
}

function challengeSecret(): string | null {
  return process.env.INQUIRY_CHALLENGE_SECRET || process.env.SESSION_SECRET || null;
}

function encodeChallengePayload(payload: string): string {
  return Buffer.from(payload, "utf8").toString("base64url");
}

function decodeChallengePayload(payload: string): string | null {
  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function issueInquiryChallenge(ipAddress: string): InquiryChallenge | null {
  const secret = challengeSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  const nonce = randomBytes(18).toString("base64url");
  const payload = [
    nonce,
    expiresAt,
    CHALLENGE_DIFFICULTY,
    digest(ipAddress || "unknown"),
  ].join(".");
  const encodedPayload = encodeChallengePayload(payload);
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt,
    difficulty: CHALLENGE_DIFFICULTY,
  };
}

export function verifyInquiryChallenge(
  ipAddress: string,
  token: unknown,
  answer: unknown,
  now = Date.now(),
): boolean {
  const secret = challengeSecret();
  if (!secret || typeof token !== "string" || typeof answer !== "string") return false;
  if (!/^\d{1,12}$/.test(answer)) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const encodedPayload = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  const expectedSignature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;

  const payload = decodeChallengePayload(encodedPayload);
  if (!payload) return false;
  const [nonce, expiresAtValue, difficultyValue, ipDigest] = payload.split(".");
  const expiresAt = Number(expiresAtValue);
  const difficulty = Number(difficultyValue);
  if (
    !nonce ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt < now ||
    expiresAt > now + CHALLENGE_TTL_MS ||
    difficulty !== CHALLENGE_DIFFICULTY ||
    ipDigest !== digest(ipAddress || "unknown")
  ) {
    return false;
  }

  const proof = createHash("sha256").update(`${token}:${answer}`).digest("hex");
  return proof.startsWith("0".repeat(difficulty));
}

export async function checkInquiryProtection(
  input: InquiryProtectionInput,
): Promise<InquiryProtectionResult> {
  if (typeof input.honeypot === "string" && input.honeypot.trim() !== "") {
    return { allowed: false, reason: "honeypot" };
  }

  const startedAt = asTimestamp(input.formStartedAt);
  if (startedAt !== null && Date.now() - startedAt < 2_000) {
    return { allowed: false, reason: "too_fast" };
  }

  const ipKey = `ip:${digest(input.ipAddress || "unknown")}`;
  const requestCount = await consumeBucket(ipKey, IP_LIMIT, IP_WINDOW_MS);
  if (requestCount > IP_LIMIT) {
    return { allowed: false, reason: "rate_limited" };
  }

  // Do not make every parent solve a challenge. Once an IP reaches the normal
  // traffic threshold, require a short-lived proof that can only be verified
  // by this server. The bucket is still consumed atomically, so probes cannot
  // bypass this by spreading requests across app processes.
  if (requestCount >= IP_CHALLENGE_THRESHOLD) {
    if (!verifyInquiryChallenge(input.ipAddress, input.challengeToken, input.challengeAnswer)) {
      const challenge = issueInquiryChallenge(input.ipAddress);
      return challenge
        ? { allowed: false, reason: "challenge_required", challenge }
        : { allowed: false, reason: "challenge_unavailable" };
    }
  }

  const contactKey = `contact:${digest(normalizeContact(input))}`;
  if (!(await consumeBucket(contactKey, CONTACT_LIMIT, CONTACT_WINDOW_MS))) {
    return { allowed: false, reason: "rate_limited" };
  }

  const duplicate = await db.execute(sql`
    SELECT 1
    FROM inquiries
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') =
        regexp_replace(${input.phone}, '[^0-9]', '', 'g')
      AND (
        (${input.email || ""} <> "" AND lower(trim(coalesce(email, ''))) = lower(trim(${input.email || ""})))
        OR (${input.email || ""} = '' AND coalesce(email, '') = '')
      )
      AND created_at >= now() - (${DUPLICATE_WINDOW_MS} * interval '1 millisecond')
    LIMIT 1
  `);
  if (duplicate.rows.length > 0) {
    return { allowed: false, reason: "duplicate" };
  }

  return { allowed: true };
}