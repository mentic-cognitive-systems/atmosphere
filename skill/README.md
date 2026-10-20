# The Atmosphere skill

Atmosphere for agents: what "make it atmospheric" means, as an Agent Skill.

| File | What it is |
|---|---|
| `atmosphere/` | The skill: a short core (`SKILL.md`) and references read on demand |
| `atmosphere.skill` | The same folder, packaged for upload or sharing |

## What is in the skill

```
atmosphere/
  SKILL.md                            semantic contracts, concern rules, method, checks
  references/
    semantic-contract.md              identity/kind/place/part/role/state/constraint grammar and continuity
    filing.md                         the property-to-sheet table, prohibitions, published tokens, hard cases
    vocabulary.md                     axes and values, roles, states, locals, frames, projection attributes
    worked-examples.md                the tab set, the header fold handshake, a utility-class refactor
    reference-implementation.md       working inside a project that has the at.*.css sheets and controller
    web-components.md                 the custom-element contract and state ownership
  assets/skeleton.html                a minimal atmospheric document
  evals/                              three test prompts and their fixtures (not packaged)
```

An agent pays for the name and description always, the core when the skill triggers, and a reference only when it opens one.

## Install

- **Claude Code, for yourself:** copy the `atmosphere` folder to `~/.claude/skills/atmosphere`.
- **Claude Code, for a project:** copy it to `.claude/skills/atmosphere` in the repository and commit it.
- **Claude apps:** upload `atmosphere.skill` where custom skills are managed.

## Where it came from

Everything here is hand-written; there is no build step. It was distilled from:

- `../README.md` - the model and the property-to-sheet table (the authority when anything disagrees);
- `../docs/VOCABULARY.md` and `../docs/WHY-ATMOSPHERE.md` - names, the local contract, the razor;
- `../atmosphere.html` - the head comment, the ledger, the tabs section and the adopt skeleton;
- the contracts at the top of `../css/at.*.css`, and the code those sheets and `../js/atmosphere.js` actually run;
- `../at.prompt.md` - the Web Component contract and state ownership, carried into `references/web-components.md`.

When one of those changes in a way that matters to an agent (a new axis, role, local or sheet; a changed filing rule), update the matching reference by hand and repackage.

The README's core principle governs this package: semantic addresses are the
stable contract against which concern sheets compose. Name meaningful parts,
declare their ownership and supported presentations, and verify continuity of
subject identity and interactive nodes. Naming alone does not establish behavior.

## Repackaging

From the skill-creator skill's folder:

```bash
/usr/bin/python3 -m scripts.package_skill /path/to/Core/atmosphere/skill/atmosphere /path/to/Core/atmosphere/skill
```

## Status

`assets/skeleton.html` is a starter against the real sheets and controller. Its
places and scoped parts follow the semantic grammar; hosts supply domain behavior
and their own kind-specific rules. The four prompts in
`atmosphere/evals/evals.json` are evaluation scenarios, not claims of completed
agent evaluations.
