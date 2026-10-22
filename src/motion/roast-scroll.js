// The hero's signature: scrolling roasts the bean and drives the log.
import { gsap, ScrollTrigger } from './core.js';
import { createRoastStage } from '../hero/roast-stage.js';

const TOTAL_SECONDS = 700; // 11:40

// probe curve, real roast order: charge 200 -> turning point 92 -> drying end 150 -> first crack 196 -> drop 212
const TEMP = [
  [0.0, 200], [0.093, 92], [0.386, 150], [0.70, 196], [1.0, 212],
];

function tempAt(p) {
  for (let i = 0; i < TEMP.length - 1; i++) {
    const [a, ta] = TEMP[i], [b, tb] = TEMP[i + 1];
    if (p <= b) {
      const k = (p - a) / (b - a);
      return ta + (tb - ta) * (k * k * (3 - 2 * k)); // eased between milestones, like a probe settles
    }
  }
  return 212;
}

function stageAt(p) {
  if (p < 0.093) return 'Charge · turning point';
  if (p < 0.386) return 'Drying';
  if (p < 0.70) return 'Maillard';
  if (p < 0.955) return 'Development';
  return 'Drop';
}

function clock(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function initRoastScroll(canvas) {
  const hero = document.querySelector('.hero');
  const stageEl = document.querySelector('.hero__stage');
  if (!hero || !stageEl || !canvas) return null;

  const hud = document.querySelector('.roast-hud');
  const tempEl = hud?.querySelector('[data-temp]');
  const stageLabel = hud?.querySelector('[data-stage]');
  const clockEl = hud?.querySelector('[data-clock]');
  const title = document.querySelector('.hero__title');
  const copy = document.querySelector('.hero__copy');
  const arabic = document.querySelector('.hero__arabic');

  const stage = createRoastStage(canvas);
  const ready = () => canvas.classList.add('is-ready');
  // one painted frame before the reveal, so the first scroll never shows a blank stage
  requestAnimationFrame(() => requestAnimationFrame(ready));

  let lastTemp = -1, lastStage = '', lastClock = '';
  const state = { p: 0 };

  const st = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom bottom',
    pin: stageEl,
    pinSpacing: false,
    anticipatePin: 1,
    scrub: true,
    onUpdate(self) {
      state.p = self.progress;
    },
  });

  // per-frame write: the HUD and the bean share one progress value, so they never disagree
  const tick = () => {
    const p = state.p;
    stage.setProgress(p);

    if (hud) hud.style.setProperty('--p', p.toFixed(4));
    const t = Math.round(tempAt(p));
    if (tempEl && t !== lastTemp) { tempEl.textContent = String(t); lastTemp = t; }
    const s = stageAt(p);
    if (stageLabel && s !== lastStage) { stageLabel.textContent = s; lastStage = s; }
    const c = clock(p * TOTAL_SECONDS);
    if (clockEl && c !== lastClock) { clockEl.textContent = c; lastClock = c; }
  };
  gsap.ticker.add(tick);

  // title + copy step back as the roast takes over
  gsap.to(title, {
    yPercent: -10, scale: 1.02, opacity: 0.5, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '38% top', scrub: 0.6 },
  });
  gsap.to(arabic, {
    yPercent: -30, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '26% top', scrub: 0.6 },
  });
  gsap.to(copy, {
    yPercent: 24, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: hero, start: '6% top', end: '34% top', scrub: 0.6 },
  });
  // the log stays, then hands over to the next section
  gsap.to(hud, {
    opacity: 0, yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: hero, start: '78% top', end: 'bottom bottom', scrub: 0.4 },
  });

  return { stage, st };
}
