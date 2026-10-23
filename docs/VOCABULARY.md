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

### Concerns and Precedence

**Concerns organize decisions. Cascade layers establish precedence.
Attributes name choices; custom properties carry them into composition.**

The six concern names identify ownership. Capital-L **Layer** owns presence and
projection. Native `@layer` orders competing declarations; it establishes no
visual depth, stacking context, or browser top-layer membership. A file named
`at.layer.css` has no automatic relationship to a cascade layer.

`data-*` attributes declare semantic addresses, named choices, and application
facts. CSS bindings translate those choices into custom properties. Public
policy properties carry author intent; shared tokens connect concerns; internal
resolved properties publish results. Document which properties are author inputs
and which are outputs. In the laboratory, rendered dimension attributes are
adapter outputs, with requested values kept separately in `data-contract-*`.

### Proposed precedence pattern

For a new layered integration, establish precedence by the purpose of a
declaration:

```css
@layer at.defaults, at.composition, at.policy;
```

| Cascade layer | Purpose |
|---|---|
| `at.defaults` | Vocabulary defaults and Lens recipes that establish a starting experience |
| `at.composition` | Component and concern rules that bind responsibilities, resolve conditions, and render the result |
| `at.policy` | Explicit author choices and bounded local refinements through documented inputs |

The [README example](../README.md#composition-and-precedence) shows a Lens default
and an explicit navigation policy declared on the same host. Composition
consumers interpret the resulting policy and provide capability fallbacks. A
later policy layer does not itself enforce accessibility, capability constraints,
or relationships between properties; those need explicit consumers and checks.

Concern sections may be organized within these layers where useful. There is no
required one-to-one mapping between files, concerns, and cascade layers. A Lens
can contribute recipe defaults and experience-specific rendering rules in their
respective layers. Ordering Life after Look should not substitute for deciding
which concern owns a property. When concerns cooperate, publish tokens with
clear consumers instead of relying on repeated overrides of the same property.

This pattern replaces the earlier proposed universal ordering of the six
concerns. It is guidance for new integrations, not an implemented bundle migration.
`at.simple.css` currently uses `vocabulary, lens, components, layout, presence,
lattice, look, life`; the shared concern sheets and laboratory contract remain
unlayered.

### Precedence and integration rules

- **Establish order before contributions.** Declare the intended layer order
  before the first rules or imports that create those layers. Assign rules with
  `@layer` blocks or `@import … layer(…)`; an order statement alone does not wrap
  linked stylesheets.
- **Plan the migration boundary.** Normal unlayered author declarations outrank
  normal layered author declarations, regardless of specificity. Wrapping only
  selected shared sheets can reverse their existing relationships. Migrate the
  cooperating sheets together, or explicitly account for remaining unlayered
  rules and application overrides.
- **Keep policies on their owning host.** Cascade layers resolve declarations
  on the same element. A declaration directly on a child takes precedence over
  an inherited custom-property value, regardless of the parent's layer. Avoid
  descendant defaults that shadow an intentionally inherited policy.
- **Refine through public inputs.** Local quantity bindings should contribute
  bounded tokens consumed by the owning concern. Give an explicit choice priority
  over its default without replacing unrelated rendering mechanics. Inline
  normal policy declarations outrank normal stylesheet declarations on that host;
  removing the inline declaration restores stylesheet resolution.
- **Keep importance exceptional.** `!important` reverses cascade-layer order:
  important declarations in earlier layers outrank those in later layers, and
  layered important declarations outrank unlayered important declarations.
  It cannot serve as the routine mechanism for explicit policy.
- **Preserve token handoffs.** `var(--lens-enter-time, var(--enter-time))`
  expresses a consumer's preference between two inputs. That fallback relationship
  is separate from the cascade that determines each input's value.

These rules follow the [CSS cascade specification](https://www.w3.org/TR/css-cascade-5/#layering).

### Web-component boundaries

A component declares its public inherited tokens, supported host choices, and
native `part`/`exportparts` addresses. `data-part` remains a scoped application
address in light DOM; it does not expose shadow internals. A host attribute needs
a consumer, such as an internal `:host([data-navigation="embedded"])` binding.
Components should avoid redeclaring public inherited tokens internally when
those tokens are meant to accept host values; use fallback values at consumers
or separate internal tokens as needed.

Each shadow tree has its own cascade-layer ordering. Reusing `at.policy` inside
a component does not connect its precedence to the document's `at.policy` layer.
Normal outer-context declarations take precedence over normal inner-context
declarations when both style the same element; important declarations reverse
that context order. Layer names cannot override those encapsulation rules. See
the specification's [encapsulation context](https://www.w3.org/TR/css-cascade-5/#cascade-context)
and [layer naming](https://www.w3.org/TR/css-cascade-5/#layer-names) rules.

---

## Navigation & References

* [WHY-ATMOSPHERE.md](./WHY-ATMOSPHERE.md) — Philosophy, design rationale, and Tailwind comparison
* [STATE-MODEL.md](./STATE-MODEL.md) — Reactive JavaScript state architecture and adapters
* [PRESENTATIONS.md](./PRESENTATIONS.md) — Presentation families, semantic places, and workspace recipes
* [vocabulary.json](./vocabulary.json) — Complete machine-readable data catalog
