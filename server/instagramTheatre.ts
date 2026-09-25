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
};

let cached: { reels: Reel[]; expires: number } | null = null;
let pending: Promise<Reel[]> | null = null;

function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function toReels(media: InstagramMedia[]): Reel[] {
  return media.flatMap((item) => {
    const videoUrl = httpsUrl(item.media_url);
    if (!item.id || item.media_type !== "VIDEO" || item.media_product_type !== "REELS" || !videoUrl) return [];
    const title = item.caption?.trim().split("\n")[0]?.slice(0, 100) || "A moment at Rainbow";
    return [{
      id: item.id,
      title,
      videoUrl,
      thumbnailUrl: httpsUrl(item.thumbnail_url),
    }];
  }).slice(0, 12);
}

async function fetchReels(): Promise<Reel[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error("Instagram feed is not configured");

  // Keep the credential out of URLs and browser responses.
  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set("fields", "id,caption,media_type,media_product_type,media_url,thumbnail_url");
  url.searchParams.set("limit", "50");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error("Instagram feed is temporarily unavailable");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("data" in body) || !Array.isArray(body.data)) {
    throw new Error("Instagram feed is temporarily unavailable");
  }
  const reels = toReels(body.data as InstagramMedia[]);
  cached = { reels, expires: Date.now() + 5 * 60_000 };
  return reels;
}

export function registerInstagramTheatre(app: Express) {
  app.get("/api/instagram/theatre", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      if (cached && cached.expires > Date.now()) return res.json({ reels: cached.reels });
      pending ??= fetchReels().finally(() => { pending = null; });
      return res.json({ reels: await pending });
    } catch {
      return res.status(503).json({ error: "The Instagram videos are unavailable right now. Please try again shortly." });
    }
  });
}