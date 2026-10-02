export const NAVRATRI_HERO_URL =
  "/blog/navratri-dussehra-2026/navratri-dussehra-2026-hero.jpg";

/**
 * Resolve the original embedded artwork before sending HTML, rather than
 * waiting for the article's browser script to switch backgrounds after parse.
 * The existing JPEG and all artwork positioning/styles remain unchanged.
 */
export function renderNavratriBlog(source: string): string {
  return source.replace(
    /url\("data:image\/jpeg;base64,[^"]+"\)/,
    `url("${NAVRATRI_HERO_URL}")`,
  );
}