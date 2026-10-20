# Working in a project that has the Atmosphere sheets

Read this before editing anything when the project links `at.*.css` or runs `atmosphere.js`. Those files are shared by several pages, so a change made for one page lands on all of them.

## Contents

- [Find the authority](#find-the-authority)
- [The files](#the-files)
- [The skeleton](#the-skeleton)
- [What the controller already does](#what-the-controller-already-does)
- [Adding to a page](#adding-to-a-page)
- [Adding to a sheet](#adding-to-a-sheet)
- [Adding a look, a value or an axis](#adding-a-look-a-value-or-an-axis)
- [Verifying](#verifying)

## Find the authority

If the Atmosphere repository's `README.md` and `docs/VOCABULARY.md` are reachable, they are the authority: over this skill, and over the comments at the top of the sheets, some of which predate the current model and still say plan, planes and path. When a sheet comment and the README disagree, follow the README. The demo pages prove ideas and may contain prototype shortcuts; do not copy an inline style or a full rerender just because a demo has one.

## The files

| File | Role |
|---|---|
| `css/at.components.css` | parts' own shapes |
| `css/at.layout.css` | the document grid and its regions |
| `css/at.lattice.css` | frames, scrollports, pacing, the camera |
| `css/at.layer.css` | projections: which frames leave the plan and where they land |
| `css/at.look.css` | 31 look profiles and the shared paint |
| `css/at.life.css` | motion scores, flows, view transitions |
| `css/at.lens.css` | experience policy: seeds and pacing tokens |
| `css/at.local.css` | the local scale; loads last |
| `css/at.docs.*.css` | extensions for the demo pages only |
| `js/atmosphere.js` | the controller |
| `webcomp/atheme-drawer.js`, `atheme-tray.js` | the theme drawer and tray |

## The skeleton

```html
<link rel="stylesheet" href="css/at.components.css">
<link rel="stylesheet" href="css/at.layout.css">
<link rel="stylesheet" href="css/at.lattice.css">
<link rel="stylesheet" href="css/at.layer.css">
<link rel="stylesheet" href="css/at.look.css">
<link rel="stylesheet" href="css/at.life.css">
<link rel="stylesheet" href="css/at.lens.css">
<link rel="stylesheet" href="css/at.local.css">

<body class="Layout"
      data-layout="default" data-lattice="continuous" data-layer="inline"
      data-look="blueprint" data-life="pulse" data-lens="none"
      data-density="cozy" data-size="m">
  <header class="Header" data-role="masthead">...</header>
  <main class="Main" data-frame="root">
    <div class="main-shell" data-track>
      <section data-view="stage">...</section>
      <section data-view>...</section>
    </div>
  </main>
  <footer class="Footer">...</footer>
  <script src="js/atmosphere.js"></script>
</body>
```

This is an inline reading page. Drawers need authored panels and invokers, and tabs and dialogs need their interaction contracts. Composition attributes select a presentation; they do not invent behaviour or replace native HTML semantics.

Two rules in the Layout sheet are easy to undo by accident:

1. A region whose grid area is not named by the active `--grid-areas` must be `display: none`, or it spawns an implicit track and takes width from `.Main`.
2. `.Surface` is the look's canvas and lives outside `.Main`, because `.Main` becomes a scroll container when a Lattice asks it to, and a texture inside it would scroll away with the content.

## What the controller already does

Use these hooks instead of writing new script.

| You write | The controller does |
|---|---|
| `data-compose="lattice:app;layer:top-left-edge-drawer;density:compact"` on a button | Applies those axis values as ordinary swaps. There is no preset state: a preset is a direction, and every axis stays independently movable afterwards. |
| `data-layout-option="stacked"` (likewise `-lattice-`, `-layer-`, `-life-`, `-density-`, `-size-`, `-tabs-`, `-lens-`) | Keeps `aria-pressed` and `.is-selected` in step with the live composition. |
| `data-readout="lattice"` | Fills the element with the current value of that axis. |
| `.tab-set` with `role="tab"` children | The full ARIA tabs pattern: roving `tabindex`, arrows, Home and End. |
| `[data-layer-panel]` with a `[data-layer-trigger]` invoker | Promotes the panel to a native popover when `data-layer` asks for a projection, and adds `data-layer-ready`. |

It also mirrors every axis attribute onto `<html>` and `<body>`, writes the composition to the URL (`#at=...` is the compact form; the long named form stays readable), and publishes facts CSS cannot ask for:

- `--masthead-size` - the laid-out height of `[data-role="masthead"]`.
- `--layer-controls-size` - the width of the projection invokers.
- `--lattice-count` - how many views a frame holds.

## Adding to a page

- **Declare a semantic contract first.** Name the instance where referenced, reusable kind, place, required/optional parts, roles, real states, bounded constraints, state owner, and supported compositions. See `semantic-contract.md`. Add scoped part consumers to the appropriate concern sheets; labels alone do not prove composition.
- **A new section** in the root frame is a `data-view` inside the track, with a `--lattice-index` giving its place in the sequence. Give it a semantic kind and reference ID where needed; add the kind to the section grid rule in the Layout sheet when required.
- **Each root view is a container named `panel`.** A component inside one responds to its real width with `@container panel (...)`.
- **A control that changes an axis** is a button with `data-compose` and the matching `data-<axis>-option`. Do not write a click handler for it.
- **A panel that can go on call** is authored inline as a region with `data-layer-panel`, and its invoker is authored `hidden`. A control for a capability the page does not have is a dead control.
- **Region classes are capitalised and load-bearing.** It is `.Footer`, not `.footer`.

The demonstration package also includes `at.app.*.css` for the IDE's semantic
places and source-document parts, `at.tutorial.*.css` for lesson composition,
and `at.presentation.*.css` for reusable shadow components. The latter expose
native `part` hooks and receive an explicit `.model` property. They author
interactive nodes once, reconcile task rows by ID, and clean up model subscriptions
on disconnect. `tutorial.html` and `UI.html` share those components.

## Adding to a sheet

- **Each sheet writes only its own properties** and hands everything else over as a token. See `filing.md`.
- **Scope a region rule by what the element is** (`[data-role="masthead"]`, `[data-place="footer"]`), never by a preset name. "Slide deck" and "Panel app" are coordinates, not states.
- **Touching an existing selector:** add guards as `:where(:not(...))`, so the rule's specificity does not move and nothing downstream starts winning or losing.
- **A new handshake token** should rest at an identity value, so the pages that never move it are unchanged.
- **A motion two sheets take part in** must be withheld under the same conditions in both: the same Lattice list, the same `prefers-reduced-motion` and `data-life="still"` behaviour.
- **Check that a rule you are editing is live.** A block comment closed early turns the prose after it into a broken selector that silently swallows the next rule. Confirm with a computed style that the rule applies before you rely on it.
- **Leave misfiled rules where they are** unless asked to move them. The sheets do not fully obey the filing table yet, and moving a rule changes load order.

## Adding a look, a value or an axis

- **A look** is a profile: token values under `[data-theme="name"]`, plus whatever it paints on `.Surface` and the shared text hooks (`.title-text`, `.header-text`, `.body-text`). It must declare `--face-aspect`, because Layout budgets width in rem and only the look knows how wide its typeface runs. It may not set `position`, `overflow`, `display` or `padding` on a region, and its ambient animation must run on `--look-motion` so Life can stop it.
- **The value lists are append-only.** `AT_CODEBOOK` in `js/atmosphere.js` and the menus in `webcomp/atheme-drawer.js` must stay in the same order. Add a new value at the end, or every existing compact URL renumbers.
- **A new axis or toggle** has to be added in each place the composition is read, written, stored and mirrored. Search for an existing one (for example `headerFold` and `data-header-fold`) and follow it through every file.

## Verifying

- **Sweep every page that links the shared sheets,** not only the one you were asked about, and each composition the page offers as a preset. Their regions hold different things.
- **Measure, do not eyeball.** Report before and after boxes (`getBoundingClientRect`, computed `grid-template-rows`) for the regions you touched.
- **Finish frozen transitions before measuring.** In a background or headless tab, transitions and `requestAnimationFrame` can stall, so a closed drawer may still report `display: grid`. Call `document.getAnimations().forEach(a => a.finish())` for document-timeline animations first.
- **Scroll-driven effects need real frames.** Their progress updates when a frame is produced, so a measurement taken in the same task as the scroll reads the old value.
- **Bust the cache** after editing a sheet or script when a static server is in use; a plain reload can serve the old file.
