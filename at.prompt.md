---
name: atmospheric-web-components
description: >-
  Design, implement, or refactor Web Components that follow the Atmosphere
  methodology: stable semantic meaning and state with presentation composed
  through Layout, Layer, Lattice, Look, Life, Lens, and bounded local tokens.
  Use for custom elements intended to adapt across themes, densities, traversal
  modes, projections, or presentation families. Do not use for ordinary one-off
  styling that has no compositional requirement.
---

# Atmospheric Web Components

Design the component around this promise:

> **Describe the meaning once. Compose how people encounter it.**

An atmospheric component keeps its semantic identity, data, interaction contract,
and working state stable while its placement, projection, traversal, appearance,
and motion change through the cascade. It should work in a document, dashboard,
workspace, presentation, or other suitable composition without becoming a separate
template for each one.

When working in this repository, treat the contracts in
[`README.md`](./README.md), [`docs/WHY-ATMOSPHERE.md`](./docs/WHY-ATMOSPHERE.md),
[`docs/VOCABULARY.md`](./docs/VOCABULARY.md), and
[`docs/STATE-MODEL.md`](./docs/STATE-MODEL.md) as normative. The demos prove and
explore ideas but may contain prototype shortcuts; do not copy an inline style,
full rerender, or legacy state path merely because a demo contains one.

## Start from meaning

Treat semantic addresses as the composition contract, before splitting CSS.
Use the README's identity/kind/place/part/role/state/constraint grammar. An `id`
addresses an instance; a class names a reusable kind; `data-place` names its
responsibility in the host; `data-part` names a meaningful constituent scoped to
that kind. `data-role` remains the shared presentation vocabulary, not a second
name for the kind or a substitute for native HTML semantics.

Before styling, identify:

- the entity or capability the custom element represents;
- its invariant semantic place, such as navigator, inspector, editor, stage,
  toolbar, or status bar;
- its domain inputs, outputs, commands, selection, and draft state;
- the presentation choices that are allowed to change independently;
- the native HTML interaction and accessibility semantics inside it.
- its required and optional semantic parts, including their state owners and
  fallback when absent.

Use the custom-element name, semantic elements, stable classes, and `data-role`
attributes as durable addresses. A class says what something **is**. A local
attribute says **how much** of a value supplied by the composition it needs.
Do not encode a temporary appearance, location, device, or theme into the
component's identity.

A semantic place is not a container form. For example, an inspector remains an
inspector whether it is a rail, pane, drawer, popover, dialog, or object-anchored
panel. Change the composition, not the meaning or data binding.

For example, an `.experiment` provides `data-part="explanation"` and
`data-part="demonstration"`, controls when interactive, and optional evidence
and conclusion. Address owned parts with scoped/direct-child selectors such as
`:where(.experiment) > [data-part="controls"]`; a nested experiment keeps its
own contract. Reuse names across instances and keep reference IDs unique. Expose
public shadow internals with native `part`/`exportparts`; `data-part` is a light-DOM
address, not a shadow-piercing mechanism.

Name meaningful capabilities and parts, not every wrapper. A name does not infer
behavior: document its inputs/actions, state authority, tokens, supported
compositions, and optional-capability fallback. Concern sheets contribute to
these named responsibilities; they must not accumulate opaque styling bundles
behind a semantic-sounding class.

## Give each technology one job

- **HTML** describes entities, containment, references, and native semantics.
- **CSS** resolves presentation from meaning, context, state, and preferences.
- **JavaScript** connects actions to state changes and system adapters.
- **SVG** describes explicit visual geometry when HTML and CSS are not the model.

JavaScript may publish facts such as attributes, states, indices, counts, and
measurements. It should not become a second style engine. Avoid inline visual
values and branching render logic by theme or device. If JavaScript must animate,
read timing and easing tokens from computed CSS and remove temporary inline styles
when the animation finishes.

## Separate concerns by question, not DOM ownership

The same element may participate in several concern sheets. Split declarations
by the question each declaration answers; do not move an entire selector to one
file just because that is where it first appeared.

| Concern | Question it owns | Typical declarations |
|---|---|---|
| **Components** | What intrinsic structure makes the component usable? | Internal part layout, intrinsic control size, shrinkability, component-only grid, accessible hit area |
| **Layout / Placement** | Which frames exist, what shape are they, and where do they sit in the plan? | Page or host grid, slots, bounds, responsive placement, spacing and density scales, container declarations |
| **Layer / Projection** | Is a frame inline or on call, and where does it appear? | Top-layer placement, drawer/popover geometry, depth plane, release of former inline space |
| **Lattice / Traversal** | How does content travel through a frame? | Scrollport, flow axis, paging, snapping, sequencing, active stage, camera and depth scale |
| **Look / Appearance** | What material does it wear? | Color, typography, texture, background, border, radius, shadow, filter, decorative surfaces |
| **Life / Motion** | How does it change over time? | Transitions, keyframes, state feedback, entrances/exits, gesture response, composition crossings |
| **Lens / Experience policy** | What intent coordinates the other concerns? | Starting seeds plus cross-cutting pacing, emphasis, and depth tokens |
| **Local contract** | How much of an existing concern is requested here? | Bounded named steps for gap, padding, columns, span, or depth |

Layout, Layer, and Lattice all ask different questions about the same **frame**:

```html
<section data-frame data-lattice="pages">
  <div data-track>
    <article data-view="stage">...</article>
    <article data-view>...</article>
  </div>
</section>
```

- Layout decides the frame's planned place and available shape.
- Layer decides whether it remains inline or is projected on demand.
- Lattice decides the path through content inside it.

A projected frame keeps its traversal. A nested frame declares its own
`data-lattice` or defaults to continuous flow; it must not accidentally inherit
the root path.

Keep these ownership boundaries sharp:

- Components own internal structure, not page placement, theme, or motion.
- Look paints but does not position, scroll, or run an unstoppable animation.
- Life owns time and honors `prefers-reduced-motion` and `data-life="still"`.
- Lens seeds a composition and supplies policy tokens; it does not lock axes or
  erase a later explicit choice.
- Concerns coordinate through documented custom properties and semantic roles,
  not by naming one another's profiles. A Look should not need to know a Life
  name, and Life should not need to know a component class.

## Use semantic roles and state

Prefer reusable presentation responsibilities over selectors tied to a single
component:

```html
<article class="release-task"
         data-role="surface"
         data-state="active"
         data-pad="open">
  <h3 data-role="voice">Publish release notes</h3>
</article>
```

Common roles include `surface`, `select`, `voice`, `reading`, and `masthead`.
Common states include `active`, `alert`, and `live`. Use native and ARIA state
such as `disabled`, `aria-pressed`, `aria-expanded`, and `aria-current` whenever
it expresses the real interaction state; do not create a parallel cosmetic state.

## Preserve the local contract

Locals select a bounded, named step on a scale owned by the composition:

- `data-gap` and `data-pad`: `none`, `tight`, `close`, `even`, `open`, `wide`;
- `data-cols`: registered counts or fitting constraints;
- `data-span`: registered track spans;
- `data-z`: a registered depth plane.

Use `data-gap="open"`, not `data-gap="4"`, `style="gap: 13px"`, or a new
single-value utility class. Resolve locals through shared tokens such as
`--layout-gap`, `--layout-pad`, and `--face-aspect`.

Apply this razor:

> If changing Look or density can never change the resolved value, it is not an
> atmospheric local; it is a hardcoded value.

Do not grow locals into a general utility framework. New locals need a bounded
vocabulary, a clear owning concern, and a reason the existing semantic or token
contracts cannot express the choice.

## Design a real Web Component contract

Use the browser's component model without sealing the component off from its
atmosphere:

- Use native semantic elements inside the custom element; a custom tag supplies
  no button, navigation, form, or landmark semantics by itself.
- Prefer native controls and behaviors, including buttons, links, forms,
  dialogs, and popovers. Add keyboard handling only where native behavior does
  not provide the required interaction.
- Reflect stable public state between appropriate properties and attributes.
  Validate enumerated values and keep backward-compatible wire identifiers when
  modifying an established component.
- Emit documented `CustomEvent`s for meaningful actions or changes. Events that
  hosts must observe across a shadow boundary should normally use
  `{ bubbles: true, composed: true }`.
- Use slots for host-authored meaning, parts for deliberately styleable internals,
  and inherited custom properties for composition tokens. Treat all three as
  public API.
- Use Shadow DOM when its encapsulation is valuable. Let inherited typography,
  color, density, motion, and Lens tokens cross the boundary; provide sensible
  fallbacks without baking in a second theme.
- Subscribe in `connectedCallback` and unsubscribe in `disconnectedCallback`.
  Do not leak observers, global listeners, timers, or model subscriptions.
- Preserve focus, selection, form values, drafts, scroll position, and active
  view when presentation coordinates change. Avoid replacing interactive DOM
  wholesale when a focused or stateful node can be updated in place.
- Escape or structurally create untrusted content. Do not interpolate unsanitized
  host data into `innerHTML`.
- Expose only necessary capabilities. Do not let a presentational component
  silently take ownership of host routing, persistence, or domain records.

## Keep state ownership explicit

Use these boundaries:

| State | Owner |
|---|---|
| Domain records and unsaved drafts | Host application |
| Domain selection and filters | Host interaction model |
| Atmosphere coordinate (`layout`, `layer`, `lattice`, `look`, `life`, `lens`, density, size) | Composition model or host |
| Active view and scroll position within a frame | Frame navigation adapter |
| Open/closed, focus return, pressed, and similar transient interaction | Native control or component adapter |
| Physical measurements | CSS where possible; otherwise a narrow measurement adapter |

Presentation changes must never rewrite domain records or discard uncommitted
work. Prefer one authoritative model with replaceable DOM, URL, persistence, and
control adapters over components that independently mirror the same state.

## Refactor existing styling

When `{target}` contains mixed styles, first inventory the selectors,
declarations, component states, and tokens. Then move declarations—not
necessarily whole rules—into the project's concern sheets. For a component
prefix such as `mt`, the result may be:

```text
css/mt.components.css  intrinsic internal component structure
css/mt.layout.css      planned placement, bounds, spacing, containers
css/mt.layer.css       inline/on-call projection and depth placement
css/mt.lattice.css     traversal within frames
css/mt.look.css        color, type, shape, material, texture
css/mt.life.css        feedback, transitions, animation
css/mt.lens.css        cross-concern experience policy
css/mt.local.css       bounded local quantities, only if component-specific locals exist
```

Reuse the repository's existing Atmosphere sheets and tokens when they already
own the rule; do not create component-prefixed copies by default. Preserve load
order and specificity deliberately. Do not partially introduce CSS `@layer`
around only some concern sheets: unlayered author styles outrank layered ones,
so the migration must be coordinated across the whole stack.

While splitting:

- keep stable classes and semantic attributes in the markup;
- replace repeated raw values with owned tokens where that improves composition;
- avoid `!important` except for a documented accessibility or transition cutoff;
- use container queries for a component responding to the space it actually
  receives; use media queries for viewport or device-environment facts;
- document each token at its owner and consume it through fallbacks elsewhere;
- ensure the standalone/custom-element loading path still loads every required
  sheet exactly once.

## Working method

1. Inspect the target, surrounding host markup, relevant models, and existing
   Atmosphere tokens before editing.
2. Write a compact contract: instance identity, kind, semantic place, required
   and optional named parts, public attributes and
   properties, slots/parts, events, state owner, roles/states, and supported
   presentation changes.
3. Map each visual declaration and behavior to the concern question it answers.
4. Implement the smallest semantic markup and stable component API that can
   support all required compositions.
5. Connect state through attributes, events, and adapters; let CSS resolve the
   visual result.
6. Verify the composition matrix and report any intentional hardcodes or
   unsupported combinations.

Do not invent a new profile, role, local, token, or stylesheet when an existing
contract expresses the requirement. When a new contract is genuinely necessary,
name the owner, valid values, fallback behavior, and consumers.

## Acceptance checks

Verify behavior, not just file placement:

- The same semantic content survives at least two materially different Looks,
  densities, and container widths without component-specific theme branches.
- Named parts have real scoped CSS consumers; a vocabulary-only annotation does
  not establish composition. Nested instances keep their own parts and state.
- Inline and projected forms preserve the same content, state, and traversal.
- Continuous and bounded traversal work when applicable; nested frames do not
  inherit an unintended root Lattice.
- Switching presentation family preserves selected entities, drafts, focus, and
  usable keyboard position.
- Native keyboard interaction, focus indication, names, roles, states, and focus
  return work across the shadow boundary.
- `data-life="still"` and `prefers-reduced-motion: reduce` remove nonessential
  motion while keeping state changes understandable.
- Look and density changes move every value claimed to be a local.
- No concern sheet owns declarations outside its question, and cross-concern
  coupling occurs through documented semantic addresses or tokens.
- The component disconnects cleanly without leaked listeners or subscriptions.
- Existing URLs, stored identifiers, public attributes, and events remain
  compatible unless a migration was explicitly requested.

Finish with a short concern map and verification summary so reviewers can see
why each declaration and state transition belongs where it was placed.
