# Where suits departs from upstream, on purpose

Date: 2026-11-11

## Context

Suits ports skills from Matt Pocock's [mattpocock/skills](https://github.com/mattpocock/skills) by hand, in our own words, and follows his changes closely. Where we differ, it is because we saw a failure in our own sessions or chose a different shape on purpose. Without a list, the next port could revert one of those choices as if it were drift, or keep a real drift as if it were ours.

This ADR lists the five departures we keep, what Matt says against each one where he says anything, and the one question that is still open. Every statement about upstream comes from his repository or his changelogs.

## Decision

We keep these five departures. A hand-port does not change them.

### 1. Characters, with a voice

Suits has characters: each is a persona with one job, a **When to call** table and a **Voice** block (CLAUDE.md, ADR 0001). Upstream has no persona. Its skills are short and do not name a character.

We keep it because a team of specialists needs the owner to know who reviews, plans or edits, and each character spells out the tools it calls.

Matt's counter-argument: his skills stay short, and his v1.3 changelog says an instruction that changes nothing is a no-op ([v1.3 changelog](https://www.aihero.dev/skills/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)). Long persona text costs context, and we have not measured whether the Voice blocks change what a character does. `claude plugin eval` is the test for that.

### 2. Working alone

Suits characters start no other session when they work alone, or when helper mode is on. Louis, mike and rachel also have read-only versions, and a hook holds their `Bash` to reading (ADR 0003, 0007, 0009). `/suits:code-review` has a one-pass mode for the same case.

We keep it because Louis started two extra sessions for every diff in our own runs (ADR 0003).

Matt's counter-argument: guarding against a session that starts sessions belongs to the harness, not to skills. His [out-of-scope note on nested-session loops](https://github.com/mattpocock/skills/blob/main/.out-of-scope/subagent-recursion.md) says so. He also ranks a script that starts one fresh session per ticket above a loop the model runs itself, and calls the second "worse" ([v1.3 changelog](https://www.aihero.dev/skills/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)). His [scope rules](https://github.com/mattpocock/skills/blob/main/SCOPE.md) take a failure seen in a real session as the bar for a change. Our failure meets that bar, so the mode stays.

### 3. Project-rules hooks

A hook in this plugin reads each project's `.claude/suits-rules.json` and enforces its `never` and `warn` rules on every tool call (ADR 0005). Upstream keeps such guidance in the skill text.

We keep it because a rule a session must not break should be a check, not a sentence.

Matt's counter-argument: none found. His v1.3 changelog states the same principle: a prose rule that a machine could check should become a lint rule, a hook or a CI job. The departure is where the rules live, which is in each project's file and not in the skill.

### 4. The `suits:` prefix

Every reference to a skill in this repo is written `/suits:<name>` (ADR 0002). Upstream skills have bare names, such as `/grill-with-docs` in [his README](https://github.com/mattpocock/skills/blob/main/README.md).

We keep it because a bare name collides with other plugins and local skills. A character told to run a bare `tdd` could run the wrong one.

Matt's counter-argument: none recorded in the sources we read for this ADR. The cost is ours: longer names in every prompt and docs page, which the owner types too.

### 5. `CONTEXT.md`, or `GLOSSARY.md`: undecided

Suits ships `CONTEXT.md` at the root, and `domain-modeling` reads and writes it (`skills/tools/domain-modeling/SKILL.md`). Its docs page says the name has no settled answer (`docs/tools/domain-modeling.md`).

Matt renamed the file to `GLOSSARY.md` in v1.3, in October 2026 ([v1.3 changelog](https://www.aihero.dev/skills/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md)). His setup offers to move a legacy file with `git mv`, and on a team he says to do it in one commit that everyone pulls ([setup skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md)). His reason, as we read it, is that the old name did not get the file read at the right moments.

The case for `GLOSSARY.md` is that the name says it is a glossary and nothing more. The case for `CONTEXT.md` is in our own docs page: a `CONTEXT-MAP.md` that points at several `CONTEXT.md` files reads naturally, and "context" is the standard domain word for a bounded area of a model.

Status: undecided. Until the owner decides, the repo keeps `CONTEXT.md`, and a hand-port does not rename it. The cost of waiting is that someone who runs both sets of skills has two files. Renaming means patching every tool that reads the file, so the decision is not free either way.

## The rule for the next hand-port

1. Keep the five departures above as they are in suits. An upstream change that touches one is written in our form, and the port does not replace our form.
2. Port everything else, in our own words.
3. If an upstream change touches a departure in a way we might want to adopt, raise it with the owner before porting it.
4. Do not rename `CONTEXT.md` in a port. That waits for the decision in section 5, recorded in a later ADR.

## Consequences

- A hand-port checks its changes against this list instead of re-arguing the five departures.
- The `CONTEXT.md` question stays open, and the repo keeps its current name until a later ADR records a decision.
- Whether the Voice blocks change behaviour stays open until `claude plugin eval` has been run on the characters.
- Matt's positions are as of 2026-11-11. If upstream changes its position, this ADR's counter-arguments are updated; the departure changes only if the owner decides.
- The reason for the rename in section 5 comes from the upstream research for this ADR and is not yet checked word for word against his announcement. Check it before quoting it.
