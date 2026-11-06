# What donna copies: real documents, not web UI

The default look is drawn from documents that organisations actually send, not from landing pages or app screens. This page names them. Each was opened and its first page looked at as an image on 6 November 2026, unless marked *not seen*. A document that could not be opened is listed as such: nothing here is claimed from a search snippet.

The rule behind it, from the owner: a document must not look or sound generated. A small tracked-uppercase label over a big bold title over a grey line of facts joined by dots is a landing-page pattern. None of the real documents below has it.

## What the real ones do

| Kind | Real documents | What their first page does | What donna copies |
| --- | --- | --- | --- |
| Assignment or worksheet | [Physics Classroom](https://www.physicsclassroom.com/getattachment/curriculum/1Dkin/Acceleration/1DKin3v2020.pdf?lang=en-US), [Washoe County schools](https://resources.finalsite.net/images/v1744938770/washoeschoolsnet/oeknf6pbhzzdetvus7mm/velocity_and_acceleration_worksheet.pdf), [Mr Kremer](https://mrkremerscience.com/wp-content/uploads/2016/12/practice-problems-acceleration-1.pdf), [sheetworks](https://pdfs.cdn.sheetworks.ai/b431e37d/dissecting-vector-kinematics-10th-grade-physics-challenge-science-10-quiz-worksheet.pdf), [Cambridge IGCSE Physics 0625/04](https://www.cambridgeinternational.org/Images/595786-2023-specimen-paper-4.pdf), [MIT 8.01 problem set 1](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/96231b21bccffc0c17c7d98629a52eb2_MIT8_01F16_pset1_new.pdf) | `Name ____  Date ____  Period ____` is the first line. A small plain title, centred or left. One instruction sentence or a short list. Marks in brackets at the right. Blank room under each question. No colour. | `.strip`, `.fields.header-block`, `h1.center`, numbered `.problem` with `[4]` at the margin, `.space` |
| Memo | OMB memoranda ([M-26-19](https://www.whitehouse.gov/wp-content/uploads/2026/09/M-26-19-Amendment-to-OMB-Memorandum-M-16-13.pdf), [M-25-32](https://www.whitehouse.gov/wp-content/uploads/2025/08/M-25-32-Preventing-Improper-Payments-and-Protecting-Privacy-Through-Do-Not-Pay.pdf), [M-26-17](https://www.whitehouse.gov/wp-content/uploads/2026/08/M-26-17-Rescission-of-M-23-13.pdf)), [SEC Philippines MC 32](https://law.upd.edu.ph/wp-content/uploads/2021/02/SEC-Memorandum-Circular-No-32-Series-of-2020.pdf) | Letterhead, date, number. `TO`, `FROM`, `SUBJECT` rows. One rule. The point in the first paragraph. | `.strip`, "Memorandum", `.facts` rows, `body.plain` |
| Regulator letter or circular | [Federal Reserve SR 26-8](https://www.federalreserve.gov/supervisionreg/srletters/SR2608.pdf), [FDIC FIL-5-2015](https://www.fdic.gov/sites/default/files/2024-03/fil15005.pdf) | Issuer, number, date; bold subject; one boxed "Applicability:" sentence or a bold "Summary:" lead. | `.facts`, `.answer` (a bold label between thin rules) |
| Spec or datasheet | [TI LM358](https://www.ti.com/lit/ds/symlink/lm358.pdf), [Espressif ESP32](https://documentation.espressif.com/esp32_datasheet_en.pdf), [Raspberry Pi RP2040](https://pip-assets.raspberrypi.com/categories/814-rp2040/documents/RP-008371-DS-1-rp2040-datasheet.pdf), [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119), a [university SRS template on IEEE 830](https://vladventura.github.io/se1-webpage/assets/documents/SRS.pdf) | Numbered sections (`1`, `1.1`), thin-ruled tables with a grey header, a revision or status line. A cover is one big title and one subtitle line. | Numbered `h2`, tables, MUST / SHOULD / MAY stated once |
| Sign-off checklist | [King County](https://cdn.kingcounty.gov/-/media/king-county/depts/pao/documents/rfp-use-cases/kc001265/kc001265-exhibit-15-implementation-readiness-checklist.pdf), [Weber State](https://www.weber.edu/wsuimages/ITDivision/ppmo/ITProjects/Project%20Signoff.pdf), [NYC DORIS](https://www.nyc.gov/assets/records/pdf/Digitization_%20Pre-implementation_Checklist.pdf) | A purpose sentence, the list with plain boxes, a signature block with Name, Title, Date. | `.answer`, `.ask.tick` with a ballot box, `.signoff` |
| Report, guide, form | [NAO reports](https://www.nao.org.uk/wp-content/uploads/2026/10/HM-Revenue-Customs-management-of-tax-debt.pdf), [NS&I annual report](https://assets.publishing.service.gov.uk/media/68655a5d3b77477f9da072c6/NSI_Annual_Report_and_Accounts_2024_25_digital_final.pdf), [IRS Form W-9](https://www.irs.gov/pub/irs-pdf/fw9.pdf), [IRS Form 4506-T](https://www.irs.gov/pub/irs-pdf/f4506t.pdf), [IRS instructions for Form 2848](https://www.irs.gov/pub/irs-pdf/i2848.pdf) | A designed cover with one title; plain text pages; a form is boxed cells with a number each and a "Sign Here" box. | `.cover`, `.fields`, `.signoff` |

Not seen: Bangko Sentral ng Pilipinas memoranda (the site refuses automated downloads); a customer letter on a commercial bank's letterhead; a published decision record or options appraisal. The recipes for a formal letter and a decision record lean on the memo, regulator-letter and checklist documents above. The full list, with what each page looks like and the written guidance read (GOV.UK, RFC 7322, Butterick), is in the research notes; every claim there is marked verified or unconfirmed.

## What is dropped, and the check that holds it

| Pattern | Why it is out | `check.sh` rule |
| --- | --- | --- |
| Tracked-uppercase kicker or eyebrow; coloured accent labels | None of the real documents above has one | `tropes` |
| Hero-sized title (over 20pt) outside a cover | The real handouts' titles are body size to 14pt | `tropes` |
| Facts joined by middle dots under the title | The real ones use a name line, labelled rows or a sentence | `tropes` |
| Tinted card with a thick left bar | Plain rules separate; the Federal Reserve letter uses one thin-ruled rectangle | `side bars` |
| Rounded card, pill badge, drop shadow | Documents are not screens | `tropes` |
| Gradient anywhere but the cover band | Not in any real document above | `tropes` |
| Stock openers, "delve", "seamless", "robust", "leverage", em dash as a pause, exclamation marks, repeated three-word lists, a closing sentence that restates the section | Machine-written prose; GOV.UK's clear-language page asks for easy words, the active voice and no buzzwords | `prose` |

## Open question for the owner

The cover band is a diagonal gradient in the owner's own guide. The reports and datasheets above use flat colour. It stays because the guide has it; it is the one gradient `check.sh` allows. Say if it should become a flat accent.
