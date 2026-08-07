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
  robots?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown>;
  appendSiteName?: boolean;
}

export function SEO({ title, description, canonical, ogImage, keywords, robots, breadcrumbs, jsonLd, appendSiteName = true }: SEOProps) {
  const fullTitle = !appendSiteName || title.includes("Rainbow International") ? title : `${title} | Rainbow International School`;
  const defaultImage = "https://rainbowinternationalschool.in/opengraph.jpg";

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
    setMeta("robots", robots || "index, follow");
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

    // The server injects JSON-LD into the raw HTML (tagged with
    // data-seo-server-jsonld="<@type>"). When this component is about to add
    // the same schema type client-side, remove the server copy first so
    // JS-rendering crawlers never see duplicate BreadcrumbList/FAQPage/etc.
    // Server types we don't replace (e.g. EducationalOrganization) stay.
    const removeServerScript = (type: string) => {
      document
        .querySelectorAll(`script[data-seo-server-jsonld="${type}"]`)
        .forEach(s => s.remove());
    };

    if (breadcrumbs && breadcrumbs.length > 0) {
      removeServerScript("BreadcrumbList");
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
      // Remove server-injected scripts whose @type the client is replacing.
      // Handles both plain {"@type": X} and {"@graph": [...]} payloads.
      const clientTypes = new Set<string>();
      const collect = (node: Record<string, unknown>) => {
        const t = node["@type"];
        (Array.isArray(t) ? t : [t]).forEach(v => v && clientTypes.add(String(v)));
      };
      collect(jsonLd);
      const graph = jsonLd["@graph"];
      if (Array.isArray(graph)) graph.forEach(n => n && typeof n === "object" && collect(n as Record<string, unknown>));
      clientTypes.forEach(removeServerScript);

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
  }, [fullTitle, description, canonical, ogImage, keywords, robots, breadcrumbs, jsonLd]);

  return null;
}
