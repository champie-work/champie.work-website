// Project-hover
//  [data-project]          de projectkaart
//  [data-project-title]    titel; data-hover-title="..." = tekst die bij hover inrolt (met pijl)
//  [data-project-arrow]    (optioneel) de pijl; zonder eigen pijl wordt de eerste gekopieerd
//  [data-project-media]    fotokader; bij hover zweeft er een kleine kopie van de foto mee met de cursor
import { onFrame } from '../lib/core.js';
import { follow } from '../lib/math.js';

const FOLLOW = { size: 0.24, offset: 14, ease: 0.16, scaleEase: 0.14 };

export function initProjectHover() {
  const arrowSrc = document.querySelector('[data-project-arrow]');

  // 1) Titel-roll
  document.querySelectorAll('[data-project]').forEach((card) => {
    const title = card.querySelector('[data-project-title]');
    if (!title || title.querySelector('.ptr_track')) return;
    const base = title.textContent.trim();
    const hover = title.getAttribute('data-hover-title') || base;
    const arrow = card.querySelector('[data-project-arrow]') || (arrowSrc ? arrowSrc.cloneNode(true) : null);
    title.textContent = '';
    const track = document.createElement('div'); track.className = 'ptr_track';
    const l1 = document.createElement('div'); l1.className = 'ptr_line'; l1.textContent = base;
    const l2 = document.createElement('div'); l2.className = 'ptr_line'; l2.setAttribute('aria-hidden', 'true');
    if (arrow) { arrow.classList.add('ptr_arrow'); l2.appendChild(arrow); }
    l2.appendChild(document.createTextNode(hover));
    track.append(l1, l2); title.appendChild(track);
  });

  // 2) Zwevende kopie van de foto
  const followers = [];
  document.querySelectorAll('[data-project-media]').forEach((media) => {
    const img = media.querySelector('img'); if (!img) return;
    const box = document.createElement('div'); box.className = 'project_follow';
    const copy = document.createElement('img');
    copy.alt = ''; copy.src = img.currentSrc || img.src; copy.draggable = false;
    box.appendChild(copy); media.appendChild(box);
    const f = { box, x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0 };
    const setTarget = (e) => {
      const r = media.getBoundingClientRect();
      f.tx = e.clientX - r.left + FOLLOW.offset; f.ty = e.clientY - r.top + FOLLOW.offset;
    };
    media.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      const r = media.getBoundingClientRect();
      const h = r.height * FOLLOW.size;
      box.style.height = h + 'px'; box.style.width = (h * r.width / r.height) + 'px';
      setTarget(e); if (f.s < 0.02) { f.x = f.tx; f.y = f.ty; }
      f.ts = 1;
    });
    media.addEventListener('pointermove', setTarget);
    media.addEventListener('pointerleave', () => { f.ts = 0; });
    followers.push(f);
  });

  onFrame((now, dt) => {
    const k = follow(FOLLOW.ease, dt), ks = follow(FOLLOW.scaleEase, dt);
    for (const f of followers) {
      f.x += (f.tx - f.x) * k;
      f.y += (f.ty - f.y) * k;
      f.s += (f.ts - f.s) * ks;
      if (f.ts === 0 && f.s < 0.005) f.s = 0;
      f.box.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) scale(${f.s})`;
    }
  });
}
