# Vocabulary: the names markup and sheets share

These are the names in the Atmosphere reference implementation. In a project with its own sheets, reuse a name when it means the same thing and do not repurpose one that means something else.

## Contents

- [The composition axes](#the-composition-axes)
- [Roles](#roles)
- [States](#states)
- [Locals](#locals)
- [Frames](#frames)
- [Regions and projection](#regions-and-projection)
- [Kinds of names](#kinds-of-names)

## The composition axes

One attribute per axis, set on the element that carries `class="Layout"` (normally `<body>`). The reference controller mirrors them onto `<html>` as well, so root-level pseudo-elements such as `::view-transition-*` can read them.

| Axis | Attribute | Sheet | Registered values |
|---|---|---|---|
| Layout | `data-layout` | `at.layout.css` | `default`, `3col`, `sidebar-right`, `stacked`, `hero` |
| Lattice | `data-lattice` | `at.lattice.css` | `continuous`, `pages`, `slides`, `ribbon`, `card-stack`, `spotlight`, `control`, `app` |
| Layer | `data-layer` | `at.layer.css` | `inline`, `top-left-edge-drawer`, `top-menu`, `pop-over` |
| Look | `data-look` (mirrored as `data-theme`, which the look sheet currently selects on) | `at.look.css` | 31 looks, for example `blueprint`, `tux`, `newspaper`, `crt`, `luxury`, `lab` |
| Life | `data-life` | `at.life.css` | `still`, `pulse`, `wiggle`, `3d`, `glitch`, `crazy` |
| Lens | `data-lens` | `at.lens.css` | `none`, `productive-data-dense`, `expressive-gamified`, `cinematic-luxury`, `stealth-terminal`, `institutional-reassuring` |

Supporting choices:

| Attribute | Values | What it scales or selects |
|---|---|---|
| `data-density` | `compact`, `cozy`, `roomy` | `--density-scale`, and through it `--layout-gap` and `--layout-pad` |
| `data-size` | `xs`, `s`, `m`, `l`, `xl` | `--size-scale`, the reader's type scale |
| `data-tabs` | `classic`, `column` | Where a tab list sits relative to its panels |
| `data-scroll-flow` | `still`, `reveal`, `parallax` | The scroll effect (Life) |
| `data-inout-flow` | `show`, `slide`, `slam`, `flip`, `materialize`, `focus` | How a projected panel enters and leaves (Life) |
| `data-header-fold`, `data-heartbeat`, `data-flap` | `true`, `false` | Individual motion scores |

What the lattice values mean:

- `continuous` - ordinary document flow; the identity path, and what an unmarked nested frame gets.
- `pages` - vertical sheets, proximity-snapped.
- `slides` - one view fills the frame, inline axis, mandatory snap.
- `ribbon` - continuous horizontal flow of panels.
- `card-stack` - sticky cards ordered by `--lattice-index`.
- `spotlight` - one centred view at a time.
- `control` - a bounded instrument grid; each tile keeps its own overflow.
- `app` - a panel wall; every view is itself a frame with its own scroll.

The bounded values (everything except `continuous`) cap the page at one viewport and make the root frame the scroller.

A lens seeds the other axes and keeps supplying pacing tokens after the reader changes one. Changing an axis is a refinement, not a fight; `none` removes the policy.

## Roles

A role is a reusable presentation responsibility. Life scores roles, so a new element with the right role is animated without any new rule.

| Role | What it is | The question Life answers for it |
|---|---|---|
| `data-role="surface"` | a panel or card | how does it greet a pointer? |
| `data-role="select"` | a choice (a button, chip or tab) | how does choosing feel? |
| `data-role="voice"` | a heading or kicker | how does it breathe? |
| `data-role="reading"` | a number or passage being watched | how does it hold attention? |
| `data-role="masthead"` | the primary header | how does it leave the stage? |

Components makes a role animatable: an element Life moves must be a transformable box with a `min-width` it can actually shrink to.

## States

| State | Meaning |
|---|---|
| `data-state="active"` | the current item |
| `data-state="alert"` | needs attention |
| `data-state="live"` | updating on its own |
| `data-view="stage"` | the distinguished view in a track |

Prefer native and ARIA state whenever it expresses the real condition: `hidden`, `disabled`, `aria-selected`, `aria-pressed`, `aria-expanded`, `aria-current`. Style from that state instead of adding a cosmetic class beside it.

## Locals

| Attribute | Values | Resolves through |
|---|---|---|
| `data-gap` | `none`, `tight`, `close`, `even`, `open`, `wide` | `--layout-gap` (carries density) |
| `data-pad` | `none`, `tight`, `close`, `even`, `open`, `wide` | `--layout-pad` (carries density) |
| `data-cols` | `fit`, `1`, `2`, `3`, `4`, `lead`, `max-2`, `max-3`, `max-4` | `fit` uses `--col-chars` and `--face-aspect` |
| `data-span` | `1`, `2`, `3`, `all` | how many tracks a child takes |
| `data-z` | `-4` ... `3` | sets `--z`, the shared depth plane |

The space steps are multiples of the composition's own unit: `none` 0, `tight` 0.25x, `close` 0.5x, `even` 1x, `open` 1.5x, `wide` 2x.

`data-cols="fit max-3"` fits as many columns as the content allows, up to three. The width of one column is stated in characters, as a count the rule converts with the current typeface's width:

```html
<div class="tasks" data-cols="fit max-3" data-gap="close" style="--col-chars: 30">...</div>
```

Other inline inputs of the same kind: `--lattice-index` (a view's place in the sequence) and `--fit-chars` (the longest text a part must hold).

## Frames

| Attribute | Meaning |
|---|---|
| `data-frame` | a bounded region content is met through; `data-frame="root"` is the page's main frame |
| `data-track` | the sequence inside a frame |
| `data-view` | one unit in the sequence; `data-view="stage"` is the distinguished one |
| `data-lattice` on a nested frame | that frame's own path; without it the frame flows continuously |

```html
<aside class="Sidebar" data-frame data-lattice="pages" data-layer-panel aria-label="Guide">
  <div class="panel-track" data-track>
    <section data-view data-role="reading">...</section>
    <section data-view data-role="reading">...</section>
  </div>
</aside>
```

In the reference implementation every view of the root frame is a container named `panel`, so a component inside one can respond to its real width with `@container panel (max-width: 26rem) { ... }`.

## Regions and projection

Region classes are capitalised and load-bearing: `.Layout` (the document grid), `.Header`, `.Main`, `.Sidebar`, `.UtilityRail`, `.Footer`, and `.Surface` (the look's canvas, which sits behind `.Main` and outside the scroll container so a texture stays put while content travels).

| Attribute | Meaning |
|---|---|
| `data-region="reference"` | names a region so an invoker can refer to it |
| `data-layer-panel` | this frame can be lifted out of the plan by a projection |
| `data-edge="block-end"` | the edge the frame belongs to; the edge projections lift it onto that edge |
| `data-place="footer"` | the region's responsibility, independent of its container form |
| `data-layer-trigger`, `aria-controls` | an invoker for a panel; authored `hidden` until the capability exists |
| `data-layer-ready` | added by the controller once native popovers are wired |

A semantic place is not a container form. An inspector remains an inspector whether it is a rail, a pane, a drawer or a popover. Change the composition, not the meaning.

## Kinds of names

| Kind | Meaning | Examples |
|---|---|---|
| Instance identity | a particular addressed region or model subject | unique HTML `id`; stable domain ID |
| Kind | a reusable meaningful structure | native/custom element, `.experiment`, `.release-task` |
| Part | a constituent scoped to its owning kind | `data-part="explanation"`, `"controls"`, `"evidence"` |
| Concern | a family of responsibilities | arrangement, traversal, appearance, motion |
| Dimension | a named axis within a concern | `layout`, `layer`, `lattice`, `look`, `life`, `lens` |
| Value / profile | a registered option on an axis | `layout.stacked`, `lattice.pages`, `look.blueprint` |
| Role | a presentation responsibility of an element | `surface`, `voice`, `select` |
| State | a condition supplied by behaviour or the host | `active`, `alert`, `live`, `stage` |
| Property | a typed token shared between concerns | `--layout-gap`, `--face-aspect`, `--layer-z` |
| Local | a bounded quantity declared at an element | `data-gap="close"`, `data-cols="fit max-3"` |
| Semantic place | a region's responsibility in an experience | inspector, navigator, editor, stage, toolbar |

These distinctions form the authoring contract, not an optional naming convention.
See `semantic-contract.md` for required/optional parts, native semantics, selector
scoping, state ownership, and continuity checks.
