# Current state — 2026-10-28

Branch: main. Marketplace checkpoint: d668dcc (shell), 6b870d9 (shops), fe784f7 (local photos), 8eebf37 (tests), followed by documentation.

## Implemented

Services now follows Auto Hub marketplace composition: logo/search/account header, category dropdowns, native mobile menu, product-specific footer, local image-led home/browsing heroes and category cards. /shops and /shops/$slug present a unified business with Services and Spare parts sections. Parts links use configured Auto Hub /parts only; individual sellers remain supported. Unconfigured ecosystem destinations are hidden.

## Integration limits

Shop/category/provider data, enquiries, shop-linked parts and ownership management remain blocked by absent backend contracts. Production gateways deliberately return unavailable; no mock shops, fake counts or successful submissions. Staff creates/assigns shops in the proposed future workflow. No new backend models/APIs, payments, onboarding or database changes. Live Clerk/session checks still require approved configuration.

## Verification

Typecheck, lint and Vercel build passed. All 28 unit/component tests and 16 desktop/mobile Chromium tests passed. Verified search URL reloads, category menus, dialog keyboard behavior, mobile overflow, shop sections, parts links, disabled enquiries and no hypothetical API calls. Desktop/mobile screenshots were reviewed. Initial concurrent unit runs had worker startup timeouts; serial reruns passed. External-image waits were removed by bundling photos locally. Windows excludes the old preview ports; use http://127.0.0.1:4301. Remote CI was not run.

## Continue here

Relevant files: src/components/shell.tsx, marketplace-hero.tsx, shop-profile.tsx; src/routes/shops*; src/lib/contracts.ts, shops.ts, marketplace.ts; tests/shops.test.tsx; e2e/marketplace.spec.ts. routeTree.gen.ts is generated and ignored. Read docs/api/PROPOSED_CONTRACTS.md and docs/DEPLOYMENT.md before enabling integration. Revert the relevant focused commits or redeploy a previous artifact to roll back. No push or deployment performed. Production demo cleanup remains separate and unexecuted.
