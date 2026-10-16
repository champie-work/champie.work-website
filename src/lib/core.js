// Gedeelde browser-basis: één animatie-loop en de muisstatus.

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Eén requestAnimationFrame-loop voor alle modules (volgorde = volgorde van toevoegen)
const subs = [];
let last = performance.now();
requestAnimationFrame(function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  for (const fn of subs) fn(now, dt);
});
export const onFrame = (fn) => subs.push(fn);

export const pointer = { x: 0, y: 0, active: false, lastMove: 0 };
if (!reduceMotion) {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    Object.assign(pointer, { x: e.clientX, y: e.clientY, active: true, lastMove: performance.now() });
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { pointer.active = false; });
}

// Zichtbare maat zonder scrollbalken
export const viewW = () => document.documentElement.clientWidth;
export const viewH = () => document.documentElement.clientHeight;
