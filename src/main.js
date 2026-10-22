import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { gsap, ScrollTrigger, initSmoothScroll } from './motion/core.js';
import { initReveals, refreshOnFonts } from './motion/reveal.js';
import { initMarquees, initMagnetic, initCursor, initHorizontal, initCounters } from './motion/interactions.js';
import { playIntro } from './motion/intro.js';
import { initRoastScroll } from './motion/roast-scroll.js';
import { buildTopo } from './viz/topo.js';
import { buildProfile } from './viz/profile.js';

const lenis = initSmoothScroll();
window.__lenis = lenis;
window.__gsap = gsap;

// the hero pin comes first: the bean and the log are the page's clock
try {
  initRoastScroll(document.getElementById('bean'));
} catch (err) {
  console.warn('roast stage unavailable', err);
  document.getElementById('bean')?.classList.add('is-ready');
}

buildTopo(document.querySelector('[data-topo]'));
buildProfile(document.querySelector('[data-profile]'));
initReveals();
initHorizontal();
initMarquees();
initMagnetic();
initCursor();
initCounters();
refreshOnFonts();
initNav();

// Nav keeps out of the way on the way down, comes back on the way up.
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let last = window.scrollY;
  lenis.on('scroll', ({ scroll }) => {
    const goingDown = scroll > last + 2;
    const goingUp = scroll < last - 2;
    if (scroll > window.innerHeight * 0.85 && goingDown) nav.classList.add('is-hidden');
    else if (goingUp || scroll < window.innerHeight * 0.4) nav.classList.remove('is-hidden');
    if (!goingDown && !goingUp) return;
    last = scroll;
  });
}

// Hero intro: display type rises once the display font is measured.
(document.fonts?.ready ?? Promise.resolve()).then(playIntro);

// Any late layout (web fonts, the pinned hero measuring itself) gets re-measured.
window.addEventListener('load', () => ScrollTrigger.refresh());
