# Brief: Model Router

> A real CLI for the cost-aware model-routing decision: given a task's data sensitivity and complexity, recommend a model tier and the controls that come with it.

## Problem

Agentic Tekton's own `/agentic-sdlc` pillar page describes a cost-aware routing policy (route by
data sensitivity and task complexity, not just "always use the best model") as an interactive
widget, but a widget you can only click isn't a runnable artefact a reader can point at, extend,
or verify against - and, as extracting it revealed, hadn't actually been checked against its own
stated policy.

## Outcome

A real, tested, standalone CLI implementing the same decision table, that a reader can clone and
run against their own inputs. Ships as the runnable companion artefact for Agentic Tekton's
"Cost-Aware Model Selection" essay - and, as a direct side effect of building it, surfaced and fixed
two real bugs in the live site's own widget, which had never actually been exercised against its own
documented policy before.

## Constraints

- Must faithfully port the real decision table from `RoutingWidget.astro`, not invent a new one.
- Where the extraction surfaces a real bug (sensitivity not affecting the tier despite the code's
  own comment claiming it does), fix it for real and port the fix back to the live widget, not
  just document the discrepancy.
- Zero dependencies; Node's own built-in test runner, no test framework.
- Public from day one (`dermdunc` account) - no employer detail, secrets, or private names.
