# Interiorin wow pipeline status

**Locked baseline:** `7e3a42e`  
**Deadline:** July 21, 2026, 5:00 pm PT  
**Current phase:** 7H — production release complete in disclosed fallback mode
**Status:** Exact implementation is deployed and production-tested twice; real-device Supabase and live Nano Banana remain explicit external gates

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
| 7A | Reopen concise ElevenLabs voice and revision-linked visual Reveal | Complete | `f4eb18e` | ADR 0002 accepted; independent voice/reveal flags; demo fixture placed intentionally; 84-test baseline, lint, strict TypeScript, production build, and secret scan green |
| 7B | Real-phone and demo-room intake | Code complete; production Supabase blocked | `64dd601` | Three explicit source choices; 2048 px / 5 MB JPEG normalization; pre-decode HEIC recovery; disclosed 5.2 × 4.0 × 2.7 m demo estimate; compact editable measurements; actual request-origin QR; live Supabase fail-closed flag; desktop and Pixel paired intake proof |
| 7C–7D | Secure concise ElevenLabs voice and editable intake | Locally complete; live real-phone proof awaits Supabase | `64dd601` | Pinned React SDK; authenticated controller-only signed URL endpoint; rate limiting; consent; lazy runtime mount; independent microphone/output mute; stop and typed fallback; three schema-restricted tools; one combined question; user-owned agent configured with signed auth, patient turn-taking, 12-second timeout, zero retention; signed WebSocket canary passed |
| 7E | Revision-linked Nano Banana Reveal | Code complete; live generation blocked by Google quota | `64dd601` | Strict controlled brief compiler; direct Gemini provider adapter; authenticated revision/idempotency checks; private render bucket migration; safe events and provenance; wall Source/3D/Reveal triptych; stale state after canonical mutation; model-list canary passed; generation correctly failed with `429 RESOURCE_EXHAUSTED` and quota `0` without canonical mutation |
| 7F–7G | Voice refinement, comparison, and handoff parity | Locally complete; provider proof pending | `64dd601` | Finalized voice transcript enters the existing checked proposal flow; approval remains explicit and idempotent; Reveal provenance is presentation-only in review JSON; canonical snapshots, factual diff, receipts, review sheet, and deletion remain authoritative; 32 files / 92 tests, lint, strict TypeScript, production build, paired desktop journey green |
| 7H | UX polish and production release | Complete in disclosed same-device/provider-fallback mode | `73ff358` | Pixel 7 phone and desktop wall screenshots inspected; lazy consent-first voice mount fixed a real browser/runtime defect; 92 tests, zero-warning lint, strict TypeScript, production build, repository-wide Playwright 12 passed / 8 intentional skips, npm audit 0; exact-commit Vercel deployment Ready; deployed paired journey passed twice (2 passed / 1 intentional mobile-project skip each run) at `https://interiorin-beta.vercel.app` |

## Open gate evidence

- The Supabase CLI has no management access token, anonymous Auth is disabled, and the configured server secret is mismatched. Private membership RLS, private-channel configuration, source/render Storage policies, expiry cleanup, and recovery are implemented and reviewed against current official guidance, but cannot be applied or claimed against production yet. `NEXT_PUBLIC_ENABLE_LIVE_SUPABASE` therefore remains false.
- Live OpenAI credentials plus a genuine exact-model canary response ID are not configured, so the deployed release uses the disclosed deterministic parser/fallback and does not claim a live-provider pass.
- ElevenLabs agent configuration and signed-URL canary pass. End-to-end phone voice awaits the verified Supabase controller identity because the voice endpoint correctly fails closed in same-device mode.
- The Google API key and `gemini-3.1-flash-image` model resolve, but live image generation returns `429 RESOURCE_EXHAUSTED` with quota `0`. Billing/quota is required before Reveal can receive a live pass.
- Production therefore visibly labels same-device demo mode. The complete fallback journey is deployed and production-smoke-tested; these are external configuration gates, not hidden passes.

## Locked cuts

- Phone-side interactive 3D
- GLTF and network textures
- Wall art and chair assets
- Photogrammetry, accounts, collaboration, telemetry, and state-store refactors

## Included under ADR 0002

- Optional, concise ElevenLabs voice with typed parity and no mutation authority
- Explicit Nano Banana presentation Reveal linked to canonical revision and disclosed as unmeasured

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
