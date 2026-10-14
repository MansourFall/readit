# evidence-model Specification

## Purpose
Maintain a versioned behavioral model with explicit provenance, uncertainty, and verifiable source correspondence.

## Requirements

### Requirement: Versioned model integrity
READIT SHALL validate schema version 1.0, required object fields, collection limits, unique scoped IDs, actor/participant references, message kinds, relationship directions, and evidence references before rendering. Empty use-case collections SHALL be allowed; an actual use case SHALL have an actor and at least one nonempty scenario.

#### Scenario: Dangling message participant
- **WHEN** a message references a participant not defined in the model
- **THEN** validation fails with an actionable error and the model is not built

#### Scenario: Empty analysis
- **WHEN** a valid model has no discovered use cases
- **THEN** the explorer displays an empty state and avoids playback errors

### Requirement: Observed and inferred claims
Every observed use case, relationship, and sequence message SHALL cite at least one evidence record. Every inferred claim SHALL contain a nonempty rationale. The explorer SHALL make this distinction visible.

#### Scenario: Unsubstantiated observed step
- **WHEN** a step is labeled observed with no evidence IDs
- **THEN** validation rejects it

#### Scenario: Conceptual UI around backend-only code
- **WHEN** the agent models a customer interaction absent from the inspected source
- **THEN** it labels that message inferred and explains the assumed interaction

### Requirement: Source correspondence and freshness
Evidence SHALL include a safe relative path, inclusive 1-based line range, full-file SHA-256 hash, and reason. Root-based validation and build SHALL reject changed hashes, out-of-bounds ranges, inaccessible paths, and supplied snippets differing from source. Live source inspection SHALL identify a stale hash rather than claiming freshness.

#### Scenario: File changed after analysis
- **WHEN** a source file hash differs from its model evidence
- **THEN** build with a repository root fails and live inspection marks the reference stale

#### Scenario: Missing source excerpt
- **WHEN** valid evidence has no embedded snippet and build is given the matching root
- **THEN** build includes the exact referenced source lines in the export

### Requirement: Untrusted model handling
READIT SHALL treat model labels and snippets as text, never executable HTML or scripts, and SHALL reject sensitive or escaping source paths.

#### Scenario: Malicious label
- **WHEN** a label contains a closing script tag or HTML event handler
- **THEN** it remains inert text and does not create an executable element
