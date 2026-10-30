// Live klok Enschede (header én footer, ook op projectpagina's)
//  [data-clock="enschede"]  tijd, bv. 18:00:00
//  [data-date="enschede"]   datum, bv. Monday, Oct 19
export function initClock() {
  const tz = 'Europe/Amsterdam';
  const tf = new Intl.DateTimeFormat('nl-NL', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const df = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'short', day: 'numeric' });
  (function tick() {
    const d = new Date();
    const t = tf.format(d), day = df.format(d);
    for (const el of document.querySelectorAll('[data-clock="enschede"]')) el.textContent = t; // ook in een later geopend projectvel
    for (const el of document.querySelectorAll('[data-date="enschede"]')) el.textContent = day;
    setTimeout(tick, 1000 - d.getMilliseconds() + 5);
  })();
}
