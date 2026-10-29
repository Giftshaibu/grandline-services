# Proposed contracts — NOT implemented

Status: Blocked. These interfaces are a frontend proposal, not existing server routes. The UI uses a disabled adapter and sends no directory requests. Backend approval and implementation are required before enabling it. The source schema is src/lib/contracts.ts; no backend implementation is included.

| Proposed operation | Request | Response | Auth |
|---|---|---|---|
| GET /api/v1/service-providers/categories | none | array of slug/name | Public |
| GET /api/v1/service-providers | q, location, category, cursor, limit (default 20, max 50) | items and opaque nextCursor/null | Public |
| GET /api/v1/service-providers/:slug | slug | Entry or 404 | Public |
| POST /api/v1/service-providers/enquiries | listingId UUID, name (1–120), email (valid, max 254), message (10–2000) | id UUID, status=submitted | Bearer Clerk session token |

Search strings are trimmed and limited (q/location 120, category 80). Empty criteria are omitted; URLs round-trip criteria. Proposed results sort stably by backend relevance then ID; cursor ownership and validation remain backend concerns. No client-side filtering of partial result pages. No ratings or verification claims in this proposal. Images and external links allow HTTP(S) only.

Provider entries include identity, name, description, location, service area, categories, images, optional vehicle makes/hours, and optional phone/WhatsApp.

Failures: 400 invalid criteria, 401 sign-in required, 403 unauthorized, 404 detail absent, 409 duplicate/conflicting enquiry, 429 throttling, 5xx unavailable. Map network errors and malformed data separately from successful empty lists. Abort stale requests. Never treat an error response as an empty directory or a successful enquiry.

Implementation blockers: category/search/detail/enquiry routes; persistence and indexes; provider publication/moderation; enquiry ownership, audit, rate limiting and deduplication; Clerk authorized parties and production CORS. No dates, routes, cargo or passenger requirements in enquiry v1; add only after a backend contract is approved.

Activation: implement and validate server routes, add real integration tests, then replace the explicitly disabled adapter in a dedicated reviewed commit. There is no environment switch that silently enables proposed endpoints.

## Marketplace extension — proposed, blocked

No operations in this section exist in the shared backend. No frontend HTTP calls are made to these routes.

### Unified shops

One stable shop UUID/slug identifies a staff-managed business across Services and Auto Hub. Proposed shop category/list/detail operations support normalized q/location/category and cursor pagination consistent with the directory contract. Shop detail carries supplied description, location, contact, images and an array of services (name, category, optional description). Missing optional fields are omitted.

Businesses will apply for profiles and services; staff reviews applications, assigns ownership and controls publication. Owner management requires backend authorization and existing parts moderation, never frontend role checks alone. Public responses exclude private ownership/contact records. A part listing may have a nullable shopId; independent sellers remain valid. Shop assignment must be authorized and public inventory includes only published parts. Shop-filtered parts discovery is proposed; until implemented, UI links only to configured Auto Hub /parts, explicitly labelled all spare parts. No shop filter or inventory count is invented.

### Local catalogue samples

The user subsequently approved a placeholder catalogue for browsing. Its records are frontend-only, explicitly marked samples and not API fixtures/responses, published stock or business identities. No contract implementation is implied by cards, sample rates or sample detail routes. Live creation, enquiry, inventory and shop ownership remain blocked.

## Listing applications — frontend implemented, backend blocked (2026-10-29)

Public application entry: /list-your-business. Applications are anonymous local drafts through review only. They are not submitted, uploaded, saved to an account, added to sample cards or published. Draft state and File objects live in component memory and disappear when the route is left or refreshed. Photos have local object URLs that are revoked on change/unmount.

| Proposed operation — absent | Intended capability | Authorization before activation |
|---|---|---|
| POST /api/v1/service-provider-applications | Validate and submit one application for staff review | Authenticated owner; server derives identity |
| POST /api/v1/service-provider-applications/:id/media | Issue/complete a scoped media upload associated with this application | Owner or authorized staff; enforce ownership, image limits and storage policy |
| GET /api/v1/me/service-provider-applications | Owner application list and review status | Authenticated owner only |
| GET /api/v1/me/service-provider-applications/:id | Owner application and staff feedback | Owner only; no public contact/payment data |
| GET /api/v1/staff/service-provider-applications | Moderation queue and application detail | Existing staff organization/role policy, enforced server-side |
| POST /api/v1/staff/service-provider-applications/:id/review | Record approval, rejection or requested changes | Staff only, with auditable reason and explicit publication decision |

These are proposed names, not implemented server routes. No frontend adapter calls them. UI-controlled numeric strings and local service row IDs are not a wire payload. Agree normalized DTOs, owner edit/resubmission rules, idempotency, moderation states, publication rules, indexes and media retention in the backend implementation before enabling submission. Do not reuse vehicle-sale submissions or private billing logic by silently changing their contracts. Real submission must require Clerk authentication, server validation and staff review; a local review is not approval.

One application describes a physical shop or independent/mobile provider with name, description, base location, service areas, contact details, optional photos and multiple category/description/optional advertised whole-MWK-price offerings. The frontend caps offerings at 20 for usability; this does not establish a server limit. Staff-created-only shop entry is superseded by business applications plus staff approval. Separate spare-part listings may link to the approved business in a future authorized backend association; the current configured link opens Auto Hub /sell/part only.

Fee guidance includes auto shops at MK50,000 and the supplied category rates (mechanics/electrical/diagnostics/AC MK20,000; garages/body/tyres/batteries MK50,000). Repeated categories are not repeated in the guide. No aggregate or payable quote is calculated, and advertised service prices are distinct from monthly fees.
