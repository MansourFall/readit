# Proposal

## Why

READIT can be published as an npm CLI and copied into Codex, but its current quick start still asks users to install the CLI globally and describes only Codex's `$readit` invocation. Users should be able to add READIT as an agent skill with one command, let the skill acquire the matching CLI on demand, and understand how to invoke it across compatible agent hosts without assuming that every host implements the same composer syntax.

## What Changes

- Make `npx skills add MansourFall/readit --skill readit` the primary agent installation path, with documented project-local and global variants.
- Make the installed skill bootstrap the published `@mansourfall/readit` CLI on demand, while retaining the repository-checkout path for contributors developing READIT itself.
- Add a CLI-owned agent guide so the npm package, rather than a potentially stale copied skill, supplies the authoritative workflow and model instructions used at execution time.
- Document host-specific invocation: `$readit` in Codex, `/readit` where a host exposes installed skills as slash commands, and a natural-language fallback elsewhere.
- Keep `readit install-skill` as a compatibility path for existing Codex users, but make its Codex-specific default and status explicit instead of presenting it as the portable installation method.
- Add structural and CLI tests that verify the skill bootstrap, packaged guidance, compatibility installer behavior, and npm package contents without requiring network access in the test suite.
- Refresh installation, update, troubleshooting, and contribution guidance; prepare a minor package release without publishing it automatically.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `local-cli`: Extend CLI and portable-skill distribution requirements to support agent-neutral installation, on-demand CLI execution, authoritative packaged agent guidance, host-specific invocation instructions, and a backwards-compatible Codex installer.

## Impact

- Affected code: `bin/readit.js`, the portable skill under `skills/readit`, CLI/package tests, and package metadata needed for the next release.
- Affected documentation: `README.md`, CLI help, and contributor/release guidance where applicable.
- External tooling: the recommended install command uses the third-party `skills` installer through `npx`; READIT does not take a runtime dependency on it.
- Compatibility: existing global CLI usage and `readit install-skill` remain available in this change. Composer syntax remains host-defined; READIT documents supported forms rather than claiming to register a native `/readit` command in Codex.
- Out of scope: an OpenAI Agent Plugin manifest, native commands for every agent product, automatic npm publishing, and changes to READIT's evidence or analysis semantics.
