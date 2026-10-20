/* SPDX-License-Identifier: AGPL-3.0-or-later */
/**
 * atmosphere-presentation.js — Canonical Presentation Framework Engine
 * 
 * Maps high-level design declarations (Document, Workspace, Presentation, Dashboard)
 * and responsive device contexts to Atmosphere's 5-axis coordinates and semantic places.
 * Implements the live-object architecture and provides reusable web components.
 */
(function () {
  'use strict';

  // --- 1. CANONICAL ARCHETYPE DEFINITIONS ---
  const ARCHETYPES = Object.freeze({
    document: {
      id: 'document',
      label: 'Document',
      description: 'Continuous vertical reading flow with masthead and inline or on-call guide.',
      icon: '📄',
      coordinates: {
        desktop: { layout: 'default', lattice: 'continuous', layer: 'inline', look: 'blueprint', life: 'pulse', lens: 'none', density: 'cozy', size: 'm' },
        tablet:  { layout: 'default', lattice: 'continuous', layer: 'inline', look: 'blueprint', life: 'pulse', lens: 'none', density: 'cozy', size: 'm' },
        phone:   { layout: 'default', lattice: 'continuous', layer: 'inline', look: 'blueprint', life: 'pulse', lens: 'none', density: 'compact', size: 's' }
      },
      places: {
        navigator: { role: 'TOC / Guide', defaultContainer: 'inline', phoneContainer: 'drawer' },
        stage:     { role: 'Reading Article', lattice: 'continuous' },
        inspector: { role: 'References / Annotations', defaultContainer: 'inline', phoneContainer: 'drawer' },
        context:   { role: 'Footer / Metadata', defaultContainer: 'inline', phoneContainer: 'footer' }
      }
    },
    workspace: {
      id: 'workspace',
      label: 'IDE Workspace',
      description: 'Multi-pane studio: center editor, left resource tree, right property inspector, bottom terminal.',
      icon: '💻',
      coordinates: {
        desktop: { layout: '3col', lattice: 'app', layer: 'inline', look: 'tux', life: 'pulse', lens: 'productive-data-dense', density: 'compact', size: 's' },
        tablet:  { layout: '3col', lattice: 'app', layer: 'top-left-edge-drawer', look: 'tux', life: 'pulse', lens: 'productive-data-dense', density: 'compact', size: 's' },
        phone:   { layout: '3col', lattice: 'app', layer: 'top-left-edge-drawer', look: 'tux', life: 'pulse', lens: 'productive-data-dense', density: 'compact', size: 's' }
      },
      places: {
        navigator: { role: 'Project Explorer / Tasks', defaultContainer: 'sidebar', phoneContainer: 'left-drawer' },
        stage:     { role: 'Editor / Active Task', lattice: 'app' },
        inspector: { role: 'Details / Draft Notes', defaultContainer: 'utility-rail', phoneContainer: 'right-drawer' },
        context:   { role: 'Terminal / Status Bar', defaultContainer: 'footer', phoneContainer: 'footer' }
      }
    },
    presentation: {
      id: 'presentation',
      label: 'Slide Deck',
      description: 'Fullscreen sequence: center stage, top dropdown navigator tab, on-call speaker notes.',
      icon: '📽️',
      coordinates: {
        desktop: { layout: 'hero', lattice: 'slides', layer: 'top-menu', look: 'museum', life: 'still', lens: 'cinematic-luxury', density: 'roomy', size: 'l' },
        tablet:  { layout: 'hero', lattice: 'slides', layer: 'top-menu', look: 'museum', life: 'still', lens: 'cinematic-luxury', density: 'cozy', size: 'm' },
        phone:   { layout: 'hero', lattice: 'slides', layer: 'top-menu', look: 'museum', life: 'still', lens: 'cinematic-luxury', density: 'compact', size: 's' }
      },
      places: {
        navigator: { role: 'Slide Strip / Navigator', defaultContainer: 'top-menu', phoneContainer: 'top-menu' },
        stage:     { role: 'Slide Stage', lattice: 'slides' },
        inspector: { role: 'Presenter Notes', defaultContainer: 'drawer', phoneContainer: 'drawer' },
        context:   { role: 'Progress Meter', defaultContainer: 'footer', phoneContainer: 'footer' }
      }
    },
    dashboard: {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Monitoring & analytics: KPI metrics strip, instrument grid, and drill-down inspector.',
      icon: '📊',
      coordinates: {
        desktop: { layout: '3col', lattice: 'control', layer: 'pop-over', look: 'lab', life: 'still', lens: 'productive-data-dense', density: 'compact', size: 's' },
        tablet:  { layout: '3col', lattice: 'control', layer: 'pop-over', look: 'lab', life: 'still', lens: 'productive-data-dense', density: 'compact', size: 's' },
        phone:   { layout: 'stacked', lattice: 'control', layer: 'pop-over', look: 'lab', life: 'still', lens: 'productive-data-dense', density: 'compact', size: 's' }
      },
      places: {
        navigator: { role: 'Scope & Filter', defaultContainer: 'sidebar', phoneContainer: 'pop-over' },
        stage:     { role: 'KPI Cards & Instrument Grid', lattice: 'control' },
        inspector: { role: 'Metric Deep Dive', defaultContainer: 'pop-over', phoneContainer: 'pop-over' },
        context:   { role: 'System Telemetry', defaultContainer: 'footer', phoneContainer: 'footer' }
      }
    }
  });

  // --- 2. SAMPLE CONTINUOUS RELEASE WORKBENCH DATA ---
  const INITIAL_TASKS = [
    {
      id: 'task-1',
      title: 'Architectural Synthesis',
      category: 'Architecture',
      status: 'completed',
      priority: 'high',
      progress: 100,
      summary: 'Consolidate 11 documentation files into 5 canonical reference specifications.',
      content: `The Atmosphere documentation now centers on five canonical files: WHY-ATMOSPHERE.md, VOCABULARY.md, STATE-MODEL.md, PRESENTATIONS.md, and TUTORIAL-VISION.md. All versioned fragmentation has been eliminated.`,
      notes: 'Documentation consolidation committed and verified against git history.'
    },
    {
      id: 'task-2',
      title: 'Canonical Presentation Engine',
      category: 'Framework',
      status: 'in-progress',
      priority: 'critical',
      progress: 75,
      summary: 'Map high-level archetypes (Document, Workspace, Slides, Dashboard) to 5-axis coordinates.',
      content: `Atmosphere is not merely orthogonal CSS; it is a presentation engine that maps semantic places (navigator, stage, inspector, context) to concrete container forms across desktop, tablet, and mobile viewports.`,
      notes: 'Initial engine and custom elements drafted in atmosphere-presentation.js.'
    },
    {
      id: 'task-3',
      title: 'Uber UI Template & Tutorial',
      category: 'Experience',
      status: 'in-progress',
      priority: 'high',
      progress: 50,
      summary: 'Interactive tutorial.html and starter UI.html proving draft and selection continuity.',
      content: `Work must survive presentation changes. A task selected in Reading mode retains its draft notes and active focus when the interface morphs into an IDE workspace or fullscreen slide presentation.`,
      notes: 'Draft persistence active locally; verification across view changes passing.'
    },
    {
      id: 'task-4',
      title: 'Reactive Web Components',
      category: 'Components',
      status: 'planned',
      priority: 'medium',
      progress: 25,
      summary: 'Embed custom elements with live-object architecture into canonical semantic slots.',
      content: `Custom elements (<atmosphere-navigator>, <atmosphere-stage>, <atmosphere-inspector>) subscribe directly to the reactive model, updating their views without rewriting unrelated DOM nodes.`,
      notes: 'Components observing AtmospherePresentation.subscribe().'
    },
    {
      id: 'task-5',
      title: 'Cascade Layers Migration',
      category: 'CSS Engine',
      status: 'planned',
      priority: 'low',
      progress: 10,
      summary: 'Migrate concern sheets into native CSS @layer at.reset, at.components, ...',
      content: `A planned migration will make the conceptual layers explicit via CSS @layer, settling declaration precedence without requiring specificity hacks.`,
      notes: 'Waiting for phase 4 completion.'
    }
  ];

  // --- 3. PRESENTATION ENGINE MODEL ---
  class AtmospherePresentationEngine extends EventTarget {
    static CHANGE_EVENT = 'atmosphere:presentation';
    static DATA_EVENT = 'atmosphere:data';

    #activeArchetype = 'document';
    #deviceContext = 'desktop';
    #tasks = [];
    #drafts = new Map();
    #selectedTaskId = 'task-1';
    #activityLog = [];
    #model = null;

    constructor() {
      super();
      this.#tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
      this.#tasks.forEach(t => this.#drafts.set(t.id, t.notes));
      this.#evaluateDevice();
      window.addEventListener('resize', () => this.#onResize());
      this.#log('Presentation Engine initialized in ' + this.#deviceContext + ' mode.');
    }

    init(model) {
      this.#model = model || window.AtmosphereModel;
      if (this.#model) {
        this.#model.subscribe((change) => this.#onModelChange(change));
      }
      this.#syncWithUrl();
      this.#applyArchetype(this.#activeArchetype, { syncModel: true, log: false });
    }

    get archetypes() {
      return ARCHETYPES;
    }

    get activeArchetype() {
      return this.#activeArchetype;
    }

    get activeArchetypeDefinition() {
      return ARCHETYPES[this.#activeArchetype] || ARCHETYPES.document;
    }

    get deviceContext() {
      return this.#deviceContext;
    }

    get coordinate() { return this.#model?.current || {}; }

    get tasks() {
      return this.#tasks;
    }

    get selectedTask() {
      return this.#tasks.find(t => t.id === this.#selectedTaskId) || this.#tasks[0];
    }

    get selectedTaskId() {
      return this.#selectedTaskId;
    }

    getDraft(taskId) {
      return this.#drafts.get(taskId) || '';
    }

    get activityLog() {
      return [...this.#activityLog];
    }

    // High-level design declaration: set archetype
    setArchetype(archetypeId, options) {
      const settings = Object.assign({ syncModel: true, userExplicit: true }, options);
      if (!ARCHETYPES[archetypeId]) return false;
      const prev = this.#activeArchetype;
      this.#activeArchetype = archetypeId;

      this.#applyArchetype(archetypeId, settings);
      this.#log(`Archetype changed: ${prev} → ${archetypeId}`);
      this.#notifyChange(['archetype']);
      return true;
    }

    selectTask(taskId) {
      const task = this.#tasks.find(t => t.id === taskId);
      if (!task || this.#selectedTaskId === taskId) return;
      this.#selectedTaskId = taskId;
      this.#log(`Selected task: ${task.title}`);
      this.#notifyData(['selection']);
    }

    updateDraft(taskId, text) {
      const task = this.#tasks.find(t => t.id === taskId);
      if (!task || this.getDraft(taskId) === text) return;
      this.#drafts.set(taskId, text);
      task.notes = text;
      this.#notifyData(['draft']);
    }

    updateTaskStatus(taskId, status) {
      const task = this.#tasks.find(t => t.id === taskId);
      if (!task || !['planned', 'in-progress', 'completed'].includes(status) || task.status === status) return;
      task.status = status;
      this.#log(`Task "${task.title}" status updated to ${status}`);
      this.#notifyData(['task']);
    }

    addTask(title, category = 'General') {
      const id = 'task-' + (this.#tasks.length + 1);
      const newTask = {
        id,
        title,
        category,
        status: 'in-progress',
        priority: 'medium',
        progress: 0,
        summary: 'New user-defined work item.',
        content: `Authored via canonical presentation engine. This task demonstrates immediate inclusion across all presentation archetypes without mode-specific code.`,
        notes: 'Initial notes draft.'
      };
      this.#tasks.push(newTask);
      this.#drafts.set(id, newTask.notes);
      this.#selectedTaskId = id;
      this.#log(`Added new task: "${title}" (${id})`);
      this.#notifyData(['task', 'selection']);
    }

    subscribe(callback) {
      const handler = (e) => callback(e.detail);
      this.addEventListener(AtmospherePresentationEngine.CHANGE_EVENT, handler);
      this.addEventListener(AtmospherePresentationEngine.DATA_EVENT, handler);
      return () => {
        this.removeEventListener(AtmospherePresentationEngine.CHANGE_EVENT, handler);
        this.removeEventListener(AtmospherePresentationEngine.DATA_EVENT, handler);
      };
    }

    #applyArchetype(archetypeId, options) {
      const def = ARCHETYPES[archetypeId] || ARCHETYPES.document;
      let deviceCoords = def.coordinates[this.#deviceContext] || def.coordinates.desktop;

      // A page may keep Look to itself: data-archetype-look="keep" on <body>
      // makes an archetype a change of structure and pacing only. The current
      // look is restated rather than omitted, because the archetype's Lens
      // seeds a look of its own and only an explicit field outranks a seed.
      if (document.body && document.body.getAttribute('data-archetype-look') === 'keep') {
        const look = (this.#model && this.#model.current.look) || document.body.getAttribute('data-look');
        if (look) deviceCoords = Object.assign({}, deviceCoords, { look });
      }

      // Update data-archetype attribute on body and root
      if (document.body) document.body.setAttribute('data-archetype', archetypeId);
      if (document.documentElement) document.documentElement.setAttribute('data-archetype', archetypeId);

      // Coordinate updates through AtmosphereModel if present
      if (options.syncModel && this.#model) {
        this.#model.setComposition(deviceCoords, { source: 'presentation-engine' });
      } else if (options.syncModel && window.applyComposition) {
        window.applyComposition(deviceCoords, { source: 'presentation-engine' });
      }
    }

    #evaluateDevice() {
      if (window.matchMedia('(max-width: 639px)').matches) {
        this.#deviceContext = 'phone';
      } else if (window.matchMedia('(max-width: 1023px)').matches) {
        this.#deviceContext = 'tablet';
      } else {
        this.#deviceContext = 'desktop';
      }
    }

    #onResize() {
      const prev = this.#deviceContext;
      this.#evaluateDevice();
      if (prev !== this.#deviceContext) {
        this.#log(`Responsive context shifted: ${prev} → ${this.#deviceContext}`);
        this.#applyArchetype(this.#activeArchetype, { syncModel: true });
        this.#notifyChange(['deviceContext']);
      }
    }

    #onModelChange(change) {
      // Sync presentation state when external model axes change
      this.#notifyChange(['model']);
    }

    #syncWithUrl() {
      const url = new URL(window.location.href);
      const requestedArchetype = url.searchParams.get('archetype');
      if (requestedArchetype && ARCHETYPES[requestedArchetype]) {
        this.#activeArchetype = requestedArchetype;
      }
      const requestedTask = url.searchParams.get('task');
      if (requestedTask && this.#tasks.some(t => t.id === requestedTask)) {
        this.#selectedTaskId = requestedTask;
      }
    }

    #log(message) {
      const timestamp = new Date().toLocaleTimeString();
      this.#activityLog.unshift({ timestamp, message });
      if (this.#activityLog.length > 50) this.#activityLog.pop();
    }

    #notifyChange(fields) {
      this.dispatchEvent(new CustomEvent(AtmospherePresentationEngine.CHANGE_EVENT, {
        detail: {
          engine: this,
          archetype: this.#activeArchetype,
          device: this.#deviceContext,
          changedFields: fields
        }
      }));
    }

    #notifyData(fields) {
      this.dispatchEvent(new CustomEvent(AtmospherePresentationEngine.DATA_EVENT, {
        detail: {
          engine: this,
          selectedTaskId: this.#selectedTaskId,
          changedFields: fields
        }
      }));
    }
  }

  // Instantiate singleton engine
  const Presentation = new AtmospherePresentationEngine();
  window.AtmospherePresentation = Presentation;

  // --- 4. LIVE-OBJECT WEB COMPONENTS ---

  // Each shadow tree is authored once. Native parts are its public semantic API.
  // The four sheets contribute to the same addresses and inherit host tokens.
  const sheetBase = new URL('../css/', document.currentScript.src);
  const componentSheets = ['components', 'layout', 'look', 'life'].map(concern =>
    `<link rel="stylesheet" href="${new URL(`at.presentation.${concern}.css?v=20261016`, sheetBase)}">`
  ).join('');
  const text = (root, selector, value) => {
    const node = root.querySelector(selector);
    const next = String(value ?? '');
    if (node && node.textContent !== next) node.textContent = next;
  };

  // A small lifecycle shared by this family, with an explicitly supplied subject.
  class PresentationElement extends HTMLElement {
    #model = null;
    #unsubscribe = null;
    constructor(template) {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML = componentSheets + template;
    }
    get model() { return this.#model; }
    set model(next) {
      if (next === this.#model) return;
      this.#unsubscribe?.();
      this.#unsubscribe = null;
      this.#model = next;
      this.#bind();
    }
    connectedCallback() {
      if (Object.hasOwn(this, 'model')) {
        const supplied = this.model;
        delete this.model;
        this.model = supplied;
      }
      this.#bind();
    }
    disconnectedCallback() {
      this.#unsubscribe?.();
      this.#unsubscribe = null;
    }
    #bind() {
      this.#unsubscribe?.();
      this.#unsubscribe = null;
      if (!this.isConnected) return;
      if (this.#model) this.#unsubscribe = this.#model.subscribe(() => this.refresh());
      this.refresh();
    }
    refresh() {
      this.dataset.archetype = this.#model?.activeArchetype || 'document';
      this.dataset.life = this.#model?.coordinate?.life || 'still';
      this.render();
    }
    render() {}
  }

  class AtmosphereArchetypePicker extends PresentationElement {
    constructor() {
      super(`<div class="archetype-picker"><fieldset part="controls">
        <legend part="caption">Presentation</legend></fieldset></div>`);
      const controls = this.shadowRoot.querySelector('[part="controls"]');
      Object.values(ARCHETYPES).forEach(archetype => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.archetype = archetype.id;
        button.setAttribute('part', 'select');
        button.textContent = `${archetype.icon} ${archetype.label}`;
        controls.append(button);
      });
      controls.addEventListener('click', event => {
        const button = event.target.closest('button[data-archetype]');
        if (button) this.model?.setArchetype(button.dataset.archetype);
      });
    }
    render() {
      this.shadowRoot.querySelectorAll('button').forEach(button => {
        button.disabled = !this.model;
        button.setAttribute('aria-pressed', String(button.dataset.archetype === this.model?.activeArchetype));
      });
    }
  }

  class AtmosphereNavigator extends PresentationElement {
    #rows = new Map();
    constructor() {
      super(`<nav class="task-navigator" part="surface" aria-label="Release task navigator">
        <header part="explanation"><h2 part="caption">Release plan</h2>
          <p part="conclusion">One collection, composed as a contents list, task list, or slide navigator.</p></header>
        <div part="controls"><button type="button" part="select" data-add-task>+ Task</button></div>
        <ol part="collection"></ol>
      </nav>`);
      this.shadowRoot.addEventListener('click', event => {
        const choice = event.target.closest('button[data-task-id]');
        if (choice) this.model?.selectTask(choice.dataset.taskId);
        if (event.target.closest('[data-add-task]') && this.model) {
          const title = prompt('New task title:');
          if (title?.trim()) this.model.addTask(title.trim());
        }
      });
    }
    render() {
      const tasks = this.model?.tasks || [];
      const list = this.shadowRoot.querySelector('[part="collection"]');
      const present = new Set(tasks.map(task => task.id));
      for (const [id, row] of this.#rows) {
        if (!present.has(id)) { row.remove(); this.#rows.delete(id); }
      }
      tasks.forEach((task, index) => {
        let row = this.#rows.get(task.id);
        if (!row) {
          row = document.createElement('li');
          // This is a static template. All model values are assigned as text.
          row.innerHTML = `<button type="button" class="task-choice" part="select">
            <span part="ordinal"></span><strong part="title"></strong><span part="status"></span></button>`;
          row.querySelector('button').dataset.taskId = task.id;
          this.#rows.set(task.id, row);
        }
        if (list.children[index] !== row) list.insertBefore(row, list.children[index] || null);
        text(row, '[part="ordinal"]', index + 1);
        text(row, '[part="title"]', task.title);
        text(row, '[part="status"]', `${task.category} · ${task.status}`);
        row.querySelector('[part="status"]').dataset.status = task.status;
        const button = row.querySelector('button');
        if (task.id === this.model.selectedTaskId) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      this.shadowRoot.querySelector('[data-add-task]').disabled = !this.model;
    }
  }

  class AtmosphereStage extends PresentationElement {
    constructor() {
      super(`<article class="release-task" part="surface" aria-labelledby="task-title">
        <header part="explanation">
          <p part="identity"></p><h2 id="task-title" part="voice"></h2><p part="summary"></p>
        </header>
        <section part="metrics" aria-label="Release metrics">
          <div class="release-metric"><output part="reading" data-metric="total"></output><span part="caption">Total tasks</span></div>
          <div class="release-metric"><output part="reading" data-metric="completed"></output><span part="caption">Completed</span></div>
          <div class="release-metric"><output part="reading" data-metric="in-progress"></output><span part="caption">In progress</span></div>
          <div class="release-metric"><output part="reading" data-metric="planned"></output><span part="caption">Planned</span></div>
          <div class="release-metric"><output part="reading" data-metric="progress"></output><span part="caption">Average progress</span></div>
        </section>
        <div part="demonstration"></div>
        <form part="controls" aria-label="Active task controls">
          <label>Status <select id="select-status"><option value="planned">Planned</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label>
          <button type="button" id="prev-slide" part="select">← Previous task</button>
          <button type="button" id="next-slide" part="select">Next task →</button>
        </form>
        <dl part="evidence"><dt>Identity</dt><dd data-field="id"></dd><dt>Category</dt><dd data-field="category"></dd><dt>Priority</dt><dd data-field="priority"></dd><dt>Progress</dt><dd data-field="progress"></dd></dl>
        <p part="conclusion">This task, its controls, and its semantic parts stay in place across presentations.</p>
      </article>`);
      this.shadowRoot.querySelector('form').addEventListener('submit', event => event.preventDefault());
      this.shadowRoot.getElementById('select-status').addEventListener('change', event => {
        if (this.model?.selectedTask) this.model.updateTaskStatus(this.model.selectedTask.id, event.target.value);
      });
      const move = direction => {
        if (!this.model) return;
        const tasks = this.model.tasks;
        const index = tasks.indexOf(this.model.selectedTask) + direction;
        if (tasks[index]) this.model.selectTask(tasks[index].id);
      };
      this.shadowRoot.getElementById('prev-slide').addEventListener('click', () => move(-1));
      this.shadowRoot.getElementById('next-slide').addEventListener('click', () => move(1));
    }
    render() {
      const root = this.shadowRoot;
      const task = this.model?.selectedTask;
      const tasks = this.model?.tasks || [];
      root.querySelector('article').dataset.subject = task?.id || '';
      text(root, '[part="voice"]', task?.title || 'No task selected');
      text(root, '[part="summary"]', task?.summary);
      text(root, '[part="identity"]', task ? `${task.id}.md · ${tasks.indexOf(task) + 1} of ${tasks.length}` : '');
      text(root, '[part="demonstration"]', task?.content);
      for (const field of ['id', 'category', 'priority', 'progress']) {
        text(root, `[data-field="${field}"]`, task ? `${task[field]}${field === 'progress' ? '%' : ''}` : '');
      }
      const select = root.getElementById('select-status');
      select.disabled = !task;
      if (task && select.value !== task.status) select.value = task.status;
      root.getElementById('prev-slide').disabled = !task || tasks.indexOf(task) === 0;
      root.getElementById('next-slide').disabled = !task || tasks.indexOf(task) === tasks.length - 1;
      text(root, '[data-metric="total"]', tasks.length);
      for (const status of ['completed', 'in-progress', 'planned']) {
        text(root, `[data-metric="${status}"]`, tasks.filter(item => item.status === status).length);
      }
      text(root, '[data-metric="progress"]', `${tasks.length ? Math.round(tasks.reduce((sum, item) => sum + item.progress, 0) / tasks.length) : 0}%`);
    }
  }

  class AtmosphereInspector extends PresentationElement {
    constructor() {
      super(`<aside class="task-inspector" part="surface" aria-labelledby="inspector-title">
        <header part="explanation"><p part="caption">Associated details · Inspector</p><h3 id="inspector-title" part="title"></h3></header>
        <dl part="evidence"><dt>Entity ID</dt><dd data-field="id"></dd><dt>Status</dt><dd data-field="status"></dd><dt>Priority</dt><dd data-field="priority"></dd><dt>Presentation</dt><dd data-field="archetype"></dd></dl>
        <div part="controls"><label for="draft-notes">Editable task notes</label><textarea id="draft-notes" part="draft" placeholder="Type task notes here…"></textarea></div>
        <p part="conclusion">The same draft node and value survive presentation changes. Notes stay in this page session.</p>
      </aside>`);
      this.shadowRoot.getElementById('draft-notes').addEventListener('input', event => {
        if (this.model?.selectedTask) this.model.updateDraft(this.model.selectedTask.id, event.target.value);
      });
    }
    render() {
      const root = this.shadowRoot;
      const task = this.model?.selectedTask;
      text(root, '[part="title"]', task?.title || 'No task selected');
      for (const field of ['id', 'status', 'priority']) text(root, `[data-field="${field}"]`, task?.[field]);
      text(root, '[data-field="archetype"]', this.model?.activeArchetype);
      const draft = root.getElementById('draft-notes');
      const value = task ? this.model.getDraft(task.id) : '';
      draft.disabled = !task;
      if (draft.value !== value) draft.value = value;
    }
  }

  class AtmosphereContext extends PresentationElement {
    #lastLog = '';
    constructor() {
      super(`<footer class="composition-context" part="surface" aria-label="Composition context">
        <div part="evidence"><span>Presentation: <b data-field="archetype"></b></span><span>Device: <b data-field="device"></b></span><span>Layout: <b data-field="layout"></b></span><span>Lattice: <b data-field="lattice"></b></span><span>Layer: <b data-field="layer"></b></span><span>Look: <b data-field="look"></b></span><span>Life: <b data-field="life"></b></span></div>
        <p part="caption">Recent presentation events</p><ul part="activity"></ul>
      </footer>`);
    }
    render() {
      const coordinate = this.model?.coordinate || {};
      text(this.shadowRoot, '[data-field="archetype"]', this.model?.activeArchetype);
      text(this.shadowRoot, '[data-field="device"]', this.model?.deviceContext);
      for (const axis of ['layout', 'lattice', 'layer', 'look', 'life']) text(this.shadowRoot, `[data-field="${axis}"]`, coordinate[axis] || '—');
      const logs = this.model?.activityLog.slice(0, 4) || [];
      const signature = JSON.stringify(logs);
      if (signature !== this.#lastLog) {
        this.#lastLog = signature;
        this.shadowRoot.querySelector('[part="activity"]').replaceChildren(...logs.map(log => {
          const row = document.createElement('li');
          row.textContent = `[${log.timestamp}] ${log.message}`;
          return row;
        }));
      }
    }
  }

  const components = {
    'atmosphere-archetype-picker': AtmosphereArchetypePicker,
    'atmosphere-navigator': AtmosphereNavigator,
    'atmosphere-stage': AtmosphereStage,
    'atmosphere-inspector': AtmosphereInspector,
    'atmosphere-context': AtmosphereContext,
  };
  for (const [name, component] of Object.entries(components)) {
    if (!customElements.get(name)) customElements.define(name, component);
  }

  // The composition root supplies the shared collaborator. Components neither
  // discover a singleton nor subscribe until connected; hosts can replace it.
  function boot() {
    Presentation.init(window.AtmosphereModel);
    for (const name of Object.keys(components)) {
      document.querySelectorAll(name).forEach(element => {
        if (!element.model) element.model = Presentation;
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
