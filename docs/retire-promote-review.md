# Retire / Promote Review: Model Router

Review default: factory output does not automatically promote to platform, but learnings may become templates or platform backlog.

**Last updated:** 2026-09-06 (first real review since scaffold; part of a factory-wide dormant-project sweep).

## Retire / Promote Review

### Current state
Archived, 2026-09-06.

### Evidence gathered
- Built 2026-07-22: a routing CLI, two real bugs fixed, two-cycle doubt review (`a4d43b5`).
- The tier-cap sensitivity bug found while extracting this tool was also ported into `agentic-tekton`'s live `RoutingWidget.astro` (`agentic-tekton@65197fe`) same day.
- Blog post published in `agentic-tekton`'s post-backlog (row 3, post #6), marked shipped.
- No commits since 2026-07-26 (the shared 2026-07-31 commit across several factory-output repos was housekeeping, not project activity).
- This project's own `docs/next-actions.md` had three items still unchecked despite all three being independently confirmed done — closed out 2026-09-06 alongside this review.
- Grepped the rest of the monorepo: a code comment in `agentic-tekton`'s `RoutingWidget.astro` attributes the design to this project (attribution, not a runtime import); `kriterion-private`'s 2026-09-05 plan cites it as precedent. No `depends_on`/`enables`/`consumes` field anywhere references it.

### Value score
- Reuse: Low. The design was extracted into `agentic-tekton` directly rather than imported as a dependency; no project runs this CLI itself.
- Clarity: High. README, decisions log, and now next-actions.md are all accurate and closed out.
- Automation: Medium. CI green, standalone CLI, no scheduled/hooked usage.
- Decision quality: High. Two real bugs found and fixed with a documented two-cycle doubt review.
- Strategic leverage: Low. A finished one-off experiment whose one real output (the tier-cap fix) already shipped elsewhere.

### Cognitive load score
Low. Small, self-contained CLI; no dependents to break.

### Recommendation
Retire (archive).

### Rationale
The deliverable shipped, its one consequential finding (the tier-cap bug) was already ported into the live site that needed it, the blog post published, and a full-monorepo grep found only attribution/precedent references, never a functional dependency. The stale-looking open next-actions were bookkeeping gaps, not real blockers — all three are independently confirmed complete.

### Next action
1. Archive banner added to `README.md` (this session).
2. `.hekton/project.yaml` flipped to `status: archived` / `lifecycle_stage: archived` (this session).
3. `docs/next-actions.md`'s three stale-open items checked off with evidence (this session).
4. GitHub repo archived: `gh repo archive dermdunc/model-router` (this session, per `promotion-rules.md`'s archive-immediately rule).
