import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

// ---------------------------------------------------------------------------
// Lenis smooth scroll, single persistent instance
// ---------------------------------------------------------------------------

const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false,
  gestureOrientation: 'vertical',
  wheelMultiplier: 1,
  touchMultiplier: 1,
});

// Sync with GSAP ticker
gsap.ticker.add((time: number) => {
  lenis.raf(time * 1000);
});

// Update ScrollTrigger on scroll
lenis.on('scroll', ScrollTrigger.update);

export { lenis };

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
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href')?.substring(1);
        const targetElement = targetId ? document.getElementById(targetId) : null;
        if (targetElement) {
          lenis.scrollTo(targetElement);
        }
      });
    });

    // Sync Lenis when dragging the native scrollbar to prevent jitter
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
  });
}
