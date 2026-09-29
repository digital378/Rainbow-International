// Keep source labels consistent across CRM entry, imports, reports and sheet summaries.
const digitalMarketingAliases = new Set([
  "google",
  "google ads",
  "google digital marketing",
  "meta",
  "meta ads",
  "digital marketing",
]);

export function normalizeWalkinLeadSource(value: string): string {
  const label = value.trim().replace(/\s+/g, " ");
  return label.toLowerCase() === "dm" || digitalMarketingAliases.has(label.toLowerCase())
    ? "DM"
    : label;
}