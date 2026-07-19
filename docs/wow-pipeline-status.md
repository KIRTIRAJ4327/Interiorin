# Interiorin wow pipeline status

**Locked baseline:** `7e3a42e`  
**Deadline:** July 21, 2026, 5:00 pm PT  
**Current phase:** Release candidate shipped
**Status:** Credential-free pipeline complete; Supabase cross-device and live-provider verification remain open

This is the single implementation ledger for the paired Phone Controller and Studio Wall release. Every phase records its verified commit and evidence before the next phase starts. Scope changes require an ADR under `docs/decisions/`.

| Phase | Outcome | Status | Verified commit | Gate evidence |
|---|---|---|---|---|
| 0 | Scope lock, feature flags, clean baseline | Complete | `1e0d712` | Lint; strict TypeScript; 19 files / 58 tests; optimized build; Playwright 8 passed / 4 intentional skips; secret scan clean |
| 1 | Real-device pairing transport proof | Fallback checkpoint complete | `419eb17` | Pinned Supabase + QR dependencies; migration and explicit membership RLS; hashed one-use token; authenticated create/join/recover APIs; BroadcastChannel recovery; 23 files / 65 tests; production build; Playwright 10 passed / 6 intentional skips; desktop + Pixel 7 visuals inspected; secret scan clean |
| 2 | Believable canonical room | Complete | `cfcffda` | Procedural sofa/table/storage; canonical rug/plant; placement-aware validation; three visually inspected directions; minimum/representative envelope tests; 24 files / 76 tests; lint; strict TypeScript; production build; split desktop/Pixel Playwright matrix passed with slow WebGL budgets |
| 3 | Guided phone intake and synchronized wall | Complete | `2b45955` | JPEG normalization and HEIC rejection; private Storage path; entered dimensions; provider-optional observations; retained-object confirmation; four text/push-to-talk prompts; shared canonical reducer; authenticated command API; synchronized Explore/Model wall; 26 files / 79 tests; production build; paired Playwright 3 passed / 3 intentional skips |
| 4 | Checked refinement and Decision Trace | Complete | `2e13d10` | Local-first interpretation; gated `/api/refine`; capped scene context; validated IDs/variants; deterministic receipts; phone approval/rejection; atomic revision + event RPC; sanitized wall trace; accepted/rejected/fallback no-mutation browser proof; 27 files / 81 tests; production build; paired Playwright 3 passed / 3 intentional skips |
| 5 | Exact named-version comparison | Complete | `1ad9f45` | Named canonical scenes (12-version cap); fixed-camera wall capture with camera restoration; session-only object URLs and cleanup; refresh regeneration from stored scenes; responsive two-version wall; authoritative semantic table and explicit WebGL fallback; phone comparison controls; 27 files / 82 tests; lint; strict TypeScript; production build; paired intake→save A→commit→save B→compare→refresh Playwright passed; wall and phone visuals inspected; secret scan clean |
| 6 | Selected-design architect handoff | Complete | `ebc9a3b` | Single selected saved scene; wall Review mode; print-ready concept sheet; canonical snapshot fallback; declared envelope; object/surface schedules; provenance/protection; deterministic clearance findings; committed/rejected receipts; open professional checks; mandatory concept-only boundary; matching structured JSON download; 28 files / 83 tests; lint; strict TypeScript; production build; paired selection→Review→JSON parity→print-media Playwright passed; review visual inspected; secret scan clean |
| 7 | Release verification and deploy readiness | Release complete in disclosed same-device/offline mode | `7b33fc2` | End/delete controls on phone and wall; authenticated Supabase deletion + private source removal; hourly expiry cleanup migration; README/env/Codex Session ID; unused ElevenLabs dependency and 16 transitive packages removed; npm audit 0 vulnerabilities; 28 files / 84 tests; lint; strict TypeScript; production build; repository-wide Playwright 12 passed / 8 intentional skips; production pairing/deletion + full intake/refine/compare/review/export smoke 2 passed; deployed at `https://interiorin-beta.vercel.app`; secret scan clean |

## Open gate evidence

- Production Supabase project credentials are not configured in this workspace, so anonymous Auth, private Realtime membership, Storage RLS, expiry cleanup, token reuse rejection, and real-phone cross-device recovery are implemented but not yet verified against a deployed project.
- Live OpenAI credentials plus a genuine exact-model canary response ID are not configured, so the deployed release uses the disclosed deterministic parser/fallback and does not claim a live-provider pass.
- Production therefore visibly labels same-device demo mode. The complete fallback journey is deployed and production-smoke-tested; these are external configuration gates, not hidden passes.

## Locked cuts

- ElevenLabs
- Concept rendering in the deadline hero journey
- Phone-side interactive 3D
- GLTF and network textures
- Wall art and chair assets
- Photogrammetry, accounts, collaboration, telemetry, and state-store refactors

## Every-phase gate

- Focused tests
- Full unit/integration suite
- Lint with zero warnings
- Strict TypeScript
- Production build
- Relevant desktop and mobile Playwright journeys
- Visual, keyboard, and reduced-motion inspection
- High-confidence secret scan
- Supabase/RLS verification when applicable
- Commit, push, and this ledger updated with evidence
