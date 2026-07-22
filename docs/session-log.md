# Session Log: Model Router

## 2026-07-22 - Initial scaffold

Project scaffolded as **factory-output**. Purpose: A real CLI for the cost-aware model-routing decision: given a task's data sensitivity and complexity, recommend a model tier and the controls that come with it.

### Decisions Made

- Classification: factory-output
- Owner: dermdunc
- Vault mutation: not allowed by default (see `vault_mutation_allowed` in `.hekton/project.yaml` for the authoritative, current value)
- Promotion target: none

### Next Actions

- Define brief and first phase plan
- Add first implementation
- Record initial decisions

## 2026-07-22 - Build: the CLI, two real bugs found and fixed, two-cycle doubt review

### What Changed

`lib/route.mjs` (the decision table, extracted from `agentic-tekton`'s `RoutingWidget.astro`),
`bin/model-router.mjs` (the CLI), `test/route.test.mjs` (17 tests), `.github/workflows/ci.yml`,
`README.md`, `LICENSE`. Two doubt-driven-development cycles found and fixed two real functional
bugs (sensitivity never actually capped the tier despite the widget's own comment claiming it
did; the controls shown didn't always match the tier recommended) plus a tautological test that
hid the second bug, plus a mutable-shared-state issue in the module's own exports. Full detail in
`docs/decisions.md`.

### Why

Unblocks `content-packages/cost-aware-model-selection/brief.md` on the sibling `agentic-tekton`
repo, and fixes a real bug on that site's own live `/agentic-sdlc` page along the way.

### Validation

`npm test` (17/17 pass, including independent content assertions and a mutation-safety check),
plus manual CLI smoke tests for every flag path (`--json`, `--help`, `--flag=value`, missing/
invalid args) and a live before/after demonstration of both bugs.

### Next Actions

- Commit, merge to `main`, push; confirm CI green on the real repo.
- Port the same tier-cap fix into `agentic-tekton`'s live `RoutingWidget.astro`.
- Update `agentic-tekton`'s `content-packages/cost-aware-model-selection/brief.md` and
  `docs/post-backlog.md` with this repo's real URL.

### Mind-palace updated

Not this session - repo-local mirror only, `vault_mutation_allowed: false`.
