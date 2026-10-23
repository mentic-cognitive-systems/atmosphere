# @mosphere

**Describe the meaning once. Compose how people encounter it.**

Atmosphere is a design methodology and reference implementation for interfaces
whose presentation can change while their meaning and working state remain
coherent. Reading, dashboards, panels, and slides are possible compositions of
shared structure and behavior.

HTML describes what exists. CSS resolves how it relates under current
conditions. JavaScript connects actions to changes. SVG describes explicit
visual geometry. Atmosphere organizes these capabilities around semantic
addresses, shared tokens, and clear ownership of decisions.

## Start small

Open [**Atmosphere, simply**](./simple.html). Write a note, then switch between
**Reading**, **Workspace**, and **Presentation**. The same guide, document,
chapter selection, and note field remain in the page. You can also choose
whether the guide stays in the layout or opens on demand. Expand
**Explore the composition contract** to change policies and inspect the CSS result.

The example has three source files, no build step, external fonts, or dependencies:

- [`simple.html`](./simple.html) names the content and its responsibilities.
- [`css/at.simple.css`](./css/at.simple.css) defines a bounded CSS vocabulary, experience defaults, and native style-query rules.
- [`js/at.simple.js`](./js/at.simple.js) records chosen symbols and handles chapter navigation and native popovers. Recipes live in CSS.

Start with a useful composition. Open the individual dimensions when you need
to adjust it. Learning Atmosphere should not require learning every CSS property
or every name in the laboratory first.

## The core principle: meaning → responsibility → presentation

**Describe the meaning once. Bind its responsibility to a presentation.**

| Question | Example | Authoring hook |
|---|---|---|
| What is this? | Guide, document, brand, notes | `data-identity` names a stable semantic subject |
| What job does it do here? | Navigator, stage, inspector, toolbar | `data-place` declares its responsibility, or a relationship derives it |
| How is that job rendered? | Supporting section, left rail, drawer | A layout binding and a presence policy resolve the mechanics |

For example: **Guide → Navigator → left rail or drawer**. The guide remains
the same subject. Its responsibility can be assigned by the presentation, and
its rendering can change without replacing its content or controls.

```html
<aside id="guide" data-identity="guide"
       data-relation="navigates" data-target="document">
  <nav aria-label="Chapters">…</nav>
</aside>
```

These labels have different jobs. `data-identity` is an application agreement,
not a replacement for an HTML `id` or native accessibility semantics. Use a
unique ID for references. Semantic subjects such as `guide` may occur in
separate hosts; scope their bindings to the owning host. A `data-place` value
describes a responsibility, rather than a physical direction such as left.

The simple example adds a relationship: **Guide navigates Document**. Its
`navigates` relation derives the navigator responsibility; Layout binds that
responsibility to a slot. `supports` gives notes their supporting responsibility,
and `identifies` connects the brand to the experience. Subjects remain the same.

```css
/* Relationship -> responsibility -> slot, within this host. */
[data-relation="navigates"][data-target="document"] {
  --responsibility: navigator;
  --place: var(--place-navigator, supporting);
}
.scene > [data-relation] { grid-area: var(--place); }

/* Native style queries interpret a named choice. */
@container composition style(--arrangement: alongside) {
  .scene {
    --place-navigator: navigation;
    --scene-areas: "navigation work inspection";
  }
}
```

An application author describes the relationship and chooses an experience or
policy. The concern rules consume those meanings and supply CSS mechanics.

## A small vocabulary inside CSS

The experiment extends CSS through registered custom properties, not a separate
parser or a JavaScript recipe table. These are the author-facing terms:

| Property | Allowed values | Decision |
|---|---|---|
| `--arrangement` | `stack`, `alongside`, `focus` | How responsibilities share space |
| `--navigation` | `auto`, `embedded`, `on-demand` | Whether navigation stays in the layout |
| `--path` | `continuous`, `pages`, `slides` | How the primary content is traversed |
| `--rhythm` | `compact`, `comfortable`, `spacious` | A named spacing step |
| `--identity` | `persistent`, `flowing` | Whether identity remains available while scrolling |

```css
@property --navigation {
  syntax: "auto | embedded | on-demand";
  inherits: true;
  initial-value: auto;
}

/* Lens contributes ordinary defaults. */
[data-lens="presentation"] {
  --arrangement: focus;
  --navigation: auto;
  --path: slides;
}

/* A deliberate author policy can be declared after the recipe layers. */
.SimpleAtmosphere { --navigation: embedded; }
```

The controls set these same custom properties on the experience host. The
cascade gives an explicit inline policy priority over recipe defaults. Returning
a control to **Experience default** removes that declaration. Style queries
resolve symbolic choices; `var()` connects facts and consumers; `calc()`,
`min()`, `max()` and `clamp()` resolve quantities. For example, rhythm chooses a
scale and padding consumes `calc(var(--space-unit) * var(--space-scale))`.

**Precedence:** capability constraints first, explicit policy over automatic
responsive decisions, then experience defaults. With `auto`, a focused experience
or a narrow workspace makes navigation available on demand. `embedded` keeps it
in the layout even in those contexts. When native popovers are unavailable, it
stays embedded and reachable.

The live contract shows resolved property values, relationship bindings, space
policy, and the reason navigation moved. It reads computed CSS. JavaScript
changes the selected Lens or a custom-property declaration, manages native
popover lifecycle/focus, and preserves chapter state. It never calculates the
layout or chooses a recipe's dimension values.

There is one primary document in this prototype. Relationship targets are scoped
semantic names, with explicit consumers for `navigates document`, `supports
document`, and `identifies experience`. It does not infer arbitrary relationships
or solve a general constraint graph. Working-state preservation is an invariant
of keeping the same native nodes, not a CSS property that can guarantee it.

The page detects a real style-query result before revealing composition
controls. Browsers without that capability, and pages without JavaScript, retain
a readable document with ordinary chapter links and an editable note. Registered
properties enforce the bounded values in engines supporting `@property`.
See the standards for [registered properties](https://www.w3.org/TR/css-properties-values-api-1/)
and [style queries](https://www.w3.org/TR/css-contain-3/#style-container).

Run [the browser contract checks](./tests/simple-contract.html) through your
local server to verify precedence, invalid-value fallback, responsive resolution,
CSS geometry, chapter continuity, and preservation of the note node and selection.

A semantic label needs a consumer: a binding, behavior, or continuity check.
Add a name when it expresses a useful distinction. Ordinary wrappers do not
need labels for every dimension.

## Six questions, one composition

The six names organize decisions. Their short questions are the definitions;
acrostics are optional mnemonics, not something an author must memorize.

| Dimension | Question | Example |
|---|---|---|
| **Layout** | Where does each responsibility belong? | Navigator beside the stage |
| **Layer** | What stays in place, floats, or appears on demand? | Guide opens in a drawer |
| **Lattice** | How do I move through the content? | Continuous reading or a slide sequence |
| **Look** | What does it look like? | Type, color, surfaces |
| **Life** | How does it respond and change? | Feedback, transitions, reduced motion |
| **Lens** | What experience should these choices serve? | Reading, Workspace, Presentation |

A Lens selects a coherent starting recipe. Individual choices can then adjust
it. It should be possible to explain an adjustment in one sentence and find
one obvious place to express it.

Keep the boundary about the **decision being made**, rather than promising
that every CSS property belongs to one concern in every context. Layout owns
a rail's allocation; Layer owns its presence; Lattice owns its traversal.
When those decisions meet, publish a small token or explicit state for the
other concern to consume. The CSS mechanics stay inside that implementation.

## Composition and Precedence

**Concerns organize decisions. Cascade layers establish precedence.
Attributes name choices; custom properties carry them into composition.**

| Mechanism | Responsibility |
|---|---|
| Concern sheets: Layout, Layer, Lattice, Look, Life, Lens | Organize who owns a design decision |
| `data-*` attributes | Declare semantic addresses, named choices, or application facts |
| Custom properties | Carry policies, shared tokens, and resolved values |
| Native CSS `@layer` | Establish precedence when declarations compete |

Atmosphere's **Layer** concern governs presence and projection: what stays in
place, floats, or appears on demand. A **cascade layer** orders CSS declarations;
it does not create visual depth or promote an element into the browser's top
layer. The six concerns describe responsibilities, with no universal priority
order between them.

An atmospheric precedence contract gives experience defaults a place to start,
composition rules a place to interpret choices, and explicit author policies a
place to refine them. For a new layered integration, this is a proposed pattern:

```css
@layer at.defaults, at.composition, at.policy;

@layer at.defaults {
  :where(.experience[data-lens="presentation"]) {
    --arrangement: focus;
    --navigation: auto;
    --path: slides;
  }
}

@layer at.policy {
  :where(.experience[data-navigation="embedded"]) {
    --navigation: embedded;
  }
}

/* at.composition contains the concern rules that consume these choices. */
```

For `<section class="experience" data-lens="presentation"
data-navigation="embedded">`, the Lens supplies defaults and the explicit
navigation choice refines them on the same host. The proposed `data-navigation`
binding above is an example of an application contract; an attribute only works
when CSS or behavior consumes it. An author can also declare `--navigation`
directly on that host. Use a public policy token to express intent and let its
consumer resolve the mechanics and usable fallback.

These layer names are guidance for new integrations, not a declaration of the
current bundle structure. The simple example already uses cascade layers named
for its sections, including `presence` for the Layer concern. The shared concern
sheets remain unlayered. Adopting a common hierarchy requires a coordinated
migration; adding a layer-order statement alone does not assign rules to layers.

Cascade precedence applies to competing declarations on the **same element**.
A custom property declared on a child takes precedence over an inherited value,
even when the parent's declaration belongs to a later cascade layer. Define the
policy on its owning host and avoid redeclaring it on descendants that should
inherit it. Normal unlayered author declarations outrank normal layered ones;
`!important` reverses layer order. See the
[CSS cascade specification](https://www.w3.org/TR/css-cascade-5/#layer-order)
and the [cascade architecture reference](./docs/VOCABULARY.md#6-css-architecture--cascade-layers)
for integration and web-component boundaries.

## Make interactions between choices explicit

The dimensions are distinct responsibilities, with dependencies. They are
not a promise that every combination produces a visibly different result.

- **Presence belongs to a region.** Moving the guide into a drawer should
  release its slot while the notes keep theirs. It should not silently
  replace the entire page layout.
- **Floating needs a space policy.** Retain space when content must keep its
  place; release it when the region is available on demand. The example's
  pinned toolbar retains its normal space through native sticky positioning.
  Its on-demand guide releases its slot. A transform-based projection may
  need a measured spacer; authors should not have to invent one each time.
- **Traversal belongs to a frame.** A paged guide can accompany a continuously
  read document. Changing its path should not rename or replace the guide.
- **Choices have a scope.** A whole-page structure and emphasis for an opening
  section should be described separately.
- **Fallbacks stay usable.** On small screens, the workspace stacks. Without
  JavaScript, the simple example remains a readable document with editable
  notes. Without native popovers, the guide stays in the layout.

In the simple example, resolved `--presence` and `--space` are small internal
contracts consumed by its CSS and adapter. `data-presence-ready` records a native
capability; it does not choose the policy. Reading, Workspace, and Presentation
are local CSS recipe names. They do not add values to the shared runtime's Lens
registry or change the legacy URL codebook.

## The contract in the full laboratory

[`atmosphere.html`](./atmosphere.html) now offers the same CSS authoring model
above the shared renderer. Reading, Workspace and Presentation supply defaults;
the contract editor exposes explicit policies and the computed result.

- [`css/at.contract.css`](./css/at.contract.css) owns the vocabulary, experience
  defaults, bindings from old controls, responsive decisions, and slot allocation.
- [`js/at.contract.js`](./js/at.contract.js) passes computed values to the existing
  runtime, manages policy input and URL metadata, and retains the current subject.
- The shared sheets continue to render all eight traversal modes, themes, density,
  tabs, projections, and Header Fold. Their option order and compact codebook stay
  unchanged. Browsers without style queries use the original dimension controls.

The lab extends the small example's bounded vocabulary where its existing
features need a distinction. `--arrangement` adds `adaptive` and `aside` for the
default and right-supporting-rail structures. `--path` also accepts `ribbon`,
`card-stack`, `spotlight`, `control`, and `app`. `--controls` uses the same
`auto | embedded | on-demand` vocabulary as `--navigation`, independently for Axes.

Guide `navigates document`, Axes `controls experience`, and Brand `identifies
experience`. Projecting just Guide releases its slot while Axes retains its own.
The advanced Layer controls still request a projection for both panels; a new
explicit dimension choice replaces policies for that same responsibility. Explicit
contract policies survive switching between the three high-level experiences.
The reset button removes policies and individual dimension requests, returning to
the selected experience's defaults. Other look/motion choices remain available.

The rendered `data-layout`, `data-lattice`, `data-layer`, and `data-density` values
are outputs of the contract adapter. Requested legacy values are kept separately
in `data-contract-*` attributes so a responsive output cannot become its own input.
CSS supplies the mapping; JavaScript does not contain a second recipe table.
Computed outputs are not saved as global dimension preferences. Storage updates
from another page do not erase this page's explicit contract.
Old links remain valid. New links retain the original `at=` coordinate and append
an `ac=` record containing intent, requested dimensions, and explicit policies.
The record is validated against existing options when restored. It stores no drafts.

Use [the laboratory integration checks](./tests/lab-contract.html) to exercise
independent projection, existing Structure controls, responsive fallback, native
Brand spacing, preserved drafts, and saved-link restoration. The
[simple contract checks](./tests/simple-contract.html) continue to exercise the
smaller direct-CSS implementation.

## Add vocabulary only as the work needs it

For a small interface, identity, responsibility, and native HTML are often
enough. Larger components can declare more of their contract:

| Name | Use it for |
|---|---|
| `id` | A unique reference to an instance |
| Semantic class or custom element | A reusable kind, such as `.experiment` |
| `data-part` | A constituent scoped to its kind, such as explanation or controls |
| `data-role` | A shared visual or behavior responsibility, such as surface or voice |
| Native/ARIA state | Real interaction state; use additional data attributes for application facts |
| Local constraints | Bounded choices such as `data-gap="even"` |

Part names can repeat between instances. Scope rules to their owner, such as
`.experiment > [data-part="controls"]`. Native `part`/`exportparts` and inherited
tokens expose deliberately public shadow internals; `data-part` does not pierce
a shadow boundary.

The practical contract states what parts are required, who owns state, what
can change, and what happens when a capability is absent. Verify it by changing
presentation while preserving the same subjects, nodes, draft values, selection,
and usable focus. Avoid parallel templates that need to be kept synchronized.

## Explore further

1. Try [the simple example](./simple.html) and read its three source files.
2. Explore [the full laboratory](./atmosphere.html) for the larger profile catalog.
3. Read [Why Atmosphere](./docs/WHY-ATMOSPHERE.md) and the
   [semantic vocabulary](./docs/VOCABULARY.md) for the broader architecture.
4. Read [Giving Atmosphere a Body](./docs/STATE-MODEL.md) for state ownership and
   the proposed authoritative model API.
5. Use [Give WebComponents Atmosphere](./docs/Give%20WebComponents%20Atmosphere.md)
   to migrate an existing component: semantic CSS, Tailwind extraction, live
   tokens, LiveObject delegates, events, and portable state.

`at.components.css` defines reusable internal structures. The shared concern
sheets implement Layout, Layer, Lattice, Look, Life, and Lens. `at.local.css`
resolves bounded quantities through shared scales. The
[machine-readable vocabulary](./docs/vocabulary.json) inventories the larger
implementation's current names and values; runtime registry adoption remains
proposed. Older architecture documents contain more extensive terminology and
acrostics; this README and the simple example provide the shorter introduction.

## What the demos currently demonstrate

| Entry | Current role | Limit |
|---|---|---|
| [`simple.html`](./simple.html) | Small introduction to identity, responsibility, bindings, and continuity | Native CSS vocabulary and three local recipes; not the full theme/runtime catalog |
| [`tutorial.html`](./tutorial.html) | Uber UI Template & masterclass: eight-step walkthrough demonstrating work continuity across Document, IDE, Slides, and Dashboard | Synthesis across archetypes; live editable release workbench |
| [`UI.html`](./UI.html) | Canonical Presentation Canvas: standardized blank starter template ("Bootstrap on steroids") | Ready-to-use semantic slots and live-object components |
| [`atmosphere.html`](./atmosphere.html) | CSS contract over the full composition renderer | High-level intent plus the complete dimension catalog |
| [`app.html`](./app.html) | IDE workspace with semantically addressed navigator, editor, inspector, and source examples | Embedded source excerpts; not a filesystem editor |
| [`live-object.html`](./live-object.html) | Experimental state-wrapper walkthrough | Focused reactive object demonstration |

The laboratory's `.experiment` names explanation, demonstration, controls,
evidence, and conclusion, with real consumers in `at.docs.*.css`. The tutorial
uses one stable shadow tree per component, public native `part` addresses,
supplied models, and lifecycle cleanup; `at.presentation.*.css` composes those
parts across four archetypes. The IDE's `at.app.*.css` addresses semantic places
and source-document parts while preserving its existing region classes and IDs.
`at.tutorial.*.css` owns the tutorial's lesson-specific contributions.

The controller, composition attributes, compact URLs, and theme controls are
implemented. The experimental `window.AtmosphereModel` wrapper observes a
DOM-backed controller; an authoritative model with unified persistence remains
proposed. These descriptions reflect source review, not a fresh cross-browser
certification.

## Download

The full laboratory and larger demos carry the `🌬️ breathe @tmosphere` pill (`<atmospheric-lander>`).
It downloads one of two canonical bundles, built from these sheets by
`Deploy/build_atmosphere_bundles.sh`; the small segment on the pill switches between them:

| Bundle | Contents |
|---|---|
| [Thin Atmosphere](./downloads/atmosphere-thin.zip) | The eight concern sheets as pure CSS, an `atmosphere.css` that imports them in canonical order, and a starter page |
| [Thick Atmosphere](./downloads/atmosphere-thick.zip) | Thin plus the runtime: `atmosphere.js`, the `AtmosphereModel` LiveObject, the theme drawer and tray, and the lens notes |

The pill is a LiveObject composition: a shared `window.AtmosphereRelease` emits
`atmosphere:breathe` on each download, and any element marked
`data-breathe="land"` subscribes. On these pages the H1 does: it falls to the
bottom of the viewport, lands, and re-materializes in place.

```html
<h1 data-breathe="land">Title</h1>
<atmospheric-lander floating></atmospheric-lander>
<script src="webcomp/atmospheric-lander.js" defer></script>
```

## Using the shared runtime

Use the existing identifiers when trying the implementation:

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
  <header class="Header" data-place="toolbar" data-role="masthead">…</header>
  <main class="Main" data-place="stage" data-frame="root">
    <div class="main-shell" data-track>
      <section class="concept" data-view="stage">
        <header data-part="explanation">…</header>
        <div data-part="demonstration">…</div>
      </section>
      <section class="concept" data-view>…</section>
    </div>
  </main>
  <footer class="Footer" data-place="context">…</footer>
  <script src="js/atmosphere.js"></script>
</body>
```

This is an inline reading skeleton. Drawers require authored panels and
invokers; tabs and dialogs require their respective interaction contracts.
Composition attributes select presentation; they do not invent application
behavior or replace native HTML semantics.

## Local development

No build step is required. From this directory:

```sh
python3 -m http.server 8000
```

Open [the simple example](http://localhost:8000/simple.html),
[the laboratory](http://localhost:8000/atmosphere.html), or
[the tutorial](http://localhost:8000/tutorial.html).
The simple example also works when opened directly as a local HTML file.

## Documentation and source map

- [Why Atmosphere](./docs/WHY-ATMOSPHERE.md) — Philosophy, vision, Tailwind critique, and the local contract
- [Vocabulary & Concerns](./docs/VOCABULARY.md) — Concerns, dimensions, roles, local constraints, and cascade layers
- [Vocabulary catalog](./docs/vocabulary.json) — Current-value inventory for the registry
- [Giving Atmosphere a Body: State Model](./docs/STATE-MODEL.md) — Reactive state architecture, system adapters, and motion interop
- [Presentation families and workspaces](./docs/PRESENTATIONS.md) — Designer intent, semantic places, and compound workspace recipes
- [Presentation catalog](./docs/presentations.json) — Canonical presentation families and place definitions
- [Workspace recipes](./docs/workspaces.json) — Composition recipes and bindings for compound workspaces
- [Tutorial design brief](./docs/TUTORIAL-VISION.md) — Proposed learning experience and acceptance criteria
- `css/` — concern sheets and demo extensions
- `js/` — controllers, experimental model, and demo adapters
- `webcomp/` — theme drawer, tray, and the `atmospheric-lander` download pill
- `downloads/` — the Thin and Thick Atmosphere bundles

## License

Atmosphere is available under the GNU Affero
General Public License v3.0 or later, or a separate commercial license. See
[`LICENSE`](./LICENSE) and [`LICENSE-AGPL`](./LICENSE-AGPL).

> **Attribution and Support**
>
> When using Atmosphere, please help spread the word by embedding our badge somewhere in your UI.
> The badge is interactive so <object data="@mosphere.svg"></object> will help users understand its purpose quickly.
> If you prefer to keep the badge static, you can use the image directly: <img src="./@mosphere.svg" alt="made framework free using atmosphere"/>
>
> Developed by Matthew Quarneri, MENTIC Cognitive Systems. © 2026 MENTIC LLC.
>
> Please credit MENTIC Cognitive Systems when referencing or building with Atmosphere.
>
> If Atmosphere contributes substantial commercial value to your organization, please consider supporting its continued development through sponsorship or a paid advisory engagement.
>
> For any consulting opportunities please contact consulting@mentic.com.
>
> Financial support is voluntary and appreciated.
>
> For more interesting ideas, visit [MENTIC Cognitive Systems](https://www.mentic.com).
