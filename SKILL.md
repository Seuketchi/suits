---
name: debug
description: Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.
---

# Diagnosing Bugs

A discipline for hard bugs. Skip a phase only with an explicit justification.

When exploring the codebase, read `CONTEXT.md` (if it exists) for a mental model of the relevant modules, and check ADRs in the area you're touching.

## Redact

You will show commands, outputs, and captured artifacts. **Redact every secret first**: write `<REDACTED>` in its place.

- Build loops against env vars, so credentials stay in the environment, not in what you show.
- Captured artifacts carry auth headers: quote only the lines that carry the signal.
- If the redacted output is not enough to diagnose the bug, say so and ask the user.

## Phase 1: Build a feedback loop

**This is the skill.** With a **tight** pass/fail signal that goes red on _this_ bug, you will find the cause: bisection, hypothesis-testing, and instrumentation all just consume it. Without one, reading code will not save you.

Spend disproportionate effort here. **Be aggressive. Be creative. Refuse to give up.**

### Ways to construct one, in roughly this order

1. **Failing test** at whatever seam reaches the bug: unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) that drives the UI and asserts on DOM/console/network.
5. **Replay a captured trace.** Save a real network request / payload / event log to disk; replay it through the code path in isolation.
6. **Throwaway harness.** A minimal subset of the system (one service, mocked deps) that exercises the bug code path with a single function call.
7. **Property / fuzz loop.** For "sometimes wrong output", run 1000 random inputs and look for the failure mode.
8. **Bisection harness.** If the bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" so you can `git bisect run` it.
9. **Differential loop.** Run the same input through old vs new version (or two configs) and diff the outputs.
10. **HITL bash script.** Last resort. If a human must click, drive _them_ with `scripts/hitl-loop.template.sh`, so the loop stays structured and the captured output feeds back to you.

### Tighten the loop

Once you have _a_ loop, **tighten** it:

- **Faster**: cache setup, skip unrelated init, narrow the test scope.
- **Sharper**: assert on the specific symptom, not "didn't crash".
- **More deterministic**: pin time, seed RNG, isolate the filesystem, freeze the network.

A 30-second flaky loop is barely better than none. A 2-second deterministic one is tight.

### Non-deterministic bugs

Aim for a **higher reproduction rate**, not a clean repro. Loop the trigger 100×, parallelise, add stress, narrow timing windows, inject sleeps. A 50% flake is debuggable; 1% is not. Keep raising the rate until it is debuggable.

### When you cannot build a loop

Stop and say so. List what you tried. Ask the user for one of:

- (a) access to an environment that reproduces it,
- (b) a redacted captured artifact (HAR file, log dump, core dump, screen recording with timestamps), or
- (c) permission to add temporary production instrumentation.

Form no hypothesis without a loop.

### Completion criterion: a tight loop that goes red

Phase 1 is done when you can name **one command** (a script path, a test invocation, a curl) that you have **already run at least once**, with the invocation and its redacted output shown, and that is:

- [ ] **Red-capable**: it drives the actual bug code path and asserts the **user's exact symptom**, so it goes red on this bug and green once fixed. "Runs without erroring" does not count; it must _catch this specific bug_.
- [ ] **Deterministic**: same verdict every run (flaky bugs: a pinned, high reproduction rate, as above).
- [ ] **Fast**: seconds, not minutes.
- [ ] **Agent-runnable**: runs unattended; a human in the loop only via `scripts/hitl-loop.template.sh`.

If you catch yourself reading code to build a theory before this command exists, **stop: jumping straight to a hypothesis is the failure this skill prevents.** No red-capable command, no Phase 2.

## Phase 2: Reproduce + minimise

Run the loop and watch it go red as the bug appears. Confirm:

- [ ] The loop produces the failure the **user** described, not a nearby different one. Wrong bug = wrong fix.
- [ ] The failure reproduces across multiple runs (non-deterministic bugs: at a rate high enough to debug against).
- [ ] You have captured the exact symptom (error message, wrong output, slow timing), so later phases can verify the fix addresses it.

### Minimise

Shrink the repro to the **smallest scenario that still goes red**. Cut inputs, callers, config, data, and steps **one at a time**, re-running the loop after each cut. A minimal repro leaves fewer suspects for Phase 3 and becomes the regression test in Phase 5.

Done when **every remaining element is load-bearing**: removing any one of them turns the loop green.

Proceed only once you have reproduced **and** minimised.

## Phase 3: Hypothesise

Generate **3–5 ranked hypotheses** before testing any. A single hypothesis anchors on the first plausible idea.

Each hypothesis must be **falsifiable**, stating the prediction it makes:

> Format: "If <X> is the cause, then <changing Y> will make the bug disappear / <changing Z> will make it worse."

A hypothesis with no statable prediction is a vibe: sharpen it or discard it.

**Show the ranked list to the user before testing.** They may re-rank it instantly from domain knowledge ("we just deployed a change to #3") or know which ones are already ruled out. Don't block on it: if the user is AFK, proceed with your ranking.

## Phase 4: Instrument

Map each probe to a specific prediction from Phase 3. **Change one variable at a time.**

Tool preference:

1. **Debugger / REPL inspection** if the env supports it. One breakpoint beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

**Tag every debug log** with a unique prefix, e.g. `[DEBUG-a4f2]`, so cleanup is a single grep.

**Perf branch.** For performance regressions, skip logs. Establish a baseline measurement (timing harness, `performance.now()`, profiler, query plan), then bisect. Measure first, fix second.

## Phase 5: Fix + regression test

Write the regression test **before the fix**, but only at a **correct seam**: one where the test exercises the **real bug pattern** as it occurs at the call site. A seam that is too shallow (a single-caller test when the bug needs multiple callers, a unit test that can't replicate the triggering chain) gives false confidence.

**If no correct seam exists, that is the finding.** Note it: the architecture is preventing the bug from being locked down. Flag it for the next phase.

If a correct seam exists:

1. Turn the minimised repro into a failing test at that seam.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run the Phase 1 feedback loop against the original (un-minimised) scenario.

## Phase 6: Cleanup

Done only when all hold:

- [ ] Original repro no longer reproduces (re-run the Phase 1 loop)
- [ ] Regression test passes (or the absence of a seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed (`grep` the prefix)
- [ ] Throwaway prototypes deleted (or moved to a clearly marked debug location)
- [ ] The hypothesis that proved correct is stated in the commit / PR message, so the next debugger learns
