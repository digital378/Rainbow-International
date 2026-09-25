import type { Express } from "express";

type InstagramMedia = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
};

type Reel = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  isFeatured: boolean;
};

type TheatreFeed = { reels: Reel[]; featuredUnavailable: boolean };
const FEATURED_REEL = "DM2j_ZxoBMl";
const PAGE_SIZE = 50;
const MAX_PAGES = 20;
const CACHE_MS = 5 * 60_000;

let cached: { feed: TheatreFeed; expires: number } | null = null;
let pending: Promise<TheatreFeed> | null = null;

function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function reelShortcode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.hostname !== "www.instagram.com" && url.hostname !== "instagram.com") return null;
    return /^\/reel\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

function toReels(media: InstagramMedia[]): TheatreFeed {
  const seen = new Set<string>();
  let featuredFound = false;
  const reels = media.flatMap((item) => {
    const videoUrl = httpsUrl(item.media_url);
    if (!item.id || seen.has(item.id) || item.media_type !== "VIDEO" || item.media_product_type !== "REELS" || !videoUrl) return [];
    seen.add(item.id);
    const title = item.caption?.trim().split("\n")[0]?.slice(0, 100) || "A moment at Rainbow";
    const isFeatured = reelShortcode(item.permalink) === FEATURED_REEL;
    if (isFeatured) featuredFound = true;
    return [{
      id: item.id,
      title,
      videoUrl,
      thumbnailUrl: httpsUrl(item.thumbnail_url),
      isFeatured,
    }];
  });
  reels.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  return { reels, featuredUnavailable: !featuredFound };
}

async function fetchReels(): Promise<TheatreFeed> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error("Instagram feed is not configured");

  const media: InstagramMedia[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    // Build each page's URL ourselves. Pagination links can contain credentials.
    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.set("fields", "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink");
    url.searchParams.set("limit", String(PAGE_SIZE));
    if (cursor) url.searchParams.set("after", cursor);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) throw new Error("Instagram feed is temporarily unavailable");
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("data" in body) || !Array.isArray(body.data)) {
      throw new Error("Instagram feed is temporarily unavailable");
    }
    media.push(...(body.data as InstagramMedia[]));
    const paging = "paging" in body ? body.paging as { next?: string; cursors?: { after?: string } } | undefined : undefined;
    if (!paging?.next) {
      const feed = toReels(media);
      cached = { feed, expires: Date.now() + CACHE_MS };
      return feed;
    }
    const nextCursor = paging.cursors?.after;
    if (!nextCursor || nextCursor.length > 1024 || seenCursors.has(nextCursor)) {
      throw new Error("Instagram pagination could not be completed");
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }
  // Do not silently present a truncated playlist as the full account feed.
  throw new Error("Instagram feed is larger than the supported page limit");
}

export function registerInstagramTheatre(app: Express) {
  app.get("/api/instagram/theatre", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      if (cached && cached.expires > Date.now()) return res.json(cached.feed);
      pending ??= fetchReels().finally(() => { pending = null; });
      return res.json(await pending);
    } catch {
      return res.status(503).json({ error: "The Instagram videos are unavailable right now. Please try again shortly." });
    }
  });
}