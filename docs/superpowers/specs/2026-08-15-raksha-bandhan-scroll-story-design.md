# Raksha Bandhan 2026 Scroll Story and Rakhi Motion

## Goal

Upgrade `/blog/raksha-bandhan-2026` with the uploaded local scene artwork so the
scroll sequence visibly changes the brother's leg and body pose, while making the
rakhi animation feel softer, more recognisably handcrafted, and more festive.
Preserve the existing SSR article, navigation, SEO metadata, JSON-LD, accessibility
behavior, reduced-motion support, WebGL safeguards, and cache-busted static assets.

## Scope

### Scroll-led scene

- Add a dedicated visual story stage to the existing cinematic section.
- Use the local uploaded scene PNGs as the source artwork:
  - `scene_1.1` through `scene_1.5` for the approach/walking progression.
  - `scene_2.1` through `scene_2.5` for changing leg and kneeling poses.
  - `scene_3.1` and `scene_3` for the tying/celebration state.
- Create optimized page-local derivatives rather than serving the original
  3375×4219 uploads directly.
- Crossfade neighboring frames based on normalized story scroll progress. Add
  small eased translation and scale changes to prevent hard cuts and preserve
  the cinematic depth of the current page.
- Keep a deterministic initial frame and a final settled frame. Do not require
  JavaScript for the article copy or basic page access.
- On reduced-motion preferences or a non-visual fallback, show one stable,
  representative scene without continuous animation.

### Rakhi motion

- Refine the existing Three.js rakhi builder with:
  - layered medallion/ring geometry;
  - braided thread sides and bead details;
  - a central jhumka-like hanging tail with a bell-shaped body, cap, bead,
    and short thread connection.
- Update the tail each animation frame using a damped target-following motion,
  so it lags gently during rotation and floating rather than snapping.
- Add a matching static SVG fallback with a visible hanging jhumka tail.
- Keep theme swatches functional by rebuilding all theme-dependent geometry,
  including the tail colors.

### Visual polish

- Apply a premium multi-stop gold gradient to primary cinematic headings and
  supporting display headings where contrast remains accessible.
- Normalize motion timing around eased transitions for card reveals, scene
  crossfades, rakhi tilt, wish bubbles, and stage feedback.
- Respect the current dark navy/gold direction and avoid changing article copy,
  layout semantics, or the Rainbow International School navigation.

## Technical approach

1. Extend the SSR template with a semantic scene-stage section and a layered
   frame stack. The stage will include an accessible label and a concise
   visually-hidden description; decorative duplicate frames will be hidden from
   assistive technology.
2. Copy/convert uploaded local artwork into
   `client/public/blog-assets/raksha-bandhan-2026/scene/` at a practical display
   size and use responsive image sources where supported.
3. Add a small scene-controller module inside the existing page script. It will:
   - calculate progress from the existing story range;
   - select the current frame pair;
   - ease the crossfade, opacity, transform, and stage depth values inside the
     existing animation loop;
   - pause work when the stage is outside the viewport;
   - stop continuous effects under reduced motion.
4. Extend `makeRakhi` with a grouped jhumka tail and attach metadata for the
   animation loop. The tail will receive the current rakhi orientation and a
   damped follow offset.
5. Update CSS for the scene stage, gold display gradients, fallback rakhi tail,
   and responsive/reduced-motion behavior.
6. Preserve the existing `assetVersion(...)` query parameters in the SSR output
   and add the new static scene asset URLs to the same cache-busting strategy if
   their serving path is long-lived.

## Failure and accessibility behavior

- Missing scene assets must not remove article content. The stage will fall back
  to its first available local frame, then to a styled placeholder only if no
  frame can load.
- A failed Three.js import continues to use the static rakhi fallback.
- WebGL detection remains guarded and mobile pixel ratio remains capped.
- Decorative frame layers use `aria-hidden="true"`; the story stage exposes a
  meaningful text alternative.
- Reduced-motion users receive no continuous scene cycling, parallax, confetti,
  or spring tail animation.
- Gold gradient text must retain a solid-color fallback for browsers without
  background-clip support.

## Verification

- Run TypeScript checking after the SSR/template changes.
- Restart the configured application workflow after code and asset changes.
- Load the page with a cache-busting query parameter and assert HTTP 200.
- Verify in a browser at desktop and mobile widths:
  - scene frames change as the story scrolls;
  - brother leg positions visibly change;
  - the rakhi and jhumka tail move smoothly;
  - static fallback and reduced-motion behavior remain usable;
  - headings remain readable and no horizontal overflow is introduced.
- Confirm existing article sections, FAQ, navigation, metadata, and JSON-LD remain
  present.