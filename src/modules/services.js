// Diensten-blok als draaiwiel (zoals de iOS-kiezer): de rij staat vast in beeld, scrollen draait het wiel rond.
// De categorieën zitten op een cilinder: de actieve staat bovenaan recht naar je toe,
// de volgende kantelen in 3D weg (perspectief), worden kleiner en donkerder. Bovenuit = weg, onderaan komt hij terug (eindeloos).
// Stopt het scrollen, dan klikt het wiel op de dichtstbijzijnde categorie.
//  [data-services]        de rij (wordt vastgezet)
//  [data-service-wheel]   het vak waarin de categorieën draaien (bovenrand = lijn waar rijen achter wegdraaien)
//  [data-service]         een categorie;  [data-service-mark] het vierkantje (alleen bij de actieve)
import { onFrame, reduceMotion } from '../lib/core.js';
import { clamp, spring, wheelScale, wheelWrap } from '../lib/math.js';

// step:   scroll-afstand per categorie in px (lager = sneller)
// turns:  hoe vaak het wiel rondgaat terwijl de rij vaststaat (eindigt altijd weer bij de eerste)
// speed:  veer van het wiel (hoger = sneller, lager = zwaarder wiel)
// idle:   ms zonder scrollen voordat het wiel op een categorie vastklikt
// scales: maat van de actieve rij, de volgende, de daarna... (Figma: 32, 20, 16, 10 px)
// radius: straal van de cilinder in px (bepaalt de afstanden; Figma: 149, 112, 80)
// angle:  graden per categorie op de cilinder (bepaalt samen met radius de afstanden)
// tilt:   hoeveel van die hoek de rij echt kantelt (1 = volle cilinder, lager = beter leesbaar)
// dim:    hoeveel elke rij verder weg donkerder wordt
const CONFIG = { step: 150, turns: 2, speed: 16, idle: 110, scales: [1, 0.625, 0.5, 0.3125], radius: 340, angle: 26, tilt: 0.6, dim: 0.12 };

export function initServices() {
  const row = document.querySelector('[data-services]');
  const wheel = row?.querySelector('[data-service-wheel]');
  if (!wheel) return;
  const cats = [...wheel.querySelectorAll('[data-service]')].map((el) => ({
    el, parts: [...el.children].filter((c) => !c.hasAttribute('data-service-mark')),
  }));
  const n = cats.length;
  if (!n) return;
  const total = n * CONFIG.turns;

  // Lege ruimte na de rij = de scroll-afstand waarin de rij vaststaat
  const spacer = document.createElement('div');
  row.after(spacer);

  let pinTop = 0, last = NaN;
  const measure = () => {
    pinTop = Math.max(24, (window.innerHeight - row.offsetHeight) / 2);
    row.style.top = `${pinTop}px`;
    spacer.style.height = `${total * CONFIG.step}px`;
    // Diepte meet vanaf de linkerkant van de dienstenkolom, zo blijven die regels recht onder elkaar
    const items = cats[0].parts[1];
    wheel.style.perspectiveOrigin = `${items ? items.offsetLeft : 0}px 0`;
    last = NaN;
  };
  measure();
  window.addEventListener('resize', measure);
  document.fonts?.ready.then(measure);

  const rad = Math.PI / 180;
  let active = -1, raw = 0, moved = 0;
  const s = { x: 0, v: 0 };
  onFrame((now, dt) => {
    // Hoe ver de rij al vaststaat, in categorieën (de spacer schuift onder de vaste rij door)
    const natural = spacer.getBoundingClientRect().top - row.offsetHeight;
    const r = clamp((pinTop - natural) / CONFIG.step, 0, total);
    if (r !== raw) { raw = r; moved = now; }
    const target = reduceMotion || now - moved > CONFIG.idle ? Math.round(raw) : raw;

    if (reduceMotion) s.x = target; else spring(s, target, CONFIG.speed, dt);
    if (Math.abs(target - s.x) < 0.001 && Math.abs(s.v) < 0.001) { s.x = target; s.v = 0; }

    const a = ((Math.round(s.x) % n) + n) % n;
    if (a !== active) { cats.forEach((c, i) => c.el.classList.toggle('is-active', i === a)); active = a; }
    if (s.x === last) return;
    last = s.x;

    cats.forEach((c, i) => {
      const w = wheelWrap(i, s.x, n);
      const t = Math.min(w, n - 1) * CONFIG.angle * rad; // hoek op de cilinder
      const y = CONFIG.radius * Math.sin(t);
      c.el.style.transform = `translate3d(0, ${y}px, 0) rotateX(${(-t / rad) * CONFIG.tilt}deg)`;
      // Bovenuit vervagen, onderaan weer invervagen
      c.el.style.opacity = clamp(Math.min(1 + w * 2, (n - 0.5 - w) * 2), 0, 1) * (1 - Math.max(w, 0) * CONFIG.dim);
      const sc = wheelScale(w, CONFIG.scales);
      for (const p of c.parts) p.style.scale = sc;
    });
  });
}
