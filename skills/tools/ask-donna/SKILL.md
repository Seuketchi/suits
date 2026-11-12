---
name: ask-donna
description: Say who to ask and what to type for a situation the owner describes in plain words. Names the one character who owns it, the commands in order, what comes back, and the matching guide. Does no work and starts nothing. Use when the owner is not sure which character or command fits. Skip when the owner has already named one.
disable-model-invocation: true
---

**ask-donna** is donna's front-desk step as a command. The owner says what they are trying to do, and it says who to ask and what to type. It answers and stops: it drafts nothing, runs no tool and starts no session.

The owner types it, as `/suits:ask-donna <the situation>`. No character calls it. If the situation is too thin to route ("help with my project"), ask one question, then route. Never ask a second one.

## Answer

Verdict first, in this shape, and nothing more:

1. **Owner:** the one character, and why in a clause. Never two, as at donna's front desk: a bug goes to `rachel` first, for the trigger and the causes, before anyone looks for the line to change.
2. **Type:** the exact command, ready to paste, with the owner's own details in it. Work that moves on to another character after the first one hands back gets a second line, marked *after the first hands back*.
3. **You get:** what comes back, in a line.
4. **Guide:** the matching page in [docs/guides](../../../docs/guides/README.md), only when the owner fits one.

Name only skills that ship in this plugin, each as `/suits:<name>`. Before saying what a character returns or what a tool does, read its `SKILL.md`; the table below is for finding the right one, not for describing it.

## Who owns what

| The situation | Owner | Type |
| --- | --- | --- |
| A document, email, brief, minutes, a deck from a set structure, a pull request body, a short reply to a teammate | `donna` | `/suits:donna <the ask>` |
| An outside fact, sources for a claim, a literature question | `rachel` | `/suits:rachel <the question>` |
| Something broken, failing, wrong or slow | `rachel`, first | `/suits:rachel <what is wrong>`, then the fix goes to `associates` |
| What our own code does, why it is the way it is, what a change touches | `mike` | `/suits:mike <the question>` |
| Whether to build, the budget, a pitch or its structure, a negotiation, a scope or money call | `harvey` | `/suits:harvey <the decision>` |
| A plan, tickets, status, risks, a release's readiness | `jessica` | `/suits:jessica <the work>` |
| A diff or pull request to check, or a done test to write | `louis` | `/suits:louis <the change>` |
| A decided ticket to build, with its done test | `associates` | `/suits:associates <the ticket>` |
| A look back at a batch that has closed | none, a tool | `/suits:retro <the batch>` |

A small ask, such as a typo, goes straight to `associates`. A build with no decision yet goes to `harvey` first, and one with no done test goes to `louis`. An ask that is two jobs is the first job; the second is the *after* line.

## Guides

| The owner is | Guide |
| --- | --- |
| A researcher | [researcher](../../../docs/guides/researcher.md) |
| A startup founder | [startup-founder](../../../docs/guides/startup-founder.md) |
| A developer | [developer](../../../docs/guides/developer.md) |
| A project manager | [project-manager](../../../docs/guides/project-manager.md) |
| A freelancer or consultant | [freelancer-consultant](../../../docs/guides/freelancer-consultant.md) |
| A student writing a thesis | [thesis-student](../../../docs/guides/thesis-student.md) |

Link one when it fits. Otherwise link none.
