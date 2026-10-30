// Smooth scroll met Lenis (zoals raviklaassens.com)
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm';
import { onFrame, reduceMotion } from '../lib/core.js';

export let lenis = null; // project-page.js zet hem stil zolang een project open is

export function initSmoothScroll() {
  if (reduceMotion) return;
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  onFrame((now) => lenis.raf(now));
  // Links naar een sectie op deze pagina (#projects, /#services): zacht scrollen
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.pathname !== location.pathname) return;
    const el = a.hash.length > 1 && document.getElementById(a.hash.slice(1));
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el);
  });
}
