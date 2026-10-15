# Design

## Context

See `proposal.md` for motivation. READIT currently ships the full agent workflow in `skills/readit/SKILL.md`, while the CLI copies that directory into Codex and assumes a globally available `readit` executable. The same skill directory is already included in the npm package, and the CLI can resolve package assets relative to `bin/readit.js`. The runtime must remain native Node.js with no production dependencies, and analysis safety rules must apply before the host agent reads or executes target-repository content.

The external `skills` installer can discover repository-hosted skills and place them where supported agents expect them. It controls installation layout and composer integration; READIT controls only its skill files and CLI. Consequently, `/readit` is available only when the selected host maps installed skills to slash commands. Codex's documented explicit invocation remains `$readit`.

## Goals / Non-Goals

**Goals:**

- Separate portable skill installation from Codex-specific compatibility installation.
- Allow agent users to start without a global npm install.
- Give the CLI package ownership of the detailed, versioned agent workflow.
- Keep the bootstrap safe and useful when the registry is unavailable or while contributors test local changes.
- Validate packaging and bootstrap behavior without network-dependent tests.

**Non-Goals:**

- Implement a universal command-registration protocol across agent products.
- Add an OpenAI Agent Plugin or product-specific manifests beyond the existing optional OpenAI skill metadata.
- Bundle an LLM client, execute target applications, or change repository-analysis semantics.
- Remove the existing `install-skill` command in the same release.

## Decisions

### Use the external skills installer as the primary installation path

The quick start will recommend `npx skills add MansourFall/readit --skill readit`, with `-g` documented as the user-wide variant. This matches the repository-hosted skill layout and delegates agent-specific destination handling to tooling designed for that purpose. READIT will not add `skills` as a dependency; users explicitly invoke it through npm exec.

Alternatives considered:

- Extend `readit install-skill` to detect every agent. This would duplicate a changing compatibility matrix and couple READIT releases to agent filesystem conventions.
- Require `npm install -g @mansourfall/readit`. This makes the CLI available but does not install or expose the agent skill.

### Make the installed skill a guarded bootstrap

`SKILL.md` will retain its trigger description and the safety constraints that must be known before any target-repository interaction. Its workflow will select one command runner and use that runner consistently:

1. In a READIT source checkout, use `node /absolute/path/to/readit/bin/readit.js` when the user is testing unpublished local changes.
2. Otherwise try an available `readit agent-guide` command.
3. If that command is absent or predates `agent-guide`, use `npx -y @mansourfall/readit@latest agent-guide` and use the same npm-exec prefix for subsequent READIT commands.

The bootstrap will not run target-repository code or install target dependencies. Network acquisition is limited to the explicitly named scoped package and is disclosed in the skill and README.

Alternatives considered:

- Always prefer any global `readit`. An arbitrarily old global executable may not understand the guide command or current model contract.
- Always use npm exec. That ignores contributor changes in a local checkout and makes an already installed CLI needlessly dependent on registry availability.
- Duplicate the entire workflow in `SKILL.md`. Copies can remain stale after READIT fixes its safety or model instructions.

### Add a deterministic `agent-guide` CLI command

The package will contain a concise agent workflow plus the existing analysis playbook and model contract as Markdown assets under `skills/readit/references`. `readit agent-guide` will read those known package-relative files and emit one labeled Markdown document to standard output. It will accept no repository path and perform no network or target-source reads.

This output becomes the authoritative detailed instruction bundle. The thin `SKILL.md` tells the host to follow it, while retaining only bootstrap and preflight safety rules. Keeping the source documents as packaged files preserves contributor readability; assembling them at command time avoids a generated duplicate.

Alternatives considered:

- Print the full workflow from the generic help command. This makes human CLI help excessively long and mixes operational commands with agent policy.
- Expose package filesystem paths for the agent to read. npm exec may use an ephemeral cache whose location is not stable or suitable for host access.
- Fetch guidance from GitHub. This would add unnecessary network trust and make the installed npm package incomplete.

### Retain `install-skill` as an explicit compatibility path

No-argument `readit install-skill` will continue to target the Codex skills directory so existing automation does not silently change destination. Help text and completion output will label that default as Codex-specific and point new installations to the portable quick start. `--to` remains supported, and existing destinations remain protected from overwrite.

Changing the default to `.agents/skills` was rejected because it would be a silent breaking change and would still not cover every supported host. Removing the command immediately was rejected because version 0.1 users may already rely on it.

### Document invocation as a host capability

The README will present a compact matrix: Codex uses `$readit`; a host that exposes installed skills as slash commands may use `/readit`; all other compatible hosts can be prompted in natural language to use the READIT skill. The CLI help will avoid claiming that READIT registers a native slash command.

The existing `skills/readit/agents/openai.yaml` remains optional host metadata and will describe `$readit`; it does not make the core workflow Codex-dependent.

### Test behavior and package boundaries locally

Tests will invoke the CLI in subprocesses to cover `agent-guide`, help/version text, runner guidance, and compatibility installation into temporary directories. Structural tests will parse the skill frontmatter and assert that the bootstrap names only the scoped npm package. A package-content test will inspect `npm pack --dry-run --json` output or an equivalent local pack listing to ensure the skill and guide assets ship. Tests will not invoke the external installer or contact npm/GitHub.

The CLI version banner will derive from package metadata so the minor release does not introduce another hard-coded version mismatch.

## Risks / Trade-offs

- [Running `npx ...@latest` trusts the current npm release and may require network access] → Name the exact scoped package, document the acquisition, prefer an already working CLI, and provide local/global installation alternatives.
- [A very old copied skill cannot gain the new bootstrap automatically] → Document `npx skills update` and keep the legacy installer behavior; compatibility begins with the release containing this change.
- [The external installer may change flags or its supported-host matrix] → Keep it outside runtime dependencies, describe it as recommended external tooling, and maintain a manual `install-skill --to` escape hatch.
- [Thin bootstrap instructions could omit a safety rule needed before guide retrieval] → Retain repository-text, secrets, target-execution, and scoped-package constraints in `SKILL.md`; move only detailed analysis/model steps into CLI-owned guidance.
- [An available global CLI may be older than the copied skill] → Require the bootstrap to fall back to the scoped npm-exec command when `agent-guide` is unsupported.
- [Users may assume `/readit` is universal] → Put slash syntax behind an explicit host-capability condition and show Codex and natural-language forms beside it.

## Migration Plan

1. Add the guide asset and CLI command, centralize displayed package version, and cover both with tests.
2. Reduce the portable skill to its guarded bootstrap and verify the package includes every guide asset.
3. Update help, README quick start, invocation matrix, update instructions, and legacy installer messaging.
4. Bump the package to the next minor version and update its lockfile, then run the repository and OpenSpec validation suites plus a local package dry run.
5. Commit and push the reviewed change. Publishing the prepared package remains a separate explicit maintainer action.

Rollback is a normal source revert before publication. After publication, restore behavior in a patch release rather than unpublishing; the compatibility installer and existing global CLI commands remain available throughout.
