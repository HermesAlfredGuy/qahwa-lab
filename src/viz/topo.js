// Topographic art for the provenance section: real contour logic, drawn on scroll.
import { gsap, ScrollTrigger } from '../motion/core.js';

const NS = 'http://www.w3.org/2000/svg';

function contourPath(cx, cy, base, seed, squash = 1) {
  const pts = [];
  const steps = 128;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = base * (
      1
      + 0.17 * Math.sin(3 * a + seed)
      + 0.09 * Math.sin(5 * a + seed * 2.3)
      + 0.05 * Math.sin(7 * a + seed * 3.7)
      + 0.028 * Math.sin(11 * a + seed * 1.3)
    );
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * squash;
    pts.push([x, y]);
  }
  // smooth through midpoints (quadratic), so contours read as hand-drawn map lines
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    d += i === 0 ? `M${x0.toFixed(1)},${y0.toFixed(1)} Q${x0.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`
      : ` Q${x0.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  return d + ' Z';
}

export function buildTopo(el) {
  if (!el) return;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 416');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Contour map of the Jazan escarpment, from 1,200 to 1,900 metres');

  const rings = 15;
  const cx = 196, cy = 214;
  const paths = [];
  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1);
    const base = 186 * (1 - t * 0.86);
    const seed = 1.7 + i * 0.31;
    const p = document.createElementNS(NS, 'path');
    // contours drift toward the ridge as altitude rises
    const offX = -34 * t * t, offY = -46 * t * t;
    p.setAttribute('d', contourPath(cx + offX, cy + offY, base, seed, 0.97 - t * 0.05));
    if (i % 5 === 0) p.setAttribute('class', 'major');
    p.style.opacity = String(0.34 + 0.66 * (1 - t));
    svg.append(p);
    paths.push(p);
  }

  // summit mark
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('cx', String(cx - 34));
  dot.setAttribute('cy', String(cy - 46));
  dot.setAttribute('r', '3');
  svg.append(dot);

  const labels = [
    { t: 'SUMMIT 1 900 M', x: cx - 30, y: cy - 56, anchor: 'start' },
    { t: '1 600 M', x: cx + 6, y: cy - 44, anchor: 'start' },
    { t: '1 200 M', x: cx + 44, y: cy + 46, anchor: 'start' },
    { t: 'LOT 04 · 17°21′N', x: 18, y: 392, anchor: 'start' },
  ];
  labels.forEach((l) => {
    const tx = document.createElementNS(NS, 'text');
    tx.setAttribute('x', String(l.x));
    tx.setAttribute('y', String(l.y));
    tx.setAttribute('text-anchor', l.anchor);
    tx.textContent = l.t;
    svg.append(tx);
  });

  // hairline leader from summit to its label
  const leader = document.createElementNS(NS, 'line');
  leader.setAttribute('x1', String(cx - 32));
  leader.setAttribute('y1', String(cy - 48));
  leader.setAttribute('x2', String(cx + 4));
  leader.setAttribute('y2', String(cy - 58));
  leader.setAttribute('stroke', '#a8491c');
  leader.setAttribute('stroke-width', '0.75');
  leader.setAttribute('stroke-dasharray', '2 3');
  svg.append(leader);

  el.append(svg);

  // draw the contours on as the section arrives
  paths.forEach((p, i) => {
    const len = p.getTotalLength();
    gsap.fromTo(p,
      { strokeDasharray: len, strokeDashoffset: len },
      {
        strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', delay: i * 0.045,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
  });
}
