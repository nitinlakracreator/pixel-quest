# Pixel Quest — Commercial Readiness Contract

**Document status:** Engineering acceptance contract. This file does not claim that all gates have passed.

## Primary customer outcome

The product must let a customer complete **load the game, play the core loop, win or lose, restart, and retain accessible controls** reliably on the supported platform, with understandable errors, safe recovery, and documented limitations.

## Release gates

| Gate | Required evidence | Status |
|---|---|---|
| Functional workflow | Automated happy-path and negative-path tests for the primary customer outcome | Open until attached to the release |
| Security | Threat model, dependency audit, secret scan, authorization tests, and abuse-case tests | Open until reviewed |
| Reliability | Restart, timeout, partial failure, corrupted input, and recovery tests | Open until attached |
| Performance | Documented workload, baseline hardware, performance budget, and regression threshold | Open until measured |
| Deployment | Clean installation/deployment from documented instructions and health check | Open until reproduced |
| Data protection | Backup, restore, retention, deletion, and migration evidence where data is stored | Open until verified |
| Release provenance | Reproducible build, artifact checksum, SBOM, version, and rollback instructions | Open until recorded |
| Supportability | Versioned troubleshooting guide, issue template, escalation owner, and incident runbook | Open until published |
| Licensing and privacy | Owner-approved license, third-party notices, privacy/data handling review, and terms appropriate to the commercial model | Requires owner/legal review |

## Non-negotiable acceptance criteria

1. No known critical or high-severity security defect may remain open for a production release.
2. Every externally visible promise must be labelled as implemented, tested locally, tested in CI, tested on target, experimental, or not supported.
3. CI must run on the exact pull-request commit and must fail closed for required security, build, and test gates.
4. Production artifacts must not be debug-labelled, locally signed without provenance, or distributed without checksums and rollback instructions.
5. User data and credentials must never be written to logs, test fixtures, generated reports, or unreviewed artifacts.
6. A new operator must be able to install, configure, health-check, back up, restore, update, and roll back the product using the documentation.

## Owner decisions required before commercial launch

The repository owner must approve the commercial license model, supported platforms, support response expectations, telemetry/privacy policy, data retention policy, pricing/entitlement model if applicable, and the definition of a production incident. These decisions cannot be inferred from source code and must not be silently invented by engineering.

## Evidence register

Attach links or filenames for the final threat model, test report, performance report, target-platform acceptance record, deployment transcript, release checksum/SBOM, and support/runbook documents before changing this contract from **Open** to **Accepted**.
