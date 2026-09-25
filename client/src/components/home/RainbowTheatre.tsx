import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Instagram, Play, RotateCcw, Volume2 } from "lucide-react";
import "./RainbowTheatre.css";

type Reel = { id: string; title: string; videoUrl: string; thumbnailUrl: string | null; isFeatured: boolean };

const PROFILE_URL = "https://www.instagram.com/rainbowinternationalschool/";

export function RainbowTheatre() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playlistRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const [featuredUnavailable, setFeaturedUnavailable] = useState(false);
  const [visibleThumbs, setVisibleThumbs] = useState<Set<string>>(() => new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedWarning, setFeedWarning] = useState("");
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedState, setFeedState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [playerState, setPlayerState] = useState<"loading" | "playing" | "tap" | "error">("loading");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const visibleRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      setVisible(true);
      visibleRef.current = true;
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: "300px 0px", threshold: 0 });
    const playbackObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      setVisible(entry.isIntersecting);
      if (!entry.isIntersecting) videoRef.current?.pause();
    }, { threshold: 0.12 });
    observer.observe(node);
    playbackObserver.observe(node);
    return () => { observer.disconnect(); playbackObserver.disconnect(); videoRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (!near) return;
    const controller = new AbortController();
    let inFlight = false;
    const applyFeed = (data: { reels: Reel[]; featuredUnavailable: boolean }) => {
      setReels(data.reels);
      setFeaturedUnavailable(data.featuredUnavailable);
      setUnavailable([]);
      setActiveId(id => id && data.reels.some(reel => reel.id === id) ? id : data.reels[0]?.id || null);
      setFeedState("ready");
      setMessage("");
      setFeedWarning("");
      hasLoadedRef.current = true;
    };
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      if (!hasLoadedRef.current) setFeedState("loading");
      let complete = false;
      try {
        const response = await fetch("/api/instagram/theatre?first=1", { signal: controller.signal });
        if (!response.ok) throw new Error("Preview unavailable");
        const data = await response.json() as { reels: Reel[]; featuredUnavailable: boolean; complete: boolean };
        if (controller.signal.aborted) return;
        applyFeed(data);
        complete = data.complete;
      } catch {
        // The full feed can still work if the quick preview is unavailable.
      }
      if (controller.signal.aborted) return;
      setLoadingMore(!complete);
      try {
        if (!complete) {
          const response = await fetch("/api/instagram/theatre", { signal: controller.signal });
          if (!response.ok) throw new Error("Feed unavailable");
          const data = await response.json() as { reels: Reel[]; featuredUnavailable: boolean };
          if (!controller.signal.aborted) applyFeed(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          if (hasLoadedRef.current) {
            setFeedWarning("Some reels couldn't load right now. Showing the available clips.");
          } else {
            setFeedState("error");
            setMessage("We couldn't load the videos right now. Please try again.");
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoadingMore(false);
        inFlight = false;
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 5 * 60_000 + 2000);
    return () => { window.clearInterval(timer); controller.abort(); };
  }, [near, attempt]);

  const available = reels.filter(reel => !unavailable.includes(reel.id));
  const currentIndex = available.findIndex(reel => reel.id === activeId);
  const index = currentIndex >= 0 ? currentIndex : 0;
  const current = available[index];

  useEffect(() => {
    const root = playlistRef.current;
    if (!root || !available.length) return;
    if (!("IntersectionObserver" in window)) {
      setVisibleThumbs(new Set(available.map(reel => reel.id)));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      const ids = entries.filter(entry => entry.isIntersecting).map(entry => (entry.target as HTMLElement).dataset.reelId).filter((id): id is string => !!id);
      if (ids.length) setVisibleThumbs(previous => new Set([...previous, ...ids]));
    }, { root, rootMargin: "120px" });
    root.querySelectorAll("[data-reel-id]").forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [reels, unavailable]);

  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !visibleRef.current) return;
    setPlayerState("tap");
    video.muted = false;
    try {
      await video.play();
      setPlayerState("playing");
    } catch {
      setPlayerState("tap");
    }
  }, []);

  useEffect(() => {
    if (!visible || !current) return;
    void startPlayback();
  }, [visible, current?.id, startPlayback]);

  const select = (id: string) => {
    if (id === activeId) return;
    videoRef.current?.pause();
    setActiveId(id);
    setPlayerState("loading");
    setMessage("");
  };

  const onVideoError = () => {
    if (!current) return;
    setUnavailable(ids => ids.includes(current.id) ? ids : [...ids, current.id]);
    setPlayerState("error");
    setMessage("That video is temporarily unavailable. Try another clip.");
  };

  const move = (direction: number) => {
    const next = available[index + direction];
    if (next) select(next.id);
  };

  return (
    <section className="rainbow-theatre" ref={sectionRef} aria-labelledby="rainbow-theatre-title" data-testid="section-rainbow-theatre">
      <div className="rainbow-theatre__glow" aria-hidden="true" />
      <div className="rainbow-theatre__inner">
        <div className="rainbow-theatre__heading">
          <div>
            <p className="rainbow-theatre__eyebrow"><span /> A glimpse into life at RIS</p>
            <h2 id="rainbow-theatre-title">The Rainbow <em>Theatre</em></h2>
            <p>See the moments that make our campus feel like home.</p>
          </div>
          <a className="rainbow-theatre__profile" href={PROFILE_URL} target="_blank" rel="noopener noreferrer" data-testid="theatre-instagram-profile">
            <Instagram size={18} aria-hidden="true" /> Visit our Instagram <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        {feedState === "idle" || feedState === "loading" ? (
          <div className="rainbow-theatre__notice" role="status">Preparing the theatre…</div>
        ) : feedState === "error" ? (
          <div className="rainbow-theatre__notice" role="alert">
            <p>{message}</p>
            <button type="button" onClick={() => setAttempt(a => a + 1)}><RotateCcw size={16} /> Try again</button>
          </div>
        ) : !available.length ? (
          <div className="rainbow-theatre__notice" role="status">
            <p>{reels.length ? "The videos are temporarily unavailable. Please try again later." : "No playable reels are available right now. Check back soon."}</p>
            <button type="button" onClick={() => setAttempt(a => a + 1)}><RotateCcw size={16} /> Refresh videos</button>
          </div>
        ) : (
          <div className="rainbow-theatre__layout">
            <div className="rainbow-theatre__stage">
              <div className="rainbow-theatre__frame">
                <video
                  key={current.id}
                  ref={videoRef}
                  src={current.videoUrl}
                  poster={current.thumbnailUrl || undefined}
                  controls
                  playsInline
                  preload="none"
                  onPlaying={() => setPlayerState("playing")}
                  onPause={() => { if (visibleRef.current) setPlayerState("tap"); }}
                  onError={onVideoError}
                  aria-label={current.title}
                  data-testid="theatre-video"
                />
                {(playerState === "loading" || playerState === "tap") && (
                  <button type="button" className="rainbow-theatre__play" onClick={() => void startPlayback()} aria-label="Play video with sound" data-testid="theatre-play">
                    <Play size={25} fill="currentColor" /> Tap to play with sound
                  </button>
                )}
              </div>
              <div className="rainbow-theatre__stage-footer">
                <div className="rainbow-theatre__title">
                  <span>NOW SHOWING <Volume2 size={13} aria-hidden="true" /></span>
                  <p>{current.title}</p>
                </div>
                <span className="rainbow-theatre__count" aria-live="polite">{String(index + 1).padStart(2, "0")} / {String(available.length).padStart(2, "0")}</span>
              </div>
              {message && <p className="rainbow-theatre__warning" role="status">{message}</p>}
              <div className="rainbow-theatre__navigation">
                <button type="button" disabled={index === 0} onClick={() => move(-1)} data-testid="theatre-previous"><ArrowLeft size={17} /> Previous</button>
                <button type="button" disabled={index === available.length - 1} onClick={() => move(1)} data-testid="theatre-next">Next <ArrowRight size={17} /></button>
              </div>
            </div>
            <div className="rainbow-theatre__queue">
              <div className="rainbow-theatre__queue-head"><span>THE REEL PLAYLIST</span><span>{available.length} films</span></div>
              {(featuredUnavailable || !available.some(reel => reel.isFeatured)) && (
                <p className="rainbow-theatre__queue-warning" role="status">The featured reel is not available to play here right now.</p>
              )}
              {feedWarning && <p className="rainbow-theatre__queue-warning" role="status">{feedWarning}</p>}
              {loadingMore && <p className="rainbow-theatre__queue-note" role="status">Loading more reels…</p>}
              <div className="rainbow-theatre__playlist" ref={playlistRef} aria-label="Choose a video to play">
                {available.map((reel, i) => (
                  <button
                    key={reel.id}
                    type="button"
                    className={`rainbow-theatre__reel ${current.id === reel.id ? "is-active" : ""}`}
                    onClick={() => select(reel.id)}
                    aria-current={current.id === reel.id ? "true" : undefined}
                    data-reel-id={reel.id}
                    data-testid={`theatre-reel-${i}`}
                  >
                    <span className="rainbow-theatre__thumb">
                      {reel.thumbnailUrl && visibleThumbs.has(reel.id) ? <img src={reel.thumbnailUrl} alt="" loading="lazy" decoding="async" /> : <Play size={20} aria-hidden="true" />}
                    </span>
                    <span className="rainbow-theatre__reel-copy"><small>{reel.isFeatured ? "FEATURED REEL" : `FILM ${String(i + 1).padStart(2, "0")}`}</small><strong>{reel.title}</strong></span>
                    <Play size={15} className="rainbow-theatre__reel-play" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <p className="rainbow-theatre__queue-note">Real moments from the Rainbow community.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}