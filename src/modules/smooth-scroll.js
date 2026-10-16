// Smooth scroll met Lenis (zoals raviklaassens.com)
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm';
import { onFrame, reduceMotion } from '../lib/core.js';

export function initSmoothScroll() {
  if (reduceMotion) return;
  const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  onFrame((now) => lenis.raf(now));
}
