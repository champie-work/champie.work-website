// champie.work — startpunt. Zet elke module alleen aan als de pagina er iets voor heeft.
// Volgorde telt: smooth scroll en parallax eerst, het logo leest hun stand.
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initParallax } from './modules/parallax.js';
import { initMenu } from './modules/menu.js';
import { initLogo3d } from './modules/logo3d.js';
import { initProjectHover } from './modules/project-hover.js';
import { initEyes } from './modules/eye.js';

const $ = (s) => document.querySelector(s);

initSmoothScroll();
initParallax();

const logoAnchor = $('[data-logo3d]');
const menu = initMenu();
if (logoAnchor) {
  initLogo3d({ anchor: logoAnchor, trigger: $('[data-logo3d-trigger]'), hero: $('[data-hero]'), menu });
} else {
  menu.setVisible(true); // pagina zonder groot logo: menu meteen tonen
}

initProjectHover();
initEyes();
