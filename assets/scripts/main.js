/* ==================================================================
 * envirisk — hero animations
 * Depends on GSAP 3 core (loaded via CDN in index.html)
 * ================================================================== */

(function () {
  if (typeof gsap === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  /* ================================================================
   * HERO 3 — fused layout (split + simple text) + image slideshow
   * ================================================================ */
  (function initHero3() {
    const hero = document.getElementById("hero3");
    if (!hero) return;

    const q  = s => hero.querySelector(s);
    const qa = s => hero.querySelectorAll(s);

    const eyebrow   = q('[data-hero3="eyebrow"]');
    const lines     = qa('[data-hero3="line"]');
    const sub       = q('[data-hero3="sub"]');
    const ctas      = qa('[data-hero3="ctas"] > a');
    const glow      = q('[data-hero3="glow"]');
    const slideshow = q('[data-hero3="slideshow"]');
    const media     = Array.from(qa('[data-hero3="media"]'));

    // ── Initial states ─────────────────────────────────────────────
    gsap.set(eyebrow,  { opacity: 0, y: 20 });
    gsap.set(lines,    { yPercent: 110 });
    gsap.set(sub,      { opacity: 0, y: 20 });
    gsap.set(ctas,     { opacity: 0, y: 20 });
    gsap.set(glow,     { scale: 0.5, opacity: 0 });
    gsap.set(slideshow,{ opacity: 0, scale: 0.92, y: 30 });
    gsap.set(media,    { opacity: 0 });

    // ── Intro timeline (copy + visual container) ────────────────────
    const tl = gsap.timeline({ delay: 0.15 });

    tl.to(slideshow, { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: "power3.out" }, 0)
      .to(glow,      { opacity: 0.2, scale: 1, duration: 1.4, ease: "power2.out" }, 0)
      .to(eyebrow,   { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.15)
      .to(lines,     { yPercent: 0, duration: 0.9, stagger: 0.1, ease: "expo.out" }, 0.3)
      .to(sub,       { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .to(ctas,      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, "-=0.5");

    // ── Mixed-media montage (trailer-edit rhythm) ───────────────────
    if (!media.length) return;

    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    const images   = media.filter(m => m.dataset.type === "image");
    const motions  = media.filter(m => m.dataset.type === "motion");
    const collages = Array.from(qa('[data-hero3="collage"]'));

    // ── Transition catalogue ────────────────────────────────────────
    // Each transition is: (el) => void. Keep durations SHORT (<=0.5s)
    // so rapid cuts stay punchy; slower ones for "hold" beats.
    const T = {
      hardCut: (el) => gsap.set(el, {
        opacity: 1, scale: 1, x: 0, y: 0, xPercent: 0, yPercent: 0,
        filter: "blur(0px)", clipPath: "none", rotation: 0,
      }),
      flashCut: (el) => {
        gsap.set(el, { opacity: 1, scale: 1 });
        gsap.fromTo(el, { filter: "brightness(3)" },
          { filter: "brightness(1)", duration: 0.18, ease: "power2.out" });
      },
      zoomBlur: (el) => gsap.fromTo(el,
        { opacity: 1, scale: 1.22, filter: "blur(14px)" },
        { scale: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }),
      clipWipeH: (el) => gsap.fromTo(el,
        { opacity: 1, clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "power3.inOut" }),
      clipWipeV: (el) => gsap.fromTo(el,
        { opacity: 1, clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0 0 0 0)", duration: 0.45, ease: "power3.inOut" }),
      slideUp: (el) => gsap.fromTo(el,
        { opacity: 1, yPercent: 100 },
        { yPercent: 0, duration: 0.5, ease: "power4.out" }),
      slideSide: (el) => {
        const dir = Math.random() < 0.5 ? -100 : 100;
        gsap.fromTo(el,
          { opacity: 1, xPercent: dir },
          { xPercent: 0, duration: 0.45, ease: "power4.out" });
      },
      glitch: (el) => {
        gsap.set(el, { opacity: 1, scale: 1, x: 0 });
        const gt = gsap.timeline();
        gt.to(el, { opacity: 0.2, x: -6, duration: 0.035 })
          .to(el, { opacity: 1,   x:  5, duration: 0.035 })
          .to(el, { opacity: 0.5, x: -3, duration: 0.035 })
          .to(el, { opacity: 1,   x:  0, duration: 0.05 });
      },
    };

    // Transition pools by beat type
    const rapidTransitions   = ["hardCut","hardCut","hardCut","flashCut","glitch","clipWipeH","clipWipeV"];
    const holdTransitions    = ["zoomBlur","slideUp","slideSide","clipWipeH","hardCut"];
    const motionTransitions  = ["hardCut","hardCut","flashCut","zoomBlur","glitch"];
    const collageTransitions = ["hardCut","flashCut","zoomBlur","clipWipeV"];

    let lastTransition = null;
    const pickTransition = (pool) => {
      let t;
      do { t = pick(pool); } while (t === lastTransition && pool.length > 1);
      lastTransition = t;
      return t;
    };

    // Pick next item of a given type without repeating the previous
    let lastImage = null, lastMotion = null, lastCollage = null;
    const pickFrom = (pool, lastRef) => {
      if (pool.length <= 1) return pool[0];
      let el; do { el = pick(pool); } while (el === lastRef.value);
      lastRef.value = el; return el;
    };
    const lastImageRef   = { value: null };
    const lastMotionRef  = { value: null };
    const lastCollageRef = { value: null };

    // Hide everything instantly — the "cut" lives in the entry tween
    const hideAll = () => {
      media.forEach(el => gsap.set(el, { opacity: 0 }));
      collages.forEach(el => gsap.set(el, { opacity: 0 }));
    };

    // Micro drift while an image holds — sells the "footage" feel
    const driftTweens = new Map();
    const stopDrift = (el) => {
      const prev = driftTweens.get(el);
      if (prev) { prev.kill(); driftTweens.delete(el); }
    };
    const startDrift = (el, dur) => {
      stopDrift(el);
      const t = gsap.to(el, {
        scale: rand(1.03, 1.07),
        x: rand(-8, 8), y: rand(-6, 6),
        duration: Math.max(dur * 1.5, 1.5),
        ease: "sine.inOut",
      });
      driftTweens.set(el, t);
    };

    const showImage = (dur, pool) => {
      hideAll();
      const el = pickFrom(images, lastImageRef);
      T[pickTransition(pool)](el);
      if (dur > 0.7) startDrift(el, dur);
    };

    const showMotion = () => {
      hideAll();
      const el = pickFrom(motions, lastMotionRef);
      T[pickTransition(motionTransitions)](el);
    };

    const showCollage = () => {
      hideAll();
      const col = pickFrom(collages, lastCollageRef);
      if (!col) return;
      T[pickTransition(collageTransitions)](col);

      // Stagger each tile in for a "filling in" feel on top of the
      // container transition — gives the collage its own mini-rhythm.
      const tiles = col.querySelectorAll('[data-hero3="collage-tile"]');
      gsap.fromTo(tiles,
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, stagger: 0.06, ease: "power3.out" });
    };

    // ── Beat scheduler ──────────────────────────────────────────────
    // Rhythm shape: rapid bursts → hold → motion → rapid → collage …

    const R = () => ({ kind: "rapid",   dur: rand(0.55, 0.8)  }); // visible rapid image
    const H = () => ({ kind: "hold",    dur: rand(1.5, 2.1)   }); // held image
    const M = () => ({ kind: "motion",  dur: rand(1.8, 2.6)   }); // GIF clip (longer so you can watch)
    const C = () => ({ kind: "collage", dur: rand(1.4, 2.0)   }); // multi-image grid moment

    const patterns = [
      () => [R(),R(),R(), H(), M(), R(),R(), C()],
      () => [R(),R(), C(), R(), H(), M(), R(),R()],
      () => [M(), R(),R(),R(), C(), H(), R()],
      () => [C(), R(),R(), H(), R(),R(), M()],
      () => [R(),R(),R(), M(), C(), H(), R(),R()],
      () => [H(), R(),R(), C(), R(), M(), R(),R()],
    ];

    const runBeat = (beat, onDone) => {
      if      (beat.kind === "motion")  showMotion();
      else if (beat.kind === "collage") showCollage();
      else if (beat.kind === "hold")    showImage(beat.dur, holdTransitions);
      else /* rapid */                  showImage(beat.dur, rapidTransitions);
      gsap.delayedCall(beat.dur, onDone);
    };

    const runPattern = () => {
      const beats = pick(patterns)();
      let k = 0;
      const step = () => {
        if (k >= beats.length) { runPattern(); return; }
        runBeat(beats[k++], step);
      };
      step();
    };

    gsap.delayedCall(0.8, runPattern);

    // Ambient glow drift
    gsap.to(glow, {
      x: 40, y: 30,
      duration: 6, yoyo: true, repeat: -1, ease: "sine.inOut",
    });
  })();


  /* ================================================================
   * HERO 2 — full-bleed background + line-mask reveal + ken-burns
   * ================================================================ */
  (function initHero2() {
    const hero2 = document.getElementById("hero2");
    if (!hero2) return;

    const q  = s => hero2.querySelector(s);
    const qa = s => hero2.querySelectorAll(s);

    const bg         = q('[data-hero2="bg"]');
    const glow       = q('[data-hero2="glow"]');
    const metaTop    = q('[data-hero2="meta-top"]');
    const eyebrowLine= q('[data-hero2="eyebrow-line"]');
    const eyebrowTxt = q('[data-hero2="eyebrow-text"]');
    const lines      = qa('[data-hero2="line"]');
    const sub        = q('[data-hero2="sub"]');
    const ctas       = qa('[data-hero2="ctas"] > a');
    const scrollInd  = q('[data-hero2="scroll"]');
    const scrollBar  = q('[data-hero2="scroll-bar"]');

    gsap.set(bg,          { scale: 1.25, opacity: 0 });
    gsap.set(glow,        { scale: 0.3, opacity: 0 });
    gsap.set(metaTop,     { opacity: 0, y: -10 });
    gsap.set(eyebrowLine, { scaleX: 0 });
    gsap.set(eyebrowTxt,  { opacity: 0, x: -8 });
    gsap.set(lines,       { yPercent: 110 });
    gsap.set(sub,         { opacity: 0, y: 20, filter: "blur(12px)" });
    gsap.set(ctas,        { opacity: 0, y: 24 });
    gsap.set(scrollInd,   { opacity: 0, y: 20 });

    const tl = gsap.timeline({ delay: 0.2 });

    tl.to(bg,   { opacity: 1, duration: 1.2, ease: "power2.out" })
      .to(glow, { opacity: 0.3, scale: 1, duration: 1.6, ease: "power2.out" }, 0);

    tl.to(eyebrowLine, { scaleX: 1, duration: 0.7, ease: "expo.out" }, "-=0.7")
      .to(eyebrowTxt,  { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, "-=0.35");

    tl.to(lines, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "expo.out" }, "-=0.35");

    tl.to(sub, {
      opacity: 1, y: 0, filter: "blur(0px)",
      duration: 0.9, ease: "power3.out",
    }, "-=0.8");

    tl.to(ctas, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.5");

    tl.to(metaTop,   { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5")
      .to(scrollInd, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");

    // Ken-Burns background loop
    gsap.to(bg, {
      scale: 1.1, x: -30, y: -20,
      duration: 18, yoyo: true, repeat: -1, ease: "sine.inOut",
    });

    gsap.to(glow, {
      x: 40, y: -30, duration: 8,
      yoyo: true, repeat: -1, ease: "sine.inOut",
    });

    if (scrollBar) {
      gsap.to(scrollBar, {
        y: 56, duration: 1.6, repeat: -1, ease: "power2.in", delay: 2.5,
      });
    }
  })();


  /* ================================================================
   * HERO 1 — split layout, curtain wipe, word punch-in, counter
   * ================================================================ */
  (function initHero1() {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const q  = s => hero.querySelector(s);
    const qa = s => hero.querySelectorAll(s);

    const eyebrow   = q('[data-hero="eyebrow"]');
    const headline  = q('[data-hero="headline"]');
    const underline = q('[data-hero="underline"]');
    const sub       = q('[data-hero="sub"]');
    const ctas      = qa('[data-hero="ctas"] > a');
    const trust     = q('[data-hero="trust"]');
    const visual    = q('[data-hero="visual"]');
    const statCard  = q('[data-hero="stat-card"]');
    const badge     = q('[data-hero="badge"]');
    const glow      = q('[data-hero="glow"]');
    const counterEl = statCard && statCard.querySelector("h3");

    // Inject teal curtain wipe
    const wipe = document.createElement("div");
    wipe.setAttribute("aria-hidden", "true");
    wipe.style.cssText = `
      position:absolute; inset:0; z-index:40; pointer-events:none;
      background:var(--color-icc-2);
      transform-origin:left center; will-change:transform;
    `;
    hero.appendChild(wipe);

    const splitWords = (el) => {
      const frag = document.createDocumentFragment();
      el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(tok));
            } else {
              const w = document.createElement("span");
              w.className = "hero-word inline-block will-change-transform";
              w.textContent = tok;
              frag.appendChild(w);
            }
          });
        } else {
          const wrap = document.createElement("span");
          wrap.className = "hero-word hero-word--rich inline-block will-change-transform";
          wrap.appendChild(node.cloneNode(true));
          frag.appendChild(wrap);
        }
      });
      el.innerHTML = "";
      el.appendChild(frag);
      return el.querySelectorAll(".hero-word");
    };

    const words       = splitWords(headline);
    const clarityWord = headline.querySelector(".hero-word--rich");

    gsap.set(wipe,      { scaleX: 1 });
    gsap.set(eyebrow,   { opacity: 0, x: -24 });
    gsap.set(words,     { opacity: 0, y: 60, scale: 2, rotation: -4, transformOrigin: "50% 100%" });
    if (clarityWord) gsap.set(clarityWord, { scale: 3, rotation: -10 });
    gsap.set(underline, { scaleX: 0 });
    gsap.set(sub,       { opacity: 0, y: 20 });
    gsap.set(ctas,      { opacity: 0, y: 20, scale: 0.9 });
    gsap.set(trust,     { opacity: 0, y: 14 });
    gsap.set(visual,    { clipPath: "inset(100% 0% 0% 0%)", scale: 1.15, opacity: 1 });
    gsap.set(statCard,  { opacity: 0, scale: 0.6, y: 30, transformOrigin: "center center" });
    gsap.set(badge,     { opacity: 0, scale: 0.5, y: -20 });
    gsap.set(glow,      { scale: 0.4, opacity: 0 });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to(wipe, {
      scaleX: 0, transformOrigin: "right center",
      duration: 0.9, ease: "power4.inOut",
    });

    tl.to(glow, { opacity: 0.2, scale: 1, duration: 1.4, ease: "power2.out" }, 0);

    tl.to(visual, {
      clipPath: "inset(0% 0% 0% 0%)", scale: 1,
      duration: 1.1, ease: "power3.out",
    }, "-=0.6");

    tl.to(eyebrow, { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" }, "-=0.85");

    tl.to(words, {
      opacity: 1, y: 0, scale: 1, rotation: 0,
      duration: 0.7, stagger: 0.09, ease: "back.out(1.9)",
    }, "-=0.55");

    tl.to(underline, { scaleX: 1, duration: 0.6, ease: "expo.out" }, "-=0.2");
    if (clarityWord) {
      tl.fromTo(clarityWord,
        { filter: "brightness(2)" },
        { filter: "brightness(1)", duration: 0.6, ease: "power2.out" },
        "<"
      );
    }

    tl.to(sub,   { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "-=0.3")
      .to(ctas,  { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1, ease: "back.out(2)" }, "-=0.35")
      .to(trust, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "-=0.3");

    tl.to(statCard, {
      opacity: 1, scale: 1, y: 0,
      duration: 0.7, ease: "back.out(2.2)",
    }, "-=1.1");

    if (counterEl) {
      const counterObj = { val: 0 };
      const suffix = counterEl.querySelector("span");
      tl.to(counterObj, {
        val: 42, duration: 1.1, ease: "power2.out",
        onUpdate: () => { counterEl.firstChild.nodeValue = Math.round(counterObj.val); },
        onComplete: () => {
          if (suffix && !counterEl.contains(suffix)) counterEl.appendChild(suffix);
        }
      }, "-=0.55");
    }

    tl.to(badge, {
      opacity: 1, scale: 1, y: 0,
      duration: 0.55, ease: "back.out(2.5)",
    }, "-=0.8");

    // Ambient idle loops
    gsap.to(glow,     { x: 60, y: 40, duration: 7, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(statCard, { y: "+=8", duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.5 });
    gsap.to(badge,    { y: "+=6", duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.8 });

    // Desktop mouse parallax
    if (window.matchMedia("(min-width: 1024px)").matches && visual) {
      const visualWrap = visual.parentElement;
      visualWrap.addEventListener("mousemove", (e) => {
        const r = visualWrap.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        gsap.to(visual,   { x: x * 14, y: y * 14, duration: 0.6, ease: "power2.out" });
        gsap.to(statCard, { x: x * -20, y: y * -20, duration: 0.8, ease: "power2.out" });
        gsap.to(badge,    { x: x * 18, y: y * 18, duration: 0.8, ease: "power2.out" });
      });
      visualWrap.addEventListener("mouseleave", () => {
        gsap.to([visual, statCard, badge], { x: 0, y: 0, duration: 0.8, ease: "power3.out" });
      });
    }
  })();

})();
