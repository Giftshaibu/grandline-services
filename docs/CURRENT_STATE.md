# Current state — 2026-10-28

Branch: main. Marketplace checkpoint: d668dcc (shell), 6b870d9 (shops), fe784f7 (local photos), 8eebf37 (tests), followed by documentation.

## Implemented

Services now follows Auto Hub marketplace composition: logo/search/account header, category dropdowns, native mobile menu, product-specific footer, local image-led home/browsing heroes and category cards. /shops and /shops/$slug present a unified business with Services and Spare parts sections. Parts links use configured Auto Hub /parts only; individual sellers remain supported. Unconfigured ecosystem destinations are hidden.

## Integration limits

Shop/category/provider data, enquiries, shop-linked parts and ownership management remain blocked by absent backend contracts. Production gateways deliberately return unavailable; no mock shops, fake counts or successful submissions. Staff creates/assigns shops in the proposed future workflow. No new backend models/APIs, payments, onboarding or database changes. Live Clerk/session checks still require approved configuration.

## Verification

Latest catalogue release: typecheck, lint and production build passed. All 30 unit/component tests passed; 19 desktop/mobile browser tests passed with one mobile hover-only test intentionally skipped. Browser checks cover hover opening/closing, keyboard Escape, label/chevron vertical alignment, filtered sample grids, sample detail navigation, disabled enquiries and no hypothetical API calls. Existing search, menu and pickup checks remain green. Desktop sample catalogue and mobile layouts were reviewed. Previews use port 4301. No remote CI or production deployment.

## Continue here

Relevant files: src/components/shell.tsx, marketplace-hero.tsx, shop-profile.tsx; src/routes/shops*; src/lib/contracts.ts, shops.ts, marketplace.ts; tests/shops.test.tsx; e2e/marketplace.spec.ts. routeTree.gen.ts is generated and ignored. Read docs/api/PROPOSED_CONTRACTS.md and docs/DEPLOYMENT.md before enabling integration. Revert the relevant focused commits or redeploy a previous artifact to roll back. No push or deployment performed. Production demo cleanup remains separate and unexecuted.

## User-requested sample catalogue and hover correction

Source 8ec45ca; tests cb2aa41. The user requested a browsable placeholder catalogue after the design-only release. Local samples are therefore an explicit change to the earlier no-sample UI, separate from test fixtures and real directory gateways. Records use Example names, sample- slugs, illustrative media, no real contacts and clear sample labels on grids/details. Filters and sorting work locally. Sample details are noindex/nofollow; they cannot be booked or enquired about. No database seed, API response, account or production listing was changed.

Header labels and SVG chevrons share a flex center line. Desktop pointer hover opens menus, moving away closes them unless keyboard focus is inside, and native click/Enter/Escape remain supported. No push performed.
