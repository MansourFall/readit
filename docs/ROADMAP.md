# READIT roadmap

## Implemented: local 0.1 prototype

Portable agent skill, safe inventory, versioned evidence model, interactive SVG UML, playable named scenarios, source details and freshness, local review notes, offline HTML/JSON/PlantUML exports, examples, tests, and OpenSpec requirements.

## Prepared next change: framework entry-point discovery

Express route and NestJS controller hints with source locations and uncertainty. These narrow the agent's investigation but do not infer business goals automatically. See `openspec/changes/add-framework-discovery/`.

## Proposed next experiments

1. Test the skill on a small real repository the owner is comfortable analyzing. Measure sampled evidence quality and document unresolved edges.
2. Add full sequence fragments (`alt`, `opt`, `loop`) to the model, renderer, playback, and PlantUML export together. Preserve separate scenarios as a simpler view.
3. Add pan/zoom and guided onboarding tours with questions about a flow. Treat completion as exploration, not proof of understanding.
4. Add model revision diffs and per-symbol evidence freshness to reduce false staleness from unrelated file edits.
5. Add a local agent feedback channel so a maintainer can request clarification without exporting notes manually. Define explicit lifecycle, failure recovery, and provider/source handling first.
6. Add optional direct model-provider or local-model analysis for users without an agent harness. Require explicit source-sharing controls, clear cost/output limits, and the same evidence validation.
7. Run onboarding/comprehension experiments before claiming a reduction in cognitive debt.

Each item is future work and needs its own OpenSpec proposal, requirements, tasks, and tests. The current source does not implement these capabilities.
