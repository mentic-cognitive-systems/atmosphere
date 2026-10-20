/* SPDX-License-Identifier: AGPL-3.0-or-later */
/* Laboratory boundary adapter: CSS is the policy resolver. Existing attributes
   remain the shared renderer/URL vocabulary. No policy-to-layout table lives here. */
(() => {
  'use strict';
  const root = document.body;
  const state = root.querySelector('[data-contract-state]');
  if (!root.classList.contains('SemanticLab') || !state) return;
  const axes = ['layout', 'lattice', 'layer', 'density'];
  const fields = Array.from(root.querySelectorAll('[data-contract-policy]'));
  const experiences = Array.from(root.querySelectorAll('[data-contract-experience]'));
  const read = (node, name) => getComputedStyle(node).getPropertyValue(name).trim();
  let active = false, frame = 0, lastEffective = {}, pendingView = null;
  const decode = () => {
    try {
      const match = location.hash.match(/(?:[?&])ac=([^&]*)/);
      return match ? JSON.parse(decodeURIComponent(match[1])) : null;
    } catch (error) { return null; }
  };
  const initialRecord = decode();
  const snapshot = () => ({
    experience: root.dataset.experience || 'manual',
    raw: Object.fromEntries(axes.filter(axis => root.hasAttribute('data-contract-' + axis))
      .map(axis => [axis, root.getAttribute('data-contract-' + axis)])),
    policies: Object.fromEntries(fields.map(field => [field.dataset.contractPolicy,
      root.style.getPropertyValue('--' + field.dataset.contractPolicy).trim()]).filter(pair => pair[1]))
  });
  window.AtmosphereContract = {
    decorateHash(hash) {
      const record = active ? snapshot() : initialRecord;
      return record ? hash + '&ac=' + encodeURIComponent(JSON.stringify(record)) : hash;
    }
  };

  function rememberView() {
    if (pendingView) return;
    const stage = rootFrame();
    const list = Array.from(stage.querySelectorAll(':scope > [data-track] > [data-view]'));
    const focused = list.find(view => view.contains(document.activeElement));
    const port = currentScrollPort();
    if (focused) pendingView = focused;
    else if (port) pendingView = list[currentPageIndex(port, list)];
    else {
      const origin = Math.max(0, root.querySelector('.Header').getBoundingClientRect().bottom);
      pendingView = list.reduce((best, view) => Math.abs(view.getBoundingClientRect().top - origin) <
        Math.abs(best.getBoundingClientRect().top - origin) ? view : best, list[0]);
    }
  }
  function restoreView(view) {
    if (!view) return;
    const port = currentScrollPort();
    if (port) {
      const box = port.element.getBoundingClientRect(), target = view.getBoundingClientRect();
      port.element.scrollBy({ left: port.horizontal ? target.left - box.left : 0,
        top: port.horizontal ? 0 : target.top - box.top, behavior: 'instant' });
    }
  }
  function schedule() {
    if (!active || frame) return;
    frame = requestAnimationFrame(sync);
  }
  function setRaw(axis, value) {
    if (AT_CODEBOOK[axis].includes(value)) root.setAttribute('data-contract-' + axis, value);
  }
  function clear() {
    axes.forEach(axis => root.removeAttribute('data-contract-' + axis));
    fields.forEach(field => root.style.removeProperty('--' + field.dataset.contractPolicy));
  }
  function restore(record, coordinate) {
    clear();
    const names = experiences.map(button => button.dataset.contractExperience);
    root.dataset.experience = names.includes(record?.experience) ? record.experience : 'manual';
    if (root.dataset.experience === 'manual') axes.forEach(axis => setRaw(axis, coordinate[axis]));
    if (record && typeof record.raw === 'object' && record.raw) {
      axes.forEach(axis => setRaw(axis, record.raw[axis]));
    }
    fields.forEach(field => {
      const key = field.dataset.contractPolicy, value = record?.policies?.[key];
      if (value && Array.from(field.options).some(option => option.value === value)) root.style.setProperty('--' + key, value);
    });
  }
  function accept(coordinate) {
    rememberView();
    // An explicit old control is a new request, not a competing renderer.
    const policyForAxis = { layout: ['arrangement'], lattice: ['path'], layer: ['navigation', 'controls'], density: ['rhythm'] };
    axes.filter(axis => coordinate[axis] !== undefined).forEach(axis => {
      policyForAxis[axis].forEach(policy => root.style.removeProperty('--' + policy));
      setRaw(axis, coordinate[axis]);
    });
    schedule();
  }
  document.addEventListener('atmosphere:compositionrequest', event => {
    if (!active || event.detail.source === 'contract') return;
    if (event.detail.source === 'url') {
      rememberView(); restore(decode(), event.detail.coordinate); schedule();
    } else accept(event.detail.coordinate);
  });
  // Drawer setters write their attributes directly and announce the result.
  document.addEventListener('themechange', event => {
    if (!active) return;
    if (event.detail?.source === 'storage') { schedule(); return; }
    const current = readComposition();
    const changed = Object.fromEntries(axes.filter(axis => current[axis] !== lastEffective[axis]).map(axis => [axis, current[axis]]));
    if (Object.keys(changed).length) accept(changed);
    else schedule();
  });

  function sync() {
    frame = 0;
    const desired = Object.fromEntries(axes.map(axis => [axis, read(state, '--resolved-' + axis)]));
    if (!axes.every(axis => AT_CODEBOOK[axis].includes(desired[axis]))) return;
    const navigation = read(state, '--navigation-presence'), controls = read(state, '--controls-presence');
    root.dataset.navigationPresence = navigation;
    root.dataset.controlsPresence = controls;
    const current = readComposition();
    const changed = Object.fromEntries(axes.filter(axis => current[axis] !== desired[axis]).map(axis => [axis, desired[axis]]));
    lastEffective = desired;
    if (Object.keys(changed).length) applyComposition(changed, { transition: false, playAudio: false, persist: false, source: 'contract' });
    else syncThemeControls();
    document.dispatchEvent(new Event('atmosphere:projectionchange'));
    fields.forEach(field => { field.value = root.style.getPropertyValue('--' + field.dataset.contractPolicy).trim(); });
    experiences.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.contractExperience === root.dataset.experience)));
    const label = root.dataset.experience === 'manual' ? 'Individual dimensions' : root.dataset.experience;
    const reasons = { focus: 'focused experience', space: 'available width', explicit: 'explicit policy', default: 'experience default' };
    const message = `Guide ${navigation === 'on-demand' ? 'opens on demand' : 'stays embedded'}; Axes ${controls === 'on-demand' ? 'opens on demand' : 'stays embedded'}. Each releases only its own slot.`;
    root.querySelectorAll('[data-structure-feedback]').forEach(output => { output.textContent = message; });
    root.querySelectorAll('[data-structure-inline]').forEach(button => { button.hidden = navigation === 'embedded' && controls === 'embedded'; });
    state.textContent = `/* Experience: ${label}; computed CSS */\n` +
      fields.map(field => `--${field.dataset.contractPolicy}: ${read(root, '--' + field.dataset.contractPolicy)};${root.style.getPropertyValue('--' + field.dataset.contractPolicy) ? ' /* explicit */' : ''}`).join('\n') +
      `\n\nGuide navigates document → navigator → ${navigation} (${reasons[read(state, '--navigation-reason')] || 'fallback'})` +
      `\nAxes controls experience → inspector → ${controls} (${reasons[read(state, '--controls-reason')] || 'fallback'})` +
      `\nBrand identifies experience → ${read(root.querySelector('.Brand'), '--contract-brand-presence')} (retain space)` +
      `\n\nRenderer: ${desired.layout} · ${desired.lattice} · ${desired.layer} · ${desired.density}`;
    const view = pendingView; pendingView = null;
    if (view) requestAnimationFrame(() => restoreView(view));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (read(state, '--css-contract') !== 'ready') {
      state.textContent = 'This browser uses the existing dimension controls; native CSS style queries are unavailable.';
      return;
    }
    restore(initialRecord, readComposition());
    if (typeof root.querySelector('[data-relation="navigates"]').showPopover === 'function') root.setAttribute('data-contract-can-project', '');
    root.setAttribute('data-contract-ready', '');
    active = true;
    experiences.forEach(button => button.addEventListener('click', () => {
      rememberView();
      axes.forEach(axis => root.removeAttribute('data-contract-' + axis));
      root.dataset.experience = button.dataset.contractExperience;
    }));
    fields.forEach(field => field.addEventListener('change', () => {
      rememberView();
      if (field.value) root.style.setProperty('--' + field.dataset.contractPolicy, field.value);
      else root.style.removeProperty('--' + field.dataset.contractPolicy);
    }));
    root.querySelector('[data-contract-reset]').addEventListener('click', () => {
      rememberView(); clear();
    });
    root.querySelector('.contract-experiences').hidden = false;
    root.querySelector('.contract-fields').hidden = false;
    new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: [
      'style', 'data-experience', ...axes.map(axis => 'data-contract-' + axis), 'data-header-fold', 'data-look', 'data-size'
    ] });
    window.addEventListener('resize', () => { rememberView(); schedule(); }, { passive: true });
    sync();
  });
})();
