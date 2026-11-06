# What jessica copies: real status reports, risk logs and launch lists

Read on 6 November 2026 by fetching each page and reading the text (curl, text extraction). VERIFIED = read on that page in this session. UNCONFIRMED = search snippet only, or a guess. I saw text only, not page images. Raw copies are in the session scratchpad, not in the repo.

## What the real ones do

| Kind | Artifact | What it does | What jessica should copy |
| --- | --- | --- | --- |
| Status template | [West Norfolk major projects highlight report](https://democracy.west-norfolk.gov.uk/documents/s58725/Draft%20Project%20Highlight%20Report%20template%20for%20MMPB%20BLANK_v6.1.pdf) | Top band: overall status "This Report" next to "Last Report", then "Key (decisions) required this period", then reasons, risks, issues, financials, milestones. Its key sets RAG for milestones by weeks late. VERIFIED | State this report vs last report; decisions before detail; state set by a number of days, not by feel |
| Status template | [West of England CA scheme highlight report](https://www.westofengland-ca.gov.uk/wp-content/uploads/2019/04/HR-IF-FEAS-Template-v4.pdf) | Milestone table Baseline / Last Reported / Current; "Top 3 Current Project Risks"; any milestone change from last report must be explained (section 6). VERIFIED | Three dates per milestone; cap the risk list at 3; every moved date carries a reason |
| Status data | [GMPP March 2024 (Cabinet Office rows), CSV](https://assets.publishing.service.gov.uk/media/6787da941124a2c3ceb6469b/CO_Government_Major_Projects_Portofolio_AR_Data_March_2024.csv) | Per project: rating "at a fixed point in time", approved start and end dates, schedule narrative "including any deviation from planned schedule", budget narrative only "if variance is more than 5%". VERIFIED (11 rows) | As-of point; narrative required only when a number crosses a threshold |
| Rating guide | [IPA Delivery Confidence guide for review teams](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/638436/delivery_confidence_guide_for_review_teams.pdf) | Time rating: on or ahead / behind "but has realistic plans to recover" / likely late, "likely to require re-baselining". Recommendations are Do Now or Do By and "linked to project milestones or a specific date". VERIFIED | Three states each defined by what the plan can do; every action has a date |
| RAID | [Ofgem/ELEXON MHHS RAID log, Attachment C](https://www.ofgem.gov.uk/system/files/docs/2019/02/dwg_mhhs_tomv1.1_attachment_c_raid.pdf) | Numbered rows R01, A01, I01, D01. Risks: "Mitigation in place". Assumptions: "How/when to validate". Issues: "How to progress". Closed rows stay, with a pointer ("Closed: See Assumption A10"). No owner or date column. VERIFIED | Row ids; a different last column per kind; keep closed rows. Add the owner and date this log lacks |
| RAID | [Atlassian RAID log](https://www.atlassian.com/agile/project-management/raid-log) | Example table: Category, Description, Owner, Due date, Status; assumptions get an owner "to verify". VERIFIED | Minimum columns |
| RAID audit | [Croydon internal audit of a programme](https://www.croydon.gov.uk/sites/default/files/2025-10/final-report-project-management-oracle-improvement-programme-2025-26.pdf) | Found four risks missing owner or status, still blank a week later, and actions and decisions logs "last updated in March 2025" at a June audit. VERIFIED | The two failures to test for: blank fields, and a stale log |
| CPM, primary | [Kelley and Walker 1959, scan on mosaicprojects.com.au](https://mosaicprojects.com.au/PDF/PM-History_Critical_Path_Planning_&_Scheduling_Kelley_and_Walker_1959.pdf) | Defines critical: "If the maximum time available for a job equals its duration the job is called critical." Computes earliest and latest times. VERIFIED (a copy of the paper, not the ACM page) | Float = latest minus earliest; zero float = critical |
| CPM handbook | [NASA Schedule Management Handbook (2024 update)](https://www.nasa.gov/wp-content/uploads/2024/09/schedule-management-handbook-20240315-update.pdf) | CPM finds "the longest path through a network of tasks"; prefers finish-to-start links; counts "dangling" activities with no predecessor or successor as a schedule defect. VERIFIED (found by keyword, not read end to end) | Blocker edges are finish-to-start; flag tickets with no edges; report the longest path |
| CPM handbook | [GAO-16-89G schedule assessment guide](https://s3vi.ndc.nasa.gov/ssri-kb/static/resources/674404.pdf) | "Near-critical" activities have float close to the critical path and must be watched; "Unreasonably high total float... indicates that schedule logic might be missing". VERIFIED (NASA-hosted copy) | Show near-critical tickets; treat huge float as a missing blocker |
| Flow metrics | [Kanban Guide](https://kanbanguides.org/english/) | "Work Item Age: The elapsed time between when a work item started and the current date." SLE is a probability plus a time, from historical cycle time. VERIFIED | Define aged (below) |
| Scope / progress | [Shape Up ch. 13 Show Progress](https://basecamp.com/shapeup/3.4-chapter-13) and [ch. 14 Decide When to Stop](https://basecamp.com/shapeup/3.5-chapter-14) | Counting tasks misleads ("the tasks that aren't there"); hill = unknown vs solved; "A dot that doesn't move is effectively a raised hand." Must-haves vs "~" nice-to-haves; scope is hammered, the deadline is not. VERIFIED | No percent complete; nice-to-have marker; hammer before asking to extend |
| Launch checklist | [Google SRE book, Appendix E Launch Coordination Checklist](https://sre.google/sre-book/launch-checklist/) | Section list (architecture, capacity, failover, monitoring, security, release process "canaries under live traffic, staged rollouts", external dependencies, "Hard deadlines, external events, Mondays or Fridays"). VERIFIED | Section skeleton; weekday and external-date lines |
| Launch process | [Google SRE book ch. 27 Reliable Product Launches at Scale](https://sre.google/sre-book/reliable-product-launches/) | Each question's "importance must be substantiated, ideally by a previous launch disaster"; low-risk launches get "an almost trivial checklist"; gradual rollout, with a mobile note that fixes "aren't an option with mobile devices". VERIFIED | Every item needs a why; size the checklist to the risk; kill switch before launch |
| Launch checklist | [AWS Operational Readiness Reviews](https://docs.aws.amazon.com/wellarchitected/latest/operational-readiness-reviews/wa-operational-readiness-reviews.html), [OPS07-BP02](https://docs.aws.amazon.com/wellarchitected/latest/framework/ops_ready_to_support_const_orr.html), [example questions](https://docs.aws.amazon.com/wellarchitected/latest/operational-readiness-reviews/appendix-b-example-orr-questions.html) | Checklist built from past incidents; first version "thirty or less" items; findings without a mitigation go to the backlog and are done before launch; one question asks for a runbook. VERIFIED | Cap at 30; findings become tickets blocking the release |
| Go-live, store | [Google Play staged rollouts](https://support.google.com/googleplay/android-developer/answer/6346149), [Apple phased release](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases) | Play: rollout "won't increase automatically", can be halted, not for a first publish. Apple: 7 days at 1, 2, 5, 10, 20, 50, 100 percent; pause up to 30 days. VERIFIED | "Live" has stages; name the percent |
| Go-live, gov | [GOV.UK how the live phase works](https://www.gov.uk/service-manual/agile-delivery/how-the-live-phase-works), [how the beta phase works](https://www.gov.uk/service-manual/agile-delivery/how-the-beta-phase-works), [service assessments](https://www.gov.uk/service-manual/service-assessments/how-service-assessments-work) | Before live: security, metrics, accessibility, uptime and monitoring, support staff trained; keep the legacy service running until the new one is live; amber items fixed "usually up to 3 months" and tracked. VERIFIED | Support readiness and old-version cover as items; go-with-conditions needs a date |
| Release plan | [PEP 790, Python 3.15 release schedule](https://peps.python.org/pep-0790/) | Named release manager; dates grouped "Actual" and "Expected"; "(No new features beyond this point.)" at beta 1. VERIFIED | Split actual from forecast; mark the freeze point |

## What is dropped, and the check that holds it

| Pattern | Check (node test on the report or log file) |
| --- | --- |
| Percent complete as progress ("70% done") | Fail on `\d+\s*%\s*(complete|done)`; rollout percent stays allowed. Checkable |
| Status without an as-of date | Fail if no ISO date in the first three lines. Checkable |
| A date with no label or stage | Fail a date not preceded by baseline, forecast, actual, or a stage word from the closed list. Checkable |
| Bad news in the middle | Fail if state is not on line 1, or if `Decision needed:` or `No decision needed` is missing from the first five lines. Checkable |
| State that does not match the dates | Fixture test: forecast after baseline cannot be `on track`. Checkable |
| Closed-ticket count as progress ("7 of 12 tickets") | Warn on `\d+ of \d+ (tickets|issues)`. Checkable (warn) |
| RAID row without owner, status, raised date or review-by | Parse the table; fail on an empty cell. Checkable |
| Stale RAID row | Fail if review-by is before today and status is open. Checkable |
| `assumed` claim with no A row | Fail if a status line with `assumed` has no matching A id. Checkable |
| Two open tickets sharing a file with no blocker path | Build file-to-tickets map, test reachability both ways. Checkable |
| Cycle in blockers, or ticket with no edges | Topological sort; list orphans as a warning. Checkable |
| Critical path from guessed durations | Fail if a duration has no cycle-time source. Checkable only if the source is a field |
| Go-live item without a why or a check kind | Fail an empty `why` or `how`; fail more than 30 items. Checkable |
| Go-live verdict without evidence | Fail a `pass` line with no evidence or no `human:` owner. Checkable |
| "Live" in a status with no stage | Same as the date-stage check. Checkable |
| Go-live date on a Monday or Friday | Warn only; SRE lists it as a thing to consider, not a ban. Checkable (warn) |
| Extending past a cap without asking | Not checkable; the status must show used/cap and a test can only see that line. |
| A scope stuck "uphill" (unknowns open, not moving) | Not checkable; needs a person to say. Use the aged check as a proxy. |
| Whether a risk is real, or a threshold is right | Not checkable. |

## Not seen

- [GovS 002 itself](https://projectdelivery.gov.uk/library-product/government-functional-standard-govs-002-project-delivery/): the library page returned 403; I did not retry. I read only the [GOV.UK landing page](https://www.gov.uk/government/publications/project-delivery-functional-standard) (8 elements, version 2.1, 17 September 2025). Nothing here is claimed from the standard's clauses. The Teal Book, PRINCE2 and APM were not read.
- Torbay highlight report: the request timed out; not retried. Derbyshire and Finance NI highlight templates (.doc): seen only in search results, UNCONFIRMED.
- GOV.UK pages at guessed addresses (a live assessment page, a risk page, a governance page) returned 404; I did not search further. The service-assessment RAG text I used is from the pages that opened.
- NASA handbook is 1,100 pages of text; I read only the CPM, logic and dangling-activity passages found by keyword. NASA/GAO project reports (for example GAO's NASA major projects assessment) were not opened.
- Original PERT (1958) not read. The Kelley and Walker paper is a scan from a third-party site, not the ACM page.
- Open-source release status posts: only PEP 790 was read. Kubernetes and Rust release status were not.
- The IPA guide's date is not on the page; the ratings in the current annual report may differ (GMPP 2024 uses Red, Amber, Green with definitions "in the IPA Annual Report", which I did not open).
- AWS example questions were read in part. No Azure readiness page was opened.
- Hill charts and the Basecamp feature were read as text only; no images seen. Incident command (rule on commanding) was not re-researched; the SRE incident chapter stays as in the earlier draft.
- Sample sizes: GMPP is 11 Cabinet Office rows; every other artifact is one document, so the patterns are consistent across them but not a survey.
- All thresholds in the table (days, 85th percentile cut-over, 30 items) are borrowed or mine and need the owner's decision.
