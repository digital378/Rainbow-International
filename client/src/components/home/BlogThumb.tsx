import { useState } from "react";

interface BlogThumbProps {
  src?: string | null;
  alt: string;
  cat: string;
}

export function BlogThumb({ src, alt, cat }: BlogThumbProps) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center"
        style={{ background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 100%)" }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fbbf24" }}
        >
          {cat}
        </span>
        <span className="text-white font-black text-sm leading-tight">
          Rainbow International School
        </span>
        <span className="text-white/50 text-xs">Thane, Maharashtra</span>
      </div>
    );
  }

  return (
    <img
      src={src!}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setFailed(true)}
    />
  );
}
