(() => {
  "use strict";

  const header = document.querySelector("[data-chrome-header]");
  const breadcrumb = document.querySelector("[data-chrome-breadcrumb]");
  const logo = document.querySelector("[data-chrome-logo]");
  const progress = document.getElementById("progress");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuButton = document.querySelector('[data-testid="button-mobile-menu"]');

  function updateHeaderHeight() {
    if (!header || !breadcrumb) return;
    const height = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--chrome-header-height", `${height}px`);
    document.documentElement.style.setProperty("--gandhi-header-height", `${height}px`);
  }

  const headerObserver = header && "ResizeObserver" in window
    ? new ResizeObserver(updateHeaderHeight)
    : null;
  if (headerObserver) headerObserver.observe(header);
  updateHeaderHeight();

  function setDropdown(button, open) {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;
    button.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    button.querySelector("svg")?.classList.toggle("rotate-180", open);
  }

  function closeDesktopDropdowns(except) {
    document.querySelectorAll("[data-dropdown-toggle]").forEach(button => {
      if (button !== except) setDropdown(button, false);
    });
  }

  document.querySelectorAll("[data-dropdown-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      closeDesktopDropdowns(button);
      setDropdown(button, open);
    });
  });

  document.querySelectorAll("[data-mobile-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;
      const open = button.getAttribute("aria-expanded") !== "true";
      if (open) {
        document.querySelectorAll("[data-mobile-toggle]").forEach(otherButton => {
          if (otherButton === button) return;
          otherButton.setAttribute("aria-expanded", "false");
          otherButton.querySelector("svg")?.classList.remove("rotate-180");
          const otherPanel = document.getElementById(otherButton.getAttribute("aria-controls"));
          if (otherPanel) otherPanel.hidden = true;
        });
      }
      button.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      button.querySelector("svg")?.classList.toggle("rotate-180", open);
    });
  });

  function setMobileMenu(open) {
    if (!mobileMenu || !mobileMenuButton) return;
    mobileMenu.hidden = !open;
    mobileMenu.classList.toggle("hidden", !open);
    mobileMenuButton.setAttribute("aria-expanded", String(open));
    mobileMenuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    const icon = mobileMenuButton.querySelector("svg");
    if (icon) {
      icon.outerHTML = open
        ? '<svg data-menu-icon="close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>'
        : '<svg data-menu-icon="open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu" aria-hidden="true"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>';
    }
    if (!open) {
      document.querySelectorAll("[data-mobile-toggle]").forEach(button => {
        button.setAttribute("aria-expanded", "false");
        button.querySelector("svg")?.classList.remove("rotate-180");
      });
      document.querySelectorAll("[data-mobile-panel]").forEach(panel => { panel.hidden = true; });
    }
    updateHeaderHeight();
  }

  mobileMenuButton?.addEventListener("click", () => {
    setMobileMenu(mobileMenu?.hidden ?? true);
  });

  mobileMenu?.addEventListener("click", event => {
    if (event.target.closest("a") && event.target.closest("a").target !== "_blank") {
      setMobileMenu(false);
    }
  });

  document.addEventListener("click", event => {
    const desktopMenuLink = event.target.closest("[data-dropdown-panel] a");
    if (desktopMenuLink) {
      const panel = desktopMenuLink.closest("[data-dropdown-panel]");
      const button = panel && document.querySelector(`[aria-controls="${panel.id}"][data-dropdown-toggle]`);
      if (button) setDropdown(button, false);
      return;
    }
    if (!event.target.closest("[data-dropdown-toggle], [data-dropdown-panel]")) {
      closeDesktopDropdowns();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const expandedDesktopButton = document.querySelector('[data-dropdown-toggle][aria-expanded="true"]');
    closeDesktopDropdowns();
    if (expandedDesktopButton) {
      expandedDesktopButton.focus();
      return;
    }
    const expandedMobileGroup = document.querySelector('[data-mobile-toggle][aria-expanded="true"]');
    if (expandedMobileGroup) {
      const panel = document.getElementById(expandedMobileGroup.getAttribute("aria-controls"));
      expandedMobileGroup.setAttribute("aria-expanded", "false");
      expandedMobileGroup.querySelector("svg")?.classList.remove("rotate-180");
      if (panel) panel.hidden = true;
      expandedMobileGroup.focus();
    } else if (mobileMenu && !mobileMenu.hidden) {
      setMobileMenu(false);
      mobileMenuButton?.focus();
    }
  });

  let scrollFrame = 0;
  function updateOnScroll() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      const scrolled = window.scrollY > 60;
      if (logo) {
        logo.classList.toggle("h-12", scrolled);
        logo.classList.toggle("h-14", !scrolled);
      }
      if (progress) {
        const maximum = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = maximum > 0 ? Math.min(100, Math.max(0, window.scrollY / maximum * 100)) : 0;
        progress.style.width = `${percentage}%`;
      }
      updateHeaderHeight();
    });
  }

  window.addEventListener("scroll", updateOnScroll, { passive: true });
  window.addEventListener("resize", updateHeaderHeight, { passive: true });
  updateOnScroll();

  // The live Gandhi page is excluded from the chatbot but retains the site's
  // deferred fine-pointer rainbow trail.
  if (!window.matchMedia("(pointer: coarse)").matches) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "rainbow-cursor-trail";
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999";
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d");
    if (context) {
      const colors = ["#ff0000", "#ff6600", "#ffcc00", "#00cc00", "#0066ff", "#9900ff", "#ff00cc", "#00ccff", "#66ff00", "#ff3399"];
      const particles = [];
      let lastPosition = null;
      let animationFrame = 0;
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      const spawn = (x, y) => {
        if (lastPosition) {
          const dx = x - lastPosition.x;
          const dy = y - lastPosition.y;
          if (dx * dx + dy * dy < 16) return;
        }
        lastPosition = { x, y };
        const count = 4 + Math.floor(Math.random() * 3);
        for (let index = 0; index < count; index += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.4 + Math.random() * 1.2;
          particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.6,
            radius: 1.5 + Math.random() * 2.5,
            alpha: 1,
            decay: 0.016 + Math.random() * 0.02,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      };
      const onMouseMove = event => spawn(event.clientX, event.clientY);
      const onTouchMove = event => {
        for (const touch of event.touches) spawn(touch.clientX, touch.clientY);
      };
      const animate = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let index = particles.length - 1; index >= 0; index -= 1) {
          const particle = particles[index];
          if (particle.alpha <= 0.01) {
            particles.splice(index, 1);
            continue;
          }
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fillStyle = particle.color;
          context.globalAlpha = particle.alpha;
          context.fill();
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.04;
          particle.radius *= 0.97;
          particle.alpha -= particle.decay;
        }
        context.globalAlpha = 1;
        animationFrame = window.requestAnimationFrame(animate);
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      animate();
      window.addEventListener("pagehide", () => {
        window.removeEventListener("resize", resizeCanvas);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("touchmove", onTouchMove);
        window.cancelAnimationFrame(animationFrame);
        canvas.remove();
      }, { once: true });
    } else {
      canvas.remove();
    }
  }
})();