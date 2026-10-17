// Pure rekenhulpjes (geen browser nodig, dus testbaar met node --test).

export const TAU = Math.PI * 2;
export const clamp = (v, a = -1, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOutQuart = (t) => t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2;
export const easeInOutCubic = (t) => t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Deel van de afstand dat je per frame aflegt, gelijk op 60 en 144 Hz schermen
export const follow = (rate, dt) => 1 - Math.pow(1 - rate, dt * 60);

// Kritisch gedempte veer (zacht, schiet niet door). s = { x, v }
export function spring(s, target, w, dt) {
  for (let n = Math.ceil(dt / 0.008), h = dt / n; n > 0; n--) {
    s.v += (w * w * (target - s.x) - 2 * w * s.v) * h;
    s.x += s.v * h;
  }
}

// Draaihoek waar het logo stopt: net voorbij de voorkant terug, anders door naar de volgende voorkant
export function nextFront(angle) {
  const rest = angle % TAU; // kan net onder 0 zijn na de veer; dan ook terug naar 0
  return angle - rest + (rest < 0.5 ? 0 : TAU);
}

// Draaiwiel: maat van een rij op afstand d van de actieve rij (0 = actief), lineair tussen de stappen
export function wheelScale(d, steps) {
  const a = Math.abs(d), last = steps.length - 1, i = Math.floor(a);
  return i >= last ? steps[last] : lerp(steps[i], steps[i + 1], a - i);
}

// Draaiwiel dat rondgaat: afstand van rij i tot positie p, ingepakt in [-0.5, n - 0.5)
// (net voorbij de top = weg naar boven, daarna komt de rij onderaan terug)
export const wheelWrap = (i, p, n) => ((((i - p + 0.5) % n) + n) % n) - 0.5;
