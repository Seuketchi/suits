---
name: recall
description: Search your past Claude Code sessions for how something was done or decided.
disable-model-invocation: true
argument-hint: "What to look for, e.g. 'dio interceptor' or 'why we dropped redux'"
---

Find the past session where something was done, decided or explained, and answer from it. The index covers what the user and Claude **said** in every session on this machine, never tool input or output, and lives at `~/.claude/recall/index.db`. `recall.py` sits next to this file.

## Steps

1. **Search.** Run `python3 <this skill's directory>/recall.py search <words> --limit 8`, adding `--project <name>` when the user named a repo. Each hit is one session: date, project, title, session id, and a snippet with the match in `[brackets]`. If nothing matches, try synonyms or fewer words before saying so. Done when you have hits, or three searches found none.
2. **Pick.** Show the user the hits as a short list, newest first among close matches, and say which one looks right and why. If one clearly fits, go on without asking. Done when one session is chosen.
3. **Read.** Run `python3 <this skill's directory>/recall.py show <session_id> --grep <word> --context 2` to read around the matches. Read more of the session only if that doesn't answer it. Done when you can answer the question.
4. **Answer** in a few lines, saying where it came from: "On 2026-10-13 in `skills` ('Class and learning over time') we decided …". Offer the session id so the user can `claude --resume` it.

## If the index is missing or stale

The SessionEnd hook keeps the index current. If `search` finds nothing at all, or the user says a recent session is missing, run `python3 <this skill's directory>/recall.py reindex` (about half a minute for a few hundred sessions; unchanged transcripts are skipped).

The hook, in the user's `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionEnd": [
      { "hooks": [ { "type": "command", "async": true,
          "command": "python3 /path/to/skills/in-progress/recall/recall.py hook" } ] }
    ]
  }
}
```

## Private by default

Transcripts can hold keys, customer data and other people's names. Quote only what answers the question, and never copy a secret or a customer's details out of a session into a file, a commit or a message.
