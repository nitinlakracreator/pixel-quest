# Support and Operations Guide

## Product scope

This guide supports **browser gameplay, player input, progression, assets, and saved state**.

## Before opening a support request

Record the product version or commit, operating system and platform, installation method, exact command or user workflow, timestamp, relevant non-sensitive logs, expected result, actual result, and whether data loss or a security concern is involved. Never attach passwords, tokens, private keys, customer records, or unredacted personal data.

## Severity model

| Severity | Meaning | Required handling |
|---|---|---|
| Critical | Security compromise, destructive data loss, unusable production service, or unsafe autonomous action | Stop affected distribution or operation, preserve evidence, and escalate to the owner immediately |
| High | Major workflow unavailable, incorrect customer data, or serious degradation without a safe workaround | Triage before the next production release |
| Medium | Important defect with a documented workaround | Schedule and track a corrective release |
| Low | Cosmetic, documentation, or minor usability issue | Track in normal product backlog |

## Operational minimum

Before commercial launch, the owner must document installation, configuration, health checks, logs and metrics, backup and restore, migrations, upgrade and rollback, incident escalation, supported platforms, and data deletion/retention. This repository provides the support structure; it does not claim that every operational procedure has been executed successfully.

## Customer support decisions

The owner must set the support channel, response targets, maintenance window, supported versions, service availability target, maintenance notification process, and customer communication policy before selling the product.
