# Repository investigation

Start with a bounded vertical slice for a large repository. Record scope explicitly.

1. Identify actors from UI, authorization boundaries, external services, CLI commands, and scheduled workflows. Distinguish a human/system actor from an internal component.
2. Identify user goals: place an order, invite a teammate, publish a report. Utility functions, DTOs, and table names are not goals. Read README claims as hypotheses until corroborated.
3. Find entry points: UI event handlers, API routes, command dispatch, message consumers. Trace validation, authorization, decisions, side effects, persistence, external calls, and returned outcomes.
4. Read reachable helpers and tests. Tests clarify intended behavior, but do not prove deployment configuration or execution. Cite implementation when claiming implementation behavior.
5. Capture happy path, meaningful failures, and alternate paths separately. A missing subsystem stays a limitation. Do not draw an authentication service merely because apps usually have one.
6. Keep sequences at a component level that a new developer can understand; explain detailed functions in step descriptions and evidence. Label conceptual UI interactions inferred when only backend code exists.
7. Cross-check use-case relationships. An include is required behavior within the modeled goal, not simply a reusable helper. An extend adds optional behavior under a condition. Do not add relations for decoration.
8. Compute SHA-256 over complete file bytes. A reference covers inclusive 1-based line numbers. Omit snippet to let build --root populate it; supplied snippets must match exactly. Report source changes instead of quietly relabeling them verified.

Output limitations should say which modules, external implementations, dynamic dispatch targets, or runtime configuration could not be resolved. Never promise complete recovery of business requirements from source alone.

## Quality checklist

- Can a newcomer explain what the app does without reading implementation details?
- Does every selected goal lead to a named outcome and an ordered scenario?
- Can each observed message be found in its cited source?
- Are inferred interactions visible and justified?
- Do all references, hashes, and ranges validate against the current repository?
