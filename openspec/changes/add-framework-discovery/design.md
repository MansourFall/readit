# Framework discovery design

## Context

The scanner currently emits file hashes and generic textual hints. These are intentionally not business semantics. Add optional `entryPointCandidates` and `discoveryLimitations` to the inventory, leaving model version 1.0 unchanged.

## Goals / Non-Goals

Goals: find common literal Express and NestJS entry points without code execution; give the agent precise lines and provenance; expose ambiguity.

Non-goals: resolve middleware behavior, mounted router prefixes, computed decorators, dependency injection, dynamic imports, complete JS/TS parsing, or actual user goals.

## Decisions

- Keep adapters separate under `src/discovery/`; return candidates with framework, method, declared path, file, line, file SHA-256, and a note that the entry is a hypothesis to inspect.
- Support direct `app.get/post/put/patch/delete` and `router.get/post/put/patch/delete` with literal path arguments, and literal Nest `@Controller` with `@Get/@Post/@Put/@Patch/@Delete` method decorators. Document syntax limits explicitly.
- Do not concatenate unresolved router mounts into confident paths. Distinguish a declared path from an effective runtime path.
- Use a conservative lexical approach that skips comments and quoted source-like strings. Do not add a full parser dependency to the runtime in this change. If a pattern cannot be safely interpreted, omit the candidate and report the limitation.
- Read only scanner-permitted files and reuse their existing hash/line metadata.
- Sort candidates deterministically by path/line/method. Put unresolved-pattern notes in inventory rather than falsely marking them observed behavior.

## Risks / Trade-offs

Textual discovery will miss complex syntax. The UI must not consume candidates as use cases. Agents remain responsible for tracing implementation and checking effective paths. If coverage requirements later exceed a conservative lexical scanner, propose an AST-backed optional adapter as a separate change.

## Validation

Fixtures cover literal routes/decorators, multiline registrations, source-like comments/strings, computed arguments, unsupported patterns, and mixed repositories. Test that the scanner does not execute a fixture containing side effects and still respects ignore/security rules. Run all existing checks.
