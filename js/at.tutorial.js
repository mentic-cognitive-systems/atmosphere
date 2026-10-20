/* SPDX-License-Identifier: AGPL-3.0-or-later */
/**
 * at.tutorial.js — Tutorial Controller for the Uber UI Template
 * Connects tutorial steps with AtmospherePresentation and AtmosphereModel.
 */
(function () {
  'use strict';
  
  const AXIS_ATTRIBUTES = {
    layout: 'data-layout',
    lattice: 'data-lattice',
    layer: 'data-layer',
    look: 'data-look',
    life: 'data-life',
    lens: 'data-lens',
    density: 'data-density',
    size: 'data-size'
  };

  function boot() {
    const steps = Array.from(document.querySelectorAll('[data-tutorial-step]'));
    if (!steps.length) return;

    const navButtons = Array.from(document.querySelectorAll('[data-go-step]'));
    const progressBar = document.querySelector('[data-progress-bar]');
    const progressContainer = document.querySelector('[data-tutorial-progress]');
    const currentNumber = document.querySelector('[data-current-step-number]');
    const currentTitle = document.querySelector('[data-current-step-title]');
    let activeIndex = -1;

    function activate(index, options) {
      const settings = Object.assign({ scroll: false, focus: false, updateUrl: true, switchArchetype: true, reassert: false }, options);
      const bounded = Math.max(0, Math.min(steps.length - 1, Number(index) || 0));
      const step = steps[bounded];
      if (!step) return;

      activeIndex = bounded;

      // Toggle step visibility in Main track
      steps.forEach((candidate, candidateIndex) => {
        const isCurrent = candidateIndex === bounded;
        candidate.toggleAttribute('data-current', isCurrent);
        candidate.hidden = !isCurrent;
      });

      // Update sidebar nav buttons
      navButtons.forEach((button) => {
        const selected = Number(button.dataset.goStep) === bounded;
        if (selected) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });

      // Update progress indicators
      if (progressBar) {
        progressBar.style.setProperty('--tutorial-step', String(bounded + 1));
        progressBar.style.setProperty('--tutorial-total', String(steps.length));
      }
      if (progressContainer) progressContainer.setAttribute('aria-valuenow', String(bounded + 1));
      if (currentNumber) currentNumber.textContent = String(bounded + 1);
      if (currentTitle) currentTitle.textContent = step.dataset.title || '';

      // A step picked from an open drawer closes the drawer first. The archetype
      // change below can re-project or un-project that same panel, and it
      // should not happen to a panel that is still open in the top layer.
      try {
        document.querySelectorAll('[data-layer-panel]:popover-open').forEach((panel) => panel.hidePopover());
      } catch (error) { /* no Popover API: panels are inline and stay put */ }

      // Automatically switch canonical archetype according to the lesson plan
      if (settings.switchArchetype && window.AtmospherePresentation) {
        const targetArchetype = step.dataset.archetype;
        if (targetArchetype && (settings.reassert || window.AtmospherePresentation.activeArchetype !== targetArchetype)) {
          window.AtmospherePresentation.setArchetype(targetArchetype, { syncModel: true });
        }
      }

      // URL state sync
      if (settings.updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set('step', String(bounded + 1));
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      }

      if (settings.scroll) {
        step.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }
      if (settings.focus) step.querySelector('h2')?.focus({ preventScroll: true });
    }

    // Step action click delegation
    document.addEventListener('click', (event) => {
      const direct = event.target.closest('[data-go-step]');
      if (direct) {
        activate(Number(direct.dataset.goStep), { scroll: true, focus: true });
        return;
      }

      const next = event.target.closest('[data-step-next]');
      if (next) {
        activate(activeIndex + 1, { scroll: true, focus: true });
        return;
      }

      const previous = event.target.closest('[data-step-previous]');
      if (previous) {
        activate(activeIndex - 1, { scroll: true, focus: true });
        return;
      }

      const addBtn = event.target.closest('#btn-tutorial-add-task');
      if (addBtn && window.AtmospherePresentation) {
        const title = prompt('Enter a new task for the release workbench:', 'Verify Cross-Archetype Continuity');
        if (title && title.trim()) {
          window.AtmospherePresentation.addTask(title.trim(), 'Verification');
        }
      }
    });

    // The deck is one view, so the Lattice has nowhere to page to and leaves
    // the arrow keys unhandled; here they advance the deck's own slides.
    document.addEventListener('keydown', (event) => {
      const engine = window.AtmospherePresentation;
      if (!engine || engine.activeArchetype !== 'presentation') return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const target = event.composedPath()[0];
      if (target && target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) return;

      const tasks = engine.tasks;
      const index = tasks.indexOf(engine.selectedTask) + (event.key === 'ArrowRight' ? 1 : -1);
      if (index < 0 || index >= tasks.length) return;
      engine.selectTask(tasks[index].id);
      event.preventDefault();
    });

    // Check initial step from query param
    const requested = Number(new URL(window.location.href).searchParams.get('step'));
    const initial = Number.isFinite(requested) && requested > 0 ? requested - 1 : 0;
    activate(initial, { scroll: false, updateUrl: initial > 0, switchArchetype: true });

    // The theme drawer restores the last composition from localStorage when it
    // upgrades, which lands after this and is shared with every other page on
    // the origin: a tutorial opened after a dashboard would show step 1 on a
    // dashboard. The step owns the structure, so it is stated again afterwards.
    if (window.customElements) {
      customElements.whenDefined('atheme-drawer').then(() => {
        activate(activeIndex, { updateUrl: false, reassert: true });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
