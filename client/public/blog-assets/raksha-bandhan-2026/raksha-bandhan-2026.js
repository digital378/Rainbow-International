(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.innerWidth < 700;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }

  /* ---------------- card reveal ---------------- */
  var cards = document.querySelectorAll(".rb-card");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("is-on"); });
    }, { threshold: 0.22 });
    Array.prototype.forEach.call(cards, function (c) { io.observe(c); });
  } else {
    Array.prototype.forEach.call(cards, function (c) { c.classList.add("is-on"); });
  }

  /* ---------------- scroll + progress ---------------- */
  var barEl = document.querySelector(".rb-progress > span");
  var fillEl = document.querySelector(".rb-thread-fill");
  var knotEl = document.querySelector(".rb-thread-knot");
  var bgHost = document.querySelector(".rb-bg");
  var pxSection = document.querySelector(".rb-parallax");
  var scrollStory = document.querySelector(".rb-scroll-story");
  var sceneStage = document.querySelector(".rb-scene-stage");
  var sceneFrames = sceneStage ? Array.prototype.slice.call(sceneStage.querySelectorAll(".rb-scene-frame")) : [];
  var sceneProgressEl = sceneStage ? sceneStage.querySelector(".rb-scene-progress span") : null;
  var scrollP = 0, scrollPS = 0, storyP = 0, storyPS = 0, sceneP = 0, scenePS = 0, storyEnd = 1;

  function measure() {
    storyEnd = pxSection ? (pxSection.offsetTop + pxSection.offsetHeight - window.innerHeight) : 1;
    if (storyEnd < 1) storyEnd = 1;
  }
  function readScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = h > 0 ? clamp(window.scrollY / h, 0, 1) : 0;
    storyP = clamp(window.scrollY / storyEnd, 0, 1);
    if (scrollStory) {
      var storyRect = scrollStory.getBoundingClientRect();
      var sceneRun = Math.max(scrollStory.offsetHeight - window.innerHeight * 0.7, 1);
      sceneP = clamp((window.innerHeight * 0.78 - storyRect.top) / sceneRun, 0, 1);
    }
    if (bgHost) bgHost.classList.toggle("is-off", window.scrollY > storyEnd + window.innerHeight * 0.6);
  }
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", function () { measure(); readScroll(); });
  measure(); readScroll();

  /* ---------------- parallax layers ---------------- */
  var pxWrap = document.querySelector(".rb-px-wrap");
  var pxLayers = pxWrap ? Array.prototype.slice.call(pxWrap.querySelectorAll("[data-depth]")) : [];
  var mouseX = 0, mouseY = 0;
  window.addEventListener("pointermove", function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  function updateParallax() {
    if (!pxWrap || reduced) return;
    var r = pxWrap.getBoundingClientRect();
    if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
    var prog = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
    pxLayers.forEach(function (L) {
      var d = parseFloat(L.getAttribute("data-depth")) || 0;
      var ty = (prog - 0.5) * d * 300;
      var tx = mouseX * d * 26;
      L.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0)";
    });
  }

  /* ---------------- illustrated scroll story ---------------- */
  function updateSceneStory() {
    if (reduced || !sceneStage || !sceneFrames.length) return;
    var rect = sceneStage.getBoundingClientRect();
    if (rect.bottom < -80 || rect.top > window.innerHeight + 80) return;
    var segments = sceneFrames.length - 1;
    var position = scenePS * segments;
    var current = Math.min(segments, Math.floor(position));
    var mix = smooth(position - current);

    sceneFrames.forEach(function (frame, index) {
      var opacity = 0, shift = 24, scale = 0.965;
      if (index === current) {
        opacity = 1 - mix;
        shift = -mix * 16;
        scale = 1 + mix * 0.018;
      } else if (index === current + 1) {
        opacity = mix;
        shift = (1 - mix) * 22;
        scale = 0.978 + mix * 0.022;
      }
      frame.style.opacity = opacity.toFixed(3);
      frame.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0) scale(" + scale.toFixed(4) + ")";
      frame.style.zIndex = String(index === current + 1 ? 2 : index === current ? 1 : 0);
    });
    if (sceneProgressEl) sceneProgressEl.style.width = (scenePS * 100).toFixed(2) + "%";
  }

  /* ---------------- celebration moment ---------------- */
  var celSection = document.querySelector(".rb-celebration");
  var celWrap = document.querySelector(".rb-celebration-stage");
  var celTilt = document.querySelector(".rb-celebration-tilt");
  var kidsImg = celTilt ? celTilt.querySelector("img") : null;
  var wishBubble = document.querySelector(".rb-wish-bubble");
  var celRotX = 0, celRotY = 0, celTX = 0, celTY = 0;

  if (kidsImg && celSection) {
    kidsImg.addEventListener("error", function () {
      /* keep the section — swap to the ornamental fallback instead of hiding content */
      celSection.classList.add("is-imageless");
    });
  }

  if (celWrap && !reduced) {
    for (var s = 0; s < 24; s++) {
      var sp = document.createElement("span");
      sp.className = "rb-sparkle";
      var sz = 4 + Math.round(Math.random() * 8);
      sp.style.width = sp.style.height = sz + "px";
      sp.style.left = (4 + Math.random() * 92) + "%";
      sp.style.top = (6 + Math.random() * 88) + "%";
      sp.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
      sp.style.animationDuration = (3 + Math.random() * 3).toFixed(2) + "s";
      celWrap.appendChild(sp);
    }
    celWrap.addEventListener("pointermove", function (e) {
      var r = celWrap.getBoundingClientRect();
      celTX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      celTY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    celWrap.addEventListener("pointerleave", function () { celTX = 0; celTY = 0; });
  }

  function celebrate() {
    if (wishBubble) {
      wishBubble.textContent = "Happy Raksha Bandhan! ✦";
      wishBubble.classList.add("is-on");
      clearTimeout(wishBubble._t);
      wishBubble._t = setTimeout(function () { wishBubble.classList.remove("is-on"); }, 2800);
    }
    if (reduced || !celWrap) return;
    var colors = ["#10174F", "#f5b428", "#ff8a3d", "#ffd977", "#fff6e8"];
    for (var c = 0; c < 34; c++) {
      var bit = document.createElement("span");
      bit.className = "rb-confetti-bit";
      bit.style.background = colors[c % colors.length];
      bit.style.left = "50%";
      bit.style.top = "42%";
      celWrap.appendChild(bit);
      (function (el) {
        var ang = Math.random() * Math.PI * 2, speed = 90 + Math.random() * 160;
        var vx = Math.cos(ang) * speed, vy = Math.sin(ang) * speed - 120;
        var x = 0, y = 0, rot = Math.random() * 360, t0 = null, last = null;
        function fly(ts) {
          if (!t0) t0 = ts;
          var dt = Math.min((ts - (last || ts)) / 1000, 0.05);
          last = ts;
          var life = (ts - t0) / 1000;
          x += vx * dt; y += vy * dt; vy += 340 * dt; rot += 240 * dt;
          el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + rot.toFixed(0) + "deg)";
          el.style.opacity = String(Math.max(0, 1 - life / 1.6));
          if (life < 1.7) requestAnimationFrame(fly); else el.remove();
        }
        requestAnimationFrame(fly);
      })(bit);
    }
  }

  if (celWrap) celWrap.addEventListener("click", celebrate);
  if (kidsImg) {
    kidsImg.tabIndex = 0;
    kidsImg.setAttribute("role", "button");
    kidsImg.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); celebrate(); }
    });
  }

  /* ---------------- PDF download ---------------- */
  async function generatePdf(event) {
    var button = event.currentTarget;
    var original = button.innerHTML;
    button.disabled = true;
    button.textContent = "Preparing your PDF…";
    try {
      var mod = await import("https://cdn.jsdelivr.net/npm/jspdf@4.2.1/+esm");
      var jsPDF = mod.jsPDF;
      var pdf = new jsPDF({ unit: "pt", format: "a4" });
      var navy = [16, 23, 79];
      var gold = [245, 180, 40];
      var margin = 52;
      var y = 72;
      var add = function (text, size, bold) {
        size = size || 11;
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(navy[0], navy[1], navy[2]);
        var lines = pdf.splitTextToSize(text, 491);
        if (y + lines.length * (size + 5) > 770) { pdf.addPage(); y = 62; }
        pdf.text(lines, margin, y);
        y += lines.length * (size + 5) + 15;
      };
      pdf.setFillColor(navy[0], navy[1], navy[2]);
      pdf.rect(0, 0, 595, 36, "F");
      pdf.setTextColor(gold[0], gold[1], gold[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("RAINBOW INTERNATIONAL SCHOOL  |  PASSION FOR EXCELLENCE", margin, 23);
      pdf.setTextColor(navy[0], navy[1], navy[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(23);
      pdf.text("Raksha Bandhan 2026", margin, y);
      y += 30;
      add("Speech & Essay Resource for Students", 13, true);
      add("One-minute speech", 15, true);
      add("Good morning respected Principal, teachers and my dear friends. Today I am happy to speak about Raksha Bandhan. This festival is celebrated on the full moon day of Shravana. A rakhi is a simple thread, but it carries a meaningful promise: to care, respect and stand by one another. We often celebrate it with brothers and sisters, but its message reaches friends, cousins and everyone who supports us. Let us use this day to say thank you, share kindly and keep our promises. May the thread of Raksha Bandhan make our relationships stronger. Thank you.");
      add("Two-to-three-minute speech", 15, true);
      add("Good morning respected Principal, teachers and my dear friends. Raksha Bandhan is a festival that turns a small thread into a powerful reminder. Raksha means protection and bandhan means bond. On Shravana Purnima, sisters traditionally tie a rakhi on their brothers' wrists, and families gather with prayers, sweets and good wishes. Yet the heart of the festival is larger than one custom. It asks us to care for the people around us and to use our strength with responsibility. In school, this can mean including someone who feels left out, helping a friend understand a lesson, respecting different opinions and speaking up with kindness. The legends connected with Raksha Bandhan also remind us that trust can grow through compassion and courage. This year, let us make a promise that goes beyond a ribbon: to protect one another's dignity, to be reliable friends and to create homes and classrooms where everyone feels safe. Thank you.");
      add("Essay: Raksha Bandhan", 15, true);
      add("Raksha Bandhan is a cherished Indian festival that celebrates affection, trust and responsibility. It is observed on the full moon day of the Hindu month of Shravana. The words raksha and bandhan mean protection and bond. On this day, a rakhi is tied as a sign of loving care. Families often share sweets, prayers and thoughtful gifts. Although the festival is commonly associated with brothers and sisters, its message is meaningful for cousins, friends and every relationship built on respect. Traditional stories linked with the festival show how compassion and loyalty can create strong bonds. For students, Raksha Bandhan is a chance to think about the promises we make every day. We can protect one another by being kind, listening carefully, refusing to bully, and helping someone who needs support. A rakhi may be made of thread, paper or beads, but the values behind it are lasting. When we act with honesty, gratitude and care, we make the bond of Raksha Bandhan real in our homes, schools and communities.");
      pdf.setDrawColor(gold[0], gold[1], gold[2]);
      pdf.line(margin, 805, 543, 805);
      pdf.setFontSize(8);
      pdf.setTextColor(90, 94, 128);
      pdf.text("Rainbow International School, Thane | Illustrative festive resource", margin, 822);
      pdf.save("raksha-bandhan-2026-speech-and-essay.pdf");
    } catch (error) {
      console.error("Could not create Raksha Bandhan PDF", error);
      window.alert("The PDF could not be prepared. Please try again when you are online.");
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  }
  var dlBtn = document.querySelector(".rb-download");
  if (dlBtn) dlBtn.addEventListener("click", generatePdf);

  /* ---------------- 3D setup ---------------- */
  var hasWebGL = false;
  var bgRenderer, bgScene, bgCam, bgRakhi, cloud1, cloud2, diyaGroup, flames = [];
  var iRenderer, iScene, iCam, iRakhi, confetti = null, confettiData = null, confettiT = 0;
  var rotX = 0, rotY = 0, tRotX = 0.15, tRotY = 0, spinBoost = 0;
  var dragging = false, dragMoved = false, lastX = 0, lastY = 0;
  var curTheme = 0, clock = null;
  var stage = document.querySelector(".rb-stage");
  var hint = document.querySelector(".rb-stage-hint");
  var wishPop = document.querySelector(".rb-wish-pop");
  var wishText = wishPop ? wishPop.querySelector("span") : null;
  var swHost = document.querySelector(".rb-swatches");
  var tieBtn = document.querySelector(".rb-tie-btn");

  var THEMES = [
    { key: "marigold", name: "Marigold", ring: 0xf5b428, inner: 0xff8a3d, center: 0xc0392b, gem: 0xffd977, petalA: 0xf5b428, petalB: 0xff8a3d, thread: 0xe0483e, dots: 0xffd977, bg: ["#f5b428", "#e0483e"] },
    { key: "royal", name: "Royal Navy", ring: 0xd4af37, inner: 0xf5b428, center: 0x1b2468, gem: 0xffd977, petalA: 0xd4af37, petalB: 0xfff6e8, thread: 0x3346b8, dots: 0xf5b428, bg: ["#d4af37", "#1b2468"] },
    { key: "rose", name: "Rose Silk", ring: 0xffd977, inner: 0xe85d75, center: 0xe85d75, gem: 0xfff6e8, petalA: 0xe85d75, petalB: 0xfff0f3, thread: 0xd94f68, dots: 0xffd977, bg: ["#ffd977", "#e85d75"] },
    { key: "peacock", name: "Peacock", ring: 0xf5b428, inner: 0x12a58c, center: 0x0e7c6b, gem: 0x7ce3cf, petalA: 0x12a58c, petalB: 0xffd977, thread: 0x0e7c6b, dots: 0xf5b428, bg: ["#12a58c", "#f5b428"] }
  ];
  var WISHES = [
    "May your bond grow stronger with every knot tied.",
    "To the one who always has your back — happy Raksha Bandhan.",
    "A thread so small, a promise so vast.",
    "May love protect you, today and always.",
    "Here's to the family we're born with — and the family we find."
  ];
  var wishIdx = 0;

  var camKeys = [
    { p: 0.00, cam: [0.0, 0.10, 4.9], look: [0, -0.1, 0], rp: [3.1, 0.55, -2.0], rs: 1.0 },
    { p: 0.14, cam: [0.2, 0.25, 5.4], look: [0.55, 0, 0], rp: [2.15, 0.05, 0], rs: 1.05 },
    { p: 0.28, cam: [-0.2, 0.30, 5.6], look: [-0.55, 0, 0], rp: [-2.15, 0.25, 0], rs: 1.05 },
    { p: 0.42, cam: [0.2, 0.40, 5.8], look: [0.55, 0.1, 0], rp: [2.15, 0.45, 0], rs: 1.05 },
    { p: 0.50, cam: [0.1, 0.50, 6.1], look: [0.2, 0.3, -0.5], rp: [-4.6, 1.4, -2.6], rs: 0.95 },
    { p: 0.60, cam: [0.0, 0.60, 6.4], look: [0, 0.4, -1], rp: [-6.5, 6.2, -8], rs: 0.7 },
    { p: 0.78, cam: [0.0, -0.30, 6.8], look: [0, -1.2, -2], rp: [-7, 9.5, -14], rs: 0.4 },
    { p: 1.00, cam: [0.0, -0.80, 8.2], look: [0, -1.8, -3], rp: [-7, 10.5, -16], rs: 0.3 }
  ];
  function interpKeys(p) {
    var i = 0;
    while (i < camKeys.length - 2 && p > camKeys[i + 1].p) i++;
    var A = camKeys[i], B = camKeys[i + 1];
    var t = smooth(clamp((p - A.p) / (B.p - A.p), 0, 1));
    function L3(a, b) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
    return { cam: L3(A.cam, B.cam), look: L3(A.look, B.look), rp: L3(A.rp, B.rp), rs: lerp(A.rs, B.rs, t) };
  }

  function makeRakhi(THREE, T) {
    var g = new THREE.Group();
    function mat(color, opts) {
      var m = new THREE.MeshStandardMaterial({ color: color, metalness: 0.55, roughness: 0.35 });
      if (opts && opts.emissive) { m.emissive = new THREE.Color(opts.emissive); m.emissiveIntensity = opts.ei || 0.5; }
      return m;
    }
    var ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.17, 24, 72), mat(T.ring));
    g.add(ring);
    var inner = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.06, 16, 60), mat(T.inner));
    inner.position.z = 0.08;
    g.add(inner);
    var med = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.16, 48), mat(T.center));
    med.rotation.x = Math.PI / 2;
    g.add(med);
    var gem = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 18), mat(T.gem, { emissive: T.gem, ei: 0.55 }));
    gem.scale.z = 0.62; gem.position.z = 0.14;
    g.add(gem);
    var i, a;
    for (i = 0; i < 12; i++) {
      a = i / 12 * Math.PI * 2;
      var petal = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 12), mat(i % 2 ? T.petalA : T.petalB));
      petal.scale.z = 0.55;
      petal.position.set(Math.cos(a) * 0.85, Math.sin(a) * 0.85, 0.1);
      g.add(petal);
    }
    for (i = 0; i < 18; i++) {
      a = i / 18 * Math.PI * 2 + 0.17;
      var dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mat(T.dots, { emissive: T.dots, ei: 0.35 }));
      dot.position.set(Math.cos(a) * 1.26, Math.sin(a) * 1.26, 0);
      g.add(dot);
    }
    function threadSide(dir) {
      var pts = [];
      for (var k = 0; k <= 8; k++) {
        var t = k / 8;
        pts.push(new THREE.Vector3(
          dir * (1.15 + t * 2.6),
          Math.sin(t * Math.PI * 1.6 + (dir > 0 ? 0 : 1.1)) * 0.35 * t + (dir > 0 ? -0.05 : 0.05),
          Math.cos(t * Math.PI) * 0.12 * t
        ));
      }
      var curve = new THREE.CatmullRomCurve3(pts);
      var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.045, 8), mat(T.thread));
      g.add(tube);
      [0.4, 0.68, 0.94].forEach(function (u, bi) {
        var p = curve.getPoint(u);
        var bead = new THREE.Mesh(new THREE.SphereGeometry(bi === 2 ? 0.11 : 0.085, 12, 10), mat(bi % 2 ? T.dots : T.inner, { emissive: T.dots, ei: 0.2 }));
        bead.position.copy(p);
        g.add(bead);
      });
    }
    threadSide(1); threadSide(-1);

    /* A small hanging jhumka gives the rakhi a soft, hand-crafted finish. */
    var jhumka = new THREE.Group();
    jhumka.position.set(0, -1.26, 0.06);
    var chainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0.025, -0.16, 0.025),
      new THREE.Vector3(-0.015, -0.34, 0.01)
    ]);
    jhumka.add(new THREE.Mesh(new THREE.TubeGeometry(chainCurve, 18, 0.026, 6), mat(T.thread)));
    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), mat(T.dots, { emissive: T.dots, ei: 0.25 }));
    cap.scale.set(1, 0.48, 0.72); cap.position.y = -0.38; jhumka.add(cap);
    var bell = new THREE.Mesh(new THREE.SphereGeometry(0.26, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), mat(T.ring));
    bell.scale.set(1, 0.82, 0.76); bell.rotation.x = Math.PI; bell.position.y = -0.54; jhumka.add(bell);
    var bellBand = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 10, 28), mat(T.inner));
    bellBand.scale.y = 0.55; bellBand.position.y = -0.62; jhumka.add(bellBand);
    var tasselGem = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), mat(T.gem, { emissive: T.gem, ei: 0.4 }));
    tasselGem.position.y = -0.78; jhumka.add(tasselGem);
    for (i = 0; i < 5; i++) {
      a = -0.42 + i * 0.21;
      var tassel = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), mat(i % 2 ? T.inner : T.dots, { emissive: T.dots, ei: 0.16 }));
      tassel.position.set(Math.sin(a) * 0.25, -0.69 - Math.cos(a) * 0.025, 0.045);
      jhumka.add(tassel);
    }
    jhumka.userData.sway = 0;
    jhumka.userData.velocity = 0;
    g.userData.jhumka = jhumka;
    g.add(jhumka);
    return g;
  }

  function updateJhumka(rakhi, time) {
    if (!rakhi || !rakhi.userData || !rakhi.userData.jhumka) return;
    var tail = rakhi.userData.jhumka;
    var target = Math.sin(rakhi.rotation.y) * 0.28 + Math.sin(time * 1.15) * 0.038 + rakhi.rotation.x * 0.12;
    tail.userData.velocity += (target - tail.userData.sway) * 0.085;
    tail.userData.velocity *= 0.8;
    tail.userData.sway += tail.userData.velocity;
    tail.rotation.z = tail.userData.sway;
    tail.rotation.x = Math.sin(time * 1.6) * 0.035;
  }

  function disposeGroup(g) {
    g.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); });
        else o.material.dispose();
      }
    });
  }
  function glowTexture(THREE) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var ctx = c.getContext("2d");
    var gr = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    gr.addColorStop(0, "rgba(255,214,120,1)");
    gr.addColorStop(0.4, "rgba(255,160,60,0.45)");
    gr.addColorStop(1, "rgba(255,140,40,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  function makeParticles(THREE, n, spread) {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    var palette = [[0.96, 0.71, 0.16], [1, 0.85, 0.47], [1, 0.54, 0.24], [1, 0.96, 0.91], [0.91, 0.36, 0.46]];
    for (var i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.2;
      pos[i * 3 + 2] = (Math.random() - 0.65) * spread * 0.8;
      var c = palette[Math.floor(Math.random() * palette.length)];
      var f = 0.5 + Math.random() * 0.5;
      col[i * 3] = c[0] * f; col[i * 3 + 1] = c[1] * f; col[i * 3 + 2] = c[2] * f;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var m = new THREE.PointsMaterial({
      size: 0.07, vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    return new THREE.Points(geo, m);
  }

  /* build the colour swatches immediately so the picker works even without WebGL */
  function buildSwatches(onPick) {
    if (!swHost || swHost.childElementCount) return;
    THEMES.forEach(function (T, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rb-swatch";
      b.setAttribute("aria-label", "Rakhi colour theme: " + T.name);
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.style.background = "linear-gradient(135deg," + T.bg[0] + " 45%," + T.bg[1] + " 55%)";
      var lbl = document.createElement("span");
      lbl.textContent = T.name;
      b.appendChild(lbl);
      b.addEventListener("click", function () {
        curTheme = i;
        Array.prototype.forEach.call(swHost.children, function (ch) { ch.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        document.documentElement.style.setProperty("--rakhi-theme", T.bg[0]);
        if (typeof onPick === "function") onPick(i);
      });
      swHost.appendChild(b);
    });
  }

  function showWish() {
    if (!wishPop || !wishText) return;
    wishText.textContent = WISHES[wishIdx % WISHES.length];
    wishIdx++;
    wishPop.classList.add("is-on");
    clearTimeout(wishPop._t);
    wishPop._t = setTimeout(function () { wishPop.classList.remove("is-on"); }, 3600);
  }

  /* fallback behaviour before/without three.js */
  buildSwatches(null);
  if (tieBtn) tieBtn.addEventListener("click", showWish);

  var THREE = null;
  function buildInteractiveRakhi() {
    if (!THREE || !iScene) return;
    if (iRakhi) { iScene.remove(iRakhi); disposeGroup(iRakhi); }
    iRakhi = makeRakhi(THREE, THEMES[curTheme]);
    iRakhi.scale.setScalar(0.92);
    iScene.add(iRakhi);
  }

  function detectWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  async function init3D() {
    if (reduced) return;
    if (!detectWebGL()) {
      if (hint) hint.textContent = "Your browser does not support 3D — enjoy the classic view";
      return;
    }
    try {
      THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js");
    } catch (err) {
      console.warn("Raksha Bandhan 3D enhancement unavailable; static artwork remains visible.", err);
      if (hint) hint.textContent = "Enjoy the classic view";
      return;
    }
    hasWebGL = true;
    clock = new THREE.Clock();

    /* background scene */
    if (bgHost) {
      bgRenderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
      bgRenderer.setPixelRatio(DPR);
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
      bgHost.appendChild(bgRenderer.domElement);

      bgScene = new THREE.Scene();
      bgScene.fog = new THREE.FogExp2(0x0a0e33, 0.05);
      bgCam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60);
      bgCam.position.set(0, 0, 5);

      bgScene.add(new THREE.AmbientLight(0x2a3466, 1.6));
      var warm = new THREE.PointLight(0xffd977, 1.6, 40); warm.position.set(4, 5, 6); bgScene.add(warm);
      var cool = new THREE.PointLight(0x4a5cff, 0.9, 40); cool.position.set(-5, -3, 4); bgScene.add(cool);

      bgRakhi = makeRakhi(THREE, THEMES[0]);
      bgRakhi.scale.setScalar(1.05);
      bgScene.add(bgRakhi);

      cloud1 = makeParticles(THREE, isMobile ? 450 : 1100, 12);
      cloud2 = makeParticles(THREE, isMobile ? 250 : 600, 16);
      cloud2.material.size = 0.045;
      cloud2.material.opacity = 0.55;
      bgScene.add(cloud1); bgScene.add(cloud2);

      diyaGroup = new THREE.Group();
      var glowTex = glowTexture(THREE);
      var ND = isMobile ? 8 : 13;
      for (var d = 0; d < ND; d++) {
        var dg = new THREE.Group();
        var body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.13, 0.2, 16),
          new THREE.MeshStandardMaterial({ color: 0x8a4a22, metalness: 0.2, roughness: 0.7 }));
        dg.add(body);
        var flame = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0xffb84d, emissive: 0xff9d2e, emissiveIntensity: 1.6 }));
        flame.scale.y = 1.7; flame.position.y = 0.22;
        dg.add(flame);
        var spr = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9
        }));
        spr.scale.setScalar(1.1); spr.position.y = 0.24;
        dg.add(spr);
        var ang = (d / (ND - 1) - 0.5) * Math.PI * 1.15;
        dg.position.set(Math.sin(ang) * 5.2, -2.4 + Math.cos(ang) * 0.35 - 0.35, -2.5 - Math.cos(ang) * 2.2);
        flames.push({ flame: flame, spr: spr, seed: Math.random() * 10 });
        diyaGroup.add(dg);
      }
      bgScene.add(diyaGroup);

      window.addEventListener("resize", function () {
        bgCam.aspect = window.innerWidth / window.innerHeight;
        bgCam.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    /* interactive stage */
    if (stage) {
      iRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      iRenderer.setPixelRatio(DPR);
      iScene = new THREE.Scene();
      iCam = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
      iCam.position.set(0, 0, 5.4);
      iScene.add(new THREE.AmbientLight(0x39406e, 1.7));
      var iw = new THREE.PointLight(0xffd977, 1.8, 30); iw.position.set(3, 4, 5); iScene.add(iw);
      var ic = new THREE.PointLight(0x5a6cff, 0.8, 30); ic.position.set(-4, -2, 4); iScene.add(ic);
      buildInteractiveRakhi();
      stage.insertBefore(iRenderer.domElement, stage.firstChild);
      stage.classList.add("is-live");

      var sizeStage = function () {
        var r = stage.getBoundingClientRect();
        if (!r.width || !r.height) return;
        iRenderer.setSize(r.width, r.height, false);
        iRenderer.domElement.style.width = "100%";
        iRenderer.domElement.style.height = "100%";
        iCam.aspect = r.width / r.height;
        iCam.updateProjectionMatrix();
      };
      sizeStage();
      window.addEventListener("resize", sizeStage);

      stage.addEventListener("pointerdown", function (e) {
        dragging = true; dragMoved = false; lastX = e.clientX; lastY = e.clientY;
        if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
      });
      window.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX, dy = e.clientY - lastY;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
        tRotY += dx * 0.011;
        tRotX = clamp(tRotX + dy * 0.008, -1.1, 1.1);
        lastX = e.clientX; lastY = e.clientY;
        if (dragMoved && hint) hint.style.opacity = "0";
      });
      window.addEventListener("pointerup", function () { dragging = false; });

      /* rebuild the 3D rakhi when a swatch is picked */
      if (swHost) {
        Array.prototype.forEach.call(swHost.children, function (btn, i) {
          btn.addEventListener("click", function () { curTheme = i; buildInteractiveRakhi(); });
        });
      }

      var burst = function () {
        if (confetti) { iScene.remove(confetti); confetti.geometry.dispose(); confetti.material.dispose(); }
        var n = 160;
        var geo = new THREE.BufferGeometry();
        var pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
        var vel = new Float32Array(n * 3);
        var palette = [[0.96, 0.71, 0.16], [1, 0.85, 0.47], [1, 0.54, 0.24], [0.91, 0.36, 0.46], [1, 0.96, 0.91]];
        for (var i = 0; i < n; i++) {
          pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0.5;
          var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), sp2 = 1.6 + Math.random() * 2.6;
          vel[i * 3] = Math.sin(ph) * Math.cos(th) * sp2;
          vel[i * 3 + 1] = Math.cos(ph) * sp2 * 0.9 + 0.8;
          vel[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * sp2 * 0.6;
          var c = palette[Math.floor(Math.random() * palette.length)];
          col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
        }
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
        confetti = new THREE.Points(geo, new THREE.PointsMaterial({
          size: 0.09, vertexColors: true, transparent: true, opacity: 1,
          blending: THREE.AdditiveBlending, depthWrite: false
        }));
        confettiData = vel;
        confettiT = 0;
        iScene.add(confetti);
      };

      if (tieBtn) {
        tieBtn.addEventListener("click", function () {
          spinBoost += Math.PI * 4;
          burst();
        });
      }
    }
  }

  /* ---------------- master loop ---------------- */
  var running = !document.hidden;
  document.addEventListener("visibilitychange", function () { running = !document.hidden; });

  function tick() {
    requestAnimationFrame(tick);
    if (!running) return;

    scrollPS += (scrollP - scrollPS) * 0.1;
    storyPS += (storyP - storyPS) * 0.1;
    scenePS += (sceneP - scenePS) * 0.085;

    var pct = (scrollPS * 100).toFixed(2);
    if (barEl) barEl.style.width = pct + "%";
    if (fillEl) fillEl.style.height = pct + "%";
    if (knotEl) knotEl.style.top = pct + "%";

    updateParallax();
    updateSceneStory();

    if (celTilt && !reduced) {
      celRotY += (celTX * 6 - celRotY) * 0.06;
      celRotX += (-celTY * 6 - celRotX) * 0.06;
      var drift = 0;
      if (celWrap) {
        var cr = celWrap.getBoundingClientRect();
        if (cr.bottom > 0 && cr.top < window.innerHeight) {
          drift = ((cr.top + cr.height / 2) - window.innerHeight / 2) * 0.05;
        }
      }
      celTilt.style.transform = "rotateX(" + celRotX.toFixed(2) + "deg) rotateY(" + celRotY.toFixed(2) + "deg) translateY(" + drift.toFixed(1) + "px)";
    }

    if (!hasWebGL || !THREE) return;
    var t = clock.getElapsedTime();
    var dt = 0.016;

    if (bgRenderer && window.scrollY < storyEnd + window.innerHeight) {
      var K = interpKeys(storyPS);
      bgCam.position.set(K.cam[0] + mouseX * 0.12, K.cam[1] - mouseY * 0.1, K.cam[2]);
      bgCam.lookAt(K.look[0], K.look[1], K.look[2]);
      bgRakhi.position.set(K.rp[0], K.rp[1] + Math.sin(t * 0.9) * 0.08, K.rp[2]);
      bgRakhi.scale.setScalar(K.rs);
      bgRakhi.rotation.z = t * 0.12;
      bgRakhi.rotation.y = storyPS * Math.PI * 3 + Math.sin(t * 0.5) * 0.15;
      bgRakhi.rotation.x = Math.sin(t * 0.7) * 0.1;
       updateJhumka(bgRakhi, t);

      cloud1.rotation.y = t * 0.02 + storyPS * 1.2;
      cloud2.rotation.y = -t * 0.014 - storyPS * 0.8;
      cloud1.position.y = -storyPS * 1.6;
      cloud2.position.y = -storyPS * 2.4;

      for (var i = 0; i < flames.length; i++) {
        var F = flames[i];
        var sc = 1 + Math.sin(t * 7 + F.seed * 13) * 0.16 + Math.sin(t * 11 + F.seed * 7) * 0.08;
        F.flame.scale.set(sc, 1.7 * sc, sc);
        F.spr.material.opacity = 0.65 + Math.sin(t * 6 + F.seed * 9) * 0.25;
      }
      bgRenderer.render(bgScene, bgCam);
    }

    if (iRenderer && iRakhi) {
      var r = stage.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        if (spinBoost > 0.001) {
          var take = spinBoost * 0.06;
          tRotY += take;
          spinBoost -= take;
        }
        if (!dragging && Math.abs(spinBoost) < 0.01) tRotY += 0.004;
        rotY += (tRotY - rotY) * 0.09;
        rotX += (tRotX - rotX) * 0.09;
        iRakhi.rotation.y = rotY;
        iRakhi.rotation.x = rotX;
        iRakhi.position.y = Math.sin(t * 1.1) * 0.07;
         updateJhumka(iRakhi, t);

        if (confetti) {
          confettiT += dt;
          var parr = confetti.geometry.attributes.position.array;
          for (var ci = 0; ci < parr.length / 3; ci++) {
            parr[ci * 3] += confettiData[ci * 3] * dt;
            parr[ci * 3 + 1] += confettiData[ci * 3 + 1] * dt;
            parr[ci * 3 + 2] += confettiData[ci * 3 + 2] * dt;
            confettiData[ci * 3 + 1] -= 2.4 * dt;
          }
          confetti.geometry.attributes.position.needsUpdate = true;
          confetti.material.opacity = Math.max(0, 1 - confettiT / 2.4);
          if (confettiT > 2.6) {
            iScene.remove(confetti);
            confetti.geometry.dispose();
            confetti.material.dispose();
            confetti = null;
          }
        }
        iRenderer.render(iScene, iCam);
      }
    }
  }

  function boot() { init3D(); measure(); readScroll(); }
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
  tick();
})();
