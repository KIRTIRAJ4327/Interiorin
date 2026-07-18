# Interiorin

Interiorin is an evidence-aware spatial design studio for real interior and exterior spaces. The product now includes a dimension-driven Studio for turning an entered space envelope into three reasoned, interactive directions, while preserving the original authority proof as a deeper technical demonstration.

## What works now

- Guided interior/exterior intake for empty or existing spaces, with user-entered width, depth, height, intent, and an optional image/PDF source.
- Credential-gated Gemini visual analysis that identifies visible openings, retained objects, light, and style cues as confidence-scored, non-metric evidence; provider failure is disclosed and never blocks dimension-driven generation.
- Three materially distinct, deterministic spatial options generated from the entered envelope, each with rationale and tradeoffs.
- A canonical interactive 3D workbench with mouse/touch controls and an always-available semantic facts view.
- Optional Nano Banana in-space presentation concepts generated from the source photograph and current canonical option, clearly separated from the measured/evidence-aware 3D record.
- Bounded browser voice transcription or typed refinement, compiled to a visible typed action and committed only after explicit confirmation.
- Rejected mutations for protected existing objects, plus persistent action receipts.
- Named local versions, factual scene comparison, and an architect/designer review package exported as JSON with sources, limitations, and open questions.
- Blocking exterior review needs—including property boundary, survey, setbacks, utilities, grade, and drainage—kept visible in the workbench and handoff.
- A prepared, calibrated dining-room scene rendered as interactive 3D with an always-available numeric fallback.
- A typed 40 cm table-move proposal, clarified through GPT-5.6 Terra when configured or through a visibly labelled deterministic offline parser.
- A fail-closed authority gate: the visually estimated bookcase width produces `confirmation_required` and exposes no maximum-valid alternative.
- A scoped homeowner measurement that changes the supporting fact from `observed_unverified` to `user_declared` without changing geometry or the transaction.
- Browser SHA-256 proof that geometry and transaction bytes match while the allowlisted authority field changes.
- An integer-millimetre edge-clearance solver that limits the requested 400 mm move to a checked 180 mm alternative.
- Explicit commit and in-session receipt with the requested and committed actions kept distinct.
- Desktop and mobile browser rehearsal of the complete offline causal path.

This is early decision support under a demo-authored, unendorsed policy. It is not survey, code, structural, or construction certification.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the Studio. The deeper authority proof remains available at `http://localhost:3000/proof/prepared-dining-room` and works without credentials: turn on **Offline proof mode** before selecting **Clarify and check**.

To exercise the conditional live proposal adapter, copy `.env.example` to `.env.local`, set `OPENAI_API_KEY`, verify a server-side canary against the exact `gpt-5.6-terra` model, record its genuine response ID in `OPENAI_CANARY_RESPONSE_ID`, then set `ENABLE_LIVE_OPENAI=true`. Any missing or aliased provenance forces the disclosed prepared fallback. The model converts language into a typed proposal only. Deterministic code owns evidence authority, geometry, alternatives, and mutation.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

The browser suite builds and starts the production app, then runs the Studio and authority-proof journeys serially in desktop Chromium and mobile Chromium. Assertion screenshots are isolated under Playwright's disposable test output; curated proof render evidence is kept under `artifacts/screenshots/`.

The current gate passes 17 test files / 45 tests, the optimized production build, and the production browser journeys across desktop/mobile with intentional skips for single-browser-only provider contracts. The original Forge proof verification remains in [docs/forge/verification-report.md](docs/forge/verification-report.md); the broader Studio slice is documented in [docs/studio-vertical-slice.md](docs/studio-vertical-slice.md).

## Truth boundaries

- Studio metric geometry comes from dimensions entered by the user. When Gemini is configured, an attached image/PDF can contribute confidence-scored visible openings, retained objects, light, and style cues—but never inferred metric dimensions or hidden conditions.
- Nano Banana concepts are presentation hypotheses. They do not replace canonical 3D state, prove fit, preserve every pixel, or authorize procurement/construction.
- Suggested furniture, planting, and materials are decision-support hypotheses, not observations, procurement advice, a survey, code review, or construction documentation.
- Browser speech recognition provides transcription where supported. ElevenLabs is installed as an integration dependency but is not part of this credential-free slice.
- Named versions persist in this browser's local storage; there is no account, cloud sync, or shared professional portal yet.
- A homeowner declaration is scoped to the session and remains flagged for professional review.
- The 3D scene renders canonical state; it does not decide spatial validity.
- Provider failure never grants permission. Offline parsing is labelled and uses the same bounded proposal contract.
- No API key belongs in Git. Use local or deployment secrets only.

## Next product frontier

The next frontier is calibrated multi-view photo/video or scan reconstruction, richer direct geometry editing and collision solving, cloud projects and collaboration, live provider-backed voice, and a professional review portal. Those capabilities remain roadmap items until implemented and verified.

## Workspaces

- Product repository: `E:\Personal Project\Interiorin`
- Pipeline repository: `E:\Personal Project\forge`
- Active run: `20260718-spatial-design-studio`
- GitHub: <https://github.com/KIRTIRAJ4327/Interiorin>
- Approved Forge package: [docs/forge/README.md](docs/forge/README.md)
