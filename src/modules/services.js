// Diensten-blok als draaiwiel (zoals de iOS-kiezer): de rij staat vast in beeld, scrollen draait het wiel.
// De actieve categorie staat bovenaan op volle maat; de volgende worden kleiner en kantelen weg,
// voorbije draaien naar boven en vervagen. Stopt het scrollen, dan zakt het wiel op de dichtstbijzijnde categorie.
//  [data-services]        de rij (wordt vastgezet)
//  [data-service-wheel]   het vak waarin de categorieën draaien
//  [data-service]         een categorie;  [data-service-mark] het vierkantje (alleen bij de actieve)
import { onFrame, reduceMotion } from '../lib/core.js';
import { clamp, spring, wheelScale, wheelOffsets } from '../lib/math.js';

// step:   scroll-afstand per categorie in px (hoger = rustiger)
// speed:  veer van het wiel (hoger = sneller, lager = zwaarder wiel)
// idle:   ms zonder scrollen voordat het wiel op een categorie vastklikt
// scales: maat van de actieve rij, de volgende, de daarna... (Figma: 32, 20, 16, 10 px)
// gap:    ruimte tussen de rijen in px
// tilt:   kanteling per rij in graden (het 3D-wiel-gevoel)
// fade:   hoe snel voorbije rijen vervagen (1 = weg na één rij)
const CONFIG = { step: 320, speed: 9, idle: 140, scales: [1, 0.625, 0.5, 0.3125], gap: 50, tilt: 14, fade: 1.4 };

export function initServices() {
  const row = document.querySelector('[data-services]');
  const wheel = row?.querySelector('[data-service-wheel]');
  if (!wheel) return;
  const cats = [...wheel.querySelectorAll('[data-service]')].map((el) => ({
    el, parts: [...el.children].filter((c) => !c.hasAttribute('data-service-mark')), h: 0,
  }));
  if (!cats.length) return;
  const n = cats.length;

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

    const scales = cats.map((c, i) => wheelScale(i - s.x, CONFIG.scales));
    const ys = wheelOffsets(cats.map((c, i) => c.h * scales[i]), CONFIG.gap, s.x);
    cats.forEach((c, i) => {
      const d = i - s.x;
      c.el.style.transform = `translate3d(0, ${ys[i]}px, 0) rotateX(${-d * CONFIG.tilt}deg)`;
      c.el.style.opacity = d < 0 ? clamp(1 + d * CONFIG.fade, 0, 1) : 1;
      for (const p of c.parts) p.style.scale = scales[i];
    });
  });
}
