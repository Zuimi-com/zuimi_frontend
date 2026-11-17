# Coordination page repair and acceptance — 2026-11-17

Route: `/eco/boarddash/55019/`.

## What was broken

1. The running Docker Django image did not contain the coordination app. The actual backend logs showed 404s for work creation, work reads, creator applications and campaign analytics. The image and local containers have been updated and `coordination.0001_initial` is applied.
2. Next.js internally described a request to `127.0.0.1:3302` as `http://localhost:3302`. Comparing browser Origin directly with that internal URL rejected valid writes with 403. The admin proxy and public creator endpoints now compare against Host / X-Forwarded-Host. Foreign origins remain rejected. Campaign and session redirects also use the public host and forwarded protocol so tracking cookies stay on the same host. This follows [Next.js's documented host comparison](https://nextjs.org/docs/15/app/guides/data-security#allowed-origins-advanced); the reverse proxy must supply trusted forwarded headers.
3. Valid dependency saves failed because UUID objects in the backend revision snapshot were not JSON serializable. The API now explicitly serializes dependency IDs as strings, including audit history.
4. Parallel work/application/analytics requests could rotate and invalidate the same refresh token. The server now shares a short-lived refresh result and sets the rotated cookies on each response. Regression tests cover simultaneous requests, failed refreshes and cache expiration. The browser suite runs with production rotation and blacklisting enabled.
5. Missing API deployments were displayed as a generic save error. The workspace now identifies missing coordination endpoints and sanitizes server errors while retaining actionable validation/origin messages.

## Real browser acceptance

The checked-in `tests/coordination.e2e.cjs` ran against isolated Next.js and Django processes. Work, campaigns, applications, attribution and sessions used real HTTP requests and a separate database; no API responses were mocked. The final run used the checked-in backend QA configuration with real scoped JWT authentication and the existing login/session/refresh endpoints.

All eight checkpoints passed:

| Area | Verified behavior |
| --- | --- |
| Access | Anonymous and non-staff access rejected; staff session accepted. |
| Shared accountability | Create, edit and reload; dependency completion rules; persisted revision history; stale edits rejected without overwriting another admin. |
| MVP scope | Import ten suggestions, save acceptance, reload and retain acceptance state. |
| Planning and notes | Persist weekly goals, commitments, decisions, blockers and meeting notes. |
| CEO studio | Idea → draft post, schedule date, publication evidence validation, publish record, reusable template → post. This records work; it does not post to X. |
| Campaign links | Generate, copy, disable and reactivate an explicit tracking link. |
| Creator funnel | Submit through a tracked link, retry without duplication, review through the board and normal admin page, validate analytics, exclude HEAD/bot previews, retain first/latest attribution across two campaigns and a direct visit. |
| Recovery | Expired access refreshes through the real endpoint; foreign-origin work and creator writes are rejected. |

Additional checks: nine frontend unit tests, three session-concurrency regression tests, six existing tutorial tests, TypeScript, 18 backend tests on disposable PostgreSQL and 17 backend functional tests inside the updated Docker container. The PostgreSQL suite includes simultaneous edits: one 200 and one 409 with exactly one new audit revision.

Both the normal Turbopack production build and a webpack production build passed in isolated copies. The first attempt timed out fetching existing Google Fonts; `NODE_OPTIONS=--dns-result-order=ipv4first` resolved that environment-specific download failure. The final Turbopack build includes the concurrent-refresh correction.

## Reproduce safely

Install frontend dependencies normally (`npm ci`). These browser tests create fixture records: use an isolated API/database, not a shared working database. The backend QA configuration refuses to start unless a disposable database path is explicitly supplied. Use a separate frontend checkout/copy if your normal development server is running, since Next.js shares `.next` within a checkout.

From the backend checkout, in one terminal:

```sh
export COORDINATION_E2E_DB_PATH="$(mktemp /tmp/zuimi-coordination-e2e.XXXXXX.sqlite3)"
../venv/bin/python manage.py migrate --settings=coordination.e2e_settings
../venv/bin/python manage.py shell --settings=coordination.e2e_settings -c 'from coordination.e2e_seed import seed; seed()'
../venv/bin/python manage.py runserver 127.0.0.1:8893 --settings=coordination.e2e_settings --noreload
```

From an isolated frontend checkout/copy, start Next.js against that API:

```sh
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8893 npm run dev -- --hostname 127.0.0.1 --port 3302
```

Then run:

```sh
npm run test:coordination
npm run test:tutorials
npm run test:admin-session
ZUIMI_E2E_BASE_URL=http://127.0.0.1:3302 npm run test:coordination:e2e
```

The suite defaults to the installed Brave binary at `/opt/brave.com/brave/brave`; set `ZUIMI_BROWSER_PATH` to another Playwright-compatible Chromium binary if needed. QA accounts are fictional `coordination-admin@example.test` and `coordination-viewer@example.test`, with password `CoordinationTest123!`. They are created only by the guarded QA seeder. Alternate admin credentials can be supplied with `ZUIMI_E2E_ADMIN_EMAIL` and `ZUIMI_E2E_ADMIN_PASSWORD`. The test URL must be localhost or 127.0.0.1.

Stop QA services and remove the disposable database afterward. The session's temporary processes were stopped after validation; the user's Docker development services remain running with the repair.

## Evidence and limits

Session artifacts are `/tmp/zuimi-coordination-e2e-rotation.log`, `/tmp/zuimi-coordination-browser-results.json`, `/tmp/zuimi-coordination-e2e.png`, `/tmp/zuimi-coordination-postgres-tests.log`, `/tmp/zuimi-coordination-docker-tests.log`, and `/tmp/zuimi-coordination-production-build-ipv4.log`, and `/tmp/zuimi-coordination-turbopack-build-final.log`.

No public production deployment, real applicant outreach, X publishing, creator-account creation, rights transfer or distribution-contract execution is claimed. These are explicitly separate from the board's recorded review and publishing states. Browser checks were desktop Chromium; installed mobile devices and external platform delivery were not exercised.

Traceability: frontend `62c5857` (public-host/proxy repair), `1e2d2d8` (real-API browser regressions), `9c48f36` (concurrent refresh); backend `a087410` (dependency audit fix), `2769e62` (PostgreSQL concurrency), `e7600d4` (isolated real-auth QA setup), `9c4e211` (deployment/validation notes), `6d91aac` (production refresh settings).
