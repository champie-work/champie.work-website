// Menubalk bovenaan (Figma "MENU POPUP"): geel logo-vak + "Start a project" links, navigatie rechts.
// De HTML staat in de pagina ([data-menu], src/components/Menu.astro). Het 3D-logo vliegt in het logo-vak.
import { lenis } from './smooth-scroll.js';

const isHome = () => !!document.querySelector('[data-logo3d]');

export function initMenu() {
  const nav = document.querySelector('[data-menu]');
  if (!nav) return null;
  document.body.appendChild(nav); // los van de pagina-inhoud, zodat een projectvel er niet overheen valt

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
