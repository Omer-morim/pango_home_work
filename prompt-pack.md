# Prompt Pack — Pango Homework (Methodology Evidence)

This document consolidates the core prompts that guided the work, to demonstrate the thinking process and iterative decision-making behind the final submission. Prompts below are written in **full form** (not shortened), as they were used in practice.

---

## 1) Core Prompting Strategy (High-Level)

- Start with a clear delivery goal: two critical end-to-end workflows + complete documentation.
- Enforce architecture constraints: POM, assertions after each meaningful action, centralized configuration.
- Iterate based on feedback: file structure, locator stability, assertion quality, and documentation clarity.
- Apply execution-based quality checks: real runs (`tsc`, Playwright), then fix until green.

---

## 2) Selected Prompts (7) — Full Prompts From the Actual Work

### Prompt 1 — Core assignment scope (Part 2 automation)

> Part 2 — Automation: choose one or two meaningful scenarios from the test plan and automate them.  
> The reviewers care about: reasoning for what I chose to automate; code clarity, structure, and maintainability; tests that actually run and add value; how I handle stability and reliability (waits, selectors, test data).  
> Deliverables: `tests/`, `README.md` (how to run + short explanation of choices), and the test files.  
> I want to automate **two** workflows:  
> (1) Sign in, start a parking session, end it, then verify on the History page that the record updated correctly.  
> (2) Create a new user as admin, log out, then sign in as the new user.  
> Constraints: use **POM**; after each meaningful action assert something concrete (visible text, element on the page we navigated to, URL, etc.); keep a **config** file with the main base URL and relative **endpoints** for other routes; `tests.md` should include everything, placeholders for two screen recordings of these flows, and room for any extra fields I need to fill later.

### Prompt 2 — Architecture, assertions, and documentation depth

> Key points for implementation:  
> (1) Work in a **Page Object Model** structure.  
> (2) After each action, verify with an **appropriate assertion** (text, element on the navigated page, URL, table row, etc.).  
> (3) Put the **base URL** and **route endpoints** in a central config so nothing is hard-coded ad hoc across tests.  
> (4) `tests.md` must be the “single narrative” for Part 2: what was automated, why, how to run, env vars, locator strategy, stability notes, troubleshooting, and **reserved placeholders** for the two process videos plus any extra columns I may need to complete later.

### Prompt 3 — Refactor pass: per-page locators, efficient Playwright usage, stronger assertions

> Redo / refine the automation with emphasis on:  
> - **Separate locator files per page/screen** (not one giant selectors file), each paired with its page object.  
> - **Smarter, efficient Playwright usage** (prefer auto-waiting and web-first `expect`, avoid pointless `Promise.all` with `networkidle` where it does not buy a real synchronization guarantee, use navigation assertions where they add signal).  
> - **Strong assertions** at the right layer: authenticated shell checks, URL checks after navigation, scoped table assertions, exact text for plate to avoid partial digit collisions, etc.

### Prompt 4 — Execution truth: typecheck + cross-browser Playwright run

> I need a factual build/test status, not assumptions.  
> Please run **`npx tsc --noEmit`** and **`npx playwright test`** in the project (respect Windows PowerShell command chaining rules), and report whether everything passes.  
> If anything fails, diagnose and fix until green.  
> The goal is to prove the suite is not “theoretical”: it compiles and runs end-to-end against the local Docker app on the configured browser projects.

### Prompt 5 — Documentation split: Part 2 “explanation of choices” vs Part 3 reflection vs verbatim automation guide

> Clarification: **Part 2 “explanation of choices”** should live in its own artifact (e.g. `Expanation_choices.md` / `automation-guide.md`), separate from **`ai-reflection.md`** which is **Part 3** (process reflection, trade-offs, AI tooling).  
> Additionally, I will paste a complete English document for the automation guide / test documentation. I want it formatted consistently with the other Markdown deliverables (headings, `---`, tables), **without changing wording** unless something is ambiguous—in which case **ask before editing**.  
> Also update `README.md` cross-links so a reviewer can navigate: README → automation guide → reflection, without mixing responsibilities between files.

### Prompt 6 — Test plan ingestion: strict fidelity + Markdown structure + approval gate before “fixes”

> I am going to send the full text for `test-plan.md` (QA test report: exploration plan, bug table, extended test cases).  
> Rules:  
> - **Do not change any words** in my supplied text.  
> - If you see something incorrect, inconsistent, or copy/paste noise, **ask me and wait for approval** before correcting.  
> - Apply the same **Markdown layout discipline** as the other `.md` deliverables (title, separators, tables).  
> - After formatting, if you still see issues that look like mistakes (e.g., an “Actual” cell that clearly belongs to a different test case), flag them and propose a corrected sentence, but only apply after I confirm.

### Prompt 7 — Evidence alignment: correct “Actual” cells to match what was really executed

> Two concrete corrections in `test-plan.md`, aligned with what we **actually ran** in automation:  
> (1) In section **5.B**, column **TC-IMG-POS001**, row **Actual** still contains user-management language that does not match a positive image workflow—replace it with an “Actual” description consistent with a valid PNG upload, active row, end session, and History showing the same plate (and explicitly note what was not automated, e.g., opening the attachment on a client machine if that was out of scope).  
> (2) In section **5.C**, column **TC-XBROWSER-001**, row **Actual** was empty—fill it based on the real outcome: Playwright ran the two specs across **Chromium, Firefox, and WebKit** projects and passed; clarify that exhaustive manual re-walk of BUG-001…BUG-005 per browser was not repeated beyond that automated pass unless separately executed.

---

## 3) What These Prompts Demonstrate

- **Risk + business value mindset** (prioritize the most critical workflows over broad but shallow coverage).
- **Engineering quality control**: POM, locator strategy, assertion discipline, centralized config.
- **Maintainability focus**: refactor to per-page locators and improved assertions after feedback.
- **Documentation governance**: clear alignment between code, README, automation guide, and reflection.
- **AI collaboration model**: definition → implementation → execution check → correction loop.

---

## 4) Implemented workflows — full step list (including assertions)

This section enumerates **every executed step** in the two shipped Playwright flows, with the **assertion(s)** tied to each step (as implemented in the suite).

### Workflow 1 — Login → Start Parking → End → History (`tests/parking-lifecycle.spec.ts`)

| # | Step / action | Assertion(s) |
|---|----------------|--------------|
| 0 | **Setup (`beforeAll`)**: write a tiny valid PNG to OS temp for upload | *(setup only; failure surfaces as file write / later upload failure)* |
| 1 | `login.goto()` | **Login screen**: URL matches `/login` **and** the login submit control is visible (`LoginPage.expectOnLoginPage`). |
| 2 | `login.login(adminUser, adminPassword)` | **Authenticated navigation**: URL **does not** remain on `/login` after submit (`expect(page).not.toHaveURL(/\/login/)` inside `login()`). |
| 3 | `dash.expectLoggedInShell()` | **Signed-in shell**: the **Dashboard** navigation link is visible (stronger than URL-only). |
| 4 | `dash.goto()` | **Dashboard ready**: **Start parking** button is visible. |
| 5 | `dash.startParking({ plate, slot, imagePath })` | **Session creation action**: fills plate + slot, attaches PNG when provided, clicks start (assertions follow immediately in next step). |
| 6 | `dash.expectActiveRowVisible(plate)` | **Active session UI truth**: a table row for the plate is visible **and** the row’s **End** control is visible. |
| 7 | `dash.endParkingForPlate(plate)` | **End action readiness**: End button is **enabled**, then clicked. |
| 8 | `dash.expectActiveRowGone(plate)` | **Active list consistency**: **zero** matching active rows for that plate (`toHaveCount(0)` semantics via locator count). |
| 9 | `dash.openHistoryNav()` | **Navigation to History**: History nav interaction + URL contains **`/history`**. |
| 10 | `history.expectHistoryShell()` | **History page structure**: URL still matches History route **and** a `table tbody` is visible (not only free text somewhere on the page). |
| 11 | `history.expectPlateRecorded(plate)` | **History content correctness**: plate appears as **exact** text (`getByText(..., { exact: true })`) within a scoped container (`main` fallback to `body`). |

### Workflow 2 — Create User → Logout → Login as New User (`tests/user-create-login.spec.ts`)

| # | Step / action | Assertion(s) |
|---|----------------|--------------|
| 1 | `login.goto()` + `login.login(admin)` | Same as Workflow 1 steps **1–2** (leave `/login` after submit). |
| 2 | `dash.expectLoggedInShell()` | **Signed-in shell** after admin login: Dashboard link visible. |
| 3 | `users.goto()` | **Users list route**: URL ends with **`/users`**. |
| 4 | `users.addUser(newUser, newPass)` | **Add-user navigation + form**: Add User link visible → navigate to **`/users/add`** → username/password inputs visible → submit → return to **`/users`**. |
| 5 | `users.expectUserListed(newUser)` | **Persistence in list**: a row for the created username is visible on `/users`. |
| 6 | `dash.logoutViaUrl()` | **Logout route**: navigates to logout endpoint and lands on **login** URL (`/login`). |
| 7 | `login.expectOnLoginPage()` | **Login boundary**: URL matches `/login` **and** submit control visible again. |
| 8 | `login.goto()` + `login.login(newUser, newPass)` | **New user authentication**: leaves `/login` after submit (same assertion as admin login inside `login()`). |
| 9 | `dash.expectLoggedInShell()` | **New user session shell**: Dashboard link visible for the new user session. |

---

## 5) Focused Improvement Plan (Only the 2 Implemented Workflows)

This section intentionally extends only the two workflows already implemented, without introducing unrelated new scenarios.

### Workflow 1 — Login → Start Parking → End → History

1. **Stronger history verification**  
   Move beyond “plate appears” and validate additional row fields together (`plate`, `slot`, and start/end order).
2. **Attachment validation in the same flow**  
   After navigating to History, verify that the attachment link exists and can be downloaded (OK response / expected content type).
3. **Negative branch within the same journey**  
   Attempt an invalid upload in this flow and assert clear validation feedback + no new session created.
4. **Reliability hardening**  
   Add reusable row helpers for active/history tables by plate to reduce locator ambiguity and flakiness.

### Workflow 2 — Create User → Logout → Login as New User

1. **Uniqueness / duplicate-path handling**  
   Add a duplicate-username branch and assert expected rejection behavior.
2. **Post-logout session boundary check**  
   After logout, attempt direct access to a protected route and assert redirect to login.
3. **Role-aware shell checks**  
   After new-user login, validate not only Dashboard visibility but also role-relevant element presence/absence.
4. **Repeatability cleanup strategy**  
   Add cleanup for created users (if supported) or predictable tagging for easier environment hygiene.

---

## 6) Ready-to-Send Message (Email / WhatsApp)

Hi,  
Following your feedback, I am sharing the prompt pack that guided the implementation, to show the reasoning process and decision framework behind the submission (not just the final artifacts).

Included:
- The core prompts that drove planning, implementation, and refinement.
- A short rationale for what each prompt contributed methodologically.
- A **full step-by-step map** (with assertions) for the two implemented end-to-end workflows:
  1) **Login → Start Parking → End → History**  
  2) **Create User → Logout → Login as New User**
- A focused improvement plan that deepens **only** those two workflows (no unrelated new scenarios at this stage).
- A concise list of **professional polish** ideas scoped **only** to the two shipped spec files (`parking-lifecycle`, `user-create-login`).
- Optional **tooling** recommendations (linting, reporting, env helpers) for future iterations.

The goal is to demonstrate a quality-driven approach: business-critical coverage, maintainable engineering choices, and controlled iteration based on feedback.

Happy to walk through the technical decisions live (POM structure, locator strategy, assertion design, and run stability).

---

## 7) Implemented updates map (what changed and where)

This section provides a clear file-by-file map of the improvements that were actually implemented.

| File | What was updated | Why it was updated |
|------|------------------|--------------------|
| `tests/parking-lifecycle.spec.ts` | Added `test.step()` blocks for all major phases; strengthened history verification (`plate` + `slot` row-level check); added a focused negative test (`invalid plate` + `non-image file`) with active validation + no-row assertion. | Improve trace/report readability, reduce false positives, and increase confidence in both UX feedback and data state. |
| `tests/user-create-login.spec.ts` | Added `test.step()` flow structure; added protected-route check after logout (`/users` redirects to login); added focused negative test for wrong password after user creation; removed redundant `users.goto()` before `addUser()`. | Make session-boundary behavior explicit, add negative-path signal, and keep navigation logic consistent with POM encapsulation. |
| `tests/pages/login/LoginPage.ts` | Added `loginExpectFailure(username, password)`. | Provide a reusable, explicit assertion path for failed-auth scenarios. |
| `tests/pages/history/HistoryPage.ts` | Added `expectRecordRowContains(plate, slot)`. | Verify same-row integrity in History, not just free-floating text presence. |
| `tests/pages/dashboard/DashboardPage.ts` | Added `expectValidationMessageVisible(...)` to assert visible user feedback before checking side effects. | Ensure active validation (UX signal) in negative flow, preventing silent-failure false positives. |
| `prompt-pack.md` | Reworked prompts into fuller versions; added detailed step/assertion mapping, focused workflow-only improvements, optional tooling recommendations, and this update map section. | Make methodology evidence clearer, reviewer-friendly, and aligned with feedback. |

---

## 8) Professional additions — only the two specs that were actually shipped

These are **small, high-signal** upgrades scoped strictly to `tests/parking-lifecycle.spec.ts` and `tests/user-create-login.spec.ts`. They do not require new product scenarios beyond what those files already represent.

### `tests/parking-lifecycle.spec.ts`

1. **`test.step()` around the four logical phases** you already annotate in comments: Login → Dashboard + Start → End → History. That makes traces and the HTML report read as a business story, not only a raw action list.
2. **Assert more than “plate exists” on History** — e.g. verify the **same table row** contains both the generated **plate** and **slot** (and optionally ordering of start/end if exposed), so the test proves **Dashboard ↔ History field alignment**, not accidental text elsewhere on the page.
3. **Add a second short test in the same file** — attempt `startParking` with a **non-image** or **invalid / misleading extension** file and assert **clear validation feedback** and/or **no new active row**. That keeps scope inside the parking lifecycle file while showing negative discipline.

### `tests/user-create-login.spec.ts`

1. **`test.step()` per phase**: admin login → create user → logout → new-user login (mirrors the comments you already use).
2. **Post-logout session boundary** — after `logoutViaUrl`, call `page.goto('/users')` (or another protected route) and assert you are **redirected back to `/login`**. That proves session teardown beyond “the logout URL loaded”.
3. **Add a second focused test in the same file** — e.g. **duplicate username** creation (if the app returns an error) or **wrong password** right after user creation — with an assertion on **user-visible feedback**. Stays inside the “user lifecycle” theme without inventing unrelated journeys.

**Why this tier matters:** it signals production-style habits (structured reporting in traces, boundary checks, one negative per flow) while staying faithful to the two homework workflows you already implemented.

---

## 9) Optional tooling recommendations (next-level Playwright suite)

These are **optional** add-ons - commonly improve **code quality**, **maintainability**, and **observability** when you grow the suite.

### Code quality and maintenance

- **`eslint` + `@typescript-eslint` + `eslint-plugin-playwright`** — catches test anti-patterns early (e.g. `waitForTimeout`, unnecessary `force: true`, `page.pause` left in specs, dubious assertion patterns).
- **`prettier`** — consistent formatting across specs and POM so diffs stay readable and reviews stay fast.

### Contract checks (if you add API / JSON assertions)

- **`zod`** — validate JSON payloads and API responses in integration-style checks with clear, typed failures.

### Reporting (richer than the default HTML reporter)

- **`monocart-reporter`** or **`allure-playwright`** — stronger reporting for trends, history, and attaching artifacts in a way stakeholders and CI can consume more easily than plain HTML alone.

### Local environment ergonomics

- **`dotenv`** (or **`dotenv-cli`**) — load a local `.env` for `BASE_URL` / credentials without cluttering shell sessions; complements the existing `process.env` approach.
