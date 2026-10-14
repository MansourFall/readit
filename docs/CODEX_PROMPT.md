# Codex handoff

The source already implements the READIT 0.1 MVP. Copy this into Codex from the repository root to extend it using the prepared OpenSpec change:

```text
You are working on READIT, an open-source tool for developer onboarding and
understanding AI-generated code beyond the README.

Read AGENTS.md, README.md, docs/PRODUCT_SPEC.md, openspec/config.yaml, the
current openspec/specs/, and all artifacts in
openspec/changes/add-framework-discovery/ before editing.

Use OpenSpec to implement add-framework-discovery. First inspect the existing
scanner, model validator, portable skill, and tests. Implement its unchecked
tasks in small coherent changes. Keep this runtime dependency-free and retain
offline HTML, evidence provenance, observed/inferred badges, and safe source
access. Entry-point candidates are hints, not automatically discovered or
verified user goals. Never run target repository code to discover it.

Run npm test, npm run spec:validate, and relevant browser checks. Document
unsupported patterns, update the skill's analysis guidance, and check tasks
only after verification. Do not publish to npm or GitHub without my instruction.
```

Setup:

```bash
npm ci
npx openspec init --tools codex --no-animation
npm run spec:validate
```

Codex's generated OpenSpec apply skill can be invoked as:

```text
$openspec-apply-change add-framework-discovery
```

For a clean-room rebuild instead, provide `docs/PRODUCT_SPEC.md` and the archived `openspec/changes/archive/2026-10-14-implement-readit/` proposal, design, specs, and tasks to Codex. Ask it to implement the described MVP with those requirements. In the provided checkout, extend the existing code instead of regenerating it.

For a different direction, ask `$openspec-propose` to create a bounded new change from `docs/ROADMAP.md`. Keep advanced behavior explicitly separate from the implemented 0.1 scope.
