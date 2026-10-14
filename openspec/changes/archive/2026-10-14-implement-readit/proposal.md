# READIT: from generated code to human understanding

## Why

READMEs explain setup and intent but rarely let a newcomer follow user goals through application behavior. As AI produces more code, teams can merge behavior faster than they acquire shared understanding. READIT makes that understanding inspectable through source-backed use cases and interactive sequences.

## What Changes

- Ship an Agent Skills-compatible READIT workflow for Codex and compatible agents.
- Inventory local repositories without executing their code; ask the agent to investigate actual implementations.
- Define a versioned model joining actors, user goals, scenarios, ordered messages, and source evidence.
- Render genuine UML use case and sequence notation with interactive selection and playback.
- Show observed/inferred distinctions, limitations, and current evidence freshness.
- Export offline HTML, structured JSON, editable PlantUML, and review notes for the agent.
- Include an executable example, tests, license, GitHub CI, and hackathon presentation guidance.

## Capabilities

### New Capabilities
- `repository-analysis`: safe inventory and agent-driven behavioral discovery.
- `evidence-model`: strict behavioral model and source correspondence checks.
- `uml-diagrams`: use case and scenario sequence rendering plus PlantUML.
- `interactive-explorer`: searchable navigation, playback, source inspection, and review.
- `local-cli`: local serving, offline export, and portable installation.

### Modified Capabilities
None: this is a new project.

## Impact

No runtime API dependency or API key. The host coding agent performs the AI reasoning, subject to its own provider/data handling. READIT's CLI and generated explorer make no model-provider requests. Code analysis remains fallible: the MVP surfaces evidence and uncertainty rather than guaranteeing complete business-requirement recovery. OpenSpec and Playwright are development dependencies, not runtime dependencies.
