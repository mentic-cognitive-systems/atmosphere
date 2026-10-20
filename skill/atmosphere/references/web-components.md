# Atmospheric custom elements

An atmospheric component keeps its meaning, data, interaction contract and working state stable while its placement, projection, traversal, appearance and motion change through the cascade. It should work in a document, a dashboard, a workspace or a presentation without becoming a separate template for each.

Use the browser's component model without sealing the component off from its atmosphere.

## Start from meaning

Before styling, identify:

- the entity or capability the element represents;
- its semantic place (navigator, inspector, editor, stage, toolbar, status bar), which does not change when its container form does;
- its inputs, outputs, commands, selection and draft state;
- which presentation choices are allowed to vary independently;
- the native HTML and accessibility semantics inside it.

The custom-element name, semantic elements, stable classes and `data-role` attributes are the durable addresses. Do not encode a temporary appearance, location, device or theme into the component's identity.

Make those addresses a declared contract: distinguish instance identity, kind,
place, required/optional parts, role, real state, and bounded constraint. Scope
light-DOM `data-part` addresses to their owning kind; expose public shadow
constituents with native `part`/`exportparts`. Document state ownership, supplied
subjects, inputs/actions, tokens, supported compositions, and absent-capability
fallback. See `semantic-contract.md` for the grammar and authoring example.

## The contract

- **Native semantics inside.** A custom tag supplies no button, navigation, form or landmark semantics by itself. Prefer native controls, dialogs and popovers, and add keyboard handling only where native behaviour does not cover the interaction.
- **Reflect stable public state** between properties and attributes. Validate enumerated values, and keep existing wire identifiers when modifying an established component.
- **Emit documented `CustomEvent`s** for meaningful actions. Events a host must observe across a shadow boundary normally use `{ bubbles: true, composed: true }`.
- **Slots for host-authored meaning, parts for deliberately styleable internals, inherited custom properties for composition tokens.** Treat all three as public API.
- **Let the atmosphere cross the shadow boundary.** Inherited typography, colour, density, motion and Lens tokens should reach the shadow tree. Provide sensible fallbacks (`var(--layout-gap, 1rem)`) without baking in a second theme.
- **Clean up.** Subscribe in `connectedCallback` and unsubscribe in `disconnectedCallback`. Do not leak observers, global listeners, timers or model subscriptions.
- **Preserve what the user is doing.** Focus, selection, form values, drafts, scroll position and the active view survive a presentation change. Update a focused or stateful node in place instead of replacing interactive DOM wholesale.
- **Do not interpolate unsanitized host data into `innerHTML`.** Escape it or build nodes.
- **Expose only what is necessary.** A presentational component does not take ownership of host routing, persistence or domain records.

## The same filing rule, inside the component

The concern split applies inside a component's own styles as much as on a page. In a shadow tree there may be one stylesheet, but each declaration still answers one question:

```css
/* shape (Components) */
:host { display: block; min-width: 0; }
.rows { display: grid; gap: var(--layout-gap, 1rem); }

/* paint (Look) - currentColor and inherited tokens, never a private palette */
.row { border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
       border-radius: var(--radius-lg, 0.5rem); }

/* time (Life) - the host's tokens set the pace and can stop the clock */
.row     { transition: background var(--transition-interaction, 120ms ease); }
.spinner { animation: spin 1s linear infinite;
           animation-play-state: var(--look-motion, running); }
@media (prefers-reduced-motion: reduce) {
  .row     { transition: none; }
  .spinner { animation: none; }
}
```

A rule in the host's Life sheet cannot reach into a shadow tree, but an inherited token can. So expose the component's motion as tokens the host's Life already sets: a duration and easing (`--transition-interaction`), a play state (`--look-motion`, which `data-life="still"` sets to `paused`), or an animation name the host can set to `none`.

Keep the groups separate and labelled, so they can be lifted into the project's concern sheets later. For a light-DOM component, or a family with the prefix `mt`, file them directly:

```text
css/mt.components.css  intrinsic internal structure
css/mt.layout.css      planned placement, bounds, spacing, containers
css/mt.layer.css       inline or on-call projection, depth placement
css/mt.lattice.css     traversal within frames
css/mt.look.css        colour, type, shape, material, texture
css/mt.life.css        feedback, transitions, animation
css/mt.lens.css        cross-concern experience policy
css/mt.local.css       bounded local quantities, only if the component adds any
```

Reuse the project's existing Atmosphere sheets and tokens when they already own a rule. Do not create prefixed copies by default, and make sure the standalone loading path loads every required sheet exactly once.

## State ownership

| State | Owner |
|---|---|
| Domain records and unsaved drafts | the host application |
| Domain selection and filters | the host's interaction model |
| The composition (`layout`, `layer`, `lattice`, `look`, `life`, `lens`, density, size) | the composition model or host |
| The active view and scroll position within a frame | a frame navigation adapter |
| Open or closed, pressed, focus return and similar transient interaction | the native control or the component |
| Physical measurements | CSS where possible, otherwise a narrow measurement adapter |

A presentation change must never rewrite domain records or discard uncommitted work. Prefer one authoritative model with replaceable DOM, URL, persistence and control adapters over components that each mirror the same state.

## Checks specific to components

- The same content survives at least two materially different looks, densities and container widths with no theme branch inside the component.
- Inline and projected forms keep the same content, state and traversal.
- Keyboard interaction, focus indication, names, roles, states and focus return work across the shadow boundary.
- The component disconnects without leaked listeners or subscriptions.
- Existing URLs, stored identifiers, public attributes and events stay compatible unless a migration was requested.
