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
| `data-parallax-hero` | lagen in de header (woordmerk, nav-rij, onderste rij) | bewegen trager mee; `data-parallax-speed="0.3"` op de eerste laag |
| `data-parallax-img` | foto in een kader met `overflow: hidden` | schuift binnen het kader; `data-parallax-range="10"` |
| `data-logo3d` | het vak waar het grote 3D-logo staat | 3D-logo (draait in rust, volgt de muis, vliegt naar het menu) |
| `data-logo3d-trigger` | het woordmerk | half uit beeld = logo vliegt naar het menu |
| `data-project` | projectkaart | hover-effecten |
| `data-project-title` | titel in de kaart | rolt bij hover naar `data-hover-title="..."` |
| `data-project-arrow` | de ↳-pijl | pijl in de hovertitel |
| `data-project-media` | fotokader van de kaart | kleine zwevende kopie van de foto volgt de cursor |
| `data-eye` | een oog-SVG in tekst | pupil kijkt horizontaal mee binnen het wit |

De menu-balk zet het script zelf op de pagina. Openen geeft `<html>` de class `menu-open`.

## Bestanden

```
src/
  main.js                 startpunt, zet de modules aan
  champie.css             stijlen voor alles hieronder
  lib/core.js             één animatie-loop, muisstatus, veer en kleine helpers
  modules/
    smooth-scroll.js      Lenis
    parallax.js           header-parallax en foto-parallax
    menu.js               menu-balk onderaan
    logo3d.js             3D-logo (Three.js), instellingen bovenin
    project-hover.js      titel-roll en zwevende foto
    eye.js                meekijkend oog in tekst
```
