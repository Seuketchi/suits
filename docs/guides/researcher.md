# Suits for a researcher

Start with rachel for sources and outside facts, mike for what your own analysis code does, and donna for the write-up. Each answer comes back with its source, so you can check it.

## Who it is for

You work from papers, data and your own analysis scripts. You need claims you can cite, results you can trust and a report you can hand to a supervisor or a journal.

## The jobs

| Job | Who takes it | What you type | What you get back |
| --- | --- | --- | --- |
| Find sources for a claim or fill a gap in a literature section | rachel, with `/suits:source-finder` | `/suits:rachel Find peer-reviewed sources for the claim that spaced practice beats massed practice in adults.` | Papers confirmed to exist, each tied to the claim it supports, and the gaps she could not fill |
| Settle an outside fact from primary sources | rachel, with `/suits:research` | `/suits:rachel What does the dataset licence allow for redistribution?` | A cited findings file in `docs/findings/`, each claim tagged found, not found or inferred |
| Find out what your own pipeline does today | mike, with `/suits:stocktake` | `/suits:mike What does clean_survey.py do with missing answers?` | The behaviour, dated, with `file:line` for every claim |
| Write it up | donna | `/suits:donna Turn docs/findings/licence.md into a one-page memo for my supervisor.` | A PDF draft and its path; she does not send it |

A wrong number in the output is a bug, not a research question. Start it with rachel: `/suits:rachel The mean in table 2 changed after I re-ran the cleaning step.` She names the trigger and the causes before anyone edits a line.

## What comes back

The first line of every reply is the answer or the verdict. Sources, `file:line` references and the list of what was not checked follow it. A claim with no source is not stated as fact.

## Worked example

You are writing a methods section and need to know whether a reweighting step is standard.

1. You type: `/suits:rachel Is post-stratification weighting standard for online opt-in surveys? I need two or three citations.`
2. Rachel says in one line that she is calling `/suits:source-finder`, because the task needs academic sources.
3. Her reply opens with the answer, tagged. For example: `Found: yes, it is widely used, with two caveats on opt-in samples.`
4. Under it are the papers, each confirmed to exist, with the claim each one supports. A claim she could not source is marked inferred and says what would confirm it.
5. You type: `/suits:donna Draft the paragraph for section 3.2 from rachel's reply.` Donna writes it in plain prose and gives you the file path. You edit it and cite it yourself.

## Related

- [rachel](../characters/rachel.md), [mike](../characters/mike.md), [donna](../characters/donna.md)
- [source-finder](../tools/source-finder.md), [research](../tools/research.md), [stocktake](../tools/stocktake.md)
