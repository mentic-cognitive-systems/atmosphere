/*
 * <atheme-tray> Web Component Loader & Alias for <atheme-drawer>
 */
(function () {
  const scriptUrl = document.currentScript && document.currentScript.src;
  const drawerScriptUrl = new URL('./atheme-drawer.js', scriptUrl || document.baseURI).href;

  if (!customElements.get('atheme-drawer')) {
    const script = document.createElement('script');
    script.src = drawerScriptUrl;
    document.head.appendChild(script);
  }
})();

/**
 * Copyright © 2026 MENTIC LLC
 * Created by Matthew Quarneri
 *
 * Dual licensed under AGPL-3.0 or a MENTIC LLC commercial license.
 * See LICENSE for licensing terms.
 */