import barba from '@barba/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  lenis,
  initCounterAnimation,
  cleanupScroll,
} from './scroll-init';
import {
  createIcons,
  Menu,
  X,
  // eslint-disable-next-line deprecation/deprecation
  Linkedin, Instagram, Github,
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
  MapPin,
  Activity,
  Building2,
  CreditCard,
  Lock,
  MessageSquare,
  ShieldCheck,
  BarChart2,
  Megaphone,
  Filter,
  ScanLine,
  HardHat,
  Bot,
  MapPinPlus,
  Pill,
  Baby,
  Stethoscope,
  Fingerprint,
  MessageCircle,
  BrainCircuit,
  TabletSmartphone,
  BadgeCheck,
  Droplets,
  Ambulance,
  CloudRain,
  HeartHandshake,
  Siren,
  Bell,
  Satellite,
  ShieldAlert,
  AlertCircle,
  Calendar,
  Timer,
  Sprout,
  CheckCircle2,
  Handshake,
  ArrowUpRight,
  ExternalLink,
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
  MapPin,
  Activity,
  Building2,
  CreditCard,
  Lock,
  MessageSquare,
  ShieldCheck,
  BarChart2,
  Megaphone,
  Filter,
  ScanLine,
  HardHat,
  Bot,
  MapPinPlus,
  Pill,
  Baby,
  Stethoscope,
  Fingerprint,
  MessageCircle,
  BrainCircuit,
  TabletSmartphone,
  BadgeCheck,
  Droplets,
  Ambulance,
  CloudRain,
  HeartHandshake,
  Siren,
  Bell,
  Satellite,
  ShieldAlert,
  AlertCircle,
  Calendar,
  Timer,
  Sprout,
  CheckCircle2,
  Handshake,
  ArrowUpRight,
  ExternalLink,
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

  // Update relative timestamps on every page transition
  container.querySelectorAll<HTMLElement>('time[data-reltime]').forEach((el) => {
    const iso = el.getAttribute('datetime');
    if (!iso) return;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = new Date(iso).getTime() - Date.now();
    const abs = Math.abs(diff);
    const sign = diff < 0 ? -1 : 1;
    let label: string;
    if (abs < 60_000)           label = 'just now';
    else if (abs < 3_600_000)   label = rtf.format(sign * Math.round(abs / 60_000), 'minute');
    else if (abs < 86_400_000)  label = rtf.format(sign * Math.round(abs / 3_600_000), 'hour');
    else if (abs < 604_800_000) label = rtf.format(sign * Math.round(abs / 86_400_000), 'day');
    else if (abs < 2_592_000_000) label = rtf.format(sign * Math.round(abs / 604_800_000), 'week');
    else if (abs < 31_536_000_000) label = rtf.format(sign * Math.round(abs / 2_592_000_000), 'month');
    else                        label = rtf.format(sign * Math.round(abs / 31_536_000_000), 'year');
    el.textContent = label;
  });

  // Re-bind intent card handlers on every page transition
  const intentCards = container.querySelectorAll<HTMLElement>('.intent-card');
  if (intentCards.length > 0) {
    const stickyBar = container.querySelector<HTMLElement>('#intent-sticky');
    const stickyLabel = container.querySelector<HTMLElement>('#intent-sticky-label');
    const stickyCta = container.querySelector<HTMLAnchorElement>('#intent-sticky-cta');
    const stickyCtaText = container.querySelector<HTMLElement>('#intent-sticky-cta-text');
    const stickyClose = container.querySelector<HTMLElement>('#intent-sticky-close');

    const intentMessages: Record<string, { label: string; cta: string }> = {
      developer: { label: 'Ready to join a cohort?', cta: 'Apply now' },
      train: { label: 'Ready to train your team?', cta: 'Enquire about cohorts' },
      hackathon: { label: 'Interested in joining a hackathon?', cta: 'Register your interest' },
      partner: { label: 'Ready to partner with us?', cta: 'Start a conversation' },
    };

    intentCards.forEach((card) => {
      card.addEventListener('click', () => {
        intentCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        const intent = card.dataset.intent ?? '';
        const subject = encodeURIComponent(card.dataset.subject ?? 'Enquiry');
        const body = encodeURIComponent(card.dataset.body ?? '');
        const msg = intentMessages[intent];


        if (stickyLabel && msg) stickyLabel.textContent = msg.label;
        if (stickyCtaText && msg) stickyCtaText.textContent = msg.cta;
        if (stickyCta) {
          stickyCta.href = `mailto:management@eyev.africa?subject=${subject}&body=${body}`;
        }
        stickyBar?.classList.add('visible');
        stickyBar?.removeAttribute('aria-hidden');
      });
    });

    stickyClose?.addEventListener('click', () => {
      stickyBar?.classList.remove('visible');
      stickyBar?.setAttribute('aria-hidden', 'true');
      intentCards.forEach((c) => c.classList.remove('active'));
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
