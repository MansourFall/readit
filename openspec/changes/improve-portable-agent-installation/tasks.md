# Tasks

## 1. Package-owned agent guidance

- [x] 1.1 Extract the detailed repository-analysis workflow into a packaged agent-guide Markdown asset and implement `readit agent-guide` to emit that workflow, the analysis playbook, and the model contract in a deterministic labeled document; verify a CLI subprocess test asserts the required sections and zero repository/network inputs.
- [x] 1.2 Read the displayed CLI version from package metadata instead of duplicating it in `bin/readit.js`, and verify help and `--version` subprocess tests report the package version and list `agent-guide`.

## 2. Portable skill bootstrap and installation docs

- [x] 2.1 Replace the copied full workflow in `skills/readit/SKILL.md` with a guarded bootstrap that preserves preflight safety rules, selects local/global/npm-exec runners in the designed order, falls back to `npx -y @mansourfall/readit@latest`, and follows the emitted agent guide; verify structural tests cover frontmatter, runner selection, scoped-package naming, and the retained safety boundaries.
- [x] 2.2 Add a local package-content assertion for the skill, agent guide, analysis playbook, model contract, and OpenAI metadata, and verify it passes against the package's dry-run file listing without registry or GitHub access.
- [x] 2.3 Rewrite the README quick start around `npx skills add MansourFall/readit --skill readit`, document the `-g` variant, update command, npm-exec acquisition, contributor-checkout path, and the `$readit`/conditional `/readit`/natural-language invocation matrix; verify every documented READIT CLI command is consistent with `readit --help`.

## 3. Compatibility installer

- [x] 3.1 Make CLI help and `install-skill` completion output label the no-argument destination as a legacy Codex-specific compatibility path and direct new users to the portable installation docs, while preserving `--to` and no-overwrite behavior; verify temporary-directory CLI tests cover successful copy and refusal to overwrite.
- [x] 3.2 Update the README compatibility and troubleshooting sections for explicit `install-skill --to`, registry-unavailable operation, old global CLIs, and skill refreshes; verify the documented compatibility command matches CLI help.

## 4. Release preparation and integration

- [x] 4.1 Bump `@mansourfall/readit` to the next minor version in package metadata and lockfile, and verify `npm pack --dry-run --json` reports the expected name, version, CLI, skill, and guide assets without publishing.
- [x] 4.2 Run `npm test` and `npm run spec:validate`, then inspect `git diff --check` and the package dry-run output to verify the implementation, planning artifacts, formatting, and publish contents together.

## Workflow follow-up

- Review, commit, and push the implemented change after all tracked tasks pass.
- Publish the prepared npm version only after explicit maintainer approval.
- Archive the OpenSpec change after the implementation and review requirements are satisfied.
