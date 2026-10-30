# Implemented Services integration

2026-10-30. API paths relative to /api/v1. Canonical backend register: sibling grandline-backend/docs/implementation/ECOSYSTEM_API.md. These interfaces exist; deployment readiness is separate.

Public: GET /capabilities; GET /service-providers/categories; GET /service-providers and /shops with q/location/category/limit/cursor; GET /service-providers/:slug and /shops/:businessSlug. Profiles have only approved public contact fields and published photos. Pages:items,nextCursor. Gate-disabled support is unavailable; network/server/schema failure is an error; ready with items[] is a genuine empty result. No live fallback to samples.

Private owner: PUT /users/me provisions identity on an explicit action; GET/POST /businesses, GET /services/applications, GET/PATCH /services/applications/:id, POST /services/applications {businessId,requestKey,draft}, POST /:id/submit {expectedVersion,mediaIds}, POST /:id/revise {expectedVersion}. Draft adapters convert price strings into whole MWK and local areas into serviceAreas[]. Staff-approved public phone requires publishPhone consent. Application DTO includes bounded private events/media and optional publication state. Saves are explicit; no automatic local draft transmission.

Photos: POST /services/applications/:id/media {filename,mimeType,sizeBytes}; PUT multipart file to returned signed upload URL without Clerk token; POST /media/:mediaId/complete; retry URL POST /media/:mediaId/upload; private GET /media/:mediaId/read; scoped DELETE /media/:mediaId. Pending slots cannot be submitted; stored metadata must match. A missing response is recovered by checking completion before another PUT. No more than8 active JPEG/PNG/WebP photos, each1–12MB.

Staff org:admin: GET /staff/services/applications?status=..., GET /:id; POST /:id/review {decision,reason,expectedVersion}; POST /:id/publish or /unpublish {reason,expectedVersion}. Approval stores a snapshot but does not publish. Private photo reads use /:id/media/:mediaId/read. Owner and staff stale mutations return409; cross-owner resources404.

Billing: GET /business-billing/:businessId/services; POST /payments {method,reference}. Staff prefix /staff/business-billing; POST /quote {amount,expectedQuoteVersion,reason}; POST /payments/:id/verify {decision,reason}. One agreed fee per business/product; category rates are never summed. References stay pending until external receipt verification. First period starts at publication; early/overdue renewals follow backend rules. Payment accounts are configured public details, never invented.

Enquiries: authenticated POST /service-providers/enquiries {listingId,requestKey,name,email,message}; committed receipt{id,status:submitted}. Contact email is the form address. Stable request keys support retries. Outbox delivery and inbox arrival are separate from a persisted enquiry receipt.

Remaining operational checks: real Clerk organization/origin/session configuration, scoped Supabase uploads, externally verified test payment, publication/discovery and external email receipt in staging. Frontend tests use isolated fixtures; they do not prove external credentials or production readiness.
