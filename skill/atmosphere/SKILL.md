---
name: atmosphere
description: Design, refactor, or review atmospheric pages and Web Components using stable semantic composition contracts and CSS concern sheets. Use for Atmosphere/@mosphere work, at.*.css refactors, or interfaces that preserve meaning and working state across Looks, densities, projections, and presentation modes.
license: Copyright 2026 MENTIC LLC. Dual licensed under AGPL-3.0-or-later or a MENTIC LLC commercial license.
---

# Atmosphere

> Describe the meaning once. Compose how people encounter it.

Atmosphere composes presentation against stable semantic addresses. Its CSS
filing rule supports that authoring contract. Something is **atmospheric** when
three things are true of it:

1. **Meaning and meaningful parts have a stable contract.** Identity, kind,
   place, part, role, state, and bounded constraints remain distinct. Markup names
   responsibilities; concern sheets decide their presentation.
2. **Every declaration has one home**: the sheet whose question it answers. Each sheet is forbidden the others' jobs.
3. **Sheets meet only at tokens and semantic addresses.** No sheet names another sheet's profiles, and none names a component it does not own.

The forbidding is the point. Because Look may not place anything and Layout may not paint anything, any look works with any layout, any traversal and any motion, and one document can be read as an article, a dashboard, a slide deck or a panel app without a second copy of its markup. Every shortcut across a boundary removes combinations that used to work, usually without anyone noticing at the time.

## Start here

Work out which of three jobs this is, because they begin differently.

- **The project already uses Atmosphere** (it links `at.*.css`, has `class="Layout"` on the body, or sets `data-layout` / `data-lattice` / `data-look`). Extend what is there: reuse its tokens, roles and locals, and add declarations to its existing sheets. Read `references/reference-implementation.md` before editing, since those sheets are shared by several pages.
- **The project does not.** Apply the method to the project's own CSS. Create concern sheets with the project's prefix (`app.layout.css`, `app.look.css`, ...) for only the concerns the work touches. One look is enough; what matters is that it is filed as a look. `assets/skeleton.html` is a starting document.
- **You were asked to review.** Use the checks at the end and report findings grouped by concern.

Scale the work to the request. A single component usually needs its own shape, a few tokens, and nothing else. A page needs the skeleton and its frames. If the piece is a one-off whose presentation will never vary, the method costs more than it returns; say so in a sentence, then do what was asked.

Change behaviour only where asked. A refactor into concern sheets should not move a pixel at rest, so measure a few boxes before and after instead of trusting that it looks the same.

## 1. Let the markup say what things are

| The markup says | With | Examples |
|---|---|---|
| which instance | a stable ID when a reference needs one | `id="release-task-42"`; domain identity stays in its model |
| what kind it is | a native/custom element or semantic class | `.release-task`, `.experiment`, `.tab-set` |
| its place in the host | `data-place` | `navigator`, `stage`, `inspector`, `toolbar`, `context` |
| a constituent's responsibility | scoped `data-part` | `explanation`, `demonstration`, `controls`, `evidence` |
| shared presentation responsibility | `data-role` | `surface`, `select`, `voice`, `reading`, `masthead` |
| what condition it is in | `data-state`, native and ARIA state | `active`, `alert`, `live`; `aria-selected`, `hidden`, `disabled` |
| where it is in a path | `data-frame` / `data-track` / `data-view` | `data-view="stage"` |
| its projection edge | `data-edge` | `block-end` |
| how much | a local | `data-cols`, `data-gap`, `data-pad`, `data-span`, `data-z` |

```html
<article class="release-task" data-role="surface" data-state="active" data-pad="open">
  <h3 data-role="voice">Publish release notes</h3>
</article>
```

Declare required/optional parts, inputs/actions, state ownership, tokens,
supported compositions, and optional-capability fallback before styling. An
`.experiment` has explanation and demonstration, controls when interactive,
and optional evidence and conclusion. Scope parts to their owning kind, for
example `:where(.experiment) > [data-part="controls"]`, so nested compositions
keep their own contract. Reuse kinds/part names and keep IDs unique.

Native elements retain browser/accessibility semantics; `data-*` supplies the
application's agreement with its sheets. For shadow internals use native
`part`/`exportparts` and inherited tokens. A name alone does not supply behavior.
Name meaningful boundaries rather than inventing a label for every wrapper.
Read `references/semantic-contract.md` for the complete authoring example.

- **A class names identity, never appearance and never a variant.** `.card-blue`, `.two-col`, `.mt-4` and `.tabs--vertical` all put an answer in the markup that a later choice then has to undo. A variant is a choice on an axis, so it is an attribute on an ancestor that a sheet resolves (`data-tabs="column"`), and the component never learns which one it is in.
- **Use native elements and real state.** A `<button>`, `aria-pressed` or `hidden` already says what is true. Do not invent a cosmetic state that runs alongside the real one.
- **No inline visual values.** An inline custom property that states a fact or a count is fine (`style="--lattice-index: 3"`, `style="--col-chars: 24"`), because it is an input to a rule and not a look.

`references/vocabulary.md` lists the axes, registered values, roles, states and locals.

## 2. File each declaration under the question it answers

| Sheet | Its question | Files | May not |
|---|---|---|---|
| **Layout** | How is one flat plane divided, X by Y? | `display: grid\|flex`, `grid-*`, `flex-*`, `gap`, `width`, `height`, `min-*`, `max-*`, `aspect-ratio`, `margin`, `padding`, `columns` | Lift a plane, or route a traversal |
| **Layer** | Which level of the stack is a plane on, and how does it stand to the rest? | `z-index`, `isolation`, `position: fixed\|absolute\|sticky`, `[popover]`, `::backdrop`, `<dialog>`, elevation shadow, `backdrop-filter`, `mix-blend-mode`, `opacity` | Divide a plane, paint one, or time a crossing |
| **Lattice** | How does an observer travel across the stack, and where does the camera stand? | `overflow`, `scroll-snap-*`, `scroll()` / `view()` timelines, `view-transition-name`, `perspective`, `transform-style`, `:focus-visible` | Redeclare the grid, or change a plane's level |
| **Look** | What is this made of? | `color`, `background`, `border`, `border-radius`, `box-shadow`, `filter`, `font-*`, `text-align`, `line-height` | Move anything, or place anything |
| **Life** | How does it feel to touch, travel and cross? | `transition`, `animation`, keyframes, `:hover`, `:active`, `:focus`, `pointer-events` | Change what a thing is, or where it sits |
| **Lens** | What kind of experience is this? | Nothing of its own: seeds and timing tokens for the other five | Style anything itself |

Two more sheets sit either side of the six:

- **Components** owns a part's own shape: the small grid that arranges its pieces, intrinsic padding, the box it needs for its worst-case content, a usable hit area. It knows nothing about page placement, looks or motion.
- **Local** resolves quantity at the call site (section 5). It loads last.

**Split by declaration, not by selector.** The same selector appears in several sheets, each time carrying only that sheet's properties. Do not park a whole rule in the file where it first appeared.

The cases that are easy to misfile:

- **Shadows.** A shadow that says which plane something stands on is Layer's. A shadow that is part of the material is Look's.
- **`transform`, `translate`, `opacity` that change over time** are Life's. A look that wants a static tilt publishes `--tilt` and one shared rule applies it with the independent `rotate` property, so a Life score that sets `transform` composes with it instead of replacing it.
- **`overflow` is always Lattice's.** A scroll container is a path, whoever placed the box.
- **Padding.** A region's is Layout's, a part's intrinsic padding is Components', and an amount chosen at the call site is `data-pad`.
- **`display: grid`.** Arranging the page or a host is Layout's; a component's small internal grid is Components'.
- **Responding to space.** A component responds to the room it was actually given with a container query. Media queries are for facts about the viewport or device.

`references/filing.md` has the full property table, what each sheet publishes, and more hard cases.

## 3. Cross a boundary with a token, never a selector

When one sheet needs something another sheet owns, the owner publishes a custom property and the other spends it. Neither names the other's selectors or profiles.

```css
/* at.lens.css sets the pace, at.look.css sets the character, and there is a floor */
animation-duration: var(--lens-enter-time, var(--enter-time, 420ms));
```

```css
/* at.life.css: Life may not resize a track, so it says how open the masthead is */
@property --masthead-open { syntax: "<number>"; inherits: true; initial-value: 1; }
@keyframes life-masthead-close { to { --masthead-open: 0; } }

/* at.layout.css: the track is Layout's, so Layout spends the number */
.Header { margin-block-end: calc(var(--masthead-size) * (var(--masthead-open, 1) - 1)); }
```

- **Declare a token at its owner and spend it with a fallback**, so the consumer still works when the publisher is not loaded.
- **Register it with `@property`** when it has to interpolate or compute to a real value.
- **A token that rests at an identity value changes nothing until someone moves it.** That is how a new handshake goes into shared sheets without disturbing a page that does not use it.
- **When Life needs something resized or re-placed**, it animates a number and the owner of the geometry spends it. Life may write `transform`, `translate`, `scale`, `opacity` and `filter` directly, because those do not move the plan.
- **When CSS cannot know a fact** (how tall an auto-sized row turned out), a narrow script adapter measures it and publishes it as a custom property. The script publishes the fact; a sheet decides what to do with it.

## 4. Address roles, not components

Look profiles and Life scores are written once and must keep working for components that do not exist yet. So neither names a component.

- **Life scores roles.** `[data-life="pulse"] [data-role="surface"]:hover` animates every panel, including the one added tomorrow. If a new component needs motion, give its parts the right role instead of writing `.my-card:hover` in the Life sheet.
- **A look is a set of token values.** A look profile (`[data-look="blueprint"]`) declares `--bg`, `--text`, `--accent`, `--radius-lg`, `--stroke-strength`, `--face-aspect` and so on, and never names a component. A component's paint is written once, outside any profile, against `currentColor`, `color-mix()` over it, and those tokens.
- **Scope a rule by what the element is** (`[data-role="masthead"]`, `[data-place="footer"]`), never by the name of a page or preset. "Slide deck" and "Panel app" are bundles of coordinates, not states.

The test for a new component: no look profile contains a rule for it, and every look restyles it.

## 5. State quantity at the call site with a local

A local picks a named step on a scale the composition owns: how many columns, how much space, which depth plane. It never introduces a value.

| Local | Values |
|---|---|
| `data-gap`, `data-pad` | `none`, `tight` (0.25x), `close` (0.5x), `even` (1x), `open` (1.5x), `wide` (2x) |
| `data-cols` | `fit`, `1`-`4`, `lead`, `max-2`-`max-4` (as in `data-cols="fit max-3"`) |
| `data-span` | `1`, `2`, `3`, `all` |
| `data-z` | `-4` ... `3` |

**The razor:** if changing the look or the density cannot move the result, it is not a local. It is a hardcode, and it belongs nowhere.

Locals are named, not numbered (`data-gap="open"`, never `data-gap="4"`), and every rule behind them is `calc()` over a token an axis declares. Do not add `data-color`, `data-speed` or any local that carries a value: that is the first step of turning the file into a utility framework. A new local needs a bounded vocabulary, an owning concern, and a reason the existing ones cannot express the choice.

## 6. Give content a frame

```html
<main class="Main" data-frame="root">
  <div class="main-shell" data-track>
    <section data-view="stage">...</section>
    <section data-view>...</section>
  </div>
</main>
```

A frame is the bounded region content is met through, a track is the sequence inside it, and a view is one step. Three sheets ask three different questions about the same frame: Layout decides where it sits and what shape it has, Layer decides whether it is in the plan or on call, and Lattice decides how content travels through it. Keep them apart and a guide can page identically as a sidebar and as a drawer.

The root frame follows the page's `data-lattice`. A nested frame declares its own or gets continuous flow; it must not inherit the root's path by accident.

## 7. Let script publish state and facts, and nothing else

Script owns which thing is chosen, what is open, and where focus is. It writes attributes and ARIA state, and it may publish counts and measurements as custom properties. It does not set colours, sizes, positions or durations, and it does not branch on theme or device. If script must animate, it reads its timing from computed tokens and removes any temporary inline style afterwards.

Author the complete structure inline and enhance it. A drawer is an ordinary region until a controller promotes it, and a control for a capability the page does not have stays hidden.

For custom elements, see `references/web-components.md`.

## Method

1. **Read the target** and whatever surrounds it: markup, selectors, declarations, states, existing tokens.
2. **Write the contract in a few lines**: instance identity, kind, place, required/optional parts, roles, real states, inputs/actions, state owners, tokens, and supported presentation changes.
3. **Address the meaning** with native structure, kinds, scoped parts, roles, state, frames, and locals. Preserve existing public hooks during migration.
4. **File every declaration** by the table. Where a sheet needs another's fact, add a token.
5. **Verify** with the checks below.
6. **Report** a short concern map (what went to which sheet, each new token with its owner, consumers and fallback), what you verified, and any intentional hardcodes.

Reuse before inventing. Do not add a role, local, token, axis value or sheet when an existing one expresses the need. When a new one is necessary, name its owner, its values and its fallback.

## Check your work

Verify behaviour, not just which file a rule ended up in.

- **Swap test.** Change the look, the density, the size and the container width. Nothing should need a component-specific fix, and everything claimed as a local should move.
- **Semantic contract test.** Required parts exist and have real concern-sheet consumers. Optional parts can be absent. Repeated/nested instances retain independent controls and state. A presentation swap retains subject identity and interactive nodes; labels alone do not prove composition.
- **Arrangement test.** Where they apply, change layout, traversal and projection. The same content, state, focus and scroll position should survive, and a nested frame should keep its own path.
- **Stillness test.** With `data-life="still"` and with `prefers-reduced-motion: reduce`, nonessential motion stops and state changes are still understandable. If two sheets take part in one motion, they must stop together.
- **Keyboard test.** Names, roles, states, focus indication and focus return all work.
- **Rest test.** For changes to existing code, the boxes you measured before are the same now. When adding a guard to an existing selector, write it as `:where(:not(...))` so the rule's specificity does not move.
- **Reach.** A concern sheet is shared. If you edited one, check every page that links it, not only the one you were asked about.
- **Boundaries.** No sheet writes a property outside its question, no selector names another sheet's profile, and nothing is `!important` except a documented accessibility or motion cutoff.

## Reference files

- `references/semantic-contract.md` - identity/kind/place/part/role/state/constraint grammar, authoring contract, scoped selectors, and continuity checks. Read before creating or substantially restructuring a composition.
- `references/filing.md` - the full property-to-sheet table, what each sheet publishes and may not do, hard cases, load order and `@layer`. Read when a declaration's home is not obvious.
- `references/vocabulary.md` - axes and their registered values, roles, states, locals, frame and projection attributes. Read before writing markup.
- `references/worked-examples.md` - a tab set split across five owners, a motion that had to resize a layout track, and a utility-class card refactored. Read before a first component or refactor.
- `references/reference-implementation.md` - working inside a project that has the `at.*.css` sheets and controller. Read before touching them.
- `references/web-components.md` - the custom-element contract and state ownership. Read when the target is a custom element.
- `assets/skeleton.html` - a minimal atmospheric document to start a page from.
