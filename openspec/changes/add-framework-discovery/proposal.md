# Improve agent investigation with framework entry-point candidates

## Why

READIT 0.1 gives the agent a generic source inventory. On Node.js/TypeScript applications, route/controller candidates can make it easier to find the user-visible boundaries and choose a bounded slice to trace.

## What Changes

- Add evidence-located Express route candidates for supported direct literal route registrations.
- Add NestJS controller/method candidates for supported literal decorators.
- Include unresolved-pattern notes rather than fabricated routes.
- Update READIT agent guidance and example fixtures to use candidates as investigation starting points.
- Preserve generic scanning for all other repositories.

## Capabilities

### New Capabilities
- `framework-discovery`: conservative Express/NestJS entry-point hints with source provenance.

### Modified Capabilities
None. This adds optional inventory metadata and does not change the READIT behavioral model.

## Impact

This change is planned and not implemented in the provided 0.1 source. It must keep the runtime dependency-free, never import/execute repository code, and never promote an entry-point candidate to an observed use case. Existing scan output fields and all offline/browser behavior remain compatible.
