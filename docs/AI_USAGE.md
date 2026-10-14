# AI usage disclosure

## AI's role in the product

READIT's installed skill guides the user's coding agent through repository investigation: identify actors and goals, trace handlers/services/side effects, produce named scenarios, and attach evidence. The host agent supplies semantic reasoning. READIT's deterministic tools inventory source, validate the model, check evidence correspondence, and render/export the result.

The prototype includes no direct model-provider API, API key, or embedded local model. Analysis runs through the user's existing Codex or compatible Agent Skills harness. That agent's own model, account, and data-handling policies still apply. “Local explorer” describes READIT rendering and source tooling, not a promise that the user's host model runs locally.

## AI used to build this prototype

The initial specs, implementation, and documentation were produced with an OpenAI coding agent in ChatGPT Work / Codex. An independent coding-agent trial used the portable READIT skill on the invitation fixture and generated its model. The shop model is a manually constructed demonstration tied to executable source, not presented as automatic analysis.

Before submitting, record the exact model names shown in your own coding-agent session and any additional tools you use. No provider model ID is hard-coded into this repository, and the documentation does not invent an exact model version.

## Verification boundaries

- Structural/reference validation, file hashes, ranges, and snippet checks are deterministic.
- Browser interactions and executable fixture paths are tested separately.
- These checks do not independently prove every semantic inference or recover complete business requirements.
- Inferred messages and scope gaps remain visible. Model review is part of the workflow.

## Dependency disclosure

Runtime: native Node.js and browser APIs; no external libraries or API calls.

Development: OpenSpec for specification workflow; Playwright for browser verification; Git/GitHub for source history and CI. See package-lock.json and THIRD_PARTY_NOTICES.md. Lavish AXI inspired the interaction approach but is not a code dependency.
