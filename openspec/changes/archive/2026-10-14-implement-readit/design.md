# READIT technical design

## Context

The initial user experience should be useful for a hackathon and viable as an installable skill. A diagram-only generator does not resolve cognitive debt unless its explanations can be checked and explored. A static AST parser alone cannot infer user goals reliably across frameworks.

## Goals / Non-Goals

Goals: local repository inventory, agent-driven discovery, source correspondence checks, readable UML, enjoyable exploration, portable exports, useful failure paths, explicit uncertainty.

Non-goals for 0.1: autonomous hosted analysis, direct provider integrations, execution tracing, exhaustive cross-language call graphs, collaborative cloud reviews, full UML combined fragments, measured claims of productivity improvement.

## Decisions

1. **Agent + deterministic tooling.** The skill asks the host agent to inspect the repository. The CLI scans, validates, hydrates, renders, and serves. No hard-coded heuristic claims are promoted into user goals.
2. **One model.** Version `1.0` is the source of truth for UI and exports. Keep use-case actor IDs separate from sequence participant IDs. ID references are checked before rendering. Stable IDs support feedback and navigation.
3. **Evidence provenance.** Every observed use case, relationship, and message needs at least one evidence reference. SHA-256 covers complete file bytes. Root-based validation checks line bounds, hashes, and optional exact snippets. Standalone exports contain recorded snippets; live serving can mark them stale.
4. **Bounded UML subset.** SVG use-case diagrams use stick actors, ellipses, a system rectangle, associations, and dashed directed include/extend dependencies. Sequences use participant headers, vertical lifelines, filled synchronous call arrows, dashed return arrows, open asynchronous arrows, and self messages. Alternate/error paths are distinct scenarios. PlantUML export preserves the model's direction and message types. No remote diagram renderer is needed.
5. **Vanilla browser UI.** Green/cream editorial styling, responsive layout, dark theme, keyboard-accessible controls, reduced-motion support, clickable messages, source details, and review notes. Keep the entire export self-contained, including validation and rendering functions.
6. **Local boundary.** Native HTTP binds to loopback. Only GET operations exist. Source reads require a model-listed evidence ID and a configured root. Reject path traversal, sensitive filenames, symlinks, binary/oversized sources, and foreign origins. UI strings are escaped; embedded JSON cannot close a script tag.
7. **Review without pretending to be an agent connection.** Browser-local notes export as Markdown instructions for the host agent. The MVP does not run a background agent or automatically apply feedback.

## Risks / Trade-offs

- Inference can be wrong despite a valid reference: display rationales and encourage review.
- Agent coverage may be incomplete: require scope and limitations.
- File hashes are coarse; an unrelated edit marks evidence stale: favor explicit re-analysis over misleading freshness.
- An offline artifact can contain source snippets: the user chooses whether to share it; no automatic publication.
- Small SVG labels may truncate long names: retain full labels in titles and detail panels; diagrams scroll within their container.
- The portable skill needs the READIT CLI available: document npm link and offer explicit install-skill.

## Validation

Run semantic model tests, source access and escaping tests, executable fixture outcome tests, HTTP boundaries, and browser smoke tests for desktop/mobile navigation, playback, imports, export, local evidence, review persistence, empty/error states, and reduced motion. Validate OpenSpec with its official CLI. Document unverified parts honestly.

## Future evolution

Add framework adapters for entry-point discovery, a pluggable direct-model API with explicit source-sharing controls, semantic per-symbol freshness, diffable model revisions, measured onboarding experiments, full sequence fragments, and automated local human-agent feedback. These require new OpenSpec changes.
