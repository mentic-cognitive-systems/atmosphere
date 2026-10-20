# Semantic addresses are the composition contract

Name the meaning and its meaningful parts before composing presentation. This
contract is the reason to split CSS into concerns: several concerns can contribute
predictably to the same subject without taking over its meaning or behavior.

| Name | Expression | Responsibility |
|---|---|---|
| Instance | Stable `id` when referenced | This particular region; model identity remains authoritative |
| Kind | Native/custom element or class | Reusable meaningful structure such as `.experiment` |
| Place | `data-place` | Navigator, stage, inspector, toolbar, context |
| Part | Scoped `data-part` | Explanation, demonstration, controls, evidence, conclusion |
| Role | Existing `data-role` | Shared surface, voice, select, reading, masthead treatment |
| State | Native/ARIA first, then additional `data-state` | A real condition published by its behavior owner |
| Constraint | Existing bounded locals | Requested gap, padding, column fit, span, or depth |

## Author the agreement

```html
<section id="context-example" class="experiment" data-role="surface"
         data-gap="even" data-pad="open" aria-labelledby="context-title">
  <header data-part="explanation">
    <h2 id="context-title" data-role="voice">Context</h2>
    <p>Change the encounter while preserving the idea.</p>
  </header>
  <figure data-part="demonstration">...</figure>
  <form data-part="controls" aria-label="Experiment controls">...</form>
  <pre data-part="evidence">...</pre>
  <p data-part="conclusion">...</p>
</section>
```

For this kind, explanation and demonstration are required, controls exist when
interactive, and evidence/conclusion are optional. Document the supplied subject,
commands, facts, state authority, tokens, supported compositions, and fallback
when optional functionality is absent. Other kinds define their own parts;
there is no requirement that every component resemble an experiment.

Native HTML keeps its actual semantics. An application part name does not create
a landmark or a keyboard interaction. Public shadow internals use native
`part`/`exportparts`; `data-part` cannot cross a shadow boundary.

## Let concerns contribute

Components gives the parts usable intrinsic structure. Layout arranges their
encounter; Layer supplies supported inline/elevated projection; Lattice supplies
traversal; Look publishes materials/type tokens; Life scores shared roles and real
states; Lens supplies policy; Local resolves bounded quantities.

Address owned parts with low-specificity, scoped selectors:

```css
/* Components: only this kind's direct controls. */
:where(.experiment) > [data-part="controls"] {
  display: flex;
  flex-wrap: wrap;
  gap: var(--layout-gap, 1rem);
}

/* Shared paint, outside any profile: the profile supplies the tokens. */
:where([data-role="surface"]) {
  color: var(--text, currentColor);
  background: var(--panel-bg, transparent);
}
```

Keep Look profiles token-based and Life scores role-based. Component-owned
structure may address its own kind and parts. Avoid unbounded `[data-part]`
descendant rules that capture parts in nested instances. Preserve published
classes, IDs, events, and wire identifiers when adding semantic addresses.

## Prove the agreement

Change Look, density, width, and supported presentation mode. Confirm that the
subject, interactive nodes, values, selection, and usable focus survive. Test
repeated/nested instances and absent optional parts. Verify actual CSS consumers,
not only the presence of labels. Names need maintained contracts; they must not
hide an opaque bundle of unrelated visual decisions.
