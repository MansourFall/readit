# READIT

**Beyond the README. Follow the story.**

READIT turns a repository into an evidence-backed map of what the application does and how the code makes it happen. It combines a coding-agent skill, a dependency-free Node.js CLI, and an interactive UML explorer to help developers understand unfamiliar codebases.

Published on npm as [`@mansourfall/readit`](https://www.npmjs.com/package/@mansourfall/readit).

Instead of producing a generic summary, READIT organizes understanding around actors, user goals, scenarios, messages, and exact source references. It keeps source-backed observations separate from interpretations so reviewers can see what the code establishes and what still needs confirmation.

## What READIT provides

- UML use case diagrams for actors, goals, system boundaries, and dependencies.
- UML sequence diagrams with calls, returns, async messages, and self-calls.
- Separate success, alternate, and error scenarios.
- Exact file, line, snippet, and SHA-256 evidence for observed claims.
- Explicit rationales for inferred claims and visible analysis limitations.
- Search, actor filters, deep links, progress tracking, and review notes.
- Self-contained offline HTML and editable PlantUML exports.
- Local source inspection with no telemetry, remote rendering, or bundled model API.

READIT performs static interpretation, not runtime verification. Its scanner inventories source files and entry-point hints; the host coding agent investigates the code and constructs the behavioral model.

## Requirements

- Node.js 22 or later
- npm
- Codex or another Agent Skills-compatible coding agent for repository analysis

The CLI has no runtime dependencies and does not require an API key.

## Installation

Install the CLI globally from npm:

```bash
npm install --global @mansourfall/readit
readit --version
```

Install the READIT skill for Codex:

```bash
readit install-skill
```

Restart Codex after installing the skill. READIT refuses to overwrite an existing skill installation. To install into a different skills directory, use:

```bash
readit install-skill --to /path/to/skills
```

To try the demo without installing the CLI globally:

```bash
npx --yes @mansourfall/readit demo
```

Update an existing global installation with:

```bash
npm update --global @mansourfall/readit
```

### Install from source

```bash
git clone https://github.com/MansourFall/readit.git
cd readit
npm ci
npm link
npm run skill:install
```

## Quick start

Explore the included source-backed demo:

```bash
readit demo
```

Open `http://127.0.0.1:4173`, choose **Place an order**, and explore the success and failure scenarios. Stop the server with Ctrl+C.

To analyze your own repository, open that repository in Codex and ask:

```text
Use $readit to map this repository for developer onboarding.
Identify its main actors and user goals. Trace the implementation of the
most important use cases, including meaningful success and failure paths.
Attach exact source evidence, mark uncertainty, and generate the interactive
explorer in .readit/. Do not execute the target app or publish its source.
```

The skill guides the agent through scanning the repository, inspecting relevant source, creating `.readit/readit.json`, validating its evidence, and building `.readit/readit.html`.

## CLI usage

```text
readit demo [--port 4173]
readit scan <repo> [--out inventory.json]
readit validate <model.json> [--root repo]
readit build <model.json> [--out file.html] [--root repo]
readit serve <model.json> [--root repo] [--port 4173]
readit install-skill [--to directory]
```

A manual workflow looks like this:

```bash
readit scan /path/to/repo --out /path/to/repo/.readit/inventory.json
# Ask your coding agent to inspect the source and create readit.json.
readit validate /path/to/repo/.readit/readit.json --root /path/to/repo
readit build /path/to/repo/.readit/readit.json \
  --root /path/to/repo \
  --out /path/to/repo/.readit/readit.html
readit serve /path/to/repo/.readit/readit.json --root /path/to/repo
```

`scan` creates an inventory; it does not invent actors, goals, or business requirements. Validation with `--root` checks file hashes, line ranges, and evidence snippets against the current source. A changed file makes its recorded evidence stale.

## How the evidence model works

- `observed` claims include source references supplied by the model author.
- `inferred` claims represent interpretations and require a rationale.
- Neither label claims that a behavior was exercised at runtime.
- Offline exports contain recorded source snapshots; the local server can also check current source freshness.

The JSON model is defined structurally in `schema/readit.schema.json` and semantically in `src/model.js`. Complete examples live in `examples/shop/readit.json` and `examples/invitations/readit.json`.

## Contributing

Contributions are welcome. Start by forking the repository and creating a focused branch:

```bash
git clone https://github.com/YOUR_USERNAME/readit.git
cd readit
git switch -c your-change
npm ci
```

Before opening a pull request, run:

```bash
npm test
npm run spec:validate
npx playwright install chromium
npm run test:ui
npm run build
```

For behavior changes, create or update an OpenSpec change before implementation and keep its specs, design, and tasks consistent with the code. Documentation-only fixes do not require an OpenSpec change.

When contributing:

- Keep the runtime dependency-free and use native Node.js ESM and browser JavaScript/CSS.
- Preserve the distinction between observed evidence and inferred interpretation.
- Do not present scanner hints or static analysis as verified runtime behavior.
- Keep source access constrained to the configured repository root and model evidence.
- Escape model-provided text and embedded JSON.
- Do not add remote assets to offline exports.
- Update the schema and model contract together when the model format changes.
- Refresh fixture hashes with `node scripts/make-demo.mjs` after fixture edits.

Pull requests should explain the user-facing problem, the chosen approach, and the validation performed.

## Project structure

| Path | Purpose |
|---|---|
| `bin/`, `src/` | CLI, validation, source inventory, evidence access, diagrams, build, and server |
| `web/` | Offline explorer interface |
| `skills/readit/` | Portable coding-agent skill and its references |
| `examples/` | Executable examples and READIT models |
| `openspec/` | Capability specifications and planned changes |
| `schema/` | JSON model schema |
| `test/` | Core, security, behavior, and browser tests |
| `docs/` | Product direction, roadmap, verification, and AI disclosure |

## Security and privacy

READIT does not upload source code, call a model provider, or render diagrams through a remote service. Analysis runs through the coding agent you choose, subject to that agent's own data-handling policies. The CLI constrains source reads to the configured repository root and rejects traversal and symlink escapes.

## License

READIT is available under the [MIT License](LICENSE). Third-party notices are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
