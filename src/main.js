// champie.work — startpunt. Volgorde telt: smooth scroll en parallax eerst, het logo leest hun stand.
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initParallax } from './modules/parallax.js';
import { initMenu } from './modules/menu.js';
import { initLogo3d } from './modules/logo3d.js';
import { initProjectHover } from './modules/project-hover.js';
import { initEyes } from './modules/eye.js';
import { initServices } from './modules/services.js';
import { initProjectPage } from './modules/project-page.js';

initSmoothScroll();
initParallax();

const anchor = document.querySelector('[data-logo3d]');
// shortcut: menu bestaat alleen samen met het 3D-logo; een pagina zonder logo heeft nog geen menu
if (anchor) initLogo3d({ anchor, trigger: document.querySelector('[data-logo3d-trigger]'), menu: initMenu() });

initProjectHover();
initEyes();
initServices();
initProjectPage();
