// Menu-balk onderaan in het midden: geel logo-vak + gele balk met links (Figma "Frame 221").
// Wordt door het script zelf op de pagina gezet. Het 3D-logo vliegt in het logo-vak.
// Links scrollen naar secties op home ([id="projects"], [id="services"]); op een andere pagina gaan ze naar home.
// About en Process doen nog niets (komen later als eigen pagina's).
import { lenis } from './smooth-scroll.js';

const LINKS = [
  ['Projects', 'projects'],
  ['Services', 'services'],
  ['About', null],
  ['Process', null],
];

const isHome = () => !!document.querySelector('[data-logo3d]');

export function initMenu() {
  const nav = document.createElement('nav');
  nav.className = 'cmenu';
  nav.setAttribute('aria-label', 'Menu');
  const links = LINKS.map(([label, id]) =>
    `<a class="cmenu_link" data-nav-link${id ? ` href="${isHome() ? '' : '/'}#${id}"` : ''}>${label}</a>`).join('');
  nav.innerHTML = `<a class="cmenu_logo" href="/" aria-label="Naar boven"></a><div class="cmenu_bar">${links}</div>`;
  document.body.appendChild(nav);

  const box = nav.querySelector('.cmenu_logo');
  box.addEventListener('click', (e) => {
    if (!isHome()) return; // gewoon naar home
    e.preventDefault();
    lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  return {
    el: nav,
    setVisible(on) { nav.classList.toggle('is-on', on); },
    // Midden van het gele logo-vak, zonder de pop-animatie meegerekend
    boxCenter() {
      return { x: nav.offsetLeft + box.offsetLeft + box.offsetWidth / 2,
               y: nav.offsetTop + box.offsetTop + box.offsetHeight / 2 };
    },
  };
}
