import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  getLeadSourceLabel,
  getMediumLabel,
  normalizeAttribution,
  safeSubjectPart,
} from "../server/inquirySanitization";

describe("public enquiry notification sanitization", () => {
  it("escapes every HTML-sensitive character", () => {
    expect(escapeHtml(`<script>alert("x") & 'y'</script>`))
      .toBe("&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;");
  });

  it("preserves valid attribution and replaces payloads with Unknown", () => {
    expect(normalizeAttribution("google_ads")).toBe("google_ads");
    expect(normalizeAttribution("javascript:alert(1)")).toBe("Unknown");
    expect(normalizeAttribution("<img src=x>")).toBe("Unknown");
    expect(getLeadSourceLabel("google_ads", "cpc")).toBe("Paid Ads (google_ads)");
    expect(getLeadSourceLabel("javascript:alert(1)", "referral")).toBe("Referral (Unknown)");
    expect(getMediumLabel("javascript:alert(1)")).toBe("Unknown");
  });

  it("keeps email subjects single-line and bounded", () => {
    expect(safeSubjectPart("A\r\nB", 3)).toBe("A B");
    expect(safeSubjectPart(" ".repeat(200))).toBe("Unknown");
  });
});