# Suits for a student writing a thesis

Use rachel to find and check sources, donna to turn your notes into a finished document, and harvey to shape the defense. A citation is never given without a check that the paper exists.

## Who it is for

You are writing a thesis or a capstone, you have a deadline, and your adviser will ask where every claim comes from.

## The jobs

| Job | Who takes it | What you type | What you get back |
| --- | --- | --- | --- |
| Find sources for a claim or a literature gap | rachel, with `/suits:source-finder` | `/suits:rachel Find sources that show sleep loss lowers working memory in students.` | Papers confirmed to exist, each tied to the claim it supports, and the gaps left open |
| Check an outside fact | rachel, with `/suits:research` | `/suits:rachel What sample size does the standard instrument for this scale assume?` | A cited findings file; each claim tagged found, not found or inferred |
| Plan the writing | jessica, with `/suits:to-tickets` and `/suits:status-report` | `/suits:jessica Plan chapters 3 to 5 for a 15 January submission.` | Tickets with blockers, the longest chain, and a state-first status you can show your adviser |
| Prepare the defense | harvey, with `/suits:pitching`; donna builds the deck with `/suits:slides` | `/suits:harvey Structure a 15-minute defense for a panel from another department.` | A structure for that audience; then a PDF deck, one point a slide, notes in the source |

If your thesis has analysis code, ask mike what it does today: `/suits:mike What does the preprocessing script do with outliers?`

## What comes back

The first line is the answer. Every claim carries its source, and one with no source is marked inferred, with what would confirm it. Donna's drafts are drafts: you write your own thesis, and she lays out and checks the document.

## Worked example

Chapter 2 has a claim with no citation.

1. You type: `/suits:rachel Chapter 2 says "spaced retrieval improves retention in undergraduates". Find two or three sources and tell me if the claim is too strong.`
2. She says in one line that she is calling `/suits:source-finder`, because a claim needs academic sources.
3. Her reply opens with the answer, tagged: `Found: supported, but the effect sizes come from lab studies, not courses.` The papers follow, each confirmed, each with the sentence it supports.
4. You change the claim to match, and type `/suits:donna Put the reference list into a PDF in APA style.` She builds it and checks it page by page.
5. You read the papers before citing them. The list tells you where to look, not what to believe.

## Related

- [rachel](../characters/rachel.md), [jessica](../characters/jessica.md), [harvey](../characters/harvey.md), [donna](../characters/donna.md)
- [source-finder](../tools/source-finder.md), [research](../tools/research.md), [pitching](../tools/pitching.md), [slides](../tools/slides.md)
