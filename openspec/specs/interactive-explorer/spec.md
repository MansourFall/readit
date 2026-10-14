# interactive-explorer Specification

## Purpose
Help developers navigate user goals, inspect implementation messages, and review evidence through a portable interactive UI.

## Requirements

### Requirement: Goal-based navigation
The explorer SHALL support use-case search, actor filtering, diagram selection, browser hash links, and browser-local visited progress. A selected use case SHALL expose its goal, actors, preconditions, postconditions, evidence, and scenarios.

#### Scenario: Search by actor or goal
- **WHEN** a developer types a matching goal or actor name
- **THEN** the navigation shows matching use cases and a count, or a helpful no-results state

#### Scenario: Click an ellipse
- **WHEN** a developer activates a use-case ellipse by pointer or keyboard
- **THEN** the explorer opens that use case's story and flow

### Requirement: Playable flows
The explorer SHALL provide play/pause, previous/next, reset, scenario selection, and direct message selection. The active message SHALL highlight and expose a description and evidence. Switching scenarios or hiding the page SHALL pause playback.

#### Scenario: Explore payment decline
- **WHEN** the developer switches from successful checkout to payment declined
- **THEN** the displayed sequence changes to the failure path and playback resets to its first message

### Requirement: Source and uncertainty inspection
The explorer SHALL show source-backed/inferred badges, rationales, source snippets with line ranges, and analysis limitations. A local server with a repository root SHALL verify evidence when opened; standalone artifacts SHALL identify source as a recorded snapshot.

#### Scenario: Open source details locally
- **WHEN** an evidence detail is expanded against a matching repository root
- **THEN** the explorer shows the current referenced snippet and its correspondence status

### Requirement: Review and portability
The explorer SHALL save review notes locally in the browser and export them as Markdown for the host agent. It SHALL import validated models and export JSON, offline HTML, and UML source without network publication.

#### Scenario: Review a suspicious message
- **WHEN** the developer writes a note on a message and exports the review
- **THEN** the Markdown identifies the use-case/scenario/step and contains the note for further source investigation

#### Scenario: Invalid imported model
- **WHEN** a developer imports malformed or invalid JSON
- **THEN** the explorer reports the failure and preserves its currently usable model

### Requirement: Responsive and accessible interaction
The explorer SHALL provide responsive desktop/mobile layouts, keyboard controls, accessible labels, visible focus, dark/light themes, and reduced-motion support. Wide diagrams SHALL scroll within their panel rather than overflow the document.

#### Scenario: Reduced-motion preference
- **WHEN** the browser prefers reduced motion
- **THEN** decorative transitions and moving message packets are disabled while stepping and selection remain usable
