---
name: retro
description: Look back at a batch of work that has landed and propose fixes to the owner's setup, from the logs and the review rounds. Writes a findings list and edits nothing. Use when the owner asks for a retrospective on a batch. Skip when the batch has not closed.
disable-model-invocation: true
---

A **retro** looks back at a batch of work and asks what in the owner's setup let its problems happen, so the next batch goes better. It reads and reports. The fixes are someone else's work, and none is made until the owner agrees.

The owner starts it, or whoever runs the batch for the owner by typing the command. No character calls it. Louis may offer it when a batch closes, in one line, and does not run it. If the owner names no batch, ask which one. Do not guess.

## Inputs

Read in this order, and stop reading when the findings are clear.

1. **The action log and the decision log**, the batch's lines only. They are small and already the record.
2. **Louis's rulings and rounds for the batch**: the prefix lines, the outcomes and any open BLOCKERs. They say why an item came back.
3. **Session transcripts**, only for an item the first two flagged, to find the moment it went wrong. Never a sweep: transcripts are the costly input, and usage is capped.

## Signals

Look for four signals. Each is read in a set place.

- **Bounced:** an item sent back to its author. Read it from logged loops and failed rounds.
- **Over budget:** an item that used more than it was given. Read it from the Budget on the line against the State it ended in.
- **Reversed:** a decision undone later. Read it from a decision block that names the one it replaces.
- **Missing fields:** a line that lacks what the next reader needed. The logs are free text, not structured fields, so a missing field can only mean the line has no Budget or Next. State that in the findings, and do not present it as measured.

A signal is evidence that something went wrong. It is not yet a finding.

## Categories

Class each finding by the kind of fix it needs.

- **Navigation:** the work took long to find the right file or fact. Fix: a pointer from a file that is always read to the one that matters.
- **Automated check:** a lint rule, type, test or CI job could have caught the mistake. Read the repo's own check command first, so a check that exists but is not wired in is the finding, not a new one. A repo with no check at all is itself a finding.
- **Coding standard:** a reviewer missed something it should have caught, or a rule is unclear or no longer needed. Fix: a new, clearer or removed review rule.
- **New skill:** the batch worked out a method that will come up again. Fix: a draft skill that keeps the method and drops the specifics, with no names, keys, hostnames or customer data.
- **Information access:** a fact the work needed was out of reach. Fix: give access, such as a log or a read-only view of a service.

A signal that fits none of the five is a process finding for donna or jessica, about how requests are taken, planned or logged. It is reported, not dropped.

## Sorting

Decide who fixes each finding by asking whether a program could catch it.

- **Mechanical:** a fixed pattern, a banned call, an import shape or a file location. It becomes a proposed check: a lint rule, hook or CI job, whichever is cheapest for the repo. A check is the default over a written rule.
- **Judgement call:** cross-file consistency, matching the surrounding style, anything no check could stand in for. It becomes a proposed review rule for louis.

A proposed rule for louis goes to the owner and harvey. It is never put into louis's own file by this skill, because he edits nothing he reviews. Nothing changes until the owner agrees.

## Output

A findings list, most serious first. Each finding quotes the log line or the round it comes from, with its source. A finding that cannot be traced to a line or a round is dropped.

Each finding gives: what happened, the category, whether it is mechanical or a judgement call, and the proposed check or rule. Write in plain professional prose, in English. Numbers and quoted lines stay as they are.

If the signals show nothing worth fixing, say so in the first line.

## Edits nothing

The retro edits no existing file, makes no commit and pushes nothing. It changes no steering file, standards file or skill. The one thing it writes is the findings list, as a new file in the notes directory, `notes/retro-<batch>.md`, outside the files under review. When the notes directory is missing, it is the one directory the tool may create.

It hands the list to donna to present. Donna's digest is verdict first, at most three changes, then the owner's decisions each with a pick. The retro does not write that digest itself.
