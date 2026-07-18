# Interiorin Studio vertical slice

Date: 2026-07-18  
Status: implemented and locally verified

## Product flow

1. Enter an interior or exterior project, its condition, intent, and measured envelope.
2. Generate three deterministic spatial directions that share the same entered dimensions but use materially different arrangements.
3. Inspect each direction in interactive 3D alongside its rationale, tradeoffs, source authority, and blocking review constraints.
4. Speak or type a bounded refinement. The Studio captures a transcript, compiles a typed action, and requires explicit commit before canonical scene mutation.
5. Save named factual versions, compare canonical scene differences, and export a scoped JSON review package for an architect or designer.

## Authority model

- Entered dimensions are `user_declared`; they are not treated as survey or legal-boundary facts.
- Suggested object roles and arrangements are `observed_unverified` decision-support hypotheses.
- Exterior work keeps survey, property-boundary, setback, utilities, grade, and drainage review visible and blocking.
- The 3D model renders canonical application state. It does not authorize construction or certify fit.
- Reference files are not uploaded or interpreted in this slice; only local filename, media type, and size metadata enter the project record.

## Implemented contracts

- Zod-validated project, option, and version schemas.
- Dimension-driven interior and exterior scene generation with exactly three distinct options.
- Bounded move and material-change parsing routed through the existing deterministic scene-action resolver.
- Explicit mutation commit, rejection behavior for protected objects, and action receipts.
- Validated local-storage version persistence with malformed-data recovery.
- Semantic scene comparison and downloadable `interiorin.handoff/1` JSON.
- Responsive Material Ledger Studio interface at `/studio`; original authority proof preserved at `/proof/prepared-dining-room`.

## Verification

Passed on 2026-07-18:

- `npm run lint`
- `npm run typecheck`
- `npm test` — 15 files, 39 tests
- `npm run build` — optimized Next.js production build
- `npx playwright test e2e/studio.spec.ts` — desktop and Pixel 7 Studio flow, exterior boundary contract, no horizontal overflow

The complete browser suite also retains the approved prepared-proof journeys.

## Honest remaining gaps

- No calibrated photo/video/scan reconstruction or source-image understanding.
- No direct mesh editing, collision solver for every generated option, real catalogue, cost, procurement, or code compliance.
- Browser voice transcription only; no live ElevenLabs conversational adapter in the credential-free path.
- No Nano Banana presentation render adapter.
- Browser-local persistence only; no auth, cloud sync, multiplayer editing, comments, or professional portal.
- JSON is a review handoff, not CAD/BIM, drawings, specifications, or construction documentation.

## Tooling readiness

The local Codex MCP configuration includes the authenticated `21st` endpoint. The implemented UI intentionally follows the approved Material Ledger Studio design system rather than importing a generic component preset. Provider credentials stay outside Git.
