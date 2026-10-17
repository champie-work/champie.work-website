// node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { TAU, spring, nextFront, follow } from '../src/lib/math.js';

test('veer komt aan zonder door te schieten', () => {
  const s = { x: 0, v: 0 };
  let max = 0;
  for (let i = 0; i < 120; i++) { spring(s, 100, 8, 1 / 60); max = Math.max(max, s.x); }
  assert.ok(max <= 100.0001, `schoot door tot ${max}`);
  assert.ok(Math.abs(s.x - 100) < 0.5);
});

test('logo stopt op de dichtstbijzijnde voorkant vooruit', () => {
  assert.equal(nextFront(0), 0);                    // al voor
  assert.equal(nextFront(0.3), 0);                  // net voorbij: terug
  assert.equal(nextFront(Math.PI), TAU);            // achterkant: door naar voren
  assert.equal(nextFront(TAU * 3 + 2), TAU * 4);    // na meerdere rondes
});

test('volgen is gelijk op 60 en 120 Hz', () => {
  const a = 1 - (1 - follow(0.1, 1 / 60));
  const b = 1 - (1 - follow(0.1, 1 / 120)) ** 2;
  assert.ok(Math.abs(a - b) < 1e-9);
});

import { wheelScale, wheelOffsets } from '../src/lib/math.js';

test('wiel: maat per afstand, ook tussen de stappen en voorbij het eind', () => {
  const s = [1, 0.625, 0.5, 0.3125];
  assert.equal(wheelScale(0, s), 1);
  assert.equal(wheelScale(-1, s), 0.625);
  assert.equal(wheelScale(0.5, s), 0.8125);
  assert.equal(wheelScale(7, s), 0.3125);
});

test('wiel: actieve rij op 0, Figma-afstanden kloppen', () => {
  // Figma: rijen 99/62/30/19 hoog, 50 ertussen -> 0, 149, 261, 341
  assert.deepEqual(wheelOffsets([99, 62, 30, 19], 50, 0), [0, 149, 261, 341]);
  assert.deepEqual(wheelOffsets([99, 62, 30, 19], 50, 1), [-149, 0, 112, 192]);
  assert.deepEqual(wheelOffsets([99, 62, 30, 19], 50, 0.5), [-74.5, 74.5, 186.5, 266.5]);
});
