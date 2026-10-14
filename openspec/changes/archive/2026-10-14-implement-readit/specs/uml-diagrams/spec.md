## ADDED Requirements

### Requirement: UML use case notation
READIT SHALL render actors outside a named system boundary, user goals as ellipses inside it, actor associations, and modeled include/extend dependencies as directed dashed arrows. The included goal SHALL be the target of include; the base goal SHALL be the target of extend.

#### Scenario: Checkout includes payment
- **WHEN** the model defines place-order including pay-order
- **THEN** the diagram and PlantUML source point the include dependency from place-order to pay-order

### Requirement: UML sequence notation
READIT SHALL render each scenario using participant headers, vertical lifelines, ordered messages, synchronous call arrows, dashed return arrows, open async arrows, and self-message loops. Only participants used by that scenario SHALL appear. Failure and alternate paths SHALL be individually selectable scenarios in the MVP.

#### Scenario: Return follows payment call
- **WHEN** a scenario calls payment and receives a receipt
- **THEN** the call uses a solid arrow and the receipt uses a dashed return arrow in chronological order

#### Scenario: Self-call
- **WHEN** a message has the same sender and receiver
- **THEN** its diagram uses a visible self-message loop

### Requirement: Editable UML export
READIT SHALL export use-case and selected scenario diagrams as local PlantUML text without sending source to a remote renderer.

#### Scenario: Download selected sequence
- **WHEN** the developer downloads the currently selected scenario
- **THEN** the file contains valid PlantUML participant declarations and the selected messages in model order
