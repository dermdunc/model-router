# Model Router — Plain-English Project Walkthrough

## What this project is in one paragraph

A real CLI for the cost-aware model-routing decision: given a task's data sensitivity and complexity, recommend a model tier and the controls that come with it.

## The simple analogy

Like a thermostat's own rule turning out to only check the time of day and never actually read
the temperature, even though its label says it does both - extracting the logic into something
testable is what caught it.

## What problem we are solving

Teams default every AI-assisted task to the most expensive, most capable model out of caution,
which is expensive and often unnecessary - and unhelpful when the actual concern is data
sensitivity, not task difficulty. This tool makes a concrete routing policy runnable and
checkable instead of leaving it as an interactive diagram nobody can verify.

## What we have built so far

- Scaffolded 2026-07-22 — repo and vault control plane created.
- Same day: the routing table extracted from the live Agentic Tekton site's `RoutingWidget.astro`
  into `lib/route.mjs`, plus a CLI and an exhaustive 9-case test grid covering every
  sensitivity-by-complexity combination.
- Extracting it surfaced two real bugs in the *original* widget: sensitivity never actually
  capped the recommended tier, despite the widget's own code comment claiming it did; and the
  controls shown didn't always match the tier actually recommended. Both fixed here and ported
  back to the live site, confirmed working in-browser.
- The first version of the "exhaustive" test itself turned out to be tautological (it only
  checked an invariant that held true regardless of whether the real bug was present) - replaced
  with a table asserting the actual expected tier and controls for all nine combinations by hand.

## How the pieces fit together

`lib/route.mjs` holds the tier table, the control-set table, and the `route()` function that
applies sensitivity as a hard cap on the reachable tier. `bin/model-router.mjs` is a thin CLI
wrapper: parse flags, call `route()`, print text or JSON. `test/route.test.mjs` checks every one
of the nine sensitivity/complexity combinations against a hand-derived expected result, not
against the module's own exports (which would make the test unable to catch a content
regression).

## What is deliberately not automated yet

Nothing beyond the CLI itself - this is intentionally small and complete for its scope. The
underlying policy thresholds (which sensitivity/complexity combination maps to which tier) are a
disclosed design choice inherited from the original widget, not something this tool tries to
second-guess or make configurable.

## How this could connect to the wider Hekton factory

Real precedent already exists for extending this into an evidence-gated loop:
`engine-gateway-lab`'s Field Journal post "The Routing Policy Finally Learned Something" describes
exactly this pattern - a routing rule that updates from logged outcome evidence, not vibes. Once
routing decisions are logged with real outcomes, this could become a `hekton-loops-lab` loop
definition.

## Current confidence level

High — small, fully tested (an exhaustive 9-case grid, not spot-checked), and the exact bug it
fixes was independently confirmed by porting the same fix to the live site and checking the
result in a real browser, not just in the test suite.

## Open questions

- Should the routing thresholds themselves become configurable, or is the current fixed table
  (inherited from the original widget) the right level of abstraction for a "decision aid, not an
  authority" tool?

## Next recommended session

Draft the Agentic Tekton essay this tool is the companion artefact for
(`content-packages/cost-aware-model-selection/brief.md` in the sibling `agentic-tekton` repo), or
scope the evidence-gated routing-policy loop flagged above as a real `hekton-loops-lab` candidate.
