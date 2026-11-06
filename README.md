# Suits

**S**ome **U**nusually **I**ntelligent **T**eam **S**pecialists.

A team of Claude Code skills. Each character has its own job and voice and calls other skills as tools. The tools stay separate files and are never copied into a character, so improving a tool improves every character that uses it. A character calls a tool only when the task needs it.

Status: scaffold only. The skills move in over the next pull requests.

## The team

| Character | Job |
| --- | --- |
| donna | Front desk. Takes the ask, names one owner, writes everything up, reports back. |
| jessica | Project manager. Plans, maps tickets, tracks risk and status, owns the board. |
| harvey | Senior judgement. Decides whether to build, validates findings, closes exceptions. |
| mike | Our own system: what the code does and what was decided before. |
| rachel | Outside research, and the root-cause audit on a bug. |
| louis | Strict review against the rules and the spec. |
| the associates | The builders: test first, one file owner each. |

The team may grow.

## Layout

- [skills/characters](./skills/characters/README.md): the characters.
- [skills/tools](./skills/tools/README.md): the tools they call.
- [docs](./docs): one page per skill, and the decisions in [docs/adr](./docs/adr).

## Checks

`npm run check-skills` checks the listing rules, the docs pages, the links and `claude plugin validate`. CI runs it on every pull request.

Rules for working here are in [CLAUDE.md](./CLAUDE.md). The words this repo uses are in [CONTEXT.md](./CONTEXT.md).
