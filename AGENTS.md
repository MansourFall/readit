# READIT contributor guidance

READIT turns repository understanding into explicit, inspectable user goals and flows. Read README.md and openspec/config.yaml first. Use OpenSpec for behavior changes; keep observed/inferred distinctions and source evidence intact.

- Run npm test and npm run spec:validate. Run npm run test:ui for UI changes.
- Native Node ESM and vanilla browser JS/CSS; keep runtime dependency-free.
- Never promote scanner hints into verified use cases. The host agent investigates source.
- Escape model text and embedded JSON. Do not add remote assets to offline export.
- Keep source reads constrained to model evidence and a configured repository root.
- Keep the portable skill in skills/readit. Do not install it globally while developing the repository.
- Update the model contract and schema together. Refresh fixture hashes with node scripts/make-demo.mjs after fixture edits.
- Describe static analysis as interpretation, not runtime verification.
