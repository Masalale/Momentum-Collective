import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Lenis smooth scroll — single persistent instance
// ---------------------------------------------------------------------------

const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false, // CRITICAL: native touch on mobile
  gestureOrientation: 'vertical',
  wheelMultiplier: 1,
  touchMultiplier: 1,
});

// Bind Lenis → GSAP ticker (single RAF source of truth)
gsap.ticker.add((time: number) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0); // CRITICAL: prevents jank

// Bind Lenis scroll → ScrollTrigger updates
lenis.on('scroll', ScrollTrigger.update);

export { lenis };

// ---------------------------------------------------------------------------
// Scroll reveal: [data-reveal] elements
// ---------------------------------------------------------------------------

export function initScrollReveal(): void {
  const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');

  revealElements.forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        delay: (i % 3) * 0.08,
      },
    );
  });
}

// ---------------------------------------------------------------------------
// SplitType headline animations: [data-split] elements
// ---------------------------------------------------------------------------

export function initSplitText(): void {
  const splitElements = document.querySelectorAll<HTMLElement>('[data-split]');

  splitElements.forEach((el) => {
    const split = new SplitType(el, {
      types: 'lines',
      lineClass: 'split-line',
    });

    if (!split.lines || split.lines.length === 0) return;

    // DESCENDER SAFETY: ensure descenders (g, y, p, q, j) aren't clipped
    split.lines.forEach((line) => {
      line.style.paddingBottom = '0.18em';
      line.style.overflow = 'visible';
    });

    // Lines clip-reveal (translate up from 110%), NOT a fade
    gsap.fromTo(
      split.lines,
      { y: '110%', opacity: 1 },
      {
        y: '0%',
        opacity: 1,
        stagger: 0.08,
        ease: 'power3.out',
        duration: 1,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      },
    );
  });
}

// ---------------------------------------------------------------------------
// Counter animations: [data-counter] elements
// ---------------------------------------------------------------------------

export function initCounterAnimation(): void {
  const counters = document.querySelectorAll<HTMLElement>('[data-counter]');

  counters.forEach((counter) => {
    const suffix = counter.dataset.suffix || '';

    gsap.from(counter, {
      textContent: 0,
      duration: 2,
      ease: 'power2.out',
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: counter,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate() {
        counter.textContent =
          Math.round(parseFloat(counter.textContent || '0')) + suffix;
      },
    });
  });
}

// ---------------------------------------------------------------------------
// Cleanup helper (used by page transitions)
// ---------------------------------------------------------------------------

export function cleanupScroll(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.killTweensOf('*');
}

// ---------------------------------------------------------------------------
// Auto-init on first load
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initSplitText();
    initCounterAnimation();
  });
}
