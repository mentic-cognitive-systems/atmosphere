# Giving Atmosphere a Body: State Architecture & Reactive Model

> **Architecture RFC: A Reactive JavaScript State Model and System Adapters for Atmosphere.**  
> *Canonical Name: `AtmosphereModel`*  
> *Status: Partially implemented; public API proposed.*

---

## 1. Executive Summary

Atmosphere allows a semantic interface to transform its presentation dynamically while preserving a user's working state. Changing from an inline article to a multi-pane workspace is genuinely useful only when the selected entity, its active draft, and the user's focus survive the transition.

The presentation concerns are Arrangement (Placement + Projection), Traversal, Appearance, Motion, and Experience Policy (Lens). Today, the controller reads and applies these attributes, manages view transitions, and synchronizes a compact URL codebook.

However, state has historically been fragmented across DOM attributes, mismatched `<html>` and `<body>` targets, and multiple `localStorage` keys. **`AtmosphereModel`** establishes an authoritative, reactive state model that serves as the single source of truth for all composition state:

```
                         AtmosphereModel
                  coordinate + revision + events
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
        DOM Adapter          URL Adapter      Persistence Adapter
    root/body attributes   route + ?at=      atomic single record
             │                    │                    │
             └──────────────┬─────┴─────────────┬──────┘
                            │                   │
                      Drawer / Tray       Host Subscribers
```

CSS remains the rendering engine. The JavaScript model records decisions and publishes facts; it does not calculate or inline visual styles that belong in the cascade.

---

## 2. State Ownership Boundaries

Clear boundaries prevent presentation switches from corrupting application state:

| State Kind | Owner | Practical Example |
|---|---|---|
| **Domain Records & Drafts** | Host Application | A release task, its status, unsaved author notes |
| **Domain Selection & Filters**| Host Interaction State | Active item ID, search query, filter facets |
| **Presentation Coordinate** | `AtmosphereModel` | Layout, Lattice, Layer, Look, Life, Lens, density |
| **Per-Frame Pacing Position** | Frame Navigation Adapter | Current view ID and scroll position within each frame |
| **Transient Interaction** | Native Controls & Adapters | Open/closed drawer state, focus return, modal dialogs |
| **Physical Measurements** | Measurement Adapter / CSS | Used masthead height, available container width |

**The Golden Rule:** Presentation changes never rewrite domain records or discard uncommitted drafts. If an entity is selected in a dashboard and the user switches to a workspace, an adapter ensures that the entity remains selected and visible in the new presentation.

---

## 3. Core Defects in the Legacy Distributed Model

1. **Target Desynchronization (`<html>` vs `<body>`):** Web components like `<atheme-drawer>` historically targeted `document.body`, while host application scripts inspected `document.documentElement`. When switching lattice or look, readers querying the root saw stale attributes.
2. **Fragmented Persistence:** Legacy code wrote separate keys (`selectedLook`, `selectedLattice`, `selectedDensity`). Partial writes could assemble coordinates that never existed as a single committed state.
3. **URL Hash Collisions:** Host applications encode routes (`#task/123`), while Atmosphere encoded coordinates (`#at=...`). Independent hash writers overwrote each other. The composite standard resolves this:
   ```text
   #<application-route>?at=<compact-coordinate>
   ```
4. **Stale Pacing on Filtered Nodes:** When host scripts hid elements (e.g. via `.hidden`), hidden nodes retained `data-view` and `--lattice-index`. Lattice keyboard navigation stalled on hidden items.
5. **Unowned Physical Measurements:** Dynamic measurements (such as masthead height) were scattered across frame loops, causing layout thrashing.

---

## 4. Target Public Interface

```typescript
interface AtmosphereCoordinate {
  layout: string;
  lattice: string;
  layer: string;
  look: string;
  life: string;
  lens: string;
  scrollFlow: string;
  inoutFlow: string;
  density: string;
  size: string;
  tabs: string;
  headerFold: boolean;
  heartbeat: boolean;
  flap: boolean;
}

interface AtmosphereChange {
  coordinate: Readonly<AtmosphereCoordinate>;
  changed: readonly (keyof AtmosphereCoordinate)[];
  source: string;
  revision: number;
}

interface AtmosphereModelContract extends EventTarget {
  readonly current: Readonly<AtmosphereCoordinate>;
  readonly revision: number;
  set(axis: keyof AtmosphereCoordinate, value: unknown, options?: object): void;
  setComposition(patch: Partial<AtmosphereCoordinate>, options?: object): void;
  tokens(): Readonly<Record<string, string | number>>;
  subscribe(listener: (change: AtmosphereChange) => void): () => void;
}
```

The canonical event dispatched on state changes is **`atmosphere:change`**.

---

## 5. Model Invariants

1. **One Committed Coordinate:** All changes are validated and committed as an atomic revision.
2. **Immutable Snapshots:** Subscribers receive frozen snapshot objects and an array of explicitly changed keys.
3. **CSS Owns Visual Resolution:** The coordinate contains symbolic decisions, never computed pixel dimensions or colors. `tokens()` provides read-only observation for hosts without establishing a competing style engine.
4. **Replaceable Adapters:** DOM, URL, persistence, and UI controls observe the model; they do not couple to one another.
5. **Backward-Compatible Wire Formats:** Compact URL codebooks are strictly append-only.
6. **Reduced-Motion Authority:** When Life is `still` or the user prefers reduced motion, transitions execute instantly.
7. **Work Continuity:** Presentation changes never clear domain selection, focus, or form inputs.
8. **Synchronous Commit, Asynchronous Effects:** Coordinates commit synchronously; view transitions, storage, and telemetry execute downstream without feedback loops.

---

## 6. System Adapters

### 6.1 DOM Adapter
* Writes committed attributes synchronously to both `<html>` and `<body>` (e.g., `data-layout`, `data-look`, `data-lattice`).
* Manages `data-crossing` during view transitions.
* Uses a guarded `MutationObserver` to absorb external attribute changes without triggering feedback loops.

### 6.2 URL Adapter
Encodes coordinates in a compact, positional format:
```text
#route/path?at=look.layout.life.density.size.tabs/lattice.layer.scroll.inout.lens/flags
```
* The application owns the route before `?`.
* Atmosphere owns the `at` parameter.
* The codebook is strictly append-only; indices never shift across releases.

### 6.3 Persistence Adapter
Atomically persists the complete coordinate in `localStorage` under `atmosphere:composition`:
```json
{
  "version": 1,
  "coordinate": {
    "look": "blueprint",
    "layout": "default",
    "lattice": "continuous"
  }
}
```
* Migrates legacy separate keys (`selectedLook`, etc.) on first read.
* Listens for `storage` events across tabs to synchronize multi-window state seamlessly.

### 6.4 Visibility & Pacing Protocol
When hosts filter views (e.g. search results), the visibility adapter reconciles traversal:
1. Capture the active view ID and focus state.
2. Strip `data-view` and `--lattice-index` from filtered/hidden elements.
3. Sequentially index visible items from 1.
4. Designate the first visible view as `data-view="stage"`.
5. Restore focus and notify the Lattice controller.

### 6.5 JavaScript Motion Interoperability
Atmosphere coordinates with JavaScript animation libraries under a clear rule:

> **The library animates; the axis decides.**

JavaScript animation libraries (GSAP, Framer Motion, Web Animations API) read durations and easing curves directly from the CSS composition rather than hardcoding constants:

```javascript
const css = getComputedStyle(element);
const duration = parseFloat(
  css.getPropertyValue('--lens-enter-time') ||
  css.getPropertyValue('--enter-time')
) / 1000;

animate(element, { y: 0, opacity: 1 }, { duration });
```

#### Ownership Boundary:
| Concern in `at.life.css` | Appropriate for JS Animation Library |
|---|---|
| Hover, focus, press, and state feedback | Complex physics (springs, momentum) |
| Layout and enter/exit view transitions | Gesture-driven drag, pan, pinch |
| Ambient material motion | FLIP layout across DOM reparenting |
| Reduced-motion enforcement | Interactive scrubbing and canvas timelines |

Inline animation styles outrank stylesheet rules. Animation scripts must clean up inline style overrides upon completion so that subsequent theme changes can continue to control appearance.

---

## 7. Migration Plan

* **Phase 1 (Freeze & Observe):** Standardize root/body mirroring and compact URL parsing; deploy experimental `AtmosphereModel` wrapper in demos (`live-object.html`).
* **Phase 2 (Authoritative Core):** Implement validation, immutable revisions, and adapter abstractions in `js/atmosphere-model.js`.
* **Phase 3 (Migrate Controls & Hosts):** Rewire `<atheme-drawer>`, `<atheme-tray>`, and host applications to consume `window.AtmosphereModel`.
* **Phase 4 (Deprecation & Cleanup):** Sunset individual legacy `localStorage` keys; finalize public API.

---

## 8. Acceptance Criteria

The reactive state architecture is validated when:
1. A single setter call commits one immutable revision; DOM, URL, and storage converge without feedback loops.
2. Lens seeds and explicit overrides resolve identically whether UI drawer controls are loaded or omitted.
3. Host route navigation preserves `?at=`, and Atmosphere coordinate updates preserve the host route.
4. Rapid consecutive presentation changes do not produce unhandled View Transition rejections.
5. Hidden/filtered elements never stall keyboard paging navigation.
6. Switching Reading → Workspace → Presentation → Reading preserves active selection, draft content, and keyboard focus.

---

## Navigation & References

* [WHY-ATMOSPHERE.md](./WHY-ATMOSPHERE.md) — Architectural vision, philosophy, and local contract
* [VOCABULARY.md](./VOCABULARY.md) — Registered profiles, concerns, dimensions, and cascade layers
* [PRESENTATIONS.md](./PRESENTATIONS.md) — Presentation families and compound workspaces
* [live-object.html](../live-object.html) — Live interactive demonstration of the model wrapper
