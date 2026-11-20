---
name: judge
description: Ask Jev (TypeSafe's model) one small typed question and take its answer only when it is confident; otherwise decide as before. Questions: who owns a request, what kind a review comment is, whether a diff touches money or a trust boundary, whether work falls short of its done test, whether a finding is a red flag, and whether a proposed rule repeats one. Use when a character's When to call names one of these questions. Skip with no TypeSafe key: the character decides alone.
---

A **judge** answers one small question with a fixed set of answers. Jev gives an answer with a confidence, and the answer is **decided** only when it clears the question's **floor**. Below the floor, with no key, or when the code may not be sent, the character decides exactly as it would without a judge. Jev answers first, the character next, the owner last.

## The questions

| Question | Asked by | Answers | What a decided answer does |
| --- | --- | --- | --- |
| `owner` | donna, ask-donna | donna, rachel, mike, harvey, jessica, louis, associates, retro | names the owner. The front desk's own rules still apply on top: a bug goes to rachel first. |
| `comment-kind` | louis | defect, change-request, preference, question, acknowledgement | caps the severity: a `preference` or `acknowledgement` is never a BLOCKER or SHOULD FIX. It never raises one. |
| `touches-money` | louis | yes, no | a yes runs `/suits:money-check`. |
| `touches-trust-boundary` | louis | yes, no | a yes runs `/suits:security-review`. |
| `falls-short` | louis | yes, no | a yes holds the work: it passes only when louis overrules, naming the done-test lines he checked. |
| `red-flag` | rachel | yes, no | a yes makes the finding a red flag, told to the owner at once. |
| `rule-duplicate` | retro | yes, no | a yes drops the proposed rule and names the existing one that covers it. |

A judge only routes work, adds a check, holds work back or raises a finding to the owner. It never approves, merges, sends, skips a check or lowers a finding that cites a rule. A `no` to a yes-or-no question is never taken: the character reads the diff against its trigger as before. A choice answered `none-fits`, or one whose paired "does any option fit" is below 0.7, is not decided.

## Ask

Write the state to a JSON file of named fields, the facts in plain words, then ask every question the moment raises in one request:

```bash
node <this-skill>/scripts/judge.mjs ask owner state.json
node <this-skill>/scripts/judge.mjs ask touches-money,touches-trust-boundary state.json
```

To ask one question of many things at once (every comment in a review round, every existing rule a new one might repeat), put them in `items` and use `ask-each`:

```bash
node <this-skill>/scripts/judge.mjs ask-each comment-kind state.json
```

Each prints a list with one result per question or item: `{ id, question, answer, probabilities, confidence, floor, decided, error? }`.

- **`decided: true`:** act on `answer` and say in one line that the judge decided it.
- **`decided: false`:** decide yourself. `answer` is a hint at most, and `error` says why there was none.

`node <this-skill>/scripts/judge.mjs questions` lists the questions, their floors, and which send code.

## State

- `owner`: `{ "request": "<the owner's words>" }`. Leave out client names, figures and personal data; the kind of work is enough.
- `comment-kind`: `{ "repo": "<path>", "items": [{ "comment": "...", "hunk": "..." }] }`.
- `touches-money`, `touches-trust-boundary`: `{ "repo": "<path>", "diff": "<the diff>", "spec": "<optional>" }`.
- `falls-short`: `{ "repo": "<path>", "done_test": "<its lines>", "diff": "<from git>" }`. The diff comes from `git`, never the builder's account of the work, and the builder's message is not sent.
- `red-flag`: `{ "repo": "<path>", "finding": "<the finding in plain words>" }`.
- `rule-duplicate`: `{ "repo": "<path>", "new_rule": "<the proposed rule>", "items": ["<each existing rule>"] }`, asked with `ask-each`.

The script removes secrets it recognises and cuts long fields (diffs, files) to a fixed length.

## What may be sent

The state goes to TypeSafe's API. A question that sends code or anything else from a repository (every question but `owner`) is refused unless `repo` is a repository whose GitHub owner is listed in `~/.config/suits-judge/allow.json` (`{"owners": ["..."]}`). Never add an employer's or a client's account to it: their code goes to no service they have not approved. A refused question is not decided, and the character goes on as before.

The key comes from `$TYPESAFE_API_KEY`, or the file named by `$TYPESAFE_API_KEY_FILE`.

## Record

Once the final decision is made (yours, the owner's, or the judge's left standing), log it against the judgment's `id`:

```bash
node <this-skill>/scripts/judge.mjs record <id> <final answer>
```

Record every judgment you acted on, decided or not, with the answer you actually went with: a yes-or-no question records `yes` or `no`. The record is how floors are tuned. `report` shows agreement per confidence band, how often a decided answer was overridden, and the lowest floor that keeps 95% agreement; `report --save` writes those floors, never below the written ones.
