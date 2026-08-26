export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

// Attribution is useful for reporting, but it is never allowed to become an
// arbitrary label in staff email. Keep normal campaign values and use a safe
// fallback for payloads containing markup, control characters, or URL schemes.
export function normalizeAttribution(value?: string | null): string {
  const normalized = String(value || "").trim().replace(/[\r\n\t]/g, " ");
  if (!normalized) return "Unknown";
  if (normalized.length > 100 || !/^[a-z0-9][a-z0-9 _./-]*$/i.test(normalized)) {
    return "Unknown";
  }
  return normalized;
}

export function getLeadSourceLabel(utmSource?: string | null, utmMedium?: string | null): string {
  if (!utmSource && !utmMedium) return "Organic / Direct";
  const source = normalizeAttribution(utmSource);
  const medium = normalizeAttribution(utmMedium);
  const src = source.toLowerCase();
  const med = medium.toLowerCase();
  if (src === "google" && (med === "cpc" || med === "paid" || med.includes("paid"))) return "Google Ads";
  if (src === "facebook" || src === "instagram" || src === "meta") return "Meta Ads";
  if (med === "cpc" || med === "ppc" || med.includes("paid")) return `Paid Ads (${source})`;
  if (med === "email") return "Email Campaign";
  if (med === "social" || med === "organic_social") return `Social Media (${source})`;
  if (med === "referral") return `Referral (${source})`;
  return source === "Unknown" ? "Unknown" : source;
}

export function getMediumLabel(utmMedium?: string | null): string {
  if (!utmMedium) return "Direct";
  const medium = normalizeAttribution(utmMedium);
  const med = medium.toLowerCase();
  if (med === "cpc" || med === "ppc") return "Paid Ads";
  if (med === "display") return "Paid Ads";
  if (med === "paid_social") return "Paid Ads";
  if (med === "social" || med === "organic_social") return "Social";
  if (med === "email") return "Email";
  if (med === "referral") return "Referral";
  if (med === "organic") return "Organic Search";
  return medium;
}

export function safeSubjectPart(value: string | null | undefined, maxLength = 120): string {
  return String(value || "Unknown")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength) || "Unknown";
}