/* SPDX-License-Identifier: AGPL-3.0-or-later */
/*
 * <atheme-drawer> / <atheme-tray> Web Component
 *
 * Composable controls for Look, Layout, Lattice, Layer, Life, and Lens.
 *
 * Attributes:
 *   look="cyberpunk"       Active look theme (fonts, colors, shapes)
 *   layout="default"       Active structural layout ('default', '3col', 'sidebar-right', 'stacked', 'hero')
 *   lattice="continuous"   Path through a frame ('continuous', 'pages', 'slides', 'ribbon', 'card-stack', 'spotlight', 'control', 'app')
 *   layer="inline"         Active overlay projection ('inline', 'top-left-edge-drawer', 'top-menu', 'pop-over')
 *   life="pulse"           Active micro-motion theme ('still', 'pulse', 'wiggle', '3d', 'glitch', 'crazy')
 *   scroll-flow="still"    Active scroll-motion theme ('still', 'reveal', 'parallax')
 *   inout-flow="slide"     Active crossing for projected regions ('show', 'slide', 'slam', 'flip', 'materialize', 'focus')
 *   header-fold="true"     Toggle the masthead fold effect
 *   heartbeat="true"       Toggle the drawer button heartbeat effect
 *   flap="true"            Toggle the drawer button 3D flag-wave effect
 *   position="top-right"   Placement: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'left', 'right', 'top', 'bottom'
 *   label="Theme"          Tab label text (defaults to "Theme")
 *   icon="🖼️"              Tab icon emoji or image URL (defaults to "🖼️")
 *   target="body"          Selector for target element receiving data-* attributes
 *   sound="true"           Enable/disable Web Audio sound effects ("true" or "false")
 *   intro="true"           Show a one-time callout beside the tab explaining what the
 *                          drawer is for; any value other than "true" is used as its text
 *
 * Events:
 *   themechange { detail: { look, layout, lattice, layer, life, theme, target } }
 */
(function () {
  const scriptUrl = document.currentScript && document.currentScript.src;
  const stylesheetUrl = new URL('./atheme-drawer.css', scriptUrl || document.baseURI).href;

  /* The tab is easy to read as decoration, so a page can ask for one sentence
     of introduction beside it. Seen once per browser: opening the drawer or
     dismissing the callout retires it for every page. */
  const INTRO_SEEN_KEY = 'atheme-intro-seen';
  const DEFAULT_INTRO = 'This tab is the control for how the whole page is presented. ' +
    'Layout, how you move through it, where panels sit, its look, its motion and its pace ' +
    'are all yours to change here; the content stays the same.';

  const DEFAULT_LOOKS = [
    'apple', 'android', 'microsoft', 'temple', 'citadel', 'tux', 'luxury', 'parchment', 'typewritter',
    'newspaper', 'origami', 'comic', 'school', 'lab', 'blueprint',
    'museum', 'nightclub', 'urban', 'western', 'crt', 'cyberpunk',
    'hologram', 'arcade', 'starfield', 'deepsea', 'storm', 'vaporwave',
    'thermal', 'fortress', 'vault', 'midcentury'
  ];

  const LOOK_CATEGORIES = [
    {
      id: 'architecture',
      label: 'Architecture & Stone',
      themes: ['fortress', 'citadel', 'vault', 'temple', 'museum', 'blueprint']
    },
    {
      id: 'society',
      label: 'Society & Culture',
      themes: ['midcentury', 'luxury', 'tux', 'nightclub', 'western', 'urban']
    },
    {
      id: 'print',
      label: 'Print & Paper',
      themes: ['newspaper', 'parchment', 'typewritter', 'origami', 'school', 'comic']
    },
    {
      id: 'cyber',
      label: 'Tech & Cyber',
      themes: ['crt', 'arcade', 'cyberpunk', 'hologram', 'lab']
    },
    {
      id: 'elements',
      label: 'Atmosphere & Elements',
      themes: ['starfield', 'deepsea', 'storm', 'vaporwave', 'thermal']
    },
    {
      id: 'platform',
      label: 'Platform & OS',
      themes: ['apple', 'android', 'microsoft']
    }
  ];

  const LAYOUT_THEMES = [
    { id: 'default', label: 'Default Structure', mark: 'STD' },
    { id: '3col', label: '3-Column Rail', mark: '3C' },
    { id: 'sidebar-right', label: 'Right Sidebar', mark: 'R-SIDE' },
    { id: 'stacked', label: 'Stacked Reader', mark: 'STACK' },
    { id: 'hero', label: 'Hero Focus', mark: 'HERO' }
  ];

  const LATTICE_THEMES = [
    { id: 'continuous', label: 'Continuous', mark: 'FLOW' },
    { id: 'pages', label: 'Pages', mark: 'PAGE' },
    { id: 'slides', label: 'Slide Deck', mark: 'DECK' },
    { id: 'ribbon', label: 'Ribbon', mark: 'RIBN' },
    { id: 'card-stack', label: 'Card Stack', mark: 'STACK' },
    { id: 'spotlight', label: 'Spotlight', mark: 'SPOT' },
    { id: 'control', label: 'Control', mark: 'CTRL' },
    { id: 'app', label: 'Panel App', mark: 'APP' }
  ];

  const LAYER_THEMES = [
    { id: 'inline', label: 'Inline', mark: 'LINE' },
    { id: 'top-left-edge-drawer', label: 'Top-left Edge Drawer', mark: 'EDGE' },
    { id: 'top-menu', label: 'Top Menu', mark: 'MENU' },
    { id: 'pop-over', label: 'Pop-over', mark: 'POP' }
  ];

  /* A projection value names where the panel goes, so renaming the place
     renames the value. Stored preferences and old links canonicalize. */
  const LEGACY_LAYER = {
    'bottom-sheet': 'top-menu'
  };

  const LEGACY_LAYOUT_LATTICE = {
    poster: 'continuous',
    book: 'pages',
    slides: 'slides',
    scroll: 'ribbon',
    layers: 'card-stack',
    dashboard: 'control'
  };

  const MICRO_MOTION_THEMES = [
    { id: 'still', label: 'Still (No Motion)', mark: 'OFF' },
    { id: 'pulse', label: 'Pulse & Glow', mark: 'PULSE' },
    { id: 'wiggle', label: 'Playful Wiggle', mark: 'WIG' },
    { id: '3d', label: '3D Depth', mark: '3D' },
    { id: 'glitch', label: 'Cyber Glitch', mark: 'NEON' },
    { id: 'crazy', label: 'Crazy (All Of It)', mark: 'WOW' }
  ];

  const SCROLL_FLOW_THEMES = [
    { id: 'still', label: 'No Scroll Effect', mark: 'OFF' },
    { id: 'reveal', label: 'Drop In', mark: 'DROP' },
    { id: 'parallax', label: 'Parallax Depth', mark: 'PRLX' }
  ];

  /* How anything Layer projects arrives -- and, played backwards, leaves.
     The flow names the manner; the projection supplies the distance and the
     hinge, so the same five read at drawer scale and at pop-over scale. */
  const INOUT_FLOW_THEMES = [
    { id: 'show', label: 'Show (No Crossing)', mark: 'OFF' },
    { id: 'slide', label: 'Slide', mark: 'GLIDE' },
    { id: 'slam', label: 'Slam', mark: 'BAM' },
    { id: 'flip', label: 'Flip', mark: 'DOOR' },
    { id: 'materialize', label: 'Materialize', mark: 'BITS' },
    { id: 'focus', label: 'Focus', mark: 'LENS' }
  ];

  const CUSTOM_EFFECTS = [
    { id: 'header-fold', label: 'Header Fold', mark: 'FOLD', category: 'layer' },
    { id: 'heartbeat', label: 'Heartbeat', mark: 'BEAT', category: 'life' },
    { id: 'flap', label: 'Flap', mark: 'WAVE', category: 'life' }
  ];

  /* Spacing and tab arrangement are both LAYOUT decisions -- how much room the
     content gets, and where a tab list sits relative to its panel. They live
     in the layout list as their own sections rather than as separate tabs. */
  const DENSITY_THEMES = [
    { id: 'compact', label: 'Compact', mark: 'S' },
    { id: 'cozy', label: 'Cozy', mark: 'M' },
    { id: 'roomy', label: 'Roomy', mark: 'L' }
  ];

  const TAB_THEMES = [
    { id: 'classic', label: 'Classic (top)', mark: 'TOP' },
    { id: 'column', label: 'Column (left)', mark: 'SIDE' }
  ];

  /* Type scale. A look picks the face; size picks how big the face gets. */
  const SIZE_THEMES = [
    { id: 'xs', label: 'XS' },
    { id: 's', label: 'S' },
    { id: 'm', label: 'M' },
    { id: 'l', label: 'L' },
    { id: 'xl', label: 'XL' }
  ];

  /* A Lens is a chord of the other axes -- see at.lens.css. The seeds
     below are the starting composition; drift from there is expected and is
     exactly what the lens is for. experience_themes.json supplies the longer
     psychology notes rendered by the page. */
  const LENS_THEMES = [
    { id: 'none', label: 'No Lens (free)', mark: 'OFF', seeds: null },
    { id: 'productive-data-dense', label: 'Productive', mark: 'FAST',
      seeds: { look: 'lab', layout: 'default', lattice: 'app', layer: 'top-left-edge-drawer', life: 'still', scrollFlow: 'still', inoutFlow: 'slide', density: 'compact', size: 's', tabs: 'column' } },
    { id: 'expressive-gamified', label: 'Expressive', mark: 'FUN',
      seeds: { look: 'arcade', layout: 'hero', lattice: 'continuous', layer: 'top-menu', life: 'wiggle', scrollFlow: 'still', inoutFlow: 'slam', density: 'roomy', size: 'l', tabs: 'classic' } },
    { id: 'cinematic-luxury', label: 'Cinematic', mark: 'LUXE',
      seeds: { look: 'luxury', layout: 'default', lattice: 'slides', layer: 'top-left-edge-drawer', life: 'still', scrollFlow: 'parallax', inoutFlow: 'focus', density: 'roomy', size: 'l', tabs: 'classic' } },
    { id: 'stealth-terminal', label: 'Stealth', mark: 'TERM',
      seeds: { look: 'crt', layout: 'default', lattice: 'ribbon', layer: 'inline', life: 'glitch', scrollFlow: 'still', inoutFlow: 'materialize', density: 'compact', size: 's', tabs: 'column' } },
    { id: 'institutional-reassuring', label: 'Institutional', mark: 'TRUST',
      seeds: { look: 'newspaper', layout: 'stacked', lattice: 'continuous', layer: 'inline', life: 'still', scrollFlow: 'reveal', inoutFlow: 'slide', density: 'roomy', size: 'm', tabs: 'classic' } }
  ];

  const LABELS = {
    typewritter: 'Typewriter',
    deepsea: 'Deep Sea',
    midcentury: 'Mid-Century'
  };

  const MARKS = {
    nightclub: 'VIP',
    school: 'A+',
    western: 'PIN',
    lab: 'LIVE',
    urban: 'TAG',
    comic: 'POW',
    museum: 'SEE',
    newspaper: 'NEW',
    temple: 'ZEN',
    citadel: 'GATE',
    fortress: 'FORT',
    vault: 'SEAL',
    tux: 'TOP',
    midcentury: 'MOD',
    origami: 'FOLD',
    hologram: 'HOLO',
    cyberpunk: 'RUN',
    luxury: 'WIN',
    arcade: 'P1',
    vaporwave: 'VAP',
    thermal: 'HOT',
    blueprint: 'MARK',
    starfield: 'AWE',
    storm: 'WET',
    typewritter: 'X',
    parchment: 'PEN',
    deepsea: 'BE',
    microsoft: 'WIN',
    apple: 'MAC',
    android: 'BOT'
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function isImageUrl(url) {
    if (!url) return false;
    const clean = url.trim().toLowerCase();
    return clean.startsWith('http://') || clean.startsWith('https://') ||
           clean.startsWith('./') || clean.startsWith('/') || clean.startsWith('data:') ||
           clean.endsWith('.png') || clean.endsWith('.svg') || clean.endsWith('.jpg') ||
           clean.endsWith('.jpeg') || clean.endsWith('.webp') || clean.endsWith('.gif');
  }

  // Audio Synthesizer Engine
  let audioCtx;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtx = new AudioContextClass();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, options = {}) {
    const ctx = initAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = options.filter ? ctx.createBiquadFilter() : null;
    const startTime = ctx.currentTime + (options.delay || 0);
    const volume = options.volume || 0.1;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (options.endFreq) {
      osc.frequency.exponentialRampToValueAtTime(options.endFreq, startTime + duration);
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + (options.attack || 0.01));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    if (filter) {
      filter.type = options.filter.type;
      filter.frequency.setValueAtTime(options.filter.frequency, startTime);
      filter.Q.setValueAtTime(options.filter.q || 1, startTime);
    }

    osc.connect(filter || gain);
    if (filter) filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function playNoise(duration, options = {}) {
    const ctx = initAudio();
    if (!ctx) return;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2) - 1;
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const startTime = ctx.currentTime + (options.delay || 0);
    const volume = options.volume || 0.08;

    source.buffer = buffer;
    filter.type = options.filterType || 'bandpass';
    filter.frequency.setValueAtTime(options.frequency || 1200, startTime);
    filter.Q.setValueAtTime(options.q || 0.8, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + (options.attack || 0.005));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(startTime);
    source.stop(startTime + duration);
  }

  function playThemeSequence(notes) {
    notes.forEach(note => {
      playTone(note.freq, note.type || 'sine', note.duration, {
        delay: note.delay || 0,
        volume: note.volume || 0.08,
        attack: note.attack || 0.01,
        endFreq: note.endFreq,
        filter: note.filter
      });
    });
  }

  function playSoundForTheme(theme) {
    if (theme === 'arcade') {
      playTone(987.77, 'square', 0.1);
      setTimeout(() => playTone(1318.51, 'square', 0.4), 100);
    } else if (theme === 'lab') {
      playThemeSequence([
        { freq: 880, type: 'sine', duration: 0.09, volume: 0.045 },
        { freq: 1760, type: 'sine', duration: 0.14, delay: 0.08, volume: 0.04 },
        { freq: 110, type: 'triangle', duration: 0.5, delay: 0.02, volume: 0.035, attack: 0.05 }
      ]);
      playNoise(0.22, { delay: 0.18, volume: 0.018, frequency: 4200, q: 10 });
    } else if (theme === 'cyberpunk') {
      playTone(30, 'sawtooth', 0.2);
    } else if (theme === 'deepsea') {
      playTone(880, 'sine', 1.5);
    } else if (theme === 'luxury') {
      playTone(523.25, 'triangle', 1.0);
      playTone(659.25, 'triangle', 1.0);
    } else if (theme === 'typewritter') {
      playNoise(0.028, { volume: 0.075, frequency: 2800, q: 11, attack: 0.001 });
      playTone(760, 'square', 0.018, { volume: 0.035, attack: 0.001, filter: { type: 'bandpass', frequency: 1700, q: 9 } });
      playTone(1540, 'triangle', 0.05, { delay: 0.008, volume: 0.022, attack: 0.001, filter: { type: 'bandpass', frequency: 2200, q: 7 } });
      playNoise(0.022, { delay: 0.055, volume: 0.052, frequency: 2400, q: 10, attack: 0.001 });
      playTone(640, 'square', 0.02, { delay: 0.055, volume: 0.028, attack: 0.001, filter: { type: 'bandpass', frequency: 1450, q: 8 } });
    } else if (theme === 'school') {
      playThemeSequence([
        { freq: 784, type: 'triangle', duration: 0.12, volume: 0.055 },
        { freq: 1046.5, type: 'triangle', duration: 0.18, delay: 0.12, volume: 0.05 },
        { freq: 1318.51, type: 'sine', duration: 0.32, delay: 0.25, volume: 0.04 }
      ]);
      playNoise(0.18, { delay: 0.03, volume: 0.025, frequency: 2600, q: 8 });
    } else if (theme === 'parchment') {
      playNoise(0.32, { volume: 0.035, frequency: 1900, q: 0.7 });
      playNoise(0.18, { delay: 0.14, volume: 0.025, frequency: 620, q: 0.9 });
      playTone(200.63, 'triangle', 0.28, { delay: 0.08, volume: 0.025, attack: 0.04 });
    } else if (theme === 'graffiti') {
      playTone(600, 'sawtooth', 0.3);
    } else if (theme === 'nightclub') {
      playThemeSequence([
        { freq: 165, endFreq: 38, type: 'sine', duration: 0.36, volume: 0.16, attack: 0.001 },
        { freq: 54, endFreq: 31, type: 'sine', duration: 0.62, delay: 0.015, volume: 0.13, attack: 0.004 },
        { freq: 92, endFreq: 46, type: 'triangle', duration: 0.22, delay: 0.035, volume: 0.055, attack: 0.006, filter: { type: 'lowpass', frequency: 180, q: 3 } }
      ]);
      playNoise(0.018, { volume: 0.045, frequency: 2800, q: 2.2, attack: 0.001 });
      playNoise(0.075, { delay: 0.018, volume: 0.032, frequency: 85, q: 0.7, attack: 0.002 });
    } else if (theme === 'western') {
      playThemeSequence([
        { freq: 196, endFreq: 247, type: 'sawtooth', duration: 0.16, volume: 0.055, filter: { type: 'lowpass', frequency: 1700, q: 4 } },
        { freq: 329.63, endFreq: 261.63, type: 'square', duration: 0.34, delay: 0.12, volume: 0.045, filter: { type: 'lowpass', frequency: 1300, q: 6 } },
        { freq: 392, endFreq: 293.66, type: 'triangle', duration: 0.28, delay: 0.28, volume: 0.04, filter: { type: 'bandpass', frequency: 900, q: 3 } }
      ]);
    } else if (theme === 'urban') {
      playThemeSequence([
        { freq: 82.41, type: 'sine', duration: 0.12, volume: 0.08 },
        { freq: 164.81, type: 'square', duration: 0.08, delay: 0.11, volume: 0.035, filter: { type: 'lowpass', frequency: 650, q: 2 } },
        { freq: 123.47, type: 'sine', duration: 0.16, delay: 0.2, volume: 0.06 }
      ]);
      playNoise(0.055, { delay: 0.105, volume: 0.04, frequency: 1800, q: 1.2 });
      playNoise(0.06, { delay: 0.2, volume: 0.03, frequency: 900, q: 1.6 });
    } else if (theme === 'crt') {
      playTone(80, 'sawtooth', 0.12, { volume: 0.035, filter: { type: 'lowpass', frequency: 500, q: 4 } });
      playTone(15800, 'sine', 0.45, { delay: 0.02, volume: 0.012, attack: 0.04 });
      playNoise(0.16, { delay: 0.08, volume: 0.018, frequency: 3200, q: 6 });
    } else if (theme === 'blueprint') {
      playThemeSequence([
        { freq: 523.25, type: 'triangle', duration: 0.08, volume: 0.035 },
        { freq: 659.25, type: 'triangle', duration: 0.08, delay: 0.09, volume: 0.032 },
        { freq: 783.99, type: 'triangle', duration: 0.16, delay: 0.18, volume: 0.03 }
      ]);
      playNoise(0.1, { delay: 0.04, volume: 0.014, frequency: 4600, q: 10 });
    } else if (theme === 'comic') {
      playTone(180, 'square', 0.08, { volume: 0.075, attack: 0.001, filter: { type: 'lowpass', frequency: 900, q: 2 } });
      playTone(360, 'square', 0.08, { delay: 0.08, volume: 0.052, attack: 0.001, filter: { type: 'lowpass', frequency: 1200, q: 2 } });
      playNoise(0.07, { delay: 0.03, volume: 0.045, frequency: 700, q: 1.1 });
    } else if (theme === 'hologram') {
      playThemeSequence([
        { freq: 740, endFreq: 1480, type: 'sine', duration: 0.22, volume: 0.035, attack: 0.03 },
        { freq: 1110, endFreq: 555, type: 'triangle', duration: 0.34, delay: 0.07, volume: 0.024, attack: 0.04 }
      ]);
      playNoise(0.2, { delay: 0.03, volume: 0.015, frequency: 5200, q: 12 });
    } else if (theme === 'vaporwave') {
      playThemeSequence([
        { freq: 261.63, type: 'triangle', duration: 0.35, volume: 0.04, attack: 0.08 },
        { freq: 329.63, type: 'triangle', duration: 0.45, delay: 0.1, volume: 0.032, attack: 0.08 },
        { freq: 392, type: 'sine', duration: 0.6, delay: 0.22, volume: 0.026, attack: 0.1 }
      ]);
    } else if (theme === 'newspaper') {
      playNoise(0.18, { volume: 0.035, frequency: 1700, q: 0.8 });
      playNoise(0.16, { delay: 0.12, volume: 0.028, frequency: 900, q: 0.7 });
      playTone(190, 'triangle', 0.08, { delay: 0.22, volume: 0.018, attack: 0.01 });
    } else if (theme === 'starfield') {
      playTone(110, 'sine', 0.55, { volume: 0.035, attack: 0.08 });
      playTone(880, 'sine', 0.15, { delay: 0.14, volume: 0.024, attack: 0.02 });
      playTone(1320, 'triangle', 0.2, { delay: 0.28, volume: 0.018, attack: 0.03 });
    } else if (theme === 'museum') {
      playThemeSequence([
        { freq: 392, type: 'triangle', duration: 0.45, volume: 0.035, attack: 0.04 },
        { freq: 523.25, type: 'triangle', duration: 0.55, delay: 0.16, volume: 0.03, attack: 0.05 },
        { freq: 659.25, type: 'sine', duration: 0.7, delay: 0.32, volume: 0.022, attack: 0.08 }
      ]);
    } else if (theme === 'storm') {
      playNoise(0.45, { volume: 0.045, frequency: 240, q: 0.6, attack: 0.04 });
      playTone(46, 'sawtooth', 0.5, { delay: 0.06, volume: 0.06, attack: 0.03, filter: { type: 'lowpass', frequency: 360, q: 5 } });
      playNoise(0.05, { delay: 0.18, volume: 0.06, frequency: 5200, q: 3 });
    } else if (theme === 'thermal') {
      playTone(130, 'sine', 0.12, { volume: 0.045, attack: 0.01 });
      playTone(260, 'sine', 0.12, { delay: 0.11, volume: 0.038, attack: 0.01 });
      playTone(520, 'sine', 0.18, { delay: 0.22, volume: 0.03, attack: 0.02 });
    } else if (theme === 'origami') {
      playNoise(0.08, { volume: 0.026, frequency: 2600, q: 6, attack: 0.002 });
      playNoise(0.08, { delay: 0.09, volume: 0.022, frequency: 2100, q: 5, attack: 0.002 });
      playTone(740, 'triangle', 0.18, { delay: 0.16, volume: 0.024, attack: 0.02 });
    } else if (theme === 'tux') {
      playTone(523.25, 'sine', 0.08, { volume: 0.026, attack: 0.005 });
      playTone(1046.5, 'triangle', 0.12, { delay: 0.07, volume: 0.02, attack: 0.01 });
    } else if (theme === 'citadel') {
      const ctx = initAudio();
      if (!ctx) return;
      const rootFreq = 110;
      const partials = [
        { freq: rootFreq * 0.5, vol: 0.1, dec: 2.5 },
        { freq: rootFreq, vol: 0.08, dec: 2.0 },
        { freq: rootFreq * 1.2, vol: 0.05, dec: 1.5 },
        { freq: rootFreq * 1.5, vol: 0.04, dec: 1.2 },
        { freq: rootFreq * 2.0, vol: 0.03, dec: 1.0 },
        { freq: rootFreq * 2.5, vol: 0.02, dec: 0.8 }
      ];
      const startTime = ctx.currentTime;
      partials.forEach(p => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(p.vol, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + p.dec);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + p.dec);
      });
      playNoise(0.1, { volume: 0.03, frequency: 400, q: 1, attack: 0.005 });
    } else if (theme === 'fortress') {
      playTone(90, 'sawtooth', 0.5, { volume: 0.05, attack: 0.03, filter: { type: 'lowpass', frequency: 320, q: 4 } });
      playTone(180, 'triangle', 0.35, { delay: 0.08, volume: 0.035, attack: 0.02 });
      playTone(360, 'triangle', 0.2, { delay: 0.2, volume: 0.02, attack: 0.01 });
    } else if (theme === 'vault') {
      playTone(65, 'sine', 0.65, { volume: 0.06, attack: 0.06 });
      playTone(523.25, 'triangle', 0.3, { delay: 0.15, volume: 0.025, attack: 0.03 });
      playTone(784, 'sine', 0.4, { delay: 0.3, volume: 0.018, attack: 0.05 });
    } else if (theme === 'midcentury') {
      playTone(587.33, 'sine', 0.2, { volume: 0.04, attack: 0.005 });
      playTone(739.99, 'triangle', 0.25, { delay: 0.08, volume: 0.035, attack: 0.005 });
      playTone(880.00, 'sine', 0.35, { delay: 0.16, volume: 0.03, attack: 0.01 });
    } else {
      playTone(440, 'sine', 0.1);
    }
  }

  class ThemeDrawer extends HTMLElement {
    static get observedAttributes() {
      return ['theme', 'look', 'layout', 'lattice', 'layer', 'life', 'scroll-flow', 'inout-flow', 'header-fold', 'heartbeat', 'flap', 'density', 'tabs', 'size', 'lens', 'themes', 'target', 'position', 'label', 'icon', 'sound'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._reflectingTheme = false;
      this._reflectingLifeOption = false;
      this._reflectingSpatialAxis = false;
      this._open = false;
      this._introShown = false;
      this.activeCategory = 'look';

      this._onDocumentPointer = (event) => {
        if (this._open && !event.composedPath().includes(this)) this.open = false;
      };
      this._onDocumentKey = (event) => {
        if (event.key === 'Escape') this.open = false;
      };
      this._onStorage = (event) => {
        this._handlingStorage = true;
        try {
          if (event.key === 'selectedLook' || event.key === 'selectedTheme') {
            if (event.newValue) this.setLook(event.newValue, { persist: false, playAudio: false });
          }
          if (event.key === 'selectedLayout' && event.newValue) {
            this.setLayout(event.newValue, { persist: false });
          }
          if (event.key === 'selectedLattice' && event.newValue) {
            this.setLattice(event.newValue, { persist: false });
          }
          if (event.key === 'selectedLayer' && event.newValue) {
            this.setLayer(event.newValue, { persist: false });
          }
          if (event.key === 'selectedLife' && event.newValue) {
            this.setLife(event.newValue, { persist: false });
          }
          if (event.key === 'selectedScrollFlow' && event.newValue) {
            this.setScrollFlow(event.newValue, { persist: false });
          }
          if (event.key === 'selectedInoutFlow' && event.newValue) {
            this.setInoutFlow(event.newValue, { persist: false });
          }
        } finally {
          this._handlingStorage = false;
        }
      };
    }

    connectedCallback() {
      this._introShown = this.wantsIntro();
      this.render();
      document.addEventListener('pointerdown', this._onDocumentPointer);
      document.addEventListener('keydown', this._onDocumentKey);
      window.addEventListener('storage', this._onStorage);

      const target = this.resolveTarget();
      const initialLook = this.getAttribute('look') || this.getAttribute('theme') ||
                          localStorage.getItem('selectedLook') || localStorage.getItem('selectedTheme') ||
                          target.getAttribute('data-look') || target.getAttribute('data-theme') || 'cyberpunk';

      let storedLayout = localStorage.getItem('selectedLayout');
      const storedLegacyLattice = LEGACY_LAYOUT_LATTICE[storedLayout];
      if (storedLegacyLattice) {
        storedLayout = 'default';
        try {
          localStorage.setItem('selectedLayout', 'default');
          if (!localStorage.getItem('selectedLattice')) {
            localStorage.setItem('selectedLattice', storedLegacyLattice);
          }
        } catch (e) {}
      }

      const requestedLayout = this.getAttribute('layout') || storedLayout ||
                              target.getAttribute('data-layout') || 'default';
      const initialLayout = LEGACY_LAYOUT_LATTICE[requestedLayout] ? 'default' : requestedLayout;
      const initialLattice = this.getAttribute('lattice') ||
                             LEGACY_LAYOUT_LATTICE[requestedLayout] ||
                             localStorage.getItem('selectedLattice') ||
                             storedLegacyLattice ||
                             target.getAttribute('data-lattice') || 'continuous';
      const initialLayer = this.getAttribute('layer') || localStorage.getItem('selectedLayer') ||
                           target.getAttribute('data-layer') || 'inline';

      const initialLife = this.getAttribute('life') || localStorage.getItem('selectedLife') ||
                          target.getAttribute('data-life') || 'pulse';

      const initialScrollFlow = this.getAttribute('scroll-flow') || localStorage.getItem('selectedScrollFlow') ||
                                target.getAttribute('data-scroll-flow') || 'still';

      const initialInoutFlow = this.getAttribute('inout-flow') || localStorage.getItem('selectedInoutFlow') ||
                               target.getAttribute('data-inout-flow') || 'slide';

      const initialDensity = this.getAttribute('density') || localStorage.getItem('selectedDensity') ||
                             target.getAttribute('data-density') || 'cozy';

      const secondary = {
        tabs: this.getAttribute('tabs') || localStorage.getItem('selected-tabs') || target.getAttribute('data-tabs') || 'classic',
        size: this.getAttribute('size') || localStorage.getItem('selected-size') || target.getAttribute('data-size') || 'm',
        lens: this.getAttribute('lens') || localStorage.getItem('selected-lens') || target.getAttribute('data-lens') || 'none'
      };

      this.setLook(initialLook, { persist: false, playAudio: false, emit: false });
      this.setLayout(initialLayout, { persist: false, emit: false });
      this.setLattice(initialLattice, { persist: false, emit: false });
      this.setLayer(initialLayer, { persist: false, emit: false });
      this.setLife(initialLife, { persist: false, emit: false });
      this.setScrollFlow(initialScrollFlow, { persist: false, emit: false });
      this.setInoutFlow(initialInoutFlow, { persist: false, emit: false });
      CUSTOM_EFFECTS.forEach(effect => {
        const stored = localStorage.getItem('selected-' + effect.id);
        const initial = this.hasAttribute(effect.id)
          ? this.getAttribute(effect.id) !== 'false'
          : stored !== null ? stored === 'true' : target.getAttribute('data-' + effect.id) === 'true';
        this.setLifeToggle(effect.id, initial, { persist: false, emit: false });
      });
      this.setDensity(initialDensity, { persist: false, emit: false });
      Object.keys(secondary).forEach(axis => this.setAxis(axis, secondary[axis], { persist: false, emit: false }));
    }

    disconnectedCallback() {
      document.removeEventListener('pointerdown', this._onDocumentPointer);
      document.removeEventListener('keydown', this._onDocumentKey);
      window.removeEventListener('storage', this._onStorage);
      if (this._targetObserver) this._targetObserver.disconnect();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;
      if ((name === 'look' || name === 'theme') && !this._reflectingTheme) {
        this.setLook(newValue, { playAudio: false });
        return;
      }
      if (name === 'layout') {
        if (!this._reflectingSpatialAxis) this.setLayout(newValue);
        return;
      }
      if (name === 'lattice') {
        if (!this._reflectingSpatialAxis) this.setLattice(newValue);
        return;
      }
      if (name === 'layer') {
        if (!this._reflectingSpatialAxis) this.setLayer(newValue);
        return;
      }
      if (name === 'life') {
        this.setLife(newValue);
        return;
      }
      if (name === 'inout-flow' && !this._reflectingLifeOption) {
        this.setInoutFlow(newValue);
      }
      if (name === 'scroll-flow' && !this._reflectingLifeOption) {
        this.setScrollFlow(newValue);
        return;
      }
      if (CUSTOM_EFFECTS.some(effect => effect.id === name) && !this._reflectingLifeOption) {
        this.setLifeToggle(name, newValue !== null && newValue !== 'false');
        return;
      }
      if (name === 'density') {
        this.setDensity(newValue);
        return;
      }
      if (name === 'tabs' || name === 'size' || name === 'lens') {
        this.setAxis(name, newValue);
        return;
      }
      if (name === 'target') {
        this.observeTarget();
        return;
      }
      this.render();
      this.updateSelection();
    }

    get themes() {
      const value = this.getAttribute('themes');
      if (!value) return DEFAULT_LOOKS.slice();
      return value.split(',').map((t) => t.trim()).filter(Boolean);
    }

    get position() {
      const pos = (this.getAttribute('position') || 'top-right').toLowerCase().trim();
      const valid = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'left', 'right', 'top', 'bottom'];
      return valid.includes(pos) ? pos : 'top-right';
    }

    get label() {
      return this.getAttribute('label') || '@Theme';
    }

    get icon() {
      return this.hasAttribute('icon') ? this.getAttribute('icon') : '🖼️';
    }

    get introText() {
      const value = this.getAttribute('intro');
      return value && value !== 'true' ? value : DEFAULT_INTRO;
    }

    wantsIntro() {
      if (!this.hasAttribute('intro') || this.getAttribute('intro') === 'false') return false;
      try { return localStorage.getItem(INTRO_SEEN_KEY) !== 'true'; } catch (e) { return true; }
    }

    dismissIntro() {
      if (!this._introShown) return;
      this._introShown = false;
      try { localStorage.setItem(INTRO_SEEN_KEY, 'true'); } catch (e) {}
      window.removeEventListener('resize', this._placeIntro);
      const intro = this.shadowRoot.querySelector('.intro');
      if (intro) intro.remove();
    }

    /* A page may pin its own furniture in the top layer (atmosphere.html's
       Brand is a popover), which no z-index can clear. Where popovers exist
       the callout joins the top layer too, after the page's own, and is
       placed from the tab's box; elsewhere the CSS places it in the tray. */
    showIntro() {
      const intro = this.shadowRoot.querySelector('.intro');
      if (!intro || typeof intro.showPopover !== 'function') return;
      if (!this._placeIntro) {
        this._placeIntro = () => {
          const current = this.shadowRoot.querySelector('.intro');
          const tab = this.shadowRoot.querySelector('.tab');
          if (!current || !tab) return;
          const box = tab.getBoundingClientRect();
          const gap = 10;
          const style = current.style;
          style.top = style.right = style.bottom = style.left = 'auto';
          const pos = this.position;
          if (pos === 'top' || pos === 'bottom') {
            style.left = Math.max(gap, box.left + box.width / 2 - current.offsetWidth / 2) + 'px';
            if (pos === 'top') style.top = (box.bottom + gap) + 'px';
            else style.bottom = (window.innerHeight - box.top + gap) + 'px';
            return;
          }
          if (pos.indexOf('left') !== -1) style.left = (box.right + gap) + 'px';
          else style.right = (window.innerWidth - box.left + gap) + 'px';
          if (pos.indexOf('bottom') === 0) style.bottom = (window.innerHeight - box.bottom) + 'px';
          else style.top = box.top + 'px';
        };
      }
      clearTimeout(this._introTimer);
      this._introTimer = setTimeout(() => {
        const current = this.shadowRoot.querySelector('.intro');
        if (!this._introShown || !this.isConnected || !current) return;
        try { current.showPopover(); } catch (e) { return; }
        this._placeIntro();
        window.addEventListener('resize', this._placeIntro, { passive: true });
      }, 900);
    }

    get sound() {
      return this.getAttribute('sound') !== 'false';
    }

    get look() {
      return this.getAttribute('look') || this.getAttribute('theme') || 'cyberpunk';
    }
    set look(value) { this.setLook(value); }

    get theme() { return this.look; }
    set theme(value) { this.setLook(value); }

    get layout() {
      return this.getAttribute('layout') || 'default';
    }
    set layout(value) { this.setLayout(value); }

    get lattice() {
      return this.getAttribute('lattice') || 'continuous';
    }
    set lattice(value) { this.setLattice(value); }

    get layer() {
      return this.getAttribute('layer') || 'inline';
    }
    set layer(value) { this.setLayer(value); }

    get life() {
      return this.getAttribute('life') || 'pulse';
    }
    set life(value) { this.setLife(value); }

    get scrollFlow() { return this.getAttribute('scroll-flow') || 'still'; }
    set scrollFlow(value) { this.setScrollFlow(value); }

    get inoutFlow() { return this.getAttribute('inout-flow') || 'slide'; }
    set inoutFlow(value) { this.setInoutFlow(value); }

    lifeToggle(id) { return this.getAttribute(id) === 'true'; }

    get density() {
      return this.getAttribute('density') || 'cozy';
    }
    set density(value) { this.setDensity(value); }

    get tabs() { return this.getAttribute('tabs') || 'classic'; }
    set tabs(value) { this.setAxis('tabs', value); }

    get size() { return this.getAttribute('size') || 'm'; }
    set size(value) { this.setAxis('size', value); }

    get lens() { return this.getAttribute('lens') || 'none'; }
    set lens(value) { this.setAxis('lens', value); }

    lensSeeds(id) {
      const entry = LENS_THEMES.filter(item => item.id === id)[0];
      return entry ? entry.seeds : null;
    }

    /* The pools a shuffle can draw from. Exposed so the page can randomise a
       composition without duplicating the option lists. */
    axisOptions() {
      return {
        look: this.themes.slice(),
        layout: LAYOUT_THEMES.filter(i => i.id).map(i => i.id),
        lattice: LATTICE_THEMES.map(i => i.id),
        layer: LAYER_THEMES.map(i => i.id),
        life: MICRO_MOTION_THEMES.map(i => i.id),
        scrollFlow: SCROLL_FLOW_THEMES.map(i => i.id),
        inoutFlow: INOUT_FLOW_THEMES.map(i => i.id),
        density: DENSITY_THEMES.map(i => i.id),
        tabs: TAB_THEMES.map(i => i.id),
        size: SIZE_THEMES.map(i => i.id)
      };
    }

    get open() { return this._open; }
    set open(value) {
      this._open = Boolean(value);
      if (this._open) this.dismissIntro();
      const tray = this.shadowRoot.querySelector('.tray');
      const tab = this.shadowRoot.querySelector('.tab');
      if (tray) tray.classList.toggle('is-open', this._open);
      if (tab) tab.setAttribute('aria-expanded', String(this._open));
      this.toggleAttribute('open', this._open);
    }

    resolveTarget() {
      const selector = this.getAttribute('target');
      if (!selector) return document.body;
      try {
        return this.closest(selector) ||
          (this.getRootNode().querySelector && this.getRootNode().querySelector(selector)) ||
          document.querySelector(selector) || document.body;
      } catch (error) {
        return document.body;
      }
    }

    observeTarget() {
      if (this._targetObserver) this._targetObserver.disconnect();
      const target = this.resolveTarget();
      this._targetObserver = new MutationObserver(() => {
        const lookVal = target.getAttribute('data-look') || target.getAttribute('data-theme');
        const layoutVal = target.getAttribute('data-layout');
        const latticeVal = target.getAttribute('data-lattice');
        const layerVal = target.getAttribute('data-layer');
        const lifeVal = target.getAttribute('data-life');
        const legacyLattice = LEGACY_LAYOUT_LATTICE[layoutVal];
        if (lookVal && lookVal !== this.look) this.reflectTheme(lookVal);
        if (layoutVal && layoutVal !== this.layout) this.setLayout(layoutVal, { persist: false, emit: false });
        if (!legacyLattice && latticeVal && latticeVal !== this.lattice) {
          this.setLattice(latticeVal, { persist: false, emit: false });
        }
        if (layerVal && layerVal !== this.layer) this.setLayer(layerVal, { persist: false, emit: false });
        if (lifeVal && lifeVal !== this.life) this.setLife(lifeVal, { persist: false, emit: false });
      });
      this._targetObserver.observe(target, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-look', 'data-layout', 'data-lattice', 'data-layer', 'data-life']
      });
    }

    updateMetaThemeColor() {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      requestAnimationFrame(() => {
        const computedBg = getComputedStyle(document.body).getPropertyValue('--bg').trim();
        if (computedBg) {
          meta.setAttribute('content', computedBg);
        }
      });
    }

    setLook(lookName, options) {
      const next = String(lookName || '').trim();
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true, playAudio: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-look', next);
      target.setAttribute('data-theme', next);
      document.documentElement.setAttribute('data-look', next);
      document.documentElement.setAttribute('data-theme', next);
      if (target !== document.body) {
        document.body.setAttribute('data-look', next);
        document.body.setAttribute('data-theme', next);
      }

      this.updateMetaThemeColor();
      const foundCat = LOOK_CATEGORIES.find(c => c.themes.includes(next));
      if (foundCat) {
        this._expandedLookCategory = foundCat.id;
      }
      this.reflectTheme(next);
      this.observeTarget();

      if (settings.persist) {
        try {
          localStorage.setItem('selectedLook', next);
          localStorage.setItem('selectedTheme', next);
        } catch (e) {}
      }

      if (settings.playAudio && this.sound) {
        playSoundForTheme(next);
      }

      if (settings.emit) this.emitChangeEvent();
    }

    setLayout(layoutName, options) {
      let next = String(layoutName || '').trim();
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true }, options);
      const legacyLattice = LEGACY_LAYOUT_LATTICE[next];
      if (legacyLattice) {
        this.setLattice(legacyLattice, { persist: settings.persist, emit: false });
        next = 'default';
      }
      const target = this.resolveTarget();

      target.setAttribute('data-layout', next);
      document.documentElement.setAttribute('data-layout', next);
      if (target !== document.body) document.body.setAttribute('data-layout', next);

      this._reflectingSpatialAxis = true;
      this.setAttribute('layout', next);
      this._reflectingSpatialAxis = false;
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selectedLayout', next); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    setLattice(latticeName, options) {
      const next = String(latticeName || '').trim();
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-lattice', next);
      document.documentElement.setAttribute('data-lattice', next);
      if (target !== document.body) document.body.setAttribute('data-lattice', next);

      this._reflectingSpatialAxis = true;
      this.setAttribute('lattice', next);
      this._reflectingSpatialAxis = false;
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selectedLattice', next); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    setLayer(layerName, options) {
      const requested = String(layerName || '').trim();
      const next = LEGACY_LAYER[requested] || requested;
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-layer', next);
      document.documentElement.setAttribute('data-layer', next);
      if (target !== document.body) document.body.setAttribute('data-layer', next);

      this._reflectingSpatialAxis = true;
      this.setAttribute('layer', next);
      this._reflectingSpatialAxis = false;
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selectedLayer', next); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    setLife(lifeName, options) {
      const next = String(lifeName || '').trim();
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-life', next);
      document.documentElement.setAttribute('data-life', next);
      if (target !== document.body) document.body.setAttribute('data-life', next);

      this.setAttribute('life', next);
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selectedLife', next); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    setInoutFlow(flowName, options) {
      const next = String(flowName || '').trim();
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-inout-flow', next);
      document.documentElement.setAttribute('data-inout-flow', next);
      if (target !== document.body) document.body.setAttribute('data-inout-flow', next);

      this._reflectingLifeOption = true;
      this.setAttribute('inout-flow', next);
      this._reflectingLifeOption = false;
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selectedInoutFlow', next); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    setScrollFlow(flowName, options) {
      const next = String(flowName || '').trim();
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-scroll-flow', next);
      document.documentElement.setAttribute('data-scroll-flow', next);
      if (target !== document.body) document.body.setAttribute('data-scroll-flow', next);

      this._reflectingLifeOption = true;
      this.setAttribute('scroll-flow', next);
      this._reflectingLifeOption = false;
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selectedScrollFlow', next); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    setLifeToggle(id, enabled, options) {
      if (!CUSTOM_EFFECTS.some(effect => effect.id === id)) return;
      const active = Boolean(enabled);
      const settings = Object.assign({ persist: true, emit: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-' + id, String(active));
      document.documentElement.setAttribute('data-' + id, String(active));
      if (target !== document.body) document.body.setAttribute('data-' + id, String(active));

      this._reflectingLifeOption = true;
      this.setAttribute(id, String(active));
      this._reflectingLifeOption = false;
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selected-' + id, String(active)); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    setAxis(axis, value, options) {
      const next = String(value || '').trim();
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-' + axis, next);
      document.documentElement.setAttribute('data-' + axis, next);
      if (target !== document.body) document.body.setAttribute('data-' + axis, next);

      this.setAttribute(axis, next);
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selected-' + axis, next); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    setDensity(densityName, options) {
      const next = String(densityName || '').trim();
      if (!next) return;
      const settings = Object.assign({ persist: true, emit: true }, options);
      const target = this.resolveTarget();

      target.setAttribute('data-density', next);
      document.documentElement.setAttribute('data-density', next);
      if (target !== document.body) document.body.setAttribute('data-density', next);

      this.setAttribute('density', next);
      this.updateSelection();

      if (settings.persist) {
        try { localStorage.setItem('selectedDensity', next); } catch (e) {}
      }
      if (settings.emit) this.emitChangeEvent();
    }

    /* Choosing a lens SEEDS the axes -- it does not lock them. Everything the
       seeds touch is then free to be changed; at.lens.css keeps supplying
       the pacing and temperament that no single axis owns. */
    applyLens(id, options) {
      const settings = Object.assign({ transition: true, emit: true, playAudio: true }, options);
      const seeds = this.lensSeeds(id);
      const commit = () => {
        this.setAxis('lens', id, { emit: false });
        if (seeds) {
          this.setLook(seeds.look, { playAudio: false, emit: false });
          this.setLayout(seeds.layout, { emit: false });
          this.setLattice(seeds.lattice || 'continuous', { emit: false });
          this.setLayer(seeds.layer || 'inline', { emit: false });
          this.setLife(seeds.life, { emit: false });
          this.setScrollFlow(seeds.scrollFlow || 'still', { emit: false });
          this.setInoutFlow(seeds.inoutFlow || 'slide', { emit: false });
          this.setDensity(seeds.density, { emit: false });
          this.setAxis('size', seeds.size, { emit: false });
          this.setAxis('tabs', seeds.tabs, { emit: false });
        }
        this.updateSelection();
        if (settings.emit) this.emitChangeEvent();
      };

      if (settings.transition && typeof window.applyWithCrossing === 'function') {
        window.applyWithCrossing(commit, 'look');
      } else {
        commit();
      }
      if (seeds && settings.playAudio) playSoundForTheme(seeds.look);
    }

    setTheme(themeName, options) {
      this.setLook(themeName, options);
    }

    reflectTheme(lookVal) {
      const foundCat = LOOK_CATEGORIES.find(c => c.themes.includes(lookVal));
      if (foundCat) {
        this._expandedLookCategory = foundCat.id;
      }
      this._reflectingTheme = true;
      this.setAttribute('look', lookVal);
      this.setAttribute('theme', lookVal);
      this._reflectingTheme = false;
      this.updateSelection();
    }

    emitChangeEvent() {
      this.dispatchEvent(new CustomEvent('themechange', {
        bubbles: true,
        composed: true,
        detail: {
          source: this._handlingStorage ? 'storage' : 'controls',
          look: this.look,
          layout: this.layout,
          lattice: this.lattice,
          layer: this.layer,
          life: this.life,
          scrollFlow: this.scrollFlow,
          inoutFlow: this.inoutFlow,
          headerFold: this.lifeToggle('header-fold'),
          heartbeat: this.lifeToggle('heartbeat'),
          flap: this.lifeToggle('flap'),
          density: this.density,
          tabs: this.tabs,
          size: this.size,
          lens: this.lens,
          theme: this.look,
          target: this.resolveTarget()
        }
      }));
    }

    displayName(theme) {
      return LABELS[theme] || theme.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    markForTheme(theme) {
      return MARKS[theme] || 'ON';
    }

    renderIconHtml() {
      const iconVal = this.icon;
      if (!iconVal) return '';
      if (isImageUrl(iconVal)) {
        return `<img src="${escapeHtml(iconVal)}" class="tab-icon-img" alt="" />`;
      }
      return `<span class="tab-icon-emoji">${escapeHtml(iconVal)}</span>`;
    }

    renderOptionList(items, type, activeValue) {
      return items.map((item) => {
        if (item.group) {
          return '<p class="group-label">' + escapeHtml(item.group) + '</p>';
        }
        const selected = item.id === activeValue;
        return '<button class="theme' + (selected ? ' is-selected' : '') + '" type="button" data-type="' + type + '" data-value="' + escapeHtml(item.id) + '" aria-pressed="' + selected + '">' +
          '<span>' + escapeHtml(item.label) + '</span>' +
          '<span class="mark">' + escapeHtml(item.mark) + '</span>' +
        '</button>';
      }).join('');
    }

    renderToggleList(items) {
      return items.map(item => {
        const selected = this.lifeToggle(item.id);
        return '<button class="theme toggle' + (selected ? ' is-selected' : '') + '" type="button" data-type="life-toggle" data-value="' + escapeHtml(item.id) + '" aria-pressed="' + selected + '">' +
          '<span>' + escapeHtml(item.label) + '</span>' +
          '<span class="mark">' + escapeHtml(selected ? item.mark : 'OFF') + '</span>' +
        '</button>';
      }).join('');
    }

    renderMenuContent() {
      const cat = this.activeCategory;
      if (cat === 'layout') {
        return this.renderOptionList([{ group: 'Spacing' }].concat(DENSITY_THEMES), 'density', this.density) +
               this.renderOptionList([{ group: 'Tabs' }].concat(TAB_THEMES), 'tabs', this.tabs) +
               this.renderOptionList([{ group: 'Structure' }].concat(LAYOUT_THEMES), 'layout', this.layout);
      } else if (cat === 'lattice') {
        return this.renderOptionList(LATTICE_THEMES, 'lattice', this.lattice);
      } else if (cat === 'layer') {
        return this.renderOptionList(LAYER_THEMES, 'layer', this.layer) +
               '<p class="group-label">Header</p>' +
               this.renderToggleList(CUSTOM_EFFECTS.filter(effect => effect.category === cat));
      } else if (cat === 'life') {
        return '<p class="group-label">Micro-motion</p>' +
               this.renderOptionList(MICRO_MOTION_THEMES, 'life', this.life) +
               '<p class="group-label">Scroll flow</p>' +
               this.renderOptionList(SCROLL_FLOW_THEMES, 'scroll-flow', this.scrollFlow) +
               '<p class="group-label">In/out flow</p>' +
               this.renderOptionList(INOUT_FLOW_THEMES, 'inout-flow', this.inoutFlow) +
               '<p class="group-label">Custom effects</p>' +
               this.renderToggleList(CUSTOM_EFFECTS.filter(effect => effect.category === cat));
      } else if (cat === 'lens') {
        return this.renderOptionList(LENS_THEMES, 'lens', this.lens);
      } else {
        const sizeRow = '<p class="group-label">Sizing</p><div class="size-row">' +
          SIZE_THEMES.map((item) => {
            const selected = item.id === this.size;
            return '<button class="size' + (selected ? ' is-selected' : '') + '" type="button" data-type="size" data-value="' +
              escapeHtml(item.id) + '" aria-pressed="' + selected + '">' + escapeHtml(item.label) + '</button>';
          }).join('') + '</div><p class="group-label">@Theme Categories</p>';

        let activeCatId = this._expandedLookCategory;
        if (!activeCatId) {
          const found = LOOK_CATEGORIES.find(c => c.themes.includes(this.look));
          activeCatId = found ? found.id : LOOK_CATEGORIES[0].id;
          this._expandedLookCategory = activeCatId;
        }

        const categorizedThemes = new Set(LOOK_CATEGORIES.flatMap(c => c.themes));
        const customThemes = this.themes.filter(t => !categorizedThemes.has(t));

        const treeHtml = '<div class="look-tree">' +
          LOOK_CATEGORIES.map(cat => {
            const isExpanded = cat.id === activeCatId;
            const availableThemes = cat.themes.filter(t => this.themes.includes(t));
            if (availableThemes.length === 0) return '';

            const childButtons = availableThemes.map(theme => {
              const selected = theme === this.look;
              return '<button class="theme' + (selected ? ' is-selected' : '') + '" type="button" data-type="look" data-value="' + escapeHtml(theme) + '" aria-pressed="' + selected + '">' +
                '<span>' + escapeHtml(this.displayName(theme)) + '</span>' +
                '<span class="mark">' + escapeHtml(this.markForTheme(theme)) + '</span>' +
              '</button>';
            }).join('');

            return '<div class="tree-node' + (isExpanded ? ' is-expanded' : '') + '">' +
              '<button class="tree-node-header" type="button" data-type="look-tree-node" data-category="' + escapeHtml(cat.id) + '" aria-expanded="' + isExpanded + '">' +
                '<span class="tree-node-title">' + escapeHtml(cat.label) + '</span>' +
                '<span class="tree-node-count">' + availableThemes.length + '</span>' +
                '<span class="tree-arrow">' + (isExpanded ? '▼' : '▶') + '</span>' +
              '</button>' +
              '<div class="tree-node-children"' + (isExpanded ? '' : ' hidden') + '>' +
                childButtons +
              '</div>' +
            '</div>';
          }).join('') +
          (customThemes.length > 0 ? (
            '<div class="tree-node' + (activeCatId === 'custom' ? ' is-expanded' : '') + '">' +
              '<button class="tree-node-header" type="button" data-type="look-tree-node" data-category="custom" aria-expanded="' + (activeCatId === 'custom') + '">' +
                '<span class="tree-node-title">Custom</span>' +
                '<span class="tree-node-count">' + customThemes.length + '</span>' +
                '<span class="tree-arrow">' + (activeCatId === 'custom' ? '▼' : '▶') + '</span>' +
              '</button>' +
              '<div class="tree-node-children"' + (activeCatId === 'custom' ? '' : ' hidden') + '>' +
                customThemes.map(theme => {
                  const selected = theme === this.look;
                  return '<button class="theme' + (selected ? ' is-selected' : '') + '" type="button" data-type="look" data-value="' + escapeHtml(theme) + '" aria-pressed="' + selected + '">' +
                    '<span>' + escapeHtml(this.displayName(theme)) + '</span>' +
                    '<span class="mark">' + escapeHtml(this.markForTheme(theme)) + '</span>' +
                  '</button>';
                }).join('') +
              '</div>' +
            '</div>'
          ) : '') +
        '</div>';

        return sizeRow + treeHtml;
      }
    }

    render() {
      const label = this.label;
      const posClass = `pos-${this.position}`;
      const iconHtml = this.renderIconHtml();

      this.shadowRoot.innerHTML =
        '<link rel="stylesheet" href="' + stylesheetUrl + '">' +
        '<div class="tray ' + posClass + '">' +
          '<button class="tab" type="button" aria-expanded="false" aria-controls="atheme-drawer-panel">' +
            '<span class="tab-icon">' + iconHtml + '</span>' +
            '<span class="tab-label">' + escapeHtml(label) + '</span>' +
          '</button>' +
          '<aside class="panel" id="atheme-drawer-panel" aria-label="' + escapeHtml(label) + '">' +
            '<div class="head">' +
              '<span class="title">' + escapeHtml(label) + '</span>' +
              '<button class="close" type="button" aria-label="Close theme drawer">×</button>' +
            '</div>' +
            '<nav class="category-nav" aria-label="Theme dimensions">' +
              '<button class="category-btn ' + (this.activeCategory === 'layout' ? 'is-active' : '') + '" type="button" data-cat="layout">Layout</button>' +
              '<button class="category-btn ' + (this.activeCategory === 'lattice' ? 'is-active' : '') + '" type="button" data-cat="lattice">Lattice</button>' +
              '<button class="category-btn ' + (this.activeCategory === 'layer' ? 'is-active' : '') + '" type="button" data-cat="layer">Layer</button>' +
              '<button class="category-btn ' + (this.activeCategory === 'look' ? 'is-active' : '') + '" type="button" data-cat="look">Look</button>' +
              '<button class="category-btn ' + (this.activeCategory === 'life' ? 'is-active' : '') + '" type="button" data-cat="life">Life</button>' +
              '<button class="category-btn ' + (this.activeCategory === 'lens' ? 'is-active' : '') + '" type="button" data-cat="lens">Lens</button>' +
            '</nav>' +
            '<div class="menu">' + this.renderMenuContent() + '</div>' +
            '<div class="drawer-actions">' +
              '<button class="action" type="button" data-action="shuffle" title="Random composition">\u2684 Shuffle</button>' +
              '<button class="action" type="button" data-action="share" title="Copy a link to this composition">\u{1F517} Copy link</button>' +
            '</div>' +
          '</aside>' +
          (this._introShown
            ? '<div class="intro"' + (HTMLElement.prototype.showPopover ? ' popover="manual"' : '') +
                ' role="note" aria-labelledby="atheme-intro-title">' +
                '<strong class="intro-title" id="atheme-intro-title">Make this page your own</strong>' +
                '<p class="intro-text">' + escapeHtml(this.introText) + '</p>' +
                '<div class="intro-actions">' +
                  '<button class="intro-open" type="button">Show me</button>' +
                  '<button class="intro-dismiss" type="button">Got it</button>' +
                '</div>' +
              '</div>'
            : '') +
        '</div>';

      this.shadowRoot.querySelector('.tab').addEventListener('click', () => { this.open = !this.open; });
      if (this._introShown) {
        this.shadowRoot.querySelector('.intro-open').addEventListener('click', () => { this.open = true; });
        this.shadowRoot.querySelector('.intro-dismiss').addEventListener('click', () => this.dismissIntro());
        this.showIntro();
      }
      this.shadowRoot.querySelector('.close').addEventListener('click', () => { this.open = false; });

      this.shadowRoot.querySelectorAll('.category-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeCategory = btn.dataset.cat;
          this.render();
        });
      });

      this.attachMenuListeners();
      this.attachActionListeners();
      this.open = this._open;
    }

    /* Discovery and sharing: millions of compositions are useless if you cannot
       stumble onto a good one or send it to anybody. */
    attachActionListeners() {
      const shuffle = this.shadowRoot.querySelector('[data-action="shuffle"]');
      const share = this.shadowRoot.querySelector('[data-action="share"]');

      if (shuffle) {
        shuffle.addEventListener('click', () => {
          if (typeof window.shuffleComposition === 'function') window.shuffleComposition();
        });
      }

      if (share) {
        share.addEventListener('click', () => {
          if (typeof window.copyCompositionLink !== 'function') return;
          const original = share.textContent;
          window.copyCompositionLink()
            .then(() => { share.textContent = '\u2713 Copied'; })
            .catch(() => { share.textContent = 'Press \u2318C'; })
            .then(() => setTimeout(() => { share.textContent = original; }, 1600));
        });
      }
    }

    attachMenuListeners() {
      this.shadowRoot.querySelectorAll('[data-type="look-tree-node"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const catId = btn.dataset.category;
          this._expandedLookCategory = (this._expandedLookCategory === catId) ? null : catId;
          this.updateSelection();
          playSoundForTheme('origami');
        });
      });

      this.shadowRoot.querySelectorAll('.theme, .size').forEach((button) => {
        button.addEventListener('click', () => {
          const type = button.dataset.type;
          const val = button.dataset.value;
          if (type === 'look') {
            this.setLook(val, { playAudio: true });
          } else if (type === 'layout') {
            this.setLayout(val);
            playSoundForTheme('blueprint');
          } else if (type === 'lattice') {
            this.setLattice(val);
            playSoundForTheme('blueprint');
          } else if (type === 'layer') {
            this.setLayer(val);
            playSoundForTheme('origami');
          } else if (type === 'life') {
            this.setLife(val);
            playSoundForTheme('hologram');
          } else if (type === 'scroll-flow') {
            this.setScrollFlow(val);
            playSoundForTheme('hologram');
          } else if (type === 'inout-flow') {
            this.setInoutFlow(val);
            playSoundForTheme('origami');
          } else if (type === 'life-toggle') {
            this.setLifeToggle(val, !this.lifeToggle(val));
            playSoundForTheme('hologram');
          } else if (type === 'density') {
            this.setDensity(val);
            playSoundForTheme('origami');
          } else if (type === 'tabs' || type === 'size') {
            this.setAxis(type, val);
            playSoundForTheme('tux');
          } else if (type === 'lens') {
            this.applyLens(val);
          }
          this.updateSelection();
        });
      });
    }

    updateSelection() {
      const menu = this.shadowRoot.querySelector('.menu');
      if (menu) menu.innerHTML = this.renderMenuContent();
      this.attachMenuListeners();

      const catBtns = this.shadowRoot.querySelectorAll('.category-btn');
      catBtns.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.cat === this.activeCategory);
      });
    }
  }

  if (!customElements.get('atheme-drawer')) customElements.define('atheme-drawer', ThemeDrawer);
  if (!customElements.get('atheme-tray')) customElements.define('atheme-tray', class extends ThemeDrawer {});

  window.ThemeDrawer = ThemeDrawer;
})();

/**
 * Copyright © 2026 MENTIC LLC
 * Created by Matthew Quarneri
 *
 * Dual licensed under AGPL-3.0 or a MENTIC LLC commercial license.
 * See LICENSE for licensing terms.
 */
