# Current state - 2026-11-06

Services consumes the versioned @grandline/ui archive for catalogue cards, grids, listing progress, and a product-specific welcome dialog. Headers use Clerk avatar controls. The listing form removes manual application-ID entry and shows maintenance before the long form while the live action is disabled.

Source was pushed to main at 455ee8a. Typecheck, production build, and focused welcome test passed; the earlier suite passed 63 tests. The public site returns HTTPS 200, but deployed version and authenticated journeys remain unverified. The live backend capability endpoint returned all Services, Mobility, and rides flags false on November 6. Real submissions require hosting activation and end-to-end verification.
