// Klein oog in tekst (SVG) waarvan de pupil horizontaal meekijkt
//  [data-eye]  de SVG van het oog; het tweede <path> is de pupil
import { onFrame, pointer, reduceMotion } from '../lib/core.js';
import { clamp, spring } from '../lib/math.js';

// In SVG-eenheden, afgestemd op het oog in de introtekst (viewBox 82 breed). 0 = stand uit het ontwerp.
const MIN = -2.3, MAX = 18;          // binnen deze grenzen raakt de pupil het wit nooit
const CENTER = 9, RANGE = 8.5;       // midden en uitslag bij muisbeweging
const JUMP = 1.5, SPEED = 16;        // oogsprongetjes bij stilstand, veersnelheid

export function initEyes() {
  document.querySelectorAll('[data-eye]').forEach((svg) => {
    const pupil = svg.querySelectorAll('path')[1];
    if (!pupil) return;
    const s = { x: 0, v: 0 };
    let sacc = 0, next = 1.5;

    onFrame((now, dt) => {
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
