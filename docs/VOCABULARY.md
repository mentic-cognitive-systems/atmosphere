# Atmosphere Semantic Vocabulary & Concern Reference

> **Canonical specification for Atmosphere concerns, dimensions, profiles, roles, locals, and cascade layers.**  
> *Machine-readable inventory: [vocabulary.json](./vocabulary.json)*

---

## 1. The Kinds of Names

Atmosphere distinguishes between taxonomies (grouping concepts) and contracts (declaring requirements, dependencies, and contributions). The naming model is organized into the following kinds:

| Kind | Architectural Meaning | Examples |
|---|---|---|
| **Instance Identity** | A particular addressed region or authoritative model subject | Unique HTML `id` where referenced; stable domain ID |
| **Kind** | A reusable meaningful structure or capability | Native/custom element, `.experiment`, `.release-task` |
| **Part** | A constituent scoped to its owning kind | `data-part="explanation"`, `"demonstration"`, `"controls"`, `"evidence"` |
| **Concern** | A primary family of visual/interaction responsibilities | Arrangement, Traversal, Appearance, Motion |
| **Dimension** | A named choice/axis within a concern | `layout`, `layer`, `lattice`, `look`, `life`, `lens` |
| **Value / Profile** | A registered option bundling specific CSS rules | `layout.stacked`, `lattice.pages`, `look.blueprint` |
| **Role** | A reusable presentation responsibility of an element | `surface`, `voice`, `select`, `track`, `frame` |
| **State** | A condition supplied by application behavior or host | `active`, `alert`, `live`, `stage` |
| **Property** | A typed token shared between concerns | `--layout-gap`, `--face-aspect`, `--layer-z` |
| **Local** | A bounded quantity or constraint declared at an element | `data-gap="close"`, `data-cols="fit max-3"` |
| **Recipe** | A named composition of choices, bindings, and requirements | Reading layout with paged guide in an on-demand drawer |
| **Presentation Family** | A recognizable organization of an overall experience | Document, Workspace, Dashboard, Spatial |
| **Semantic Place** | A region's responsibility within an experience | Inspector, Navigator, Editor, Stage, Toolbar |
| **Relationship** | Positional or coordination relation between entities | Beside editor, anchored to selection, synchronized clock |
| **Composition Pattern**| Reusable coordination of places and scoped state | Collection–detail, tabbed documents, synchronized timeline |

### Semantic addresses form the authoring contract

The [README's core principle](../README.md#the-core-principle-semantic-addresses-are-the-composition-contract)
governs these names. Declare identity, kind, place, required/optional parts,
roles, real states, and bounded constraints before composing presentation.
Each kind also declares its state owner, inputs/actions, tokens, supported
compositions, and optional-capability fallback.

`data-part` names application parts in light DOM and is scoped to the owning
kind, for example `.experiment > [data-part="controls"]`. Names may repeat
between instances; IDs used for references remain unique. Public shadow internals
use native `part`/`exportparts` and inherited tokens. Custom attributes add an
application agreement; native elements retain their browser/accessibility semantics.

Component-owned structure addresses kinds and scoped parts. Look profiles remain
token-based, and shared Life scores remain role-based. Names must have real
consumers and continuity checks; annotation alone supplies neither styling nor
behavior. No new composition axis or URL codebook value is introduced by this grammar.

---

## 2. The Spatial Core: Layout, Layer, & Lattice

Atmosphere models interface geometry using three complementary spatial dimensions: a 2D flat plane, a 3D stack of planes, and a traversal matrix across that stack. These are governed by three precise cognitive definitions:

* **LAYOUT — *"Location Across Yield Organized Under Total"***
  * **Geometry:** The 2D Flat Plane ($X \times Y$).
  * **Meaning:** Allocates the total yield (the bounded 2D area) into coordinated spatial locations, columns, and tracks.
* **LAYER — *"Level Across Yield Evaluates Relationships"***
  * **Geometry:** Multiple flat planes creating a cube ($Z$-strata).
  * **Meaning:** Stratifies space into levels of elevation, evaluating relationships between planes (occlusion, elevation, modal capture, and top-layer projection).
* **LATTICE — *"Laterals Across Tied Totals Instruct Controlled Evaluation"***
  * **Geometry:** Traversals across a flat plane stack (The Navigation Matrix).
  * **Meaning:** Coordinates how an observer’s vantage point, camera, or scroll traverses connected totals (views, stages, panes, and stacked planes).

Together with **Appearance** (`at.look.css`), **Motion** (`at.life.css`), and **Experience Policy** (`at.lens.css`), they form the Atmosphere concern system:

```
                     ┌────────────────────────────────┐
                     │     Experience Policy (Lens)   │
                     └───────────────┬────────────────┘
                                     │ seeds & constraints
          ┌──────────────────┬───────┴──────────┬──────────────────┐
          ▼                  ▼                  ▼                  ▼
    [ Spatial Core ]    [ Traversal ]     [ Appearance ]       [ Motion ]
     2D Plane (Layout)   Path & Camera     Surface (Look)      Feedback (Life)
    +3D Stack (Layer)     (Lattice)
```

---

### 2.1 The Spatial Dimensions & Implementation Contracts

#### 1. Layout — 2D Plane (`data-layout`, `at.layout.css`)
* **Cognitive Definition:** *"Location Across Yield Organized Under Total"*
* **Core Question:** How is 2D space partitioned across the flat plane of a surface or viewport?
* **Responsibility:** Owns 2D grid areas, outer track templates, responsive breakpoints, flex flows, and the fundamental spacing scale. Every plane (the root page, a drawer canvas, or a card) carries its own 2D layout.
* **Assigned CSS:** `display: grid`, `grid-template-*`, `grid-area`, `display: flex`, `flex-*`, `width`, `height`, `min/max-*`, `gap`, `padding`, `margin`, `columns`.
* **Registered Values:** `default`, `3col`, `sidebar-right`, `stacked`, `hero`.

#### 2. Layer — 3D Stack of Planes (`data-layer`, `at.layer.css`)
* **Cognitive Definition:** *"Level Across Yield Evaluates Relationships"*
* **Core Question:** Which depth level does a region occupy, and how does it relate to other planes in the stack?
* **Responsibility:** Slices the depth axis ($Z$) into discrete levels and evaluates inter-plane relationships. Manages presence (flush in the base plane vs. elevated into the top layer), modal containment, backdrop obscuration, and publishes plane altitude tokens (`--layer-z`, `--page-far`).
* **Assigned CSS:** `z-index`, `isolation: isolate`, Popover API (`[popover]`, `::backdrop`), `<dialog>` top-layer promotion, `position: fixed | absolute | sticky` (for plane detachment), `box-shadow`, `filter: drop-shadow()`, `backdrop-filter`, `opacity`.
* **Registered Values:** `inline`, `top-left-edge-drawer`, `top-menu`, `pop-over`.
* **Per-Frame Level:** Layer publishes each panel frame's level as `--plane-altitude` (0 on the base plane, `--layer-z` once lifted), and the controller promotes exactly the frames above zero. A frame that names the edge it belongs to with `data-edge` (implemented: `block-end`) is lifted onto that edge by the edge projections (`top-left-edge-drawer`, `top-menu`) and stays in the plan under `pop-over`; a frame that names no edge is lifted by every projection.

> **Note on Naming:** Capital-L **Layer** is Atmosphere's 3D level/projection axis. Lowercase CSS **cascade layers** (`@layer`) govern stylesheet declaration precedence.

#### 3. Lattice — Traversal Across the Stack (`data-lattice`, `at.lattice.css`)
* **Cognitive Definition:** *"Laterals Across Tied Totals Instruct Controlled Evaluation"*
* **Core Question:** How does the observer's vantage point, camera, or scroll travel across or through the stack of connected totals?
* **Responsibility:** Owns scrollports, scroll-snapping, view sequencing within a frame, perspective/camera framing (`--camera`), view transitions, and lateral navigation between connected planes or stages.
* **Assigned CSS:** `overflow`, `overflow-x/y`, `scroll-snap-type`, `scroll-snap-align`, `scroll-padding`, `animation-timeline: scroll() / view()`, `view-transition-name`, `perspective`, `perspective-origin`, `transform-style: preserve-3d`, spatial focus navigation (`:focus-visible`).
* **Registered Values:**
  * `continuous`: Standard vertical document flow.
  * `pages`: Distinct vertical paged sections.
  * `slides`: Discrete horizontal or fullscreen slide sequence.
  * `ribbon`: Continuous horizontal flow.
  * `card-stack`: Stacked depth cards traversed sequentially.
  * `spotlight`: Focused hero view with peripheral previews.
  * `control`: Bounded instrument grid with internal viewports.
  * `app`: Multi-pane application wall with independent internal scrollports.

---

### 2.2 Appearance: Materials & Type (`data-look`, `at.look.css`)

* **Core Question:** How are typography, color palettes, surfaces, and textures expressed?
* **Responsibility:** Look defines visual materials and publishes typographic facts such as `--face-aspect` and `--look-density`. Placement and local rules consume these metrics to adjust spacing and track calculations.
* **Typographic Scaling:** Controlled via `data-size` (`xs`, `s`, `m`, `l`, `xl`).

---

### 2.3 Motion: Feedback & Crossings (`data-life`, `at.life.css`)

* **Core Question:** How are interactive feedback and state changes presented over time?
* **Responsibility:** Life supplies transitions, state animations, and gesture responses while strictly honoring reduced-motion preferences.
* **Registered Values:** `still`, `pulse`, `wiggle`, `3d`, `glitch`, `crazy`.
* **Supporting Axes:**
  * `data-scroll-flow`: `still`, `reveal`, `parallax`.
  * `data-inout-flow`: `show`, `slide`, `slam`, `flip`, `materialize`, `focus`.
  * Micro-toggles: `headerFold`, `heartbeat`, `flap` (`true` / `false`).

---

### 2.4 Experience Policy: Defaults & Seeds (`data-lens`, `at.lens.css`)

* **Core Question:** What design intent guides starting defaults and ongoing cross-cutting constraints?
* **Responsibility:** A Lens seeds starting choices across all concerns and supplies tokens for timing, emphasis, and depth. Overriding an individual axis preserves explicit user intent while retaining the Lens's cross-cutting tokens. Clearing to `none` removes policy contributions.
* **Registered Values:** `none`, `productive-data-dense`, `expressive-gamified`, `cinematic-luxury`, `stealth-terminal`, `institutional-reassuring`.

---

## 3. Frame Structure & Traversal Conventions

Atmosphere structures content traversal around four semantic conventions:

```html
<main class="Main" data-frame="root">
  <div class="main-shell" data-track>
    <section data-view="stage">Orientation</section>
    <section data-view>Worked Example</section>
    <section data-view>Reference</section>
  </div>
</main>
```

| Element / Attribute | Definition | Architectural Role |
|---|---|---|
| `data-frame` | Frame | The bounded region through which content is encountered. |
| `data-track` | Track | The container grouping sequenced views within a frame. |
| `data-view` | View | A discrete unit of content or step in a sequence. |
| `data-view="stage"`| Stage | The primary distinguished view currently in focus or selected. |

* **Scoping Rule:** The root frame obeys the global `data-lattice`. Subordinate or nested frames (such as an auxiliary guide or sidebar) explicitly declare their own `data-lattice` or default to continuous flow.

---

## 4. The Registered Look Profiles

Atmosphere registers 31 canonical Look profiles. In official URL codebook order, these are:

```text
apple, android, microsoft, temple, citadel, tux, luxury, parchment,
typewritter, newspaper, origami, comic, school, lab, blueprint,
museum, western, nightclub, urban, crt, cyberpunk, hologram,
arcade, starfield, deepsea, storm, vaporwave, thermal, fortress,
vault, midcentury
```

*(Note: `typewritter` is preserved as the wire identifier for backward compatibility; human-facing interfaces display it as "Typewriter".)*

---

## 5. The Local Contract Specification

A local attribute sets the **quantity or structural constraint** of an existing concern directly at the element call site without introducing un-cascaded visual values.

### The Standard Local Attributes

| Attribute | Valid Values | Resolution Contract |
|---|---|---|
| `data-cols` | `fit`, `1`, `2`, `3`, `4`, `lead`, `max-2`, `max-3`, `max-4` | Computes grid tracks. `fit` uses `--col-chars` and `--face-aspect`. |
| `data-gap` | `none`, `tight`, `close`, `even`, `open`, `wide` | Resolves through `--layout-gap` and active density. |
| `data-pad` | `none`, `tight`, `close`, `even`, `open`, `wide` | Resolves through `--layout-pad` and active density. |
| `data-z` | `-4` … `3` | Sets depth plane for elevation, haze, and projection. |
| `data-span` | `1`, `2`, `3`, `all` | Dictates how many grid columns a child occupies. |

### Density & Spacing Steps
* `even` represents 1.0× (the composition's base unit).
* Steps: `none` (0), `tight` (0.25×), `close` (0.5×), `even` (1.0×), `open` (1.5×), `wide` (2.0×).
* Density scale (`data-density="compact"`, `"cozy"`, `"roomy"`) scales the root variables (`--layout-gap`, `--layout-pad`), ensuring all local paddings and gaps shift proportionally.

---

## 6. CSS Architecture & Cascade Layers

### Planned Cascade Layer Hierarchy

Atmosphere's concern sheets act as conceptual layers. A planned migration will make this explicit via CSS `@layer`:

```css
@layer at.reset, at.components, at.layout, at.lattice,
       at.layer, at.look, at.life, at.lens, at.local;
```

### Precedence & Migration Invariants
1. **All-or-Nothing Wrapping:** In CSS, unlayered author styles outrank layered styles regardless of specificity. Moving only some sheets into `@layer` would cause unlayered rules to improperly override layered rules. Migration must wrap all sheets simultaneously.
2. **Locals Outrank Concerns:** `at.local` is placed last in the layer declaration so that local quantity choices override default component or layout rules cleanly without requiring `!important`.
3. **Lens Handoff:** Token fallbacks (such as `var(--lens-enter-time, var(--enter-time))`) resolve values without cascade specificity conflicts.

---

## Navigation & References

* [WHY-ATMOSPHERE.md](./WHY-ATMOSPHERE.md) — Philosophy, design rationale, and Tailwind comparison
* [STATE-MODEL.md](./STATE-MODEL.md) — Reactive JavaScript state architecture and adapters
* [PRESENTATIONS.md](./PRESENTATIONS.md) — Presentation families, semantic places, and workspace recipes
* [vocabulary.json](./vocabulary.json) — Complete machine-readable data catalog
