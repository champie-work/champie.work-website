// Menubalk bovenaan (Figma "MENU POPUP"): geel logo-vak + "Start a project" links, navigatie rechts.
// De HTML staat in de pagina ([data-menu], src/components/Menu.astro).
// Home: popt omhoog zodra de gele header helemaal uit beeld is, en gaat weg als de footer in beeld komt.
// Pagina zonder header (projectpagina): staat er meteen.
import { onFrame } from '../lib/core.js';
import { lenis } from './smooth-scroll.js';

export function initMenu() {
  const nav = document.querySelector('[data-menu]');
  if (!nav) return;
  document.body.appendChild(nav); // los van de pagina-inhoud, zodat een projectvel er niet overheen valt
  const hero = document.querySelector('[data-hero]');

  nav.querySelector('.cmenu_logo').addEventListener('click', (e) => {
    if (!hero) return; // gewoon naar home
    e.preventDefault();
    lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (!hero) { nav.classList.add('is-on', 'is-static'); return; }

  let on = false;
  onFrame(() => {
    const open = document.documentElement.classList.contains('project-open');
    const footer = [...document.querySelectorAll('[data-footer]')].find((f) => !f.closest('.cpp')); // niet die in een projectvel
    const pastHero = hero.getBoundingClientRect().bottom <= 0;
    const atFooter = !!footer && footer.getBoundingClientRect().top < window.innerHeight;
    const next = open || (pastHero && !atFooter);
    if (next !== on) { on = next; nav.classList.toggle('is-on', on); }
  });
}
