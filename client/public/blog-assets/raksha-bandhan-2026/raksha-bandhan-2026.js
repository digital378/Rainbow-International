(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wishes = [
    "May every thread remind us to care for one another.",
    "A promise of kindness can be the strongest bond.",
    "Celebrating the people who make us feel safe and seen.",
    "May your home be filled with warmth, laughter, and trust."
  ];

  function updateProgress() {
    const root = document.documentElement;
    const progress = Math.min(100, Math.max(0, (window.scrollY / (root.scrollHeight - window.innerHeight)) * 100));
    const bar = document.querySelector(".rb-progress > span");
    if (bar) bar.style.width = `${progress}%`;
  }

  function setupControls() {
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    const themes = document.querySelectorAll(".rb-theme");
    themes.forEach((button) => button.addEventListener("click", () => {
      themes.forEach((theme) => theme.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      document.documentElement.style.setProperty("--rakhi-theme", button.dataset.theme || "#a82542");
      window.dispatchEvent(new CustomEvent("rb-theme", { detail: button.dataset.theme }));
    }));
    document.querySelector(".rb-action")?.addEventListener("click", () => {
      const stage = document.querySelector(".rb-tie-stage");
      stage?.classList.remove("is-tied");
      requestAnimationFrame(() => stage?.classList.add("is-tied"));
      const wish = document.querySelector(".rb-wish");
      if (wish) wish.textContent = wishes[Math.floor(Math.random() * wishes.length)];
    });
    document.querySelector(".rb-download")?.addEventListener("click", generatePdf);
  }

  async function generatePdf(event) {
    const button = event.currentTarget;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Preparing your PDF…";
    try {
      const { jsPDF } = await import("https://cdn.jsdelivr.net/npm/jspdf@4.2.1/+esm");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const navy = [16, 23, 79];
      const gold = [245, 180, 40];
      const margin = 52;
      let y = 72;
      const add = (text, size = 11, bold = false) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(...navy);
        const lines = pdf.splitTextToSize(text, 491);
        if (y + lines.length * (size + 5) > 770) { pdf.addPage(); y = 62; }
        pdf.text(lines, margin, y);
        y += lines.length * (size + 5) + 15;
      };
      pdf.setFillColor(...navy);
      pdf.rect(0, 0, 595, 36, "F");
      pdf.setTextColor(...gold);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("RAINBOW INTERNATIONAL SCHOOL  |  PASSION FOR EXCELLENCE", margin, 23);
      pdf.setTextColor(...navy);
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
      pdf.setDrawColor(...gold);
      pdf.line(margin, 805, 543, 805);
      pdf.setFontSize(8);
      pdf.setTextColor(90, 94, 128);
      pdf.text("Rainbow International School, Thane | Illustrative festive resource", margin, 822);
      pdf.save("raksha-bandhan-2026-speech-and-essay.pdf");
    } catch (error) {
      console.error("Could not create Raksha Bandhan PDF", error);
      alert("The PDF could not be prepared. Please try again when you are online.");
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  async function initThree() {
    if (reducedMotion) return;
    const heroHost = document.querySelector(".rb-scene");
    const tieHost = document.querySelector(".rb-tie-stage");
    if (!heroHost || !tieHost) return;
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2", { powerPreference: "high-performance" })
      || probe.getContext("webgl", { powerPreference: "high-performance" });
    if (!context) return;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    try {
      const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js");
      const lowPower = window.innerWidth < 760;
      const makeRakhi = (theme = 0xa82542) => {
        const group = new THREE.Group();
        const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xf5b428, metalness: .68, roughness: .24 });
        const redMaterial = new THREE.MeshStandardMaterial({ color: theme, metalness: .1, roughness: .38 });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.18, .1, 20, 70), goldMaterial);
        group.add(ring);
        const medallion = new THREE.Mesh(new THREE.CylinderGeometry(.42, .12, 40), redMaterial);
        medallion.rotation.x = Math.PI / 2;
        group.add(medallion);
        const inner = new THREE.Mesh(new THREE.TorusGeometry(.28, .045, 14, 32), goldMaterial);
        inner.rotation.x = Math.PI / 2;
        inner.position.z = .08;
        group.add(inner);
        const thread = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 5.4, 12), new THREE.MeshStandardMaterial({ color: 0xd64043, roughness: .5 }));
        thread.rotation.z = Math.PI / 2;
        group.add(thread);
        for (let index = 0; index < 16; index++) {
          const a = (index / 16) * Math.PI * 2;
          const bead = new THREE.Mesh(new THREE.SphereGeometry(.075, 12, 12), goldMaterial);
          bead.position.set(Math.cos(a) * 1.18, Math.sin(a) * 1.18, .05);
          group.add(bead);
        }
        return { group, redMaterial };
      };
      const buildScene = (host, interactive = false) => {
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !lowPower });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
        camera.position.z = 6.6;
        scene.add(new THREE.HemisphereLight(0xffe3a0, 0x10174f, 2.6));
        const key = new THREE.PointLight(0xffa840, 22, 16);
        key.position.set(2.5, 2, 5);
        scene.add(key);
        const rakhi = makeRakhi();
        rakhi.group.rotation.set(.26, -.3, .2);
        scene.add(rakhi.group);
        const particles = new THREE.Points(
          new THREE.BufferGeometry(),
          new THREE.PointsMaterial({ color: 0xf5b428, size: .03, transparent: true, opacity: .65 })
        );
        const count = lowPower ? 45 : 105;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = (Math.random() - .5) * 7;
          positions[i + 1] = (Math.random() - .5) * 5;
          positions[i + 2] = (Math.random() - .5) * 2;
        }
        particles.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        scene.add(particles);
        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        let isVisible = !document.hidden;
        document.addEventListener("visibilitychange", () => { isVisible = !document.hidden; });
        window.addEventListener("resize", resize, { passive: true });
        resize();
        return { renderer, scene, camera, rakhi, particles, get visible() { return isVisible; } };
      };
      const hero = buildScene(heroHost);
      const tie = buildScene(tieHost, true);
      document.querySelector(".rb-cinematic")?.classList.add("rb-three-ready");
      tieHost.classList.add("rb-tie-ready");
      let drag = false;
      let previousX = 0;
      tie.renderer.domElement.addEventListener("pointerdown", (event) => { drag = true; previousX = event.clientX; tie.renderer.domElement.setPointerCapture(event.pointerId); });
      tie.renderer.domElement.addEventListener("pointermove", (event) => {
        if (!drag) return;
        tie.rakhi.group.rotation.y += (event.clientX - previousX) * .012;
        previousX = event.clientX;
      });
      tie.renderer.domElement.addEventListener("pointerup", () => { drag = false; });
      window.addEventListener("rb-theme", (event) => tie.rakhi.redMaterial.color.set(event.detail));
      const clock = new THREE.Clock();
      const render = () => {
        requestAnimationFrame(render);
        if (!hero.visible) return;
        const time = clock.getElapsedTime();
        const progress = Math.min(1, window.scrollY / Math.max(1, heroHost.parentElement.offsetHeight));
        hero.rakhi.group.rotation.z = .2 + progress * 1.7 + Math.sin(time * .35) * .08;
        hero.rakhi.group.position.set(.8 - progress * 2.4, .2 + Math.sin(time * .7) * .2, 0);
        hero.camera.position.y = progress * .55;
        hero.particles.rotation.z = time * .025;
        tie.rakhi.group.rotation.z += .0025;
        tie.particles.rotation.z = -time * .03;
        hero.renderer.render(hero.scene, hero.camera);
        tie.renderer.render(tie.scene, tie.camera);
      };
      render();
    } catch (error) {
      console.warn("Raksha Bandhan 3D enhancement unavailable; static artwork remains visible.", error);
    }
  }

  setupControls();
  const start = () => initThree();
  if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 1400 });
  else window.setTimeout(start, 600);
})();