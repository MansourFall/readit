## 1. Discovery contract
- [ ] 1.1 Define optional inventory entryPointCandidates and discoveryLimitations shapes.
- [ ] 1.2 Document supported syntax and the candidate-only trust boundary.

## 2. Adapters
- [ ] 2.1 Add a conservative lexical utility that excludes comments and quoted source-like examples.
- [ ] 2.2 Implement Express literal direct-route candidates with source positions and hashes.
- [ ] 2.3 Implement NestJS literal controller/method candidates with unresolved-context notes.
- [ ] 2.4 Merge adapter results into scan output without executing source or altering exclusions.

## 3. Fixtures and skill guidance
- [ ] 3.1 Add focused fixtures for supported, multiline, computed, commented, and side-effecting code.
- [ ] 3.2 Update the portable skill playbook to investigate candidates without treating them as use cases.
- [ ] 3.3 Document examples and unsupported patterns in README.

## 4. Validation
- [ ] 4.1 Test deterministic ordering, exact source metadata, false-positive suppression, and no execution.
- [ ] 4.2 Run npm test, npm run spec:validate, and browser regression checks.
- [ ] 4.3 Review all new candidate labels for the distinction between declared and effective runtime routes.
