// Parallax
//  [data-hero]           de header (bepaalt hoe lang het effect duurt)
//  [data-parallax-hero]  lagen in de header die trager meebewegen
//  [data-parallax-img]   foto die binnen zijn kader schuift (kader heeft overflow: hidden)
import { onFrame, reduceMotion } from '../lib/core.js';

const HERO_SPEED = reduceMotion ? 0 : 0.3; // 0 = normaal scrollen, 1 = staat stil
const IMG_RANGE = 10;                       // procent dat een foto op en neer schuift

// Het 3D-logo beweegt mee met de header
export const parallaxState = { heroShift: 0, heroSpeed: HERO_SPEED };

const imgs = [];
// Later toegevoegde foto's (bv. in een projectvel) doen ook mee
export const addParallaxImgs = (list) => { for (const img of list) if (!imgs.includes(img)) imgs.push(img); };

export function initParallax() {
  const hero = document.querySelector('[data-hero]') || document.body;
  const layers = document.querySelectorAll('[data-parallax-hero]');
  addParallaxImgs(document.querySelectorAll('[data-parallax-img]'));

  onFrame(() => {
    parallaxState.heroShift = Math.min(window.scrollY, hero.offsetHeight) * HERO_SPEED;
    for (const l of layers) l.style.transform = `translate3d(0, ${parallaxState.heroShift}px, 0)`;
    if (reduceMotion) return;
    const vh = window.innerHeight;
    for (const img of imgs) {
      if (!img.isConnected) continue;
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      const p = (vh - r.top) / (vh + r.height); // 0 = komt binnen onderaan, 1 = verdwijnt bovenaan
      img.style.transform = `translate3d(0, ${(p - 0.5) * 2 * IMG_RANGE}%, 0)`;
    }
  });
}
