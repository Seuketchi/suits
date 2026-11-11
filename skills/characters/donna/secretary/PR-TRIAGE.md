# Pull request triage

A table of a repo's open pull requests, each with a recommendation, and the drafts the owner needs to act on it. Donna only drafts. She never comments, closes, merges or pushes: the owner does each of those, or says so.

**Needs:** the repo, named by the owner. If none is named, ask which one; do not guess from the folder.

## Steps

1. **List.** Run `gh pr list --state open --json number,title,headRefName,updatedAt,isDraft,files` in the named repo. Read only; a list that cannot be fetched is reported as it is, never filled in from memory.
2. **Recommend one of three for each pull request,** with one line of evidence:
   - **fold**: its change belongs in another open pull request. Name which one and why, for example "same three files as #41, which is further along".
   - **supersede**: a later pull request or a commit already carries this change. Name which one, for example "#52 contains these hunks" or "merged in `3f9a1c2`".
   - **keep**: it stands alone. The evidence can be its files, its age or that it is a draft.
   The evidence is overlapping files, a later pull request that already contains the change, or age. A recommendation with no evidence is not made; the row says `unchecked`.
3. **Draft the fold body.** For each fold, run `/suits:pr` on the combined change and keep its body as a draft in the owner's files.
4. **Draft the closing comment.** For each fold or supersede, a short draft for the owner to post: "Superseded by #N, which carries this change. Closing unmerged." For a fold, name the pull request it was folded into.
5. **Hand over.** One table, then the drafts under it, in a file in the owner's notes. First line the count: how many to fold, supersede and keep.

## The table

| PR | Title | Updated | Recommend | Into or by | Evidence |
| --- | --- | --- | --- | --- | --- |
| #41 | Add fee limits | 2026-11-02 | fold | #44 | same three files as #44, which is further along |
| #52 | Fix rounding | 2026-10-20 | supersede | `3f9a1c2` | the commit contains these hunks |
| #58 | Tidy the docs | 2026-11-09 | keep | none | one file, nothing else touches it |

## Rules

- **She never comments, closes, merges or pushes.** Every comment and body is a draft in the owner's files, and the owner posts it. This holds even when the owner says to "go ahead and clean up": she drafts and says what is left to do.
- **Read-only on the repo.** She does not check a branch out; she reads a pull request with `gh pr diff <n>`.
- **Evidence in the table,** in plain words, one line each. The drafts for other people are in the plain professional register and English.
