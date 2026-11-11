# Evals

Five cases that check what a skill does, not what its text says. They are run by hand after changing a skill's behaviour. CI does not run them, and a score is not a gate: read the grader verdicts and judge.

| Case | What it checks |
| --- | --- |
| `louis-one-pass` | louis reviews in one pass, edits nothing and starts no other session. |
| `working-alone-handoff` | jessica, told she works alone, hands the tickets over in her message and writes nothing to the board. |
| `research-no-redelegation` | `/suits:research`, told to work alone, does the reading itself and writes its findings file. |
| `pr-triage-routes-to-donna` | a pull request triage ask goes to donna, who drafts the comments and posts nothing. |
| `helper-no-session` | a session with `SUITS_HELPER=1`, told to review in parallel, starts no other session and reviews in one pass. It needs `SUITS_HELPER=1` in the environment of the command that runs it. |

Run them from the repo root:

```
claude plugin eval . --runs 1 --ablation none --no-publish --allow-tools Write WebFetch WebSearch
```

The research case needs `--allow-tools Write WebFetch WebSearch`: it reads Node's documentation and writes a findings file, and without the grant it can only report that it was blocked. The helper case is run by itself, with the variable set in the shell that starts the eval, because a case's own `env` accepts only names that start with `EVAL_` and the mod reads only `SUITS_HELPER`:

```
SUITS_HELPER=1 claude plugin eval . --case helper-no-session --runs 1 --ablation none --no-publish
```

Without the variable that case tests nothing, so a run of all five cases scores it as a failure. Results are written under `evals/results/`, which is not committed.
