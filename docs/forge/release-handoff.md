# Interiorin — release handoff

**Run:** `20260718-spatial-design-studio`  
**Product path:** `E:/Personal Project/Interiorin`  
**Repository:** `https://github.com/KIRTIRAJ4327/Interiorin`  
**Verified executable commit:** `24a5ac907b49ab30dcc6668fffe532f560be4a0e`  
**Final package reference:** Git tag `forge-run-20260718`  
**Delivery:** local production / `NO_HOST`; prepared offline fallback; no live-provider claim

## What is released

Interiorin currently releases a single prepared dining-room authority proof at `/proof/prepared-dining-room`; `/` redirects there. It demonstrates that an unverified spatial fact may block a fit-sensitive decision but cannot authorize one. The proof includes a canonical prepared scene, five integer-millimetre facts, explicit homeowner attestation, six browser SHA-256 digests, an authority-only diff, a deterministic clearance solver, bounded commit, semantic 3D equivalent, and inspectable receipt.

This is intentionally narrower than the complete Interiorin vision. Real interior/exterior intake, calibrated arbitrary spaces, reasoned option generation, ElevenLabs voice refinement, Gemini/Nano Banana presentation derivatives, persistent named versions, factual comparison, and homeowner/pro handoff are approved roadmap modules, not shipped claims.

## Setup

Requirements: Node.js 22 or newer.

```powershell
git clone https://github.com/KIRTIRAJ4327/Interiorin.git
Set-Location Interiorin
npm ci
npm run check
npm run test:e2e
npm run start -- -p 3211
```

Open `http://localhost:3211/proof/prepared-dining-room`.

## Environment variable names

Only names belong in source control:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ENABLE_LIVE_OPENAI`
- `OPENAI_CANARY_RESPONSE_ID`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `API_KEY_21ST`

The verified path needs none of them. Live OpenAI mode remains disabled unless the private server key, explicit enable flag, exact `gpt-5.6-terra` model, and genuine canary response ID all pass. ElevenLabs and Gemini dependencies are future adapters only. `API_KEY_21ST` is development tooling and must never reach browser code.

## Architecture map

| Concern | Location |
|---|---|
| Canonical proof route | `src/app/proof/prepared-dining-room/page.tsx` |
| Proposal API boundary | `src/app/api/proposals/route.ts` |
| State machine and semantic-first UI | `src/components/studio/spatial-studio.tsx` |
| R3F renderer, semantic equivalent, error boundary | `src/components/studio/scene-canvas.tsx` |
| Prepared canonical scene | `src/lib/spatial/prepared-scenes.ts` |
| Provenance and authority event | `src/lib/spatial/fact-authority.ts`, `src/lib/spatial/schema.ts` |
| Authority gate and solver transaction | `src/lib/spatial/truth-contract.ts`, `src/lib/spatial/transaction.ts` |
| Canonical bytes and six digests | `src/lib/spatial/proof.ts` |
| Ordered receipt | `src/lib/spatial/receipt.ts` |
| Provider schema/gate | `src/lib/ai/proposal.ts` |
| Unit/component coverage | `src/**/*.test.ts`, `src/**/*.test.tsx` |
| Production journeys | `e2e/authority-proof.spec.ts` |
| Approved Forge package | `docs/forge/` |

## Primary demo script

1. Open the canonical proof and point out the prepared/offline/session-only/pro-review disclosures.
2. Turn on **Offline proof mode** and choose **Clarify and check**.
3. Show that geometry is computable but authority is not; no 18 cm result is disclosed.
4. Show **Record measurement** disabled, check the explicit 100 cm attestation, then record it.
5. Inspect Geometry `MATCH`, Transaction `MATCH`, Authority `1 FIELD` and the six hashes.
6. Choose **Rerun unchanged proposal**; show that +400 mm fails and +180 mm passes.
7. Accept the 18 cm alternative; open the semantic scene.
8. Confirm visible metric, semantic equivalent, 3D state, and receipt agree on table x 1,100 mm and `920 → 1100 mm`.
9. Optionally repeat at `?canvas=fallback` to prove the semantic workflow survives renderer failure.

Target narration remains under three minutes and must say prepared, offline, session-only, unreviewed, and `NO_HOST` truthfully.

## Deployment steps

The approved release is `NO_HOST`; do not put localhost into a public URL field or claim a live app. If hosting is separately authorized later:

1. Create/link an authorized project.
2. Configure environment variables as deployment secrets, never repository files.
3. Keep live OpenAI disabled until a real exact-model canary succeeds and its response ID is recorded.
4. Run `npm run check` and `npm run test:e2e` against the release commit.
5. Verify secure-context Web Crypto, direct canonical routing, provider disclosures, Canvas fallback, and receipt on the hosted origin.
6. Record the hosted URL and new verification evidence in a new versioned release artifact; do not rewrite this handoff.

## Unresolved risks and honest limits

- No public host or live provider is verified.
- Prepared geometry is not photo reconstruction, survey, CAD/BIM, engineering, drainage, code, or construction certification.
- Homeowner attestation remains `unreviewed` and session-scoped.
- No persistence, authentication, collaboration, download, signing, or professional review portal exists.
- Exact exterior safety/rule systems require separate domain validation; the dining-room solver must never be reused as an exterior safety engine.
- The forced Canvas harness proves application fallback, not every browser/GPU failure.
- Design loop v3 was selected at exhaustion with one documented readiness flag: the embedded compact Claude prompt could not carry every state string/token; the standalone final prompts do.

## Post-submission path

1. Real interior/exterior guided intake with source, freshness, uncertainty, and authority.
2. Honest editable 3D baseline with renderer-independent semantic facts.
3. Several reasoned, bounded options with constraints, trade-offs, blocked facts, and review needs.
4. ElevenLabs voice for bounded intake/navigation/refinement with keyboard parity and explicit confirmation.
5. Labelled Gemini/Nano Banana presentation derivatives tied to an approved factual version, never used as geometric evidence.
6. Persistent named versions, factual diffs, comparison, undo-as-transaction, and source freshness.
7. Authenticated homeowner/pro handoff and scoped professional review without premature certification.

## Release evidence

- Approved implementation report: `final/implementation-report.md`
- Independent verification: `final/verification-report.md`
- Approved design: `final/design-document.md`
- Codex implementation prompt: `final/codex-design-prompt.md`
- Claude compatibility prompt: `final/claude-design-prompt.md`
- Canonical visual system: `final/design-system.md`

The product repository carries the approved package under `docs/forge/`; tag `forge-run-20260718` identifies the final package commit after synchronization.
