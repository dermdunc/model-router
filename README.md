# Model Router

**Classification:** factory-output · **Owner:** dermdunc · **Status:** experimental, v0

[![CI](https://github.com/dermdunc/model-router/actions/workflows/ci.yml/badge.svg)](https://github.com/dermdunc/model-router/actions/workflows/ci.yml)

> A real CLI for the cost-aware model-routing decision: given a task's data sensitivity and complexity, recommend a model tier and the controls that come with it.

## The decision

Not every task needs a frontier model, and not every task should be allowed to reach one.
Two questions, asked honestly, cover most of the real decision:

- **How complex is the task?** Retrieval, classification, templating: local or low-cost. Ambiguous
  cross-file reasoning or architecture-sensitive work: frontier, because one good completion saves
  real review time.
- **How sensitive is the data the task touches?** The more sensitive the data, the more that
  answer should pull the recommendation back toward local, no matter how complex the task looks,
  because the cost of a capable model isn't the only cost.

```bash
model-router --sensitivity high --complexity high
```
```
Recommended tier: Local SLM or low-cost hosted model
Why: Retrieval, classification, summarisation, templating, and narrow transforms do not need a frontier model.
Required controls:
  - Prefer local or approved-only models
  - Data classification and PII controls
  - Retention rules
  - Legal and data review

(Sensitivity capped this below what complexity alone would justify - the whole point of asking both questions.)
```

## Where this came from, and a bug found along the way

This decision table started as an interactive widget on
[The Agentic Tekton](https://theagentictekton.com/agentic-sdlc/)'s pillar page
(`src/components/RoutingWidget.astro`). Extracting it into a real, runnable CLI surfaced a real
bug in the original: the widget's own code comment claimed "high sensitivity can pull it back
toward local," but the shipped code only ever set the tier from complexity, never applying
sensitivity to it at all. Sensitivity affected which controls were listed, not which tier was
recommended. `lib/route.mjs` implements the documented intent for real: sensitivity now caps how
high the tier can climb, independent of complexity. Verified against the full 3x3
sensitivity-by-complexity grid in `test/route.test.mjs`, not spot-checked. The same fix landed
back on the live widget, see that repo's `docs/decisions.md`.

## Use it

```bash
git clone https://github.com/dermdunc/model-router.git
cd model-router
node bin/model-router.mjs --sensitivity medium --complexity high
```

```
Usage:
  model-router --sensitivity <low|medium|high> --complexity <low|medium|high> [--json] [--help]
```

`--json` prints the full decision (tier, reasoning, controls, and whether sensitivity capped the
result) as structured output, for scripting against.

Zero dependencies: plain Node (>=18), nothing to install. `npm test` runs the exhaustive grid test
(`node --test`, Node's own built-in test runner, no test-framework dependency either).

## What this is not

Not an authority. It's a decision aid that makes a house policy concrete and checkable, the same
way a linter makes a style guide checkable. A human still owns the call, especially at the
boundaries this table can't see (a task that's technically "low complexity" but touches something
legally sensitive, for instance).

## Implementation Status

- Scaffolded and built 2026-07-22, table, CLI, and tests all live same day.

## Documentation Contract

Agents working here must inspect `.hekton/project.yaml` before structural changes, keep `docs/session-log.md` current, record meaningful design decisions in `docs/decisions.md`, and update `docs/next-actions.md` when the work queue changes.

Vault mutation policy: see `vault_mutation_allowed` in `.hekton/project.yaml` (authoritative; defaults to false at scaffold time). The repo-local `mind-palace/` folder is only a mirror draft; do not write to the live vault unless `.hekton/project.yaml` says mutation is allowed and it is explicitly authorised in-session.

## Key Docs

- [Session Log](docs/session-log.md)
- [Decisions](docs/decisions.md)
- [Risks](docs/risks.md)
- [Project Walkthrough](docs/project-walkthrough.md)
- [Next Actions](docs/next-actions.md)
- [Operating Model](docs/operating-model.md)
- [Human Understanding Check](docs/human-understanding-check.md)
- [Depth Decision](docs/depth-decision.md)
- [Retire / Promote Review](docs/retire-promote-review.md)
