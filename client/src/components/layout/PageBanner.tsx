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
      className="relative py-20 bg-primary text-white overflow-hidden"
      style={bgImage ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : undefined}
    >
      {bgImage && <div className="absolute inset-0 bg-primary/80" />}
      <div className="relative container mx-auto px-4">
        {breadcrumb && (
          <nav className="flex items-center gap-1.5 text-white/60 text-sm mb-4 flex-wrap">
            <Link href="/" className="hover:text-secondary transition-colors">Rainbow International</Link>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={14} />
                {item.href ? (
                  <Link href={item.href} className="hover:text-secondary transition-colors">{item.label}</Link>
                ) : (
                  <span className="text-white">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-4xl md:text-5xl font-serif font-black mb-3 text-white">{title}</h1>
        {subtitle && <p className="text-xl text-white/80 max-w-2xl font-sans font-normal">{subtitle}</p>}
      </div>
    </div>
  );
}
