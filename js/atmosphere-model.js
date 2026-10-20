/* SPDX-License-Identifier: AGPL-3.0-or-later */
/* Experimental live-object adapter for the current DOM-backed controller.
 * See "docs/STATE-MODEL.md" before treating this as a stable API.
 */
(function () {
  'use strict';

  const FIELD_TO_ATTRIBUTE = Object.freeze({
    layout: 'data-layout',
    lattice: 'data-lattice',
    layer: 'data-layer',
    look: 'data-look',
    life: 'data-life',
    lens: 'data-lens',
    scrollFlow: 'data-scroll-flow',
    inoutFlow: 'data-inout-flow',
    density: 'data-density',
    size: 'data-size',
    tabs: 'data-tabs',
    headerFold: 'data-header-fold',
    heartbeat: 'data-heartbeat',
    flap: 'data-flap'
  });

  const BOOLEAN_FIELDS = new Set(['headerFold', 'heartbeat', 'flap']);
  const DEFAULTS = Object.freeze({
    layout: 'default',
    lattice: 'continuous',
    layer: 'inline',
    look: 'blueprint',
    life: 'pulse',
    lens: 'none',
    scrollFlow: 'still',
    inoutFlow: 'slide',
    density: 'cozy',
    size: 'm',
    tabs: 'classic',
    headerFold: false,
    heartbeat: false,
    flap: false
  });

  function freezeCoordinate(value) {
    return Object.freeze(Object.assign({}, value));
  }

  function booleanValue(value) {
    if (typeof value === 'string') return value === 'true';
    return Boolean(value);
  }

  class AtmosphereLiveModel extends EventTarget {
    static event = 'atmosphere:change';

    #target;
    #observer;
    #current;
    #revision = 0;
    #pendingSource = '';

    constructor(options) {
      super();
      const settings = Object.assign({ target: document.body }, options);
      this.#target = settings.target || document.body || document.documentElement;
      this.#current = this.#read();
      this.#observer = new MutationObserver(() => this.#reconcile());
      this.#observer.observe(this.#target, {
        attributes: true,
        attributeFilter: Object.values(FIELD_TO_ATTRIBUTE)
      });
    }

    get current() {
      return this.#current;
    }

    get revision() {
      return this.#revision;
    }

    set(axis, value, options) {
      return this.setComposition({ [axis]: value }, options);
    }

    setComposition(patch, options) {
      const settings = Object.assign({
        source: 'model',
        transition: true,
        playAudio: false
      }, options);
      const next = {};

      /* A Lens seeds every axis it carries before the explicit fields land.
         A field that already holds the wanted value is therefore not safe to
         drop from the patch: the seed would replace it and nothing would put
         it back. */
      const lens = patch && patch.lens !== undefined ? String(patch.lens).trim() : '';
      const reseeds = lens !== '' && lens !== this.#current.lens;

      Object.entries(patch || {}).forEach(([field, raw]) => {
        if (!Object.prototype.hasOwnProperty.call(FIELD_TO_ATTRIBUTE, field)) return;
        const value = BOOLEAN_FIELDS.has(field) ? booleanValue(raw) : String(raw || '').trim();
        if (value === '' || (!reseeds && value === this.#current[field])) return;
        next[field] = value;
      });

      if (!Object.keys(next).length) return false;
      this.#pendingSource = settings.source;

      if (typeof window.applyComposition === 'function') {
        window.applyComposition(next, {
          transition: settings.transition,
          playAudio: settings.playAudio
        });
      } else {
        this.#writeFallback(next);
      }
      return true;
    }

    tokens() {
      const computed = getComputedStyle(this.#target);
      const read = (name) => computed.getPropertyValue(name).trim();
      return Object.freeze({
        layoutGap: read('--layout-gap'),
        layoutPad: read('--layout-pad'),
        densityScale: Number.parseFloat(read('--density-scale')) || 1,
        lookDensity: Number.parseFloat(read('--look-density')) || 1,
        accent: read('--accent'),
        background: read('--bg'),
        text: read('--text'),
        faceAspect: Number.parseFloat(read('--face-aspect')) || 0.55,
        enterTime: read('--lens-enter-time') || read('--enter-time')
      });
    }

    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      const handler = (event) => listener(event.detail);
      this.addEventListener(AtmosphereLiveModel.event, handler);
      return () => this.removeEventListener(AtmosphereLiveModel.event, handler);
    }

    destroy() {
      this.#observer.disconnect();
    }

    #read() {
      if (typeof window.readComposition === 'function') {
        return freezeCoordinate(Object.assign({}, DEFAULTS, window.readComposition()));
      }

      const value = {};
      Object.entries(FIELD_TO_ATTRIBUTE).forEach(([field, attribute]) => {
        const raw = this.#target.getAttribute(attribute);
        value[field] = BOOLEAN_FIELDS.has(field) ? raw === 'true' : (raw || DEFAULTS[field]);
      });
      return freezeCoordinate(value);
    }

    #writeFallback(patch) {
      const root = document.documentElement;
      const body = document.body;
      Object.entries(patch).forEach(([field, value]) => {
        const attribute = FIELD_TO_ATTRIBUTE[field];
        root.setAttribute(attribute, String(value));
        if (body) body.setAttribute(attribute, String(value));
      });
    }

    #reconcile() {
      const before = this.#current;
      const coordinate = this.#read();
      const changed = Object.keys(FIELD_TO_ATTRIBUTE).filter((field) => before[field] !== coordinate[field]);
      if (!changed.length) return;

      this.#current = coordinate;
      this.#revision += 1;
      const detail = Object.freeze({
        coordinate,
        changed: Object.freeze(changed),
        source: this.#pendingSource || 'dom:compatibility',
        revision: this.#revision,
        tokens: this.tokens()
      });
      this.#pendingSource = '';
      this.dispatchEvent(new CustomEvent(AtmosphereLiveModel.event, { detail }));
    }
  }

  function install() {
    if (window.AtmosphereModel && typeof window.AtmosphereModel.subscribe === 'function') return;
    window.AtmosphereLiveModel = AtmosphereLiveModel;
    window.AtmosphereModel = new AtmosphereLiveModel({ target: document.body });
    window.dispatchEvent(new CustomEvent('atmosphere:model-ready', {
      detail: { model: window.AtmosphereModel }
    }));
  }

  if (document.body) install();
  else document.addEventListener('DOMContentLoaded', install, { once: true });
})();
