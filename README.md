# champie.work (Astro)

Site [champie.work](https://champie.work), gebouwd met [Astro](https://astro.build). Hosting op Cloudflare Pages.

## Lokaal draaien
```
npm install
npm run dev      # http://localhost:4321
```

## Waar staat wat
```
src/pages/index.astro              homepage
src/pages/project/ralph-lauren.astro  projectpagina (kopiëren = nieuw project)
src/layouts/Base.astro             head, fonts, scripts
src/components/Footer.astro        footer
src/styles/site.css                opmaak
public/champie/                    animaties (3D-logo, parallax, menu, ...), zie data-attributen hieronder
public/img/                        beelden
```

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

