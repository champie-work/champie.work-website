// champie.work — startpunt. Volgorde telt: smooth scroll en parallax eerst, het logo leest hun stand.
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initParallax } from './modules/parallax.js';
import { initMenu } from './modules/menu.js';
import { initLogo3d } from './modules/logo3d.js';
import { initProjectHover } from './modules/project-hover.js';
import { initEyes } from './modules/eye.js';
import { initNavHover } from './modules/nav-hover.js';
import { initMarquee } from './modules/marquee.js';
import { initClock } from './modules/clock.js';
import { initProjectPage } from './modules/project-page.js';

initSmoothScroll();
initParallax();

// Menu + 3D-logo op elke pagina; zonder [data-logo3d] (projectpagina) staat het logo meteen in het menu
initLogo3d({ anchor: document.querySelector('[data-logo3d]'), trigger: document.querySelector('[data-logo3d-trigger]'), menu: initMenu() });

initProjectHover();
initEyes();
initNavHover();
initMarquee();
initClock();
initProjectPage();
