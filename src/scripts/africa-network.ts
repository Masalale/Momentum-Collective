import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { lenis } from './scroll-init';

interface CityNode {
  id: string;
  x: number;
  y: number;
  name: string;
}

interface Connection {
  from: string;
  to: string;
  points: string;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

const cities: CityNode[] = [
  { id: 'nairobi', x: 520, y: 390, name: 'Nairobi' },
  { id: 'lagos', x: 250, y: 330, name: 'Lagos' },
  { id: 'accra', x: 220, y: 350, name: 'Accra' },
  { id: 'cairo', x: 490, y: 160, name: 'Cairo' },
  { id: 'johannesburg', x: 460, y: 510, name: 'Johannesburg' },
  { id: 'dakar', x: 140, y: 280, name: 'Dakar' },
  { id: 'addis', x: 560, y: 320, name: 'Addis Ababa' },
];

const allConnections: Connection[] = [
  { from: 'lagos', to: 'nairobi', points: '250,330 520,330 520,390' },
  { from: 'accra', to: 'cairo', points: '220,350 220,160 490,160' },
  { from: 'nairobi', to: 'addis', points: '520,390 560,390 560,320' },
  { from: 'cairo', to: 'addis', points: '490,160 490,320 560,320' },
  { from: 'dakar', to: 'lagos', points: '140,280 140,330 250,330' },
  { from: 'nairobi', to: 'johannesburg', points: '520,390 520,510 460,510' },
  { from: 'lagos', to: 'accra', points: '250,330 220,330 220,350' },
];

const mobileConnections: Connection[] = [
  { from: 'dakar', to: 'lagos', points: '140,280 140,330 250,330' },
  { from: 'lagos', to: 'nairobi', points: '250,330 520,330 520,390' },
  { from: 'nairobi', to: 'johannesburg', points: '520,390 520,510 460,510' },
];

const AFRICA_OUTLINE =
  'M480,120 L500,115 L520,110 L540,115 L560,125 L580,140 L590,160 ' +
  'L595,180 L590,200 L580,220 L570,240 L575,260 L585,280 L590,300 ' +
  'L585,320 L570,340 L550,360 L530,380 L520,400 L515,420 L520,440 ' +
  'L530,460 L545,480 L560,500 L550,520 L530,530 L510,535 L490,530 ' +
  'L470,520 L450,505 L430,490 L415,470 L405,450 L395,430 L385,410 ' +
  'L375,390 L360,370 L340,355 L320,345 L300,340 L280,335 L260,330 ' +
  'L240,325 L220,320 L200,310 L185,295 L175,280 L170,265 L165,250 ' +
  'L155,235 L140,225 L125,220 L115,215 L110,205 L115,195 L125,185 ' +
  'L140,175 L155,165 L170,155 L185,145 L200,135 L220,128 L240,123 ' +
  'L260,120 L280,118 L300,116 L320,115 L340,115 L360,115 L380,116 ' +
  'L400,117 L420,118 L440,119 L460,120 L480,120 Z';

function polylineLength(pointsAttr: string): number {
  const coords = pointsAttr.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return { x, y };
  });
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i].x - coords[i - 1].x;
    const dy = coords[i].y - coords[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function createSVGElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

function pulseNode(cityId: string): void {
  const node = document.getElementById(`node-${cityId}`);
  const pulse = document.getElementById(`pulse-${cityId}`);

  if (node && !node.classList.contains('active')) {
    node.classList.add('active');
    gsap.fromTo(
      node,
      { scale: 0, transformOrigin: 'center center' },
      { scale: 1, duration: 0.4, ease: 'back.out(2)' },
    );
  }

  if (pulse && !pulse.classList.contains('active')) {
    pulse.classList.add('active');
    gsap.fromTo(
      pulse,
      { scale: 0.5, opacity: 0.8, transformOrigin: 'center center' },
      {
        scale: 2,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        repeat: -1,
        repeatDelay: 0.6,
      },
    );
  }
}

export function initAfricaNetwork(): void {
  const container = document.getElementById('africa-network-svg');
  if (!container) return;

  const isMobile = window.innerWidth < 768;
  const connections = isMobile ? mobileConnections : allConnections;

  const svg = createSVGElement('svg', {
    viewBox: '0 0 800 700',
    class: 'africa-network-svg',
    preserveAspectRatio: 'xMidYMid meet',
    'aria-label': 'Africa network visualization',
  });

  const defs = createSVGElement('defs');
  const gradient = createSVGElement('linearGradient', {
    id: 'network-gradient',
    x1: '0%',
    y1: '0%',
    x2: '100%',
    y2: '0%',
  });
  const stop1 = createSVGElement('stop', {
    offset: '0%',
    'stop-color': '#D4920A',
    'stop-opacity': '0.3',
  });
  const stop2 = createSVGElement('stop', {
    offset: '100%',
    'stop-color': '#D4920A',
    'stop-opacity': '1',
  });
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  const outline = createSVGElement('path', {
    d: AFRICA_OUTLINE,
    class: 'africa-outline',
    fill: 'none',
    stroke: 'rgba(212, 146, 10, 0.08)',
    'stroke-width': '1.5',
  });
  svg.appendChild(outline);

  const lineGroup = createSVGElement('g', { class: 'network-lines' });
  svg.appendChild(lineGroup);

  const polylines: SVGPolylineElement[] = [];
  const lengths: number[] = [];

  connections.forEach((conn) => {
    const polyline = createSVGElement('polyline', {
      points: conn.points,
      class: 'network-line',
      'data-from': conn.from,
      'data-to': conn.to,
      fill: 'none',
      stroke: 'url(#network-gradient)',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    });

    const len = polylineLength(conn.points);
    polyline.style.strokeDasharray = String(len);
    polyline.style.strokeDashoffset = String(len);

    lineGroup.appendChild(polyline);
    polylines.push(polyline);
    lengths.push(len);
  });

  const nodeGroup = createSVGElement('g', { class: 'network-nodes' });
  svg.appendChild(nodeGroup);

  const activeCityIds = new Set<string>();
  connections.forEach((c) => {
    activeCityIds.add(c.from);
    activeCityIds.add(c.to);
  });

  const activeCities = cities.filter((c) => activeCityIds.has(c.id));

  activeCities.forEach((city) => {
    const g = createSVGElement('g', {
      class: 'network-node-group',
      'data-city': city.id,
    });

    const pulseCircle = createSVGElement('circle', {
      cx: String(city.x),
      cy: String(city.y),
      r: '8',
      class: 'network-node-pulse',
      id: `pulse-${city.id}`,
      fill: 'rgba(212, 146, 10, 0.3)',
    });
    g.appendChild(pulseCircle);

    const circle = createSVGElement('circle', {
      cx: String(city.x),
      cy: String(city.y),
      r: '4',
      class: 'network-node',
      id: `node-${city.id}`,
      fill: '#D4920A',
      opacity: '0',
    });
    g.appendChild(circle);

    const label = createSVGElement('text', {
      x: String(city.x),
      y: String(city.y + 20),
      'text-anchor': 'middle',
      fill: '#A09070',
      'font-family': 'IBM Plex Mono, monospace',
      'font-size': '10',
      'letter-spacing': '0.05em',
      opacity: '0',
    });
    label.textContent = city.name;
    g.appendChild(label);

    nodeGroup.appendChild(g);
  });

  container.appendChild(svg);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top 70%',
      end: 'bottom 30%',
      scrub: 1,
    },
  });

  const totalDuration = connections.length;

  polylines.forEach((polyline, i) => {
    const conn = connections[i];
    const segStart = i / totalDuration;

    tl.to(
      polyline,
      {
        strokeDashoffset: 0,
        duration: 1 / totalDuration,
        ease: 'none',
        onStart() {
          pulseNode(conn.from);
        },
        onComplete() {
          pulseNode(conn.to);
        },
      },
      segStart,
    );

    const fromCity = cities.find((c) => c.id === conn.from);
    const toCity = cities.find((c) => c.id === conn.to);

    if (fromCity) {
      const fromLabel = nodeGroup.querySelector(
        `[data-city="${fromCity.id}"] text`,
      );
      if (fromLabel) {
        tl.to(fromLabel, { opacity: 1, duration: 0.15, ease: 'none' }, segStart);
      }
    }

    if (toCity) {
      const toLabel = nodeGroup.querySelector(
        `[data-city="${toCity.id}"] text`,
      );
      if (toLabel) {
        tl.to(
          toLabel,
          { opacity: 1, duration: 0.15, ease: 'none' },
          segStart + 0.8 / totalDuration,
        );
      }
    }
  });

  lenis.on('scroll', (instance) => {
    const v = Math.abs(instance.velocity);
    if (v > 0.1) {
      tl.timeScale(1 + v * 0.5);
    } else {
      tl.timeScale(1);
    }
  });
}
