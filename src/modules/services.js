// Diensten-blok als maatgolf: de rij staat vast in beeld en de lijst blijft op volgorde staan, zoals een inhoudsopgave.
// Scrollen schuift de grote maat door de lijst: de actieve categorie groeit naar volle maat, de rest krimpt terug.
// Stopt het scrollen, dan zakt de golf op de dichtstbijzijnde categorie. Na de laatste laat de rij los.
//  [data-services]        de rij (wordt vastgezet)
//  [data-service-wheel]   het vak met de categorieën
//  [data-service]         een categorie;  [data-service-mark] het vierkantje (alleen bij de actieve)
import { onFrame, reduceMotion } from '../lib/core.js';
import { clamp, spring, wheelScale } from '../lib/math.js';

// step:   scroll-afstand per categorie in px (lager = sneller)
// speed:  veer van de golf (hoger = sneller)
// idle:   ms zonder scrollen voordat de golf op een categorie vastklikt
// scales: maat van de actieve rij, de buren, de rij daarna... (Figma: 32, 20, 16, 10 px)
// gap:    ruimte tussen de rijen in px
const CONFIG = { step: 200, speed: 14, idle: 120, scales: [1, 0.625, 0.5, 0.3125], gap: 50 };

export function initServices() {
  const row = document.querySelector('[data-services]');
  const wheel = row?.querySelector('[data-service-wheel]');
  if (!wheel) return;
  const cats = [...wheel.querySelectorAll('[data-service]')].map((el) => ({
    el, parts: [...el.children].filter((c) => !c.hasAttribute('data-service-mark')), h: 0,
  }));
  const n = cats.length;
  if (!n) return;

  // Lege ruimte na de rij = de scroll-afstand waarin de rij vaststaat
  const spacer = document.createElement('div');
  row.after(spacer);

  let pinTop = 0, last = NaN;
  const measure = () => {
    cats.forEach((c) => { c.h = c.el.offsetHeight; }); // transform telt niet mee, dus dit is de volle maat
    pinTop = Math.max(24, (window.innerHeight - row.offsetHeight) / 2);
    row.style.top = `${pinTop}px`;
    spacer.style.height = `${(n - 1) * CONFIG.step}px`;
    last = NaN;
  };
  measure();
  window.addEventListener('resize', measure);
  document.fonts?.ready.then(measure);

  let active = -1, raw = 0, moved = 0;
  const s = { x: 0, v: 0 };
  onFrame((now, dt) => {
    // Hoe ver de rij al vaststaat, in categorieën (de spacer schuift onder de vaste rij door)
    const natural = spacer.getBoundingClientRect().top - row.offsetHeight;
    const r = clamp((pinTop - natural) / CONFIG.step, 0, n - 1);
    if (r !== raw) { raw = r; moved = now; }
    const target = reduceMotion || now - moved > CONFIG.idle ? Math.round(raw) : raw;

    if (reduceMotion) s.x = target; else spring(s, target, CONFIG.speed, dt);
    if (Math.abs(target - s.x) < 0.001 && Math.abs(s.v) < 0.001) { s.x = target; s.v = 0; }

    const a = Math.round(s.x);
    if (a !== active) { cats.forEach((c, i) => c.el.classList.toggle('is-active', i === a)); active = a; }
    if (s.x === last) return;
    last = s.x;

    // Rijen onder elkaar met hun huidige maat; de lijst begint altijd bovenaan
    let y = 0;
    for (let i = 0; i < n; i++) {
      const c = cats[i], sc = wheelScale(i - s.x, CONFIG.scales);
      c.el.style.transform = `translate3d(0, ${y}px, 0)`;
      for (const p of c.parts) p.style.scale = sc;
      y += c.h * sc + CONFIG.gap;
    }
  });
}
