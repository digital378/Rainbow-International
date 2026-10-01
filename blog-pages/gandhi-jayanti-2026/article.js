(function () {
  "use strict";

  var TITLE = "Gandhi Jayanti 2026: Speech, Essay, Quotes in Hindi & Marathi";
  var FONT_STYLESHEET = "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Noto+Sans+Devanagari:wght@500;600;700&display=swap";
  var QUIZ = [
    { q: "Where was Mahatma Gandhi born?", o: ["Ahmedabad", "Porbandar", "Rajkot", "Wardha"], a: 1, w: "He was born in Porbandar, Gujarat, on 2 October 1869." },
    { q: "In which year was he born?", o: ["1859", "1869", "1879", "1889"], a: 1, w: "Gandhi was born in 1869, so 2026 marks his 157th birth anniversary." },
    { q: "Which 1930 march protested the salt tax?", o: ["Champaran March", "Dandi March", "Kheda March", "Bardoli March"], a: 1, w: "The Dandi Salt March covered about 390 km from Sabarmati to Dandi." },
    { q: "What does Satyagraha mean?", o: ["Fight with force", "Holding firmly to truth", "Boycott of goods", "Fasting for peace"], a: 1, w: "Satya means truth and Agraha means holding firmly." },
    { q: "Which movement had the call of \"Do or Die\"?", o: ["Non-Cooperation", "Civil Disobedience", "Quit India", "Swadeshi"], a: 2, w: "He gave this call in Mumbai on 8 August 1942." },
    { q: "2 October is the UN International Day of what?", o: ["Peace and Freedom", "Non-Violence", "Education", "Youth"], a: 1, w: "The UN General Assembly established it in 2007." },
    { q: "What is the title of Gandhi's autobiography?", o: ["Hind Swaraj", "Discovery of India", "The Story of My Experiments with Truth", "Freedom at Midnight"], a: 2, w: "It tells his life through his experiments with truth." },
    { q: "Which Mumbai house was his base from 1917 to 1934?", o: ["Mani Bhavan", "Jinnah House", "Raj Bhavan", "Sevagram"], a: 0, w: "Mani Bhavan on Laburnum Road is now a museum." },
    { q: "Which 2014 campaign was inspired by his cleanliness message?", o: ["Digital India", "Make in India", "Swachh Bharat Abhiyan", "Skill India"], a: 2, w: "Swachh Bharat Abhiyan was launched on Gandhi Jayanti 2014." },
    { q: "Which Prime Minister was also born on 2 October?", o: ["Jawaharlal Nehru", "Lal Bahadur Shastri", "Indira Gandhi", "Morarji Desai"], a: 1, w: "Lal Bahadur Shastri was born on 2 October 1904." }
  ];

  function start() {
    var host = document.querySelector(".gandhi-jayanti-article");
    if (!host || host.dataset.gandhiArticleReady === "true") return;

    var root = host.shadowRoot;
    if (!root) {
      var template = host.querySelector(":scope > template[shadowrootmode], :scope > template[shadowroot]");
      if (template && host.attachShadow) {
        root = host.attachShadow({ mode: "open" });
        root.appendChild(template.content.cloneNode(true));
        template.remove();
      } else if (host.attachShadow && host.querySelector(".gandhi-article-source")) {
        root = host.attachShadow({ mode: "open" });
        while (host.firstChild) root.appendChild(host.firstChild);
      }
    }
    if (!root) return;

    // Older browsers may leave the declarative template in light DOM instead of
    // consuming it. Import it into the same isolated root in that case.
    if (!root.querySelector(".gandhi-article-source")) {
      var fallbackTemplate = host.querySelector(":scope > template[shadowrootmode], :scope > template[shadowroot]");
      if (fallbackTemplate) {
        root.appendChild(fallbackTemplate.content.cloneNode(true));
        fallbackTemplate.remove();
      }
    }
    var source = root.querySelector(".gandhi-article-source");
    if (!source) return;
    host.dataset.gandhiArticleReady = "true";

    var fontLink = document.querySelector('link[data-gandhi-fonts]');
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = FONT_STYLESHEET;
      fontLink.dataset.gandhiFonts = "true";
      document.head.appendChild(fontLink);
    }

    var staleShadowToast = root.querySelector("#toast");
    if (staleShadowToast) staleShadowToast.remove();
    var toastEl = document.querySelector("[data-gandhi-article-toast]");
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "gandhi-article-toast";
      toastEl.dataset.gandhiArticleToast = "";
      toastEl.className = "fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      toastEl.hidden = true;
      (document.querySelector(".gandhi-page") || document.body).appendChild(toastEl);
    }
    toastEl.className = "fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.hidden = true;

    function showToast(message) {
      toastEl.textContent = message;
      toastEl.hidden = false;
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(function () {
        toastEl.hidden = true;
      }, 1800);
    }

    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          return navigator.clipboard.writeText(text).then(function () {
            return true;
          }, function () {
            return legacyCopy(text);
          });
        } catch (error) {
          return Promise.resolve(legacyCopy(text));
        }
      }
      return Promise.resolve(legacyCopy(text));
    }

    function legacyCopy(text) {
      var input = document.createElement("textarea");
      input.value = text;
      input.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(input);
      input.select();
      var copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      input.remove();
      return copied;
    }

    function shareUrl(text) {
      return "https://wa.me/?text=" + encodeURIComponent(text + "\n" + window.location.href);
    }

    function openWhatsApp(text) {
      window.open(shareUrl(text), "_blank", "noopener,noreferrer");
    }

    function makeIcon(kind) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("aria-hidden", "true");
      var paths = kind === "whatsapp"
        ? ['<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20l1.1-5.4A8.4 8.4 0 1 1 21 11.5Z"/>', '<path d="M8.5 8.5c.5 2.2 2.8 4.5 5 5l1.1-1.1 2 1c-.2 1.2-.9 2-2.1 2-3.8-.2-7.8-4.2-8-8 .1-1.2.8-1.9 2-2.1l1 2-1 1.2Z"/>']
        : ['<rect x="8" y="8" width="13" height="13" rx="2"/>', '<path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'];
      svg.innerHTML = paths.join("");
      return svg;
    }

    function renderHeroShare() {
      var shareHost = root.querySelector(".hero [data-live-share-host]") || root.querySelector(".hero .share-row");
      if (!shareHost) return;
      shareHost.replaceChildren();
      var controls = document.createElement("div");
      controls.setAttribute("aria-label", "Share this article");
      var whatsapp = document.createElement("button");
      whatsapp.type = "button";
      whatsapp.className = "btn btn-primary";
      whatsapp.appendChild(makeIcon("whatsapp"));
      whatsapp.appendChild(document.createTextNode(" Share on WhatsApp"));
      whatsapp.addEventListener("click", function () { openWhatsApp(TITLE); });
      var copy = document.createElement("button");
      copy.type = "button";
      copy.className = "btn btn-ghost";
      copy.appendChild(makeIcon("copy"));
      copy.appendChild(document.createTextNode(" Copy link"));
      copy.addEventListener("click", function () {
        copyText(window.location.href).then(function (copied) {
          showToast(copied ? "Link copied" : "Could not copy link");
        });
      });
      controls.appendChild(whatsapp);
      controls.appendChild(document.createTextNode(" "));
      controls.appendChild(copy);
      shareHost.appendChild(controls);
    }
    renderHeroShare();

    var language = "en";
    var format = "ten";
    var readerSize = 19;
    var isSpeaking = false;
    var reader = root.querySelector(".reader");
    var speech = window.speechSynthesis;

    function stopSpeech() {
      if (speech) speech.cancel();
      isSpeaking = false;
      root.querySelectorAll("[data-listen]").forEach(function (button) {
        button.textContent = "Listen";
        button.setAttribute("aria-pressed", "false");
      });
    }

    function updateReader() {
      if (!reader) return;
      reader.querySelectorAll(".panel").forEach(function (panel) {
        panel.hidden = panel.dataset.lang !== language || panel.dataset.fmt !== format;
      });
      reader.querySelectorAll(".tabs .tab").forEach(function (tab) {
        var selected = tab.dataset.fmt === format;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (tab.firstChild) tab.firstChild.textContent = tab.dataset[language] || tab.textContent || "";
        tab.lang = language;
      });
      reader.querySelectorAll("[data-fs]").forEach(function (button) {
        button.disabled = (readerSize <= 16 && button.dataset.fs === "-1")
          || (readerSize >= 26 && button.dataset.fs === "1");
      });
      reader.querySelectorAll("[data-listen]").forEach(function (button) {
        button.hidden = !("speechSynthesis" in window);
        button.textContent = isSpeaking ? "Stop" : "Listen";
        button.setAttribute("aria-pressed", String(isSpeaking));
      });
      root.querySelectorAll(".langsw button").forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.dataset.lang === language));
      });
    }

    function setReader(nextLanguage, nextFormat) {
      if (nextLanguage) language = nextLanguage;
      if (nextFormat) format = nextFormat;
      stopSpeech();
      updateReader();
    }
    updateReader();

    var faqItems = Array.prototype.slice.call(root.querySelectorAll("#faqs details"));
    faqItems.forEach(function (item) { item.open = false; });

    var genericTabs = Array.prototype.slice.call(root.querySelectorAll("[data-tabs]"));
    function activateGenericTab(box, index) {
      var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
      var panes = Array.prototype.slice.call(box.querySelectorAll("[data-pane]"));
      tabs.forEach(function (tab, tabIndex) {
        var selected = index === tabIndex;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panes.forEach(function (pane, paneIndex) { pane.hidden = paneIndex !== index; });
    }
    genericTabs.forEach(function (box) { activateGenericTab(box, 0); });

    var tocButton = root.querySelector("#tocToggle");
    var tocPanel = root.querySelector("#tocpanel");
    function setTocExpanded(expanded) {
      if (!tocButton || !tocPanel) return;
      tocButton.setAttribute("aria-expanded", String(expanded));
      tocPanel.hidden = !expanded;
    }
    setTocExpanded(false);

    root.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;

      var faqSummary = target.closest("#faqs details summary");
      if (faqSummary) {
        event.preventDefault();
        var faq = faqSummary.closest("details");
        faq.open = !faq.open;
        return;
      }

      var languageButton = target.closest(".langsw button");
      if (languageButton && languageButton.dataset.lang) {
        setReader(languageButton.dataset.lang);
        return;
      }

      var formatButton = target.closest(".reader .tab");
      if (formatButton && formatButton.dataset.fmt) {
        setReader(null, formatButton.dataset.fmt);
        return;
      }

      var sizeButton = target.closest("[data-fs]");
      if (sizeButton) {
        setReader();
        readerSize = Math.max(16, Math.min(26, readerSize + Number(sizeButton.dataset.fs || 0)));
        host.style.setProperty("--reader", readerSize + "px");
        updateReader();
        return;
      }

      var readerCopy = target.closest("[data-rcopy]");
      if (readerCopy) {
        var copyPanel = readerCopy.closest(".panel");
        var readerText = Array.prototype.slice.call(copyPanel ? copyPanel.querySelectorAll(".prose p, .prose li") : [])
          .map(function (element) { return element.textContent.trim(); }).filter(Boolean).join("\n\n");
        copyText(readerText).then(function (copied) {
          showToast(copied ? "Text copied" : "Could not copy text");
        });
        return;
      }

      var listenButton = target.closest("[data-listen]");
      if (listenButton) {
        if (isSpeaking) {
          stopSpeech();
          return;
        }
        var speechPanel = listenButton.closest(".panel");
        var speechText = Array.prototype.slice.call(speechPanel ? speechPanel.querySelectorAll(".prose p, .prose li") : [])
          .map(function (element) { return element.textContent.trim(); }).filter(Boolean).join("\n\n");
        if (speech && speechText && "SpeechSynthesisUtterance" in window) {
          speech.cancel();
          var utterance = new SpeechSynthesisUtterance(speechText);
          utterance.lang = ({ en: "en-IN", hi: "hi-IN", mr: "mr-IN" })[speechPanel.dataset.lang || "en"];
          utterance.rate = 0.92;
          utterance.onend = stopSpeech;
          utterance.onerror = stopSpeech;
          isSpeaking = true;
          updateReader();
          speech.speak(utterance);
        }
        return;
      }

      if (target.closest("[data-print]")) {
        host.toggleAttribute("data-print-reader", true);
        document.documentElement.classList.add("gandhi-print-reader");
        window.setTimeout(function () { window.print(); }, 60);
        return;
      }

      var genericTab = target.closest('[data-tabs] [role="tab"]');
      if (genericTab) {
        var box = genericTab.closest("[data-tabs]");
        var tabIndex = Array.prototype.indexOf.call(box.querySelectorAll('[role="tab"]'), genericTab);
        activateGenericTab(box, tabIndex);
        return;
      }

      var setLanguageLink = target.closest("a[data-setlang]");
      if (setLanguageLink && setLanguageLink.dataset.setlang) {
        event.preventDefault();
        setReader(setLanguageLink.dataset.setlang, setLanguageLink.dataset.setfmt);
        return;
      }

      if (target.closest("#tocToggle")) {
        setTocExpanded(tocButton.getAttribute("aria-expanded") !== "true");
        return;
      }

      var tocLink = target.closest(".tocpanel a");
      if (tocLink) setTocExpanded(false);

      var jumpLink = target.closest('a[href^="#"]');
      if (jumpLink) {
        var id;
        try {
          id = decodeURIComponent(jumpLink.hash.slice(1));
        } catch (error) {
          id = jumpLink.hash.slice(1);
        }
        var section = root.getElementById(id);
        if (section) {
          event.preventDefault();
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }

      var copyLink = target.closest("[data-copylink]");
      if (copyLink) {
        event.preventDefault();
        copyText(window.location.href).then(function (copied) {
          showToast(copied ? "Link copied" : "Could not copy link");
        });
        return;
      }

      var copyTextButton = target.closest("[data-copytext]");
      if (copyTextButton) {
        event.preventDefault();
        copyText(copyTextButton.getAttribute("data-copytext") || "").then(function (copied) {
          showToast(copied ? "Copied" : "Could not copy text");
        });
        return;
      }

      var whatsappLink = target.closest("[data-watext]");
      if (whatsappLink) {
        event.preventDefault();
        openWhatsApp(whatsappLink.getAttribute("data-watext") || TITLE);
      }
    });

    root.addEventListener("keydown", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      if (target.matches(".reader .tab")) {
        var formatTabs = Array.prototype.slice.call(root.querySelectorAll(".reader .tab"));
        var formatIndex = formatTabs.indexOf(target);
        var formatNext = -1;
        if (event.key === "ArrowRight") formatNext = (formatIndex + 1) % formatTabs.length;
        if (event.key === "ArrowLeft") formatNext = (formatIndex - 1 + formatTabs.length) % formatTabs.length;
        if (formatNext >= 0) {
          event.preventDefault();
          setReader(null, formatTabs[formatNext].dataset.fmt);
          formatTabs[formatNext].focus();
        }
      }
      if (target.matches('[data-tabs] [role="tab"]') && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        var box = target.closest("[data-tabs]");
        var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
        var index = tabs.indexOf(target);
        if (!tabs.length) return;
        var next = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        event.preventDefault();
        activateGenericTab(box, next);
        tabs[next].focus();
      }
      if (event.key === "Escape") setTocExpanded(false);
    });

    var countdown = root.querySelector("#cd");
    var countdownTarget = new Date("2026-10-02T00:00:00+05:30").getTime();
    function updateCountdown() {
      if (!countdown) return;
      var delta = countdownTarget - Date.now();
      var message = root.querySelector("#cdmsg");
      if (delta <= 0) {
        countdown.hidden = true;
        if (message) {
          message.textContent = Date.now() < countdownTarget + 86400000
            ? "Today is Gandhi Jayanti. Happy Gandhi Jayanti!"
            : "Gandhi Jayanti 2026 was celebrated on 2 October.";
        }
        return;
      }
      countdown.hidden = false;
      if (message) message.textContent = "";
      var days = root.querySelector("#cd-d");
      var hours = root.querySelector("#cd-h");
      var minutes = root.querySelector("#cd-m");
      if (days) days.textContent = String(Math.floor(delta / 86400000));
      if (hours) hours.textContent = String(Math.floor(delta % 86400000 / 3600000));
      if (minutes) minutes.textContent = String(Math.floor(delta % 3600000 / 60000));
    }
    updateCountdown();
    window.setInterval(updateCountdown, 30000);

    var quizBox = root.querySelector("#quizbox");
    var questionIndex = 0;
    var score = 0;
    function renderQuestion() {
      if (!quizBox) return;
      quizBox.replaceChildren();
      if (questionIndex >= QUIZ.length) {
        var result = document.createElement("div");
        result.className = "qres";
        var resultScore = document.createElement("b");
        resultScore.textContent = score + " / " + QUIZ.length;
        var resultMessage = document.createElement("p");
        resultMessage.textContent = score >= 9
          ? "Gandhi scholar! Outstanding."
          : score >= 6 ? "Well done! You know your Bapu." : "Good start. Read the history section and try again.";
        var restart = document.createElement("button");
        restart.className = "btn btn-primary";
        restart.type = "button";
        restart.textContent = "Play again";
        restart.addEventListener("click", function () {
          questionIndex = 0;
          score = 0;
          renderQuestion();
        });
        var share = document.createElement("button");
        share.className = "btn btn-ghost";
        share.type = "button";
        share.textContent = "Share my score";
        share.addEventListener("click", function () {
          openWhatsApp("I scored " + score + "/" + QUIZ.length + " in the Gandhi Jayanti quiz by Rainbow International School! Try it:");
        });
        result.appendChild(resultScore);
        result.appendChild(resultMessage);
        result.appendChild(restart);
        result.appendChild(document.createTextNode(" "));
        result.appendChild(share);
        quizBox.appendChild(result);
        return;
      }

      var question = QUIZ[questionIndex];
      var progress = document.createElement("div");
      progress.className = "qprog";
      var progressFill = document.createElement("i");
      progressFill.style.width = (questionIndex / QUIZ.length * 100) + "%";
      progress.appendChild(progressFill);
      var meta = document.createElement("div");
      meta.className = "qmeta";
      meta.textContent = "Question " + (questionIndex + 1) + " of " + QUIZ.length;
      var prompt = document.createElement("div");
      prompt.className = "qq";
      prompt.textContent = question.q;
      var options = document.createElement("div");
      options.className = "opts";
      var explanation = document.createElement("div");
      explanation.className = "why";
      explanation.setAttribute("aria-live", "polite");
      var next = document.createElement("button");
      next.className = "btn btn-primary";
      next.type = "button";
      next.hidden = true;
      next.textContent = questionIndex === QUIZ.length - 1 ? "See my score" : "Next question";
      question.o.forEach(function (answer, answerIndex) {
        var option = document.createElement("button");
        option.type = "button";
        option.className = "opt";
        var letter = document.createElement("i");
        letter.textContent = "ABCD"[answerIndex];
        var answerText = document.createElement("span");
        answerText.textContent = answer;
        option.appendChild(letter);
        option.appendChild(answerText);
        option.addEventListener("click", function () {
          Array.prototype.slice.call(options.querySelectorAll(".opt")).forEach(function (item, index) {
            item.disabled = true;
            if (index === question.a) item.classList.add("right");
          });
          if (answerIndex === question.a) score += 1;
          else option.classList.add("wrong");
          explanation.textContent = (answerIndex === question.a ? "Correct. " : "Not quite. ") + question.w;
          next.hidden = false;
          next.focus();
        });
        options.appendChild(option);
      });
      next.addEventListener("click", function () {
        questionIndex += 1;
        renderQuestion();
      });
      quizBox.appendChild(progress);
      quizBox.appendChild(meta);
      quizBox.appendChild(prompt);
      quizBox.appendChild(options);
      quizBox.appendChild(explanation);
      quizBox.appendChild(next);
    }
    renderQuestion();

    var backToTop = root.querySelector("#totop");
    if (!backToTop) {
      backToTop = document.createElement("button");
      backToTop.id = "totop";
      backToTop.type = "button";
      backToTop.setAttribute("aria-label", "Back to top");
      backToTop.textContent = "↑";
      root.appendChild(backToTop);
    }
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    function updateBackToTop() {
      backToTop.classList.toggle("on", window.scrollY > 1200);
    }
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    updateBackToTop();

    window.addEventListener("afterprint", function () {
      host.removeAttribute("data-print-reader");
      document.documentElement.classList.remove("gandhi-print-reader");
    });

    if ("IntersectionObserver" in window) {
      var links = Array.prototype.slice.call(root.querySelectorAll(".tocpanel a, .qj-links a"));
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            var active = link.hash === "#" + entry.target.id;
            link.classList.toggle("active", active);
            if (active && link.closest(".qj-links")) {
              link.scrollIntoView({ inline: "center", block: "nearest" });
            }
          });
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      root.querySelectorAll("article section[id]").forEach(function (section) { spy.observe(section); });

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        var revealTargets = Array.prototype.slice.call(root.querySelectorAll(
          "article>section>.container>*, .portal, .quick, .tiles .tile, .q, .card, .story, .poem, .wish, .about"
        ));
        revealTargets.forEach(function (element, index) {
          element.classList.add("reveal");
          element.style.transitionDelay = Math.min(index % 4, 3) * 70 + "ms";
        });
        var revealObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
        revealTargets.forEach(function (element) { revealObserver.observe(element); });
      }
    }

    function navigateToHash() {
      if (!window.location.hash) return;
      var id;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch (error) {
        id = window.location.hash.slice(1);
      }
      var destination = root.getElementById(id);
      if (destination) destination.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("hashchange", navigateToHash);
    if (window.location.hash) window.setTimeout(navigateToHash, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();