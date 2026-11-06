## What it does

`slides` builds a deck from a structure that is already set. The slides print one to a page, landscape 16:9, from an HTML source and a stylesheet, with a title slide, claim slides, two columns, a demo slide, one large number, a request slide and a closing slide. Speaker notes stay in the source. The deck goes through the same layout, contrast, look and prose checks as a finished PDF, so a kicker, a card, a gradient or a stock opener fails the same way it does in a document.

## When to reach for it

When the task is a deck or a presentation. Donna calls it after harvey has set the structure with `/pitching`. It does not decide what a pitch says, write a document, or draft an email.

## Common questions

**Who sets the order of the slides?**
Harvey, through `/pitching`, for a pitch. For a talk that is not a pitch, the owner. The tool builds from that order and does not change it.

**Where are the speaker notes?**
In the source, inside each slide, so they are read by the prose check and left out of the PDF. Ask for them as a separate page if you want to print them.

**Why no icons, cards or gradients?**
They are what a deck made by a template looks like. The tool leaves them out and the checks fail the ones they can measure.

**What if a number has no source?**
It goes on the slide marked as unverified and is listed in the hand-over. It is not left to read as fact.

## It's working if

- The deck prints to one page for each slide, in landscape 16:9.
- Each slide has one point, and its title states the claim.
- The document checks pass on the deck, and every page has been looked at.
- Speaker notes are in the source and absent from the PDF.
- Every number on a slide has a source, or is marked unverified.
