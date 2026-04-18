# Part 3 — Reflection Pango homework

Short reflection on how Part 1 (exploration + test plan) and Part 2 (Playwright automation) were approached, what was traded off, and how AI tooling fit in.

---

## 1) Overall approach and key decisions

**Exploration and risk focus**  
Work on the running **Pango** app (local Docker, `BASE_URL` typically `http://localhost:5000`) combined **manual probing** with **agent-assisted exploration**. Manual effort concentrated on **critical journeys**, **boundary behaviour**, and **timing-sensitive** cases (e.g. fast navigation, repeated actions such as double-submit on “start parking”) where human observation catches inconsistencies that are expensive or unreliable to encode first.
 Scripted checks and the agent were used heavily for **breadth**: console errors, obvious DOM/HTML issues, CSRF/session surfaces where observable, and repetitive navigation.

**Automation scope (Part 2)**  
Automation targets **two end-to-end flows** aligned with the written test plan:
 (1) **login → start parking → end → assert History**; 
 (2) **admin creates user → logout → login as the new user**. Those were chosen because they map to **core business trust** (state vs history) and **identity lifecycle** (provisioning + session hand-off), not peripheral UI polish.

**Prioritisation**  
Defects and scenarios were skewed toward **high / medium** impact (security redirect on “forgot password”, failed-login feedback, upload handling, invalid markup, etc.) rather than low-severity cosmetic issues, consistent with product risk and grading time.

**Engineering decisions**  
- **Page Object Model (POM)** with **per-page locator files** (`*.locators.ts`) to separate “where to click” from “what the test proves”.  
- **Single config for URLs**: `tests/config/endpoints.ts` exposes `baseURL`, path keys, `path()`, and `appUrl()`; Playwright `use.baseURL` reads the same source to avoid drift.  
- **Environment-driven URL and credentials**: `BASE_URL` plus `ADMIN_USER` / `ADMIN_PASSWORD` (see `tests/config/credentials.ts`) are read from the environment with sensible local defaults. **No code changes** are required to point the suite at another environment (staging, ephemeral preview, a colleague’s machine) or to inject secrets from a vault in **CI/CD**. That pattern is what DevOps and engineering teams usually expect: the pipeline supplies variables; the same artefact runs everywhere. It raises practical value beyond a one-off homework run.  
- **Assertions after meaningful steps**: URL checks, visible shell (e.g. Dashboard link), table row presence/absence, History table shell, **exact** plate text to avoid partial digit matches.  
- **Playwright-native stability**: auto-waiting, `expect` assertions, no arbitrary sleeps; timeouts set in config for actions and navigation.

---

## 2) Trade-offs and why

| Decision | Trade-off | Rationale |
|------------|-------------|-----------|
| **POM vs inline tests** | More files and indirection up front | Locator churn is localised; specs stay readable and intent-driven. |
| **Parallel execution** | Higher risk of shared-state clashes on a **live DB** | The repo uses **`fullyParallel: true`** (and multiple browser projects). **Mitigation** is **unique data per run** (timestamp-derived plate, slot, username), not serial execution. A valid alternative would be `fullyParallel: false` or a single worker for maximum isolation on a tiny environment; here speed and multi-browser coverage were preferred with data isolation. |
| **Timestamp-based identifiers** | DB noise over time without cleanup | Zero manual teardown; avoids flaky collisions between workers or re-runs. |
| **`getByRole` first, `#id` / structure fallbacks** | Roles fail if labels/roles are weak; regex may need **Hebrew + English** variants for this build | More resilient to cosmetic CSS changes than long XPath; fallbacks match the actual homework DOM. |
| **No `data-testid` in the app** | Selectors depend on visible text, roles, or ids | The homework UI did not expose stable test hooks. The compromise is documented locators and **coupling to visible copy / language** (e.g. Hebrew button labels). **Recommendation to developers (also for an oral reflection):** add **`data-testid`** (or equivalent stable attributes) on critical controls and form fields so automation can be **fully decoupled** from wording, RTL/LTR, and cosmetic restyling—tests would target intent, not typography. |
| **Two scenarios only** | Many risks from Part 1 are not automated | Keeps the submission maintainable and demonstrably green while still covering the most critical paths. |

---

## 3) AI tools and technologies used

- **Docker Desktop** — run the Parkly container and reproduce a consistent environment.  
- **Cursor** — primary IDE for specs, POM, config, and iterative runs (`playwright test`, UI mode, headed runs).  
- **Cursor agent / project rules** — structured, QA-oriented assistance (exploration notes, selector fixes, aligning tests with real routes such as `/users/add`).  
- **Gemini (Pro)** — ad hoc technical questions where a quick second opinion helped.  
- **Claude** — longer-form drafting and structuring (e.g. narrative test plan sections); also used as a **sanity pass** on wording and logic, not as a substitute for running tests against the real app.

**Core test stack (Part 2)**  
**Playwright** + **TypeScript**, **Node** package manager, **`@playwright/test`** with Chromium / Firefox / WebKit projects as configured.

---

## 4) Reasoning behind tool choices (benefits and limits)

**Playwright**  
- **Helped:** reliable auto-wait, built-in assertions, trace/screenshot/video on failure, multi-browser projects from one config.  
- **Limits:** still need a **running app** and correct `BASE_URL`; UI mode can look empty until a run/step is selected; Hebrew/English UI requires explicit locator strategy.

**POM + dedicated locator modules**  
- **Helped:** one place to update when the homework HTML changes; clearer review for coursework.  
- **Limits:** overhead for only two tests; pays off if the suite grows or the DOM shifts. Until the product ships **`data-testid`** (or similar), locators remain somewhat tied to accessibility labels and visible text—see trade-off table above.

**Docker + fixed base URL**  
- **Helped:** repeatable Part 1/2 runs without “works on my machine” drift.  
- **Limits:** shared DB state and capacity messaging can still cause noise unless data stays unique or the environment is reset.

**AI assistants (Cursor agent, Gemini, Claude)**  
- **Helped:** faster drafting of tables and steps, quicker iteration on selector issues, and catching inconsistencies between documentation and code **when outputs were validated** against the live page.  
- **Limits:** models can **hallucinate** selectors or routes; anything touching the DOM or URLs was checked in the browser and in **passing** Playwright runs. Rules and prompts improve consistency, but they do not remove the need for **human judgement** on severity, reproduction, and what to automate.

---

// This reflection is scoped to the Pango homework work actually performed: exploration, documented defects and coverage in the test plan, and the two automated Playwright workflows with the structure described above.
