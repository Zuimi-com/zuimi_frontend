# Zuimi delivery and growth workspace

This extends the existing Zuimi website and current Django admin authentication. Deploy the companion API changes in `Zuimi-com/Zuimi` first, run `python manage.py migrate`, then deploy this frontend with its existing backend URL. No new secret or separate sign-in system is required.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/eco/boarddash/55019/` | Existing staff/admin session | Accountability, four role workstreams, shared MVP scope, weekly goals, decisions, blockers, meeting notes, CEO X studio, campaigns and creator pipeline |
| `/creators/apply/` | Public | Branded creator introduction, value proposition and reviewed film application |
| `/go/<campaign-code>/` | Public | Platform-specific tracked link, redirecting to the application page |
| `/admin/creator-applications/` | Existing admin session | Creator review and source attribution in the normal admin dashboard |

The board is not linked in public navigation and has noindex metadata. The admin page validates staff identity before rendering; all underlying workspace data and review endpoints independently require staff permissions. Missing/expired sessions use the existing admin sign-in and refresh mechanism. Public application endpoints do not expose submitted records.

## Start using the workspace

1. Sign in to Zuimi through `/admin-login`, then bookmark `/eco/boarddash/55019/`.
2. Add tasks for the CEO, designer, CTO and product/project manager, with the actual person's name, deadline and next action. Add prerequisites to connect workstreams.
3. Review and optionally import the suggested MVP acceptance checklist. Suggestions start as planned; no completion is inferred from repository code.
4. Add weekly goals and explicit commitments using the Monday week selector. Log blockers, decisions and meeting notes with owners and follow-ups.
5. In CEO · X studio, capture ideas, write posts, plan dates and reuse/edit templates. Publish on X manually; then record the live post URL and actual Lagos publication time. The consistency view uses a visible target of three posts per week.
6. In Campaign links, generate separate placement links for X, Instagram, WhatsApp, email and other channels. Copy the explicit link for that placement into the post or bio. Distinguish an X bio from an X post by creating different named campaigns.
7. Review creator applications, preserve internal follow-up notes and update review status. Staff can also reach this pipeline through Creator Applications in the existing admin sidebar.

## Attribution

An application submission counts as a conversion. The dashboard shows raw clicks, unique visitors, application counts and converting visitors per link. Conversion percentage is unique converting visitors divided by unique visitors. Multiple film applications from one visitor do not inflate that percentage. Duplicate email + film applications are idempotent.

First and latest source tokens use HttpOnly, first-party cookies and a 30-day attribution window. The latest tracked campaign gets conversion credit; the first introduction is retained on each application. Direct loads do not overwrite a campaign. Known preview crawlers, HEAD requests and prefetched links do not count. A copied or forwarded link retains its original campaign source. Opening your own generated link affects metrics; use a fresh browser profile for rollout testing.

No automatic X publishing, outbound applicant emails, creator account provisioning, film uploads or distribution contract execution are included. Approval is an admin review state, not a signed agreement. All shared work and creator records persist in the backend database, not browser localStorage.

## Validation

- `npx tsc --noEmit`
- `npm run test:coordination` (nine date, dependency, API and public-host checks)
- `npm run test:admin-session` (three concurrent refresh/session checks)
- `npm run test:tutorials` (six existing admin checks)
- `npm run test:coordination:e2e` against an isolated API/database (eight real-browser checkpoints)

The coordination creation/dependency/proxy defects and local Docker deployment are repaired. Browser acceptance now covers all board sections, campaign tracking, creator submission/review and session refresh. See [the reproducible setup and verification report](coordination-verification.md) for exact coverage, build evidence and deployment limits. Existing data was preserved; all acceptance records were created in a disposable QA database.
