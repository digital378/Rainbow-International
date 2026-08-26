export const BLOG_IMAGE_FALLBACK =
  "https://rainbowinternationalschool.in/images/extra/campus/school-building.jpg";

const BLOG_SITE_ORIGIN = "https://rainbowinternationalschool.in";
const LEGACY_BLOG_IMAGE_PATH = "/wp-content/uploads/";

/**
 * Keep legacy WordPress media URLs in storage while serving a valid image to
 * readers until the original media can be recovered and rehosted.
 */
export function resolveBlogImageUrl(url: string | null | undefined): string {
  const value = url?.trim() || "";
  if (!value) return BLOG_IMAGE_FALLBACK;

  try {
    const pathname = new URL(value, BLOG_SITE_ORIGIN).pathname;
    if (pathname.startsWith(LEGACY_BLOG_IMAGE_PATH)) {
      return BLOG_IMAGE_FALLBACK;
    }
  } catch {
    // Preserve malformed non-legacy values for the existing browser behavior.
  }

  return value;
}