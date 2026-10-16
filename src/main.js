// champie.work — startpunt. Volgorde telt: smooth scroll en parallax eerst, het logo leest hun stand.
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initParallax } from './modules/parallax.js';
import { initHeader } from './modules/header.js';
import { initLogo3d } from './modules/logo3d.js';
import { initProjectHover } from './modules/project-hover.js';
import { initEyes } from './modules/eye.js';
import { initServices } from './modules/services.js';
import { initProjectPage } from './modules/project-page.js';

initSmoothScroll();
initParallax();

// Balk + 3D-logo op elke pagina; zonder [data-logo3d] (projectpagina) staat het logo meteen linksboven
initLogo3d({ anchor: document.querySelector('[data-logo3d]'), trigger: document.querySelector('[data-logo3d-trigger]'), bar: initHeader() });

initProjectHover();
initEyes();
initServices();
initProjectPage();
