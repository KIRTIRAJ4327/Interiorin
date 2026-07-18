# Interiorin — final verification report

**Run:** `20260718-spatial-design-studio`  
**Verified executable commit:** `24a5ac907b49ab30dcc6668fffe532f560be4a0e`  
**Repository:** `https://github.com/KIRTIRAJ4327/Interiorin`  
**Release contract:** prepared interior-only F2.R proof · local production / `NO_HOST` · prepared offline fallback · session-only · professional review `unreviewed`  
**Result:** **PASS**

## Scope verified

The executable release proves one bounded causal mechanism: an observed-unverified bookcase width blocks a fit-sensitive table move without revealing a checked alternative; explicit homeowner attestation changes only that fact's authority; identical geometry and transaction hashes are demonstrated; the integer solver then limits the requested +400 mm move to +180 mm; explicit commit produces a visible receipt.

The runtime does not expose arbitrary capture, exterior workflows, voice, Gemini/Nano Banana presentation generation, persistence, named versions, comparison, professional review completion, or handoff. Those remain clearly labelled roadmap scope.

## Independent commands and results

Run from `E:/Personal Project/Interiorin` unless noted.

```text
git diff --check
  PASS

npm run check
  PASS · eslint --max-warnings=0
  PASS · tsc --noEmit
  PASS · Vitest 11 files / 31 tests
  PASS · Next.js 16.2.10 production build
  Routes · /, /api/proposals, /proof/prepared-dining-room

npm run test:e2e
  PASS · Desktop Chromium normal journey
  PASS · Pixel 7 normal journey
  PASS · Chromium 375×812 reduced-motion real-boundary fallback journey
  SKIP · duplicate fallback journey in the second Playwright project by explicit design
  Final · 3 passed / 1 intentional skip

python scripts/validate_product.py --run-dir artifacts/runs/20260718-spatial-design-studio --product-dir "E:\Personal Project\Interiorin" --mode static
  PASS · Forge product validation and secret scan

python scripts/validate_product.py --root E:/Personal Project/forge --run-dir E:/Personal Project/forge/artifacts/runs/20260718-spatial-design-studio --product-dir E:/Personal Project/Interiorin --mode full
  PASS · critic-run full product validation

git rev-parse HEAD
git rev-parse origin/main
git ls-remote origin refs/heads/main
  PASS · all resolved to 24a5ac907b49ab30dcc6668fffe532f560be4a0e during executable review
```

## Behavior and truth checks

- Offline proof mode issued zero `/api/proposals` requests.
- Pass A rendered none of `18 cm`, `180 mm`, `+180`, `0.18 m`, `1,100 mm`, or `1.1 m`.
- Record remained disabled until the explicit “I measured this 100 cm value” attestation.
- The event preserved `1,000 → 1,000 mm` and changed only observed-unverified to user-declared authority.
- Six SHA-256 rows settled; relationships displayed Geometry `MATCH`, Transaction `MATCH`, Authority `1 FIELD`.
- The unchanged proposal produced the checked +180 mm alternative only after proof validity.
- After commit, canonical scene prop, 3D mesh input, visible metric, opened semantic equivalent, and receipt agreed on table x `1,100 mm`; the receipt diff was `920 → 1100 mm`.
- The prepared provider remained labelled `Prepared fallback · no model request`; no live Terra, ElevenLabs, Gemini, hosting, persistence, or professional-review claim was invented.

## Accessibility and resilience checks

- Exact proof-valid heading outline: `[1,2,2,3,2,2,2]`.
- Exact committed outline: `[1,2,2,3,4,4,4,4,4,2,2,2]`.
- At 375 px, the document had no page-level horizontal overflow before or after receipt.
- Reduced-motion browser emulation matched the product media query.
- The first keyboard Tab reached the skip link; activation bypassed the header to the decision proof.
- Enabled controls measured at least 44×44 CSS px in critic probes.
- A deterministic `?canvas=fallback` harness forced the real React `SceneErrorBoundary`; the five facts, six proof rows, semantic scene, decision controls, commit, and receipt remained operable.
- The Canvas fallback is labelled and never owns authority, numeric validation, or mutation.

## Rendered evidence inspected

- `test-results/authority-proof-offline-ca-4bc6c-thorizes-limits-and-commits-chromium/studio-proof.png`
- `test-results/authority-proof-offline-ca-4bc6c-thorizes-limits-and-commits-chromium/studio-receipt.png`
- `test-results/authority-proof-offline-ca-4bc6c-thorizes-limits-and-commits-mobile-chromium/studio-proof.png`
- `test-results/authority-proof-offline-ca-4bc6c-thorizes-limits-and-commits-mobile-chromium/studio-receipt.png`
- `test-results/authority-proof-Canvas-fai-d8888-n-proof-and-receipt-journey-chromium/studio-canvas-fallback-receipt.png`

Desktop, Pixel 7, and fallback captures preserve the Material Ledger Studio hierarchy, readable hashes/fact IDs, semantic-first mobile order, and canonical 1,100 mm agreement. No generic gradient dashboard, glass treatment, clipped receipt, or false 3D authority was observed.

## Provider modes tested

| Mode | Result |
|---|---|
| Prepared offline proposal | Verified end to end; zero model request |
| Missing-credential proposal-route fallback | Verified and disclosed |
| Live `gpt-5.6-terra` | Not exercised; not claimed |
| ElevenLabs voice | Not implemented in this slice; not claimed |
| Gemini / Nano Banana derivative | Not implemented in this slice; not claimed |
| Public hosting | `NO_HOST`; not attempted or claimed |

## Known gaps

- No public HTTPS deployment exists; verification used a local production Next server.
- No live-provider credential or canary was available for release evidence.
- The forced boundary verifies React fallback behavior, not every GPU/driver crash signature.
- Receipt and project state are session memory only.
- The full interior/exterior product horizon remains future implementation, not release functionality.
- The user-supplied 21st.dev credential was placed in the user environment and excluded from Git; because it appeared in chat, rotation is recommended after this run.

## Verdict trail

Implementation v1: `REVISE` · 46/60.  
Implementation v2: `APPROVE` · 52/60 (`9,9,8,9,9,8`), with every dimension meeting the configured threshold of 8.
