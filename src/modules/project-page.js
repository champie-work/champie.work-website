// Projectpagina: een echte pagina (/ralph-lauren) als modal over de wazige homepage.
// Het vak blijft staan (homepage blijft bovenin zichtbaar); alleen de inhoud scrollt erin.
//  [data-project-page="naam"]  wrapper om de hele projectpagina (direct in body)
//  [data-project-close]        sluit-link (href="/")
//  [data-grow]                 beeld dat klein begint en groot wordt tijdens het scrollen
//  [data-parallax-img]         werkt ook in het vel (parallax.js)
// Vanaf home: klik op een [data-project] met een link -> pagina ophalen, vel schuift omhoog, URL wordt /naam.
// Direct bezoek: de homepage wordt erachter gezet (wazig, niet klikbaar).
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm';
import { onFrame, reduceMotion } from '../lib/core.js';
import { clamp, easeInOutCubic } from '../lib/math.js';
import { lenis as pageLenis } from './smooth-scroll.js';
import { addParallaxImgs } from './parallax.js';

// top:   hoeveel van de homepage boven het vel zichtbaar is (deel van de schermhoogte; Figma 134/841)
// grow:  beginmaat van [data-grow] (Figma 497/1392)
// tilt:  beelden komen binnen met deze kanteling (graden) en liggen dan plat
// delay: wanneer de inhoud begint te bewegen (ms na de klik)
const CONFIG = { top: 0.16, grow: 0.36, tilt: 35, delay: 600 };
const EASE = 'cubic-bezier(.22,1,.36,1)';

let view = null; // { wrap, box, sheet, grows, lenis, pushed }
const cache = new Map();

const load = (url) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => r.text()).then((t) => new DOMParser().parseFromString(t, 'text/html')));
  return cache.get(url);
};

function open(sheet, { animate, pushed }) {
  document.documentElement.style.setProperty('--pp-top', CONFIG.top * 100 + 'vh');
  const wrap = document.createElement('div'); wrap.className = 'cpp';
  const box = document.createElement('div'); box.className = 'cpp_box'; // vast vak, scrollt van binnen
  box.append(sheet); wrap.append(box); document.body.appendChild(wrap);
  document.documentElement.classList.add('project-open');
  pageLenis?.stop();
  const lenis = reduceMotion ? null : new Lenis({ wrapper: box, content: sheet, duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  addParallaxImgs(sheet.querySelectorAll('[data-parallax-img]'));
  view = { wrap, box, sheet, grows: [...sheet.querySelectorAll('[data-grow]')], lenis, pushed };
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  sheet.querySelectorAll('[data-project-close]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); close(); }));
  if (animate && !reduceMotion) wrap.getBoundingClientRect(); // eerst de beginstand tekenen, dan pas animeren
  wrap.classList.add('is-in');
  if (!reduceMotion) reveal(sheet, animate ? CONFIG.delay : 150);
}

// Inhoud bouwt zich op: titel schuift omhoog uit een masker, tekst komt op, beelden kantelen plat
function reveal(sheet, delay) {
  const fold = innerHeight;
  const seen = (el) => el.getBoundingClientRect().top < fold;
  const title = sheet.querySelector('h1');
  title?.animate([{ transform: 'translateY(60%)', clipPath: 'inset(0 0 100% 0)' }, { transform: 'none', clipPath: 'inset(0 0 0 0)' }],
    { duration: 1000, delay, easing: EASE, fill: 'backwards' });
  [...sheet.children].slice(0, 3).filter(seen).forEach((el, i) =>
    el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
      { duration: 800, delay: delay + 100 + i * 90, easing: EASE, fill: 'backwards' }));
  const imgs = [...sheet.querySelectorAll('[data-grow] img'), ...[...sheet.querySelectorAll('[data-parallax-img]')].map((i) => i.parentElement)];
  imgs.filter(seen).forEach((el, i) => {
    el.style.transformOrigin = '50% 100%';
    el.animate([{ opacity: 0, transform: `perspective(1200px) rotateX(${CONFIG.tilt}deg) translateY(80px)` }, { opacity: 1, transform: 'none' }],
      { duration: 1200, delay: delay + 250 + i * 120, easing: EASE, fill: 'backwards' });
  });
}

function close(fromHistory) {
  if (!view) return;
  if (!view.pushed) { location.href = '/'; return; } // direct bezoek: gewoon naar home
  if (!fromHistory) { history.back(); return; }       // popstate sluit hem daarna
  const v = view; view = null;
  v.wrap.classList.remove('is-in');
  document.documentElement.classList.remove('project-open');
  const done = () => { v.lenis?.destroy(); v.wrap.remove(); pageLenis?.start(); };
  reduceMotion ? done() : setTimeout(done, 900);
}

async function openUrl(url, push) {
  const doc = await load(url);
  const sheet = doc.querySelector('[data-project-page]');
  if (!sheet) { location.href = url; return; }
  if (push) history.pushState({ project: url }, '', url);
  document.title = doc.title;
  open(document.importNode(sheet, true), { animate: true, pushed: true });
}

export function initProjectPage() {
  const homeTitle = document.title;
  const own = document.querySelector('[data-project-page]');

  if (own) {
    // Direct bezoek: home erachter zetten
    const bg = document.createElement('div'); bg.className = 'cpp_home'; bg.inert = true;
    document.body.prepend(bg);
    open(own, { animate: false, pushed: false });
    load('/').then((doc) => {
      doc.querySelectorAll('script, [data-project-page]').forEach((n) => n.remove());
      bg.append(...[...doc.body.children].map((n) => document.importNode(n, true)));
    });
  } else {
    document.querySelectorAll('[data-project]').forEach((card) => {
      const a = card.closest('a[href]') || card.querySelector('a[href]');
      if (!a || a.origin !== location.origin || a.pathname === '/') return;
      card.addEventListener('pointerenter', () => load(a.pathname), { once: true }); // alvast ophalen
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || view) return;
        e.preventDefault(); openUrl(a.pathname, true);
      });
    });
    window.addEventListener('popstate', () => {
      if (location.pathname === '/') { close(true); document.title = homeTitle; }
      else if (!view) openUrl(location.pathname, false);
    });
  }
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  onFrame((now) => {
    if (!view) return;
    const { box, grows } = view;
    view.lenis?.raf(now);
    // Groeibeeld: klein als het onderaan het vak binnenkomt, volle maat als de bovenkant bij 10% van het vak is
    const bh = box.clientHeight, bt = box.getBoundingClientRect().top;
    for (const g of grows) {
      const t = reduceMotion ? 1 : clamp((bh - (g.getBoundingClientRect().top - bt)) / (bh * 0.9), 0, 1);
      g.style.transform = `scale(${CONFIG.grow + (1 - CONFIG.grow) * easeInOutCubic(t)})`;
    }
  });
}
