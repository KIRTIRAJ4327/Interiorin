# Interiorin

Interiorin is an evidence-aware spatial design studio for real interior and exterior spaces. Its current judged slice proves one narrow mechanism: an unverified spatial fact may block a fit-sensitive change, but it cannot authorize one.

## What works now

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

Open `http://localhost:3000`. The proof works without credentials: turn on **Offline proof mode** before selecting **Clarify and check**.

To exercise the conditional live proposal adapter, copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`. The model converts language into a typed proposal only. Deterministic code owns evidence authority, geometry, alternatives, and mutation.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

The browser suite runs the complete offline proof in desktop Chromium and mobile Chromium. Render evidence is kept under `artifacts/screenshots/`.

## Truth boundaries

- The current scene is a disclosed prepared fixture, not arbitrary photo-to-metric reconstruction.
- A homeowner declaration is scoped to the session and remains flagged for professional review.
- The 3D scene renders canonical state; it does not decide spatial validity.
- Provider failure never grants permission. Offline parsing is labelled and uses the same bounded proposal contract.
- No API key belongs in Git. Use local or deployment secrets only.

## Larger product direction

The active Forge run is designing the path from this proof to the larger Interiorin objective: guided intake for empty or existing spaces, interior and exterior rule packs, reasoned design options, bounded voice/keyboard refinement, named versions, factual comparison, generated presentation derivatives, and professional handoff. Those capabilities remain roadmap items until implemented and verified.

## Workspaces

- Product repository: `E:\Personal Project\Interiorin`
- Pipeline repository: `E:\Personal Project\forge`
- Active run: `20260718-spatial-design-studio`
- GitHub: <https://github.com/KIRTIRAJ4327/Interiorin>
