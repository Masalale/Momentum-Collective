import gsap from 'gsap';

export function initMarquee(): void {
  const tracks = document.querySelectorAll<HTMLElement>('.marquee-track');

  tracks.forEach((track) => {
    const content = track.querySelector<HTMLElement>('.marquee-content');
    if (!content) return;

    const clone = content.cloneNode(true) as HTMLElement;
    track.appendChild(clone);

    const totalWidth = content.offsetWidth;

    gsap.to(track, {
      x: -totalWidth,
      duration: 25,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: string) => parseFloat(x) % totalWidth),
      },
    });
  });
}
