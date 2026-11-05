"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { type ReactNode, useEffect } from "react";
import { nav } from "@/content/home";

const STRIPES = 5;
const PHONE_QUERY = "(max-width: 800px)";
const CURTAIN_MAX_WAIT_MS = 5000;

type From = gsap.TweenVars;
type Move = { els: gsap.TweenTarget; from: From; dur: number; at: number; stagger?: number };

/** The values each animated property settles on. */
function settled(from: From): From {
  const shown: From = {};
  for (const key of Object.keys(from)) {
    shown[key] = key === "filter" ? "blur(0px)" : key === "opacity" ? 1 : 0;
  }
  return shown;
}

function buildEffects(
  context: gsap.Context,
  releaseHeroInto: (timeline: gsap.core.Timeline) => void,
) {
  const isPhone = window.matchMedia(PHONE_QUERY).matches;
  // Animated blur pops on iOS Safari while scrolling, so phones get slide and fade only.
  const blur = (px: number): From => (isPhone ? {} : { filter: `blur(${px}px)` });
  const splitLines = (element: Element | null) =>
    element ? SplitText.create(element, { type: "lines", linesClass: "reveal-line" }).lines : [];

  // Hero: enters once after the curtain, then fades out with scroll.
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const lines = splitLines(hero.querySelector("[data-lines]"));
    const eyebrow = hero.querySelector("[data-eyebrow]");
    const small = hero.querySelectorAll("[data-small]");
    const media = hero.querySelector("[data-media]");

    // The exit waits for the entrance to land, or a refresh would stamp its start values
    // over the running entrance.
    const armExit = () =>
      context.add(() => {
        gsap
          .timeline({
            defaults: { ease: "power2.in" },
            scrollTrigger: { trigger: hero, start: "top top", end: "40% top", scrub: 1.2 },
          })
          .fromTo(lines, { x: 0, opacity: 1 }, { x: -120, opacity: 0, duration: 1 }, 0)
          .fromTo([eyebrow, ...small], { y: 0, opacity: 1 }, { y: -30, opacity: 0, duration: 0.8 }, 0);
      });

    const entrance = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.out" },
      onComplete: armExit,
    });
    entrance
      .from(media, { scale: 1.14, duration: 2.8 }, 0)
      .from(lines, { x: -120, opacity: 0, ...blur(22), duration: 2, stagger: 0.14 }, 0.1)
      .from(eyebrow, { x: 120, opacity: 0, ...blur(9), duration: 1.4 }, 0.5)
      .from(small, { y: 40, opacity: 0, ...blur(7), duration: 1.4, stagger: 0.12 }, 0.7);

    releaseHeroInto(entrance);
  }

  // Photo chapters: a scroll-tied reveal, mirrored on the way out.
  gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((chapter) => {
    const once = chapter.dataset.chapter === "once";
    // On phones a chapter can be taller than the screen, so its text must not fade out early.
    const mirror = chapter.dataset.chapter === "mirror" && !isPhone;
    const side = chapter.dataset.align === "right" ? 1 : -1;

    const media = chapter.querySelector("[data-media]");
    if (media) {
      gsap.fromTo(
        media,
        { scale: 1.14 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: chapter, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }

    const moves: Move[] = [
      { els: chapter.querySelectorAll("[data-number]"), from: { y: 30, opacity: 0 }, dur: 1.2, at: 0 },
      {
        els: splitLines(chapter.querySelector("[data-lines]")),
        from: { x: side * 140, opacity: 0, ...blur(22) },
        dur: 2.2,
        at: 0.1,
        stagger: 0.14,
      },
      {
        els: chapter.querySelector("[data-eyebrow]"),
        from: { x: side * 160, opacity: 0, ...blur(9) },
        dur: 1.4,
        at: 0.5,
      },
      { els: chapter.querySelector("[data-lede]"), from: { y: 46, opacity: 0, ...blur(7) }, dur: 1.4, at: 0.7 },
      { els: chapter.querySelectorAll("[data-figs] > *"), from: { y: 36, opacity: 0 }, dur: 1.2, at: 0.9, stagger: 0.1 },
    ].filter((move) => gsap.utils.toArray(move.els).length > 0);

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: once
        ? { trigger: chapter, start: "top 70%", once: true }
        : { trigger: chapter, start: "top 50%", end: "top -50%", scrub: 1.5 },
    });

    const inEnd = Math.max(
      ...moves.map(
        (move) =>
          move.at + move.dur + (move.stagger ?? 0) * (gsap.utils.toArray(move.els).length - 1),
      ),
    );

    moves.forEach((move) => {
      timeline.fromTo(
        move.els,
        move.from,
        { ...settled(move.from), duration: move.dur, stagger: move.stagger },
        move.at,
      );
    });

    if (mirror) {
      moves.forEach((move) => {
        timeline.to(
          move.els,
          { ...move.from, ease: "power3.in", duration: move.dur, stagger: move.stagger },
          inEnd * 2 - move.at - move.dur,
        );
      });
    } else if (!once) {
      // Without an exit, a held tail keeps the entrance finishing at the same scroll point.
      timeline.to({}, { duration: inEnd });
    }
  });

  // Blocks whose content React updates or the user types into: only the wrapper moves.
  gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((element) => {
    gsap.from(element, {
      y: 50,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: element, start: "top 95%", once: true },
    });
  });
}

/** Lifts the stripe curtain once fonts and the hero photo are ready. */
function playCurtain(curtain: HTMLElement, onLifted: () => void) {
  const percent = curtain.querySelector("[data-percent]");
  const wordmark = curtain.querySelector<HTMLElement>("[data-curtain-mark]");
  const progress = { value: 0 };

  const paint = () => {
    if (percent) percent.textContent = String(Math.round(progress.value * 100));
    if (wordmark) wordmark.style.filter = `blur(${(1 - progress.value) * 22}px)`;
  };
  paint();

  let liftTimeline: gsap.core.Timeline | null = null;
  const lift = () => {
    liftTimeline = gsap
      .timeline({ onComplete: () => gsap.set(curtain, { display: "none" }) })
      .to(curtain.querySelector("[data-curtain-center]"), { opacity: 0, duration: 0.45, ease: "power2.in" }, 0)
      .to(
        curtain.querySelectorAll("[data-stripe]"),
        { yPercent: -100, duration: 0.8, ease: "power4.inOut", stagger: 0.05 },
        0.15,
      )
      .add(onLifted, 0.75);
  };

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    gsap.to(progress, { value: 1, duration: 0.7, ease: "power2.out", onUpdate: paint, onComplete: lift });
  };

  const heroImage = document.querySelector<HTMLImageElement>("[data-hero] img");
  Promise.all([document.fonts.ready, heroImage?.decode().catch(() => undefined)]).then(finish);
  // A stalled asset must never trap the visitor behind the curtain.
  const timeout = gsap.delayedCall(CURTAIN_MAX_WAIT_MS / 1000, finish);

  return () => {
    finished = true;
    timeout.kill();
    gsap.killTweensOf(progress);
    liftTimeline?.kill();
  };
}

export function ScrollEffects({ children }: { children: ReactNode }) {
  useEffect(() => {
    const curtain = document.querySelector<HTMLElement>("[data-curtain]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (curtain) curtain.style.display = "none";
      return;
    }

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
    window.history.scrollRestoration = "manual";

    // Touch screens keep native scrolling. It handles keyboards and focus best there.
    const smoother =
      ScrollTrigger.isTouch === 1
        ? null
        : ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: "#smooth-content",
            smooth: 0.8,
          });

    const wrapper = document.getElementById("smooth-wrapper");
    const content = document.getElementById("smooth-content");

    function scrollToElement(target: Element, animate: boolean) {
      if (smoother) smoother.scrollTo(target, animate, "top top");
      else target.scrollIntoView();
    }

    // A deep link stays on target until the page settles or the user takes over.
    let holdHash = window.location.hash;
    const releaseHash = () => {
      holdHash = "";
    };
    const placeAtHash = () => {
      const target = holdHash && document.querySelector(holdHash);
      if (target) scrollToElement(target, false);
    };
    window.addEventListener("wheel", releaseHash, { passive: true, once: true });
    window.addEventListener("touchstart", releaseHash, { passive: true, once: true });
    window.addEventListener("keydown", releaseHash, { once: true });
    const hashTimer = window.setTimeout(releaseHash, 6000);

    let heroEntrance: gsap.core.Timeline | null = null;
    let curtainLifted = !curtain;
    const releaseInto = (timeline: gsap.core.Timeline) => {
      heroEntrance = timeline;
      if (curtainLifted) timeline.progress(1);
    };

    let context = gsap.context((self) => buildEffects(self, releaseInto));

    const cancelCurtain = curtain
      ? playCurtain(curtain, () => {
          curtainLifted = true;
          heroEntrance?.play();
          ScrollTrigger.refresh();
          placeAtHash();
        })
      : null;
    placeAtHash();

    // Text splitting depends on line widths, so a width change rebuilds the animations.
    let lastWidth = window.innerWidth;
    const rebuild = gsap.delayedCall(0.25, () => {
      context.revert();
      context = gsap.context((self) => buildEffects(self, releaseInto));
      ScrollTrigger.refresh();
    });
    rebuild.pause();
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      rebuild.restart(true);
    };
    window.addEventListener("resize", onResize);

    // The kos list changes the page height whenever it loads or is filtered.
    const refresh = gsap.delayedCall(0.15, () => {
      ScrollTrigger.refresh();
      placeAtHash();
    });
    refresh.pause();
    const resizeObserver = new ResizeObserver(() => refresh.restart(true));
    if (content) resizeObserver.observe(content);

    function onAnchorClick(event: MouseEvent) {
      if (!smoother || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      const target = link && document.querySelector(link.getAttribute("href") ?? "");
      if (!link || !target) return;
      event.preventDefault();
      releaseHash();
      const { pathname, search } = window.location;
      window.history.replaceState(null, "", `${pathname}${search}${link.getAttribute("href")}`);
      // Waits a frame so a closing mobile menu has released its scroll lock.
      requestAnimationFrame(() => scrollToElement(target, true));
    }
    document.addEventListener("click", onAnchorClick);

    // Inside a smooth wrapper the browser's focus scrolling would shift the whole page,
    // so it is undone and focus moves the page through the smoother instead.
    function pinWrapper() {
      if (wrapper && (wrapper.scrollTop || wrapper.scrollLeft)) {
        wrapper.scrollTop = 0;
        wrapper.scrollLeft = 0;
      }
    }
    function onFocusIn(event: FocusEvent) {
      if (!smoother || !(event.target instanceof Element)) return;
      if (event.target.closest("dialog")) return;
      let frames = 0;
      const loop = () => {
        pinWrapper();
        if (++frames < 20) requestAnimationFrame(loop);
      };
      loop();
      const box = event.target.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) {
        smoother.scrollTo(event.target, true, "center center");
      }
    }
    wrapper?.addEventListener("scroll", pinWrapper, { passive: true });
    document.addEventListener("focusin", onFocusIn);

    return () => {
      window.clearTimeout(hashTimer);
      window.removeEventListener("wheel", releaseHash);
      window.removeEventListener("touchstart", releaseHash);
      window.removeEventListener("keydown", releaseHash);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onAnchorClick);
      document.removeEventListener("focusin", onFocusIn);
      wrapper?.removeEventListener("scroll", pinWrapper);
      resizeObserver.disconnect();
      cancelCurtain?.();
      rebuild.kill();
      refresh.kill();
      context.revert();
      smoother?.kill();
    };
  }, []);

  return (
    <>
      <div data-curtain aria-hidden className="curtain">
        <div className="absolute inset-0 flex">
          {Array.from({ length: STRIPES }, (_, index) => (
            <div key={index} data-stripe className="-mr-px flex-1 bg-night" />
          ))}
        </div>
        <div
          data-curtain-center
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-snow"
        >
          <p data-curtain-mark className="font-serif text-[28px] uppercase tracking-[0.2em]">
            {nav.wordmark}
          </p>
          <p data-percent className="text-[11px] tracking-[0.2em] text-white/70">
            0
          </p>
        </div>
      </div>
      <div id="smooth-wrapper">
        <div id="smooth-content">{children}</div>
      </div>
    </>
  );
}
