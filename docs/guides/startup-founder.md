# Suits for a startup founder

Ask harvey whether to build, jessica to plan it, louis to check the money, and donna to write it up. Harvey's answer comes first, so you spend the budget only after the call is made.

## Who it is for

You decide what gets built, what it costs and what you tell investors. You have little time and no one to argue with.

## The jobs

| Job | Who takes it | What you type | What you get back |
| --- | --- | --- | --- |
| Decide whether to build a feature, and at what size | harvey, with `/suits:senior` and `/suits:grilling` | `/suits:harvey Should we build in-app invoicing this quarter? Budget is three weeks.` | A decision line (build, build smaller, not now or no), the one reason, and what is still yours to decide |
| Turn a decided feature into a plan | jessica, with `/suits:to-spec` and `/suits:to-tickets` | `/suits:jessica Plan the invoicing feature from harvey's call.` | A spec drafted in chat, then tickets with blockers and owned files, shown for approval before anything is published |
| Prepare a pitch or a deal | harvey, with `/suits:pitching` or `/suits:negotiation-prep`; donna builds the deck with `/suits:slides` | `/suits:harvey Structure a seed pitch for two investors who know payments.` | A pitch structure for that audience, or a negotiation as five rows; then a PDF deck from donna |
| Check amounts before release | louis, with `/suits:money-check` | `/suits:louis Check this diff for fees and rounding.` | A verdict, then each of ten money items answered with a `file:line` |

## What comes back

Harvey's reply begins with the call. Jessica's begins with the state of the plan and whether a decision is needed from you. Louis's begins with `passes` or a count of blockers. None of them sends, signs or publishes for you.

## Worked example

You are unsure whether a referral programme is worth building.

1. You type: `/suits:harvey Should we build a referral programme? We have four weeks and one developer.`
2. Harvey says in one line that he is calling `/suits:grilling`, because the ask leaves decisions open the code cannot answer. He asks the open decisions in numbered rounds, each with his recommended answer, and stops when none is left.
3. He ends with the call: `Build smaller: a referral link and a credit, no dashboard.` He gives the one reason and the budget as a number with a unit.
4. You type: `/suits:jessica Plan it.` She drafts the spec in chat and lists the tickets with their blockers. She publishes nothing until you say so.
5. You type: `/suits:louis Check the credit logic before we ship.` He answers the money items against the diff and returns a verdict first.

## Related

- [harvey](../characters/harvey.md), [jessica](../characters/jessica.md), [louis](../characters/louis.md), [donna](../characters/donna.md)
- [pitching](../tools/pitching.md), [negotiation-prep](../tools/negotiation-prep.md), [money-check](../tools/money-check.md)
