## What this is

A private plugin of specialist skills. Characters live in `skills/characters/`, the tools they call in `skills/tools/`. Every skill is promoted: it is in `.claude-plugin/plugin.json`'s `skills`, listed in its bucket's `README.md` under **User-invoked** or **Model-invoked** (a tool is also listed in the root `README.md`; `test/characters/characters.test.mjs` fails otherwise), and has a docs page at `docs/<bucket>/<skill>.md` with four sections: **What it does**, **When to reach for it**, **Common questions**, **It's working if**.

Run `npm run check-skills` after adding, moving or renaming a skill. CI runs it on every pull request.

There are no releases or versions: the plugin has no `version`, so Claude Code versions it by commit. Do not add one.

## Rules for characters

- A character calls tools as `/skill`-style prose ("Run the `/tdd` skill"), never copies a tool's text and never links across skill folders. A tool's shared reference material lives inside the tool that owns it.
- Every character's `SKILL.md` has a **When to call** section: one trigger per tool, stated as a fact about the task. The default is not to call. A character says in one line which tool it is calling and why, and skips the others without comment.
- Every character's `SKILL.md` has a **Voice** section: a register, what it avoids, one sample line. The voice is a thin layer on word choice and never lengthens an answer: verdict first, short. It speaks only to the owner. Anything written for other people (documents, emails, pull requests, commits) is in the plain professional register. Numbers, `file:line` references and blockers stay plain.
- Name tools by Matt Pocock's names where he has one. Where an upstream has its own skill, use it and port its changes by hand, in our own words.
- Name no number of characters anywhere: not in a name, a tagline, a description or skill text ("the six", "a team of seven"). The team may grow. A count that is not a team size, such as "72 characters or fewer" or "up to three in parallel", is fine.

## Writing

- Never mention assistants, agents, cooks, kitchens, head chefs, stations, ticket boards or any workflow tool in commits, pull requests, or skill text meant for others. Tool names in code spans (`/test-kitchen`) are fine, and so are the legal terms in donna's `LEGAL.md` ("assistant secretary", an attorney-in-fact's "agent"). A skill that has to tell the model to start a sub-agent is listed with its reason in `WORKFLOW_WORD_ALLOWED` in `test/characters/characters.test.mjs`; do not add to that list without the owner's say.
- `npm run test:characters` checks both rules above on every `SKILL.md`, and that every character's **Voice** section gives a register, what it avoids, a sample line, and the plain professional register for anyone but the owner.
- Conventional commits. No attribution lines.
- Documents and emails a character writes carry no machine-made look: no tracked-caps kickers, hero titles, dot meta lines, side bars or tinted cards. English only.

## Decisions

Decisions that bind the repo are in `docs/adr/`.
