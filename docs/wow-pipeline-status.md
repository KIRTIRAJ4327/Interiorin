# Interiorin wow pipeline status

**Locked baseline:** `7e3a42e`  
**Deadline:** July 21, 2026, 5:00 pm PT  
**Current phase:** Phase 2 — believable canonical room
**Status:** Phase 1 fallback checkpoint complete; production Supabase verification remains open

This is the single implementation ledger for the paired Phone Controller and Studio Wall release. Every phase records its verified commit and evidence before the next phase starts. Scope changes require an ADR under `docs/decisions/`.

| Phase | Outcome | Status | Verified commit | Gate evidence |
|---|---|---|---|---|
| 0 | Scope lock, feature flags, clean baseline | Complete | `1e0d712` | Lint; strict TypeScript; 19 files / 58 tests; optimized build; Playwright 8 passed / 4 intentional skips; secret scan clean |
| 1 | Real-device pairing transport proof | Fallback checkpoint complete | Phase 1 checkpoint | Pinned Supabase + QR dependencies; migration and explicit membership RLS; hashed one-use token; authenticated create/join/recover APIs; BroadcastChannel recovery; 23 files / 65 tests; production build; Playwright 10 passed / 6 intentional skips; desktop + Pixel 7 visuals inspected; secret scan clean |
| 2 | Believable canonical room | Pending | — | — |
| 3 | Guided phone intake and synchronized wall | Pending | — | — |
| 4 | Checked refinement and Decision Trace | Pending | — | — |
| 5 | Exact named-version comparison | Pending | — | — |
| 6 | Selected-design architect handoff | Pending | — | — |
| 7 | Release verification and deploy readiness | Pending | — | — |

## Open gate evidence

- Production Supabase project credentials are not configured in this workspace, so anonymous Auth, private Realtime membership, Storage RLS, token reuse rejection, and real-phone cross-device recovery are implemented but not yet verified against a deployed project.
- The product therefore activates and visibly labels same-device demo mode. This is a configuration dependency, not a claimed cloud pass; Phase 2 proceeds without coupling canonical room work to the external project.

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
