/* SPDX-License-Identifier: AGPL-3.0-or-later */
/* at.lab.js -- the lab page's two actions.
 *
 * atmosphere.js already owns composition: shuffleComposition() rolls one,
 * copyCompositionLink() puts its compact URL on the clipboard. This file
 * only connects the masthead's [data-action] buttons to them and reports
 * the outcome as data-state, which at.lab.life.css scores.
 */
(function () {
  'use strict';

  function flash(button, state, label) {
    const text = button.querySelector('[data-action-label]');
    const original = text ? text.textContent : null;
    button.setAttribute('data-state', state);
    if (text && label) text.textContent = label;
    window.setTimeout(() => {
      button.removeAttribute('data-state');
      if (text && original !== null) text.textContent = original;
    }, 1600);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.getAttribute('data-action');

    if (action === 'remix' && typeof shuffleComposition === 'function') {
      shuffleComposition();
    } else if (action === 'copy-link' && typeof copyCompositionLink === 'function') {
      copyCompositionLink()
        .then(() => flash(button, 'copied', 'Copied!'))
        .catch(() => flash(button, 'failed', 'Copy failed'));
    }
  });
})();
