import gsap from 'gsap';
import { lenis } from './scroll-init';

export function initMarquee(): void {
  const tracks = document.querySelectorAll<HTMLElement>('.marquee-track');

  tracks.forEach((track) => {
    const content = track.querySelector<HTMLElement>('.marquee-content');
    if (!content) return;

    const clone = content.cloneNode(true) as HTMLElement;
    track.appendChild(clone);

    const totalWidth = content.offsetWidth;

    const tween = gsap.to(track, {
      x: -totalWidth,
      duration: 20,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: string) => parseFloat(x) % totalWidth),
      },
    });

    lenis.on('scroll', (instance) => {
      const v = Math.abs(instance.velocity);
      const speed = 1 + v * 0.3;
      tween.timeScale(instance.velocity > 0 ? speed : speed * 0.5);
    });
  });
}
