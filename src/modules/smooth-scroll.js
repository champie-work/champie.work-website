// Smooth scroll met Lenis (zoals raviklaassens.com)
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm';
import { ticker, reduceMotion } from '../lib/core.js';

export function initSmoothScroll({ duration = 1.1 } = {}) {
  if (reduceMotion || duration <= 0) return null;
  const lenis = new Lenis({ duration, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  ticker.add((now) => lenis.raf(now));
  return lenis;
}
