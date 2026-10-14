## ADDED Requirements

### Requirement: Safe local inventory
READIT SHALL inventory supported source/text files using Git ignore rules when inside a Git repository, otherwise using a bounded filesystem traversal. It SHALL skip sensitive filenames, generated/vendor directories, binary or oversized sources, and symlinks. Inventory SHALL contain relative paths, SHA-256 hashes, line counts, and bounded entry-point hints without executing target code.

#### Scenario: Git repository with excluded files
- **WHEN** the repository contains a source file, a Git-ignored file, a private key, and a node_modules directory
- **THEN** scan inventories only permitted source files and never emits those excluded file contents

#### Scenario: Non-Git repository
- **WHEN** scan targets a folder without Git metadata
- **THEN** it uses filesystem traversal, records that strategy, and applies the same built-in exclusions

### Requirement: Agent-driven discovery
The READIT skill SHALL instruct the host agent to inspect source and discover actors and user goals, then trace their implementation into ordered scenarios. Scan hints SHALL NOT be presented as automatically verified use cases.

#### Scenario: Utility function appears in inventory
- **WHEN** scan finds a helper function
- **THEN** the agent investigates its callers and user goal before deciding whether it belongs in a sequence

#### Scenario: Missing implementation
- **WHEN** the agent cannot resolve an external integration or dynamic call
- **THEN** it marks the relevant interpretation inferred or records the gap in analysis limitations

### Requirement: Bounded behavioral coverage
The skill SHALL record analysis scope and limitations and SHALL distinguish happy paths, failures, and alternate scenarios when supported by inspected source.

#### Scenario: Checkout has payment failure compensation
- **WHEN** the source restores reserved stock after a failed payment
- **THEN** the model includes a failure scenario with the compensation message and corresponding evidence
