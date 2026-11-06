---
name: go-live-check
description: Build the go-live check for a release, each line with its reason, how it is checked and the evidence. Use when a release is next.
---

Build the check for one release. It lists evidence and ends in a recommendation, not a verdict: the owner decides whether to go.

## Shape

At most 30 lines. Each line has: the item, why it exists (a past incident or a source), how it is checked (`code` with the command, or `human` with a named owner), the evidence, and the result. A line with no reason or no check is not a line. A `pass` with no evidence is not a pass.

Size it to the release. A first store publication gets the long list, because staged rollout is not available for a first publish. An update with no backend change gets the short one.

## What the lines cover

- The date: the weekday, and any external event on or near it. A Monday or Friday is a warning, not a ban.
- The build is reproducible and its version is above the last published one.
- A rollback or a kill switch exists. A fix cannot be pushed to a phone quickly, so this comes before launch.
- The staged rollout is written down: the percent steps, who halts, and what halts it.
- Monitoring is on and someone is watching it.
- Support staff are briefed.
- The previous version still works against the backend.
- Security and accessibility items the release touches.
- Open tickets in the release, and pull requests not merged.

## Findings

A finding with no fix becomes a ticket that blocks the release. The result is a recommendation: go, no go, or go with conditions, and each condition is dated. The check names the person who decides.
