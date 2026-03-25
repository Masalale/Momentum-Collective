import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

// ---------------------------------------------------------------------------
// Lenis smooth scroll — single persistent instance
// ---------------------------------------------------------------------------

const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: true,        // Defer to native touch scroll on mobile — better UX
  gestureOrientation: 'vertical',
  wheelMultiplier: 1,
  touchMultiplier: 1,
});

// Sync with GSAP ticker
gsap.ticker.add((time: number) => {
  lenis.raf(time * 1000);
});

// Keep ScrollTrigger in sync on every scroll event
lenis.on('scroll', ScrollTrigger.update);

export { lenis };

// ---------------------------------------------------------------------------
// Scroll lock / unlock — used by page transitions
// Makes the transition overlay intercept all pointer input so the user
// can't scroll during the wipe animation. Avoids overflow manipulation
// that would break position:fixed elements.
// ---------------------------------------------------------------------------

export function lockScroll(): void {
  document.documentElement.style.overflow = 'hidden';
}

export function unlockScroll(): void {
  document.documentElement.style.overflow = '';
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
// Anchor link handler — event delegation so it works after every
// Barba.js page transition without re-binding.
// ---------------------------------------------------------------------------

export function bindAnchorLinks(): void {
  document.addEventListener('click', (e) => {
    const anchor = (e.target as Element).closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const target = document.getElementById(href.substring(1));
    if (target) lenis.scrollTo(target, { offset: -80 });
  });
}

// ---------------------------------------------------------------------------
// Scrollbar drag sync — prevents jitter when switching from wheel
// to native scrollbar by keeping Lenis's internal position in sync.
// ---------------------------------------------------------------------------

function initScrollbarSync(): void {
  let scrollbarDragging = false;

  document.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.clientX >= document.documentElement.clientWidth) {
      scrollbarDragging = true;
    }
  });

  document.addEventListener('scroll', () => {
    if (scrollbarDragging) {
      lenis.scrollTo(window.scrollY, { immediate: true });
    }
  }, { passive: true });

  document.addEventListener('mouseup', () => {
    scrollbarDragging = false;
  });
}

// ---------------------------------------------------------------------------
// Auto-init on first load
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    bindAnchorLinks();
    initScrollbarSync();
  });
}
