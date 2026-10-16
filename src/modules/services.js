// Diensten-blok: de rij staat vast in beeld, elke dienst krijgt een eigen stukje scroll.
// De lijst schuift per dienst één regel op (veer), naam + vierkantje rijden mee binnen hun categorie.
//  [data-services]        de rij met de drie delen (wordt vastgezet)
//  [data-service]         een categorie;  [data-service-mark] het vierkantje, [data-service-name] de naam
//  [data-service-item]    een dienst-regel (grijs, de actieve wit);  [data-service-count] het nummer (rolt als een kilometerteller)
import { onFrame, reduceMotion } from '../lib/core.js';
import { clamp, spring } from '../lib/math.js';

// line:  leeslijn, als deel van de schermhoogte (0 = bovenkant)
// step:  scroll-afstand per dienst in px (hoger = rustiger)
// speed: veer van de lijst (hoger = sneller naar de volgende regel)
// roll:  duur van het rollen van een cijfer in ms
const CONFIG = { line: 0.3, step: 60, speed: 18, roll: 500 };

// Kilometerteller: het oude cijfer schuift weg, het nieuwe komt erachteraan (omhoog bij optellen, omlaag bij aftellen)
function roll(col, ch, up) {
  const old = col.lastElementChild;
  if (old && old.textContent === ch) return;
  const next = col.appendChild(document.createElement('span'));
  next.textContent = ch;
  if (!old) return;
  const d = up ? 100 : -100;
  const o = { duration: reduceMotion ? 0 : CONFIG.roll, easing: 'cubic-bezier(.22,1,.36,1)' };
  next.animate([{ transform: `translateY(${d}%)` }, { transform: 'none' }], o);
  old.animate([{ transform: 'none' }, { transform: `translateY(${-d}%)` }], o).finished.then(() => old.remove(), () => old.remove());
}

export function initServices() {
  const row = document.querySelector('[data-services]');
  const items = row ? [...row.querySelectorAll('[data-service-item]')] : [];
  if (!items.length) return;
  const count = row.querySelector('[data-service-count]');
  const cats = [...row.querySelectorAll('[data-service]')].map((el) => ({
    el, name: el.querySelector('[data-service-name]'), mark: el.querySelector('[data-service-mark]'), top: 0, max: 0,
  }));
  const list = cats[0].el.parentElement;

  // Lege ruimte na de rij = de scroll-afstand waarin de rij vaststaat
  const spacer = document.createElement('div');
  row.after(spacer);

  let tops = [], pinTop = 0, last = NaN;
  const measure = () => {
    list.style.translate = '';
    cats.forEach((c) => { c.name.style.translate = c.mark.style.translate = ''; });
    row.style.height = '';
    const L = list.getBoundingClientRect().top;
    tops = items.map((el) => el.getBoundingClientRect().top - L);
    cats.forEach((c) => {
      const r = c.name.getBoundingClientRect();
      c.top = r.top - L;
      c.max = c.el.getBoundingClientRect().bottom - r.bottom;
    });
    // Vastzetten zo dat de eerste dienst op de leeslijn staat; de rij eindigt precies onderaan de pagina
    const H = window.innerHeight;
    pinTop = H * CONFIG.line - (items[0].getBoundingClientRect().top - row.getBoundingClientRect().top);
    const below = parseFloat(getComputedStyle(row.parentElement).paddingBottom) || 0;
    row.style.top = `${pinTop}px`;
    row.style.height = `${H - pinTop - below}px`;
    spacer.style.height = `${(items.length - 1) * CONFIG.step}px`;
    last = NaN;
  };
  measure();
  window.addEventListener('resize', measure);

  // Teller: één kolom per cijfer, voorloopnul blijft leeg
  const digits = String(items.length).length;
  const cols = [];
  if (count) {
    count.textContent = '';
    for (let i = 0; i < digits; i++) cols.push(count.appendChild(Object.assign(document.createElement('span'), { className: 'odo' })));
  }

  let active = -1;
  const show = (i) => {
    const s = String(i + 1).padStart(digits, ' ');
    cols.forEach((c, k) => roll(c, s[k].trim(), i > active));
    items[active]?.classList.remove('is-current');
    items[i].classList.add('is-current');
    active = i;
    const cat = items[i].closest('[data-service]');
    cats.forEach((c) => c.el.classList.toggle('is-active', c.el === cat));
  };

  const s = { x: 0, v: 0 };
  onFrame((now, dt) => {
    // Hoe ver de rij al vaststaat, in diensten (de spacer schuift onder de vaste rij door)
    const natural = spacer.getBoundingClientRect().top - row.offsetHeight;
    const i = clamp(Math.round((pinTop - natural) / CONFIG.step), 0, items.length - 1);
    if (i !== active) show(i);

    const target = tops[i] - tops[0];
    if (reduceMotion) s.x = target; else spring(s, target, CONFIG.speed, dt);
    if (Math.abs(target - s.x) < 0.1 && Math.abs(s.v) < 0.1) { s.x = target; s.v = 0; }
    if (s.x === last) return;
    last = s.x;

    list.style.translate = `0 ${-s.x}px`;
    for (const c of cats) c.name.style.translate = c.mark.style.translate = `0 ${clamp(tops[0] + s.x - c.top, 0, c.max)}px`;
  });
}
