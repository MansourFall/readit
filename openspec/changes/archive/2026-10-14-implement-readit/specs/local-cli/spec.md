## ADDED Requirements

### Requirement: Dependency-free local runtime
The Node.js CLI SHALL provide demo, scan, validate, build, serve, help, version, and install-skill commands without a runtime dependency or model-provider API key. The demo SHALL use an explicitly labeled model tied to included executable source.

#### Scenario: Try without npm installation
- **WHEN** a developer runs node bin/readit.js demo with Node.js 22 or newer
- **THEN** the bundled interactive explorer is served on loopback with no dependency installation

### Requirement: Self-contained export
Build SHALL produce a single HTML file containing model data, source excerpts when provided, styles, rendering logic, and interactions. It SHALL work under file protocol without external assets or fonts.

#### Scenario: Open exported artifact offline
- **WHEN** the developer opens the built file with networking disabled
- **THEN** navigation, sequences, search, review, and exports remain available

### Requirement: Restricted source server
Serve SHALL bind to loopback, allow only GET, reject foreign origins and unrecognized hosts, and expose source only through model-listed evidence IDs within an explicit repository root. It SHALL never accept arbitrary filesystem paths or write target source.

#### Scenario: Unknown source request
- **WHEN** a request names an evidence ID absent from the loaded model
- **THEN** the server returns an error without reading an arbitrary file

#### Scenario: Foreign-origin request
- **WHEN** a source request includes a foreign Origin header
- **THEN** the server rejects it

### Requirement: Portable skill installation
Install-skill SHALL copy the READIT skill and references to a user-selected skills directory or the default Codex skills directory. It SHALL refuse to overwrite an existing READIT skill. Documentation SHALL explain CLI availability and invocation.

#### Scenario: Existing installation
- **WHEN** the destination already contains a readit skill
- **THEN** installation fails without deleting or overwriting it
