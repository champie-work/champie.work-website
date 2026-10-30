# champie.work-website

> **Astro-site** (branches `main` + `astro`): de site zelf als Astro-project. Hosting: Cloudflare Workers `champie-work-website` (build `npm run build`, deploy `npx wrangler deploy`, config `wrangler.jsonc`), test-URL https://champie-work-website.falling-band-3cb9.workers.dev. Push naar `main` = live.
> - Pagina's: `src/pages/` (home = `index.astro`, projecten = `src/pages/project/<naam>.astro`; nieuw project = bestand kopiëren).
> - Gedeeld: `src/layouts/Base.astro` (head + scripts), `src/components/Footer.astro`, stijlen `src/styles/site.css`.
> - De animatie-scripts staan ongewijzigd in `public/champie/` (was `src/`), beelden in `public/img/` (was `assets/`).
> - Alles hieronder over Webflow/jsDelivr is de oude Webflow-site: die laadt vast commit `dc2f09e` (paden `src/...`). Niet meer aanpassen.

Code for the animations and interaction on champie.work. The site itself is built in Webflow (site id `6ad1083b76cf28f6ee90f556`, home page `6ad1083d76cf28f6ee90f577`).

## How it is wired
- Webflow loads this repo through jsDelivr from ONE HtmlEmbed on the home page (element `e4633729-f861-9fdc-d75a-6a408d3b3b1a`, class `hero_logo3d`, also the `[data-logo3d]` anchor).
- The embed pins an exact commit: `https://cdn.jsdelivr.net/gh/champie-work/champie.work-website@<commit>/src/main.js` (+ `src/champie.css`).
- Webflow free plan: no site-wide custom code, so the loader lives in an embed.

## Making a change
1. Edit the module in `src/`. No build step, plain ES modules. Three.js and Lenis come from jsDelivr `+esm` URLs.
2. Commit and push to `main`.
3. Warm up jsDelivr first: fetch `src/main.js` and `src/champie.css` at the new commit and check both return 200 (a brand-new commit can fail on first load).
4. Run `node --test test/math.test.mjs` and `node --check` on changed modules.
5. Update the commit hash in the Webflow embed (data_element_settings_tool, key `code`) and publish (max once per minute).
6. After publishing, open the live site and check the browser console for errors.
7. Roll back = put the previous commit hash back in the embed.

## Conventions
- Elements are found by `data-*` attributes, never by Webflow class names (see README).
- All animation runs through `onFrame` in `src/lib/core.js`; mouse state comes from `pointer`. Pure math lives in `src/lib/math.js` and has tests (`node --test test/math.test.mjs`).
- Follow the Ponytail rules: smallest complete change, no options nobody asked for.
- Respect `reduceMotion`.
- Settings that the owner may want to tweak live in a CONFIG object at the top of a module.
- The owner writes in Dutch; code comments are in Dutch.

## Agents
Pick the cheapest agent that fits (`.claude/agents/`): `zoeker` (haiku, low) for lookups, `bouwer` (sonnet, medium) for small changes and publishing, `denker` (opus, high) for 3D logo, scroll, parallax, new animations and hard bugs. If Opus is not available on the plan, set `denker` to `model: sonnet`.

Mijn vaste wens: kies bij elke taak zelf de goedkoopste agent die past, zonder dat ik het vraag. Korte vragen beantwoord je zelf.

## New project page (recipe — keep it cheap)
Project pages are real Webflow pages in the page folder `project` (folder id `6ad27c85a75671894bdfcbb5`), URL `/project/<name>`. `src/modules/project-page.js` does all the motion; a new project needs NO new code.
1. Duplicate the Ralph Lauren page (`data_pages_tool > create_page` with `duplicateOf: 6ad27b24fcab3c6bafe951e3`, `parentFolderId` = the folder above, new title + slug).
2. Change texts and images on the copy. Layout may differ; only keep the attributes:
   - wrapper `data-project-page="<name>"` directly in body (Ralph Lauren: `805bc9a9-cecc-2b3b-cd2e-b483782c6fa9`)
   - Close link `data-project-close`, href `/`
   - photo frame (overflow hidden) with img `data-parallax-img`; grow image wrapper `data-grow`
   - the loader embed stays the last element in body (Ralph Lauren: `ad1090c7-2678-32d0-4fea-9c11b13bdffe`)
3. Images: render the Figma node with `get_screenshot`, save the file to `assets/` in this repo, push, then `asset_tool > upload_image_by_url` with the jsDelivr URL of that commit (the proxy blocks direct uploads; asset_tool needs the Webflow Designer tab open — ask the owner). Set the img with key `assetId`.
4. Home: the project card needs a link to the page (`link` setting, mode `page`, to = page id). Ralph Lauren card link: `60961c34-91ab-30f9-6881-4280739450d5`. Add `data-hover-title` on its `[data-project-title]`.
5. Both embeds (home + every project page) must carry the same commit hash. Publish, then click the card on the test URL and check console.
- Never give a Webflow class the names `cpp`, `cpp_box`, `cpp_home` (used by the script).
- Figma: never call get_metadata on page `0:1` (1.3M chars). Project frames: `374:2094` PROJECTS 1, `381:2261` PROJECTS 2.
