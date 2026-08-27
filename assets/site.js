/* Smish site behaviour: the hero's firefly sky, and scroll reveal.
   Vanilla, no dependencies. Both bow out under prefers-reduced-motion. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mark the document as scripted only once we know we can undo it again —
     otherwise a script error would leave every revealed section invisible. */
  document.documentElement.classList.add("js");

  /* ---------- scroll reveal ---------- */

  var revealables = document.querySelectorAll(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    for (var i = 0; i < revealables.length; i++) revealables[i].classList.add("is-in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.06 });

    revealables.forEach(function (el, n) {
      el.style.transitionDelay = Math.min(n % 4, 3) * 70 + "ms";
      io.observe(el);
    });
  }

  /* ---------- the firefly sky ---------- */

  var canvas = document.querySelector(".hero__sky");
  if (!canvas || reduced) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var flies = [];
  var w = 0, h = 0, dpr = 1, raf = null;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    /* Density scales with area so a phone does not get a swarm. */
    var count = Math.max(10, Math.min(34, Math.round((w * h) / 26000)));
    flies = [];
    for (var i = 0; i < count; i++) {
      flies.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.9 + Math.random() * 1.7,
        /* drift, in px per second */
        vx: (Math.random() - 0.5) * 11,
        vy: (Math.random() - 0.5) * 8,
        phase: Math.random() * Math.PI * 2,
        /* each fly breathes at its own unhurried rate */
        rate: 0.35 + Math.random() * 0.5,
        warm: Math.random() < 0.72
      });
    }
  }

  var last = 0;

  function frame(now) {
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;

    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < flies.length; i++) {
      var f = flies[i];

      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.phase += f.rate * dt * Math.PI * 2;

      /* wrap, with a margin so nothing pops at the edge */
      var m = 24;
      if (f.x < -m) f.x = w + m;
      if (f.x > w + m) f.x = -m;
      if (f.y < -m) f.y = h + m;
      if (f.y > h + m) f.y = -m;

      /* 0..1, mostly dim with an occasional swell */
      var pulse = (Math.sin(f.phase) + 1) / 2;
      var alpha = 0.10 + Math.pow(pulse, 2.2) * 0.55;

      var glow = f.r * 7;
      var grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glow);
      var core = f.warm ? "246, 200, 122" : "157, 190, 143";
      grad.addColorStop(0, "rgba(" + core + "," + alpha + ")");
      grad.addColorStop(0.32, "rgba(233, 168, 92," + alpha * 0.28 + ")");
      grad.addColorStop(1, "rgba(233, 168, 92, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(" + core + "," + Math.min(1, alpha + 0.22) + ")";
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  resize();
  start();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 180);
  });

  /* Don't burn a phone battery animating a hero nobody is looking at. */
  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe(canvas);
  }
})();
