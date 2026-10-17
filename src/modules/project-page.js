// Projectpagina: een echte pagina (/ralph-lauren) die als vel over de wazige homepage schuift.
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

// top:  hoeveel van de homepage boven het vel zichtbaar is (deel van de schermhoogte; Figma 224/841)
// grow: beginmaat van [data-grow] (Figma 497/1392)
const CONFIG = { top: 0.27, grow: 0.36 };

let view = null; // { wrap, sheet, grows, lenis, pushed }
const cache = new Map();

const load = (url) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => r.text()).then((t) => new DOMParser().parseFromString(t, 'text/html')));
  return cache.get(url);
};

function open(sheet, { animate, pushed }) {
  document.documentElement.style.setProperty('--pp-top', CONFIG.top * 100 + 'vh');
  const wrap = document.createElement('div'); wrap.className = 'cpp';
  wrap.append(sheet); document.body.appendChild(wrap);
  document.documentElement.classList.add('project-open');
  pageLenis?.stop();
  const lenis = reduceMotion ? null : new Lenis({ wrapper: wrap, content: sheet, duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  addParallaxImgs(sheet.querySelectorAll('[data-parallax-img]'));
  view = { wrap, sheet, grows: [...sheet.querySelectorAll('[data-grow]')], lenis, pushed };
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  sheet.querySelectorAll('[data-project-close]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); close(); }));
  if (animate && !reduceMotion) wrap.getBoundingClientRect(); // eerst de beginstand tekenen, dan pas animeren
  wrap.classList.add('is-in');
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
    open(own, { animate: false, pushed: false });
    const bg = document.createElement('div'); bg.className = 'cpp_home'; bg.inert = true;
    document.body.prepend(bg);
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
    const { wrap, grows } = view;
    view.lenis?.raf(now);
    // Groeibeeld: klein als het onderaan binnenkomt, volle maat als de bovenkant bij 10% van het scherm is
    const vh = wrap.clientHeight;
    for (const g of grows) {
      const t = reduceMotion ? 1 : clamp((vh - g.getBoundingClientRect().top) / (vh * 0.9), 0, 1);
      g.style.transform = `scale(${CONFIG.grow + (1 - CONFIG.grow) * easeInOutCubic(t)})`;
    }
  });
}
