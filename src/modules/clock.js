// Live klok Enschede voor elk [data-clock="enschede"] (header én footer, ook op projectpagina's)
export function initClock() {
  const tz = 'Europe/Amsterdam';
  const tf = new Intl.DateTimeFormat('nl-NL', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const of = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
  const zone = (d) => /\+2/.test(of.formatToParts(d).find((x) => x.type === 'timeZoneName')?.value) ? 'CEST' : 'CET';
  (function tick() {
    const d = new Date();
    const t = `${tf.format(d)} (${zone(d)})`;
    for (const el of document.querySelectorAll('[data-clock="enschede"]')) el.textContent = t; // ook in een later geopend projectvel
    setTimeout(tick, 1000 - d.getMilliseconds() + 5);
  })();
}
