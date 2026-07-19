# Interiorin

Interiorin is a paired, evidence-aware spatial design studio for interior concepts. A phone captures the homeowner’s room and intent; a laptop Studio Wall presents three canonical 3D directions, shows a transparent Decision Trace for every refinement, compares named versions, and exports one selected architect concept-review package.

**Authority line:** AI interprets intent. Interiorin’s typed schemas, entered dimensions, deterministic spatial checks, and explicit user approval control every canonical mutation.

This is concept decision support. It is not a survey, field measurement, code review, architectural drawing set, engineering, permit package, procurement verification, or construction documentation.

## Locked hackathon journey

1. Open `/wall` on the laptop and create a session.
2. Scan the QR code with the phone, or use the disclosed same-device controller link.
3. Use the disclosed demo room, capture a room, or choose one from the gallery. Confirm the editable dimensions, then answer the concise guided prompt by ElevenLabs voice or text.
4. Confirm retained objects. Photo analysis may suggest visible cues; entered dimensions remain the only metric authority.
5. Review three deterministic furnished directions on the Studio Wall and select one from the phone.
6. Speak or type a refinement. The wall displays the sanitized Decision Trace, typed proposal, identifier/protection/envelope/overlap/clearance checks, and disclosed provider mode.
7. Approve or reject on the phone. Accepted changes commit exactly once and produce a receipt.
8. Save two named canonical versions, compare exact wall views plus the authoritative factual diff, and recover the comparison after refresh.
9. Explicitly request a Nano Banana Reveal to see the current checked direction in the source photograph. It is a revision-linked visual hypothesis, never measured geometry.
10. Select one version for architect review, print/save the concept sheet, and download matching structured JSON.
11. End and delete the session from either surface.

The phone intentionally has no interactive 3D canvas. It is the private input and approval surface; the laptop owns the high-quality public canvas.

## Routes

- `/wall` — create the laptop Studio Wall session
- `/wall/[sessionId]` — Explore, Model, Compare, Review, and Decision Trace
- `/control/[sessionId]` — mobile-first Space, Brief, Options, Refine, and Approve controller
- `/studio` — combined single-surface fallback and the earlier interior/exterior workbench
- `/proof/prepared-dining-room` — deeper deterministic authority proof

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open <http://localhost:3000/wall>. With no Supabase credentials, Interiorin automatically uses and visibly labels **same-device demo mode**. Open the generated controller URL in a second window on the same browser origin.

## Real-device Supabase pairing

Set these deployment/local secrets:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
SESSION_TOKEN_PEPPER=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ENABLE_LIVE_SUPABASE=true
```

Apply the tracked migrations in `supabase/migrations/`. They create session/member/event tables, explicit membership RLS, private Realtime authorization, the private `studio-sources` bucket, atomic revision/idempotency commits, and hourly expiry cleanup. The publishable key is browser-safe; `SUPABASE_SECRET_KEY`, token pepper, provider keys, and canary IDs are server-only.

Production Supabase Auth, private-channel RLS, Storage RLS, cleanup, and physical phone pairing are implemented but **not yet claimed as verified** because this workspace has no Supabase project credentials. Same-device mode remains the tested emergency demo path.

Do not set `NEXT_PUBLIC_ENABLE_LIVE_SUPABASE=true` until anonymous Auth is enabled and the tracked migrations, private-channel restriction, Storage policies, token reuse, controller exclusivity, recovery, and deletion have passed against that exact project. The flag intentionally fails closed to same-device mode.

## Optional ElevenLabs voice

Voice is concise, consent-first, and optional. The ElevenLabs runtime is lazy-mounted only after the homeowner accepts the disclosure and requests voice; typed completion always remains available. The signed WebSocket URL is issued by an authenticated controller-only endpoint, and the API key never reaches the browser.

```text
NEXT_PUBLIC_ENABLE_VOICE_GUIDE=true
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
```

Configure the user-owned agent and run the signed-URL canary with:

```bash
npm run configure:elevenlabs
```

The three registered tools can only record an editable brief, submit a finalized refinement transcript into Interiorin's checked proposal flow, or read a display-safe summary. They cannot approve, mutate, save, export, delete, or generate images.

## Optional Nano Banana Reveal

The paired Reveal uses the server-side Google Gemini API through a provider adapter and the exact `gemini-3.1-flash-image` model. A trusted `VisualDesignBrief` is compiled from entered dimensions, confirmed intent, the selected canonical direction, accepted changes, and preservation constraints; raw voice text is never forwarded directly.

```text
NEXT_PUBLIC_ENABLE_VISUAL_REVEAL=true
GOOGLE_GENERATIVE_AI_API_KEY=
GOOGLE_IMAGE_MODEL=gemini-3.1-flash-image
```

Run a real source-image canary before enabling the production claim:

```bash
npm run canary:reveal -- public/demo/livingroom.jpg
```

The current key resolves the model, but Google returns `429 RESOURCE_EXHAUSTED` with image quota `0`; enable billing/quota before calling this gate live. Failure never mutates or blocks canonical 3D. Generated bytes remain in private `studio-renders`; Realtime receives display-safe metadata only.

## Optional live refinement provider

The deterministic parser runs first. Only an unresolved request may call `/api/refine`. Live mode requires all three gates:

```text
OPENAI_API_KEY=
ENABLE_LIVE_OPENAI=true
OPENAI_CANARY_RESPONSE_ID=<genuine response ID from the exact configured model>
```

The required model is exactly `gpt-5.6-terra`. Missing, aliased, timed-out, malformed, or unverified provider behavior returns a disclosed deterministic clarification and never mutates the scene. The Decision Trace never exposes chain-of-thought, system/developer prompts, credentials, or raw unvalidated provider payloads.

## Photo and privacy behavior

- Browser-decodable images are orientation-corrected and re-encoded as JPEG.
- Longest edge is limited to 2048 px; EXIF is removed; normalized size is limited to 5 MB.
- Unsupported HEIC receives a typed recovery instruction.
- Image bytes never travel through Realtime; events contain only safe object IDs and metadata.
- Sessions permit one wall and one controller, expire after 24 hours, and cap sources/refinements/versions/events.
- Pairing tokens are random, hashed at rest, single-use, and expire after ten minutes.
- End/delete removes the private source and database session; scheduled cleanup removes expired sessions and objects.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run test:e2e:production
npm run build
```

Current local implementation gate: **32 test files / 92 tests**, zero-warning lint, strict TypeScript, optimized Next.js production build, paired desktop/Pixel browser coverage, reduced-motion rules, visual inspection, and high-confidence secret scans. Live Supabase and Nano Banana remain explicitly blocked on external project configuration; the same-device, typed, canonical 3D journey remains the reliable fallback. Set `PLAYWRIGHT_PRODUCTION_URL` to smoke another deployment; the default is the production alias.

The current task’s Codex Session ID is `019f7391-31b1-7e73-9e15-d887f7dc38a0`.

## Locked cuts

The deadline hero journey includes bounded ElevenLabs voice and the controlled Nano Banana Reveal. It still excludes ElevenCreative Flows automation, phone-side interactive 3D, GLTF/network textures, wall art/chair assets, photogrammetry, structural inference, generalized room kits, accounts, collaboration, telemetry, and a state-management refactor. The older combined-Studio concept experiment remains outside the paired hero path.

## Project records

- Phase ledger: [docs/wow-pipeline-status.md](docs/wow-pipeline-status.md)
- Paired architecture decision: [docs/decisions/0001-paired-phone-studio-wall.md](docs/decisions/0001-paired-phone-studio-wall.md)
- Product repository: <https://github.com/KIRTIRAJ4327/Interiorin>
- Forge run: `20260718-spatial-design-studio`
