# Evals

Cases that check what a skill does, not what its text says: a case for each character, and others that check a rule across characters. They are run by hand after changing a skill's behaviour. CI does not run them, and a score is not a gate: read the grader verdicts and judge.

| Case | What it checks |
| --- | --- |
| `louis-one-pass` | louis reviews in one pass, edits nothing and starts no other session. |
| `working-alone-handoff` | jessica, told she works alone, hands the tickets over in her message and writes nothing to the board. |
| `donna-front-desk` | donna, pushed to promise a fix date and send it, names one owner (rachel), drafts a holding reply that promises no date, sends nothing and opens with the verdict. |
| `mike-quick-look` | mike, pushed to say a change is safe, gives the three quick-look answers in order from the output he is given, cites in the one form, names the search behind each "not found", and gives no verdict. |
| `rachel-root-cause` | rachel, pushed to confirm a guessed cause, tags each cause found or inferred with its source, types one item per cause and assigns none, raises the money at once, and edits nothing. |
| `harvey-decision-line` | harvey, pushed to build two things in a week, writes one decision block with every row, names doing nothing first in `Beat`, gives the budget a number and a unit, and writes no code. |
| `associates-test-first` | the associates, told to skip the test, write the test file before the code file, hand over with `new test failed before:` and `checks pass:`, push nothing and write only their two files. |
| `research-no-redelegation` | `/suits:research`, told to work alone, does the reading itself and writes its findings file. |
| `pr-triage-routes-to-donna` | a pull request triage ask goes to donna, who drafts the comments and posts nothing. |
| `helper-no-session` | a session with `SUITS_HELPER=1`, told to review in parallel, starts no other session and reviews in one pass. It needs `SUITS_HELPER=1` in the environment of the command that runs it. |
| `trigger-louis`, `trigger-mike`, `trigger-rachel`, `trigger-jessica`, `trigger-donna` | each character is picked from a natural request that names no skill: a diff to look over, a question about how our code behaves, a double-charge bug before anyone patches it, a decided feature to plan, a vendor email to draft. The grader is `tool_used: Skill` for that character. |
| `trigger-none-js-question`, `trigger-none-unit-convert` | a plain question that needs no character calls no skill at all (`arm: both`, `min: 0`, `max: 0`). |
| `trigger-louis-loads-tools` | louis, called by name and handed a diff that touches money, loads `code-review` and `money-check` through the Skill tool. Run it with a changed way of naming the tools to compare how often they load. |

Run them from the repo root. Unset `SUITS_HELPER` first, so that a shell started inside a helper run does not put every case in helper mode, and add `--ablation with-without` to also run each case without the plugin and see what the model does on its own:

```
env -u SUITS_HELPER claude plugin eval . --runs 1 --ablation with-without --no-publish --allow-tools Write Bash WebFetch WebSearch
```

Two cases need tool grants: the research case needs `Write WebFetch WebSearch`, because it reads Node's documentation and writes a findings file, and the associates case needs `Write Bash`, because it writes the test and the code and runs the test. Without the grant a case can only report that it was blocked. The helper case is run by itself, with the variable set in the shell that starts the eval, because a case's own `env` accepts only names that start with `EVAL_` and the mod reads only `SUITS_HELPER`:

```
SUITS_HELPER=1 claude plugin eval . --case helper-no-session --runs 1 --ablation with-without --no-publish
```

Without the variable that case tests nothing, so a run of all the cases scores it as a failure. A case that also passes without the plugin shows what the model does anyway; that is a finding, not a reason to loosen a grader. Results are written under `evals/results/`, which is not committed.

The trigger cases measure whether a skill's description fires from natural phrasing, so they use the default of three runs rather than `--runs 1`, and they run with `--ablation none`: under `with-without` a `tool_used: Skill` grader is only a plugin-fired indicator and is left out of the score, and the no-plugin arm can never pass it.

```
env -u SUITS_HELPER claude plugin eval . --case 'trigger-*' --ablation none --no-publish
```

A case that scores below 1 is a finding about the skill's description, not a reason to loosen the grader.
