// Nav-hover
//  [data-nav-link]  link in de navigatie: bij hover komt er een zwart vak achter
//                   en rolt de tekst omhoog; de nieuwe regel is geel (stijl in champie.css)
// Heeft de link al een element als eerste kind (bv. "Let's talk" + pijl), dan rolt alleen dat.
export function initNavHover(root = document) {
  for (const link of root.querySelectorAll('[data-nav-link]')) {
    const first = link.firstElementChild;
    const label = first && first.tagName.toLowerCase() !== 'svg' ? first : link;
    const text = label.textContent.trim();
    if (!text || label.querySelector('.nh_track')) continue;
    link.setAttribute('aria-label', link.textContent.trim());
    const line = (cls) => { const s = document.createElement('span'); s.textContent = text; if (cls) s.className = cls; return s; };
    const track = document.createElement('span'); track.className = 'nh_track';
    track.append(line(), line('nh_alt'));
    const clip = document.createElement('span'); clip.className = 'nh_clip'; clip.setAttribute('aria-hidden', 'true');
    clip.append(track);
    label.replaceChildren(clip);
  }
}
