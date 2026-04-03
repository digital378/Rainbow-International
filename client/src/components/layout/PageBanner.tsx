import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

interface PageBannerProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  bgImage?: string;
}

export function PageBanner({ title, subtitle, breadcrumb, bgImage }: PageBannerProps) {
  return (
    <div
      className="relative py-24 md:py-28 text-white overflow-hidden"
      style={bgImage ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : { background: "linear-gradient(135deg, #091a4f 0%, #0d3b86 60%, #091a4f 100%)" }}
    >
      {bgImage && (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(9,26,79,0.92) 0%, rgba(13,59,134,0.82) 50%, rgba(9,26,79,0.88) 100%)" }} />
      )}
      <div className="relative container mx-auto px-4">
        {breadcrumb && (
          <nav className="flex items-center gap-1.5 text-white/50 text-sm mb-5 flex-wrap">
            <Link href="/" className="hover:text-amber-400 transition-colors">Rainbow International</Link>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={14} />
                {item.href ? (
                  <Link href={item.href} className="hover:text-amber-400 transition-colors">{item.label}</Link>
                ) : (
                  <span className="text-white/90">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-4xl md:text-5xl font-black mb-3 text-white tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-lg text-white/70 max-w-2xl font-normal leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
}
