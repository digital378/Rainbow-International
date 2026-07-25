export function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  if (d.length === 12 && d.startsWith("91")) return d;
  return d;
}

export function buildWhatsAppUrl(
  phone: string,
  token: string,
  schoolName: string,
  origin: string,
): string {
  const portalUrl = `${origin}/alliances/friendship/${token}`;
  const text = `Hello! Here is the Rainbow International School admission portal link for ${schoolName}:\n${portalUrl}`;
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}

export function buildEmailUrl(
  email: string,
  token: string,
  schoolName: string,
  origin: string,
): string {
  const portalUrl = `${origin}/alliances/friendship/${token}`;
  const subject = `Rainbow International School — Admission Portal Link`;
  const body = `Hello,\n\nPlease find the admission portal link for ${schoolName} below:\n\n${portalUrl}\n\nRegards,\nRainbow International School`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
