export const ORG_ID = "https://rainbowinternationalschool.in/#organization";
export const WEBSITE_ID = "https://rainbowinternationalschool.in/#website";

export function isProtectedSeoPath(path: string) {
  return /^\/(?:admin|sales|marketing|internal|alliances|rps-sales|declaration|leads|api|mcp|auth)(?:\/|$)/i.test(path)
    || /walk-?in/i.test(path);
}

export function buildOrgNode() {
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "School"],
    "@id": ORG_ID,
    name: "Rainbow International School",
    url: "https://rainbowinternationalschool.in/",
    logo: "https://rainbowinternationalschool.in/ris-logo.png",
    telephone: "+91-82915-68972",
    email: "admin@rainbowinternationalschool.in",
    foundingDate: "2009-04",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Cosmos Arcade, Brahmand Phase 4",
      addressLocality: "Thane West",
      addressRegion: "Maharashtra",
      postalCode: "400607",
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: 19.2287, longitude: 72.9637 },
    hasMap: "https://maps.app.goo.gl/mfJjMMkksCkcXzMCA",
    sameAs: [
      "https://www.facebook.com/RainbowInternationalSchoolThane/",
      "https://www.instagram.com/rainbowinternationalschool/",
      "https://www.youtube.com/@rainbowinternationalschool",
      "https://saras.cbse.gov.in/SARAS/AffiliatedList/AfflicationDetails/1130661",
    ],
  };
}

export function buildWebsiteNode() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: "https://rainbowinternationalschool.in/",
    name: "Rainbow International School",
    publisher: { "@id": ORG_ID },
  };
}

function types(node: Record<string, unknown>): string[] {
  const value = node["@type"];
  return (Array.isArray(value) ? value : [value]).map(String);
}

/** Shared policy for all renderers, including code-owned standalone articles. */
export function normalizePageSchemas(input: unknown[]): Record<string, unknown>[] {
  const output: Record<string, unknown>[] = [];
  const rewrite = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(rewrite).filter(v => v !== undefined);
    if (!value || typeof value !== "object") return value;
    const node = value as Record<string, unknown>;
    const nodeTypes = types(node);
    if (nodeTypes.includes("FAQPage")) return undefined;
    // Competitor lists must remain completely untouched.
    if (nodeTypes.includes("ItemList")) return node;
    if (nodeTypes.some(t => ["Organization", "School", "EducationalOrganization"].includes(t))
      && String(node.name || "").startsWith("Rainbow International School")) return { "@id": ORG_ID };
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, rewrite(v)])
      .filter(([, v]) => v !== undefined));
  };
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    if (Array.isArray(node["@graph"])) {
      node["@graph"].forEach(visit);
      return;
    }
    const nodeTypes = types(node);
    if (nodeTypes.includes("FAQPage") || nodeTypes.includes("WebSite")) return;
    if (nodeTypes.some(t => ["School", "EducationalOrganization"].includes(t))
      || (nodeTypes.includes("Organization")
        && (String(node.name || "").startsWith("Rainbow International School") || node["@id"] === ORG_ID))) {
      // Retain stage programme information without declaring another School.
      if (node.department) {
        const departments = Array.isArray(node.department) ? node.department : [node.department];
        for (const department of departments) {
          if (department && typeof department === "object") output.push({
            "@context": "https://schema.org",
            ...department as Record<string, unknown>,
            provider: { "@id": ORG_ID },
          });
        }
      }
      return;
    }
    const result = rewrite(node);
    if (result) output.push(result as Record<string, unknown>);
  };
  input.forEach(visit);
  return [buildOrgNode(), buildWebsiteNode(), ...output];
}

/** Changes JSON-LD only; visible markup and styling are never rewritten. */
export function normalizeSchemaHtml(html: string): string {
  const blocks: unknown[] = [];
  const stripped = html.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    (_match, json: string) => {
      blocks.push(JSON.parse(json));
      return "";
    },
  );
  const schemas = normalizePageSchemas(blocks);
  if (!schemas.some(node => types(node).includes("BreadcrumbList"))) {
    const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
    if (canonical) {
      const items = [{ "@type": "ListItem", position: 1, name: "Home", item: "https://rainbowinternationalschool.in/" }];
      if (canonical !== items[0].item) items.push({
        "@type": "ListItem", position: 2,
        name: html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "Page",
        item: canonical,
      });
      schemas.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items });
    }
  }
  const scripts = schemas.map(node => {
    const marker = types(node)[0];
    const json = JSON.stringify(node).replace(/</g, "\\u003c");
    return `<script type="application/ld+json" data-seo-server-jsonld="${marker}">${json}</script>`;
  }).join("\n");
  return /<\/head>/i.test(stripped)
    ? stripped.replace(/\s*<\/head>/i, `${scripts}\n</head>`)
    : `${stripped.trimEnd()}\n${scripts}`;
}
