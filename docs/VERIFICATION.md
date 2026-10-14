# Verification record

Verified on 14 October 2026 with Node.js 24.19.0. The declared supported runtime is Node.js 22+; the GitHub workflow is configured for Node.js 22 but has not been run remotely yet.

## Passed

- **11 Node tests:** exact example evidence; independently generated invitation model; malformed/dangling/duplicate model IDs; observed/inferred claim rules; Git ignores and source exclusions; traversal/symlink/binary limits; stale hashes and fabricated snippets; safe HTML embedding; UML direction/message exports; shop success/failure outcomes; local source HTTP restrictions.
- **Headless Chromium browser checks:** use-case search and selection, keyboard map activation, scenario switching, playback and reset, live source correspondence, review persistence after reload, light/dark theme, UML export, HTML export reopened offline, invalid/hostile/empty JSON import handling, mobile document width, and reduced-motion packet suppression.
- **OpenSpec:** official 1.14.1 CLI validation with strict checks.
- **Portable skill:** skill-creator frontmatter/name validation; explicit temporary-folder install; overwrite refusal.
- **Independent skill trial:** a fresh agent used the skill on an invitation module, generated a source-backed use case with five scenarios, validated eight source references, and built the explorer. The trial's standalone server was not independently browser-tested; the core server was tested separately.
- **Packaging:** npm package contents reviewed; runtime files and skill references included without node_modules.

Desktop and mobile renderings were visually inspected. Browser test screenshots were used only for review and are not distributed.

## Limits

The tests verify deterministic tooling and selected UI behavior, not universal semantic accuracy. They do not establish exhaustive language/framework support, production runtime traces, complete UML compliance, real payment behavior, or measured onboarding gains. PlantUML export structure/direction is tested, but no external PlantUML renderer was used. README GitHub publishing commands have not been executed against a user account. No hackathon registration/submission or demo video has been produced.

Reproduce core checks with `npm test` and `npm run spec:validate`. For browser checks install Chromium via `npx playwright install chromium`, then run `npm run test:ui`. A preinstalled compatible Chromium can be selected with `READIT_CHROMIUM_EXECUTABLE=/absolute/path/to/chromium`.
