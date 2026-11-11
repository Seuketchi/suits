# Head to head

The same tasks, run with each plugin loaded alone and with none, scored by outcome graders that do not
know which plugin ran. Not part of `npm test` and not a gate: read the verdicts, then judge.

- `tasks.json`: seven tasks (review with a planted bug, security diff, root cause from evidence, bug in a
  repo, vague feature, research with a source, ticket breakdown) and each task's rubric.
- `fixtures/cache-bug/`: the small repo for the in-repo bug task. Its test fails on purpose.
- `arms.json`: the arms. `ARMS_DIR` is replaced by the `H2H_ARMS_DIR` environment variable, a folder that holds one
  checkout per plugin.
- `run.mjs`: `run` executes the cells (`claude -p` in a fresh temp folder, `--plugin-dir` for the arm,
  `--setting-sources project`, a per-run `--max-budget-usd`), `report` prints the task-by-arm table.

```
H2H_ARMS_DIR=/path/to/checkouts node evals/head-to-head/run.mjs run --runs 3 --max-budget-usd 1.5
node evals/head-to-head/run.mjs report
```

Rubric item kinds: `judge` (a plugin-free model call that sees the task, the final answer and the tool
names, never the arm), `no_edit` (no Edit, Write or NotebookEdit call, no writing shell command, folder
unchanged), `tree_unchanged`, `regex` on the final answer, `tool_used`. A task's score is the share of its
items that pass. Each run's file also records the skills and plugins the session loaded, so a run that
picked up something it should not have can be found and dropped.
