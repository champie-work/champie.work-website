// Gedeelde basis: één animatie-loop, muisstatus en kleine wiskunde-helpers.

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Eén requestAnimationFrame-loop voor alle modules (volgorde = volgorde van toevoegen) ---
const subs = new Set();
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  for (const fn of subs) fn(now, dt);
}
requestAnimationFrame(loop);
export const ticker = {
  add(fn) { subs.add(fn); return () => subs.delete(fn); },
};

// --- Muis ---
export const pointer = { x: window.innerWidth / 2, y: 0, active: false, lastMove: 0 };
if (!reduceMotion) {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.active = true; pointer.lastMove = performance.now();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { pointer.active = false; });
}

// --- Zichtbare maat zonder scrollbalken ---
export const viewW = () => document.documentElement.clientWidth;
export const viewH = () => document.documentElement.clientHeight;

// --- Wiskunde ---
export const clamp = (v, a = -1, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOutQuart = (t) => t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2;
export const easeInOutCubic = (t) => t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Kritisch gedempte veer (zacht, schiet niet door). s = { x, v }
export function spring(s, target, w, dt) {
  for (let n = Math.ceil(dt / 0.008), h = dt / n; n > 0; n--) {
    s.v += (w * w * (target - s.x) - 2 * w * s.v) * h;
    s.x += s.v * h;
  }
}

// Getal uit een data-attribuut, met standaardwaarde
export const num = (el, name, def) => {
  const v = parseFloat(el?.getAttribute(name));
  return Number.isFinite(v) ? v : def;
};
