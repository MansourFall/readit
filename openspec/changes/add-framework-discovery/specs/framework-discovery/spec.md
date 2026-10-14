## ADDED Requirements

### Requirement: Express entry-point candidates
The scanner SHALL emit optional evidence-located candidates for supported direct literal Express route registrations without executing or importing target code. Candidates SHALL distinguish declared paths from unresolved runtime mount paths and SHALL NOT become use cases automatically.

#### Scenario: Literal route registration
- **WHEN** a permitted source file registers router.post('/orders', handler)
- **THEN** inventory includes a POST candidate with declared path /orders, source path, line, and file hash

#### Scenario: Dynamic route
- **WHEN** a route uses an unresolved computed path
- **THEN** inventory reports a discovery limitation rather than inventing a literal path

### Requirement: NestJS entry-point candidates
The scanner SHALL emit optional candidates for supported literal controller and HTTP-method decorators, preserving source location and noting unresolved context.

#### Scenario: Literal controller method
- **WHEN** a permitted controller has @Controller('orders') and a method with @Post()
- **THEN** inventory records the declared controller prefix and method path with exact source provenance

### Requirement: Conservative lexical discovery
Discovery SHALL skip source-like text in comments and string values and SHALL document unsupported syntax. It SHALL never run the target file to resolve ambiguity.

#### Scenario: Comment contains a route example
- **WHEN** source includes router.get('/fake', handler) only inside a comment or string
- **THEN** no live entry-point candidate is emitted for that example

#### Scenario: Fixture has import-time side effects
- **WHEN** scanning a file with a top-level side effect
- **THEN** discovery reads its text without executing that side effect

### Requirement: Inventory compatibility
Generic inventory fields and exclusions SHALL remain compatible. New candidate lists SHALL sort deterministically and SHALL be optional for unsupported frameworks. The skill SHALL instruct the agent to verify every candidate before tracing a user goal.

#### Scenario: Mixed-language repository
- **WHEN** a repository contains Express, NestJS, and non-JavaScript files
- **THEN** scan retains the generic inventory for all permitted files and adds framework metadata only where supported
