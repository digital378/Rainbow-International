import { describe, expect, it } from "vitest";
import { buildOrgNode, buildWebsiteNode, normalizePageSchemas, normalizeSchemaHtml, ORG_ID, WEBSITE_ID } from "../shared/orgSchema";

describe("public schema policy", () => {
  it("uses the verified organization and website identities", () => {
    const org = buildOrgNode();
    expect(org["@id"]).toBe(ORG_ID);
    expect(org.telephone).toBe("+91-82915-68972");
    expect(org.email).toBe("admin@rainbowinternationalschool.in");
    expect(org.foundingDate).toBe("2009-04");
    expect(org.geo).toEqual({ "@type": "GeoCoordinates", latitude: 19.2287, longitude: 72.9637 });
    expect(buildWebsiteNode()).toMatchObject({ "@id": WEBSITE_ID, publisher: { "@id": ORG_ID } });
  });

  it("deduplicates graph organizations and preserves programmes", () => {
    const nodes = normalizePageSchemas([{
      "@graph": [
        buildOrgNode(), buildOrgNode(), buildWebsiteNode(),
        { "@type": "FAQPage", mainEntity: [] },
        { "@type": "School", name: "Rainbow International School — Primary", department: {
          "@type": "EducationalOccupationalProgram", name: "Primary", educationalLevel: "Class 1–5",
        } },
        { "@type": "BlogPosting", publisher: { "@type": "Organization", name: "Rainbow International School" } },
      ],
    }]);
    expect(nodes.filter(node => Array.isArray(node["@type"]) && node["@type"].includes("School"))).toHaveLength(1);
    expect(nodes.filter(node => node["@type"] === "WebSite")).toHaveLength(1);
    expect(nodes.some(node => node["@type"] === "FAQPage")).toBe(false);
    expect(nodes.find(node => node["@type"] === "EducationalOccupationalProgram")).toMatchObject({
      name: "Primary", educationalLevel: "Class 1–5", provider: { "@id": ORG_ID },
    });
    expect(nodes.find(node => node["@type"] === "BlogPosting")).toMatchObject({ publisher: { "@id": ORG_ID } });
  });

  it("does not modify ItemList or visible FAQ markup, styling, and content", () => {
    const itemList = { "@type": "ItemList", itemListElement: [{ "@type": "School", name: "Another school" }] };
    expect(normalizePageSchemas([itemList]).at(-1)).toBe(itemList);
    const body = '<body><details class="faq"><summary>Question</summary><p style="color:blue">Answer</p></details></body>';
    const html = `<html><head><link rel="canonical" href="https://rainbowinternationalschool.in/faqs"><script type="application/ld+json">{"@type":"FAQPage"}</script></head>${body}</html>`;
    const result = normalizeSchemaHtml(html);
    expect(result).not.toContain('"FAQPage"');
    expect(result).toContain(body);
    expect(result).toContain('"BreadcrumbList"');
    expect(normalizeSchemaHtml(result)).toBe(result);
  });
});
