/* SPDX-License-Identifier: AGPL-3.0-or-later */
/*
 * <atmospheric-lander> — the "🌬️ breathe @tmosphere" pill.
 *
 * Composed as a LiveObject (see webcomponents/Composing LiveObjects.md):
 *
 *   AtmosphereRelease (LiveObject)  owns which bundle is chosen and emits the
 *                                   breathe signal each time one is taken.
 *   <atmospheric-lander>            renders the pill; a click downloads the
 *                                   chosen zip and asks the release to breathe.
 *   [data-breathe="land"]           any element on the page subscribes to the
 *                                   signal: it falls to the bottom of the
 *                                   viewport, lands, and re-materializes home.
 *
 * Every pill on a page shares one release, so choosing Thick on one pill
 * changes them all, and every subscriber lands whichever pill was pressed.
 *
 *   <script src="webcomp/atmospheric-lander.js" defer></script>
 *   <h1 data-breathe="land">Title</h1>
 *   <atmospheric-lander floating></atmospheric-lander>
 *
 * Attributes: floating, variant="thin|thick", href-thin, href-thick.
 * The default hrefs resolve beside this script: ../downloads/atmosphere-*.zip,
 * built by Deploy/build_atmosphere_bundles.sh.
 */
(function () {
  'use strict';

  if (customElements.get('atmospheric-lander')) return;

  const scriptUrl = (document.currentScript && document.currentScript.src) || document.baseURI;
  const VARIANTS = Object.freeze({
    thin: Object.freeze({
      label: 'Thin',
      file: 'atmosphere-thin.zip',
      summary: 'Thin Atmosphere: the eight concern sheets as pure CSS'
    }),
    thick: Object.freeze({
      label: 'Thick',
      file: 'atmosphere-thick.zip',
      summary: 'Thick Atmosphere: the sheets plus controller, model, and theme drawer'
    })
  });
  const STORAGE_KEY = 'atmosphere.lander.variant';

  /* --- THE LIVEOBJECT ---------------------------------------------------- */

  class AtmosphereRelease extends EventTarget {
    static events = Object.freeze({
      BREATHE: 'atmosphere:breathe',
      CHANGE: 'atmosphere:release-change'
    });

    #variant = 'thin';
    #breaths = 0;
    #revision = 0;

    constructor(initial = {}) {
      super();
      if (VARIANTS[initial.variant]) this.#variant = initial.variant;
    }

    get variants() {
      return Object.keys(VARIANTS);
    }

    snapshot() {
      return Object.freeze({
        variant: this.#variant,
        breaths: this.#breaths,
        revision: this.#revision
      });
    }

    describe(variant = this.#variant) {
      return VARIANTS[variant] || VARIANTS.thin;
    }

    href(variant = this.#variant, overrides = {}) {
      return overrides[variant] || new URL(`../downloads/${this.describe(variant).file}`, scriptUrl).href;
    }

    choose(variant, source = 'unknown') {
      if (!VARIANTS[variant] || variant === this.#variant) return false;
      this.#variant = variant;
      this.#revision += 1;
      try { localStorage.setItem(STORAGE_KEY, variant); } catch (_) { /* storage is optional */ }
      this.dispatchEvent(new CustomEvent(AtmosphereRelease.events.CHANGE, {
        detail: Object.freeze({ release: this.snapshot(), changed: Object.freeze(['variant']), source })
      }));
      return true;
    }

    /* The download signal. The pill's own <a download> fetches the file, so it
       passes download: false; script callers get the download done for them. */
    breathe(options = {}) {
      const variant = VARIANTS[options.variant] ? options.variant : this.#variant;
      const href = options.href || this.href(variant);
      if (options.download !== false) {
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.download = this.describe(variant).file;
        anchor.hidden = true;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
      this.#breaths += 1;
      this.#revision += 1;
      this.dispatchEvent(new CustomEvent(AtmosphereRelease.events.BREATHE, {
        detail: Object.freeze({
          variant,
          href,
          source: options.source || 'unknown',
          release: this.snapshot(),
          timestamp: new Date()
        })
      }));
      return true;
    }

    subscribe(listener, type = AtmosphereRelease.events.BREATHE) {
      if (typeof listener !== 'function') return () => {};
      const handler = (event) => listener(event.detail);
      this.addEventListener(type, handler);
      return () => this.removeEventListener(type, handler);
    }
  }

  function storedVariant() {
    try { return localStorage.getItem(STORAGE_KEY) || undefined; } catch (_) { return undefined; }
  }

  /* --- THE SUBSCRIBER'S LIFE: LANDING ------------------------------------ */

  function prefersStill() {
    const life = document.body && document.body.getAttribute('data-life');
    return life === 'still' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* A subscriber usually lives in a header whose plane sits under the page's
     panels, so moving it in place would fall BEHIND them. Layer's answer: a
     ghost wearing the subscriber's computed look falls in the top layer while
     the original holds its place, then the original re-materializes. */
  const GHOST_SKIP = /^(position|inset|top|right|bottom|left|margin|width|height|min-|max-|block-size|inline-size|transform|translate|rotate|scale|animation|transition|opacity|filter|visibility|z-index|will-change|view-transition|contain|content-visibility|overflow|pointer-events)/;

  function makeGhost(element, rect) {
    const ghost = element.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.removeAttribute('data-breathe');
    ghost.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    ghost.setAttribute('aria-hidden', 'true');

    const computed = getComputedStyle(element);
    for (const property of computed) {
      if (!GHOST_SKIP.test(property)) ghost.style.setProperty(property, computed.getPropertyValue(property));
    }
    Object.assign(ghost.style, {
      position: 'fixed',
      inset: 'auto',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      boxSizing: 'border-box',
      margin: '0',
      overflow: 'visible',
      zIndex: '2147483000',
      pointerEvents: 'none',
      transformOrigin: '50% 100%' /* squash on the ground, not mid-air */
    });

    ghost.popover = 'manual';
    document.body.appendChild(ghost);
    if (typeof ghost.showPopover === 'function') ghost.showPopover();
    return ghost;
  }

  function fallFrames(rect) {
    const fall = Math.max(0, window.innerHeight - rect.bottom - 12);
    const bounce = Math.min(28, fall * 0.06);
    const at = (y, sx = 1, sy = 1) => `translateY(${y}px) scale(${sx}, ${sy})`;
    const solid = { opacity: 1, filter: 'blur(0)' };
    return [
      { offset: 0,    transform: at(0),                     ...solid, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' },
      { offset: 0.46, transform: at(fall, 0.97, 1.04),      ...solid, easing: 'ease-out' },
      { offset: 0.54, transform: at(fall, 1.1, 0.8),        ...solid, easing: 'ease-out' },
      { offset: 0.64, transform: at(fall - bounce, 0.98, 1.02), ...solid, easing: 'ease-in' },
      { offset: 0.72, transform: at(fall),                  ...solid },
      { offset: 0.8,  transform: at(fall),                  ...solid, easing: 'ease-in' },
      { offset: 1,    transform: at(fall, 1.05, 1.05),      opacity: 0, filter: 'blur(6px)' }
    ];
  }

  const landings = new WeakMap();

  function land(element) {
    const previous = landings.get(element);
    if (previous) previous.cancel();

    const visibility = element.style.visibility;
    const animations = [];
    let ghost = null;
    let cancelled = false;

    const play = (target, frames, options) => {
      const animation = target.animate(frames, options);
      animation.id = 'atmosphere-landing';
      animations.push(animation);
      return animation.finished;
    };
    const restore = () => {
      if (ghost) ghost.remove();
      ghost = null;
      element.style.visibility = visibility;
    };

    landings.set(element, {
      cancel() {
        cancelled = true;
        animations.forEach((animation) => animation.cancel());
        restore();
      }
    });
    element.setAttribute('data-breathe-state', 'landing');

    const run = async () => {
      if (prefersStill()) {
        await play(element, [{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }], { duration: 900, easing: 'ease-in-out' });
        return;
      }
      const rect = element.getBoundingClientRect();
      ghost = makeGhost(element, rect);
      element.style.visibility = 'hidden';
      await play(ghost, fallFrames(rect), { duration: 1500 });
      if (cancelled) return;
      restore();
      await play(element, [
        { opacity: 0, filter: 'blur(10px)', transform: 'scale(0.94)' },
        { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }
      ], { duration: 700, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    };

    return run().then(() => {
      if (cancelled) return;
      landings.delete(element);
      element.setAttribute('data-breathe-state', 'landed');
    }, () => { /* superseded by a newer breath */ });
  }

  /* --- THE COMPONENT ----------------------------------------------------- */

  const componentStyle = `
    :host {
      --lander-aqua: #3ee8e0;
      --lander-aqua-deep: #13b8c9;
      --lander-ink: #032f36;
      display: inline-block;
      font: 700 0.84rem/1 system-ui, -apple-system, "Segoe UI", sans-serif;
      letter-spacing: 0.01em;
    }
    :host([floating]) {
      position: fixed;
      right: max(1rem, env(safe-area-inset-right));
      bottom: max(1rem, env(safe-area-inset-bottom));
      z-index: 999;
    }
    :host([hidden]) { display: none; }
    .pill {
      display: inline-flex;
      align-items: stretch;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--lander-aqua), var(--lander-aqua-deep));
      color: var(--lander-ink);
      box-shadow:
        0 0.35rem 1.2rem color-mix(in srgb, var(--lander-aqua-deep) 45%, transparent),
        inset 0 1px 0 rgb(255 255 255 / 0.55);
      overflow: hidden;
    }
    a, button {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      min-height: 2.5rem;
      border: 0;
      color: inherit;
      background: transparent;
      font: inherit;
      text-decoration: none;
      cursor: pointer;
    }
    a { padding: 0 0.85rem 0 1rem; }
    button {
      padding: 0 0.9rem 0 0.7rem;
      border-left: 1px solid color-mix(in srgb, var(--lander-ink) 22%, transparent);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    a:hover, button:hover { background: rgb(255 255 255 / 0.18); }
    a:active, button:active { background: rgb(0 0 0 / 0.08); }
    a:focus-visible, button:focus-visible {
      outline: 3px solid var(--lander-ink);
      outline-offset: -3px;
    }
    .breath {
      font-size: 1.05rem;
      filter: drop-shadow(0 0 0.5px var(--lander-ink)) drop-shadow(0 0 1px color-mix(in srgb, var(--lander-ink) 60%, transparent));
    }
    @media (prefers-reduced-motion: no-preference) {
      .pill { animation: breathe 5.5s ease-in-out infinite; transition: transform 160ms ease; }
      .pill:hover { transform: translateY(-2px); }
      :host([data-state="exhale"]) .pill { animation: exhale 600ms ease-out; }
      @keyframes breathe {
        0%, 100% { box-shadow: 0 0.35rem 1.2rem color-mix(in srgb, var(--lander-aqua-deep) 40%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.55); }
        50%      { box-shadow: 0 0.45rem 2rem color-mix(in srgb, var(--lander-aqua) 70%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.55); }
      }
      @keyframes exhale {
        40% { transform: scale(1.06); }
      }
    }
  `;

  class AtmosphericLander extends HTMLElement {
    static observedAttributes = ['variant', 'href-thin', 'href-thick'];

    #release = null;
    #unsubscribe = null;
    #link;
    #toggle;

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${componentStyle}</style>
        <span class="pill" part="pill">
          <a part="download" download><span class="breath" aria-hidden="true">🌬️</span><span>breathe @mosphere</span></a>
          <button part="variant" type="button"></button>
        </span>`;
      this.#link = this.shadowRoot.querySelector('a');
      this.#toggle = this.shadowRoot.querySelector('button');

      this.#link.addEventListener('click', () => {
        const release = this.release;
        release.breathe({ download: false, href: this.#link.href, source: 'atmospheric-lander' });
        this.setAttribute('data-state', 'exhale');
        setTimeout(() => this.removeAttribute('data-state'), 650);
      });
      this.#toggle.addEventListener('click', () => {
        const release = this.release;
        const next = release.snapshot().variant === 'thin' ? 'thick' : 'thin';
        release.choose(next, 'atmospheric-lander');
      });
    }

    /* The shared object travels as a property, never an attribute. */
    get release() {
      return this.#release || window.AtmosphereRelease;
    }

    set release(next) {
      if (next === this.#release) return;
      this.#unbind();
      this.#release = next || null;
      if (this.isConnected) this.#bind();
    }

    connectedCallback() {
      const preset = this.getAttribute('variant');
      if (preset && VARIANTS[preset] && !this.#release) this.release.choose(preset, 'attribute');
      this.#bind();
    }

    disconnectedCallback() {
      this.#unbind();
    }

    attributeChangedCallback(name, previous, value) {
      if (name === 'variant' && this.isConnected && VARIANTS[value]) this.release.choose(value, 'attribute');
      else this.#render();
    }

    #bind() {
      this.#unbind();
      this.#unsubscribe = this.release.subscribe(() => this.#render(), AtmosphereRelease.events.CHANGE);
      this.#render();
    }

    #unbind() {
      if (this.#unsubscribe) this.#unsubscribe();
      this.#unsubscribe = null;
    }

    #render() {
      if (!this.#link) return;
      const release = this.release;
      const { variant } = release.snapshot();
      const other = variant === 'thin' ? 'thick' : 'thin';
      const info = release.describe(variant);
      this.#link.href = release.href(variant, {
        thin: this.getAttribute('href-thin'),
        thick: this.getAttribute('href-thick')
      });
      this.#link.download = info.file;
      this.#link.title = `Download ${info.summary} (${info.file})`;
      this.#link.setAttribute('aria-label', `Breathe @tmosphere: download ${info.label} Atmosphere`);
      this.#toggle.textContent = info.label;
      this.#toggle.title = `Bundle: ${info.label}. Switch to ${release.describe(other).label}.`;
      this.#toggle.setAttribute('aria-label', `Bundle: ${info.label}. Switch to ${release.describe(other).label}`);
    }
  }

  /* --- COMPOSITION ROOT -------------------------------------------------- */

  const release = window.AtmosphereRelease instanceof AtmosphereRelease
    ? window.AtmosphereRelease
    : new AtmosphereRelease({ variant: storedVariant() });
  window.AtmosphereRelease = release;
  window.AtmosphericLander = Object.freeze({ Release: AtmosphereRelease, land, bindLanding });

  const bound = new WeakSet();
  function bindLanding(element) {
    if (!element || bound.has(element)) return () => {};
    bound.add(element);
    const unsubscribe = release.subscribe(() => land(element));
    return () => { bound.delete(element); unsubscribe(); };
  }

  function bindPage() {
    document.querySelectorAll('[data-breathe="land"]').forEach(bindLanding);
  }

  customElements.define('atmospheric-lander', AtmosphericLander);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindPage, { once: true });
  else bindPage();
})();
