import barba from '@barba/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  lenis,
  initScrollReveal,
  initSplitText,
  initCounterAnimation,
  cleanupScroll,
} from './scroll-init';
import {
  createIcons,
  Menu,
  X,
  Linkedin,
  Instagram,
  Github,
  ArrowRight,
  Zap,
  Users,
  Shield,
  Globe,
  CheckCircle,
  Smartphone,
  GraduationCap,
  Heart,
  DollarSign,
  Headphones,
  Scale,
  Mail,
  Phone,
  ChevronDown,
  Eye,
  Target,
  UserPlus,
  Languages,
  ShoppingBasket,
  Gamepad2,
  QrCode,
  CalendarCheck,
  Home,
  Package,
  BookOpen,
  Car,
  Shirt,
  Search,
  Layers,
  Rocket,
  Cloud,
  Code2,
} from 'lucide';

const ALL_ICONS = {
  Menu,
  X,
  Linkedin,
  Instagram,
  Github,
  ArrowRight,
  Zap,
  Users,
  Shield,
  Globe,
  CheckCircle,
  Smartphone,
  GraduationCap,
  Heart,
  DollarSign,
  Headphones,
  Scale,
  Mail,
  Phone,
  ChevronDown,
  Eye,
  Target,
  UserPlus,
  Languages,
  ShoppingBasket,
  Gamepad2,
  QrCode,
  CalendarCheck,
  Home,
  Package,
  BookOpen,
  Car,
  Shirt,
  Search,
  Layers,
  Rocket,
  Cloud,
  Code2,
};

function getOverlay(): HTMLElement {
  const el = document.querySelector<HTMLElement>('#transition-overlay');
  if (!el) throw new Error('Missing #transition-overlay element');
  return el;
}

function updateNavLinks(path?: string): void {
  const currentPath = (path || window.location.pathname).replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.replace(/\/$/, '') || '/';
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initPage(container: HTMLElement): void {
  createIcons({ icons: ALL_ICONS });

  cleanupScroll();
  ScrollTrigger.refresh();

  initScrollReveal();
  initSplitText();
  initCounterAnimation();

  // Wrap ecosystem images for proper contained display
  container.querySelectorAll('.ecosystem-card').forEach(card => {
    const img = card.querySelector('.ecosystem-image');
    if (img && !card.querySelector('.ecosystem-image-wrap')) {
      const wrap = document.createElement('div');
      wrap.className = 'ecosystem-image-wrap';
      img.parentNode?.insertBefore(wrap, img);
      wrap.appendChild(img);
    }
  });

  if (container.querySelector('#africa-network-svg')) {
    import('./africa-network').then(({ initAfricaNetwork }) => {
      initAfricaNetwork();
    });
  }

  if (container.querySelector('.marquee-track')) {
    import('./marquee').then(({ initMarquee }) => {
      initMarquee();
    });
  }
}

barba.init({
  transitions: [
    {
      name: 'kente-wipe',

      once({ next }) {
        lenis.start();
        updateNavLinks();
        initPage(next.container);
      },

      leave(data: any) {
        const overlay = getOverlay();
        lenis.stop();

        return new Promise<void>((resolve) => {
          gsap
            .timeline({ onComplete: resolve })
            .to(overlay, {
              clipPath: 'inset(0 0% 0 0)',
              duration: 0.6,
              ease: 'power4.inOut',
            })
            .call(() => {
              if (data.next?.url?.path) {
                updateNavLinks(data.next.url.path);
              }
            })
            .to(
              data.current.container,
              { opacity: 0, duration: 0.1 },
              '-=0.1',
            );
        });
      },

      enter({ next }) {
        const overlay = getOverlay();

        window.scrollTo(0, 0);
        lenis.scrollTo(0, { immediate: true });

        return new Promise<void>((resolve) => {
          gsap
            .timeline({ onComplete: resolve })
            .set(next.container, { opacity: 1 })
            .to(overlay, {
              clipPath: 'inset(0 100% 0 0)',
              duration: 0.6,
              ease: 'power4.inOut',
            });
        });
      },

      after({ next }) {
        lenis.start();
        initPage(next.container);
      },
    },
  ],
});
