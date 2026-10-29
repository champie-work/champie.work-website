# champie.work-website

Animaties en interactie voor [champie.work](https://champie.work) (Webflow).
Geen build-stap: gewone ES-modules, geladen via jsDelivr.

## In Webflow laden

Eén embed (in een Symbol die op elke pagina staat), met een vaste versie:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/champie-work/champie.work-website@v1.0.0/src/champie.css">
<script type="module" src="https://cdn.jsdelivr.net/gh/champie-work/champie.work-website@v1.0.0/src/main.js"></script>
```

Nieuwe versie live zetten = nieuwe tag maken (bv. `v1.0.1`) en het versienummer in de embed aanpassen.
Iets mis? Zet het nummer terug naar de vorige versie.

## Data-attributen

| Attribuut | Op welk element | Wat het doet |
|---|---|---|
| `data-hero` | de header-sectie | bepaalt hoe lang de header-parallax duurt |
| `data-parallax-hero` | lagen in de header (woordmerk, nav-rij, onderste rij) | bewegen trager mee (snelheid: `HERO_SPEED` in `parallax.js`) |
| `data-parallax-img` | foto in een kader met `overflow: hidden` | schuift binnen het kader (`IMG_RANGE` in `parallax.js`) |
| `data-logo3d` | het vak waar het grote 3D-logo staat | 3D-logo (draait in rust, volgt de muis, vliegt naar het menu) |
| `data-logo3d-trigger` | het woordmerk | half uit beeld = logo vliegt naar het menu |
| `data-project` | projectkaart | hover-effecten |
| `data-project-title` | titel in de kaart | rolt bij hover naar `data-hover-title="..."` |
| `data-project-arrow` | de ↳-pijl | pijl in de hovertitel |
| `data-project-media` | fotokader van de kaart | kleine zwevende kopie van de foto volgt de cursor |
| `data-eye` | een oog-SVG in tekst | pupil kijkt horizontaal mee binnen het wit |
| `data-label` | sectielabel (Projects, Services, Insights) | geel vakje met `/` ervoor |
| `data-nav-link` | link in nav (header en footer) | hover: zwart vak, tekst rolt omhoog naar geel (`nav-hover.js`) |
| `data-service-row` / `data-row-icon` | dienstrij en het gele pijl-vakje | pijl-vakje verschijnt bij hover |
| `data-insight` / `data-insight-arrow` / `data-insight-time` | insight-kaart (CMS) | hover: pijl schuift voor de titel, leestijd verdwijnt |
| `data-marquee` / `data-marquee-track` | gele band en de rij tekst erin | oneindige band naar rechts (`marquee.js`, CONFIG `speed`) |
| `data-footer` / `data-parallax-footer` | footer (overflow hidden) en de inhoud | inhoud loopt trager binnen, omgekeerd van de header |
| `data-logo3d-footer` | plek in de footer | menu gaat weg, logo vliegt uit het menu hierheen (`logo3d.js`, `footerAt`) |
| `data-status-dot` | het open-for-work vakje (header en footer) | draait een kwartslag en zendt een zachte rimpel uit (CSS-variabelen in `champie.css`) |
| `data-clock="enschede"` | tekst met de tijd | live klok "Enschede 18:00:00" (`clock.js`), ook in de footer |
| `data-date="enschede"` | tekst met de datum | live datum "Monday, Oct 19" (`clock.js`) |
| `data-nav-dark` | balk met `data-nav-link`s op zwart | hover wordt geel vak, tekst rolt naar zwart |
| `data-project-page="naam"` | wrapper om een hele projectpagina | modal over de wazige homepage: vak blijft staan, inhoud scrollt erin. Overgang: vel komt smal op en wordt breed, `h1` schuift uit een masker, beelden kantelen plat (`project-page.js`, CONFIG `tilt`/`delay`/`stagger`) |
| `data-project-close` | de Close-link (href `/`) | sluit het vel (ook: Esc, klik op de wazige rand, terug-knop) |
| `data-grow` | beeld in een projectpagina | begint klein (`CONFIG.grow`) en wordt volle maat tijdens scrollen |

De menu-balk (logo-vak + Projects/Services/About/Process) en het 3D-logo zet het script zelf op elke pagina. Links met `#id` of `/#id` scrollen zacht naar die sectie (`smooth-scroll.js`); logo-vak = naar boven. Home: het menu verschijnt als het logo erin vliegt. Projectpagina (geen `data-logo3d`): menu en logo staan er meteen, zonder animatie, boven het vel. Openen geeft `<html>` de class `menu-open`.

## Testen

```
node --test test/math.test.mjs
```

## Bestanden

```
test/math.test.mjs        tests voor lib/math.js
src/
  main.js                 startpunt, zet de modules aan
  champie.css             stijlen voor alles hieronder
  lib/core.js             één animatie-loop en de muisstatus
  lib/math.js             veer, easing en andere rekenhulpjes (getest)
  modules/
    smooth-scroll.js      Lenis
    parallax.js           header-parallax en foto-parallax
    menu.js               menu-balk onderaan
    logo3d.js             3D-logo (Three.js), instellingen bovenin
    project-hover.js      titel-roll en zwevende foto
    eye.js                meekijkend oog in tekst
    nav-hover.js          nav-links: zwart vak + tekst-roll
    marquee.js            oneindige tekstband
    clock.js              live klok Enschede
    project-page.js       projectpagina als vel over de wazige homepage
```
