import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";

const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_LIMIT = 2;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type InquiryProtectionInput = {
  ipAddress: string;
  parentName: string;
  studentName: string;
  phone: string;
  email?: string | null;
  grade: string;
  honeypot?: unknown;
  formStartedAt?: unknown;
};

export type InquiryProtectionResult =
  | { allowed: true }
  | { allowed: false; reason: "honeypot" | "too_fast" | "rate_limited" | "duplicate" };

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

async function consumeBucket(key: string, limit: number, windowMs: number): Promise<boolean> {
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
  return count <= limit;
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
  if (!(await consumeBucket(ipKey, IP_LIMIT, IP_WINDOW_MS))) {
    return { allowed: false, reason: "rate_limited" };
  }

  const contactKey = `contact:${digest(normalizeContact(input))}`;
  if (!(await consumeBucket(contactKey, CONTACT_LIMIT, CONTACT_WINDOW_MS))) {
    return { allowed: false, reason: "rate_limited" };
  }

  const duplicate = await db.execute(sql`
    SELECT 1
    FROM inquiries
    WHERE phone = ${input.phone}
      AND (
        (${input.email || ""} <> "" AND lower(coalesce(email, '')) = lower(${input.email || ""}))
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