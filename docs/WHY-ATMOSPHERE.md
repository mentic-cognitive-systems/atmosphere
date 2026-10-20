# Why Atmosphere

> **Describe the meaning once. Compose how people encounter it.**  
> *Don't fight the atmosphere hoping for a tailwind; work with it.*

---

## 1. The Core Idea

Atmosphere explores a fundamental capability of the web: an interface can retain its content, semantic relationships, and working state while dynamically changing how people read, navigate, and act within it. A release plan might be read as an inline document, inspected as a dashboard, worked on across docked panels, or presented as sequential slides.

The crucial payoff is **continuity of work**. A selected task remains the selected task. Its drafts and unsaved notes remain intact. The presentation shifts to support what the person is doing right now without tearing down the underlying application or duplicating component templates.

A tailwind blows in the direction a moving object travels, giving it a transient boost. An atmosphere is the medium through which the object moves. Atmosphere applies that metaphor to web interfaces: rather than fighting the browser's native cascade or baking static values into markup, we make native browser relationships composable so that applications do not need to reinvent visual rules from scratch.

---

## 2. A Fair Critique: Tailwind vs. Atmosphere

### What Tailwind Got Right
Tailwind CSS solved real problems that plagued web development, and any modern alternative must acknowledge those wins:

1. **Constrained token vocabularies.** You cannot easily write `margin: 13px`. A bounded token vocabulary, mechanically enforced, is worth more than voluminous design guidelines nobody reads.
2. **No naming tax.** Developers do not have to invent throwaway wrappers like `.hero-split-inner-wrap`. Naming takes time, produces fragile conventions under deadline pressure, and creates permanent public APIs that teams fear deleting.
3. **Locality of reference.** You inspect the markup and immediately understand its visual intent without hunting through scattered stylesheets or untangling specificity wars.

### What It Cost
To achieve those wins, utility frameworks fused two concerns that belong apart: **what a thing is** and **how much room or style it receives at a specific call site**.

* **Killed dynamics and cascade.** Once a visual value is baked into markup at authoring time, downstream sheets cannot compose with it. Theming becomes a find-and-replace problem. Prefixes like `dark:` or responsive prefixes proliferate combinatorially because the framework discarded the cascade that solves them naturally.
* **Escape hatches admit the defect.** Arbitrary values (`p-[13px]`), `!important` variants, and `@apply` concede that baking hardcoded utilities into markup cannot handle fluid, compositional requirements.
* **Verbosity as a permanent tax.** Dozens of classes are required to describe a simple card, repeated verbatim across every instance.

### The Atmosphere Position

> **A Tailwind utility is a constant. An Atmosphere local is a function of the composition.**

`p-4` is `padding: 1rem`. It was `1rem` when typed, it is `1rem` now, and it will remain `1rem` in every theme shipped. The value has already resolved. It is a dead end in the cascade—to change it, you must find and retype it, or override it with `!important`.

`data-pad="open"` is a **step on a scale owned by the composition**. Change density to `compact`, and the padding tightens. Change Look to a spacious theme, and it expands. It never resolves prematurely in the markup; its job is to declare **how much**, letting the composition sheets determine **how much of what**.

| Dimension | Tailwind | Atmosphere |
|---|---|---|
| **What is this?** | *(No answer — no semantics in markup)* | `class` / semantic element — an addressable entity |
| **How is it composed?** | Class attribute at the call site | Concern sheets (`layout`, `lattice`, `layer`, `look`, `life`, `lens`) |
| **How much of it?** | Class attribute at the call site | `data-*` locals at the call site |

Locality where locality helps; the cascade where the cascade helps.

---

## 3. The Web as a Model of an Experience

The front-end stack is organized around distinct, complementary responsibilities. Historically, these responsibilities have been divided among HTML, CSS, SVG, and JavaScript and we named them accordingly.  But if we view the stack through the lens of Atmosphere, we can reinterpret these technologies more philosophically; in terms of their roles in modeling and presenting an experience.

| Technology | Regular Name | Architectural Responsibility | Practical Role in Atmosphere |
|---|---|---|---|
| **HTML** | Hypertext Markup Language | *Hyperlinked Topological Modeling Language* | Describes entities in containment hierarchies using semantics and references. |
| **CSS** | Cascading Style Sheets | *Composable State System* | Resolves presentation from structure, context, preferences, and state via a cascade of rules. |
| **SVG** | Scalable Vector Graphics | *Symbolic Visual Geometry* | Describes paths, shapes, and coordinate systems when explicit geometry matters. |
| **JavaScript** | JavaScript | *Junction Specification* | Connects change control to events, user actions, computations, and state |

These responsibilities naturally compose; HTML provides structure and native accessibility; CSS handles layout and presentation through a cascade of style rules, and transitions; SVG expresses derived spatial models (such as task dependency graphs); JavaScript orchestrates state changes and manages adapters.

---

## 4. One Semantic Interface, Several Presentations

"Page," "dashboard," "slides," and "workspace" are not incompatible template silos. They are different compositions of shared structure and behavior:

| Experience | Arrangement | Traversal | Supporting Interaction |
|---|---|---|---|
| **Reading** | Content in source order; supporting content inline | Continuous vertical flow | Anchors, links, and native scrolling |
| **Dashboard** | Summary and detail regions side-by-side or stacked | Simultaneous panes or active view | Filtering, drill-down, and selection |
| **Workspace** | Central work area with navigation and inspector | Independent path per frame | Selection, editing, drawers, and modal dialogs |
| **Presentation** | Bounded stage with supporting material on demand | Horizontal sequence / paging | Step advance, slide navigator, speaker notes |

The core architectural commitment is **one semantic model, several compatible presentations**. A single task document can be read continuously, operated as a dashboard, edited in a multi-pane workspace, or projected as a slide sequence without rewriting its semantic markup.

---

## 5. The Spatial Triad and System Concerns

Atmosphere organizes interface presentation around a geometric spatial triad, complemented by appearance, motion, and experience policy:

| Dimension / Concern | Cognitive Definition | Spatial Domain | Sheet |
|---|---|---|---|
| **Layout** | *"Location Across Yield Organized Under Total"* | The 2D Flat Plane ($X \times Y$) | `at.layout.css` |
| **Layer** | *"Level Across Yield Evaluates Relationships"* | Multiple flat planes creating a cube ($Z$-strata) | `at.layer.css` |
| **Lattice** | *"Laterals Across Tied Totals Instruct Controlled Evaluation"* | Traversals across a flat plane stack | `at.lattice.css` |
| **Look** | Appearance: typography, colour palettes, and textures | Surfaces & Materials | `at.look.css` |
| **Life** | Motion: interactive feedback, crossings, and transitions | Temporal Dynamics | `at.life.css` |

* **Layout (2D Flat Plane):** Allocates the total yield into spatial locations: 2D grid areas, columns, and shared spacing scales across a flat surface.
* **Layer (3D Stack of Planes):** Evaluates depth levels and inter-plane relationships: whether auxiliary regions sit flush in the base plane or elevate into the top layer as drawers, popovers, or modals.
* **Lattice (Traversal Matrix):** Coordinates how the observer's vantage point, camera, or scroll traverses connected totals: continuous flow, paged cards, slides, or instrument grids.
* **Look:** Supplies materials, typeface metrics, color palettes, and surface elevations.
* **Life:** Provides interactive feedback, transitions, and animations honoring reduced-motion preferences.
* **Lens (Experience Policy):** Coordinates cross-cutting defaults, timing, and token seeds across all concerns.

### Layout, Layer, and Lattice in Practice
Consider a guide accompanying an article:
* **Layout (2D Plane):** On desktop, the guide occupies a right-hand sidebar slot in the 2D grid.
* **Layer (3D Level):** On a smaller screen or by user preference, the guide elevates into the top layer as a slide-out drawer, releasing its 2D grid allocation on the base plane.
* **Lattice (Traversal):** The guide's chapters remain paged sequentially (`data-lattice="pages"`) whether docked in the 2D plane or elevated in a 3D drawer, while the article flows continuously.

```html
<aside class="Guide" data-frame data-lattice="pages">
  <div data-track>
    <section data-view="stage">Orientation</section>
    <section data-view>Worked Example</section>
  </div>
</aside>
```

A **frame** defines the region of encounter; its **track** groups related views; a **view** is a discrete unit of content. Local frames choose their own traversal; nested frames never accidentally inherit the root frame's navigation behavior.

---

## 6. Semantic Composition and the Local Contract

A semantic address lets multiple concerns meet cleanly at a single element:

```html
<article class="release-task" data-role="surface" data-state="active" data-pad="open">
  <h3>Publish Release Notes</h3>
  <p>Explain changes and compatibility.</p>
</article>
```

* The element and class (`release-task`) name a reusable kind; a stable ID
  addresses a particular instance where references require one.
* `data-role="surface"` requests a shared surface treatment from Look.
* `data-state="active"` allows Life to animate or highlight the active item without knowing domain details.
* `data-pad="open"` requests a proportional step on the layout spacing scale.

The [README's semantic contract](../README.md#the-core-principle-semantic-addresses-are-the-composition-contract)
makes this the authoring principle: name identity, kind, place, required/optional
parts, roles, real states, and bounded constraints separately. Scoped `data-part`
addresses in light DOM and native public `part` addresses in shadow DOM let
concerns compose against meaningful constituents. Names carry maintained
contracts and actual consumers; they do not infer behavior on their own.

### The Local Contract
A local sets the **quantity** or **constraint** of something a concern already defines. It never introduces raw visual values (no hex codes, no pixel lengths, no durations).

> **The Razor:** If changing `data-look` or `data-density` can never move the result, it is not a local—it is a hardcode, and it belongs nowhere.

#### Rules of the Contract:
1. **Locals are named, not numbered.** `data-gap="open"`, not `data-gap="4"`. Names represent positions on a scale, not fixed scalar quantities.
2. **Locals resolve through tokens.** Rules compute over custom properties (`--layout-gap`, `--face-aspect`).
3. **Locals form a bounded enumeration.** The specification defines five standard local attributes:

| Attribute | Values | Function |
|---|---|---|
| `data-cols` | `fit`, `1`–`4`, `lead`, `max-2`–`max-4` | Track count and responsive fitting |
| `data-gap` | `none`, `tight`, `close`, `even`, `open`, `wide` | Space between sibling elements |
| `data-pad` | `none`, `tight`, `close`, `even`, `open`, `wide` | Internal padding |
| `data-z` | `-4` … `3` | Shared depth plane (haze, elevation, projection) |
| `data-span` | `1`, `2`, `3`, `all` | Child track span |

#### The Measure Contract and Worked Proof
Atmosphere uses typeface metrics to calculate content-informed track minimums:

```css
[data-cols~="fit"] {
  grid-template-columns: repeat(auto-fit, minmax(
    min(100%, calc(var(--col-chars, 24) * var(--face-aspect) * 1em)), 1fr));
}
```

Switching Look from Montserrat to a monospace or pixel face automatically updates `--face-aspect`, allowing the grid to reflow accurately according to real character widths.

**Worked Proof:** Before locals were introduced, `at.components.css` contained:
```css
.flow-columns       { grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr)); }
.frame-sample-grid  { grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); }
.layer-grid         { grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); }
.feature-grid       { grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); }
```
Four distinct classes, four public APIs, but only one number was different. With the local contract, these collapsed into:
```html
<div class="tasks" data-cols="fit" style="--col-chars: 24">…</div>
```
A single rule in `at.local.css` serves all variations without minting new class names.

---

## 7. Giving the Composition a Body

JavaScript connects user intent to state mutations. To make presentations truly composable, state ownership must be cleanly separated:

* **Domain state** (tasks, records, unsaved drafts) belongs to the host application.
* **Presentation coordinate** (layout, look, lattice, life, layer, lens) belongs to `AtmosphereModel`.
* **Frame navigation** tracks the active view ID per frame.
* **System adapters** synchronize this state with the DOM, URL (`#route?at=coord`), local storage, and controls.

When a user switches from reading an article to inspecting a release dashboard, the application draft does not reset, and the selected task remains focused. For full details on the reactive model, see [STATE-MODEL.md](./STATE-MODEL.md).

---

## 8. Costs and Limitations

Atmosphere requires authors to adopt semantic HTML and understand a shared vocabulary. It is not a drop-in replacement for single-use landing pages or simple static sites where presentation never varies. Its power pays off when:
* Content must be encountered in multiple modes (reading, dashboard, slides, workspace).
* Theming and responsive reflow must adapt dynamically to user preferences and context.
* Long-lived tasks require state and draft continuity across presentation changes.

---

## Navigation & References

* [VOCABULARY.md](./VOCABULARY.md) — Comprehensive reference of concerns, dimensions, roles, and cascade architecture
* [STATE-MODEL.md](./STATE-MODEL.md) — Reactive JavaScript state model, system adapters, and motion interop
* [PRESENTATIONS.md](./PRESENTATIONS.md) — Presentation families, semantic places, and compound workspace recipes
* [TUTORIAL-VISION.md](./TUTORIAL-VISION.md) — Proposed 8-step tutorial redesign and acceptance criteria
* [README.md](../README.md) — Getting started and quickstart guide
