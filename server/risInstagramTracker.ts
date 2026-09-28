import { google } from "googleapis";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { getGoogleRefreshToken } from "./googleCredentials";
import {
  findTrackerTargets, istDay, shiftDay, writableFields, type Snapshot,
} from "./risInstagramTrackerCore";

const SPREADSHEET_ID = "1gzMAO-RyVFfz5hqANr8JApu-M6LwAftMyXnZD8_kjMw";
const TAB = "Aryaan";
const ACCOUNT = "rainbowinternationalschool";
const PREFIX = "[ris-instagram]";
let started = false;
let running = false;
let lastAttempt = 0;
const leaseOwner = randomUUID();

type Media = { id: string; timestamp: string; media_type: string };

async function instagramGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error("RIS Instagram credential unavailable");
  const url = new URL(`https://graph.instagram.com/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Instagram request failed (${response.status})`);
  return await response.json() as T;
}

async function capture(day: string): Promise<Snapshot> {
  const profile = await instagramGet<{ username?: string }>("me", { fields: "username" });
  if (profile.username?.toLowerCase() !== ACCOUNT) throw new Error("Instagram credential is not for RIS");
  const media: Media[] = [];
  let cursor: string | undefined;
  const seen = new Set<string>();
  for (let page = 0; page < 30; page++) {
    const result = await instagramGet<{
      data?: Media[];
      paging?: { next?: string; cursors?: { after?: string } };
    }>("me/media", {
      fields: "id,timestamp,media_type", limit: "100", ...(cursor ? { after: cursor } : {}),
    });
    if (!Array.isArray(result.data)) throw new Error("Instagram media list is incomplete");
    for (const item of result.data) {
      if (!item.id || !item.timestamp || !item.media_type) throw new Error("Invalid Instagram media");
      if (istDay(new Date(item.timestamp)) === day && item.media_type !== "STORY") media.push(item);
    }
    // Instagram returns newest first. Do not treat a truncated list as a verified zero.
    if (result.data.some(item => istDay(new Date(item.timestamp)) < day) || !result.paging?.next) {
      if (result.paging?.next && !result.data.some(item => istDay(new Date(item.timestamp)) < day)) {
        throw new Error("Instagram media pagination ended before target date");
      }
      const seenIds = new Set<string>();
      let views = 0;
      for (const item of media) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        const insight = await instagramGet<{ data?: { name?: string; values?: { value?: number }[]; total_value?: { value?: number } }[] }>(
          `${item.id}/insights`, { metric: "views" },
        );
        const metric = insight.data?.find(entry => entry.name === "views");
        const value = metric?.total_value?.value ?? metric?.values?.[0]?.value;
        if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error("Post views unavailable; snapshot pending");
        views += value as number;
      }
      return { day, posts: seenIds.size, views };
    }
    const next = result.paging?.cursors?.after;
    if (!next || seen.has(next)) throw new Error("Instagram pagination could not be completed");
    seen.add(next);
    cursor = next;
  }
  throw new Error("Instagram media history exceeds pagination limit");
}

export async function initializeRisInstagramTracker(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ris_instagram_snapshots (
      day date PRIMARY KEY,
      posts integer NOT NULL CHECK (posts >= 0),
      views integer NOT NULL CHECK (views >= 0),
      captured_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ris_instagram_lease (
      name text PRIMARY KEY,
      owner text NOT NULL,
      expires_at timestamptz NOT NULL
    )
  `);
  await db.execute(sql`ALTER TABLE ris_instagram_lease ADD COLUMN IF NOT EXISTS owner text`);
}

async function acquireLease(): Promise<boolean> {
  const claim = await db.execute(sql`
    INSERT INTO ris_instagram_lease (name, owner, expires_at)
    VALUES ('aryaan', ${leaseOwner}, now() + interval '20 minutes')
    ON CONFLICT (name) DO UPDATE SET owner = EXCLUDED.owner, expires_at = EXCLUDED.expires_at
    WHERE ris_instagram_lease.expires_at < now()
    RETURNING name
  `);
  return claim.rows.length === 1;
}

async function releaseLease() {
  await db.execute(sql`
    UPDATE ris_instagram_lease SET expires_at = now()
    WHERE name = 'aryaan' AND owner = ${leaseOwner}
  `);
}

function sheetClient() {
  const token = getGoogleRefreshToken();
  if (!token || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google Sheets write credentials unavailable");
  }
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: token });
  return google.sheets({ version: "v4", auth });
}

async function reconcile(snapshots: Snapshot[]): Promise<void> {
  const sheets = sheetClient();
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: [`'${TAB}'!A:E`],
    valueRenderOption: "FORMULA",
    dateTimeRenderOption: "SERIAL_NUMBER",
  });
  const rows = response.data.valueRanges?.[0]?.values ?? [];
  if (rows[0]?.[0] !== "Date" || rows[0]?.[1] !== "Branch" ||
      rows[0]?.[3] !== "Reels/Posts Published" ||
      String(rows[1]?.[4] ?? "").trim() !== "Total Views") {
    throw new Error("Aryaan tracker columns changed; no cells written");
  }
  const targets = findTrackerTargets(rows, snapshots);
  const writes: { range: string; values: number[][] }[] = [];
  for (const target of targets) {
    for (const field of writableFields(rows[target.row - 1] ?? [], target)) {
      writes.push({ range: `'${TAB}'!${field.column}${target.row}`, values: [[field.value]] });
    }
  }
  if (writes.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: "RAW", data: writes },
    });
    console.log(`${PREFIX} Updated ${writes.length} RIS-only cells`);
  }
  const missing = snapshots.filter(s => !targets.some(t => t.kind === "daily" && t.key === s.day));
  if (missing.length) console.warn(`${PREFIX} ${missing.length} daily snapshot(s) pending a matching Aryaan RIS row`);
}

async function run(): Promise<void> {
  if (!await acquireLease()) return;
  try {
    const today = istDay(new Date());
    const yesterday = shiftDay(today, -1);
    const existing = await db.execute(sql`SELECT day::text FROM ris_instagram_snapshots WHERE day = ${yesterday}::date`);
    if (!existing.rows.length) {
      const snapshot = await capture(yesterday);
      await db.execute(sql`
        INSERT INTO ris_instagram_snapshots (day, posts, views)
        VALUES (${snapshot.day}::date, ${snapshot.posts}, ${snapshot.views})
        ON CONFLICT (day) DO NOTHING
      `);
      console.log(`${PREFIX} Saved snapshot for ${yesterday}`);
    }
    const result = await db.execute(sql`
      SELECT day::text AS day, posts, views FROM ris_instagram_snapshots ORDER BY day
    `);
    await reconcile(result.rows.map(row => ({
      day: String(row.day), posts: Number(row.posts), views: Number(row.views),
    })));
  } finally {
    await releaseLease();
  }
}

/** Production only: retry pending writes, but never re-snapshot a completed day. */
export function startRisInstagramTracker(): void {
  if (started || process.env.NODE_ENV !== "production") return;
  started = true;
  const tick = async () => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date()).map(part => [part.type, part.value]));
    const hour = Number(parts.hour), minute = Number(parts.minute);
    const earlyWindow = hour === 7 && minute >= 55;
    if ((!earlyWindow && hour < 8) || running ||
        Date.now() - lastAttempt < (earlyWindow ? 60_000 : 15 * 60_000)) return;
    lastAttempt = Date.now();
    running = true;
    try { await run(); }
    catch (error) { console.error(`${PREFIX} Sync pending:`, error instanceof Error ? error.message : "unknown error"); }
    finally { running = false; }
  };
  void tick();
  setInterval(() => void tick(), 60_000).unref();
  console.log(`${PREFIX} RIS-only scheduler enabled (07:55 IST daily; pending rows retried)`);
}