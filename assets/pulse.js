/* Pulse Branding redesigned site — interactions.
   Patterns carried over from the Pulse web build: reveal on scroll,
   accordion with rotating plus, animated stats, instant-finding audit. */
(function () {
  "use strict";

  /* ------------------------------------------------ mobile navigation */
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-nav-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "\u00d7" : "\u2261";
    });
  }

  /* ------------------------------------------------ reveal on scroll
     IntersectionObserver plus a rect-based fallback pass: an element must
     never be left invisible because a scroll frame was skipped. */
  var revealables = [].slice.call(document.querySelectorAll(".reveal"));
  function revealVisible() {
    var limit = window.innerHeight + 80;
    for (var i = revealables.length - 1; i >= 0; i--) {
      var el = revealables[i];
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add("in");
        revealables.splice(i, 1);
      }
    }
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
          var idx = revealables.indexOf(e.target);
          if (idx > -1) revealables.splice(idx, 1);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { revealVisible(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  revealVisible();
  // Watchdog: guarantees nothing stays invisible even if scroll frames are skipped
  // (fast flick-scrolling, programmatic scrolls, throttled rAF).
  var watchdog = setInterval(function () {
    revealVisible();
    if (!revealables.length) clearInterval(watchdog);
  }, 350);

  /* ------------------------------------------------ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    if (!q) return;
    q.setAttribute("aria-expanded", item.classList.contains("is-open") ? "true" : "false");
    q.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ------------------------------------------------ animated stats */
  var counters = document.querySelectorAll("[data-count-to]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now();
    var duration = 1800;
    el.textContent = prefix + "0" + suffix;
    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); sio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { sio.observe(el); });
  }

  /* ------------------------------------------------ form feedback (no backend yet) */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = form.querySelector(".form-status");
      if (status) status.textContent = "Thank you. Your message is ready to send — connect the production endpoint to deliver it.";
    });
  });

  /* ------------------------------------------------ audit: instant finding */
  var auditForm = document.querySelector("[data-audit-form]");
  if (auditForm) {
    auditForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var out = document.querySelector("[data-audit-output]");
      if (!out) return;
      var url = (auditForm.querySelector('[name="url"]') || {}).value || "";
      var goal = (auditForm.querySelector('[name="goal"]') || {}).value || "";
      var pain = (auditForm.querySelector('[name="pain"]') || {}).value || "";
      var findings = [];
      var score = 62;
      if (url) { score += 6; findings.push("Presence detected at " + url.replace(/^https?:\/\//, "") + " — crawl depth and message hierarchy are the first things we would test."); }
      else { score -= 8; findings.push("No URL supplied: without a live surface the audit is based on positioning alone."); }
      if (goal) { score += 5; findings.push("Primary goal recorded as \u201c" + goal + "\u201d — the customer journey should be measured against that single outcome."); }
      if (pain && pain.length > 15) { findings.push("Stated friction: the clearest signal in the brief. Repeated friction usually costs more than weak aesthetics."); }
      else { score -= 4; findings.push("The friction description is thin; deeper context raises the quality of the report."); }
      score = Math.max(35, Math.min(94, score));
      findings.push("Recommended next step: confirm the audience, then fix the first three points where the message stops matching intent.");
      out.innerHTML =
        '<p class="label label--accent">(Immediate finding)</p>' +
        '<div class="score">' + score + '</div>' +
        '<p class="muted">Prototype score — direction and clarity, not a grade of the business.</p>' +
        "<ul>" + findings.map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul>" +
        '<p class="muted">The production version analyses the live surface and delivers the full report by email.</p>';
    });
  }

  /* ------------------------------------------------ current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
