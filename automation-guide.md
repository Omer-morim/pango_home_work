# Test Documentation — Pango Part 2 (Automation)

---

## 1. Deliverable Mapping

The table below shows how each assignment requirement maps to a concrete file or section in this submission.

| Requirement | Where it lives |
|-------------|----------------|
| Reasoning for what was automated | README.md + Section 2 of this document |
| Code clarity, structure, maintainability | POM under tests/pages/<screen>/ — one *.locators.ts per screen |
| Tests that run and add value | npm test — two spec files, end-to-end against the running app |
| Stability (waits, selectors, data) | Section 5–6 of this document + playwright.config.ts + tests/config/* |

Key files referenced throughout this document:

| File | Role |
|------|------|
| tests/parking-lifecycle.spec.ts | Workflow 1 |
| tests/user-create-login.spec.ts | Workflow 2 |
| tests/config/endpoints.ts | BASE_URL + paths; path() / appUrl() helpers |
| tests/config/credentials.ts | Admin user + environment variable overrides |
| README.md | How to run + short rationale (assignment language) |

---

## 2. Why Automate These Two Scenarios?

### Workflow 1 — Parking Cycle Through History

This is the core business path: sign in, start an active parking session, end it, and prove that History reflects what happened. If this breaks, billing and reporting cannot be trusted. The automation checks both the UI state — table row and End control — and the end state, which is the exact plate text appearing on the History page.

### Workflow 2 — Create User, Logout, Sign In Again

This exercises the identity lifecycle: an admin creates a user, signs out, and the new user can authenticate. It catches persistence, form, session, and routing issues. One notable detail is that the add-user form is served at /users/add, not on the /users list page, which is worth verifying explicitly.

---

## 3. Flows and Assertions

Every step in each workflow is paired with an assertion so the test fails at the earliest possible point, rather than at the end with an ambiguous error.

### Workflow 1 — tests/parking-lifecycle.spec.ts

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | login.goto() | Login screen: URL contains /login + submit control visible (expectOnLoginPage) |
| 2 | login.login(admin) | Leaves login route (not.toHaveURL(/\/login/)) |
| 3 | expectLoggedInShell | Dashboard link visible (signed-in shell) |
| 4 | dash.goto() | Start parking button visible |
| 5 | startParking + expectActiveRowVisible | Row for plate + End button visible in active table |
| 6 | endParkingForPlate + expectActiveRowGone | No active row for that plate |
| 7 | openHistoryNav | URL contains /history |
| 8 | expectHistoryShell | URL + visible table tbody |
| 9 | expectPlateRecorded | Plate text exact match (exact: true) within scope |

Test data: unique plate and slot per run (timestamp-based); a small valid PNG from the OS temp directory is used for the image upload field.

### Workflow 2 — tests/user-create-login.spec.ts

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Admin sign-in | Same as Workflow 1 — logged-in shell visible |
| 2 | users.goto() | URL ends with /users |
| 3 | addUser | Add User link navigates to /users/add; username/password fields visible; after submit, back on /users |
| 4 | expectUserListed | Row with the new username appears in the users list |
| 5 | logoutViaUrl | Navigates back to login page |
| 6 | expectOnLoginPage | Login screen visible again |
| 7 | New user sign-in | expectLoggedInShell — new user lands on the Dashboard |

---

## 4. Configuration — Base URL and Paths

All configuration is centralised in tests/config/endpoints.ts and tests/config/credentials.ts. No URL or credential is hard-coded in a test file. The BASE_URL can be overridden at runtime via an environment variable, which makes the same test suite usable against local, staging, or CI environments without modifying code.

| Variable / API | Meaning |
|----------------|---------|
| BASE_URL (env) | Application origin, no trailing slash. Default: http://localhost:5000 |
| endpoints.baseURL | Same value; passed to playwright.config.ts as use.baseURL |
| path('login') etc. | Relative path used in page.goto() |
| appUrl('history') | Full URL string, useful for manual reporting |

Path table (from tests/config/endpoints.ts):

| Key | Path |
|-----|------|
| login | /login |
| dashboard | / |
| history | /history |
| users | /users |
| usersAdd | /users/add |
| logout | /logout |

| Credential variable | Default value |
|-----------------------|---------------|
| ADMIN_USER | admin |
| ADMIN_PASSWORD | password |

---

## 5. Stability and Reliability

No waitForTimeout calls.

The suite relies entirely on Playwright's built-in auto-wait mechanism together with web-first expect assertions. This means a step only proceeds when the element is actually ready, rather than after an arbitrary pause that may be too short on a slow machine or unnecessarily long on a fast one.

Selectors.

getByRole is preferred wherever the DOM exposes a meaningful ARIA role, because role-based selectors survive minor visual redesigns. ID-based fallbacks (#id) are documented in the *.locators.ts files and are the first thing to update if the application HTML changes.

Deterministic test data.

Every run generates a unique license plate, slot number, and username using a timestamp suffix. This prevents row collisions between runs without requiring a database reset and without making tests dependent on each other's cleanup.

Failure artifacts.

playwright.config.ts is configured to capture a trace, a screenshot, and a video on every failed test. This makes it possible to diagnose failures without re-running, which is especially valuable in CI where the environment may not be interactively accessible.

---

## 6. Locators Per Page

Each page object has a companion locators file. Keeping selectors in a dedicated file means that when the DOM changes, the update is made in exactly one place and all tests using that page automatically pick up the change.

| Screen | Locators file | Page object |
|--------|---------------|-------------|
| Login | tests/pages/login/login.locators.ts | LoginPage.ts |
| Dashboard | tests/pages/dashboard/dashboard.locators.ts | DashboardPage.ts |
| History | tests/pages/history/history.locators.ts | HistoryPage.ts |
| Users | tests/pages/users/users.locators.ts | UsersPage.ts |

One known fragile area: the add-user form is served at /users/add, not on the /users list page. The page object navigates explicitly to /users/add, and the assertion after submission checks that the browser returns to /users. If this routing ever changes, only users.locators.ts and the addUser method need updating.

---

## 7. Evidence Videos — Fill In Manually

### Workflow 1 — Parking Lifecycle and History

| Field | Value |
|-------|-------|
| Video file path | e.g. C:\...\parking-lifecycle.mp4 |
| Duration (mm:ss) | — |
| Recording tool / browser | — |

Suggested timeline — replace timestamps from your recording:

| Timestamp | What to highlight |
|-----------|-------------------|
| __:__ | Login screen and admin credentials |
| __:__ | After sign-in — Dashboard shell visible |
| __:__ | Plate / slot / image filled in and Start Parking clicked |
| __:__ | Active row + End session |
| __:__ | History page opens and plate appears in the table |

### Workflow 2 — Create User, Logout, Sign In Again

| Field | Value |
|-------|-------|
| Video file path | e.g. C:\...\user-create-relogin.mp4 |
| Duration (mm:ss) | — |
| Recording tool / browser | — |

Suggested timeline:

| Timestamp | What to highlight |
|-----------|-------------------|
| __:__ | Admin sign-in |
| __:__ | Users → Add User → form on /users/add |
| __:__ | New user visible in the list |
| __:__ | Logout and return to login |
| __:__ | Sign in as new user and reach Dashboard |

---

## 8. Quick Run

```bash
npm install
npx playwright install
npm test
```

For full setup and configuration options, see README.md.

---

## 9. Troubleshooting

- Too many active sessions / capacity messaging: clear old sessions or reset the DB / Docker volume before repeated runs.

- Add User failures: update tests/pages/users/users.locators.ts if the HTML has changed.


