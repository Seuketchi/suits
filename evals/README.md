# Evals

Four cases that check what a skill does, not what its text says. They are run by hand after changing a skill's behaviour. CI does not run them, and a score is not a gate: read the grader verdicts and judge.

| Case | What it checks |
| --- | --- |
| `louis-one-pass` | louis reviews in one pass, edits nothing and starts no other session. |
| `working-alone-handoff` | jessica, told she works alone, hands the tickets over in her message and writes nothing to the board. |
| `research-no-redelegation` | `/suits:research`, told to work alone, does the reading itself and writes its findings file. |
| `pr-triage-routes-to-donna` | a pull request triage ask goes to donna, who drafts the comments and posts nothing. |

Run them from the repo root:

```
claude plugin eval . --runs 1 --ablation none --no-publish --allow-tools Write WebFetch WebSearch
```

The research case needs `--allow-tools Write WebFetch WebSearch`: it reads Node's documentation and writes a findings file, and without the grant it can only report that it was blocked. Results are written under `evals/results/`, which is not committed.
