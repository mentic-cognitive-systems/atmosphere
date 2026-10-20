/* SPDX-License-Identifier: AGPL-3.0-or-later */
/*
 * atmosphere.js - composition controller
 *
 * The page coordinates six concerns, each exposed as a plain data-attribute:
 *   data-layout   which frames exist, and where (at.layout.css)
 *   data-lattice  the path through a frame       (at.lattice.css)
 *   data-layer    is a frame present, and at level in the view stack (at.layer.css)
 *   data-look     colour, typography, texture   (at.look.css)
 *   data-life     motion and interaction score  (at.life.css)
 *   data-lens     an experience chord across them (at.lens.css)
 *   data-scroll-flow remains Life's scroll-linked motion sub-axis, and
 *   data-inout-flow is its crossing sub-axis: how a projected region arrives
 *   and leaves.
 *
 * Controller responsibilities:
 *   1. swaps those attributes
 *   2. mirrors them into the URL, so every composition is addressable
 *   3. hands the swap to a view transition, so life can score the crossing
 *   4. makes the Lattice modes operable from the keyboard
 *   5. publishes measurements CSS cannot discover for itself -- where the
 *      pointer is inside a scene, where a variable-height card can pin, and
 *      how tall a look and a density just made the masthead
 *   6. progressively promotes authored inline frames to native popovers
 *   7. mints one anchor name per trigger/panel pair, so anchoring is not a
 *      hand-maintained list of element ids
 *
 * Those three spatial axes all ask their question about a FRAME -- see the
 * frame contract at the top of at.lattice.css. Anything below that looks for
 * the page's own frame asks for [data-frame="root"] rather than for .Main,
 * because which element that is, is markup's business and not this file's.
 *
 * Every visual consequence is still pure CSS. (5) is measurement, not styling:
 * it publishes physical facts and stops. Lattice and Life decide how those
 * measurements affect the scene and the card stack.
 */

const LEGACY_LATTICE_VALUES = Object.freeze({
  poster: 'continuous',
  book: 'pages',
  slides: 'slides',
  scroll: 'ribbon',
  layers: 'card-stack',
  dashboard: 'control'
});

/* The viewport-bottom sheet became a viewport-top menu. A projection value
   names where the panel goes, so the old name had to go with it -- but links
   made under it stay valid and canonicalize on the way in. */
const LEGACY_LAYER_VALUES = Object.freeze({
  'bottom-sheet': 'top-menu'
});

(function () {
  /* Lattice and Layer are named hash fields so links made before these axes
     existed keep their positional meaning. */
  const AXES = ['look', 'layout', 'life', 'density', 'size', 'tabs'];

  const scriptUrl = document.currentScript && document.currentScript.src;
  const drawerComponentUrl = new URL('../webcomp/atheme-drawer.js', scriptUrl || document.baseURI).href;

  if (!customElements.get('atheme-drawer')) {
    const script = document.createElement('script');
    script.src = drawerComponentUrl;
    document.head.appendChild(script);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupThemeDrawer();
    setupSelectableChips();
    setupComposePresets();
    setupTabSets();
    setupLatticeKeys();
    setupCardStack();
    setupLayerProjection();
    setupPointerCamera();
    publishFrameCounts();
    loadLensModel();
    document.addEventListener('themechange', onCompositionChange);
    window.addEventListener('hashchange', applyCompositionFromUrl);
    applyCompositionFromUrl({ initial: true });
    syncThemeControls();
    window.addEventListener('resize', () => syncStructureFeedback(readComposition()), { passive: true });

    /* Last, so its first synchronous reading is of the composition the URL
       actually asked for and of controls the projection has already
       un-hidden -- not of the markup's defaults. */
    setupFurnitureMeasure();
    setupBrandLayer();

    // The drawer restores from localStorage when it upgrades, which can land
    // after this. A link the visitor actually followed outranks whatever they
    // were looking at last time, so re-assert it once the drawer exists.
    if (window.customElements) {
      customElements.whenDefined('atheme-drawer').then(() => {
        if (compositionFromHash()) {
          applyCompositionFromUrl({ initial: true });
        }
        syncThemeControls();
      });
    }
  });

  window.THEME_AXES = AXES;
})();

function getThemeDrawer() {
  return document.querySelector('atheme-drawer, atheme-tray');
}

function setupThemeDrawer() {
  let drawer = getThemeDrawer();
  if (!drawer) {
    drawer = document.createElement('atheme-drawer');
    drawer.setAttribute('position', 'top-right');
    drawer.setAttribute('label', 'Theme');
    drawer.setAttribute('icon', '🖼️');
    // A page opts into the one-time "what is this tab" callout from its body.
    const intro = document.body.getAttribute('data-drawer-intro');
    if (intro && intro !== 'false') drawer.setAttribute('intro', intro);
    document.body.appendChild(drawer);
  }
}

/* --- COMPOSITION STATE ------------------------------------------------ */

function readComposition() {
  const body = document.body;
  return {
    look: body.getAttribute('data-look') || body.getAttribute('data-theme') || 'cyberpunk',
    layout: body.getAttribute('data-layout') || 'default',
    lattice: body.getAttribute('data-lattice') || 'continuous',
    layer: body.getAttribute('data-layer') || 'inline',
    life: body.getAttribute('data-life') || 'pulse',
    lens: body.getAttribute('data-lens') || 'none',
    scrollFlow: body.getAttribute('data-scroll-flow') || 'still',
    inoutFlow: body.getAttribute('data-inout-flow') || 'slide',
    headerFold: body.getAttribute('data-header-fold') === 'true',
    heartbeat: body.getAttribute('data-heartbeat') === 'true',
    flap: body.getAttribute('data-flap') === 'true',
    density: body.getAttribute('data-density') || 'cozy',
    size: body.getAttribute('data-size') || 'm',
    tabs: body.getAttribute('data-tabs') || 'classic'
  };
}

/* Compact deep links. Every option menu is an ordered list, so an option IS
   its index: one integer per axis, dot-separated, axis groups split by '/':
     #at=look.layout.life.density.size.tabs/lattice.layer.scroll.inout.lens/f.h.p
   The trailing segment holds the on/off scores (f = header fold, h =
   heartbeat, p = flap) and is dropped when all three are off.
   These lists are APPEND-ONLY and must stay in the same order as the
   corresponding menus in webcomp/atheme-drawer.js -- inserting or reordering
   an entry renumbers every link made before it. */
const AT_CODEBOOK = Object.freeze({
  look: ['apple', 'android', 'microsoft', 'temple', 'citadel', 'tux', 'luxury', 'parchment', 'typewritter',
         'newspaper', 'origami', 'comic', 'school', 'lab', 'blueprint',
         'museum', 'western', 'nightclub', 'urban', 'crt', 'cyberpunk',
         'hologram', 'arcade', 'starfield', 'deepsea', 'storm', 'vaporwave',
         'thermal', 'fortress', 'vault', 'midcentury'],
  layout: ['default', '3col', 'sidebar-right', 'stacked', 'hero'],
  life: ['still', 'pulse', 'wiggle', '3d', 'glitch', 'crazy'],
  density: ['compact', 'cozy', 'roomy'],
  size: ['xs', 's', 'm', 'l', 'xl'],
  tabs: ['classic', 'column'],
  lattice: ['continuous', 'pages', 'slides', 'ribbon', 'card-stack', 'spotlight', 'control', 'app'],
  layer: ['inline', 'top-left-edge-drawer', 'top-menu', 'pop-over'],
  scrollFlow: ['still', 'reveal', 'parallax'],
  inoutFlow: ['show', 'slide', 'slam', 'flip', 'materialize', 'focus'],
  lens: ['none', 'productive-data-dense', 'expressive-gamified', 'cinematic-luxury',
         'stealth-terminal', 'institutional-reassuring']
});
const AT_SEG1 = ['look', 'layout', 'life', 'density', 'size', 'tabs'];
const AT_SEG2 = ['lattice', 'layer', 'scrollFlow', 'inoutFlow', 'lens'];
const AT_FLAGS = [['f', 'headerFold'], ['h', 'heartbeat'], ['p', 'flap']];

/* A positional value counts only if the axis in that position actually offers
   it. Without this any page that runs its own hash router -- the wiki's
   #view/area/item -- reads as a named theme link, so every route change
   reapplies a junk composition and looks like the theme resetting itself.
   Legacy layout names stay acceptable; finalizeComposition migrates them. */
function isAxisValue(axis, value) {
  const list = AT_CODEBOOK[axis];
  if (!list) return false;
  if (list.indexOf(value) !== -1) return true;
  return axis === 'layout' && Object.prototype.hasOwnProperty.call(LEGACY_LATTICE_VALUES, value);
}

function compositionToHash(composition) {
  const indexOf = (axis, value) => {
    const list = AT_CODEBOOK[axis];
    const found = list.indexOf(value);
    return found >= 0 ? found : 0;
  };
  const lens = composition.lens || document.body.getAttribute('data-lens') || 'none';
  const seg1 = AT_SEG1.map(axis => indexOf(axis, composition[axis])).join('.');
  const seg2 = AT_SEG2.map(axis => indexOf(axis, axis === 'lens' ? lens : composition[axis])).join('.');
  const flags = AT_FLAGS.filter(pair => composition[pair[1]]).map(pair => pair[0]).join('.');
  return '#at=' + seg1 + '/' + seg2 + (flags ? '/' + flags : '');
}

/* The long named form (#tux/hero/glitch/.../lattice=spotlight/fold=1) stays
   readable forever: compositionFromHash only takes the compact branch when
   the hash starts with "at=", and falls through to it otherwise. */
function compositionFromCompactHash(raw) {
  const segments = raw.slice(3).split('/');
  const composition = {};
  const decodeSegment = (segment, axes) => {
    String(segment || '').split('.').forEach((token, position) => {
      const axis = axes[position];
      if (!axis || !/^\d+$/.test(token)) return;
      const list = AT_CODEBOOK[axis];
      const idx = parseInt(token, 10);
      if (idx < list.length) composition[axis] = list[idx];
    });
  };
  decodeSegment(segments[0], AT_SEG1);
  decodeSegment(segments[1], AT_SEG2);
  const flags = String(segments[2] || '').split('.');
  AT_FLAGS.forEach((pair) => { composition[pair[1]] = flags.indexOf(pair[0]) !== -1; });
  if (composition.lens === 'none') delete composition.lens;
  return composition;
}

function compositionFromHash() {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, '')).trim();
  if (!raw) return null;

  // Support compact code in standalone #at=... or composite #route?at=... / #route&at=...
  let atPart = null;
  if (raw.indexOf('at=') === 0) {
    atPart = raw;
  } else if (raw.indexOf('?at=') !== -1) {
    atPart = raw.slice(raw.indexOf('?at=') + 1);
  } else if (raw.indexOf('&at=') !== -1) {
    atPart = raw.slice(raw.indexOf('&at=') + 1);
  }

  if (atPart) {
    // If there are further query params after at=, take only the at segment
    const cleanAt = atPart.split('&')[0];
    const comp = compositionFromCompactHash(cleanAt);
    return finalizeComposition(comp);
  }

  // Named segment fallback (only if not an app route with query)
  const routePart = raw.split('?')[0];
  const parts = routePart.split('/').map(part => part.trim()).filter(Boolean);
  if (!parts.length) return null;
  const named = {};
  let axisIndex = 0;
  parts.forEach((value) => {
    if (value.indexOf('lens=') === 0) {
      named.lens = value.slice(5);
      return;
    }
    if (value.indexOf('lattice=') === 0) {
      named.lattice = value.slice(8);
      return;
    }
    if (value.indexOf('layer=') === 0) {
      const layer = value.slice(6);
      named.layer = LEGACY_LAYER_VALUES[layer] || layer;
      return;
    }
    if (value.indexOf('scroll=') === 0) {
      named.scrollFlow = value.slice(7);
      return;
    }
    if (value.indexOf('inout=') === 0) {
      named.inoutFlow = value.slice(6);
      return;
    }
    if (value === 'fold=1') {
      named.headerFold = true;
      return;
    }
    if (value === 'heartbeat=1') {
      named.heartbeat = true;
      return;
    }
    if (value === 'flap=1') {
      named.flap = true;
      return;
    }
    const axis = window.THEME_AXES[axisIndex++];
    if (axis && isAxisValue(axis, value)) named[axis] = value;
  });
  if (!Object.keys(named).length) return null;
  return finalizeComposition(named);
}

function finalizeComposition(composition) {
  if (!Object.keys(composition).length) return null;
  if (LEGACY_LATTICE_VALUES[composition.layout]) {
    if (composition.lattice === undefined) composition.lattice = LEGACY_LATTICE_VALUES[composition.layout];
    composition.layout = 'default';
  }
  if (composition.lattice === undefined) composition.lattice = 'continuous';
  if (composition.layer === undefined) composition.layer = 'inline';
  if (composition.scrollFlow === undefined) composition.scrollFlow = 'still';
  if (composition.inoutFlow === undefined) composition.inoutFlow = 'slide';
  if (composition.headerFold === undefined) composition.headerFold = false;
  if (composition.heartbeat === undefined) composition.heartbeat = false;
  if (composition.flap === undefined) composition.flap = false;
  return composition;
}

function writeUrl(composition) {
  const atHash = compositionToHash(composition);
  const atCode = atHash.replace(/^#/, '');
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, '')).trim();

  let targetHash = atHash;
  if (raw) {
    const qIndex = raw.indexOf('?');
    const route = qIndex !== -1 ? raw.slice(0, qIndex) : (raw.startsWith('at=') ? '' : raw);
    if (route) {
      targetHash = '#' + route + '?' + atCode;
    }
  }

  if (window.AtmosphereContract) targetHash = window.AtmosphereContract.decorateHash(targetHash);
  if (window.location.hash === targetHash) return;
  history.replaceState(null, '', window.location.pathname + window.location.search + targetHash);
}

function applyCompositionFromUrl(options) {
  const settings = Object.assign({ initial: false }, options);
  const fromHash = compositionFromHash();
  const drawer = getThemeDrawer();

  if (fromHash) {
    applyComposition(fromHash, { playAudio: false, transition: !settings.initial, source: 'url' });
  } else if (settings.initial && drawer) {
    // No link to honour: fall back to the drawer's own restore, then publish it.
    writeUrl(readComposition());
  }
}

/* Setting an attribute is the whole state change; the view transition just
   gives life something to score the crossing with. */
function applyComposition(next, options) {
  const settings = Object.assign({ playAudio: false, transition: true }, options);
  const drawer = getThemeDrawer();
  const before = readComposition();

  const commit = () => {
    /* A Lens seeds first; explicit fields in a shared URL are drift from that
       seed and therefore win afterward. This makes Lens compositions truly
       round-trip instead of collapsing back to the pristine preset. */
    if (next.lens !== undefined) {
      if (drawer && typeof drawer.applyLens === 'function') {
        drawer.applyLens(next.lens, { transition: false, emit: false, playAudio: false });
      } else {
        setAxisAttribute('lens', next.lens);
      }
    }
    if (next.look !== undefined) {
      if (drawer && typeof drawer.setLook === 'function') {
        drawer.setLook(next.look, { playAudio: settings.playAudio, emit: false });
      } else {
        setAxisAttribute('look', next.look);
        setAxisAttribute('theme', next.look);
      }
    }
    if (next.layout !== undefined) setAxisAttribute('layout', next.layout, drawer, 'setLayout', settings);
    if (next.lattice !== undefined) setAxisAttribute('lattice', next.lattice, drawer, 'setLattice', settings);
    if (next.layer !== undefined) setAxisAttribute('layer', next.layer, drawer, 'setLayer', settings);
    if (next.life !== undefined) setAxisAttribute('life', next.life, drawer, 'setLife');
    if (next.scrollFlow !== undefined) setAxisAttribute('scroll-flow', next.scrollFlow, drawer, 'setScrollFlow');
    if (next.inoutFlow !== undefined) setAxisAttribute('inout-flow', next.inoutFlow, drawer, 'setInoutFlow');
    if (drawer && typeof drawer.setLifeToggle === 'function') {
      if (next.headerFold !== undefined) drawer.setLifeToggle('header-fold', next.headerFold, { emit: false });
      if (next.heartbeat !== undefined) drawer.setLifeToggle('heartbeat', next.heartbeat, { emit: false });
      if (next.flap !== undefined) drawer.setLifeToggle('flap', next.flap, { emit: false });
    }
    if (next.density !== undefined) setAxisAttribute('density', next.density, drawer, 'setDensity', settings);
    if (next.size !== undefined) setAxisAttribute('size', next.size);
    if (next.tabs !== undefined) setAxisAttribute('tabs', next.tabs);
    document.dispatchEvent(new CustomEvent('atmosphere:compositionrequest', {
      detail: { coordinate: next, source: settings.source || 'controls' }
    }));
    syncThemeControls();
  };

  // A Look or whole-Lens change plays the Look crossing; a single structural
  // or behavioral axis plays the current Life score's crossing.
  const crossing = (next.lens !== undefined ||
    (next.look !== undefined && next.look !== before.look)) ? 'look' : 'axis';
  applyWithCrossing(commit, crossing, settings.transition);
}

/* Stamps data-crossing for the duration of the transition so at.life.css
   knows which crossing to run, then clears it. Exposed on window because the
   drawer needs the same wrapper for a lens change. */
function applyWithCrossing(commit, crossing, wanted) {
  const root = document.documentElement;
  const body = document.body;
  const stamp = (value) => {
    root.setAttribute('data-crossing', value);
    body.setAttribute('data-crossing', value);
  };
  const clear = () => {
    root.removeAttribute('data-crossing');
    body.removeAttribute('data-crossing');
  };

  stamp(crossing || 'axis');

  if (wanted !== false && shouldAnimateTransition()) {
    const transition = document.startViewTransition(commit);
    /* A view transition exposes three promises and rejects ALL of them when
       it is skipped -- which happens routinely here, because pressing a
       second control before the first crossing has landed is a thing people
       do, and a skipped crossing is the correct outcome when they do it.
       Only `finished` is awaited for anything, so the other two were
       rejections nobody handled: an InvalidStateError in the console every
       time the page did exactly what it was supposed to. */
    transition.ready.catch(() => {});
    transition.updateCallbackDone.catch(() => {});
    transition.finished.then(clear, clear);
  } else {
    commit();
    clear();
  }
}

function setAxisAttribute(axis, value, drawer, method, options) {
  const persist = !options || options.persist !== false;
  if (drawer && method && typeof drawer[method] === 'function') {
    drawer[method](value, { emit: false, persist });
    return;
  }
  document.documentElement.setAttribute('data-' + axis, value);
  document.body.setAttribute('data-' + axis, value);
  if (!persist) return;
  const storageKey = {
    'scroll-flow': 'selectedScrollFlow',
    'inout-flow': 'selectedInoutFlow',
    size: 'selected-size',
    tabs: 'selected-tabs',
    lens: 'selected-lens'
  }[axis] || ('selected' + axis.charAt(0).toUpperCase() + axis.slice(1));
  try {
    localStorage.setItem(storageKey, value);
  } catch (e) {}
}

/* A life score of "still", or a system asking for reduced motion, means the
   crossing should not be animated at all -- so we skip the transition rather
   than run one the CSS will immediately cancel. */
function shouldAnimateTransition() {
  if (!document.startViewTransition) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return document.body.getAttribute('data-life') !== 'still';
}



/* --- RANDOM COMPOSITION ----------------------------------------------- */

function shuffleComposition() {
  const drawer = getThemeDrawer();
  const pools = (drawer && drawer.axisOptions) ? drawer.axisOptions() : null;
  if (!pools) return;
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const next = {
    look: pick(pools.look),
    layout: pick(pools.layout),
    lattice: pick(pools.lattice),
    layer: pick(pools.layer),
    life: pick(pools.life),
    scrollFlow: pick(pools.scrollFlow),
    inoutFlow: pick(pools.inoutFlow),
    density: pick(pools.density)
  };
  applyComposition(next, { playAudio: true });
}

function copyCompositionLink() {
  let hash = compositionToHash(readComposition());
  if (window.AtmosphereContract) hash = window.AtmosphereContract.decorateHash(hash);
  const url = window.location.href.split('#')[0] + hash;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(url).then(() => url);
  }
  return Promise.reject(new Error('clipboard unavailable'));
}

/* --- SELECTABLE CHIPS -------------------------------------------------- */
/* One of the interaction roles at.life.css scores. */
function setupSelectableChips() {
  document.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-role="select"][aria-pressed]');
    if (!chip || chip.closest('atheme-drawer, atheme-tray')) return;
    chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });
}

/* --- LATTICE KEYBOARD TRAVERSAL --------------------------------------- */
/*
 * In the paced Lattices .Main is the local scrollport. It has to be reachable
 * and operable by keyboard, so it becomes focusable and answers paging keys.
 */
const PAGED_LATTICES = ['pages', 'slides', 'ribbon', 'card-stack', 'spotlight', 'app'];

function rootFrame() {
  return document.querySelector('[data-frame="root"]');
}

function currentScrollPort() {
  const lattice = document.body.getAttribute('data-lattice');
  if (PAGED_LATTICES.indexOf(lattice) === -1) return null;
  return {
    element: rootFrame(),
    horizontal: lattice === 'slides' || lattice === 'ribbon'
  };
}

function updateScrollPortAffordance() {
  const main = rootFrame();
  if (!main) return;
  const port = currentScrollPort();
  if (port) {
    main.setAttribute('tabindex', '0');
    const axis = port.horizontal ? 'horizontally' : 'vertically';
    main.setAttribute('aria-label', 'Demo content, scrollable ' + axis + '. Use the arrow keys to move between views.');
  } else {
    main.setAttribute('tabindex', '-1');
    main.setAttribute('aria-label', 'Demo content');
  }
}

/* Views are sections, not viewport-fulls: pages differ in height and
   ribbon panels differ in width, so stepping by clientHeight/Width would
   drift out of alignment after the first unequal one. */
function pages(port) {
  return Array.prototype.slice.call(port.element.querySelectorAll(':scope > [data-track] > [data-view]'));
}

function leadingEdge(rect, horizontal) {
  return horizontal ? rect.left : rect.top;
}

function currentPageIndex(port, list) {
  if (document.body.getAttribute('data-lattice') === 'card-stack') {
    const active = list.findIndex(section => section.hasAttribute('data-lattice-active'));
    if (active !== -1) return active;
  }

  const origin = leadingEdge(port.element.getBoundingClientRect(), port.horizontal);
  let index = 0;
  let best = Infinity;
  list.forEach((section, i) => {
    const distance = Math.abs(leadingEdge(section.getBoundingClientRect(), port.horizontal) - origin);
    if (distance < best) {
      best = distance;
      index = i;
    }
  });
  return index;
}

function nudge(port, direction) {
  const el = port.element;
  const step = (port.horizontal ? el.clientWidth : el.clientHeight) * 0.85;
  el.scrollBy({
    left: port.horizontal ? step * direction : 0,
    top: port.horizontal ? 0 : step * direction,
    behavior: 'smooth'
  });
}

function pageBy(direction) {
  const port = currentScrollPort();
  if (!port || !port.element) return false;

  const list = pages(port);
  if (!list.length) {
    nudge(port, direction);
    return true;
  }

  const index = currentPageIndex(port, list);
  const portRect = port.element.getBoundingClientRect();
  const rect = list[index].getBoundingClientRect();

  // A page taller than the scrollport gets read through before we turn it.
  if (!port.horizontal) {
    const overflowBelow = rect.bottom - portRect.bottom;
    const overflowAbove = portRect.top - rect.top;
    if (direction > 0 && overflowBelow > 8) { nudge(port, 1); return true; }
    if (direction < 0 && overflowAbove > 8) { nudge(port, -1); return true; }
  }

  const next = list[index + direction];
  if (!next) return true;

  next.scrollIntoView({
    behavior: 'smooth',
    block: port.horizontal ? 'nearest' : 'start',
    inline: port.horizontal ? 'start' : 'nearest'
  });
  return true;
}

function pageTo(edge) {
  const port = currentScrollPort();
  if (!port || !port.element) return false;
  const el = port.element;
  const end = edge === 'end';
  el.scrollTo({
    left: port.horizontal ? (end ? el.scrollWidth : 0) : el.scrollLeft,
    top: port.horizontal ? el.scrollTop : (end ? el.scrollHeight : 0),
    behavior: 'smooth'
  });
  return true;
}

function setupLatticeKeys() {
  updateScrollPortAffordance();

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target;
    const interactive = target && target.closest && target.closest(
      'a, button, input, textarea, select, summary, [contenteditable="true"], [role="button"], [role="tab"]'
    );
    if (interactive) return;

    const main = rootFrame();
    const inMain = main && (target === main || main.contains(target) || target === document.body);
    if (!inMain) return;

    let handled = false;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
        handled = pageBy(1);
        break;
      case ' ':
        handled = pageBy(event.shiftKey ? -1 : 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        handled = pageBy(-1);
        break;
      case 'Home':
        handled = pageTo('start');
        break;
      case 'End':
        handled = pageTo('end');
        break;
    }
    if (handled) event.preventDefault();
  });
}

/* --- VARIABLE-HEIGHT CARD-STACK LATTICE ------------------------------- */
/* Sticky can pin a short card at the top by itself, but CSS cannot ask how
 * much taller than its scrollport an arbitrary section became. Publish that
 * one measurement as --lattice-stick-top: a tall section keeps scrolling until
 * its bottom is visible, then pins just as the next z-plane reaches it. */
function setupCardStack() {
  const main = rootFrame();
  const shell = main && main.querySelector(':scope > [data-track]');
  const sections = shell && Array.prototype.slice.call(shell.children)
    .filter(node => node.hasAttribute('data-view'));
  if (!main || !shell || !sections.length) return;

  let measureFrame = 0;
  let activeFrame = 0;
  let activeIndex = -1;
  let inset = 16;

  const clearState = () => {
    if (activeIndex === -1) return;
    activeIndex = -1;
    sections.forEach(section => section.removeAttribute('data-lattice-active'));
  };

  const updateActiveLayer = () => {
    activeFrame = 0;
    if (document.body.getAttribute('data-lattice') !== 'card-stack') {
      clearState();
      return;
    }

    const port = main.getBoundingClientRect();
    let nextActive = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= port.bottom - inset) {
        nextActive = index;
      }
    });

    if (nextActive === activeIndex) return;
    activeIndex = nextActive;
    sections.forEach((section, index) => {
      section.toggleAttribute('data-lattice-active', index === activeIndex);
    });
  };

  const scheduleActiveLayer = () => {
    if (!activeFrame) activeFrame = requestAnimationFrame(updateActiveLayer);
  };

  const measure = () => {
    measureFrame = 0;
    if (document.body.getAttribute('data-lattice') !== 'card-stack') {
      clearState();
      return;
    }
    const viewportHeight = main.clientHeight || window.innerHeight;
    const shellStyle = getComputedStyle(shell);
    const layoutGap = parseFloat(shellStyle.rowGap || shellStyle.gap) || 16;
    inset = Math.max(8, Math.min(24, layoutGap));

    main.style.setProperty('--lattice-viewport', Math.round(viewportHeight) + 'px');
    main.style.setProperty('--lattice-inset', Math.round(inset) + 'px');

    sections.forEach(section => {
      const stickyTop = Math.min(inset, viewportHeight - section.offsetHeight - inset);
      section.style.setProperty('--lattice-stick-top', Math.round(stickyTop) + 'px');
    });
    updateActiveLayer();
  };

  const scheduleMeasure = () => {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  };

  main.addEventListener('scroll', scheduleActiveLayer, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(main);
    sections.forEach(section => observer.observe(section));
  }

  const latticeObserver = new MutationObserver(scheduleMeasure);
  latticeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-layout', 'data-lattice', 'data-density', 'data-size', 'data-look', 'data-theme']
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure);
  }
  scheduleMeasure();
}

/* --- FRAME CENSUS ------------------------------------------------------ */
/* How many views a frame holds is a fact about the markup, and counting
 * children is the one thing CSS cannot do for itself. Every frame gets its own
 * --lattice-count, so a Lattice, a Look or a Life score can reason about a
 * sequence's length without anybody hard-coding how long this page happens to
 * be. Nothing in the shipped sheets requires it yet; it is published because a
 * measurement the sheets cannot take is exactly what this file is for. */
function publishFrameCounts() {
  document.querySelectorAll('[data-frame]').forEach((frame) => {
    const track = frame.querySelector(':scope > [data-track]');
    if (!track) return;
    const views = track.querySelectorAll(':scope > [data-view]').length;
    frame.style.setProperty('--lattice-count', String(views));
  });
}

/* --- COMPOSITION PRESETS ----------------------------------------------- */
/* A coordinate in the mixture space, written as one attribute:
 *   data-compose="lattice:app;layer:top-left-edge-drawer;density:compact"
 * Every field is an ordinary axis and goes through the ordinary swap, so a
 * preset is a starting point exactly the way a Lens is -- it moves you, then
 * gets out of the way. There is no preset STATE anywhere in this file, which
 * is the whole point: these are directions, not destinations. */
function setupComposePresets() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-compose]');
    if (!button) return;
    const next = {};
    button.getAttribute('data-compose').split(';').forEach((pair) => {
      const parts = pair.split(':');
      if (parts.length !== 2) return;
      const key = parts[0].trim();
      const value = parts[1].trim();
      if (key && value) next[key] = value;
    });
    if (Object.keys(next).length) applyComposition(next, { playAudio: true });
  });
}

/* --- PAGE FURNITURE MEASUREMENT --------------------------------------- */
/* Two sizes the sheets have to agree about and neither can ask for.
 *
 * --masthead-size   Header Fold folds the whole masthead away, so it has to
 *                   travel exactly as far as the masthead is tall -- fold
 *                   over less and the page keeps an empty band the same
 *                   shape, fold over more and the content below arrives at
 *                   the top while the header is still coming down.
 *
 * --layer-controls-size  A projection that fixes its invokers to a viewport
 *                   edge parks them over whatever Layout put there. The
 *                   region has to start after them, and how wide they are is
 *                   a question about a font and a label.
 *
 * Both are decided between a look's display face, the reader's density, the
 * Lattice's compaction and the breakpoint, and CSS cannot ask an auto-sized
 * box how any of that turned out. at.life.css and at.layer.css each keep a
 * fallback for the scriptless page. */
function setupFurnitureMeasure() {
  const masthead = document.querySelector('[data-role="masthead"]');
  const brand = masthead && masthead.querySelector('.Brand');
  const controls = document.querySelector('[data-layer-controls]');
  if (!masthead && !controls) return;

  const root = document.documentElement;
  let frame = 0;

  /* offsetWidth/Height are laid-out sizes. A fold's own transform never
     reaches them, so measuring mid-fold cannot feed back into the range.
     Zero means "not displayed right now", which is not news about a size --
     the last real one stands until the box comes back. */
  const publish = (name, size) => {
    if (size > 0) root.style.setProperty(name, Math.round(size) + 'px');
  };

  const measure = () => {
    frame = 0;
    if (brand) publish('--brand-box-size', brand.offsetHeight);
    if (masthead) publish('--masthead-size', masthead.offsetHeight);
    if (controls) publish('--layer-controls-size', controls.offsetWidth);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };

  window.addEventListener('resize', schedule, { passive: true });

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(schedule);
    if (masthead) observer.observe(masthead);
    if (brand) observer.observe(brand);
    if (controls) observer.observe(controls);
  }

  const axisObserver = new MutationObserver(schedule);
  axisObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-layout', 'data-lattice', 'data-layer', 'data-density',
                      'data-size', 'data-look', 'data-theme']
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule);
  }

  /* The first one is synchronous. Every later measurement can wait for a
     frame, but a fold that opens on the clamp fallback and then jumps to the
     measured range on the first scroll is a visible seam. */
  measure();
}

/* Keep the actual heading (and its inherited typography) in its authored
   DOM position. A manual popover gives Brand an independent plane without
   cloning the h1 or putting it inside the masthead's folding transform. */
function setupBrandLayer() {
  const slot = document.querySelector('[data-brand-slot]');
  const brand = slot && slot.querySelector('.Brand');
  if (!brand || typeof brand.showPopover !== 'function') return;

  let frame = 0;
  const measure = () => {
    frame = 0;
    if (!slot.hasAttribute('data-brand-lifted')) return;

    slot.style.setProperty('--brand-inline-size', brand.offsetWidth + 'px');
    slot.style.setProperty('--brand-size', brand.offsetHeight + 'px');

    /* Horizontal offsets and width must ignore the copy's perspective/skew.
       Its viewport top, however, follows the fold until Brand reaches the
       top edge. Captured scroll events also cover Main's paced Lattices. */
    let left = 0;
    for (let box = slot; box; box = box.offsetParent) left += box.offsetLeft;
    brand.style.setProperty('--brand-left', (left - window.scrollX) + 'px');
    brand.style.setProperty('--brand-width', slot.clientWidth + 'px');
    brand.style.setProperty('--brand-top', Math.max(0, slot.getBoundingClientRect().top) + 'px');
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };
  const sync = () => {
    const contract = document.body.hasAttribute('data-contract-ready');
    const enabled = contract ? getComputedStyle(brand).getPropertyValue('--contract-brand-presence').trim() === 'pinned'
      : document.body.getAttribute('data-header-fold') === 'true';
    if (enabled && !slot.hasAttribute('data-brand-lifted')) {
      slot.style.setProperty('--brand-inline-size', brand.offsetWidth + 'px');
      slot.style.setProperty('--brand-size', brand.offsetHeight + 'px');
      slot.setAttribute('data-brand-lifted', '');
      brand.setAttribute('popover', 'manual');
      brand.showPopover();
    } else if (!enabled && slot.hasAttribute('data-brand-lifted')) {
      brand.hidePopover();
      brand.removeAttribute('popover');
      slot.removeAttribute('data-brand-lifted');
      slot.style.removeProperty('--brand-inline-size');
      slot.style.removeProperty('--brand-size');
    }
    measure();
  };

  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ['data-header-fold', 'style', 'data-contract-ready', 'data-experience']
  });
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(schedule);
    observer.observe(slot);
    observer.observe(brand);
  }
  document.addEventListener('scroll', schedule, { capture: true, passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  sync();
}

/* --- AUXILIARY LAYER PROJECTION --------------------------------------- */
/* Regions are authored inline. When the Popover API exists, a non-inline
 * data-layer value promotes them to the browser's top layer. Without that
 * capability the page keeps its complete, readable inline structure.
 *
 * WHICH regions a projection lifts is not decided here. at.layer.css
 * publishes --plane-altitude on every panel frame -- 0 on the base plane,
 * above it once lifted -- and this promotes exactly the frames standing above
 * zero. A footer that belongs to the bottom edge is lifted by the drawer and
 * the top menu and left in the plan by a pop-over, and this file never learns
 * that list. */
function setupLayerProjection() {
  const body = document.body;
  const root = document.documentElement;
  /* One set of invokers per edge they hang from. Each is shown only while it
     has something to open. */
  const controlSets = Array.prototype.slice.call(document.querySelectorAll('.LayerControls'));
  const triggers = Array.prototype.slice.call(document.querySelectorAll('[data-layer-trigger]'));
  const panels = triggers.map(trigger => document.getElementById(trigger.getAttribute('aria-controls')))
    .filter(Boolean);
  const closeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-layer-close]'));
  const supportsPopover = Boolean(
    panels.length && panels.every(panel => typeof panel.showPopover === 'function')
  );
  if (!controlSets.length || !triggers.length || !panels.length) return;

  /* Anchor names, one per pair, from the pairing this function already holds.
     at.layer.css used to carry four rules naming two specific element ids --
     a hand-maintained list of proper nouns, and a third panel would silently
     have got no anchor at all. The viewport fallback in that sheet still
     places every panel unaided, so this stays a pure enhancement. */
  if (CSS && CSS.supports && CSS.supports('anchor-name', '--a')) {
    triggers.forEach((trigger, index) => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) return;
      const name = '--layer-anchor-' + index;
      trigger.style.setProperty('anchor-name', name);
      panel.style.setProperty('position-anchor', name);
    });
  }

  const isOpen = panel => supportsPopover && panel.matches(':popover-open');
  const updateExpanded = () => {
    triggers.forEach(trigger => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(Boolean(panel && isOpen(panel))));
    });
  };

  const closeAll = () => {
    panels.forEach(panel => {
      if (isOpen(panel)) panel.hidePopover();
    });
    updateExpanded();
  };

  /* A sheet that predates --plane-altitude leaves it unset, which reads as
     NaN: every panel is then lifted by every projection, as it always was. */
  const isLifted = panel => {
    const altitude = parseFloat(getComputedStyle(panel).getPropertyValue('--plane-altitude'));
    return Number.isNaN(altitude) || altitude > 0;
  };

  const syncProjection = () => {
    const projected = body.getAttribute('data-layer') !== 'inline' && supportsPopover;
    if (!projected) closeAll();
    body.toggleAttribute('data-layer-ready', projected);
    root.toggleAttribute('data-layer-ready', projected);
    const lifted = panels.filter(panel => projected && isLifted(panel));
    panels.forEach(panel => {
      if (lifted.indexOf(panel) !== -1) {
        panel.setAttribute('popover', 'auto');
      } else {
        if (isOpen(panel)) panel.hidePopover();
        panel.removeAttribute('popover');
      }
    });
    controlSets.forEach(set => {
      const own = Array.prototype.slice.call(set.querySelectorAll('[data-layer-trigger]'));
      set.hidden = !own.some(trigger =>
        lifted.indexOf(document.getElementById(trigger.getAttribute('aria-controls'))) !== -1);
    });
    triggers.forEach(trigger => {
      trigger.hidden = lifted.indexOf(document.getElementById(trigger.getAttribute('aria-controls'))) === -1;
    });
    closeButtons.forEach(button => { button.hidden = lifted.indexOf(button.closest('[data-layer-panel]')) === -1; });
    updateExpanded();
  };

  triggers.forEach(trigger => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    let shouldRestoreFocus = false;
    trigger.addEventListener('click', () => {
      if (!body.hasAttribute('data-layer-ready')) return;
      if (isOpen(panel)) panel.hidePopover();
      else {
        try {
          panel.showPopover({ source: trigger });
        } catch (error) {
          panel.showPopover();
        }
      }
    });
    panel.addEventListener('beforetoggle', event => {
      shouldRestoreFocus = event.newState === 'closed' && panel.contains(document.activeElement);
    });
    panel.addEventListener('toggle', event => {
      updateExpanded();
      if (event.newState === 'closed' && shouldRestoreFocus) {
        trigger.focus();
        shouldRestoreFocus = false;
      }
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const panel = button.closest('[data-layer-panel]');
      if (!panel || !isOpen(panel)) return;
      const invoker = triggers.find(trigger => trigger.getAttribute('aria-controls') === panel.id);
      panel.hidePopover();
      if (invoker) invoker.focus();
    });
  });

  new MutationObserver(syncProjection).observe(body, {
    attributes: true,
    attributeFilter: ['data-layer']
  });
  document.addEventListener('atmosphere:projectionchange', syncProjection);
  window.addEventListener('beforeprint', () => {
    closeAll();
    panels.forEach(panel => panel.removeAttribute('popover'));
  });
  window.addEventListener('afterprint', () => {
    syncProjection();
  });
  syncProjection();
}

/* --- POINTER CAMERA ---------------------------------------------------- */
/*
 * A scene wants to know where you are standing. CSS can express what to do
 * about that -- at.lattice.css reads --pointer-x / --pointer-y straight
 * into perspective-origin -- but it cannot find out, so this does, and then
 * stops. Two numbers in -1..1, published on the scene, written on a frame.
 *
 * Coarse pointers are left out on purpose: there is no hover on a touch
 * screen, so a scene there would only ever jump on tap.
 */
function setupPointerCamera() {
  const scenes = document.querySelectorAll('.depth-stage');
  if (!scenes.length) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  scenes.forEach((scene) => {
    let frame = 0;
    let pending = null;

    const publish = () => {
      frame = 0;
      if (!pending) return;
      scene.style.setProperty('--pointer-x', pending.x.toFixed(3));
      scene.style.setProperty('--pointer-y', pending.y.toFixed(3));
    };

    scene.addEventListener('pointermove', (event) => {
      const box = scene.getBoundingClientRect();
      if (!box.width || !box.height) return;
      pending = {
        x: ((event.clientX - box.left) / box.width) * 2 - 1,
        y: ((event.clientY - box.top) / box.height) * 2 - 1
      };
      if (!frame) frame = requestAnimationFrame(publish);
    });

    // Leaving puts the camera back on its tripod rather than stranding it
    // wherever the pointer happened to exit.
    scene.addEventListener('pointerleave', () => {
      pending = { x: 0, y: 0 };
      if (!frame) frame = requestAnimationFrame(publish);
    });
  });
}

/* --- CONTROL SYNC ------------------------------------------------------ */

function onCompositionChange() {
  syncThemeControls();
}

function updateButtonGroup(attribute, value) {
  const key = attribute.replace(/-(\w)/g, (m, c) => c.toUpperCase());
  document.querySelectorAll('[data-' + attribute + ']').forEach(button => {
    const isSelected = button.dataset[key] === value;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

function updateThemeButtons(theme) {
  document.querySelectorAll('.theme-btn[data-theme-option], .theme-btn[onclick*="setTheme"]').forEach(button => {
    const themeOption = button.dataset.themeOption || getInlineThemeOption(button);
    if (themeOption) button.dataset.themeOption = themeOption;
    const isSelected = themeOption === theme;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

function getInlineThemeOption(button) {
  const clickValue = button.getAttribute('onclick') || '';
  const match = clickValue.match(/setTheme\(['"]([^'"]+)['"]\)/);
  return match ? match[1] : '';
}

/* Mirrors the live composition back into the page: buttons, readout, URL. */
function syncThemeControls() {
  const composition = readComposition();

  updateThemeButtons(composition.look);
  ['layout', 'lattice', 'layer', 'life', 'density', 'size', 'tabs', 'lens'].forEach(axis => {
    updateButtonGroup(axis + '-option', document.body.getAttribute('data-' + axis) || composition[axis]);
  });

  const readouts = Object.assign({}, composition, { lens: describeLens(composition) });
  Object.keys(readouts).forEach(axis => {
    document.querySelectorAll('[data-readout="' + axis + '"]').forEach(node => {
      node.textContent = readouts[axis];
    });
  });

  syncContractReadouts();
  syncStructureFeedback(composition);
  updateScrollPortAffordance();
  writeUrl(composition);
}

/* Explain the effective structure, including the projection that releases
   both rails and the responsive widths where a rail cannot appear. The lab
   supplies the output hooks; other hosts need no extra markup or state. */
function syncStructureFeedback(composition) {
  if (document.body.hasAttribute('data-contract-ready')) return;
  const outputs = document.querySelectorAll('[data-structure-feedback]');
  if (!outputs.length) return;
  const names = {
    default: 'Default structure', '3col': '3-column rail',
    'sidebar-right': 'Right sidebar', stacked: 'Stacked reader', hero: 'Hero Focus'
  };
  const projected = document.body.hasAttribute('data-layer-ready') &&
    ['pop-over', 'top-left-edge-drawer', 'top-menu'].includes(composition.layer);
  const name = names[composition.layout] || composition.layout;
  let message;
  if (projected) {
    message = name + ' is selected. Guide and Axes open on demand, so their rail columns are released. Choose Inline to compare the structure.';
  } else if (composition.layout === '3col' && !window.matchMedia('(min-width: 800px)').matches) {
    message = '3-column rail is selected. Below 800px it uses the responsive base layout; widen the window to see both rails.';
  } else if (composition.layout === 'sidebar-right' && !window.matchMedia('(min-width: 640px)').matches) {
    message = 'Right sidebar is selected. Below 640px the supporting panels stack below the document.';
  } else {
    message = {
      default: 'Default structure places supporting panels according to the available width.',
      '3col': 'Guide, document and Axes occupy the left, center and right columns.',
      'sidebar-right': 'The Guide occupies the right rail beside the document.',
      stacked: 'The document comes first, with Guide and Axes stacked below it.',
      hero: 'Hero Focus emphasizes the opening section. It keeps the default outer page structure.'
    }[composition.layout] || name + ' is selected.';
  }
  if (projected && composition.layout === 'hero') {
    message += ' Hero Focus emphasizes the opening section.';
  }
  outputs.forEach(output => { output.textContent = message; });
  document.querySelectorAll('[data-structure-inline]').forEach(button => {
    button.hidden = !projected;
  });
}

/* The contracts are only convincing if you can watch them change. These are
   read back OUT of the cascade rather than looked up in a table here, so the
   number on screen is the one the stylesheets are actually using. */
const CONTRACT_READOUTS = ['face-aspect', 'haze', 'haze-density', 'camera'];

function syncContractReadouts() {
  const nodes = document.querySelectorAll('[data-readout^="face-aspect"], [data-readout^="haze"], [data-readout="camera"]');
  if (!nodes.length) return;
  const styles = getComputedStyle(document.body);
  CONTRACT_READOUTS.forEach(name => {
    const value = styles.getPropertyValue('--' + name).trim();
    document.querySelectorAll('[data-readout="' + name + '"]').forEach(node => {
      node.textContent = value || '—';
    });
  });
}

/* A lens is a starting point, so the readout has to be honest about drift:
   "cinematic-luxury +2" means two axes have been moved off the seed. */
function describeLens(composition) {
  const id = composition.lens || document.body.getAttribute('data-lens') || 'none';
  if (id === 'none') return 'none';
  const drawer = getThemeDrawer();
  const seeds = drawer && typeof drawer.lensSeeds === 'function' ? drawer.lensSeeds(id) : null;
  if (!seeds) return id;
  const drift = Object.keys(seeds).filter(axis => seeds[axis] !== composition[axis]).length;
  return drift ? id + ' +' + drift : id;
}

/* --- PUBLIC API -------------------------------------------------------- */

function setTheme(theme, playAudio = true) {
  applyComposition({ look: theme }, { playAudio });
}

function setLayout(layout) {
  applyComposition({ layout: layout });
}

function setLattice(lattice) {
  applyComposition({ lattice: lattice });
}

function setLayer(layer) {
  applyComposition({ layer: layer });
}

function setLife(life) {
  applyComposition({ life: life });
}

function setInoutFlow(flow) {
  applyComposition({ inoutFlow: flow });
}

function setDensity(density) {
  applyComposition({ density: density });
}

function setSize(size) {
  applyComposition({ size: size });
}

function setTabs(tabs) {
  applyComposition({ tabs: tabs });
}

function setLens(lens) {
  applyComposition({ lens: lens });
}

/* --- THE LENS MODEL ---------------------------------------------------- */
/*
 * experience_themes.json carries the longer psychology notes. The drawer's
 * compact executable seed recipes stay built in so the controls also work
 * from a file:// URL where fetch is unavailable.
 */
function loadLensModel() {
  const url = new URL('experience_themes.json', document.baseURI).href;
  fetch(url)
    .then(response => (response.ok ? response.json() : null))
    .then(model => {
      if (!model || !model.experience_themes) return;
      renderLensNotes(model.experience_themes);
    })
    .catch(() => {});
}

/* The note is one line about how a lens is meant to FEEL, and three of the
   records in the model spell that field `lens` rather than `psychology`.
   Reading both and dropping the ones that carry neither is not defensive
   padding: the page renders whatever the model happens to hold, and a model
   that grows a ninth entry tomorrow must not put the word "undefined" on
   screen for it. */
function renderLensNotes(themes) {
  const host = document.querySelector('[data-lens-notes]');
  if (!host) return;
  const rows = themes
    .map(theme => ({ name: theme.name, note: theme.psychology || theme.lens }))
    .filter(row => row.name && row.note);
  if (!rows.length) return;
  host.innerHTML = rows.map(row =>
    '<li><strong>' + row.name + '</strong> &mdash; ' + row.note + '</li>'
  ).join('');
}

/* --- TABS -------------------------------------------------------------- */
/*
 * Arrangement is layout's ([data-tabs]); selection is state, so it is here.
 * Full WAI-ARIA tabs pattern: roving tabindex, arrows, Home/End.
 */
function setupTabSets() {
  document.querySelectorAll('.tab-set').forEach(initTabSet);
}

function initTabSet(set) {
  const tabs = Array.prototype.slice.call(set.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  const select = (tab, focus) => {
    tabs.forEach(other => {
      const chosen = other === tab;
      other.setAttribute('aria-selected', String(chosen));
      other.setAttribute('tabindex', chosen ? '0' : '-1');
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      if (panel) panel.hidden = !chosen;
    });
    if (focus) tab.focus();
  };

  set.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) select(tab, false);
  });

  set.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(document.activeElement);
    if (index === -1) return;
    // In a column arrangement the vertical arrows are the natural ones, so
    // both pairs move between tabs rather than guessing at orientation.
    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next === -1) return;
    event.preventDefault();
    event.stopPropagation();
    select(tabs[next], true);
  });

  select(tabs.filter(t => t.getAttribute('aria-selected') === 'true')[0] || tabs[0], false);
}

/**
 * Copyright © 2026 MENTIC LLC
 * Created by Matthew Quarneri
 *
 * Dual licensed under AGPL-3.0 or a MENTIC LLC commercial license.
 * See LICENSE for licensing terms.
 */
