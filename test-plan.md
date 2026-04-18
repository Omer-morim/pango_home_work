# QA Test Report — Parking Management System

Exploration & Test Plan | Bug Report | Test Cases

---

## Part 1 — Exploration & Test Plan

### 1. What did you choose to test (and why)?

I focused on critical user journeys that affect trust and core operations:

**(1) Authentication — login and account-recovery entry points

**(2) Dashboard parking lifecycle — start/end session and validation

**(3) History — the UI truth for completed sessions

**(4) User management — an admin-only surface with destructive actions

These were prioritized because failures here are high impact: incorrect parking state, misleading security UX, or unsafe admin actions would directly harm users and the company's reputation.

Scope was limited to what the running Docker build exposed (no full performance or accessibility audit).

---

### 2. How did you structure your testing approach?

My approach was structured in three stages:

**(1) Environment setup + fast reconnaissance**

Using scripted/browser checks to surface console errors, broken assets, and obvious DOM/HTML issues.

**(2) Layered exploration**

UI consistency (including mixed Hebrew/English), functional validation (happy paths + negative/boundary inputs for core flows), and lightweight security checks (session/logout semantics, CSRF posture on state-changing actions where observable).

**(3) Consolidation**

Reproduce, classify impact, and assign Severity/Priority based on user trust and core business risk.

---

### 3. What did you consider as important?

Risks:

**(1) Incorrect parking state shown in the UI (especially mismatches between active sessions and history)

**(2) Security weaknesses around state-changing actions such as ending a session or admin-only operations

Edge cases:

**(1) Active-session limits

**(2) Invalid/unexpected file uploads for the image field

**(3) Session handling around logout/login boundaries

User flows:

End-to-end validation from admin user management (as applicable) through starting an active parking session to verifying the history log reflects the same facts users saw on the dashboard

---

##  4.A Significant Bugs Identified

The following table summarizes all significant bugs identified during the exploratory testing session.

| Field | BUG-001 | BUG-002 | BUG-003 | BUG-004 | BUG-005 |
|-------|---------|---------|---------|---------|---------|
| Title | Critical security redirection: 'Forgot password' navigates to external site (cataas.com) | 'Show password' throws JS exception; toggle behavior breaks | No user-visible feedback after failed login | Invalid HTML: stray tags instead of <body> | Image upload validation missing: partial/wrong extension accepted; file fails to open on end-user OS with no in-app warning |
| Severity | High | Medium | Medium | Low | High |
| Priority | P1 | P2 | P1 | P3 | P1 |
| Page / Area | /login | /login | /login | /login | / → /history |
| Preconditions | None | Login page loaded | Loaded, invalid username/password | View page source | Logged in as admin; valid plate + slot for flow |
| Steps to Reproduce | 1) Open /login  2) Click 'אפשר לאפס כאן' | 1) Open /login  2) Click password visibility toggle (#togglePassword) | 1) Enter wrong credentials  2) Submit login | 1) View HTML source of /login | 1) Dashboard → select file example.pn  2) Start Parking (no error)  3) End session  4) Open attachment from History on client PC |
| Expected | In-app password reset flow or verified, trusted reset provider | Toggle works; no console errors | Clear authentication error message | Valid <body> tag | Reject invalid uploads before session persistence or clear in-app error; magic bytes, MIME allowlist, max size; History must not expose broken files silently |
| Actual | User is sent to https://cataas.com/cat — phishing/trust risk | Console error: Cannot read properties of null (reading 'classList') | Stays on /login; no visible error elements | Stray tags after <body> | Flow succeeds; History lists activity; OS-level invalid file; no in-app warning at any stage |
| Evidence / Notes | href points to cataas.com/cat (offending HTML fragment) | Empty #togglePassword button; script uses querySelector('span') | login.html ~line 92 | login.html ~line 92 | e.g. tmpexample.pn; same class of issue for other misleading/non-image files |

---

##  Test Cases

### 4.B — Users, Permissions, and Dashboard Field Behavior

| Field | TC-USR-001 | TC-USR-002 | TC-USR-003 | TC-USR-004 |
|-------|------------|------------|------------|------------|
| Title | User creation workflow (admin creates a new user) | User deletion workflow + authorization after delete (deleted user cannot log in) | Permission model smoke: login as admin vs regular user; verify allowed/forbidden pages & actions | Dashboard field rules: Car plate, Vehicle type, Slot (labels, defaults, constraints, 'illogical' inputs) |
| Severity | High | High | High | Medium |
| Priority | P1 | P1 | P1 | P1 |
| Page / Area | /users → /login | /users → /login | /login → /, /users, /history | / |
| Preconditions | Logged in as admin | Logged in as admin; a disposable test user exists | At least two accounts: admin + non-admin | Logged in (typically admin) |
| Steps to Reproduce | Create user with known username/password; confirm user appears in list; attempt login as new user | Delete the test user; attempt login with deleted credentials; verify denial and messaging | 1) Login as admin → exercise privileged areas  2) Logout  3) Login as regular user → attempt same URLs/actions | Car plate: try >8 digits (paste), sequential digits rule, letters/specials. Vehicle type: confirm default = Standard; open dropdown. Slot: confirm alphanumeric works; enter long special-char strings |
| Expected | User is created, visible in Users table, and can authenticate | Deleted credentials cannot authenticate; UI/API response is explicit | Admin can access admin surfaces; regular user is restricted per product rules | Plate: hard cap 8 numeric digits; rejects sequences; rejects letters/specials. Vehicle type: consistent control + valid option set. Slot: defined allowed charset (recommended: block exotic punctuation) |
| Actual | User is created, visible in Users table, and can authenticate | User is Deleted and cant enter the system | Admin/ regular user with the right permissions ( i don't have access to configuration so cant really check it ) | Car plate: All checks behaved as expected: input is constrained to 8 numeric digits (cannot exceed 8 / cannot enter letters or special characters), invalid lengths and non-numeric inputs are rejected with appropriate validation messages, and the sequential-plate rule is enforced as implemented. Vehicle type: Pass — default shows Standard; dropdown/control behaves consistently in this build (single selectable option observed). Slot: Fail — the field effectively accepts free-text input (including long “illogical” / special-character strings) with no meaningful validation observed, unlike the plate field. |

---

### 4.C — Parking Lifecycle, Limits, Uploads (Happy + Matrix)

| Field | TC-IMG-POS001 | TC-E2E-PARK001 | TC-LIMIT-001 | TC-UPLOAD-MATRIX-001 |
|-------|---------------|----------------|--------------|----------------------|
| Title | Positive image workflow: valid image → start session → end → History → open attachment successfully | Full lifecycle integrity: active table ↔ history record (times, slot, plate, attachment link) | Active parking cap (>3): enforce when expected; capture messaging; check for contradictions with 'started' | Upload hardening matrix: size, MIME vs extension, exe/pdf disguised as image, long filename, special chars, empty file |
| Severity | High | High | High | High |
| Priority | P1 | P1 | P1 | P2 |
| Page / Area | / → /history | / → /history | / | / |
| Preconditions | Known-good PNG/JPEG under reasonable size | Clean-ish environment to observe state transitions | Enough sessions to hit cap (or seed) | Admin session |
| Steps to Reproduce | Dashboard: attach valid image → fill required fields → Start → End → History → download/open image | Same as TC-IMG-POS001 but explicitly compare active row fields to history row + timestamp format/timezone sanity | Create sessions until limit triggers; observe block vs success; capture any dual flash messages | Execute each matrix row independently; record server response + UI flash + persisted file behavior |
| Expected | Image opens and renders; no OS-level corruption error | No mismatches between UI states; timestamps understandable; ended session not still 'active' | Single coherent outcome + one clear message | Reject bad files before persisting; never rely on extension alone |
| Actual | Pass for the exercised path: a small valid PNG was uploaded from disk; Start Parking produced an active row with the entered plate and slot; End removed the row from the active table; History showed the same plate (aligned with manual observation and with the Part 2 `parking-lifecycle.spec.ts` run). Downloading or opening the History attachment on a client machine was not automated in this suite. | Active → History (data match): After Start Parking, the session appears in the Active table with the same plate and slot values entered on the dashboard. After End, the session no longer appears in the active list, and a matching record appears in History with the same plate and slot (no field mismatch observed between the two screens). Timestamps: The start/end timestamps shown in History are human-readable and consistent with the session lifecycle (start before end). Timezone labeling was not explicitly validated against a known reference clock in this check (UI-only verification). | When the >3 active parkings condition is hit, the UI shows the Hebrew warning/error (“יש יותר מ־3 חניות פעילות!” / equivalent cap message), but the flow still allows starting another parking session (e.g., “Parking started…” / session appears), creating contradictory outcomes: limit warning + successful start instead of a single coherent block with one clear message. | Upload hardening fails for the invalid / misleading extension cases: the application accepts files with non-valid / partial extensions (extension is not treated as untrusted input), allowing the parking flow to proceed instead of blocking at submit with a clear validation error. This indicates the system is not reliably enforcing server-side content validation (e.g., magic bytes + MIME allowlist) and is effectively over-relying on the filename/extension, which is trivially spoofable. |

---

### 4.D — Security, Slot Business Rules, Admin Safety, Accessibility, Cross-Browser

| Field | TC-SEC-001 | TC-SLOT-001 | TC-USERADMIN-001 | TC-A11Y-001 | TC-XBROWSER-001 |
|-------|------------|---------------|------------------|-------------|-------------------|
| Title | CSRF / state-changing POST probes for /end/<id> (+ session cookie boundaries) | Slot business rules: empty slot, max length, duplicate slot for two active cars, allowed pattern | Admin destructive safety: delete confirmations; attempt delete admin; self-delete prevention | Accessibility smoke: keyboard navigation, labels/help text, RTL/LTR consistency | Regression pass for §5 items on Firefox + WebKit (not only Chromium) |
| Severity | High | Medium | High | Medium | Medium |
| Priority | P1 | P2 | P1 | P3 | P2 |
| Page / Area | / (end forms), network | / | /users | Global | Global |
| Preconditions | Known /end/<id> from HTML; safe local env | Two plates available | Backup mindset / disposable env | — | Playwright browsers installed |
| Steps to Reproduce | POST without cookies; POST with cookie but minimal headers; document status codes/redirects/body | Try empty slot; duplicate slot; max length; compare outcomes | Execute destructive cases carefully | Tab through login + dashboard; verify focus order + visible focus | Run identical repro steps for BUG-001…BUG-005 on FF/WebKit |
| Expected | Unauthenticated cannot end sessions; authenticated requests require CSRF defenses (token or equivalent hardening) | Consistent enforceable slot model | System prevents catastrophic admin mistakes | Usable without mouse for core flow | Same defect behavior (or document browser-specific deltas) |
| Actual | Prior HTML sampling showed /end/ form without visible CSRF field — confirm server-side mitigation | Slot behaves like free text: empty slot, duplicate slot across active cars, and long/special-character values were not reliably blocked with clear validation; behavior is overly permissive vs an enforceable slot model. | Confirmations observed as expected | Core flows are keyboard-reachable via Tab/Shift+Tab on /login and / (focus moves predictably between nav links and primary controls). Visible focus is generally discernible on interactive elements. Labels/help text exist for key inputs (e.g., plate guidance text). RTL/LTR is mixed (Hebrew headers vs English nav/labels) but remains usable in the tested paths—no blocking a11y failures observed in this lightweight smoke (not a full WCAG audit). | Part 2 Playwright automation (`parking-lifecycle.spec.ts`, `user-create-login.spec.ts`) was executed with the configured browser projects Chromium, Firefox, and WebKit; all runs completed successfully (same two end-to-end flows per engine). This validates those paths across engines for the automated scope; exhaustive manual re-walk of BUG-001–BUG-005 on every browser was not repeated beyond that pass. |


