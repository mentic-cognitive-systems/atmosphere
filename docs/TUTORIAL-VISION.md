# Tutorial vision: one task, several presentations

**Status:** Proposed redesign, 2026-09-05. This brief does not describe features
already implemented by `tutorial.html`.

## The promise

Let a person understand composition by continuing useful work through a change of presentation. Teach the names after the experience makes the distinction worth naming.

Use one release plan: tasks with stable IDs, statuses, editable notes, a summary, and a short guide. Keep a small enough dataset that its continuity is
obvious. Reading, dashboard, workspace, and presentation are different ways of
encountering this same work.

## What the existing sources establish

| Source | Useful evidence | What remains to prove |
|---|---|---|
| `atmosphere.html` | Shared roles, tokens, nested frames, and projected panels | A guided task that needs those capabilities |
| `tutorial.html` | Step navigation, composition controls, and explanations of invariants | Payoff before taxonomy; continuity of real work |
| `app.html` | A recognizable IDE-style visual prototype | Integration through the current shared sheets; it embeds its own CSS |
| `js/atmosphere-model.js` | Observable coordinate snapshots | Authoritative transactions and per-frame state ownership |

These are source-review findings. Visual quality, keyboard usability, and
cross-browser behavior still need a browser pass during implementation.

## The learning sequence

| Step | The person does | What becomes visible | Concept introduced |
|---|---|---|---|
| 1. Read | Reads a short release plan and follows a task link | Content and relationships exist before choosing a mode | HTML describes what exists |
| 2. Work | Selects a task and edits its notes; changes to Workspace | The same selected task and draft remain available | Presentation can change independently of work |
| 3. Inspect | Opens the guide, advances a chapter, moves it from rail to drawer | Its content and chapter remain the same in a new location | Arrangement; Placement and Projection when needed |
| 4. Navigate | Changes the main region to a horizontal presentation | Root traversal changes while the guide keeps its own path | Traversal and explicit local scope |
| 5. Adapt | Changes density, then Appearance, then Motion | Shared scales and feedback change with clear dependencies | Contextual resolution through tokens |
| 6. Compose | Combines a reading surface, a paged guide, and an on-demand inspector | A useful combination emerges without a new template | Concerns meet on shared semantic structure |
| 7. Extend | Adds one task through an actual control | It joins every applicable view and summary without mode-specific card code | Reuse through meaning, roles, and stable identity |
| 8. Return | Returns to reading and shares a task link with its composition | Draft and selection persist locally; recipient receives the addressable state | State ownership and adapters |

Sharing a task and composition must not silently share unsaved private notes.
Define precisely what a link encodes: a host-owned task route plus Atmosphere's
coordinate. Draft persistence is a separate feature, not an implied URL effect.

## The interaction surface

Start with a clear task and four presentation choices: Read, Inspect, Work,
Present. Offer the four concern controls progressively. Keep the full
laboratory available as an advanced destination.

The explanatory guide and recovery controls must remain reachable while the
example changes. Provide Previous, Next, direct step navigation, and a
“Return to reading” control. Resetting presentation must preserve the task
and draft; resetting sample data should be a separately labeled action.

Show one short explanation of each change: “The guide moved into a drawer;
you are still on chapter two.” Let a learner expand a compact inspector for
semantic identity, active choices, and relevant token dependencies. Do not
make raw coordinates or stylesheet filenames prerequisites for using the demo.

A policy preset can initialize an experience, after which choices remain
editable. Explain that a retained Lens still contributes tokens. Provide an
obvious way to clear the policy and explore the concerns directly.

## What composition must mean here

**Preserve semantic identity and working state.** Reuse DOM nodes where useful;
when a summary or geometric view requires another representation, derive it
from the same records and stable IDs. “One UI” does not demand one enormous
file or identical markup for every representation.

**Compose within regions as well as across the whole interface.** A paged guide
inside a drawer beside a continuous article is a more informative proof than
four buttons that replace every setting at once.

**Connect concerns through declared facts.** Show a spacing choice resolving
through density and type metrics, or projected depth informing surface
appearance and transition distance. A new Look should not need a list of
all dashboard components; a new task should not need per-mode visual rules.

**Respect interaction semantics.** A single-pane dashboard needs real selection
and tab behavior if presented as tabs. A drawer is not automatically modal.
Use a dialog only when a task requires modal behavior, with its corresponding
focus and dismissal contract. Existing `control` and `app` values do not
supply these complete behaviors by themselves.

**Use geometry when it explains something.** An optional SVG dependency map can
reference the same task IDs, share selection, and consume appearance tokens.
Introduce it to show a relationship the list obscures, not to fill out an
acronym. Keep a textual representation of those relationships available.

## Implementation boundaries

Use `tutorial.html` as the guided entry and retain `atmosphere.html` as the
laboratory. A future shared interface module can serve the tutorial and case
study; no new `UI.html` file is required to establish the principle.

Build one application state object for sample records, drafts, selection, and
filtering. Let the presentation model own the existing coordinate. Introduce
frame adapters for stable view IDs and local positions. Bind controls through
these owners instead of allowing each mode to create its own copy of state.

First prove continuity across reading and workspace. Add projection and nested
traversal next. Expand to dashboard and presentation only once navigation,
focus, and overflow are coherent. Keep the attribute names and compact URL
codebooks compatible; changing the teaching vocabulary is not a storage
migration.

## Acceptance criteria

- Reading → workspace → presentation → reading preserves selected task ID,
  filter, and unsaved notes without duplicate records or lost edits.
- A guide retains its current chapter through inline → drawer → inline, even
  when the main frame uses a different traversal.
- Adding a task updates applicable lists, counts, and navigation through shared
  contracts, without new CSS for each presentation.
- Appearance, density, and Motion can be changed separately. Explanations name
  downstream effects honestly rather than promising unchanged geometry.
- Filtering and removal preserve the current view when possible and provide
  deterministic navigation and an understandable empty state otherwise.
- Keyboard navigation, focus return, narrow-screen overflow, reduced motion,
  and a usable source-order fallback work in every advertised composition.
- A shared link restores the supported task route and composition without
  exposing drafts or allowing the two URL writers to overwrite each other.
- The tutorial clearly distinguishes implemented behavior from optional future
  features, including SVG and any full modal workflow.

Run these as behavior checks in supported browsers during implementation.
Success is a person understanding why the composition helps their task, then
building a new useful combination without memorizing six labels.

## Related documents

- [Why Atmosphere](./WHY-ATMOSPHERE.md) — Philosophy, design rationale, and Tailwind comparison
- [Giving Atmosphere a Body: State Model](./STATE-MODEL.md) — Reactive state architecture and system adapters
- [Vocabulary & Concerns](./VOCABULARY.md) — Registered profiles, concerns, dimensions, and cascade layers
- [Presentations & Workspaces](./PRESENTATIONS.md) — Presentation families, semantic places, and compound workspaces
