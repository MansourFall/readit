# Spec Delta

## MODIFIED Requirements

### Requirement: Dependency-free local runtime
The Node.js CLI SHALL provide demo, scan, validate, build, serve, help, version, agent-guide, and install-skill commands without a runtime dependency or model-provider API key. The demo SHALL use an explicitly labeled model tied to included executable source.

#### Scenario: Try without npm installation
- **WHEN** a developer runs node bin/readit.js demo with Node.js 22 or newer
- **THEN** the bundled interactive explorer is served on loopback with no dependency installation

#### Scenario: Read packaged agent guidance
- **WHEN** an agent runs the agent-guide command from a published READIT package
- **THEN** the CLI emits the authoritative analysis workflow and model-contract guidance without contacting a model provider

### Requirement: Portable skill installation
Install-skill SHALL remain a compatibility command that copies the READIT skill and references to a user-selected skills directory or the default Codex skills directory. It SHALL identify the default as Codex-specific and refuse to overwrite an existing READIT skill. Documentation SHALL direct new portable installations to an agent-compatible skill installer.

#### Scenario: Existing installation
- **WHEN** the destination already contains a readit skill
- **THEN** installation fails without deleting or overwriting it

#### Scenario: Compatibility installation without a destination
- **WHEN** a developer runs install-skill without selecting a destination
- **THEN** READIT identifies and uses the legacy Codex-specific default destination

## ADDED Requirements

### Requirement: Agent-neutral skill distribution
The published repository SHALL expose the READIT skill in a layout discoverable by compatible agent-skill installers. Documentation SHALL provide one-command project-local and global installation paths and SHALL state that the installer is external tooling rather than a READIT runtime dependency.

#### Scenario: Project-local skill installation
- **WHEN** a developer follows the documented project-local quick start in a repository
- **THEN** the compatible installer can discover and add the named readit skill from the READIT GitHub repository

#### Scenario: Global skill installation
- **WHEN** a developer selects the documented global variant
- **THEN** the compatible installer can make the readit skill available across supported workspaces for that user

### Requirement: On-demand CLI bootstrap
The portable skill SHALL use an already available readit executable when appropriate and SHALL provide an npm-exec fallback for `@mansourfall/readit` when the executable is unavailable. A repository checkout workflow SHALL remain available for contributors who need to exercise local unpublished changes.

#### Scenario: No global CLI installation
- **WHEN** an installed skill is invoked and no readit executable is available
- **THEN** its instructions direct the host agent to run the published scoped package on demand

#### Scenario: Local READIT development
- **WHEN** a contributor invokes the skill while developing an unpublished READIT checkout
- **THEN** its instructions permit using that checkout's CLI instead of the registry package

### Requirement: Host-specific invocation guidance
Documentation SHALL distinguish agent installation from composer invocation and SHALL describe `$readit` for Codex, `/readit` only for hosts that expose installed skills as slash commands, and a natural-language invocation for other compatible hosts.

#### Scenario: Codex user invokes the skill
- **WHEN** a Codex user reads the quick start after installing the skill
- **THEN** the documented composer invocation is `$readit`

#### Scenario: Slash-command host invokes the skill
- **WHEN** a host exposes installed skills as slash commands
- **THEN** the documentation describes `/readit` as a host feature rather than a native command registered by the READIT CLI

#### Scenario: Host has no skill command syntax
- **WHEN** a compatible agent host does not expose `$` or slash skill commands
- **THEN** the documentation provides an equivalent natural-language request that names READIT's repository-analysis behavior

### Requirement: Skill and CLI guidance compatibility
The portable skill SHALL obtain its detailed execution guidance from the installed or on-demand READIT CLI. Automated checks SHALL verify that the bootstrap references the published package and that npm package contents include the skill and guidance required for offline CLI output.

#### Scenario: Copied skill outlives a CLI release
- **WHEN** a previously installed bootstrap invokes a newer compatible READIT package
- **THEN** the detailed workflow is supplied by that package instead of duplicated in the bootstrap

#### Scenario: Package contents are verified
- **WHEN** maintainers prepare the npm package
- **THEN** an automated check confirms the agent guide and portable skill assets are included without making a registry request
