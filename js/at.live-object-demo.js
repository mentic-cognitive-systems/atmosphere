/* SPDX-License-Identifier: AGPL-3.0-or-later */
(function () {
  'use strict';

  const componentStyle = `
    :host { display: block; min-width: 0; color: var(--text, currentColor); font: inherit; }
    * { box-sizing: border-box; }
    .card { display: grid; gap: var(--layout-gap, 1rem); padding: var(--frame-box-padding, 1rem); border: var(--frame-border-width, 1px) solid var(--frame-border-color, currentColor); border-radius: var(--radius-md, .6rem); background: var(--card-fill, color-mix(in srgb, currentColor 6%, transparent)); box-shadow: var(--card-shadow, none); }
    h2, h3, p, dl { margin: 0; }
    .label { font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: var(--caps, uppercase); }
    .controls { display: grid; gap: .75rem; }
    .group { display: grid; gap: .4rem; }
    .buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr)); gap: .35rem; }
    button { min-height: 2.55rem; padding: .5rem .65rem; border: 1px solid currentColor; border-radius: var(--radius-sm, .35rem); color: inherit; background: color-mix(in srgb, currentColor 7%, transparent); font: inherit; font-size: .78rem; font-weight: 750; cursor: pointer; }
    button[aria-pressed="true"] { background: color-mix(in srgb, currentColor 22%, transparent); box-shadow: inset 0 0 0 1px currentColor; }
    button:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }
    dl { display: grid; gap: .35rem; }
    dl > div { display: grid; grid-template-columns: minmax(5rem, .7fr) minmax(0, 1.3fr); gap: .5rem; padding-block: .35rem; border-bottom: 1px solid color-mix(in srgb, currentColor 15%, transparent); }
    dt { font-weight: 800; }
    dd { min-width: 0; margin: 0; font-family: ui-monospace, "SF Mono", monospace; overflow-wrap: anywhere; }
    .revision { display: inline-grid; width: 2.25rem; height: 2.25rem; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-family: ui-monospace, "SF Mono", monospace; font-weight: 850; }
    .head { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
    .changed { min-height: 1.3em; opacity: .78; }
    @media (prefers-reduced-motion: no-preference) { .flash { animation: flash var(--motion-duration-swift, 180ms) ease-out; } @keyframes flash { 50% { transform: translateY(-.18rem); } } }
  `;

  function escapeText(value) {
    return String(value ?? '');
  }

  class AtmosphereControlPanel extends HTMLElement {
    #model = null;
    #unsubscribe = null;

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${componentStyle}</style>
        <section class="card" aria-labelledby="model-controls-title">
          <div><span class="label">Publisher</span><h2 id="model-controls-title">Model controls</h2></div>
          <p>These buttons call <code>AtmosphereModel.set()</code>. They do not write DOM attributes themselves.</p>
          <div class="controls">
            ${this.#group('look', ['blueprint', 'tux', 'parchment'])}
            ${this.#group('lattice', ['continuous', 'pages', 'slides'])}
            ${this.#group('density', ['compact', 'cozy', 'roomy'])}
            ${this.#group('life', ['still', 'pulse', '3d'])}
          </div>
        </section>`;
      this.shadowRoot.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-axis]');
        if (!button || !this.#model) return;
        this.#model.set(button.dataset.axis, button.dataset.value, {
          source: 'control-panel',
          playAudio: false
        });
      });
    }

    #group(axis, values) {
      return `<div class="group"><strong class="label">${axis}</strong><div class="buttons">${values.map((value) => `<button type="button" data-axis="${axis}" data-value="${value}" aria-pressed="false">${value}</button>`).join('')}</div></div>`;
    }

    set model(next) {
      if (this.#model === next) return;
      if (this.#unsubscribe) this.#unsubscribe();
      this.#model = next;
      this.#unsubscribe = next?.subscribe((detail) => this.#render(detail.coordinate)) || null;
      if (next) this.#render(next.current);
    }

    disconnectedCallback() {
      if (this.#unsubscribe) this.#unsubscribe();
    }

    #render(coordinate) {
      this.shadowRoot.querySelectorAll('button[data-axis]').forEach((button) => {
        button.setAttribute('aria-pressed', String(coordinate[button.dataset.axis] === button.dataset.value));
      });
    }
  }

  class AtmosphereSummary extends HTMLElement {
    #model = null;
    #unsubscribe = null;

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${componentStyle}</style>
        <article class="card" aria-labelledby="summary-title">
          <div class="head"><div><span class="label">Direct subscriber</span><h2 id="summary-title">Coordinate snapshot</h2></div><span class="revision" id="revision">r0</span></div>
          <p class="changed" id="changed">Waiting for a model change.</p>
          <dl id="coordinate"></dl>
        </article>`;
    }

    set model(next) {
      if (this.#model === next) return;
      if (this.#unsubscribe) this.#unsubscribe();
      this.#model = next;
      this.#unsubscribe = next?.subscribe((detail) => this.#render(detail)) || null;
      if (next) this.#render({ coordinate: next.current, revision: next.revision, changed: [] });
    }

    disconnectedCallback() {
      if (this.#unsubscribe) this.#unsubscribe();
    }

    #render(detail) {
      const card = this.shadowRoot.querySelector('.card');
      card.classList.remove('flash');
      requestAnimationFrame(() => card.classList.add('flash'));
      this.shadowRoot.getElementById('revision').textContent = 'r' + detail.revision;
      this.shadowRoot.getElementById('changed').textContent = detail.changed.length
        ? 'Changed: ' + detail.changed.join(', ')
        : 'Immutable snapshot at subscription time.';
      const fields = ['layout', 'lattice', 'layer', 'look', 'life', 'lens', 'density'];
      const list = this.shadowRoot.getElementById('coordinate');
      list.replaceChildren(...fields.map((field) => {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        const value = document.createElement('dd');
        term.textContent = field;
        value.textContent = escapeText(detail.coordinate[field]);
        row.append(term, value);
        return row;
      }));
    }
  }

  class AtmosphereTokenProbe extends HTMLElement {
    #model = null;
    #unsubscribe = null;

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${componentStyle}</style>
        <article class="card" aria-labelledby="token-title">
          <div><span class="label">Cascade reader</span><h2 id="token-title">Resolved token facts</h2></div>
          <p>The model exposes facts from the cascade; it does not choose these visual values.</p>
          <dl id="tokens"></dl>
        </article>`;
    }

    set model(next) {
      if (this.#model === next) return;
      if (this.#unsubscribe) this.#unsubscribe();
      this.#model = next;
      this.#unsubscribe = next?.subscribe(() => requestAnimationFrame(() => this.#render())) || null;
      if (next) requestAnimationFrame(() => this.#render());
    }

    disconnectedCallback() {
      if (this.#unsubscribe) this.#unsubscribe();
    }

    #render() {
      if (!this.#model) return;
      const tokens = this.#model.tokens();
      const fields = ['layoutGap', 'layoutPad', 'densityScale', 'lookDensity', 'faceAspect', 'enterTime'];
      this.shadowRoot.getElementById('tokens').replaceChildren(...fields.map((field) => {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        const value = document.createElement('dd');
        term.textContent = field;
        value.textContent = escapeText(tokens[field]);
        row.append(term, value);
        return row;
      }));
    }
  }

  class AtmosphereActivity extends HTMLElement {
    #onChange;

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `<style>${componentStyle}</style>
        <article class="card" aria-labelledby="activity-title">
          <div><span class="label">Decoupled subscriber</span><h2 id="activity-title">Document event bridge</h2></div>
          <p>This component is never given the model. It listens to a document-level adapter event.</p>
          <ol id="events"><li id="empty">No revisions yet.</li></ol>
        </article>`;
      this.#onChange = (event) => this.#add(event.detail);
    }

    connectedCallback() {
      document.addEventListener('atmosphere:model-change', this.#onChange);
    }

    disconnectedCallback() {
      document.removeEventListener('atmosphere:model-change', this.#onChange);
    }

    #add(detail) {
      const list = this.shadowRoot.getElementById('events');
      this.shadowRoot.getElementById('empty')?.remove();
      const item = document.createElement('li');
      item.textContent = 'r' + detail.revision + ' · ' + detail.changed.join(', ') + ' · ' + detail.source;
      list.prepend(item);
      while (list.children.length > 5) list.lastElementChild.remove();
    }
  }

  customElements.define('atmosphere-control-panel', AtmosphereControlPanel);
  customElements.define('atmosphere-summary', AtmosphereSummary);
  customElements.define('atmosphere-token-probe', AtmosphereTokenProbe);
  customElements.define('atmosphere-activity', AtmosphereActivity);

  function bind(model) {
    document.querySelectorAll('atmosphere-control-panel, atmosphere-summary, atmosphere-token-probe').forEach((element) => {
      element.model = model;
    });

    model.subscribe((detail) => {
      document.dispatchEvent(new CustomEvent('atmosphere:model-change', { detail }));
    });
  }

  if (window.AtmosphereModel) bind(window.AtmosphereModel);
  else window.addEventListener('atmosphere:model-ready', (event) => bind(event.detail.model), { once: true });
})();
