/*!
 * Rainbow International School — Blog Drop-In Animations  v1.0.0
 * Pure vanilla JS + CSS. No libraries. No build step.
 *
 * ── WORDPRESS USAGE ──────────────────────────────────────────────────────────
 * 1. Paste animations.css into WPCode → "CSS Snippet".
 * 2. Paste this file into WPCode → "JS Snippet (Footer)".
 * 3. In both snippets, set Location → "Specific pages" → select only this post.
 *
 * ── OPTIONAL CLASSES & DATA-ATTRIBUTES ──────────────────────────────────────
 *
 *   class="count-up"  data-target="48"
 *     → counts from 0 → 48 when the element scrolls into view.
 *
 *   class="count-up"  data-target="104"  data-suffix="+"
 *     → counts from 0 → 104, appending "+" (shows "104+").
 *
 *   class="magnetic"
 *     → the element gently pulls toward the cursor (desktop).
 *     → NOTE: also auto-applied to any <a> or <button> whose text
 *             includes "Apply" or "Admissions" (case-insensitive).
 *
 *   class="tilt"
 *     → the element gets a subtle 3-D tilt as the cursor moves over it.
 *
 * ── EVERYTHING ELSE IS AUTOMATIC (no classes needed) ────────────────────────
 *   • Scroll-progress bar fills at page top.
 *   • Every <h2> inside the article root fades + slides up on scroll.
 *   • Every <tbody tr> fades + slides up (staggered, per-table cascade).
 *   • TOC links (a[href^="#"]) get .ris-toc-active as their section enters view.
 *   • First hero image gets a subtle upward parallax.
 *   • Custom glowing cursor + trailing ring on desktop (non-touch) devices.
 *
 * ── CONFIGURATION ────────────────────────────────────────────────────────────
 *   ROOT_SELECTOR: the article content wrapper. Tried in order; first match wins.
 *   TOC_SELECTOR:  container holding your anchor-links table of contents.
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ── CONFIG — change these if your theme uses different wrappers ─────────── */
  var ROOT_SELECTOR = '.entry-content, article .post-content, article, .elementor-widget-container, main';
  var TOC_SELECTOR  = '.ris-toc, .wp-block-table-of-contents, nav.toc, [id*="table-of-contents"], [class*="table-of-contents"], [class*="toc-"]';
  /* ── END CONFIG ─────────────────────────────────────────────────────────── */

  /* Boot after DOM is ready. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * BOOT — detect environment once, then wire up each feature.
   * ───────────────────────────────────────────────────────────────────────── */
  function boot() {
    var root           = document.querySelector(ROOT_SELECTOR) || document.body;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isTouch        = window.matchMedia('(pointer: coarse)').matches;

    initProgressBar();                          /* 1 — always on             */
    initReveal(root, prefersReduced);           /* 2 — respects motion pref  */
    initCountUp(root);                          /* 3 — always on             */
    initScrollSpy();                            /* 4 — always on             */
    initParallax(prefersReduced);               /* 5 — respects motion pref  */
    if (!isTouch && !prefersReduced) {
      initCursor();                             /* 6 — desktop only          */
    }
    if (!isTouch) {
      initMagnetic(root);                       /* 7 — desktop only          */
      initTilt(root);                           /* 8 — desktop only          */
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * 1. SCROLL PROGRESS BAR
   * Creates a thin colored bar fixed at the very top of the viewport that
   * fills from 0 → 100% as the user scrolls the full page height.
   * ───────────────────────────────────────────────────────────────────────── */
  function initProgressBar() {
    var bar = document.createElement('div');
    bar.className = 'ris-progress';
    bar.setAttribute('role', 'presentation');
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var ticking = false;

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docH      = document.documentElement.scrollHeight - window.innerHeight;
      var pct       = docH > 0 ? (scrollTop / docH) * 100 : 0;
      bar.style.width = Math.min(pct, 100) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update(); /* Set initial state in case page is pre-scrolled. */
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * 2. REVEAL ON SCROLL
   * Auto-targets every <h2> and every <tbody tr> inside the article root.
   * Adds .ris-reveal (hidden) via JS only — so without JS the page stays
   * fully visible. IntersectionObserver triggers .ris-in (visible).
   * Table rows are staggered per-tbody so they cascade in one by one.
   * ───────────────────────────────────────────────────────────────────────── */
  function initReveal(root, prefersReduced) {
    if (prefersReduced) return;             /* Honour motion preference. */
    if (!window.IntersectionObserver) return; /* Safari <12 / old browsers. */

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ris-in');
          observer.unobserve(entry.target); /* Fire once, then stop watching. */
        }
      });
    }, {
      threshold:  0.10,   /* Trigger when 10% of the element is visible. */
      rootMargin: '0px'
    });

    /* Headings — no stagger (each is its own landmark). */
    var headings = root.querySelectorAll('h2');
    headings.forEach(function (el) {
      el.classList.add('ris-reveal');
      observer.observe(el);
    });

    /* Table rows — staggered per-tbody so each table cascades independently. */
    var tbodies = root.querySelectorAll('tbody');
    tbodies.forEach(function (tbody) {
      var rows = tbody.querySelectorAll('tr');
      rows.forEach(function (row, idx) {
        row.classList.add('ris-reveal');
        /* 55 ms between rows feels snappy without being overwhelming. */
        row.style.transitionDelay = (idx * 55) + 'ms';
        observer.observe(row);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * 3. COUNT-UP NUMBERS
   * Any element with class="count-up" and data-target="48" will count from
   * 0 → 48 with an ease-out curve when it scrolls into view. Optionally
   * add data-suffix="+" to append a string after the number.
   * ───────────────────────────────────────────────────────────────────────── */
  function initCountUp(root) {
    if (!window.IntersectionObserver) return;

    var counters = root.querySelectorAll('.count-up[data-target]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 }); /* Wait until the number is half-visible. */

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function runCounter(el) {
    var target   = parseFloat(el.getAttribute('data-target')) || 0;
    var suffix   = el.getAttribute('data-suffix') || '';
    var duration = 1500; /* ms — tweak if you want faster/slower counts. */
    var startTs  = null;

    el.classList.add('ris-counting');

    function step(timestamp) {
      if (!startTs) startTs = timestamp;

      var elapsed  = timestamp - startTs;
      var progress = Math.min(elapsed / duration, 1);

      /* Cubic ease-out: starts fast, decelerates smoothly at the end. */
      var eased   = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix; /* Ensure exact final value. */
        el.classList.remove('ris-counting');
      }
    }

    requestAnimationFrame(step);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * 4. SCROLLSPY — Table of Contents highlighting
   * Finds all TOC anchor links (href="#someId"). On scroll, determines which
   * section is in the top third of the viewport and marks that link active
   * with .ris-toc-active, removing it from all others.
   * ───────────────────────────────────────────────────────────────────────── */
  function initScrollSpy() {
    /* Try the explicit TOC container first, then fall back to any page anchors. */
    var tocLinks = document.querySelectorAll(TOC_SELECTOR + ' a[href^="#"]');
    if (!tocLinks.length) {
      /* Broader fallback: any nav link or standalone TOC-style anchor. */
      tocLinks = document.querySelectorAll('nav a[href^="#"], .toc a[href^="#"]');
    }
    if (!tocLinks.length) return;

    /* Build id → <a> element map. */
    var linkMap = {};
    tocLinks.forEach(function (link) {
      var hash = link.getAttribute('href');
      if (hash && hash.length > 1) {
        var id = hash.slice(1);
        if (!linkMap[id]) linkMap[id] = link; /* First link per id wins. */
      }
    });

    var ids = Object.keys(linkMap);
    if (!ids.length) return;

    var ticking = false;

    function spy() {
      var scrollY     = window.scrollY || document.documentElement.scrollTop;
      var viewGuide   = scrollY + window.innerHeight * 0.33; /* 1/3 down viewport */
      var activeId    = null;

      /* Walk sections top-to-bottom; last one whose top is above the guide wins. */
      ids.forEach(function (id) {
        var section = document.getElementById(id);
        if (!section) return;
        var sectionTop = section.getBoundingClientRect().top + scrollY;
        if (sectionTop <= viewGuide) activeId = id;
      });

      /* Update active class on all tracked links. */
      ids.forEach(function (id) {
        var link = linkMap[id];
        if (id === activeId) {
          link.classList.add('ris-toc-active');
          link.setAttribute('aria-current', 'location');
        } else {
          link.classList.remove('ris-toc-active');
          link.removeAttribute('aria-current');
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(spy);
        ticking = true;
      }
    }, { passive: true });

    spy(); /* Run immediately in case the page loads mid-scroll. */
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * 5. HERO IMAGE PARALLAX
   * Finds the first large/featured image and shifts it upward at ~30% of
   * the scroll speed so it appears to move more slowly than the page — a
   * classic depth illusion. Does nothing if no suitable image is found.
   * ───────────────────────────────────────────────────────────────────────── */
  function initParallax(prefersReduced) {
    if (prefersReduced) return;

    var hero = document.querySelector(
      '.wp-post-image, .post-thumbnail img, header img, .hero img, ' +
      '.entry-content img:first-of-type, article img:first-of-type, figure:first-of-type img'
    );
    if (!hero) return;

    hero.classList.add('ris-parallax');

    /* Cache the image's page offset once, then update only on scroll. */
    var heroOffsetTop = getOffsetTop(hero);
    var ticking = false;

    function update() {
      /* Only move while the hero is at least partially in view. */
      var rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var scrolled = window.scrollY || document.documentElement.scrollTop;
        var offset   = (scrolled - heroOffsetTop) * 0.28;
        hero.style.transform = 'translateY(' + offset + 'px)';
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* Utility: cumulative offsetTop relative to the document. */
  function getOffsetTop(el) {
    var top = 0;
    while (el) {
      top += el.offsetTop || 0;
      el   = el.offsetParent;
    }
    return top;
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * 6. CUSTOM CURSOR — glowing dot + trailing ring  (desktop only)
   * Creates two fixed-position DIVs: a dot that snaps to the mouse and a
   * ring that eases toward it with lag for a fluid trailing feel.
   * The ring enlarges and tints when the cursor hovers interactive elements.
   * ───────────────────────────────────────────────────────────────────────── */
  function initCursor() {
    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.className  = 'ris-cursor-dot';
    ring.className = 'ris-cursor-ring';
    dot.setAttribute('aria-hidden',  'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('ris-cursor-on');

    /* Current mouse position (pixels from viewport top-left). */
    var mx = window.innerWidth  / 2;
    var my = window.innerHeight / 2;

    /* Ring's current (eased) position. */
    var rx = mx;
    var ry = my;

    var isHovering = false;
    var rafRunning = false;

    /* Move dot instantly; ring is eased in the rAF loop. */
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;

      /* Dot: snap directly to cursor (offset by half its own size). */
      var half = parseInt(getComputedStyle(document.documentElement)
                   .getPropertyValue('--ris-cursor-size'), 10) / 2 || 5;
      dot.style.transform = 'translate(' + (mx - half) + 'px,' + (my - half) + 'px)';

      if (!rafRunning) {
        rafRunning = true;
        requestAnimationFrame(easeRing);
      }
    });

    /* Easing loop — runs until ring is close enough to mouse to stop. */
    function easeRing() {
      var ringHalf = parseInt(getComputedStyle(document.documentElement)
                      .getPropertyValue('--ris-ring-size'), 10) / 2 || 20;

      /* Lerp ring toward cursor at 15% per frame (~9px/frame at 60fps). */
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = 'translate(' + (rx - ringHalf) + 'px,' + (ry - ringHalf) + 'px)';

      /* Keep looping while there's still visible distance to cover. */
      if (Math.abs(mx - rx) > 0.5 || Math.abs(my - ry) > 0.5) {
        requestAnimationFrame(easeRing);
      } else {
        rafRunning = false;
      }
    }

    /* Enlarge ring on interactive element hover. */
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, .ris-magnetic')) {
        if (!isHovering) {
          isHovering = true;
          ring.classList.add('ris-cursor-hover');
        }
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, .ris-magnetic')) {
        isHovering = false;
        ring.classList.remove('ris-cursor-hover');
      }
    });

    /* Fade out cursor elements when mouse leaves the browser window. */
    document.addEventListener('mouseleave', function () {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * 7. MAGNETIC BUTTONS
   * Elements with class="magnetic" (or auto-detected Apply/Admissions text)
   * gently pull toward the cursor while it hovers nearby, snapping back on
   * mouse-leave. strength controls the pull intensity (0 = none, 1 = full).
   * ───────────────────────────────────────────────────────────────────────── */
  function initMagnetic(root) {
    /* 1. Collect explicit .magnetic elements. */
    var targets = Array.prototype.slice.call(root.querySelectorAll('.magnetic'));

    /* 2. Auto-detect Apply / Admissions text in buttons and links. */
    var candidates = root.querySelectorAll('a, button');
    candidates.forEach(function (el) {
      var text = (el.textContent || '').toLowerCase().trim();
      if (/apply|admissions/.test(text)) {
        targets.push(el);
      }
    });

    /* 3. Deduplicate (an element might match both rules). */
    targets = targets.filter(function (el, i, arr) {
      return arr.indexOf(el) === i;
    });

    targets.forEach(function (el) {
      el.classList.add('ris-magnetic');
      bindMagnetic(el);
    });
  }

  function bindMagnetic(el) {
    var STRENGTH = 0.32; /* Pull factor — increase for stronger pull. */

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var cx   = rect.left + rect.width  / 2;
      var cy   = rect.top  + rect.height / 2;
      var dx   = (e.clientX - cx) * STRENGTH;
      var dy   = (e.clientY - cy) * STRENGTH;
      el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    });

    el.addEventListener('mouseleave', function () {
      /* Snap back smoothly via the CSS transition on .ris-magnetic. */
      el.style.transform = 'translate(0px, 0px)';
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * 8. TILT ON HOVER — 3-D card tilt effect
   * Elements with class="tilt" rotate on both axes as the cursor moves over
   * them, creating a depth illusion. MAX_TILT controls the maximum angle.
   * ───────────────────────────────────────────────────────────────────────── */
  function initTilt(root) {
    var els = root.querySelectorAll('.tilt');
    if (!els.length) return;

    els.forEach(function (el) {
      el.classList.add('ris-tilt');
      bindTilt(el);
    });
  }

  function bindTilt(el) {
    var MAX_TILT = 12; /* Maximum rotation in degrees. */

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();

      /* Normalise cursor position to −0.5 … +0.5 range. */
      var xFrac = (e.clientX - rect.left)  / rect.width  - 0.5;
      var yFrac = (e.clientY - rect.top)   / rect.height - 0.5;

      /* Invert Y axis so moving up tilts the top toward the viewer. */
      var rotX = -yFrac * MAX_TILT;
      var rotY =  xFrac * MAX_TILT;

      el.style.transform =
        'perspective(640px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.025)';
    });

    el.addEventListener('mouseleave', function () {
      /* Reset smoothly via the CSS transition on .ris-tilt. */
      el.style.transform =
        'perspective(640px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

})();
