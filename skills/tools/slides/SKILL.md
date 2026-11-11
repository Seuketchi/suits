---
name: slides
description: Build a slide deck as a PDF from a pitch or talk structure that is already set, one slide to a page, with speaker notes kept in the source. Use when the task is a deck or presentation. Skip when the task is a document, an email or the structure of the pitch itself.
---

# Slides

Build the deck. Do not decide what it says: the structure comes from `/suits:pitching` (the points the audience must keep, the order, the ask), or from the owner for a talk that is not a pitch. This tool turns that structure into slides that look like a person made them and pass the same checks as a finished PDF.

## Before the first slide

1. **Get the structure.** The points to keep, the order of the slides, the ask. With none, stop and ask for it; for a pitch it comes from harvey. Do not write a story the owner has not seen.
2. **Get the facts.** Every number, quote and name on a slide comes from the owner or from a source you can name. One you cannot confirm goes on the slide marked `unverified` (`<mark class="unverified">` around it in the source, a flat highlight on the slide) and in the hand-over, never as plain fact. Never invent traction, a market size or a quote to fill a slide.
3. **Look for a design.** The owner's example, then the project's tokens, fonts and logo, then the plain default in `slides.css`. A project's own design always wins: link its tokens before `slides.css` and the deck takes them.
4. **Copy `slides.css` and `deck.html` beside the new deck** and edit the copy. `deck.html` shows each kind of slide once: the title slide, a claim with its support, two columns, a demo, one large number, a labelled-rows slide for the ask, and a closing slide.

## One slide

- **One point a slide.** If a slide makes two, it is two slides.
- **The title states the claim** the slide proves ("Students lose two hours a week to queues"), never a label ("Problem", "Overview"). Someone reading only the titles should follow the argument.
- **Few words, large type.** The limit on words comes from the pitch structure. The slide holds what the audience must see; the rest is the speaker's, in the notes.
- **Important content at the top.** The bottom of a projected slide is hidden by heads.
- **A number is said with its timeframe and its source,** on the slide.
- **A picture has a numbered caption** and no frame, shadow or rounded corner. A demo slide names the steps to show on the live product; no video stands in for it.
- **Speaker notes** go in an `aside class="notes"` inside the slide, in the plain words the speaker would say. They stay in the source, they are read by the prose check, and the PDF leaves them out.

## Leave out the machine-made look

A deck made by a template tool is recognised in a second. Do not use: a small tracked-capitals kicker above a title; a hero-sized title anywhere but the title slide; a line of facts joined by dots; a coloured side bar on a box; rounded cards, pills or badges; drop shadows; gradients; emoji or icons as bullets; more than one accent colour; a stock photograph that shows nothing. The accent colour is for the title slide, the rule under a title, numbers and the slide number. This list is a summary; `check.sh` is the authority on what fails.

## Build and check

The source is `deck.html` and its stylesheet; the PDF is output and is never edited. It is a slide to a page: one `section class="slide"` prints as one page, landscape 16:9. Rebuild after every change and keep the previous version.

Build with `print.sh <deck.html> <deck.pdf>`. Keep a claims ledger, `claims.md`, beside the deck: one row for each number, quote and name on a slide that is not marked `unverified`, with the source it was checked against. Then run the same document checks as for any finished PDF: `check.sh <deck.html> <deck.pdf> --claims claims.md`. Both scripts are the ones donna's documents use, and the ledger's format is hers; they are called, not restated here. Fix each FAIL in the source and rebuild. Then look at every page as an image: text that runs off the slide, a title wrapped onto three lines, a picture too small to read from the back of a room, a slide that holds two points. The checks cannot see those.

## Hand over

Name the file and its page count, say which design was matched, list what is marked `unverified`, and note that the speaker notes are in the source. Offer the notes as a separate page if the speaker wants to print them. Nothing is uploaded or sent.
