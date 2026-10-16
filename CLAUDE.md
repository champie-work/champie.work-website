# champie.work-website

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
