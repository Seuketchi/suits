---
name: test-kitchen
description: Settle a question by measuring it: run the build, call the API, drive the device, and record the data with its setup. Use when reading can't answer it: real latency, real API responses, behaviour on a real phone or board.
---

The **test kitchen** is where a recipe is tried before it goes on the menu. An experiment answers a question by running something and recording what happened, so someone else can run it again.

**Staging only.** Run against staging builds, test devices, test accounts and test data. Never production, never customer data, never real money. If the question can only be answered in production, stop and say so.

## Steps

1. **State the experiment** to the user before running anything: the question, what you'll run and against which build, device or environment, what you'll measure, and every side effect (writes, messages sent, money moved in test, device state changed). Done when the user says go.
2. **Pin the setup:** build or commit, device and OS version, environment, account, tool versions. An experiment you can't repeat is an anecdote.
3. **Run it,** repeated enough to tell signal from noise: three runs at least for anything timed. Capture raw output (logs, responses, screenshots, traces) into `docs/findings/<topic>/`, with secrets and personal data redacted.
4. **Undo what you changed** where you can: test records, device settings, toggles. Say what couldn't be undone.
5. **Write it up** with the `/suits:findings` skill, kind `experiment`. **Method** holds the setup and side effects; each claim cites the run and the raw output it came from.

Tools by target: the app on a phone, `adb` or the device driver your session has; an API, `curl` against staging with the request saved; a board or device, its serial console and the bench tools in reach; a build, the repo's own scripts. Physical steps only a person can do go to the user as a numbered checklist.
