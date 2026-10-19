// Oneindige tekstband
//  [data-marquee]        de band (overflow hidden)
//  [data-marquee-track]  rij met de tekst; wordt gekopieerd tot het scherm vol is en schuift eindeloos door
import { onFrame, reduceMotion, viewW } from '../lib/core.js';

/* ===== INSTELLINGEN ===== */
const CONFIG = {
  speed: 60,      // px per seconde
  direction: 1,   // 1 = naar rechts, -1 = naar links
};
/* ======================== */

export function initMarquee() {
  for (const band of document.querySelectorAll('[data-marquee]')) {
    const track = band.querySelector('[data-marquee-track]');
    if (!track) continue;
    const set = [...track.children];
    let w = 0, x = 0;
    function fill() {
      track.style.transform = 'none';
      while (track.children.length > set.length) track.lastElementChild.remove();
      w = track.offsetWidth; // breedte van één set (track is max-content breed, zie css)
      if (!w) return;
      const copies = Math.ceil(Math.max(viewW(), 1920) / w) + 1;
      for (let i = 1; i < copies; i++) for (const el of set) {
        const c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
      }
    }
    fill();
    document.fonts?.ready.then(fill);
    window.addEventListener('resize', fill);
    if (reduceMotion) continue;
    onFrame((now, dt) => {
      if (!w) return;
      x = (x + CONFIG.speed * dt) % w;
      track.style.transform = `translate3d(${CONFIG.direction > 0 ? x - w : -x}px, 0, 0)`;
    });
  }
}
