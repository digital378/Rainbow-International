import { afterEach, describe, expect, it, vi } from "vitest";
import { runSeoChecks } from "../server/seoMonitor";

const homepageHtml = `
  <html><head>
    <meta property="og:image" content="https://rainbowinternationalschool.in/opengraph.jpg" />
    <script type="application/ld+json">{"@type":"EducationalOrganization"}</script>
  </head></html>
`;

function htmlResponse(body: string, init: ResponseInit = {}) {
  return new Response(body, {
    status: 200,
    headers: { "cache-control": "private", ...init.headers },
    ...init,
  });
}

afterEach(() => vi.restoreAllMocks());

describe("SEO monitor homepage reliability", () => {
  it("retries a transient homepage timeout and does not report a regression", async () => {
    const timeout = new DOMException("The operation was aborted due to timeout", "TimeoutError");
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(timeout)
      .mockResolvedValueOnce(htmlResponse(homepageHtml))
      .mockResolvedValueOnce(htmlResponse("<html></html>"))
      .mockResolvedValueOnce(
        new Response("", {
          status: 301,
          headers: { location: "/pre-primary-school-thane" },
        }),
      );

    const results = await runSeoChecks({ fetchImpl, retryDelayMs: 0 });

    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(results).toHaveLength(5);
    expect(results.every((result) => result.passed)).toBe(true);
  });

  it("reports missing og:image only after a successful homepage response", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        htmlResponse(
          '<html><script type="application/ld+json">{"@type":"EducationalOrganization"}</script></html>',
        ),
      )
      .mockResolvedValueOnce(htmlResponse("<html></html>"))
      .mockResolvedValueOnce(
        new Response("", {
          status: 301,
          headers: { location: "/pre-primary-school-thane" },
        }),
      );

    const results = await runSeoChecks({ fetchImpl, retryDelayMs: 0 });
    const ogImage = results.find(
      (result) => result.name === "og:image present on homepage",
    );

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(ogImage).toMatchObject({
      passed: false,
      kind: "regression",
      detail: "og:image meta tag missing or does not reference opengraph.jpg",
    });
  });

  it("classifies exhausted timeouts as unavailable, not missing metadata", async () => {
    const timeout = new DOMException("The operation was aborted due to timeout", "TimeoutError");
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(timeout)
      .mockRejectedValueOnce(timeout)
      .mockRejectedValueOnce(timeout)
      .mockResolvedValueOnce(htmlResponse("<html></html>"))
      .mockResolvedValueOnce(
        new Response("", {
          status: 301,
          headers: { location: "/pre-primary-school-thane" },
        }),
      );

    const results = await runSeoChecks({ fetchImpl, retryDelayMs: 0 });

    expect(results).toContainEqual(
      expect.objectContaining({
        name: "Homepage available for SEO verification",
        passed: false,
        kind: "availability",
      }),
    );
    expect(
      results.some((result) => result.name === "og:image present on homepage"),
    ).toBe(false);
  });
});