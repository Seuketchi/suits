# The v3 delivery seams

Reference for **phrasing** the *Work planned for today* line and counting days remaining. **Never use a seam as a section heading** — the report has exactly three sections.

## The three seams

| Date | Seam | Features |
|---|---|---|
| **Aug 31** | core banking | Enrollment, Login, Savings, Face recovery, Kill switch, Account recovery, Device re-link |
| **Sep 14** | payments and recovery | Fund transfer, InstaPay, PESONet, Bills payment, E-load, Loans, Cards |
| **Sep 25** | the rest | PIN and password change, KYC upgrade, Profile, Notifications, FAQs, Branch locator, Automation, Payee and biller management, Production deployment |

Compare each seam's date against today, computed — never written down. **A seam whose date has passed is OVERDUE: say so and give the slip in days.** Overdue outranks active.

## Mapping work to a seam

Map by the Flutter feature directory the PR touches (`lib/features/<name>`, `lib/core/<name>`) and its conventional-commit scope.

| Scope / directory | Seam |
|---|---|
| `registration`, `auth` | Aug 31 — Enrollment / Login |
| `account`, `account_management` | Aug 31 — Savings |
| recovery, re-link, password reset | Aug 31 — Account recovery / Device re-link |
| `fund_transfer`, `payment`, `transactions`, `loan_management` | Sep 14 |
| `profile`, `kyc`, notifications, automation | Sep 25 |

**Contract, transport and security work belongs to the seam of the feature it unblocks**, never to a seam of its own. A signing or interceptor change that exists to make InstaPay work is Sep 14 work.

If something genuinely maps to no seam, give it its own bullet rather than forcing it into one.

## Maintenance

This table is dated content and will go stale. Once Sep 25 ships, replace it with whatever schedule succeeds it rather than leaving expired seams in place — a skill that reports every seam as overdue is worse than one with no seams at all.
