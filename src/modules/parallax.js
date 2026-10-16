// Parallax
//  [data-hero]                 de header (bepaalt hoe lang het effect duurt)
//  [data-parallax-hero]        lagen in de header die trager meebewegen
//                              data-parallax-speed="0.3" (0 = normaal, 1 = staat stil)
//  [data-parallax-img]         foto die binnen zijn kader schuift (kader heeft overflow: hidden)
//                              data-parallax-range="10" (procent op en neer)
import { ticker, reduceMotion, num } from '../lib/core.js';

// Gedeeld met andere modules (het 3D-logo beweegt mee met de header)
export const parallaxState = { heroShift: 0, heroSpeed: 0 };

export function initParallax() {
  const hero = document.querySelector('[data-hero]') || document.body;
  const layers = [...document.querySelectorAll('[data-parallax-hero]')];
  const imgs = [...document.querySelectorAll('[data-parallax-img]')];
  const speed = reduceMotion ? 0 : num(layers[0], 'data-parallax-speed', 0.3);
  parallaxState.heroSpeed = speed;

  ticker.add(() => {
    const sy = window.scrollY;
    parallaxState.heroShift = Math.min(sy, hero.offsetHeight) * speed;
    const t = `translate3d(0, ${parallaxState.heroShift}px, 0)`;
    for (const l of layers) l.style.transform = t;
    if (reduceMotion) return;
    const vh = window.innerHeight;
    for (const img of imgs) {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      const p = (vh - r.top) / (vh + r.height); // 0 = komt binnen onderaan, 1 = verdwijnt bovenaan
      img.style.transform = `translate3d(0, ${(p - 0.5) * 2 * num(img, 'data-parallax-range', 10)}%, 0)`;
    }
  });
}
