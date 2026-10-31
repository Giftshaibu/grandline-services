# Frontend progress

## Ecosystem backend checkpoint — 2026-10-31

Backend roadmap chunks 9–11 now provide the independent Mobility frontend integration and private bike/taxi request/quote/assignment journey. Services deployment flags are unchanged. A proven shared restored-draft privacy issue was fixed in the owning saved-application hook: scope exit clears lifted private fields before paint, late responses cannot restore them, and StrictMode replay does not discard a newly mounted form.60 unit/component tests plus a focused2/2 privacy rerun, typecheck/lint/build pass. Shared publication responses also add stored kind for reliable Mobility links. Rollback restores the previous deployment while preserving server records. Canonical status remains in sibling grandline-backend/docs/implementation/BACKEND_INTEGRATION_PROGRESS.md; notifications/rollout are chunks12–13. Focused fix commit recorded in Git history; no automatic push or activation.

Updated 2026-10-28. Acceptance follows the approved frontend-first plan. Frontend complete does not mean live data or enquiries are enabled. Every absent backend operation remains blocked; see docs/api/PROPOSED_CONTRACTS.md.

| Chunk | Objective | Dependencies | Status | Acceptance/checks | Commit |
|---|---|---|---|---|---|
| 0.1 | Discovery | Existing runtime/handoffs | Complete | Source inspection | 5938fa5 |
| 0.2 | Contract register | 0.1 | Complete | Schema and adapter tests | 97b5361 |
| 1.1 | Independent foundation | 0.1, 0.2 | Complete | Production build, typecheck, lint | 91f210f |
| 1.3 | Test foundation | 1.1 | Complete | 24 unit/component + 10 desktop/mobile browser tests | 5d695da |
| 2.1 | Discovery and URL filters | 1.1, 0.2 | Frontend complete | URL round trips, mobile/desktop, keyboard and SSR | 76d847a |
| 2.2 | Detail and enquiry presentation | 2.1 | Frontend complete | Unavailable profiles; enquiries disabled | a7d1922 |
| 2.3 | Live API integration | Missing shared backend endpoints | Blocked | Typed adapter/schema tests pass; production gateway unavailable | 5e827f2 |
| 4.1 | Configured ecosystem navigation | Independent shells | Complete | Blank destinations hidden; Hub checks passed | Hub 4b04c1d |
| 4.2 | Live identity and authenticated regression | Approved Clerk origins/keys and backend | Blocked | Guest browser tests pass; signed-in production checks outstanding | 30ddd8a |
| 5.1 | Deployment handoff | Build/test foundation | Complete | Independent builds and instructions; no deployment | See final documentation commit |

## Rollback and release boundaries

Each chunk rolls back through a normal Git revert or previous Vercel deployment. No migrations or cross-repository source imports belong to either new frontend. Preserve the proposed-contract gate when reverting UI. Unit fixtures stay in tests; no production providers or simulated successful enquiries are supplied. CI configuration is committed but remote CI has not run because nothing was pushed.

The local Playwright runs exercised built Nitro previews: all 10 desktop/mobile tests passed per app. Windows preview processes needed explicit shutdown after browser workers finished; for repeat local runs, start `npm run preview` separately and let Playwright reuse it, then stop it yourself. Linux CI manages its own preview.

Auto Hub typecheck/build passed; lint has six existing fast-refresh warnings and no errors. Real catalogue/seller/staff/auth smoke tests require working backend and Clerk configuration. Cross-domain identity and production publication remain unverified.

## Production demo cleanup

Backend tooling is complete in commits 5caa4cb, 9e89770, 816290e and 07dfb45. Full backend unit/API suite: 119 passed; typecheck/build passed. Exact six seed IDs only, identity/dependency blockers, default dry-run, digest recheck, serializable apply and backup are implemented. The disposable PostgreSQL rollback/restore integration scenario and CI are prepared but were not executed locally because the Docker daemon is unavailable.

Production inventory, backup and deletion remain blocked by missing server-side credentials. No production connection or data change occurred. Follow ../grandline-backend/DEMO_CATALOGUE_CLEANUP.md, run the disposable database rehearsal, produce the exact affected-record preview/backup and obtain approval before deletion. Preserve reservations and linked submissions. No automatic push or deployment.

## Marketplace design and connected shops — 2026-10-28

Objective: match Auto Hub marketplace composition and introduce connected shop/heavy-duty/bike journeys. Dependencies: existing independent foundations; no backend implementation. Acceptance: responsive search/header/footer, real category links, image-led heroes, disabled unsupported journeys, no fabricated listings or inspection promises. Shared shop identity is proposed; spare-part links use only configured Hub /parts.

Checks: typecheck/lint/build, domain/component tests, desktop/mobile browser search, menus, filters and unavailable states. Final results are recorded in CURRENT_STATE.md. Rollback: revert the focused marketplace commits or redeploy the prior artifact. Commits: see Git history for feat(marketplace), test(marketplace) and docs(marketplace). Production activation remains blocked by backend operations and approved configuration.

Marketplace acceptance complete: source d668dcc/6b870d9, photos fe784f7, tests 8eebf37. Typecheck/lint/build passed; 28 unit/component and 16 desktop/mobile browser tests passed. Preview port 4301 avoids the Windows reserved range. Backend integration and production identity remain blocked.

## Hover menus and user-approved sample catalogue — 2026-10-28

Objective: fix desktop hover/chevron alignment and allow catalogue browsing rather than an unavailable-only page. Dependencies: existing local catalogue presenters; no backend. User explicitly requested placeholder directory content, superseding the earlier empty-directory-only presentation. Acceptance: filter/sort labelled samples, open sample details, preserve disabled enquiries and isolate records from real gateways/database. Source 8ec45ca, tests cb2aa41. Typecheck/lint/build and 30 unit/component tests pass; 19 browser tests pass, with the desktop-only hover check skipped on mobile. Rollback: normal revert of the catalogue commits or previous deployment. Production backend support remains blocked.

## Listing application flows — 2026-10-29

Objective: public business-prepared applications through review, with real submission blocked. Dependencies: existing local shell, categories, optional Clerk configuration and media rules from Auto Hub. Acceptance: six validated steps, conditional offerings, optional local photos, contact/review/edit/reset, informational fees, visible listing entry points and no network/persistence/publication.

Source 556cfe2; tests f34e8b0; privacy fix e542fda; final page-exit test and documentation commits follow in Git history. Typecheck/lint/build pass; 37 unit/component tests pass. Full browser baseline: 23 passed, one mobile hover-only skip. Final affected application/keyboard/page-exit checks: 8 passed. No-JavaScript controls are disabled. No draft enters the sample catalogue or backend.

Business applications supersede staff-created-only profiles; staff approval and backend authorization remain future requirements. Rollback: revert these application feature commits or redeploy the prior independent frontend. No migration or database rollback is required. Real submissions, uploads, owner status, staff moderation and publication remain blocked pending the proposed shared-backend contracts. No automatic push or deployment.

## Backend roadmap update — 2026-10-29

Canonical backend register: sibling grandline-backend/docs/implementation/BACKEND_INTEGRATION_PROGRESS.md and ECOSYSTEM_API.md (documentation references only, no source imports). Shared business ownership and Services draft/media/submission APIs are implemented behind default-off server capabilities. Frontend adapters remain unchanged and unavailable. Services moderation and business-product billing core are now implemented/default-off; publication and enquiries are next dependencies; Mobility and ride requests remain blocked. No frontend local preview has become a live submission. Both repositories will update contracts/handoffs when chunk 6/9 activates actual adapters.

## Backend roadmap chunk6 — 2026-10-30

Objective: connect Services to the implemented business/application/media/review/billing/publication/discovery/enquiry APIs. Dependencies: backend chunks1–5, Clerk identity, private media storage, configured API origin and independent gates. Acceptance: explicit owner saves, genuine uploads/receipts, status/feedback, separate staff approval/payment/publication, live empty/error states, no sample fallback. Code complete behind VITE_SERVICES_LIVE=false by default. Source working set is recorded in CURRENT_STATE.md.

Checks:53 unit/component tests, typecheck/lint and production build pass. Full desktop/mobile run completed27 passing cases plus1 intended mobile hover skip; Windows server teardown then stalled. Clean targeted browser rerun8/8 passed using a separately managed preview, and screenshots were inspected. Backend PostgreSQL publication/enquiry suite5/5 passes, including authorized publication status. External Clerk/Supabase/payment/email end-to-end staging remains blocked by configuration/access and is not simulated. Test fixtures remain isolated; no production authorization bypass.

Rollback: set VITE_SERVICES_LIVE=false and restore the previous frontend deployment; disable the affected backend gates while preserving application/publication/billing history. Commit recorded in Git history with the final verification handoff. No integration push or deployment authorized automatically. Only the two earlier production migration hotfixes were pushed at the user's explicit request.

## Backend roadmap chunk7 — 2026-10-31

Live shop Services/Spare parts/Vehicles tabs use capability-gated public catalogue APIs with real counts, cursor pagination, explicit empty/error/unavailable states and configured Auto Hub detail links.58 unit/component tests, typecheck/lint/build pass. Backend52 integration tests passed with1 separate cleanup skip. External authenticated staging remains gated. Rollback disables inventory capability and restores prior frontend; retain associations/history. Commit recorded in Git history; no push/deploy.
