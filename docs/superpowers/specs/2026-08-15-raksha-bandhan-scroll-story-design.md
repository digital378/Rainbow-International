# Raksha Bandhan 2026 — "The Katha" scroll story

## What it is

A full-viewport, scroll-driven scene on the SSR blog page `/blog/raksha-bandhan-2026`.
The sister walks in from the left edge and the brother from the right edge as the
reader scrolls. They meet in the middle, kneel, the rakhi is tied, and the scene
settles into a combined illustration that carries the remaining three story beats.

This replaces the earlier single-panel crossfade design (`.rb-scroll-story` /
`.rb-scene-*`), which has been removed along with its generated `scene/*.webp`
derivatives.

## Structure

```
section.rb-katha            480vh tall (420vh under 760px) when live
  .rb-katha-sticky          position:sticky; top:0; height:100vh; overflow:hidden
    .rb-katha-stage
      .rb-katha-kids        width:min(86vw,100vh); aspect-ratio 1269/1000
        img.rb-katha-full   the combined tying illustration
        [data-katha-side="sis"]   left:27%  -> s_w1 s_w2 s_w3 s_lean s_rakhi
        [data-katha-side="boy"]   left:75%  -> b_w1 b_w2 b_w3 b_knee b_wait
      .rb-katha-glow        wrist glow
      .rb-katha-bless       blessings wash
      svg.rb-katha-rakhi    the travelling rakhi orb
      .rb-kcap-1 … -4       glass caption cards
      .rb-katha-hint        "Keep scrolling — the story unfolds"
```

Sprites live in `client/public/blog-assets/raksha-bandhan-2026/katha/` and are
served through the existing `assetVersion()` cache-busting helper.

## Progressive enhancement

The section renders by default as a **static, readable stacked column**: the
combined illustration plus the four caption cards in normal flow, sprites hidden.
JS adds `.is-live` only when `prefers-reduced-motion` is not set *and* every
sprite element resolved. So the no-JS and reduced-motion readers both get the
static layout for free — there is no separate reduced-motion branch to maintain.

## Scroll choreography

`q` is progress through the section: `clamp(-rect.top / (rect.height - innerHeight), 0, 1)`.

| q | beat |
|---|---|
| 0.00–0.24 | the walk. `approach = smooth(q/0.24)`; each figure is offset by `(1-approach) * innerWidth * 0.6`. Step frame = `floor(traveled/90) % 3`, with a `-abs(sin(...)) * 8px` bob so the legs and body actually move. |
| 0.235–0.27 | `walking` decays to 0, freezing the step cycle. |
| 0.245–0.30 | `s_lean` / `b_knee` — they crouch. |
| 0.295+ | `s_rakhi` / `b_wait` settle in. |
| 0.335–0.395 | sprites fade out, `.rb-katha-full` fades in and stays for the rest of the section. |
| 0.37–0.58 | wrist glow pulses. |
| 0.44–1.01 | `wTie` / `wGift` / `wBless` acting weights drive a gentle rotate + bob on the whole pair, and `travelX` / `travelS` drift the group centre → right → left → centre. |
| 0.70+ | blessings wash. |

Captions reveal on windows 0.02–0.30, 0.37–0.57, 0.59–0.75, 0.78–0.98 via an
`.is-on` class, so only one is ever on screen.

The rakhi orb is a DOM `<svg>`, not a second WebGL context — the page already
runs three.js for the background, and the orb has to work when WebGL is absent.
It rides the closing gap between the two children and fades out by q ≈ 0.65.

## Two traps worth remembering

**Specificity.** `.rb-cine > section` sets `display:flex; align-items:center`.
A plain `.rb-katha` rule loses to it, which turns the section into a centring
flex container: the sticky stage then sits half a section down and the entire
walk plays below the fold while the opacity values still look perfect in the
DOM. The katha layout rules must be written as `.rb-cine > .rb-katha`.

**Sprite box height.** `.rb-katha-sprite` is `width:0` — a pure positioning
anchor — but it still needs `height:100%`, because the frames inside are sized
as a percentage of it. Drop the height and the frames collapse to zero and the
walk renders blank, again with correct-looking opacity values.

Both failures are invisible to opacity/transform assertions. Verify this section
with screenshots, not computed styles.
