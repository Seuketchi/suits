# Follow-up tickler

What the owner is waiting on, and what the owner has promised, each with a date to resurface. Each time donna is asked about the day, or opens the owner's files, she lists what is due, overdue or stale, and drafts the nudge. Nothing falls off because nobody asked.

**Needs:** a plain file, `donna/tickler.md`, in the owner's repo or notes (or where the owner says), and the action log ([MINUTES.md](MINUTES.md)). Look for an existing one and extend it.

## The file

| Item | Kind | With | Asked on | Resurface on | Status |
| --- | --- | --- | --- | --- | --- |
| Signed UAT results | waiting on | Example Bank, Digital Channels | 6 November 2026 | 18 November 2026 | open |
| Vendor shortlist review | waiting on | the owner | 6 November 2026 | 20 November 2026 | parked |

- **Kind** is `waiting on` (somebody owes the owner), `promised` (the owner owes somebody), or `remind me`.
- **Status** is `open`, `parked` (see below) or closed.
- **Resurface on** is a calendar date. An item with no date is asked for one: "by when?"
- The dated actions in the action log are the tickler's too: read them, never copy them in. One action, one place.
- A closed item gets a dated note, not a deletion.

## Parked work

When the owner says they are busy or still handling something, and work must wait, donna logs it as parked on the owner: one entry here, Kind `waiting on`, **With** the owner, Status `parked`, and a `parked` status on its row in the action log ([MINUTES.md](MINUTES.md)). It needs a resurface date. With none given, she asks "until when?" and does not guess one.

- **Before its resurface date** nothing starts and no nudge is drafted. Parked work is neither overdue nor stale, and it is not counted late or aged.
- **Donna raises it on the resurface date,** verdict first, and asks whether to start, move the date or drop it. She raises it earlier only when the owner asks.
- The owner moving the date or releasing the work is a dated note on the row. Released by the owner: the tickler row's Status goes back to `open` and the action-log row's Status goes back to `open`, or on to `dropped`. `jessica` shows parked work as Blocked on the owner.

## Each session

1. **Overdue** (resurface date passed, parked rows excepted until their date): list first, oldest first, with the days late.
2. **Due today or this week.**
3. **Stale**: open more than 14 days with no note since. A parked row is never stale before its date. Ask whether it still matters.
4. For each overdue or stale `waiting on`, **draft the nudge** as an email ([EMAIL.md](../email/EMAIL.md), the follow-up pattern): the one thing needed and a new date. The owner sends it.

Say it in one line per item, verdict first ("Three overdue: UAT results (2 days), release notes (5), approver's name (5)"). 14 days is a default, not a rule.

## Rules

- **Donna never starts parked work** and never nags about it before its date.
- **Never send a nudge, never accept or decline anything.** A reply that commits the owner is a draft the owner approves; with no answer yet, the draft is a holding reply.
- Never write an item the owner did not give or a file did not show. Mark an unchecked date as unchecked.
- Dated actions that belong to a plan or risk come from `jessica` through the action log; the tickler carries them, it does not own them.

## Standard

The chartered governance institute's factsheet names "monitoring action points" and "ensuring actions are understood and completed" as the secretary's loop (VERIFIED, primary). The tickler as a dated file that surfaces items on the day is general office practice and no source was found: UNCONFIRMED. The 14-day stale mark is a default.
