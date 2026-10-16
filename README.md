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
| `data-services` | de rij van het dienstenblok | staat vast in beeld; elke dienst krijgt `CONFIG.step` px scroll (`services.js`) |
| `data-service` | een categorie | krijgt `is-active` als een dienst erin op de leeslijn staat |
| `data-service-mark` | het witte vierkantje in een categorie | rijdt mee met de naam; groeit in bij de actieve categorie |
| `data-service-name` | de naam van een categorie | rijdt mee op de leeslijn binnen de eigen categorie |
| `data-service-item` | één dienst-regel | telt mee voor het nummer |
| `data-service-count` | het nummer rechts | nummer van de actieve dienst, rolt als kilometerteller (`CONFIG.roll`) |
| `data-project-page="naam"` | wrapper om een hele projectpagina | vel schuift over de wazige homepage, met een vaste lijn rechts (`project-page.js`) |
| `data-project-close` | de Close-link (href `/`) | sluit het vel (ook: Esc, klik op de wazige rand, terug-knop) |
| `data-grow` | beeld in een projectpagina | begint klein (`CONFIG.grow`) en wordt volle maat tijdens scrollen |

De menu-balk en het 3D-logo zet het script zelf op elke pagina. Het menu staat altijd in beeld, boven het projectvel; op een pagina zonder `data-logo3d` zit het logo meteen in het menu-vak. Openen geeft `<html>` de class `menu-open`.

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
    services.js           dienstenblok: sticky, vierkantje, teller
    project-page.js       projectpagina als vel over de wazige homepage
```
