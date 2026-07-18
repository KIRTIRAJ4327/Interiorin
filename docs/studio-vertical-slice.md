# Interiorin Studio vertical slice

Date: 2026-07-18  
Status: implemented and locally verified

## Product flow

1. Enter an interior or exterior project, its condition, intent, measured envelope, and optional image/PDF source.
2. When Gemini is configured, analyze visible openings, retained objects, natural light, and style cues without inferring metric dimensions. Provider absence is disclosed and generation continues from entered facts.
3. Generate three deterministic spatial directions that share the same entered dimensions but use materially different arrangements and analyzed visible evidence where available.
4. Inspect each direction in interactive 3D alongside its rationale, tradeoffs, source authority, blocking review constraints, and deterministic footprint status. Select modeled objects directly to nudge them by 100 mm or rotate them by 15° through the checked action boundary.
5. Speak or type a bounded move, material, object-protection, lighting, or undo refinement. The Studio captures a transcript, compiles a typed action, validates spatial impact, and requires explicit commit before canonical scene mutation.
6. Optionally generate a Nano Banana presentation concept from the source photo and current canonical option. It is visibly labelled as an unmeasured derivative and cannot mutate the scene.
7. Save named factual versions, compare canonical scene differences, and export a scoped JSON review package for an architect or designer.

## Authority model

- Entered dimensions are `user_declared`; they are not treated as survey or legal-boundary facts.
- Suggested object roles and arrangements are `observed_unverified` decision-support hypotheses.
- Exterior work keeps survey, property-boundary, setback, utilities, grade, and drainage review visible and blocking.
- The 3D model renders canonical application state. It does not authorize construction or certify fit.
- Reference files are sent only to the private server route on explicit generation. Gemini visual observations remain `observed_unverified`, carry confidence, and never become metric authority.
- Nano Banana receives the source image and a bounded canonical option brief only after the user explicitly requests an in-space concept. The returned image is a presentation derivative, not scene state.

## Implemented contracts

- Zod-validated project, option, and version schemas.
- Zod-validated visual-analysis and presentation-render envelopes with provider-unavailable and malformed-response handling.
- Dimension-driven interior and exterior scene generation with exactly three distinct options.
- Bounded move and material-change parsing routed through the existing deterministic scene-action resolver.
- Explicit mutation commit, rejection behavior for protected objects, and action receipts.
- Rotation-aware full-footprint envelope and pairwise overlap checks plus measured clearance review. Newly introduced blockers reject the mutation and remain visible in the receipt.
- Accessible direct 3D object selection, protected-state disclosure, 100 mm directional nudges, and 15° rotation controls. Direct changes share canonical history, receipts, validation, versions, comparison, and handoff with voice/text changes.
- Reversible canonical history for the last 20 accepted refinements, with typed undo through the same review/commit interaction.
- Validated local-storage version persistence with malformed-data recovery.
- Semantic scene comparison and downloadable `interiorin.handoff/1` JSON.
- Responsive Material Ledger Studio interface at `/studio`; original authority proof preserved at `/proof/prepared-dining-room`.

## Verification

Passed on 2026-07-18:

- `npm run lint`
- `npm run typecheck`
- `npm test` — 19 files, 58 tests
- `npm run build` — optimized Next.js production build
- `npx playwright test e2e/studio.spec.ts` — desktop and Pixel 7 Studio flow, exterior boundary contract, analyzed-source contract, Nano Banana presentation boundary, and no horizontal overflow
- `npm run test:e2e` — 8 passed across Studio and authority-proof journeys; 4 intentional skips for single-browser-only fallback/provider/validation contracts

The complete browser suite also retains the approved prepared-proof journeys.

## Honest remaining gaps

- No calibrated multi-view photo/video/scan reconstruction. Single-source understanding is semantic and non-metric.
- No freeform mesh dragging, arbitrary-angle polygon intersection, real product catalogue, cost, procurement, or code compliance. Current validation uses rotation-aware axis-aligned bounding footprints.
- Browser voice transcription only; no live ElevenLabs conversational adapter in the credential-free path.
- Nano Banana rendering requires a configured server key and is not exercised against a paid live provider in repository tests; deterministic contract fixtures cover its UI boundary.
- Browser-local persistence only; no auth, cloud sync, multiplayer editing, comments, or professional portal.
- JSON is a review handoff, not CAD/BIM, drawings, specifications, or construction documentation.

## Tooling readiness

The local Codex MCP configuration includes the authenticated `21st` endpoint. The implemented UI intentionally follows the approved Material Ledger Studio design system rather than importing a generic component preset. Provider credentials stay outside Git. The Gemini adapters use `gemini-3.5-flash` for source analysis and `gemini-3.1-flash-image` (Nano Banana 2) for presentation rendering by default; both are server-configurable.
