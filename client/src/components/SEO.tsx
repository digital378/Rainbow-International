import { useEffect } from "react";
import { isProtectedSeoPath, normalizePageSchemas } from "@shared/orgSchema";

// Must match the server-side document policy in server/pageTitles.ts.
// Keeping this small client mirror lets the SEO component reset robots tags
// correctly when a visitor navigates between protected and public SPA routes.
const NOINDEX_EXACT_PATHS = new Set([
  "/admin/blog",
  "/admin/alliances/friendship",
  "/admin/ras",
  "/admin/ras/submissions",
  "/admin/walkin-2728",
  "/sales",
  "/marketing",
  "/rps-sales",
  "/declaration",
  "/marketing-27-28",
  "/sales-27-28",
  "/rps-sales-27-28",
  "/internal",
  "/alliances",
  "/thank-you",
  "/book-list",
  "/leads",
  "/overview-27-28",
]);

function isNoindexPath(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  return (
    NOINDEX_EXACT_PATHS.has(path) ||
    path.startsWith("/admin/") ||
    path.startsWith("/walkin/") ||
    path === "/walkin-ris-27-28" ||
    path.startsWith("/walkin-ris-27-28/") ||
    path === "/walkin-rps-27-28" ||
    path.startsWith("/walkin-rps-27-28/") ||
    path.startsWith("/alliances/friendship/")
  );
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "article" | "website";
  keywords?: string;
  robots?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown>;
  appendSiteName?: boolean;
}

export function SEO({ title, description, canonical, ogImage, ogType = "website", keywords, robots, breadcrumbs, jsonLd, appendSiteName = true }: SEOProps) {
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
    // Server-side route policy is authoritative for protected documents.
    // Make the same decision from the current browser path so client-side
    // navigation from a protected page back to a public route resets the tag
    // rather than carrying `noindex` forward.
    setMeta(
      "robots",
      isNoindexPath(window.location.pathname) ? "noindex,nofollow" : (robots || "index, follow"),
    );
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", ogImage || defaultImage, true);
    setMeta("og:type", ogType, true);
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

    if (!isProtectedSeoPath(window.location.pathname)) {
      const pageLd = {
        "@context": "https://schema.org",
        "@graph": normalizePageSchemas(jsonLd ? [jsonLd] : []),
      };
      // Remove server-injected scripts whose @type the client is replacing.
      // Handles both plain {"@type": X} and {"@graph": [...]} payloads.
      const clientTypes = new Set<string>();
      const collect = (node: Record<string, unknown>) => {
        const t = node["@type"];
        (Array.isArray(t) ? t : [t]).forEach(v => v && clientTypes.add(String(v)));
      };
      collect(pageLd);
      const graph = pageLd["@graph"];
      if (Array.isArray(graph)) graph.forEach(n => n && typeof n === "object" && collect(n as Record<string, unknown>));
      clientTypes.forEach(removeServerScript);

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "page");
      script.textContent = JSON.stringify(pageLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = "Rainbow International School - Excellence in Education";
      const scripts = document.querySelectorAll('script[data-seo-jsonld]');
      scripts.forEach(s => s.remove());
    };
  }, [fullTitle, description, canonical, ogImage, ogType, keywords, robots, breadcrumbs, jsonLd]);

  return null;
}
