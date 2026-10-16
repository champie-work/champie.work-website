// Vaste balk bovenin. De nav ([data-nav]) scrollt mee tot hij de bovenrand raakt en blijft daar staan;
// zodra het 3D-logo linksboven in rolt, schuift er een zwarte balk achter en wordt de nav wit.

import { onFrame } from '../lib/core.js';

/* ===== INSTELLINGEN ===== */
const C = {
  logoHeight: 76, // hoogte (px) van het logo linksboven in de balk
  pad:        20, // ruimte (px) om het logo; balkhoogte = logoHeight + 2 x pad; ook de vaste hoogte van de nav
};
/* ======================== */

export function initHeader() {
  const bar = document.createElement('div');
  bar.className = 'cbar';
  bar.style.height = `${C.logoHeight + C.pad * 2}px`;
  document.body.appendChild(bar);

  // Nav uit de header halen (die beweegt met parallax) en op dezelfde plek in de vaste balk zetten
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const r = nav.getBoundingClientRect();
    const top = r.top + window.scrollY; // plek op de pagina
    Object.assign(nav.style, { position: 'absolute', top: '0',
      right: `${document.documentElement.clientWidth - r.right}px`, width: `${r.width}px` });
    bar.appendChild(nav);
    onFrame(() => { nav.style.transform = `translate3d(0, ${Math.max(C.pad, top - window.scrollY)}px, 0)`; });
  }

  return {
    setDark(on) { bar.classList.toggle('is-dark', on); },
    // Plek van het kleine logo: midden + hoogte
    logoBox() {
      const h = C.logoHeight;
      return { x: C.pad + h * (389.65 / 385.73) / 2, y: C.pad + h / 2, h };
    },
  };
}
