# Suits

**S**ome **U**nusually **I**ntelligent **T**eam **S**pecialists.

A team of Claude Code skills. Each character has its own job and voice and calls other skills as tools. The tools stay separate files and are never copied into a character, so improving a tool improves every character that uses it. A character calls a tool only when the task needs it.

## The team

| Character | Stands for | Job |
| --- | --- | --- |
| donna | **D**oesn't **O**verlook **N**or **N**eglect **A**nything | Front desk. Takes the ask, names one owner, writes everything up, reports back. |
| jessica | **J**ust **E**nsure **S**chedules **S**tay **I**n **C**heck **A**lways | Project manager. Plans, maps tickets, tracks risk and status, owns the board. |
| harvey | **H**aggles **A**nd **R**arely **V**acates **E**very **Y**ard | Senior judgement. Decides whether to build, validates findings, closes exceptions. |
| mike | **M**aybe **I** **K**now **E**verything | Our own system: what the code does and what was decided before. |
| rachel | **R**arely **A**ccepts **C**laims **H**unting **E**very **L**ead | Outside research, and the root-cause audit on a bug. |
| louis | **L**et **O**nly **U**nimpeachable **I**tems **S**hip | Strict review against the rules and the spec. |
| the associates | **A**lways **S**hipping **S**mall **O**bviously **C**orrect **I**ncrements **A**fter **T**esting **E**very **S**tep | The builders: test first, one file owner each. |

The team may grow.

## The tools

Each tool is its own skill, and each character calls it only when the task needs it. The one-line description of each is in [skills/tools](./skills/tools/README.md).

### User-invoked

- `retro`: started by the owner, offered by louis.

### Model-invoked

- `code-review`: called by louis.
- `codebase-design`: called by harvey.
- `critical-path`: called by jessica.
- `diagnosing-bugs`: called by associates.
- `domain-modeling`: called by mike.
- `findings`: called by mike, rachel.
- `go-live-check`: called by jessica.
- `grilling`: called by harvey.
- `handoff`: called by donna.
- `improve-codebase-architecture`: called by harvey.
- `money-check`: called by louis.
- `morning-brief`: called by donna.
- `negotiation-prep`: called by harvey.
- `pitching`: called by harvey.
- `pr`: called by donna.
- `prototype`: called by associates.
- `raid-log`: called by jessica.
- `recall`: called by mike.
- `research`: called by rachel.
- `reverse-engineer-anything`: called by harvey, mike.
- `root-cause-audit`: called by rachel.
- `scrum`: called by donna, jessica.
- `senior`: called by harvey.
- `slides`: called by donna.
- `source-finder`: called by rachel.
- `status-report`: called by jessica.
- `stocktake`: called by mike.
- `tdd`: called by associates.
- `test-kitchen`: called by mike.
- `to-spec`: called by jessica.
- `to-tickets`: called by jessica.

## Layout

- [skills/characters](./skills/characters/README.md): the characters.
- [skills/tools](./skills/tools/README.md): the tools they call.
- [docs](./docs): one page per skill, and the decisions in [docs/adr](./docs/adr).

## Checks

`npm run check-skills` checks the listing rules, the docs pages, the links and `claude plugin validate`. CI runs it on every pull request.

Rules for working here are in [CLAUDE.md](./CLAUDE.md). The words this repo uses are in [CONTEXT.md](./CONTEXT.md).
