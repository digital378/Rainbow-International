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
      className="relative py-24 md:py-28 overflow-hidden"
      style={bgImage ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : { background: "linear-gradient(135deg, #ffffff 0%, #f0f4ff 40%, #e8eeff 100%)" }}
    >
      {bgImage && (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(240,244,255,0.88) 50%, rgba(232,238,255,0.92) 100%)" }} />
      )}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #e2e8f0, transparent)" }} />
      <div className="relative container mx-auto px-4">
        {breadcrumb && (
          <nav className="flex items-center gap-1.5 text-sm mb-5 flex-wrap" style={{ color: "#6b7280" }}>
            <Link href="/" className="hover:text-amber-500 transition-colors">Rainbow International</Link>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={14} />
                {item.href ? (
                  <Link href={item.href} className="hover:text-amber-500 transition-colors">{item.label}</Link>
                ) : (
                  <span style={{ color: "#091a4f" }} className="font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", color: "#091a4f" }}>{title}</h1>
        {subtitle && <p className="text-lg max-w-2xl font-normal leading-relaxed" style={{ color: "#374151" }}>{subtitle}</p>}
      </div>
    </div>
  );
}
