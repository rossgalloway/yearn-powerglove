# Review → TODO Workflow

This repo uses `TODO.md` as a lightweight, in-repo backlog while reviewing and using the site.

## 1) Capture

When you notice something:

- Send a short note with **what** + **where** (route/screen/package) + (optional) **repro steps**.
- If you already know the category, prefix with one of: `bug`, `ux`, `techdebt`, `docs`.

Examples:

- `ux: add token logos to Earn toggle (/app/stake)`
- `bug: claim button spins forever (crv, /app/claim) steps: ...`

## 2) Log

Add an item to `TODO.md` with:

- Date in `(YYYY-MM-DD)`
- A short summary
- Location (route/screen/package)
- Any constraints, screenshots, or repro notes

## 3) Triage

Move items out of **Inbox** into the appropriate section (Bugs / UX / Tech Debt / Docs) once clarified.

## 4) Spec

Default in this repo: every TODO gets a short, “prompt-to-start” spec in `docs/specs/`.

- Use any built-in or "plan mode" type skills.
- Create the spec (keep it small, but actionable).
- Link it from the TODO line using `spec: docs/specs/<file>.md`.

Specs should include:

- Context, goals, non-goals
- Proposed implementation (files to touch)
- Acceptance criteria
- Manual QA steps

***HOLD FOR APPROVAL***
Ask for approval to move on to implementation steps. Only proceed with explicit approval.

## 5) Implement

Do the work in small, reviewable chunks; keep changes scoped to the spec.

## 6) Close the loop

When shipped:

- Mark the TODO item as done in `TODO.md`
- Add a short “done note” (what changed + where verified)
