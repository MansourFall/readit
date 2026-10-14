# READIT model contract (1.0)

Write JSON with the fields below. Read the shipped `examples/shop/readit.json` for a complete model. The runtime validator checks reference integrity; `schema/readit.schema.json` documents structure.

| Object | Required fields |
|---|---|
| Root | `schemaVersion: "1.0"`, `project`, `analysis`, `actors`, `participants`, `evidence`, `useCases`, `relationships` |
| Project | `name`, `description` |
| Analysis | `mode: "agent"`, ISO `generatedAt`, `scope`, array `limitations`; optional Git `commit` |
| Actor | `id`, `name` |
| Participant | `id`, `name`, `kind`: `actor`, `component`, `database`, or `external` |
| Evidence | `id`, relative `path`, inclusive `startLine`, `endLine`, 64-character `sha256`, `reason`; optional exact `snippet` |
| Use case | `id`, `name`, `goal`, `actorIds`, `preconditions`, `postconditions`, `confidence`, `evidenceIds`, `scenarios`; `rationale` for inferred claims |
| Scenario | `id`, `name`, `outcome`, ordered `steps` |
| Step | `id`, participant IDs `from`, `to`, `kind`: `call`, `return`, or `async`, `label`, `description`, `confidence`, `evidenceIds`; `rationale` for inferred claims |
| Relationship | use-case IDs `from`, `to`, `kind`: `include` or `extend`, `confidence`, `evidenceIds`; `rationale` for inferred claims |

Use `observed` only with at least one evidence ID. Use `inferred` with a nonempty rationale; evidence IDs may be empty. IDs must match `[a-zA-Z][\w-]{0,63}` and be unique within their collection. Steps and scenarios are locally unique within their parent.

An intentionally empty analysis may have no use cases; explain coverage gaps in its limitations. Each actual use case needs at least one actor and scenario; each scenario needs at least one message.

Limits: 100 use cases, 20 scenarios per use case, 100 messages per scenario, 40 actors, 40 participants, 1000 evidence records, 200 relationships, 5 MiB per model, 4000 characters per ordinary text field, 30000 per snippet, 201 lines per evidence range, 500 KiB per source file. Never embed credentials, even in otherwise permitted source files.

For hashing, use `readit scan` or Node's `createHash('sha256').update(await fs.readFile(path)).digest('hex')`. Do not hash only the excerpt. `build --root` rejects stale evidence and fills absent snippets.
