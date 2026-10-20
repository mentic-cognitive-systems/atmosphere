/* SPDX-License-Identifier: AGPL-3.0-or-later */
/* CSS owns recipes, relationships, responsive resolution and policy precedence.
   This adapter records chosen symbols, manages native popovers, and preserves
   chapter/focus state. It never translates an experience into layout rules. */
(() => {
  'use strict';
  const root = document.querySelector('.SimpleAtmosphere');
  const composition = root.querySelector('.composition');
  const guide = root.querySelector('[data-relation="navigates"]');
  const stage = root.querySelector('[data-frame="root"]');
  const views = Array.from(stage.querySelectorAll('[data-view]'));
  const choices = Array.from(root.querySelectorAll('[data-experience]'));
  const chapters = Array.from(guide.querySelectorAll('[data-go-to]'));
  const policies = Array.from(root.querySelectorAll('[data-policy]'));
  const guideButtons = Array.from(root.querySelectorAll('[popovertarget]'));
  const pager = root.querySelector('.page-controls');
  const status = root.querySelector('[data-presentation-status]');
  const output = root.querySelector('[data-contract-output]');
  const read = (element, property) => getComputedStyle(element).getPropertyValue(property).trim();
  const supportsPopover = typeof guide.showPopover === 'function';
  let current = 0, frame = 0, previousPresence = '';
  let commandedChapter = null;
  const path = () => read(stage, '--path');
  const paced = () => ['pages', 'slides'].includes(path());

  function updateChapter() {
    chapters.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    pager.querySelector('[data-chapter-status]').textContent = `${current + 1} / ${views.length}`;
    pager.querySelector('[data-step="-1"]').disabled = current === 0;
    pager.querySelector('[data-step="1"]').disabled = current === views.length - 1;
  }

  function goTo(index, focus = false, instant = false) {
    current = Math.max(0, Math.min(views.length - 1, index));
    const view = views[current];
    if (paced()) {
      // Keep the requested chapter authoritative while smooth travel is in
      // flight. Changing the path must not commit an intermediate chapter.
      commandedChapter = instant ? null : current;
      stage.scrollTo({ left: path() === 'slides' ? view.offsetLeft : 0,
        top: path() === 'pages' ? view.offsetTop : 0,
        behavior: instant ? 'instant' : 'auto' });
    } else if (focus) view.scrollIntoView({ block: 'nearest' });
    if (focus) {
      view.setAttribute('tabindex', '-1');
      view.focus({ preventScroll: true });
    }
    updateChapter();
  }

  function sync() {
    frame = 0;
    const presence = read(guide, '--presence');
    const projected = presence === 'on-demand' && supportsPopover;
    guideButtons.forEach(button => { button.hidden = !projected; });
    if (presence !== previousPresence) {
      const previousFocus = document.activeElement;
      const hadFocus = guide.contains(previousFocus);
      if (supportsPopover && guide.matches(':popover-open')) guide.hidePopover();
      if (projected) guide.setAttribute('popover', 'auto');
      else guide.removeAttribute('popover');
      previousPresence = presence;
      // A newly hidden navigator must not strand focus inside itself.
      if (projected && hadFocus) guideButtons.find(button => !guide.contains(button)).focus();
      else if (hadFocus) previousFocus.focus({ preventScroll: true });
    }
    // Reading and projection changes never replace any interactive nodes.
    goTo(current, false, true);
    pager.hidden = !paced();
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.experience === root.dataset.lens)));
    policies.forEach(select => { select.value = root.style.getPropertyValue('--' + select.dataset.policy).trim(); });

    const label = choices.find(button => button.dataset.experience === root.dataset.lens)?.textContent || root.dataset.lens;
    const reason = read(composition, '--navigation-reason');
    const reasons = { focus: 'The focused experience makes navigation available on demand.',
      space: 'Available space moves automatic navigation on demand.',
      explicit: 'Your explicit navigation policy takes precedence.',
      default: 'The experience keeps navigation in the layout.' };
    const unavailable = !supportsPopover && read(root, '--navigation') === 'on-demand';
    status.textContent = `${label} · Guide ${projected ? 'opens on demand' : 'stays in the layout'}. ${unavailable ? 'Native popovers are unavailable, so navigation stays reachable.' : reasons[reason] || reasons.default}`;
    const declarations = ['arrangement', 'navigation', 'path', 'rhythm', 'identity']
      .map(name => `--${name}: ${read(root, '--' + name)};${root.style.getPropertyValue('--' + name) ? ' /* explicit */' : ''}`);
    const relationships = Array.from(root.querySelectorAll('.scene > [data-identity]')).map(subject => {
      const relationship = subject.dataset.relation ? `${subject.dataset.relation} ${subject.dataset.target}` : 'primary subject';
      return `${subject.dataset.identity}: ${relationship} → ${read(subject, '--responsibility')} → ${read(subject, '--place')} (${read(subject, '--presence') || 'embedded'}, ${read(subject, '--space') || 'retain'})`;
    });
    output.textContent = `/* Experience: ${root.dataset.lens}; resolved CSS */
${declarations.join('\n')}

${relationships.join('\n')}
brand: identifies experience → ${read(root.querySelector('.toolbar'), '--presence')} (retain)`;
  }
  function schedule() {
    commandedChapter = current;
    if (!frame) frame = requestAnimationFrame(sync);
  }

  // Unsupported style-query engines keep the native reading document.
  if (read(composition, '--css-contract') !== 'ready') {
    status.textContent = 'Reading fallback · This browser does not resolve the CSS composition contract.';
    return;
  }
  if (supportsPopover) root.setAttribute('data-presence-ready', '');
  choices.forEach(button => button.addEventListener('click', () => {
    root.dataset.lens = button.dataset.experience;
  }));
  policies.forEach(select => select.addEventListener('change', () => {
    if (select.value) root.style.setProperty('--' + select.dataset.policy, select.value);
    else root.style.removeProperty('--' + select.dataset.policy);
  }));
  root.querySelector('[data-reset-policies]').addEventListener('click', () => {
    policies.forEach(select => root.style.removeProperty('--' + select.dataset.policy));
  });
  chapters.forEach((link, index) => link.addEventListener('click', event => {
    event.preventDefault();
    if (supportsPopover && guide.matches(':popover-open')) guide.hidePopover();
    goTo(index, true);
  }));
  pager.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => goTo(current + Number(button.dataset.step))));
  stage.addEventListener('keydown', event => {
    if (event.target !== stage || !paced() || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    goTo(current + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1));
  });
  stage.addEventListener('scroll', () => {
    if (!paced()) return;
    const horizontal = path() === 'slides';
    const offset = horizontal ? stage.scrollLeft : stage.scrollTop;
    if (commandedChapter !== null) {
      const target = views[commandedChapter];
      if (Math.abs((horizontal ? target.offsetLeft : target.offsetTop) - offset) < 1) commandedChapter = null;
      else return;
    }
    current = views.reduce((nearest, view, index) => {
      const distance = Math.abs((horizontal ? view.offsetLeft : view.offsetTop) - offset);
      const previous = Math.abs((horizontal ? views[nearest].offsetLeft : views[nearest].offsetTop) - offset);
      return distance < previous ? index : nearest;
    }, 0);
    updateChapter();
  }, { passive: true });
  ['wheel', 'touchstart', 'pointerdown', 'scrollend'].forEach(type => {
    stage.addEventListener(type, () => { commandedChapter = null; }, { passive: true });
  });
  new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['data-lens', 'style'] });
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(root.querySelector('.composition-space'));
  window.addEventListener('resize', schedule, { passive: true });
  root.querySelector('.policy-controls').hidden = false;
  root.querySelector('.experience-choices').hidden = false;
  sync();
})();
