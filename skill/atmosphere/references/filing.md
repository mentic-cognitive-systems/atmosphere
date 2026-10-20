# Filing: which sheet owns a declaration

A property belongs to the sheet whose space it measures, so every declaration has one home. Anything another sheet needs to know about it travels as a token.

## Contents

- [The property table](#the-property-table)
- [What each sheet may not do, and what it publishes](#what-each-sheet-may-not-do-and-what-it-publishes)
- [Components and Local](#components-and-local)
- [Hard cases](#hard-cases)
- [Tokens](#tokens)
- [Load order and the cascade](#load-order-and-the-cascade)
- [When the existing sheets disagree with this table](#when-the-existing-sheets-disagree-with-this-table)

## The property table

Three of the six sheets are spatial, and each owns one dimension of the same space.

| Sheet | Space | CSS it files |
|---|---|---|
| **Layout** - Location Across Yield Organized Under Total | The flat plane, X by Y | `display: grid`, `grid-template-*`, `grid-area`; `display: flex`, `flex-direction`, `gap`; `width`, `height`, `min-*`, `max-*`, `aspect-ratio`; `margin`, `padding`; `columns`, `column-gap` |
| **Layer** - Level Across Yield Evaluates Relationships | The stack of planes, along Z | `z-index`, `isolation: isolate`; the Popover API (`[popover]`, `::backdrop`); `<dialog>` top-layer promotion; `position: fixed`, `absolute`, `sticky` (detaching from the plane); elevation (`box-shadow`, `filter: drop-shadow`); relations between planes (`backdrop-filter`, `mix-blend-mode`, `opacity`) |
| **Lattice** - Laterals Across Tied Totals Instruct Controlled Evaluation | Traversal across the stack | `overflow`, `overflow-x/y`; `scroll-snap-type`, `scroll-snap-align`; scroll-driven timelines (`scroll()`, `view()`); `view-transition-name`; the camera (`perspective`, `perspective-origin`, `transform-style: preserve-3d`); spatial navigation and `:focus-visible` |
| **Look** | Surfaces and materials | `color`, `background-color`; `border`, `border-radius`; `box-shadow`, `filter`; `font-family`, `font-size`, `font-weight`; `text-align`, `line-height` |
| **Life** | Change over time | `transition`, `transition-*`; `animation`, `animation-*`, keyframes; `:hover`, `:active`, `:focus`; `pointer-events` |
| **Lens** | Experience policy | Nothing of its own: seeds, defaults and timing tokens for the other five |

Every plane carries its own Layout, stands at one level of the stack, and is tied to its neighbours by a Lattice. The crossing between two states is Life's: timed over Layer's distance, at Lattice's camera scale.

## What each sheet may not do, and what it publishes

| Sheet | May not | Publishes for the others |
|---|---|---|
| Layout | Lift a plane, or route a traversal. It never sets colour, typography, texture, a component's internal shape, or motion. | `--grid-areas`, `--grid-cols`, `--grid-rows`, `--layout-gap`, `--layout-pad`, `--content-max`, `--density-scale`, `--size-scale`, `--frame-block-max` |
| Layer | Divide a plane, paint one, or time a crossing. It does not decide what a frame is made of or what path runs through it. | `--layer-z`, `--plane-altitude`, `--page-far` |
| Lattice | Redeclare the grid, hide a rail, or change a plane's level. It may not decide whether a frame exists or is present. | `--lattice-axis`, `--lattice-scale`, `--lattice-index`, `--lattice-count`, `--lattice-viewport`, `--camera`, `--depth-unit` |
| Look | Move anything or place anything. It may not set `position`, `overflow`, `display` or `padding` on a page region, write `transform` on a text role, or start an animation nothing can stop. | `--bg`, `--text`, `--accent`, `--font`, `--radius-*`, `--stroke-strength`, `--face-aspect`, `--look-density`, `--look-leading`, `--enter-time`, `--stagger-anim`, `--tilt`, `--haze` |
| Life | Change what a thing is or where it sits. It introduces no colour, font, size or position the page did not already have, and it never names a component. | `--motion-duration-*`, `--motion-ease-*`, `--transition-interaction`, `--transition-element`, `--transition-structural`, `--look-motion`, `--depth-motion`, `--layer-travel` |
| Lens | Style anything itself, lock an axis, or erase a later explicit choice. | Seeds on the other five, and pacing tokens such as `--lens-enter-time` |

The token names are the reference implementation's. In a project with its own sheets, keep the same idea and reuse these names where they mean the same thing, so the two can be combined later.

## Components and Local

**Components** is the sheet for a part's own shape:

- the small grid or flex that arranges the part's own pieces, and the named areas inside it;
- intrinsic padding and the box needed to hold the worst-case content;
- shrinkability (`min-width: 0`) and a usable control size;
- making a role animatable: an element Life is asked to move has to be a transformable box it can actually shrink.

It does not decide where the part sits on the page, what it is painted with, or how it moves. A component names its areas and stops; where those areas go is Layout's question.

**Local** resolves the bounded quantity attributes (`data-gap`, `data-pad`, `data-cols`, `data-span`, `data-z`). Each rule is `calc()` over a token an axis declares:

```css
[data-gap="close"] { gap: calc(var(--layout-gap, 1rem) * 0.5); }
[data-gap="even"]  { gap: var(--layout-gap, 1rem); }
[data-gap="open"]  { gap: calc(var(--layout-gap, 1rem) * 1.5); }

[data-cols~="fit"] {
    grid-template-columns: repeat(auto-fit, minmax(
        min(100%, calc(var(--col-chars, 24) * var(--face-aspect, 0.55) * 1rem)),
        1fr));
}
```

`--layout-gap` already carries the density, and `--face-aspect` already carries how wide the current look's typeface runs, so one rule serves every look and density. Before locals, four classes each hardcoded a different `minmax()` length for the same idea; the difference between them was one number.

A local is not a replacement for a class. The class is the only handle a distant sheet has to address the element, so the local carries the quantity and the class keeps the identity.

## Hard cases

**`box-shadow` and `filter`.** Ask what the shadow is telling the reader. "This stands in front of that" is a relation between planes, so Layer files it and its size comes from `--layer-z` or `--plane-altitude`. "This card has a soft edge" is material, so Look files it. A hover lift is a change over time, so Life files it.

**A component's border, background and radius.** Paint, so Look's by the table, but never inside a look profile. Write it once, outside any `[data-look="..."]` selector, against `currentColor` and the look's tokens; a profile then changes it by changing token values. The reference sheets still keep some of this beside the shape in the Components sheet.

**`opacity`.** At rest, as a relation between planes (a dimmed page behind a drawer), it is Layer's. Fading in or out is Life's.

**`transform`, `translate`, `scale`, `rotate`.** Motion is Life's. The camera (`perspective`, `transform-style`) is Lattice's. A look that wants type tilted declares `--tilt`, and a shared rule applies it with the independent `rotate` property. `rotate` always composes; a `skew` has no independent property, so a Life score that sets `transform` replaces it.

**`position`.** `fixed`, `absolute` and `sticky` detach a box from the flat plane, which is Layer's question. `position: relative` used only to anchor a component's own pseudo-element is part of that component's shape.

**`overflow`.** Lattice's, including on a box Layout placed and capped. If Layout knows a tighter cap than Lattice's default, it publishes the number (`--frame-block-max`) and Lattice spends it. Two sheets writing `max-block-size` on the same box is a race decided by link order.

**`padding` and `gap`.** A region's padding and the page rhythm are Layout's, through `--layout-pad` and `--layout-gap`. A part's intrinsic padding is Components'. A choice at the call site is a local.

**`display`.** `grid` or `flex` that arranges the page or a host is Layout's. A part's internal arrangement is Components'. `display: none` for `[hidden]` state belongs with the component that has the state.

**`:hover`, `:active`, `:focus` against `:focus-visible`.** How touching something feels is Life's. Where keyboard focus is and how it is shown while travelling is Lattice's.

**`text-align`, `line-height`, `letter-spacing`.** Look's. They are properties of the type, not of the plane.

**A variant of a component.** Not a modifier class. If the choice is an arrangement, it is a Layout rule keyed on an ancestor attribute (`[data-tabs="column"] .tab-set`). If it is a material, it is the look. If it is how a change feels, it is Life.

**A motion that needs to resize or move something in the plan.** Life animates a registered number; the owner of the geometry spends it. See the second example in `worked-examples.md`.

**A value only layout can produce** (the used height of an auto row, the width of a label in the current face). CSS cannot ask for it, so a small script adapter measures the laid-out size and publishes it as a custom property. Measure a size the consumer's own effect cannot feed back into (`offsetHeight` is not changed by a transform), and keep a CSS fallback for the scriptless page.

## Tokens

- Declare a token where its owner lives, with a comment saying who spends it.
- Spend it with a fallback: `var(--frame-block-max, 100svb)`. The consumer must still work when the publisher is absent.
- Chain fallbacks to express precedence without a cascade trick: `var(--lens-enter-time, var(--enter-time, 420ms))` reads as "the experience sets the pace, the look sets the character, and there is a floor".
- Register with `@property` when the value must interpolate (a scroll-driven number) or compute to a real value before it is inherited.
- Give a new handshake an identity resting value (`1` for a multiplier, `0px` for an offset), so adding it to shared sheets changes nothing for pages that never move it.
- If a declaration should not apply at all when a fact is missing, leave the fallback off on purpose: an unresolved `var()` makes that one declaration invalid and the property keeps its previous value.

## Load order and the cascade

```html
<link rel="stylesheet" href="css/at.components.css">
<link rel="stylesheet" href="css/at.layout.css">
<link rel="stylesheet" href="css/at.lattice.css">
<link rel="stylesheet" href="css/at.layer.css">
<link rel="stylesheet" href="css/at.look.css">
<link rel="stylesheet" href="css/at.life.css">
<link rel="stylesheet" href="css/at.lens.css">
<link rel="stylesheet" href="css/at.local.css">   <!-- last, unlayered -->
```

- Local loads last so a quantity chosen at the call site wins without `!important`. A component that must override a local does it by name and attribute (`.feature-grid[data-cols]`), which is one specificity step and reads as what it is.
- Lens loads after Life so its few rules can refine the composition it seeds.
- Do not wrap only some sheets in `@layer`. Unlayered author styles outrank layered ones regardless of specificity, so a partial migration silently inverts precedence. The planned order, to be adopted by all sheets at once, is `@layer at.reset, at.components, at.layout, at.lattice, at.layer, at.look, at.life, at.lens, at.local;`.
- Avoid `!important`. The accepted uses are motion cutoffs (`data-life="still"`, `prefers-reduced-motion`) and print.
- Capital-L Layer is the depth axis. Lowercase cascade layers (`@layer`) are a different thing.

## When the existing sheets disagree with this table

The reference sheets are older than this table in places; for example, a sticky header is still positioned from the Layout sheet. File new work by the table. Leave existing rules where they are unless you were asked to move them, because moving a rule between sheets changes load order and can change what wins.
