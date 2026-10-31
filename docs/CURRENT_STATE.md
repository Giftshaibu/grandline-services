# Current state — 2026-10-30

Branch: main. Active phase: backend roadmap chunk6, Services frontend integration. Independent React/TanStack Start application, Auto Hub design tokens and local components retained. No automatic integration push, deployment or production activation.

## Implemented

VITE_SERVICES_LIVE=false (default) preserves the labelled sample catalogue and memory-only application preview without API writes. With true and configured VITE_API_BASE_URL, browsing uses implemented capability/discovery/shop APIs. Disabled backend support, failed requests, invalid responses and genuine empty results stay distinct; live mode never falls back to samples. Public browsing needs no sign-in.

/list-your-business supports explicit authenticated private saves, scoped photo uploads/completion, saved application loading, contact-publication consent, review submission and starting new revisions. Refresh/exit loses unsaved edits; reset clears local state, not server records. Uploaded photos use existing8-file/12MB rules. Retry checks for an already stored object before another non-upsert PUT; the Clerk token never goes to storage.

/my-businesses lists saved applications with pagination, staff feedback, current publication link and per-business Services billing. /staff provides role-gated queues, private review photos, expected-version decisions, monthly quotes, externally checked receipt verification and separate publication/unpublication. Backend authorization remains authoritative. Account/organization changes remount private state. Service/shop detail pages submit genuine authenticated enquiries with stable request keys and show only committed receipts.

## Runtime gates and external dependencies

Backend: BUSINESS_PROFILES_ENABLED, SERVICES_APPLICATIONS_ENABLED, BUSINESS_PRODUCT_BILLING_ENABLED, SERVICES_DISCOVERY_ENABLED, configured private Supabase storage, Clerk, and applied migrations. Frontend: VITE_SERVICES_LIVE, API URL and paired Clerk public/server keys. No API keys in frontend public variables. Payment accounts/contact destinations remain explicitly configured; no fabricated accounts. Sending email requires verified Resend configuration and the running outbox.

Shop-linked vehicle/part tabs and Auto Hub associations are implemented/default-off in chunk7. Mobility/ride operations remain later chunks. Real authenticated cross-domain Clerk/Supabase/payment/email staging journeys are not claimed verified; production remains gated on concrete configuration and approval.

## Verification

Typecheck/lint/production build pass.58 unit/component tests pass, covering capability/error boundaries, normalized drafts, explicit-save behavior, upload recovery, enquiry keys, owner/staff controls and payment-gated publication. Vitest uses one fork worker after Windows thread workers stalled; no production runtime change. Full desktop/mobile run completed27 passing cases and1 intentional mobile hover skip; its Windows server teardown stalled after all cases. A clean targeted rerun against a separately managed preview passed8/8 application/access cases. Desktop/mobile screenshots were inspected. Real signed-in external-provider browser journeys remain gated.

## Working set and next action

Application UI: src/components/application-wizard.tsx, business-application.tsx, live-application-actions.tsx, auth-session.tsx; persistence: src/lib/use-saved-application.ts, business-api.ts, save-application-photos.ts, service-draft.ts. Staff/owner/billing screens: src/components/staff-applications.tsx, business-dashboard.tsx, business-billing-panel.tsx. Public gateways: src/lib/directory.ts, shops.ts, service-capabilities.ts. Tests: tests/*application*, live-services.test.ts, business-workspace.test.tsx, e2e/business-access.spec.ts plus existing browser regressions.

Next: chunk7 is in progress: connect only explicitly associated public vehicle/part inventory and preserve existing Auto Hub visibility/billing. Chunk6 source is complete and committed with verification recorded in Git. Canonical backend status: sibling grandline-backend/docs/implementation/BACKEND_INTEGRATION_PROGRESS.md. Earlier preview checkpoints and historical proposals are retained in the progress/API registers. Production demo-car cleanup remains a separate approval-controlled operation; none executed here.

## Connected shop inventory — 2026-10-31

Backend roadmap chunk7 is implemented behind default-off SHOP_INVENTORY_ENABLED, dependent on live Services discovery. Associations are explicit, ownership-checked, version-compared and audited for staff; existing inventory stays unlinked. Vehicle billing and independent sellers remain unchanged. Public shop inventory uses existing visibility rules and never replaces failed live requests with samples. Production/authenticated staging remains gated; no push or deployment.

Services/Spare parts/Vehicles tabs connect to live shop-specific APIs; configured Auto Hub URLs link individual inventory details. Typecheck, lint,58 unit/component tests and production build pass.
