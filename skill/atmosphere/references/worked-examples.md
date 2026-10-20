# Worked examples

Three cases, each showing the same move: decide what question a declaration answers, file it there, and connect the sheets with a token when one needs another's fact. The first two are taken from the Atmosphere laboratory page and its sheets. The third is a refactor in a project that has no Atmosphere sheets yet.

## Contents

- [1. A tab set nobody owns outright](#1-a-tab-set-nobody-owns-outright)
- [2. A motion that had to resize a layout track](#2-a-motion-that-had-to-resize-a-layout-track)
- [3. Refactoring a utility-class card](#3-refactoring-a-utility-class-card)

## 1. A tab set nobody owns outright

Tabs are usually shipped as a component with variants. Here the same markup is filed like everything else: five owners each write one slice, and none knows the others' answers.

**Markup: what exists.** A tablist, tabs and panels paired by `aria-controls`. Nothing says top, side, selected colour or animation.

```html
<div class="tab-set">
  <div class="tab-list" role="tablist" aria-label="Who owns a tab set">
    <button class="tab" type="button" role="tab" id="tab-markup"
            aria-controls="panel-markup" aria-selected="true" data-role="select">Markup</button>
    <button class="tab" type="button" role="tab" id="tab-shape"
            aria-controls="panel-shape" aria-selected="false" data-role="select">Shape</button>
  </div>
  <div class="tab-panels">
    <div class="tab-panel" role="tabpanel" id="panel-markup" aria-labelledby="tab-markup" tabindex="0">...</div>
    <div class="tab-panel" role="tabpanel" id="panel-shape" aria-labelledby="tab-shape" tabindex="0" hidden>...</div>
  </div>
</div>
```

**Components: the inside.** The set is a grid with two named areas. It names them and stops; where they go is not its question.

```css
.tab-set    { display: grid; gap: var(--layout-gap, 1rem); min-width: 0; }
.tab-list   { grid-area: list; display: flex; flex-wrap: wrap; gap: 0.3rem; min-width: 0; }
.tab-panels { grid-area: panels; min-width: 0; }
.tab-panel[hidden] { display: none; }
```

**Layout: where the list sits.** An axis on an ancestor, never a modifier class on the component. The fallback is a container query, because a column of tabs needs a column to live in and the component should respond to the room it was given.

```css
.tab-set { grid-template-areas: "list" "panels"; grid-template-columns: minmax(0, 1fr); }

[data-tabs="column"] .tab-set {
    grid-template-areas: "list panels";
    grid-template-columns: minmax(7rem, 11rem) minmax(0, 1fr);
}
[data-tabs="column"] .tab-list { flex-direction: column; flex-wrap: nowrap; }

@container panel (max-width: 26rem) {
    [data-tabs="column"] .tab-set { grid-template-areas: "list" "panels"; grid-template-columns: minmax(0, 1fr); }
    [data-tabs="column"] .tab-list { flex-direction: row; flex-wrap: wrap; }
}
```

**Look: no profile names a tab.** The paint is written once, outside any look profile. A tab's border is `currentColor` at the look's stroke strength, and the panel's corners and padding come from the look's tokens, so all 31 looks restyle the set without having been taught it exists. (In the reference sheets these lines currently sit beside the shape in `at.components.css`; by the filing table their home is the Look sheet. Either way, nothing under a `[data-theme="..."]` selector mentions a tab.)

```css
.tab {
    border: 1px solid color-mix(in srgb, currentColor calc(30% * var(--stroke-strength, 1)), transparent);
    background: transparent;
    color: inherit;
}
.tab[aria-selected="true"] {
    border-color: currentColor;
    background: color-mix(in srgb, currentColor 14%, transparent);
}
.tab-panel {
    padding: calc(clamp(0.9rem, 2vw, 1.4rem) * var(--look-density, 1));
    border-radius: var(--radius-lg);
}
```

**Life: how the swap feels.** The selected tab is scored per Life value, and a panel that has just appeared arrives on the look's own entrance, at the lens's pace. `still` switches both off.

```css
[data-life="pulse"] .tab[aria-selected="true"] { translate: 0 -2px; }

.tab-panel:not([hidden]) {
  animation: var(--stagger-anim, look-item-rise)
             var(--lens-enter-time, var(--enter-time, 420ms))
             var(--lens-enter-ease, var(--enter-ease, ease))
             backwards;
}
[data-life="still"] .tab-panel:not([hidden]) { animation: none; }
```

These rules name `.tab` and `.tab-panel`, which is the reference Life sheet bending its own rule. For new work, score the role and the real state instead (`[data-life="pulse"] [data-role="select"][aria-selected="true"]`), so the next selectable thing gets the same feel without a new rule.

**Script: which one is chosen.** Selection is state. The script keeps `aria-selected`, the roving `tabindex` and each panel's `hidden` in step and handles the arrow keys, Home and End. It sets no style.

```js
const select = (tab, focus) => {
  tabs.forEach(other => {
    const chosen = other === tab;
    other.setAttribute('aria-selected', String(chosen));
    other.setAttribute('tabindex', chosen ? '0' : '-1');
    const panel = document.getElementById(other.getAttribute('aria-controls'));
    if (panel) panel.hidden = !chosen;
  });
  if (focus) tab.focus();
};
```

What to take from it:

- There is no `.tabs--vertical`. The arrangement is an attribute on an ancestor that Layout resolves.
- The selected look is written against the real state (`aria-selected`), not a parallel `.is-active` class.
- Lattice and Layer have no slice, because a tab set is neither a path nor a plane. Not every sheet has something to say about every component.

## 2. A motion that had to resize a layout track

**The situation.** A "header fold" effect closes the masthead as the reader scrolls. It was a transform only: the box scaled to nothing. On a page whose main frame scrolls inside a fixed viewport, that left the masthead's grid row standing empty and the content never got the space.

**The wrong fixes.**

- Life writes `grid-template-rows` or `height` in its keyframes. Life may not change where a thing sits, and the row is declared by Layout in several plans.
- Layout adds a rule keyed on `[data-header-fold="true"]`. Layout would then know the name of one of Life's scores, and the next motion that wants the same thing needs another rule.

**The handshake.** Life says how open the masthead is, as a number. Layout spends that number on the track.

```css
/* at.life.css - a registered number, so it can interpolate; inherited, so
   everything beside the masthead can spend it too */
@property --masthead-open {
  syntax: "<number>";
  inherits: true;
  initial-value: 1;
}

@keyframes life-masthead-close {
  0%   { --masthead-open: 1; }
  100% { --masthead-open: 0; }
}

/* same clock and range as the box's own fold, so the two edges stay together */
@media (prefers-reduced-motion: no-preference) {
  .Layout[data-header-fold="true"]:is([data-lattice="pages"], [data-lattice="slides"],
      [data-lattice="ribbon"], [data-lattice="card-stack"], [data-lattice="spotlight"]) {
    animation: life-masthead-close linear both;
    animation-timeline: --flow;
    animation-range: 0 var(--header-fold-travel);
  }
}
```

```css
/* at.layout.css - the row is `auto` in every plan and an auto track cannot be
   multiplied, but it is sized by the masthead's margin box */
.Header {
    margin-block-end: calc(var(--masthead-size) * (var(--masthead-open, 1) - 1));
}
```

Details that mattered:

- **Identity at rest.** With `--masthead-open` at 1 the margin is `0px`, so every page that never folds is unchanged. Measured before and after, the grid rows were identical.
- **No fallback on `--masthead-size`, deliberately.** It is a measured fact published by the script. Where it is missing the declaration is invalid and the margin is simply not set.
- **The mechanism was chosen to keep a measurement honest.** Capping the box with `max-block-size` would have fed back into the script that measures the masthead's height. A margin leaves the box its natural size, and the existing transform already draws it that much shorter, so nothing needed clipping.
- **The two halves stop together.** The reduced-motion rules already switched the box's fold off. A track that collapsed under a masthead still standing would put the masthead on top of the content, so the new animation is withheld under the same condition.
- **Life needed no geometry.** It still writes only time: an animation, a timeline and a range.

The general rule: Life may write `transform`, `translate`, `opacity` and `filter` directly, because they do not move the plan. When a motion has to change the plan, Life animates a number and the plan's owner spends it.

## 3. Refactoring a utility-class card

A pricing section written the way utility frameworks encourage. The project has no Atmosphere sheets; its prefix is `app`.

**Before.**

```html
<div class="grid grid-cols-3 gap-6">
  <div class="card bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition duration-200">
    <h3 class="text-xl font-bold text-slate-900">Team</h3>
    <p class="text-4xl font-black text-blue-600">$12</p>
    <button class="btn-primary w-full mt-4" style="background:#2563eb">Choose</button>
  </div>
</div>
```

Every class is an answer: three columns, white, large shadow, 200ms. A dark theme, a compact density or a narrow container each needs the markup edited or a parallel set of prefixed classes.

**After: the markup says what things are.**

```html
<section class="plans" aria-label="Plans" data-cols="fit max-3" data-gap="even" style="--col-chars: 22">
  <article class="plan" data-role="surface" data-pad="open">
    <h3 class="plan-name" data-role="voice">Team</h3>
    <p class="plan-price" data-role="reading">$12</p>
    <button class="plan-choose" type="button" data-role="select" aria-pressed="false">Choose</button>
  </article>
</section>
```

**Each declaration goes to the sheet whose question it answers.**

```css
/* app.components.css - a plan's own shape */
.plan        { display: grid; gap: 0.6rem; align-content: start; min-width: 0; }
.plan-choose { min-block-size: 2.75rem; padding: 0.65rem 0.9rem; cursor: pointer; }
```

```css
/* app.layout.css - the rhythm every local resolves through */
.Layout {
    --layout-gap: calc(clamp(0.75rem, 2vw, 1.5rem) * var(--density-scale, 1));
    --layout-pad: calc(clamp(1rem, 3vw, 2.5rem) * var(--density-scale, 1));
}
[data-density="compact"] { --density-scale: 0.85; }
[data-density="roomy"]   { --density-scale: 1.15; }
.plans { display: grid; }
```

```css
/* app.look.css - the profiles: token values only, and no component names */
[data-look="paper"] { --bg: #ffffff; --text: #0f172a; --accent: #2563eb; --radius-lg: 0.75rem; --face-aspect: 0.52; }
[data-look="night"] { --bg: #0b1020; --text: #e6ebff; --accent: #8ab4ff; --radius-lg: 0.25rem; --face-aspect: 0.52; }

/* app.look.css - the paint, written once against those tokens */
.Layout { background: var(--bg); color: var(--text); }
.plan {
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, currentColor 4%, transparent);
}
.plan-price  { font-size: 2.25rem; font-weight: 900; color: var(--accent); }
.plan-choose { font: inherit; border: 1px solid currentColor; border-radius: var(--radius-lg);
               background: var(--accent); color: var(--bg); }
```

```css
/* app.life.css - roles, never components */
[data-life] [data-role="surface"] { transition: scale var(--transition-interaction, 120ms ease); }
[data-life="pulse"] [data-role="surface"]:hover { scale: 1.03; }
[data-life="still"] [data-role="surface"] { transition: none; }

@media (prefers-reduced-motion: reduce) {
  [data-life] [data-role="surface"] { transition: none; scale: none; }
}
```

```css
/* app.local.css - loads last */
[data-gap="even"] { gap: var(--layout-gap, 1rem); }
[data-pad="open"] { padding: calc(var(--layout-pad, 1rem) * 1.5); }
[data-cols~="fit"] {
    grid-template-columns: repeat(auto-fit, minmax(
        min(100%, calc(var(--col-chars, 24) * var(--face-aspect, 0.55) * 1rem)), 1fr));
}
```

What changed, and why it is better:

- `grid-cols-3` became `data-cols="fit max-3"`: the grid now fits the room it has, and the column width follows the typeface.
- `gap-6` and `p-6` became named steps that move with density.
- `bg-white`, `text-slate-900` and the inline `#2563eb` became the look's tokens. A second look is one line of token values, and the paint rules do not change.
- `hover:scale-105 transition duration-200` became one Life rule on a role. Every surface in the product gets it, and `still` and reduced motion switch it off in one place.
- The plan's own shadow was dropped from the markup. If the look wants one it adds it once; if a plan must stand in front of the page, that is Layer's.

Apply the razor to the result: switch `data-look` and `data-density` and check that every colour, gap and pad moved. What did not move is `0.6rem` and the control's minimum size in the Components sheet, which is intended: they are the part's intrinsic shape, not a choice about this page.
