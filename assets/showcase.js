/* Smish site: the device showcase, the scroll progress bar, and the pointer
   spotlight. Vanilla, no dependencies. Everything here checks
   prefers-reduced-motion and degrades to a still, complete page. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll progress ---------- */

  var bar = document.querySelector(".progress");
  if (bar && !reduced) {
    var ticking = false;
    var paint = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = "scaleX(" + p + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* ---------- pointer spotlight ---------- */

  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".spot").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------- the device: tabs + the draft writing itself ---------- */

  var stage = document.querySelector("[data-stage]");
  if (!stage) return;

  var tabs = Array.prototype.slice.call(stage.querySelectorAll("[role=tab]"));
  var screens = Array.prototype.slice.call(stage.querySelectorAll(".screen"));
  if (!tabs.length || !screens.length) return;

  var typed = stage.querySelector(".typed");
  var acts = stage.querySelector(".acts");
  /* The finished sentence lives in the markup, so a reader without JS — or a
     crawler — gets the whole greeting rather than an empty box. */
  var fullText = typed ? typed.textContent.trim() : "";
  var typeTimer = null;

  function stopTyping() {
    clearTimeout(typeTimer);
    typeTimer = null;
    if (typed) typed.classList.remove("is-typing");
  }

  function writeDraft() {
    if (!typed || reduced) { if (acts) acts.classList.add("is-ready"); return; }
    stopTyping();
    if (acts) acts.classList.remove("is-ready");
    typed.textContent = "";
    typed.classList.add("is-typing");

    var i = 0;
    (function step() {
      typed.textContent = fullText.slice(0, ++i);
      if (i < fullText.length) {
        /* uneven cadence reads as writing; a fixed interval reads as a machine */
        var c = fullText.charAt(i - 1);
        var pause = c === "," || c === "!" || c === "." ? 190 : 16 + Math.random() * 30;
        typeTimer = setTimeout(step, pause);
      } else {
        typed.classList.remove("is-typing");
        if (acts) acts.classList.add("is-ready");
      }
    })();
  }

  function select(index, focus) {
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      screens[i].classList.toggle("is-active", on);
      screens[i].hidden = false; /* visibility is the CSS's job, for the fade */
    });
    if (focus) tabs[index].focus();

    stopTyping();
    if (screens[index].getAttribute("data-screen") === "draft") writeDraft();
    else if (typed) { typed.textContent = fullText; if (acts) acts.classList.add("is-ready"); }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { select(i); });
    tab.addEventListener("keydown", function (e) {
      var rtl = document.documentElement.dir === "rtl";
      var back = rtl ? "ArrowRight" : "ArrowLeft";
      var fwd = rtl ? "ArrowLeft" : "ArrowRight";
      var n = null;
      if (e.key === fwd) n = (i + 1) % tabs.length;
      else if (e.key === back) n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();
      select(n, true);
    });
  });

  /* Start on the list; run the draft the first time the phone is on screen,
     so the one animation that matters is not spent before anyone sees it. */
  select(0);

  if ("IntersectionObserver" in window && !reduced) {
    var seen = false;
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || seen) return;
      seen = true;
      setTimeout(function () { select(1); }, 900);
    }, { threshold: 0.35 }).observe(stage.querySelector(".device") || stage);
  }
})();
