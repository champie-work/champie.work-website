// 3D-logo (Three.js)
//  [data-logo3d]          het vak in de header waar het grote logo staat (scrolt mee met de header)
//  [data-logo3d-footer]   plek in de footer: daar staat het logo zodra de footer in beeld is
// Het logo wordt geknipt op de header/footer, zodat de zwarte secties eroverheen schuiven.
//
// Gedrag:
//  - In rust draait het hele hoofd rond (voorkant langzaam, achterkant snel); het oog staat stil zoals het logo.
//  - Muis beweegt: hij draait door naar de voorkant, kantelt naar de cursor en het oog kijkt mee.
//  - Scrollen: het logo blijft in de header (beweegt mee met de header-parallax).
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import { SVGLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/SVGLoader.js/+esm';
import { onFrame, pointer, reduceMotion, viewW, viewH } from '../lib/core.js';
import { TAU, clamp, lerp, follow, spring, nextFront } from '../lib/math.js';
import { parallaxState } from './parallax.js';

/* ===== INSTELLINGEN ===== */
const C = {
  bodyColor:   '#0D0D0D', // kleur van het logo (Figma v2)
  eyeColor:    '#FFFFFF', // oogwit
  edgeColor:   '#E0DED9', // lichte randlijnen bij kantelen
  edgeOpacity: 0.65,      // sterkte randlijnen (0 = uit)
  depth:       60,        // dikte van het logo (logo is 390 breed)
  maxTilt:     0.5,       // max kanteling in radialen
  tiltEase:    0.08,      // vloeiendheid kantelen (lager = trager)
  eyeSpeed:    8,         // veersnelheid van het schuivende oog
  pupilSpeed:  16,        // veersnelheid pupil (sneller dan het oog: hij kijkt eerst)
  pupilRange:  22,        // uitslag pupil binnen het oog
  saccade:     10,        // kleine pupilsprongetjes als de muis stilstaat of het hoofd draait (0 = uit)
  spin:        true,      // in rust draait het hoofd rond
  spinSlow:    0.5,       // draaisnelheid als het oog naar je kijkt (rad/s)
  spinFast:    8,         // draaisnelheid achterlangs (rad/s)
  spinDelay:   2.5,       // seconden muis-stilstand voordat het draaien weer begint
  spinHome:    7,         // hoe snel hij bij muisbeweging doordraait naar de voorkant
  logoHeight:  1,         // logohoogte t.o.v. het header-vak ([data-logo3d] = precies het logo in Figma)
  logoCenterY: 0.5,       // verticale positie in het header-vak (0 = boven, 1 = onder)
  footerSize:  1,         // logohoogte t.o.v. de footer-plek
};
/* ======================== */

// Logo-vormen (in een vak van 390 x 386)
const W = 389.65, H = 385.73, EYE_TOP = 176.57;
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 386">' +
  // [0] hoofd
  '<path d="M389.65 194.82V325.86C389.65 330.79 386.97 335.32 382.65 337.69C349.41 355.87 283.07 385.73 194.83 385.73C106.59 385.73 40.25 355.87 7 337.69C2.68 335.32 0 330.79 0 325.86V194.82C0 188.67 0.29 182.58 0.85 176.57C10.05 77.53 93.38 0 194.83 0C248.63 0 297.33 21.81 332.59 57.06C367.85 92.31 389.65 141.02 389.65 194.82Z"/>' +
  // [1] oogwit (amandel, nulpunt linksboven)
  '<path d="M196.52 0L59.72 0L0 0C4.73 28.45 23.31 53.15 45.98 70.27C109.66 118.24 212.1 118.11 275.49 69.74C297.96 52.51 315.98 28.37 320.81 0L196.52 0Z"/>' +
  // [2] pupil (nulpunt linksboven)
  '<path d="M132.67 17.74C132.67 54.56 102.97 84.42 66.33 84.42C29.69 84.42 0 54.56 0 17.74C0 11.59 0.83 5.64 2.39 0L130.27 0C131.82 5.64 132.67 11.58 132.67 17.74Z"/>' +
  '</svg>';
// Oog-standen (x van de amandel op het hoofd) en pupil-standen (x binnen de amandel)
const EYE = { left: -32, center: 34.18, right: 125.02 };    // links = exact het logo
const PUP = { rest: 72.7, center: 94.44, min: 50, max: 130 }; // binnen deze grenzen raakt de pupil nooit de rand

export function initLogo3d({ anchor }) {
  // --- Canvas over het hele scherm ---
  const holder = document.createElement('div');
  holder.className = 'champie-3d';
  document.body.appendChild(holder); // in body, anders kan het niet boven het projectvel
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
  holder.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 100000);
  const VIEW = 1000; // zichtbare hoogte in wereld-eenheden
  const camDist = VIEW / 2 / Math.tan(THREE.MathUtils.degToRad(15));
  camera.position.set(0, 0, camDist);
  camera.near = camDist / 20; camera.far = camDist * 20;

  const data = new SVGLoader().parse(SVG);
  const shapesOf = (i) => SVGLoader.createShapes(data.paths[i]);

  const logo = new THREE.Group();
  const inner = new THREE.Group();
  inner.scale.set(1, -1, 1);
  inner.position.set(-W / 2, H / 2, 0);
  logo.add(inner);
  scene.add(logo);

  // offset bepaalt welke laag "wint" waar vlakken samenvallen (lager = voorrang)
  const mat = (c, offset = 1) => new THREE.MeshBasicMaterial({
    color: new THREE.Color(c), side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: offset, polygonOffsetUnits: offset,
  });
  // Masker: de voorkant van het hoofd schrijft in de stencil; oog en pupil tekenen alleen daarbinnen
  const insideFace = { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc,
    stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp };

  // Hoofd: massief blok
  const bodyGeo = new THREE.ExtrudeGeometry(shapesOf(0), { depth: C.depth, bevelEnabled: false, curveSegments: 48 });
  bodyGeo.translate(0, 0, -C.depth);
  const body = new THREE.Mesh(bodyGeo, mat(C.bodyColor, 1));
  body.renderOrder = 0; inner.add(body);

  // Voorkant = het venster waarbinnen het oog schuift
  const faceMat = Object.assign(mat(C.bodyColor, 0),
    { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
  const face = new THREE.Mesh(new THREE.ShapeGeometry(shapesOf(0), 48), faceMat);
  face.renderOrder = 1; inner.add(face);

  // Oog = amandel + pupil
  const eye = new THREE.Group();
  eye.position.y = EYE_TOP;
  inner.add(eye);
  const white = new THREE.Mesh(new THREE.ShapeGeometry(shapesOf(1), 48), Object.assign(mat(C.eyeColor, -1), insideFace));
  white.position.z = 0.3; white.renderOrder = 2; eye.add(white);
  const pupil = new THREE.Mesh(new THREE.ShapeGeometry(shapesOf(2), 48), Object.assign(mat(C.bodyColor, -2), insideFace));
  pupil.position.z = 0.6; pupil.renderOrder = 3; eye.add(pupil);

  // Lichte randlijnen langs de buitenomtrek
  const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(C.edgeColor), transparent: true, opacity: 0 });
  inner.add(new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo, 25), edgeMat));

  function resize() {
    renderer.setSize(viewW(), viewH(), false);
    camera.aspect = viewW() / viewH();
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();
  renderer.setScissorTest(true);
  const hero = anchor ? anchor.closest('[data-hero]') || anchor : null;

  // --- Status ---
  const spinSpeed = (a) => C.spinSlow + (C.spinFast - C.spinSlow) * Math.pow((1 - Math.cos(a)) / 2, 2);
  const spinS = { x: 0, v: 0 };          // draaihoek (0 = voorkant)
  const eyeS = { x: EYE.left, v: 0 };    // stand van het oog op het gezicht
  const pupS = { x: PUP.rest, v: 0 };    // pupil binnen het oog
  let spinRamp = 0, wasSpinning = false, homeTarget = 0;
  let saccade = 0, nextSaccade = 1.5;
  let rx = 0, ry = 0;
  // Footer-plek die nu telt: in het projectvel als dat open is, anders die op de pagina zelf (niet de wazige home erachter)
  const footerSpot = () => {
    const open = document.documentElement.classList.contains('project-open');
    for (const el of document.querySelectorAll('[data-logo3d-footer]'))
      if (!el.closest('.cpp_home') && !!el.closest('.cpp') === open) return el;
    return null;
  };

  onFrame((now, dt) => {
    const vw = viewW(), vh = viewH();
    if (renderer.domElement.width !== Math.floor(vw * renderer.getPixelRatio())) resize();

    // Waar staat het logo: in de footer zodra die in beeld is, anders in de header
    const open = document.documentElement.classList.contains('project-open');
    const spot = footerSpot();
    const fr = spot && spot.getBoundingClientRect();
    let box = null, clip = null;
    if (fr && fr.top < vh && fr.bottom > 0) {
      box = { cx: fr.left + fr.width / 2, cy: fr.top + fr.height / 2, h: fr.height * C.footerSize };
      clip = (spot.closest('[data-footer]') || spot).getBoundingClientRect();
    } else if (anchor && !open) {
      const a = anchor.getBoundingClientRect();
      clip = hero.getBoundingClientRect();
      if (clip.bottom > 0) box = { cx: a.left + a.width / 2, cy: a.top + a.height * C.logoCenterY + parallaxState.heroShift, h: a.height * C.logoHeight };
    }
    if (!box) { renderer.setScissor(0, 0, vw, vh); renderer.clear(); return; }
    const top = Math.max(0, clip.top), bottom = Math.min(vh, clip.bottom);
    renderer.setScissor(0, 0, vw, vh); renderer.clear(); // vorige frame wissen
    renderer.setScissor(0, vh - bottom, vw, Math.max(0, bottom - top));
    const h = box.h, cx = box.cx, cy = box.cy;
    logo.scale.setScalar((h * VIEW / vh) / H);
    camera.setViewOffset(vw, vh, -(cx - vw / 2), -(cy - vh / 2), vw, vh);

    // Kantelen naar de cursor
    const tx = pointer.active ? clamp((pointer.x - cx) / (vw / 2)) : 0;
    const ty = pointer.active ? clamp((pointer.y - cy) / (vh / 2)) : 0;
    const k = follow(C.tiltEase, dt);
    ry += (tx * C.maxTilt - ry) * k;
    rx += (ty * C.maxTilt - rx) * k;

    // Draaien in rust; bij muisbeweging versneld door naar de voorkant
    const stillFor = now - pointer.lastMove;
    const spinning = !reduceMotion && C.spin && (!pointer.active || stillFor > C.spinDelay * 1000);
    if (spinning && !wasSpinning) spinRamp = 0;
    if (!spinning && wasSpinning) homeTarget = nextFront(spinS.x);
    wasSpinning = spinning;
    if (spinning) {
      spinRamp = Math.min(1, spinRamp + dt / 1.2);
      spinS.v = spinSpeed(spinS.x % TAU) * spinRamp;
      spinS.x += spinS.v * dt;
    } else if (!reduceMotion) {
      spring(spinS, homeTarget, C.spinHome, dt);
    }
    if (spinS.x > TAU * 1000) { spinS.x -= TAU * 1000; homeTarget -= TAU * 1000; }
    const front = (1 + Math.cos(spinS.x)) / 2; // 1 = oog naar je toe
    logo.rotation.set(rx * front, spinS.x + ry, 0);

    // Oog: schuift over het gezicht als de muis beweegt; tijdens draaien de logo-stand
    const tracking = pointer.active && !spinning;
    const eyeTarget = !tracking ? EYE.left : tx < 0 ? lerp(EYE.center, EYE.left, -tx) : lerp(EYE.center, EYE.right, tx);
    const idle = stillFor > 1200 || !tracking; // muis stil of hoofd draait: pupil kijkt zelf rond
    nextSaccade -= dt;
    if (nextSaccade <= 0) {
      saccade = idle && !reduceMotion ? (Math.random() * 2 - 1) * C.saccade : 0;
      nextSaccade = 0.9 + Math.random() * 2.2;
    }
    if (!idle) saccade = 0;
    const pupTarget = clamp((!tracking ? PUP.rest : PUP.center + tx * C.pupilRange) + saccade, PUP.min, PUP.max);
    if (reduceMotion) { eyeS.x = eyeTarget; pupS.x = pupTarget; }
    else { spring(eyeS, eyeTarget, C.eyeSpeed, dt); spring(pupS, pupTarget, C.pupilSpeed, dt); }
    eye.position.x = eyeS.x;
    pupil.position.x = clamp(pupS.x, PUP.min, PUP.max);

    edgeMat.opacity = C.edgeOpacity * Math.min(1, Math.max(Math.hypot(rx, ry), Math.abs(Math.sin(spinS.x)), 1 - front) / 0.12);
    renderer.render(scene, camera);
  });
}
