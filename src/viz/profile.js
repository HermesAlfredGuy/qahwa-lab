// Roast profile chart: built as one SVG so dots, leaders and labels can never drift apart.
import { gsap } from '../motion/core.js';

const NS = 'http://www.w3.org/2000/svg';

const CURVE = 'M34,63 C41,104 47,214 55,258 C71,262 99,197 122,152 C149,111 174,75 194,62 C219,52 245,44 262,39';

// x, y, value, label, side of the label (nudge in viewBox units)
const MARKS = [
  { x: 55, y: 258, v: '92 °C', t: 'Turning point · 1:05', ly: 246 },
  { x: 194, y: 62, v: '196 °C', t: 'First crack · 8:10', ly: 74 },
  { x: 262, y: 39, v: '212 °C', t: 'Drop · 11:40', ly: 24 },
];

function el(name, attrs, text) {
  const n = document.createElementNS(NS, name);
  Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, String(v)));
  if (text != null) n.textContent = text;
  return n;
}

export function buildProfile(host) {
  if (!host) return;
  const svg = el('svg', { viewBox: '0 0 380 316', role: 'img', 'aria-label': 'Roast profile for lot 04: charge at 200 degrees, turning point 92 degrees at 1:05, first crack 196 degrees at 8:10, drop 212 degrees at 11:40' });

  // grid
  const grid = el('g', { class: 'profile__grid' });
  [80, 136, 192, 248].forEach((y) => grid.append(el('line', { x1: 34, y1: y, x2: 300, y2: y })));
  [34, 106, 178, 262].forEach((x) => grid.append(el('line', { x1: x, y1: 24, x2: x, y2: 280 })));
  svg.append(grid);

  // y axis labels
  [[200, 63], [150, 152], [92, 258]].forEach(([t, y]) => {
    svg.append(el('text', { x: 28, y: y + 3, 'text-anchor': 'end', class: 'profile__axis' }, `${t}°`));
  });
  // x axis labels
  [[34, '0:00', 'start'], [106, '4:00', 'middle'], [178, '8:00', 'middle'], [262, '11:40', 'end']].forEach(([x, t, a]) => {
    svg.append(el('text', { x, y: 298, 'text-anchor': a, class: 'profile__axis' }, t));
  });

  const curve = el('path', { d: CURVE, class: 'profile__curve' });
  svg.append(curve);

  const marks = el('g', { class: 'profile__marks' });
  MARKS.forEach((m) => {
    marks.append(el('line', {
      x1: m.x + 4, y1: m.y, x2: 306, y2: m.ly,
      class: 'profile__leader',
    }));
    marks.append(el('circle', { cx: m.x, cy: m.y, r: 3.4 }));
    const g = el('g', { class: 'profile__label' });
    g.append(el('text', { x: 378, y: m.ly - 3, 'text-anchor': 'end', class: 'profile__val' }, m.v));
    g.append(el('text', { x: 378, y: m.ly + 8, 'text-anchor': 'end', class: 'profile__time' }, m.t));
    marks.append(g);
  });
  svg.append(marks);
  host.append(svg);

  // draw the curve on as the card arrives
  const len = curve.getTotalLength();
  gsap.set(curve, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(curve, {
    strokeDashoffset: 0, ease: 'none',
    scrollTrigger: { trigger: host.closest('.profile') || host, start: 'top 82%', end: 'bottom 58%', scrub: 0.6 },
  });
  gsap.from(marks.querySelectorAll('circle'), {
    scale: 0, transformOrigin: 'center', stagger: 0.14, duration: 0.65, ease: 'back.out(2)',
    scrollTrigger: { trigger: host.closest('.profile') || host, start: 'top 74%', once: true },
  });
  gsap.from(marks.querySelectorAll('.profile__label, .profile__leader'), {
    opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out',
    scrollTrigger: { trigger: host.closest('.profile') || host, start: 'top 72%', once: true },
  });
}
