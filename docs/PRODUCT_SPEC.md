# READIT product specification

## Product promise

**Beyond the README. Follow the story.** READIT gives developers a map from user intent to code behavior. Discover an application's goals, pick a scenario, step through the messages, and inspect the source behind them.

## Problem

Onboarding requires reconstructing business behavior across UI, handlers, services, storage, and integrations. A README is a starting point, but diagrams often become stale and implementation knowledge remains concentrated in a few people. AI-generated code can widen the gap between what a team owns and what it understands. READIT calls this gap cognitive debt; it does not pretend to measure it with a single automated score.

## Users and jobs

| User | Job | Desired outcome |
|---|---|---|
| New developer | Understand a repository before changing it | Explain a user goal and find its implementation |
| Maintainer | Share behavior without writing a long walkthrough | Publish a local, inspectable map with evidence |
| Developer reviewing AI-generated code | Check assumptions and side effects | Follow logic and identify gaps before accepting changes |
| Engineering lead / trainer | Build shared understanding | Guide a team through cases, branches, and uncertainty |

## Core journey

1. Invoke the READIT skill in the target repository and choose a manageable scope.
2. The agent inventories source, investigates user goals, and traces implementations.
3. It emits a structured model containing actors, use cases, named scenarios, ordered interactions, and evidence.
4. The CLI validates structure and source correspondence, then builds an offline explorer.
5. The developer searches goals or actors, clicks a use case, chooses a scenario, and plays or steps through the sequence.
6. Each step explains intent and behavior, marks assumptions, and reveals cited code.
7. The developer exports review notes, the agent investigates them, and rebuilds the model.

## MVP functional scope

**Discovery:** host-agent investigation across any inspectable textual language; generic inventory hints for common entry points. No claim of complete automated parsing or cross-language call resolution. Large repositories should start with a selected vertical slice.

**Behavior model:** actors, user-goal use cases, goals, preconditions, postconditions, named scenarios, component participants, ordered call/return/async messages, and include/extend dependencies. Source-backed claims cite exact evidence. Inferred claims carry a rationale. Models record scope, timestamp, optional Git commit, and limitations.

**UML:** interactive use-case ellipses in a system boundary with actors outside; scenario-specific sequences using lifelines and correct message directions. Return arrows are dashed, async arrows open, and self calls loop. Full combined fragments, activation inference, and runtime timing are future scope.

**Exploration:** goal/actor search, actor filter, use-case deep links, progress based on visits, play/pause/step/reset, click-to-select message, source evidence detail, theme selection, responsive layout, and reduced-motion support. Visits indicate navigation, not comprehension.

**Review/export:** local notes per scenario step, Markdown agent-review export, validated JSON import/export, PlantUML source export, and self-contained offline HTML. The MVP does not automatically launch an agent from the browser.

**Local tooling:** demo, scan, validate, build, serve, and explicit skill installation. Read-only source access is rooted, bounded, and restricted to model evidence. No target code execution, credentials ingestion, remote renderer, telemetry, or automatic publication.

## UI direction

Make the tool feel like an inviting exploration surface: a calm green/cream palette, generous spacing, clear hierarchy, compact navigation, and motion that explains the active interaction. Prefer animated message movement and transitions tied to selection over decorative effects. Keep source evidence one click away. Maintain usable controls with motion disabled, keyboard navigation, and mobile-sized screens.

## Acceptance criteria

- A new developer can select a user goal and follow at least one implemented success and failure scenario.
- Every observed message has a resolvable source reference; all references pass hash/range checks against the demo source.
- UML exports preserve actor associations, include/extend direction, participant order, and message kinds.
- The exported HTML works offline, including selection, stepping, review, and downloads.
- Importing malicious or invalid model data cannot execute arbitrary HTML or destroy the usable current model.
- Scanner inventory is never misrepresented as semantic AI analysis.
- Changes to source surface stale evidence rather than silently asserting freshness.
- Keyboard and reduced-motion operation remain functional, and diagrams do not create page-level mobile overflow.

Concrete executable requirements are maintained in `openspec/specs/` and change specs.

## Success evaluation

These are proposed experiments, not demonstrated claims:

| Question | Measurement |
|---|---|
| Does READIT improve onboarding? | Time to correctly locate implementation for a user goal, with and without READIT |
| Does it improve understanding? | Correct answers about decisions, side effects, and failures after a walkthrough |
| Is the analysis trustworthy? | Reviewer agreement with sampled claimed messages and cited source |
| Does it help with AI-generated changes? | Unsupported assumptions or missing error paths identified before merge |
| Is exploration usable? | Developers completing search → scenario → source lookup without assistance |

Start with 3–5 developers and one unfamiliar repository. Record exact scope and sample size; do not generalize a small hackathon trial into productivity claims.

## Technical architecture

The agent owns interpretation. The CLI owns deterministic inventory, validation, source reading, hydration, rendering, and serving. A versioned JSON contract connects them. The same model drives the interactive SVG UML and editable PlantUML exports. The browser owns local exploration state and review notes. Runtime uses Node.js 22+, native HTTP, ESM, and vanilla browser JS/CSS; the initial choice prioritizes portable, dependency-free exports.

## Limitations and evolution

0.1 is a working local prototype. The analysis depends on a capable coding agent and remains fallible. It does not perform autonomous model-provider calls, recover all business intent, guarantee complete flow coverage, trace production execution, or support every UML construct. Future changes should improve discoverability and model review without hiding that uncertainty.
