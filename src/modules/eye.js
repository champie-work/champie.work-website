// Klein oog in tekst (SVG) waarvan de pupil horizontaal meekijkt
//  [data-eye]         de SVG van het oog
//  [data-eye-pupil]   (optioneel) het pupil-pad; anders het tweede <path>
// Alle waarden in SVG-eenheden, standaard afgestemd op het oog in de introtekst (viewBox 82 breed).
//  data-eye-min / data-eye-max   grenzen waarbinnen de pupil het wit nooit raakt (0 = stand uit het ontwerp)
//  data-eye-center / data-eye-range   midden en uitslag bij muisbeweging
import { ticker, pointer, reduceMotion, clamp, spring, num } from '../lib/core.js';

export function initEyes() {
  document.querySelectorAll('[data-eye]').forEach((svg) => {
    const pupil = svg.querySelector('[data-eye-pupil]') || svg.querySelectorAll('path')[1];
    if (!pupil) return;
    const MIN = num(svg, 'data-eye-min', -2.3), MAX = num(svg, 'data-eye-max', 18);
    const CENTER = num(svg, 'data-eye-center', 9), RANGE = num(svg, 'data-eye-range', 8.5);
    const JUMP = 1.5, SPEED = 16;
    const s = { x: 0, v: 0 };
    let sacc = 0, next = 1.5;

    ticker.add((now, dt) => {
      const r = svg.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const tx = clamp((pointer.x - (r.left + r.width / 2)) / (window.innerWidth / 2));
      const idle = now - pointer.lastMove > 1200;
      next -= dt;
      if (next <= 0) { sacc = idle && pointer.active && !reduceMotion ? (Math.random() * 2 - 1) * JUMP : 0; next = 0.9 + Math.random() * 2.2; }
      if (!idle) sacc = 0;
      const target = clamp(pointer.active ? CENTER + tx * RANGE + sacc : 0, MIN, MAX);
      if (reduceMotion) s.x = target; else spring(s, target, SPEED, dt);
      pupil.setAttribute('transform', `translate(${clamp(s.x, MIN, MAX).toFixed(3)} 0)`);
    });
  });
}
