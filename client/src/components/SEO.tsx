import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown>;
}

export function SEO({ title, description, canonical, ogImage, keywords, breadcrumbs, jsonLd }: SEOProps) {
  const fullTitle = title.includes("Rainbow International") ? title : `${title} | Rainbow International School`;
  const defaultImage = "https://www.rainbowinternationalschool.in/wp-content/uploads/2022/09/rainbow-international-school-awards-best-preschool-secondary-school-thane-international-school-ad.jpg";

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", ogImage || defaultImage, true);
    setMeta("og:type", "website", true);
    setMeta("og:locale", "en_IN", true);
    setMeta("og:site_name", "Rainbow International School", true);
    if (canonical) setMeta("og:url", canonical, true);
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:image", ogImage || defaultImage);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    const existingScripts = document.querySelectorAll('script[data-seo-jsonld]');
    existingScripts.forEach(s => s.remove());

    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": item.name,
          "item": item.href,
        })),
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "breadcrumb");
      script.textContent = JSON.stringify(breadcrumbLd);
      document.head.appendChild(script);
    }

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "page");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = "Rainbow International School - Excellence in Education";
      const scripts = document.querySelectorAll('script[data-seo-jsonld]');
      scripts.forEach(s => s.remove());
    };
  }, [fullTitle, description, canonical, ogImage, keywords, breadcrumbs, jsonLd]);

  return null;
}
