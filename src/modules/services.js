// Diensten-blok: linkerkolom en nummer blijven plakken (CSS sticky), vierkantje en nummer volgen de dienst op de leeslijn
//  [data-services]         de rij met de drie delen (stopt het plakken onderaan)
//  [data-services-sticky]  linkerkolom en het nummer: plakken tijdens het scrollen
//  [data-service]          een categorie;  [data-service-mark] het vierkantje, [data-service-name] de naam (plakken binnen hun categorie)
//  [data-service-item]     een dienst-regel;  [data-service-count] het nummer (rolt als een kilometerteller)
import { reduceMotion } from '../lib/core.js';

// line: leeslijn en plakhoogte, als deel van de schermhoogte (0 = bovenkant)
// roll: duur van het rollen van een cijfer in ms
const CONFIG = { line: 0.3, roll: 500 };

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
  row.style.setProperty('--services-top', `${CONFIG.line * 100}vh`);
  // Genoeg ruimte onder de rij zodat ook de laatste dienst de leeslijn haalt (de pagina houdt daar op)
  const below = parseFloat(getComputedStyle(row.parentElement).paddingBottom) || 0;
  const last = items[items.length - 1].offsetHeight;
  row.style.marginBottom = `max(0px, calc(${100 - CONFIG.line * 100}vh - ${below + last}px))`;

  // Teller: één kolom per cijfer, voorloopnul blijft leeg
  const digits = String(items.length).length;
  const cols = [];
  if (count) {
    count.textContent = '';
    for (let i = 0; i < digits; i++) cols.push(count.appendChild(Object.assign(document.createElement('span'), { className: 'odo' })));
  }
  let current = 0;

  const show = (item) => {
    const n = items.indexOf(item) + 1;
    const s = String(n).padStart(digits, ' ');
    cols.forEach((c, i) => roll(c, s[i].trim(), n > current));
    current = n;
    const cat = item.closest('[data-service]');
    row.querySelectorAll('[data-service]').forEach((c) => c.classList.toggle('is-active', c === cat));
  };
  show(items[0]);

  // Dunne lijn op CONFIG.line: de regel die hem raakt wordt actief (geen scroll-loop nodig)
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) show(e.target);
  }, { rootMargin: `-${CONFIG.line * 100}% 0px -${100 - CONFIG.line * 100 - 0.1}% 0px` });
  items.forEach((el) => io.observe(el));
}
