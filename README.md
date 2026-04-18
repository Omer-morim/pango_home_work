# Pango — Playwright automation (Part 2)

## Why these two scenarios?

1. **Parking lifecycle (`tests/parking-lifecycle.spec.ts`)** — This is the **core business flow**: authenticate, create an active session, end it, and prove **History** reflects reality. If this breaks, the product’s primary value is compromised.

2. **User provisioning + re-login (`tests/user-create-login.spec.ts`)** — Validates **identity lifecycle** as an admin (create user) and proves the new identity can authenticate. This catches broken user persistence, weak password handling, or session issues across logout/login.

Both map directly to the **test plan** priorities (trust + operational correctness) and use **Page Object Model (POM)** for maintainability.

## Prerequisites

- Docker app running at **`http://localhost:5000/`** (or set `BASE_URL`).
- Default admin credentials (override with env vars if different):
  - `ADMIN_USER` (default `admin`)
  - `ADMIN_PASSWORD` (default `password`)

## Install & run

```bash
npm install
npx playwright install
npm test
```

Run a single spec:

```bash
npx playwright test tests/parking-lifecycle.spec.ts
npx playwright test tests/user-create-login.spec.ts
```

Headed / UI mode:

```bash
npm run test:headed
npm run test:ui
```

## Configuration

| Item | Location |
|------|-----------|
| Base URL + route paths | `tests/config/endpoints.ts` |
| Locators per page (edit if DOM changes) | e.g. `tests/pages/login/login.locators.ts` (one file per screen) |
| Credentials | `tests/config/credentials.ts` + env vars |

Some locator `name` regexes include **Hebrew alternates** alongside English because the the application UI is partially localized to Hebrew.

## Stability choices

- **No `waitForTimeout`**: rely on Playwright **auto-wait** + `expect` web-first assertions.
- **Deterministic test data**: unique `plate` / `slot` / username per run (timestamp-based).
- **Navigation assertions**: `waitForURL` after nav links; `login()` asserts leaving `/login`; History uses **exact** `getByText` for the plate.
- **Artifacts**: trace + screenshot + video on failure (see `playwright.config.ts`).

## More documentation

See **`tests.md`** for selector placeholders, manual video references, and troubleshooting.
