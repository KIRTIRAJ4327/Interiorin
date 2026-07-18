# Interiorin implementation report — v2

**Run:** `20260718-spatial-design-studio`  
**Iteration:** implementation engineer v2  
**Product directory:** `E:/Personal Project/Interiorin`  
**Baseline / current HEAD:** `100d0166d3cb6f39830f7f9575156e3b2965c36d` (`main`, equal to `origin/main`)  
**Implementation status:** **GREEN for the approved prepared interior F2.R release slice**  
**Commit/push status:** changes are intentionally uncommitted and unpushed for root review  
**Hosting/provider status:** `NO_HOST`; prepared fallback verified; no live-provider claim

## Outcome

All three implementation-v1 critic findings are addressed without expanding the release slice. The semantic scene now derives its room, table, bookcase, path, dimensions, and positions from the canonical `scene` prop. After commit, the mesh input, visible canonical metric, opened semantic equivalent, and receipt all agree that table x is **1,100 mm**. Dynamic proof content now has a sequential outline: the proof-valid event is `h3` under the state `h2`; the committed receipt is `h3` with `h4` groups.

The Canvas-resilience contract now has deterministic automated coverage at two levels. A component test forces the real `SceneErrorBoundary` and proves fallback copy plus all semantic controls remain available. A production-browser journey opens the explicit `?canvas=fallback` verification harness at 375×812 with reduced motion, completes the entire offline authority/solver/receipt transaction, verifies no horizontal overflow, and confirms the canonical semantic table state remains 1,100 mm. Normal desktop and Pixel 7 production journeys remain green.

No exterior, arbitrary capture, voice, Gemini/Nano Banana, persistence, named-version, comparison, professional-review, or handoff route was added or claimed.

## Findings addressed

### 1. Canonical scene/semantic/receipt equivalence

- Removed hardcoded semantic room, table, bookcase, path, and position strings from `scene-canvas.tsx`.
- The semantic room extents derive from floor/wall polygons; object dimensions and x positions derive from canonical scene objects; path clearance derives from the canonical constraint.
- The R3F table already consumed `scene.objects`; component/page/E2E assertions now pin the post-commit table prop to `1.1 m`, scene metric to `1,100 mm`, semantic equivalent to `centre x 1,100 mm`, and receipt diff to `920 → 1100 mm`.

### 2. Sequential dynamic heading hierarchy

- `Recorded session event`: `h4 → h3`.
- `Decision receipt`: `h4 → h3`.
- Receipt groups: `h5 → h4`.
- Styles were remapped to the corrected semantic elements with no visual hierarchy regression.
- Proof-valid outline assertion: `h1, h2, h2, h3, h2, h2, h2`.
- Committed outline assertion: `h1, h2, h2, h3, h4, h4, h4, h4, h4, h2, h2, h2`.

### 3. Deterministic Canvas failure coverage

- `SceneCanvas` retains its runtime error boundary and native Canvas fallback.
- `forceFailure` now drives a dedicated throwing child through the real React error boundary rather than depending on a graphics-driver failure.
- `SpatialStudio` reads the URL-scoped `?canvas=fallback` verification harness with `useSyncExternalStore`; the normal route remains unchanged.
- Component coverage proves the fallback and rotate/zoom/reset/semantic controls survive together.
- Production Playwright coverage verifies fallback + five facts + six rows + full authority journey + receipt + semantic 1,100 mm at 375×812, `prefers-reduced-motion: reduce`, and zero page-level horizontal overflow.

## Exact working-tree delta

```text
M  e2e/authority-proof.spec.ts
M  src/app/globals.css
M  src/app/page.test.tsx
M  src/components/studio/scene-canvas.tsx
M  src/components/studio/spatial-studio.tsx
?? src/components/studio/scene-canvas.test.tsx
```

The tracked diff is **106 additions / 21 removals across five files**, plus the new Canvas test file. `git diff --check` passes; Git emits only the existing Windows LF→CRLF notices. HEAD and `origin/main` both remain `100d0166d3cb6f39830f7f9575156e3b2965c36d` as required.

## Approved-scope requirement mapping

| Requirement | v2 evidence |
|---|---|
| Canonical 3D state | R3F mesh consumes the canonical table object; page regression pins the post-commit scene prop to x `1.1`. |
| Canonical semantic equivalent | Semantic object dimensions/positions derive from `scene`; component and production E2E pin dining table centre x to `1,100 mm`. |
| Canonical visible metric | Committed `.scene-metrics` reports `Canonical table x 1,100 mm`. |
| Canonical receipt | Receipt reports committed `+180 mm` and `table.position.x_mm 920 → 1100 mm`. |
| Proof-valid outline | Exact checked heading levels are `[1,2,2,3,2,2,2]`; no downward skip exists. |
| Committed outline | Exact checked levels are `[1,2,2,3,4,4,4,4,4,2,2,2]`; receipt groups are meaningful children. |
| Canvas fallback | Real `SceneErrorBoundary` forced in component test; explicit browser harness forces the same boundary in the production build. |
| Proof remains primary | Fallback test confirms five facts, six rows, controls, authority event, deterministic check, commit, and receipt remain operable without Canvas. |
| 375 px / reduced motion | Production test uses 375×812 and browser reduced-motion emulation, asserts the media query and no horizontal page overflow. |
| Truth boundary | Offline mode remains `Prepared fallback · no model request`; no provider or roadmap claims changed. |

## Provider modes and fallbacks

| Mode | Current truth |
|---|---|
| Prepared offline | Verified end to end. It makes no model claim and continues to disclose `Prepared fallback · no model request`. |
| Proposal route fallback | Existing typed route fallback remains unchanged when credentials/gates are absent or route use fails. |
| `gpt-5.6-terra` | Not exercised and not claimed live. Existing server-only key, enable flag, exact-model, and canary response-ID gates remain authoritative. |
| ElevenLabs | Not in this release slice; no runtime voice claim. |
| Gemini / Nano Banana | Not in this release slice; no generated-presentation claim. |
| Hosting | `NO_HOST`; all browser evidence came from a local production Next server. |

## Source-file map

| Concern | Source |
|---|---|
| Canonical semantic scene + R3F boundary/fallback | `src/components/studio/scene-canvas.tsx` |
| State machine, heading outline, URL-scoped fallback harness | `src/components/studio/spatial-studio.tsx` |
| Corrected h3/h4 visual roles | `src/app/globals.css` |
| State/outline/mesh-prop/metric/receipt regression | `src/app/page.test.tsx` |
| Real error-boundary and canonical semantic component tests | `src/components/studio/scene-canvas.test.tsx` |
| Normal desktop/Pixel + 375 px reduced-motion fallback journeys | `e2e/authority-proof.spec.ts` |

## Verification commands and outcomes

```text
git diff --check
  PASS · no whitespace errors; LF→CRLF notices only

npx vitest run src/components/studio/scene-canvas.test.tsx src/app/page.test.tsx --reporter verbose
  PASS · 2 files / 3 tests

npm run check
  PASS · eslint --max-warnings=0
  PASS · tsc --noEmit
  PASS · Vitest 11 files / 31 tests
  PASS · Next.js 16.2.10 production build
  Routes · /, /api/proposals, /proof/prepared-dining-room

npx playwright test --grep "Canvas failure" --project=chromium
  PASS · production 375×812 reduced-motion fallback journey · 1/1

npm run test:e2e
  PASS · production desktop normal journey
  PASS · production Pixel 7 normal journey
  PASS · production 375×812 reduced-motion boundary-fallback journey
  SKIP · duplicate fallback journey in second Playwright project by explicit design
  Final · 3 passed / 1 intentional skip

python E:/Personal Project/forge/scripts/validate_product.py \
  --root E:/Personal Project/forge \
  --run-dir E:/Personal Project/forge/artifacts/runs/20260718-spatial-design-studio \
  --product-dir E:/Personal Project/Interiorin \
  --mode full
  PASS · Forge product validation
```

Troubleshooting record: the first browser failure injection suppressed WebGL `getContext`, but Chromium/R3F retained a rendering path and the fallback assertion correctly failed. That graphics-driver heuristic was removed. The final URL-scoped harness deterministically drives the actual React boundary and is green. A first harness implementation set state synchronously in an effect and was rejected by the repository’s React lint rule; it was replaced with `useSyncExternalStore`. Final lint/typecheck/check/E2E results above are from the corrected implementation.

## Rendered-screen evidence

Fresh successful production captures:

```text
E:/Personal Project/Interiorin/test-results/authority-proof-offline-ca-4bc6c-thorizes-limits-and-commits-chromium/studio-proof.png
E:/Personal Project/Interiorin/test-results/authority-proof-offline-ca-4bc6c-thorizes-limits-and-commits-chromium/studio-receipt.png
E:/Personal Project/Interiorin/test-results/authority-proof-offline-ca-4bc6c-thorizes-limits-and-commits-mobile-chromium/studio-proof.png
E:/Personal Project/Interiorin/test-results/authority-proof-offline-ca-4bc6c-thorizes-limits-and-commits-mobile-chromium/studio-receipt.png
E:/Personal Project/Interiorin/test-results/authority-proof-Canvas-fai-d8888-n-proof-and-receipt-journey-chromium/studio-canvas-fallback-receipt.png
```

Visual inspection confirmed:

- Desktop keeps the semantic ledger and sticky spatial pane distinct; opened semantic data visibly reports the committed table at `centre x 1,100 mm` and the bottom metric agrees.
- Pixel 7 preserves semantic-first DOM/render order; receipt, five bases, six hashes, relationships, fact rows, and controls wrap without page-level horizontal overflow.
- The 375 px fallback receipt capture preserves the same Material Ledger hierarchy and full receipt journey when the 3D enhancement fails.
- Corrected heading tags do not alter the approved Newsreader/Plex editorial hierarchy, boundaries, authority marks, flat surfaces, or anti-slop character.

## Accessibility evidence

- Sequential heading outlines are asserted at both dynamic states that failed v1 review.
- The real fallback has a labelled `role="img"`, explicit recovery copy, and does not own or remove the semantic proof.
- Rotate, zoom in/out, reset, and semantic-scene buttons remain native and enabled during fallback; the existing 44 px control sizing and 8 px spacing are unchanged.
- The full fallback transaction is keyboard/control operable through native switch, button, checkbox, proof, commit, and receipt controls.
- Browser emulation confirms `prefers-reduced-motion: reduce` matches; repository CSS suppresses motion under that media query.
- At 375×812 the fallback journey asserts `documentElement.scrollWidth === clientWidth` before and after commit.
- Essential state is still expressed with text/icons/structural marks, never color or Canvas alone.

## Known gaps and non-claims

- `NO_HOST`: this is verified local-production output, not a public deployment.
- No live provider credential/canary was available or exercised; prepared fallback is the verified provider mode.
- The explicit `?canvas=fallback` query is a deterministic resilience-verification harness, not user state or a product mode; it does not persist and does not alter normal-route behavior.
- The forced boundary proves React fallback behavior, not every possible GPU/driver crash signature.
- 200% zoom, largest dynamic type, and a separate phone-landscape browser matrix were not rerun in v2. The critic’s requested 375 px/reduced-motion case is checked, and prior v1 review independently covered landscape.
- Arbitrary interior/exterior capture, voice, presentation derivatives, persistence, named versions/comparison, professional review, certification, and handoff remain roadmap scope and are not exposed as complete.

## Demo and run instructions

From `E:/Personal Project/Interiorin`:

```powershell
npm ci
npm run check
npm run test:e2e
npm run start -- -p 3211
```

Open `http://localhost:3211/proof/prepared-dining-room`. Turn on **Offline proof mode**, run **Clarify and check**, attest and record the prepared 100 cm width, inspect the six proof rows, rerun the unchanged proposal, accept the 18 cm alternative, open the semantic scene, and inspect the receipt. The table must read 1,100 mm in the scene metric, semantic equivalent, and receipt. For deterministic resilience verification, open `http://localhost:3211/proof/prepared-dining-room?canvas=fallback` and repeat the same journey.

## Handoff status

The bounded v2 implementation is ready for root-agent review and checkpointing. Product HEAD remains the clean pushed baseline `100d0166d3cb6f39830f7f9575156e3b2965c36d`; the six-file working-tree delta above is intentionally uncommitted. No commit, push, state edit, verdict edit, or final-artifact edit occurred in this implementation lane.
