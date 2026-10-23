# Give WebComponents Atmosphere

An existing component becomes atmospheric when its meaning, presentation, and
working state can compose independently. Give CSS meaningful choices to operate
on. Carry quantities and policies through variables. Give behavior a public
interface through a LiveObject and its delegates, so another presentation can
use the same state without reaching into private implementation.

This guide is a migration recipe for existing components, including those styled
with Tailwind. Preserve useful behavior and move one responsibility at a time.
The CSS precedence pattern and delegate interfaces below are proposed authoring
contracts, not APIs already supplied by the Atmosphere runtime.

## 1. Start with the work the component must preserve

Before changing markup or CSS, describe what the component does and what a user
must not lose when its presentation changes. For a task editor, that might be
the selected task, unsaved notes, text selection, and usable keyboard focus.

Inventory its current inputs, actions, emitted events, subscriptions, styling
dependencies, and persistence. Record who owns each kind of state:

| State | Owner |
|---|---|
| Task records and unsaved drafts | Application LiveObject or supplied domain model |
| Selected task and filters | A documented interaction model, which may be part of that LiveObject |
| Experience defaults and explicit presentation choices | Composition model or owning experience host |
| Focus, native control state, and open popover lifecycle | Component and native interaction adapters |
| Measured geometry | A measurement adapter when CSS needs an external fact |

One authoritative owner can serve several views. Avoid making every view keep a
second editable copy of the same draft. A plain display component may only need
CSS and supplied data; use a LiveObject where there is shared evolving state or
behavior to compose.

**Migration result:** a short contract stating what stays stable, who owns it,
and which changes the component is allowed to request.

## 2. Give the existing structure meaningful addresses

Name what an element is and the responsibility it serves before naming its
appearance. Reuse native HTML semantics and the existing custom-element name.

```html
<task-editor data-identity="task-editor" data-place="inspector"
             data-rhythm="comfortable">
</task-editor>
```

Its shadow tree might contain:

```html
<section part="surface" aria-labelledby="task-heading">
  <h2 id="task-heading" part="heading">Task notes</h2>
  <label for="draft">Notes</label>
  <textarea id="draft" part="draft"></textarea>
  <button type="button" part="save">Save notes</button>
  <p part="status" role="status"></p>
</section>
```

`task-editor` names a reusable kind. `data-identity` names a semantic subject;
`data-place` names its responsibility in this composition. Native `part` exposes
deliberately public shadow internals. For light DOM, scope `data-part` selectors
to the owning component. Use IDs for unique references and native labels,
buttons, states, and accessibility semantics for their browser-defined jobs.

Names should have a consumer. Add a dimension when it expresses a useful choice
such as rhythm, traversal, or navigation presence. Publish its supported values,
default, scope, and CSS binding. Do not rename every utility as a data attribute
or require all six dimensions on every component.

**Migration result:** stable addresses that survive changes in arrangement,
theme, and interaction presentation.

## 3. Taking the Tailwind to the Atmosphere

Start with a component whose behavior already works. Translate its visual
decisions into a semantic contract, then transfer the CSS mechanics behind that
contract.

For example, this call site mixes structure, spacing, theme, and feedback:

```html
<section class="grid gap-4 rounded-lg bg-white p-6 text-slate-900
                dark:bg-slate-900 dark:text-white">
  <!-- Existing editor controls -->
</section>
```

The replacement asks what those choices mean:

| Existing decision | Atmospheric expression | CSS owner |
|---|---|---|
| A group of editor controls | Component kind and scoped parts | Component structure |
| Comfortable space between controls | `data-rhythm="comfortable"` | Local binding to a spacing scale |
| Surface and text colors | Public surface and ink tokens | Look |
| Editor beside the document | Inspector responsibility and a slot binding | Layout |
| Inspector opens on demand | Presence policy and native interaction adapter | Layer |
| Feedback while saving | Native disabled state and a documented save-status output | Life and behavior |

Use variables to keep the result responsive to themes and controls. This example
is **internal shadow CSS**, with component-specific public token names:

```css
@layer at.defaults, at.composition, at.policy;

@layer at.defaults {
  :host { --task-editor-rhythm: 1; }
}

@layer at.composition {
  :host { display: block; min-inline-size: 0; }
  [part~="surface"] {
    display: grid;
    gap: calc(var(--space-unit, 1rem) * var(--task-editor-rhythm));
    padding: calc(var(--space-unit, 1rem) * var(--task-editor-rhythm));
    color: var(--task-editor-ink, var(--text, #20252b));
    background: var(--task-editor-surface, var(--bg, #fff));
    border-radius: var(--task-editor-radius, var(--radius-md, .5rem));
  }
  textarea, button { font: inherit; }
  textarea { inline-size: 100%; box-sizing: border-box; }
  button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
}

@layer at.policy {
  :host([data-rhythm="compact"]) { --task-editor-rhythm: .75; }
  :host([data-rhythm="comfortable"]) { --task-editor-rhythm: 1; }
  :host([data-rhythm="spacious"]) { --task-editor-rhythm: 1.5; }
}
```

A host theme can now set `--task-editor-surface` and `--task-editor-ink`.
A density controller can change the inherited `--space-unit`; a component
control can change `data-rhythm`. CSS recomposes the quantities without rewriting
the controls or calculating pixel values in JavaScript. The component does not
declare its public color tokens internally, so descendants can inherit supplied
values; the consumers provide fallbacks.

These tokens and rhythm bindings are local examples, not additions to the shared
runtime registry. Reuse an existing shared scale when its contract fits. For
symbolic choices such as `auto | embedded | on-demand`, bind the symbol to a
documented policy token and interpret it in CSS rules or supported style queries.
Use `@property` when a bounded, typed vocabulary is useful, with inheritance and
an initial value chosen deliberately.

Tailwind can already use variables, theme tokens, and native cascade layers.
The migration is about moving decisions into semantic contracts and concern
ownership; removing class names alone does not accomplish that. See Tailwind's
[utility styling](https://tailwindcss.com/docs/styling-with-utility-classes) and
[theme variables](https://tailwindcss.com/docs/theme).

Migrate in this order:

1. Capture the component's useful behavior and current appearance.
2. Add semantic addresses while preserving the existing controls.
3. Replace one group of utilities with component or concern rules and tokens.
4. Remove the replaced utilities from that component; check the winning CSS
   declarations rather than compensating with stronger selectors.
5. Repeat for responsive behavior, themes, state feedback, and motion.
6. Remove Tailwind imports only when their remaining consumers are migrated.

Account for Preflight and other shared resets before removing them: box sizing,
form fonts, margins, borders, and native element behavior may have depended on
those rules. Provide the baseline the component actually needs, including inside
its shadow tree. Tailwind documents its baseline in
[Preflight](https://tailwindcss.com/docs/preflight).

**Migration result:** changing a theme or policy changes presentation through
CSS while the component's semantic addresses and working controls remain stable.

## 4. Organize CSS by the decision it owns

Use the six concerns as questions when extracting rules:

| Concern | Component migration question |
|---|---|
| Layout | Where does this responsibility belong, and how is space allocated? |
| Layer | Does it remain in place, float, or appear on demand? |
| Lattice | How does the user traverse this component's content? |
| Look | Which tokens describe its type, color, and surfaces? |
| Life | How does it provide feedback and respect motion preferences? |
| Lens | Which coherent starting choices serve this experience? |

Keep component-owned internal structure with the component. Give shared concern
sheets semantic addresses, public parts, and tokens through which to compose it.
One component stylesheet can contain several clearly owned concern sections;
six additional files are not a prerequisite.

Use cascade layers for precedence. The proposed `at.defaults → at.composition →
at.policy` pattern separates starting recipes, consumers, and explicit choices.
The Layer concern and browser top layer remain distinct from `@layer`.

During coexistence with legacy or Tailwind CSS, inspect the actual generated
layer order and importance. Normal unlayered author rules outrank normal layered
ones, and `!important` reverses layer order. Establish the integration boundary
before moving cooperating rules into layers. The shared Atmosphere sheets remain
unlayered; declaring the proposed order does not wrap them. See
[Composition and precedence](../README.md#composition-and-precedence).

Document public inherited tokens and `part`/`exportparts` explicitly. Document
and shadow-tree cascade layers have independent ordering. A custom property set
directly on a descendant takes precedence over an inherited value, regardless
of the parent's layer. Use internal derived tokens when a component needs its
own implementation value without shadowing a public input. See the
[cascade reference](./VOCABULARY.md#6-css-architecture--cascade-layers).

**Migration result:** each design decision has an obvious owner and a small
interface through which other concerns can cooperate.

## 5. Give behavior a LiveObject and first-class delegates

A LiveObject owns evolving state and the operations that preserve its
invariants. A component renders a supplied view of that state and translates
user interactions into commands. A delegate is a named, replaceable public
interface to those capabilities. Treat it as a first-class part of the component
contract: document it alongside attributes, properties, parts, and events.

Here, **delegate** means a supplied capability object, exposed through a public
JavaScript property. It is separate from DOM event delegation. It does not need
to be a custom element; a control element may expose or consume a delegate when
that is useful to composition.

A proposed task-editor delegate might be:

```typescript
interface EditorSnapshot {
  readonly taskId: string;
  readonly draft: string;
  readonly saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  readonly revision: number;
}

interface EditorChange {
  readonly snapshot: Readonly<EditorSnapshot>;
  readonly changed: readonly (keyof EditorSnapshot)[];
  readonly source: string;
}

interface TaskEditorDelegate {
  readonly current: Readonly<EditorSnapshot>;
  updateDraft(value: string, options: { source: string }): void;
  save(options: { source: string }): Promise<void>;
  subscribe(listener: (change: EditorChange) => void): () => void;
}
```

This is an example interface, not an existing exported type. A host obtains a
delegate from its application LiveObject and supplies it with
`editor.delegate = delegate`. A navigation component could receive a different
delegate from the same LiveObject, exposing selection commands rather than draft
editing. Delegate names and capabilities should describe the work being offered.

Define these rules for each delegate:

- **Queries expose snapshots.** Keep mutable records private. Freeze or copy
  nested values as needed; freezing only an outer object does not protect its
  descendants.
- **Commands own validation and commits.** Validate domain inputs at the owner,
  publish a consistent revision, then notify observers. A no-op should not
  produce a new state revision. Define asynchronous pending, completion, and
  failure behavior, including what happens if selection changes during a save.
- **Subscriptions expose change.** State whether subscription immediately calls
  the listener. In this example it does not; consumers subscribe and explicitly
  read `current`. Return an unsubscribe function.
- **Replacement has a lifecycle.** Unsubscribe from the previous delegate before
  binding another. Subscribe only while connected, and bind again on reconnect.
  A component must not destroy a shared LiveObject when it disconnects.
- **Absence has a fallback.** Without a delegate, show a useful empty state or
  disable dependent actions with an explanation. Do not silently discover an
  unrelated global model.

The component can keep ephemeral implementation details private: DOM references,
focus bookkeeping, and an in-flight animation. Records, selected IDs, and drafts
that must survive replacing the view belong in the supplied owner. Render by
patching existing nodes; do not replace the textarea on every notification.
Only assign its value when necessary, and preserve selection or composition
input when reconciling changes from another view.

The existing [presentation elements](../js/atmosphere-presentation.js) demonstrate
supplied `model` properties, subscriptions, and stable shadow trees. The
[LiveObject demo](../js/at.live-object-demo.js) also releases subscriptions when
elements disconnect. Reuse those patterns; the public `delegate` shape above is
a proposed generalization, not a claim that these components already implement it.

**Migration result:** another view can use the same state through supported
capabilities, without querying private DOM or editing internal records.

## 6. Specify what is emitted and what is listened for

Every public event needs a name, emitter, payload, meaning, and listener scope.
Distinguish a request to do work from a fact that work has committed.

| Channel | Emitter → listener | Meaning |
|---|---|---|
| Delegate command | Component → LiveObject capability | Request a validated operation |
| Model change event / subscription | LiveObject → subscribed views and adapters | A committed snapshot is available |
| Public DOM request event | Component host → owning application | An action is requested when event routing is the chosen command interface |
| Public DOM notification | Component host → containing UI | A documented component-level fact occurred |

Choose one authoritative command route for an action. If Save calls
`delegate.save()`, a second `save-request` listener must not also execute the
save. A component may instead use a public request event when its host owns
command routing. Document which integration mode is active.

A LiveObject based on `EventTarget` can publish changes like this:

```javascript
// After validation and commit. Values are detached, immutable snapshots.
model.dispatchEvent(new CustomEvent('task-editor:change', {
  detail: Object.freeze({
    snapshot,
    changed: Object.freeze(['draft']),
    source: 'task-editor:input'
  })
}));
```

Subscribers listen on that model, or through its documented `subscribe()`
wrapper. A plain `EventTarget` has no DOM ancestor chain: setting `bubbles` or
`composed` does not deliver its events to the document. The `snapshot` includes
the committed revision. Use `source` for attribution, not as a substitute for
no-op detection and single ownership. Subscribers render the committed change;
they must not feed the same value back into a setter.

For a component using **DOM request routing**, the host can emit:

```javascript
this.dispatchEvent(new CustomEvent('task-editor:save-request', {
  detail: Object.freeze({ taskId: this.delegate.current.taskId }),
  bubbles: true,
  composed: true
}));
// The host command router owns execution; this component does not also save.
```

`bubbles: true` allows ancestor listeners; `composed: true` allows the event to
cross containing shadow boundaries. Synthetic events do not acquire these flags
automatically. Emit public events from the component host, and give listeners
stable IDs and values in `detail` rather than making them inspect shadow internals.
Only expose data intended for that listener scope. See the browser documentation
for [composed events](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed).

If a request protocol supports vetoes, set `cancelable: true` and require the
command owner to honor cancellation before executing. Define when execution
starts so every synchronous listener has a chance to call `preventDefault()`;
an ancestor must not start the operation before a later listener can veto it.
`dispatchEvent()` does not await an asynchronous listener. Use the delegate's promise, or a separately
documented completion/error protocol, for asynchronous results. Do not call a
request event `saved`. A success notification must follow successful completion.
See [dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent).

Listen at the nearest owner that needs the event. Release external listeners
with an `AbortController` or explicit removals on disconnect and model replacement.
Register internal control listeners once per stable shadow tree, or clean them
up before reconnecting. Avoid making `window` or `document` the default event bus;
bridge a model event to the DOM only for a documented consumer, and choose one
channel per consumer to avoid duplicate handling.

**Migration result:** commands have one execution owner, observers have one
documented change stream, and listeners can be detached without losing state.

## 7. Make state portable by separating it from the view

Reusing a LiveObject across views preserves state within a running application.
Saving and restoring it across reloads or processes requires an explicit data
contract. Provide a versioned, serializable snapshot containing domain values,
stable IDs, and drafts; validate it on restoration and define migrations.
Keep DOM nodes, listeners, delegate functions, and in-flight requests out of it.
The application owns persistence and its scope.

Construct or restore the LiveObject first, then give its delegates to the new
components. Restore selection by stable identity. A view can maintain focus and
text-selection hints where useful, but those hints are separate from the domain
record. Do not promise that a data snapshot alone reproduces native focus or an
unfinished asynchronous operation.

Keep presentation coordinates separate from domain state. The current
`window.AtmosphereModel` is an experimental DOM-backed composition wrapper; the
authoritative synchronous model and unified persistence described in
[STATE-MODEL.md](./STATE-MODEL.md) remain partly proposed. A component's domain
LiveObject should not assume that wrapper already provides those guarantees.

**Migration result:** replacing a view, changing its composition, or restoring
its owner does not require recovering application state from private DOM.

## 8. Verify composition, continuity, and cleanup

Check the migrated component through its public interfaces:

- Switch themes and change a spacing or presence policy at runtime. Verify the
  computed CSS and resulting geometry change through the intended tokens.
- Change the experience while editing. Preserve the selected entity, draft,
  existing editor node, text selection, and usable focus. When a presentation
  hides the focused region, explicitly move focus to an appropriate control.
- Bind two views to the same LiveObject. One action produces one operation and
  one consistent committed change for both observers.
- Disconnect, reconnect, and replace the delegate. Old-owner changes no longer
  update the view, and listener counts do not grow with each connection.
- Exercise rejected input, save failure, absent delegates, keyboard operation,
  reduced motion, and any unsupported native capability used by the component.
- Restore a serialized snapshot into a new owner and view. Verify stable IDs,
  selection, and drafts without retaining the old DOM.
- During Tailwind coexistence, check that removed utilities and reset
  dependencies do not remain hidden requirements.

A component is ready when authors can explain its semantic choices, CSS owners,
public tokens, delegate capabilities, event routes, and state owner—and change
its presentation without losing the user's work.

## Component contract to leave behind

Record this alongside the migrated component:

| Contract field | What to document |
|---|---|
| Identity and responsibility | Kind, semantic subjects, places, and relationships |
| Structure | Required native elements, slots, parts, and accessibility behavior |
| Presentation inputs | Supported dimensions and values, inherited tokens, defaults, precedence |
| Resolved outputs | Attributes and tokens that consumers may observe but should not write |
| State | Authoritative owner, snapshot schema, restoration, and continuity requirements |
| Delegates | Public property, queries, commands, validation, results, and absence behavior |
| Events | Emitter, name, payload, revision/source, propagation, cancellation, listener scope |
| Lifecycle | Connect, disconnect, replacement, subscription cleanup, and resource ownership |
| Fallbacks | Missing capabilities, motion preferences, failures, and focus handling |

For concrete starting points, read the [simple composition stylesheet](../css/at.simple.css),
the [presentation components](../js/atmosphere-presentation.js), and the
[release LiveObject and its subscribers](../webcomp/atmospheric-lander.js).
