## What it does

`retro` looks back at a batch of work that has landed and asks what in your setup let its problems happen. It reads the action log and the decision log for the batch, then louis's rulings and rounds, and opens a session transcript only for an item those two flagged. It never sweeps transcripts.

It looks for four signals: items that bounced (logged loops and failed rounds), items over budget, decisions that were reversed, and log lines with no Budget or Next. The logs are free text, so a missing field is only ever a line with no Budget or Next, and the tool says so.

Each finding is classed as navigation, an automated check, a coding standard, a new skill or information access. A signal that fits none of these is reported as a process finding for donna or jessica. Mechanical findings become a proposed check, and judgement calls become a proposed review rule for louis. Each finding quotes the log line or round it comes from, and one that cannot be traced is dropped.

It edits nothing. It writes the findings list as a new file in the notes directory and hands it to donna to present.

## When to reach for it

After a batch of work has landed and you want to know what to change so the next one goes better. You start it, or whoever runs the batch for you does by typing the command. Louis offers it when a batch closes but does not run it. Skip it while the batch is still open, or when the logs hold nothing for the batch.

## Common questions

**Why can't louis run it?**
It is a skill only a person can start, and he would be grading his own rounds. A proposed rule for louis goes to you and harvey, never straight into his file.

**Does it change my checks or rules?**
No. It proposes. Nothing changes until you agree, and each change you accept is made separately.

**Why does it read the logs before the transcripts?**
The logs are small and already the record. Transcripts cost the most, and usage is capped, so they are read only for an item the logs flagged.

**Can it tell when a field is missing from a log line?**
Only roughly. The logs are free text, so it can only report a line that has no Budget or Next.

## It's working if

- It reads the logs first, then louis's rulings, and opens a transcript only for a flagged item.
- Every finding quotes the log line or round it comes from.
- Each finding is classed, and a signal that fits no class is reported as a process finding.
- Mechanical findings come as a proposed check, and judgement calls as a proposed review rule.
- The findings list is a new file in the notes directory, and no other file changes.
- You decide what to apply, each with a pick from donna's digest.
