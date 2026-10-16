// Diensten-blok: linkerkolom en nummer blijven plakken (CSS sticky), vierkantje en nummer volgen de dienst op de leeslijn
//  [data-services]         de rij met de drie delen (stopt het plakken onderaan)
//  [data-services-sticky]  linkerkolom en het nummer: plakken tijdens het scrollen
//  [data-service]          een categorie;  [data-service-mark] het vierkantje erin
//  [data-service-item]     een dienst-regel;  [data-service-count] het nummer

// CONFIG.line: leeslijn en plakhoogte, als deel van de schermhoogte (0 = bovenkant)
const CONFIG = { line: 0.3 };

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

  const show = (item) => {
    if (count) count.textContent = items.indexOf(item) + 1;
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
