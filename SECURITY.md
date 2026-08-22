# Security Policy

## Scope

This policy covers the repository, published artifacts, build and release process, and the supported product behavior for **browser gameplay, player input, progression, assets, and saved state**.

## Reporting a vulnerability

Do not publish sensitive exploit details in a public issue. Report privately through the repository owner’s configured GitHub security-advisory channel or the private contact supplied by the product owner. Include the affected version or commit, platform, prerequisites, reproducible steps, impact, and any safe proof of concept. Do not include real customer data, credentials, private keys, or destructive payloads.

If no private security channel is configured, the owner must configure one before commercial launch. This document is a process baseline, not a promise of a response-time SLA.

## Response process

The owner should acknowledge receipt, reproduce the report in an isolated environment, classify severity, develop and test a fix, assess affected releases, publish mitigation guidance, and record closure evidence. Critical findings require release triage before distribution. Security fixes must include a regression test where practical.

## Safe-use requirements

Customers must not place secrets or personal data in logs, issue reports, fixtures, or public artifacts. Production deployments must use supported versions, protected credentials, least-privilege configuration, backups, and a rollback plan.

## Owner decisions before launch

The owner must define supported versions, disclosure timelines, security-contact identity, incident-notification obligations, data-processing responsibilities, and any regulatory requirements with qualified professional advice where appropriate.
