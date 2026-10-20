# Presentation Families, Semantic Places, and Compound Workspaces

> **Designer-facing architectural vocabulary for experiences, spatial relationships, and compound workspaces.**  
> *Catalogs: [presentations.json](./presentations.json) · [workspaces.json](./workspaces.json)*

---

## 1. Intent Resolution & The Abstraction Hierarchy

Atmosphere's spatial core sheets (`layout` for the 2D flat plane, `layer` for the 3D stack of planes, and `lattice` for traversals across the stack), along with `look` (surfaces) and `life` (motion), govern the rendering mechanics. To design real software, designers and engineers need a higher-level vocabulary that describes **purpose, semantic regions, and coordinated interaction**:

```
 Asset ──▶ Purpose ──▶ Presentation Family ──▶ Semantic Places ──▶ Relationships & Patterns ──▶ Implementation
```

* **Presentation Family:** Defines the overall structure and purpose of the encounter (e.g., Document, Workspace, Dashboard).
* **Semantic Place:** Identifies why a specific region exists (e.g., Inspector, Navigator, Editor).
* **Container Form:** Describes how that place is hosted (e.g., Sidebar, Drawer, Dialog, Pane).
* **Positional Relationship:** Determines where it sits relative to other places (e.g., Beside editor, Attached to selection).
* **Composition Pattern:** Reusably coordinates state, selection, and data between places.

---

## 2. The Eleven Canonical Presentation Families

| Family ID | Designer Intent | Typical Semantic Places | Essential Interaction |
|---|---|---|---|
| `document` | Read and follow structured content | Masthead, navigation, main content, TOC, footer | Reading, anchor navigation, continuous scroll |
| `presentation` | Encounter an authored sequence of views | Stage, slide navigator, speaker notes, controls | Step advance/retreat, slide selection |
| `workspace` | Create, edit, or manipulate assets | Navigator, editor, inspector, toolbar, status bar | Editing, commands, undo/redo, multi-pane docking |
| `dashboard` | Monitor, compare, and investigate | Overview, metric readouts, filters, visualizations | Filtering, drill-down, refresh, pane selection |
| `control-panel` | Inspect and adjust a system's operating state | System readouts, controls, setpoints, alarms, log | Adjust, toggle, execute, confirm critical actions |
| `collection` | Search, filter, and select among assets | Search bar, filters, grid/table results, detail pane | Sort, filter, browse, inspect |
| `workflow` | Complete a multi-step guided process | Step progress, active step form, help, actions | Validate, advance, return, submit |
| `conversation` | Exchange messages, prompts, or instructions | Conversation list, transcript, composer, context | Compose, send, reply, thread navigation |
| `media-player` | Experience time-based audio/visual media | Media viewport, timeline, transport controls | Play, pause, seek, scrub, volume |
| `canvas` | Pan, zoom, and manipulate a 2D field | Viewport, tool palette, layers, inspector, minimap | Pan, zoom, select, transform, layer ordering |
| `spatial` | Navigate or interact within a 3D environment | 3D scene, HUD, reticle, object inspector | Look, navigate, target, spatial manipulation |

---

## 3. Semantic Places, Containers, and Positions

A place establishes an element's **architectural responsibility**, independent of its temporary container form:

* **Place:** `inspector`, `navigator`, `editor`, `stage`, `status-bar`, `toolbar`, `hud`.
* **Container Form:** Pane, rail, drawer, popover, dialog, floating window.
* **Positional Relation:** `beside`, `below`, `over`, `anchored-to`.
* **Reference Space:** Viewport, parent container, world, canvas, or active selection.

### Place Invariance
An **Inspector** displays or edits the properties of the currently selected entity. In a wide desktop workspace, it may live in a docked trailing sidebar. On a narrow mobile screen, it projects as an on-demand drawer. In a 3D spatial scene, it anchors directly to the inspected object. Its container and position change, but its semantic place and data bindings remain identical.

---

## 4. Compound Workspaces: Chat, Messaging, IDEs, and Media Authoring

Complex applications require more than static regional layouts; they require **composition patterns that coordinate multiple places with shared data graphs and scoped state**.

### Six Reusable Composition Patterns

| Pattern ID | Interaction & Coordination Contract | Typical Applications |
|---|---|---|
| `hierarchy-browser` | Navigates nested tree structures while preserving node expansion, selection, and stable IDs. | File trees, conversation archives, channel groups |
| `collection-detail` | Binds a secondary detail place directly to the active selection of a collection. | Email list/reading pane, asset library/inspector |
| `tabbed-documents` | Manages multiple open document instances with independent undo histories and viewport states. | Code editors, multi-tab authoring, parallel viewers |
| `contextual-tool` | Binds a utility panel to a declared target, supporting both "follow selection" and "pinned" modes. | Property inspectors, contextual agent assistants |
| `docked-workspace` | Allows panels to split, resize, dock, collapse, and float while preserving internal state. | Professional IDEs, CAD suites, audio DAWs |
| `synchronized-timeline` | Locks multiple temporal views to a shared sequence clock and playhead. | Video preview, multitrack audio, keyframe editors |

---

## 5. Extended Semantic Places for Workspaces

To support IDEs, communications suites, and media software, Atmosphere defines these canonical places:

* **Navigation & Structure:** `activity-bar` (primary area switcher), `resource-tree` (explorer/project files), `asset-browser` (media library).
* **Document & Content:** `document-group` (tabbed editor region), `asset-viewer` (artifact/preview pane).
* **Communication:** `message-list` (envelope summaries), `message-detail` (reading pane), `agent-activity` (background runs and telemetry).
* **Media & Audio:** `source-monitor` (clip preview), `program-monitor` (master output), `track-area` (multitrack timeline), `track-controls` (headers), `mixer` (channel strips), `meters` (audio volume/VU).
* **Utilities:** `context-panel` (side panel hosting tools), `status-bar` (environmental summaries and quick toggles).

---

## 6. The Data Graph vs. The View Graph

To maintain integrity when presentations reflow, Atmosphere cleanly decouples domain entities from view containers:

```
┌──────────────────────────────────────────────────────────┐
│                   Domain Data Graph                      │
│   (Projects, Folders, Files, Conversations, Audio Clips) │
└────────────────────────────┬─────────────────────────────┘
                             │ binds via explicit relations
┌────────────────────────────▼─────────────────────────────┐
│                    UI View Graph                         │
│  (Panes, Editor Tabs, Sidebar Trees, Timeline Tracks)    │
└──────────────────────────────────────────────────────────┘
```

### Explicit Binding Relations
* `contains`: Hierarchical domain ownership (e.g. folder contains file).
* `references`: Association without ownership (e.g. conversation attaches file).
* `selects`: Scoped selection pointing to one or more domain entities.
* `presents`: A view instance rendering a specific entity or projection.
* `follows`: A panel deriving its target dynamically from a named selection scope.
* `pinned-to`: A panel locking its target to a specific entity, ignoring selection changes.
* `synchronized-with`: Views sharing a common sequence clock and playhead.

---

## 7. Four Production Recipes

Atmosphere documents four comprehensive workspace configurations in [`workspaces.json`](./workspaces.json):

1. **Agentic Chat Workspace:** Integrates conversation history (`hierarchy-browser`), active dialogue transcript (`collection-detail`), artifact inspection (`asset-viewer`), and asynchronous background runs (`agent-activity`).
2. **Unified Messaging Suite:** Coordinates channel trees, message envelopes, conversation detail panes, and contextual profile inspectors.
3. **Integrated Development Environment (IDE):** Organizes activity bar, file explorer, multi-group tabbed editors, integrated terminal, and status bar.
4. **Multitrack Media Editor:** Combines media bins, source and program monitors, multitrack timeline, audio mixers, and hardware-style meters locked to a shared sequence clock.

---

## 8. The Canonical Presentation Framework Engine

Atmosphere provides an executable presentation engine ([`js/atmosphere-presentation.js`](../js/atmosphere-presentation.js)) and starter canvas ([`UI.html`](../UI.html)) that operationalizes these design declarations:

### High-Level Declarations across Device Contexts

```text
"When in IDE mode on desktop: 3-column layout (left navigator, center editor, right inspector, bottom status bar).
 When in IDE mode on a phone: center editor, left slide-out drawer navigator, right slide-out drawer inspector, 4em footer context.
 When in slide mode: center slide stage, top dropdown navigator tab, on-call presenter notes."
```

### Canonical Archetype Coordinate Mappings

| Archetype ID | Canonical Lattice (Traversal Across Stack) | Desktop Layout (2D Plane) & Layer (3D Level) | Phone / Mobile Mapping |
|---|---|---|---|
| `document` | `continuous` | `layout: default`, `layer: inline` | Single column flow, drawer TOC |
| `workspace` | `app` | `layout: 3col`, `layer: inline` | `layer: top-left-edge-drawer` (drawers for navigator & inspector) |
| `presentation` | `slides` | `layout: hero`, `layer: top-menu` | Fullscreen slide stage, top dropdown tab |
| `dashboard` | `control` | `layout: 3col`, `layer: pop-over` | Stacked metric cards, popover drill-down |

### Reusable Live-Object Web Components
* `<atmosphere-archetype-picker>`: Toolbar control to dynamically switch archetypes.
* `<atmosphere-navigator>`: Adapts from Table of Contents to Project Tree to Slide Strip to Dashboard Filters.
* `<atmosphere-stage>`: Renders the active reading section, IDE code/notes editor, slide stage, or KPI cards.
* `<atmosphere-inspector>`: Live property inspector with editable draft notes that persist across presentation switches.
* `<atmosphere-context>`: Live telemetry bar and event log.

---

## Navigation & References

* [WHY-ATMOSPHERE.md](./WHY-ATMOSPHERE.md) — Core philosophy, Tailwind critique, and local contract
* [VOCABULARY.md](./VOCABULARY.md) — Dimension values, registered profiles, and cascade layers
* [STATE-MODEL.md](./STATE-MODEL.md) — Reactive state model, system adapters, and motion interop
* [presentations.json](./presentations.json) — Complete machine-readable presentation catalog
* [workspaces.json](./workspaces.json) — Complete machine-readable workspace recipes
* [UI.html](../UI.html) — Canonical presentation canvas starter
* [tutorial.html](../tutorial.html) — Interactive Uber UI Template masterclass
