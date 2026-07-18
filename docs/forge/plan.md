# Interiorin judged-slice delivery plan — v3

**Run:** `20260718-spatial-design-studio`  
**Approved solution:** `02-ideation/solution-v2.md`  
**Prior plan / critic:** `03-plan/plan-v2.md`, `03-plan/verdict-plan-v2.md`  
**Product repository:** `E:/Personal Project/Interiorin` (`https://github.com/KIRTIRAJ4327/Interiorin`)  
**Clean pushed baseline:** `b1b392f9bde820f492de2215a6c486451f38d0d3` (`HEAD == origin/main`)  
**Hard deadline:** **Tuesday, July 21, 2026, 5:00 PM PT / 8:00 PM Toronto (EDT)**  
**Planning snapshot P0:** 2026-07-18 05:29 Toronto / 02:29 PT  
**Run epoch H0:** `2026-07-18T01:20:00-04:00`; P0 is **H0 + 4 h 09 m**. Elapsed time is not reclaimed.

The deadline and sub-three-minute demo requirement are external Build Week constraints ([OpenAI Build Week official rules](https://openai.devpost.com/rules), page current; accessed 2026-07-18). Forge itself still has `defaults.global_time_limit: none`: future plans and artifacts must use their own verified deadlines or dependency-led milestones, never inherit this run's calendar or a global 24/48-hour cap.

## Findings addressed

| # | `verdict-plan-v2` finding | v3 resolution | Where closed |
|---:|---|---|---|
| 1 | Obsolete expected SHA and drifting E-numbering made the handoff non-executable | Every expected baseline pin is the full clean pushed `b1b392f9bde820f492de2215a6c486451f38d0d3`. One sequence—**E0 conformance → E1 release assertion → E2 NO_HOST delivery → E3 selector/rehearsal → E4 media/package → E5 reconciliation/submission → E6 recovery guard/deadline**—is used in milestones, evidence gates, commands, rehearsal, cuts, and definition of done. | **Baseline**, **Milestones**, **Evidence gates**, **Commands** |
| 2 | Demo omitted the required checkbox and specified the wrong proof headline | The selector matrix and verbatim script explicitly run `getByRole('checkbox', { name: /I measured this 100 cm value/i }).check()` while **Record measurement** is disabled, assert it becomes enabled, and then click it. The proof headline is exactly the shipped/tested **Only evidence authority changed.** No nonexistent control or alternate headline remains. | **Selector matrix**, **Demo script**, **E3 rehearsal** |
| 3 | C-base sat at the optimistic edge and normal delivery/media work risked consuming reserve | Select **C-high: 32 focused h = 26 h named mandatory + 6 h genuinely unassigned contingency (18.75%)**. Precommit **NO_HOST** because the authenticated Vercel session has no linked repository and no authorized project is confirmed. Branch-specific allocations are padded: 3.5 conformance, 2 release assertion, 4.5 local delivery/resilience, 5.5 selector/rehearsal, 8 capture/media/submission, 2.5 reconciliation. | **Capacity**, **Ledger**, **Milestones**, **NO_HOST policy** |

## Baseline, completed evidence, and remaining scope

At P0, `HEAD == origin/main == b1b392f9bde820f492de2215a6c486451f38d0d3` and the worktree is clean. This plan treats the following as **supplied verification evidence**, not as final-SHA release evidence:

- `npm run check` was green with lint, typecheck, **10 test files / 29 tests**, and production build.
- Production desktop Chromium and Pixel 7 E2E passed **2/2**; an additional production desktop receipt run passed.
- The exact five `_mm` fact IDs are shared by proof and receipt.
- Untouched bookcase height/depth canonical bytes are equal before/after the width event.
- The selected provider action is deep-frozen and identity/canonical-value tested through proof and receipt.
- An injected solver spy proves zero numerical solver calls in Pass A.
- DOM, accessibility, and Canvas-prop tests deny the 180 mm result before valid Pass B.
- The route accepts only exact `gpt-5.6-terra` live envelopes with genuine returned request IDs and requires durable configured canary evidence; aliases/missing IDs force fallback.
- The receipt evidence is visible, and E2E asserts it.
- The visible checkbox **I measured this 100 cm value for this session.** is required; **Record measurement** stays disabled until checked; reset clears the attestation; component and production E2E cover this gate.

The remaining work is release conformance, deterministic final evidence, local-production resilience, selector-exact rehearsal, video/media/submission, and final claim reconciliation. It is not a mechanism rebuild.

### Honest judged scope

The deadline artifact proves one prepared **interior** dining-room transaction: a frozen 400 mm table request, an unchanged 1,000 mm width evidence event, five exact facts, `confirmation_required → limited → committed`, an inline receipt, semantic proof, and explicit prepared/offline provider truth. It does not claim real-room intake, arbitrary rooms, exterior runtime, persistence, professional verification, live Terra, voice, generated presentation derivatives, or production-endorsed policy.

## Capacity, sleep, and exact arithmetic

**Selected scenario: C-high.**

- **ASSUMPTION:** one builder can provide **32 focused hours** from P0 through the deadline. No second engineer, designer, QA operator, or submission producer is confirmed.
- **ASSUMPTION:** the current Windows/Node 22 environment, installed dependencies, GitHub push access, recorder, microphone, Devpost access, and public video host remain available; E0 verifies them.
- **SUPPLIED HOST FACT:** Vercel is authenticated, but the repository is unlinked and no authorized project is confirmed. Therefore E0 is precommitted to **NO_HOST**. Account/project creation or linking is not scheduled and cannot use contingency.
- Sleep is a dependency: **7.5 h in every 24-hour cycle**. Meals, breaks, wind-down, passive upload time, and the final guard are calendar time, not focused effort.

### Focused-work ledger

| Package / checkpoint | Named mandatory focus | Current-baseline rationale | Exact done-signal |
|---|---:|---|---|
| **E0 — baseline, dependency, causal/provider/receipt/script conformance** | **3.5 h** | Within critic's 3–4.5 h audit range; no rebuild | Full pin; dependencies classified; exact focused tests green; checkbox/button/headline/receipt selectors unique; all causal/provider gates retained |
| **E1 — final deterministic release assertion** | **2.0 h** | Within critic's 1.5–2.5 h range | `npm run check`; production desktop twice from one captured SHA; status empty after each |
| **E2 — NO_HOST local-production delivery/resilience** | **4.5 h** | Top of critic's 3–4.5 h NO_HOST range | Production start; local clean-browser flow twice after reset; Web Crypto; zero proposal fetch offline; Canvas failure leaves semantic proof; no public URL claim |
| **E3 — selector acceptance, resilience, three rehearsals** | **5.5 h** | Within critic's 4.5–6 h range | Exact selector matrix passes; checkbox gate executed; Canvas fallback checked; three consecutive 2:05–2:25 runs |
| **E4 — capture, captions/upload, README, Devpost, essential media, preliminary link QA** | **8.0 h** | Within critic's 7–9.5 h capture/submission range | Public sub-3-minute video; captions/audio; truthful repo/local instructions; required form fields; two essential images only if useful; preliminary incognito pass |
| **E5 — evidence reconciliation and final submission** | **2.5 h** | Padded final claim/form/link pass | SHA/provider/NO_HOST/README/video/Devpost agree; incognito QA; submission confirmation by 17:00 Toronto |
| **Named mandatory total** | **26.0 h** | `3.5 + 2 + 4.5 + 5.5 + 8 + 2.5 = 26` | E0–E5 all green |
| **B1+B2+B3 contingency** | **6.0 h** | Three unassigned 2 h windows | Used only after a named failed checkpoint; unused reserve stays unused |
| **Total focused capacity** | **32.0 h** | `26 + 6 = 32`; contingency is **18.75%** | Sleep/meals/final guard excluded |

The selected package fits the padded **NO_HOST** path. A hosted branch is not latent scope: an authorized project appearing later does not change E2, consume reserve, or add a deployment claim before submission.

### Protected blocks

| Toronto time | Protection |
|---|---|
| Jul 18 **05:35–13:05** | S0 sleep — 7.5 h |
| Jul 19 **01:00–08:30** | S1 sleep — 7.5 h |
| Jul 20 **01:00–08:30** | S2 sleep — 7.5 h |
| Jul 21 **01:00–08:30** | S3 sleep — 7.5 h |
| Jul 19 **15:00–17:00** | B1 — 2 focused h, unassigned contingency |
| Jul 20 **15:00–17:00** | B2 — 2 focused h, unassigned contingency |
| Jul 21 **11:30–13:30** | B3 — 2 focused h, unassigned contingency |
| Jul 21 **17:00–20:00** | Final upload/link/form recovery guard; not focus, not contingency, never feature time |

## Dependency setup checklist

E0 completes every mandatory dependency before E1. D6 is conditional and outside submission scope.

- [ ] **D0 — repository:** record `HEAD`, `origin/main`, branch, remotes, status, and `git diff --check`; expected start is exactly `b1b392f9bde820f492de2215a6c486451f38d0d3`, clean and pushed.
- [ ] **D1 — runtime/browser:** record Node/npm/Playwright versions; confirm Chromium, port 3211, one-worker config, production `build && start`, `reuseExistingServer: false`, and ignored Playwright output. Do not upgrade dependencies without an observed release blocker.
- [ ] **D2 — GitHub:** confirm push authority, public repository visibility, and no tracked `.env`, key, token, or response body.
- [ ] **D3 — media/submission:** confirm Devpost edit authority and required fields, screen recorder/microphone, 1080p capture, caption workflow, public video host, and clean/incognito browser profile.
- [ ] **D4 — NO_HOST before E2:** record that Vercel is authenticated but the repository is unlinked and no authorized project is confirmed. Do not link/create/migrate a project. Public delivery evidence is repository + reproducible local production instructions + recorded video.
- [ ] **D5 — evidence locations:** implementation report records checks/test counts/final SHA; release report records `NO_HOST`, local-production evidence, provider mode, video/repo URLs, and limitations. Assertion artifacts remain ignored.
- [ ] **D6 — conditional Terra, never blocking:** exact model access/key/budget and durable canary evidence are not assumed. The official model page lists Responses and Structured Outputs and no free-tier support ([OpenAI GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), publication date n.d.; accessed 2026-07-18). The submitted path stays offline regardless of late credential availability.

## Carried-forward causal and provider gates

E0 reruns these as release gates. They are implemented at the baseline and are not estimates for new architecture.

### Exact facts and causal invariants

Dependency discovery must equal this literal sorted set—no alias or sixth fact:

```text
bookcase.center_x_mm
bookcase.width_mm
path.minimum_clearance_mm
table.center_x_mm
table.width_mm
```

1. One selected adapter result constructs the deep-frozen action/transaction used by Pass A, both proof inputs/all six digests, Pass B, commit, and receipt. Identity tests apply where the client boundary preserves references; canonical action/transaction bytes match at every consumer.
2. Pass A returns `confirmation_required`, has no `effectiveAction`, and an injected spy reports **zero solver calls**.
3. The event changes only `bookcase.width_mm: observed_unverified → user_declared`; `valueBeforeMm === valueAfterMm === 1000`.
4. Canonical bookcase height/depth value and source/authority bytes are equal before/after. Whole-dimensions promotion fails.
5. Before proof-valid Pass B, visible/hidden DOM, accessible names/descriptions, live regions, Canvas labels/props, semantic proof, preview/ghost, commit control, and receipt deny every result equivalent: `180 mm`, `18 cm`, `+180`, `+18`, `0.18 m`, x=`1100 mm`, `1,100 mm`, or `1.1 m`, and equivalent prose/numeric Canvas props.
6. Only after all six awaited digests validate may B call the integer solver and reveal `180 mm`; clearance is 900 mm and commit changes only `table.position.x_mm: 920 → 1100`.

### Exact provider envelope and receipt truth

The implemented union is:

```text
prepared_fallback
  result: clarifiedProposalSchema
  disclosure: non-empty truthful fallback reason

gpt-5.6-terra
  model: "gpt-5.6-terra"
  requestId: genuine non-empty OpenAI response.id
  result: clarifiedProposalSchema
  disclosure: non-empty proposal-only boundary
```

The route returns `prepared_fallback` unless a server key, `ENABLE_LIVE_OPENAI=true`, non-empty `OPENAI_CANARY_RESPONSE_ID`, exact `OPENAI_MODEL=gpt-5.6-terra`, a genuine current `response.id`, and valid parsed schema all exist. Tests reject aliases, missing/blank request IDs, and malformed members. Configuration alone is not a successful deployment canary. Because E2 is `NO_HOST`, the submitted UI, video, receipt, and copy remain offline/prepared; live canary work is cut.

The visible inline receipt must retain requested `+40 cm`, committed `+18 cm`, all five fact IDs/bases, **Prepared fallback · no model request**, policy ID/version/hash, session attestation/source, proof digests, professional review `unreviewed`, and `table.position.x_mm 920 → 1100`.

## Dependency-ordered milestone schedule

Every E-number has one meaning everywhere in this plan.

| Toronto range | Checkpoint / task | Focus | Done-signal | Risk |
|---|---|---:|---|---|
| Jul 18 05:35–13:05 | **S0 protected sleep** | — | 7.5 h protected | Critical if skipped |
| Jul 18 13:05–13:35 | Meal, water, setup | — | Break taken | — |
| Jul 18 13:35–15:35 and 16:05–17:35 | **E0 — baseline/dependencies/conformance:** D0–D5, exact causal/provider/receipt tests, selector contract | **3.5 h** | Full pin; NO_HOST recorded; all carried gates and exact UI selectors green | Critical |
| Jul 18 15:35–16:05 | Break | — | Break taken | — |
| Jul 18 17:35–18:35 | Dinner/walk | — | Meal taken | — |
| Jul 18 18:35–20:35 | **E1 — final release assertion:** full check, desktop production E2E twice, unchanged tree after each | **2.0 h** | Same captured SHA; both passes; empty status each time | Critical |
| Jul 18 20:35–01:00 | Wind-down/snack; no feature work | — | Stop before sleep | — |
| Jul 19 01:00–08:30 | **S1 protected sleep** | — | 7.5 h protected | Critical if skipped |
| Jul 19 08:30–09:00 | Breakfast | — | Meal taken | — |
| Jul 19 09:00–11:30 and 12:00–14:00 | **E2 — NO_HOST delivery/resilience:** local production evidence, reset ×2, Web Crypto, offline zero-fetch, Canvas failure, receipt | **4.5 h** | Reproducible local production proof and explicit no-host package; no runtime URL claim | High |
| Jul 19 11:30–12:00 and 14:00–15:00 | Break/lunch | — | Break and meal taken | — |
| Jul 19 15:00–17:00 | **B1 contingency** | **2 h reserve** | Unassigned unless E0–E2 failure recorded | Not scope |
| Jul 19 17:00–17:30 | Break | — | Break taken | — |
| Jul 19 17:30–19:30 and 20:30–22:00 | **E3a — selector acceptance/rehearsal:** exact checkbox-first path, copy/receipt cues, 375 px smoke, initial timed runs | **3.5 h** | Selector matrix green; no mismatch/overclaim/leak | High |
| Jul 19 19:30–20:30 | Dinner | — | Meal taken | — |
| Jul 20 01:00–08:30 | **S2 protected sleep** | — | 7.5 h protected | Critical if skipped |
| Jul 20 08:30–09:00 | Breakfast | — | Meal taken | — |
| Jul 20 09:00–11:00 | **E3b — rehearsal/resilience:** complete three consecutive timed takes; force Canvas failure | **2.0 h** | Three 2:05–2:25 runs; semantic proof remains operable without Canvas | High |
| Jul 20 11:00–12:00 | Break/lunch | — | Meal taken | — |
| Jul 20 12:00–14:00 | **E4a — clean capture:** record final local-production take, inspect audio/text, begin edit/captions | **2.0 h** | Correct SHA/offline/NO_HOST path captured | High |
| Jul 20 14:00–15:00 | Break | — | Break taken | — |
| Jul 20 15:00–17:00 | **B2 contingency** | **2 h reserve** | Unassigned unless E0–E4 failure recorded | Not scope |
| Jul 20 17:00–17:30 | Break | — | Break taken | — |
| Jul 20 17:30–19:30 and 20:30–22:30 | **E4b — media/submission:** finish edit/captions/upload, README/Devpost, essential images/fields | **4.0 h** | Public video, truthful copy, reproducible local instructions, draft saved | High |
| Jul 20 19:30–20:30 | Dinner | — | Meal taken | — |
| Jul 21 01:00–08:30 | **S3 protected sleep** | — | 7.5 h protected | Critical if skipped |
| Jul 21 08:30–09:00 | Breakfast | — | Meal taken | — |
| Jul 21 09:00–11:00 | **E4c — preliminary link/form QA:** incognito repo/video, local instructions, required fields, two essential images if used | **2.0 h** | E4 total 8 h; preliminary incognito pass green | High |
| Jul 21 11:30–13:30 | **B3 contingency** | **2 h reserve** | Unassigned unless E0–E4 failure recorded | Not scope |
| Jul 21 13:30–14:30 | Lunch/break | — | Meal taken | — |
| Jul 21 14:30–17:00 | **E5 — reconciliation and submission:** SHA/provider/NO_HOST/report/README/video/Devpost agreement; final incognito QA; submit | **2.5 h** | Saved submission and confirmation by 17:00 | Critical |
| Jul 21 17:00–20:00 | **E6 — upload/link/form recovery guard** | — | Recovery only; no code/canary/screenshots/new claims | Immutable |
| Jul 21 20:00 / 5:00 PM PT | **E6 hard deadline** | — | Confirmation remains accessible | Immutable |

## Evidence checkpoints and cut lines

| Checkpoint | GO evidence | If missing | Precommitted cut / stop |
|---|---|---|---|
| **E0 — conformance** | Exact baseline, dependencies, NO_HOST, focused causal/provider/receipt/selector tests green | Any causal regression | **NO-GO** for novelty; B1 may repair only named invariant. No media work. |
| **E1 — final release** | Full check; desktop twice from one SHA; empty status after each | Timeout/failure/tree change | B1 may repair deterministic desktop only; manual run cannot substitute. Pixel/mobile release claim stays cut. |
| **E2 — NO_HOST delivery** | Local production flow twice/reset, Web Crypto, no offline fetch, Canvas fallback, visible receipt, explicit no-host disclosure | Local production/resilience failure | B2 may repair release blocker. Never create/link/migrate a host or claim a live URL. |
| **E3 — rehearsal** | Exact selectors including checkbox; shipped headline; three timed runs; Canvas fallback | Selector/copy mismatch or missed timing/state | Fix script/test, not product scope. Drop optional screenshots and visual retakes first. |
| **E4 — package** | Public video <3:00, captions, README/Devpost, repo/local instructions, required fields, preliminary incognito QA | Media/upload/link failure | B3 may repair required media/link only. Drop all optional images; never reopen code/live/mobile/design. |
| **E5 — submission** | All claims/evidence agree; final links pass; confirmation by 17:00 | Form/link/upload failure | Move to E6 recovery only. No feature or claim expansion. |
| **E6 — guard/deadline** | Existing submission remains accessible | Upload/link/form issue | Recovery only until 20:00; no code, canary, screenshots, or new claims. |

Cuts already applied before contingency: hosted deployment, live Terra canary/UI claim, final Pixel/mobile claim, design-readiness packet, optional screenshot set, nonessential R3F/motion, receipt decoration/download, persistence, correction/reviewer workflows, exterior, voice, and generated presentations. Unused reserve does not authorize any of them.

## Exact commands

Run from `E:/Personal Project/Interiorin`. Record outputs in implementation/release artifacts.

### E0 — exact pin and focused conformance

```powershell
git rev-parse HEAD
git rev-parse origin/main
git status --porcelain=v1
git branch --show-current
git remote -v
git diff --check
node --version
npm --version
npx playwright --version
```

Both revisions must equal `b1b392f9bde820f492de2215a6c486451f38d0d3`; status must be empty. Do not reset a different tree.

```powershell
npx vitest run src/lib/ai/proposal.test.ts src/app/api/proposals/route.test.ts src/lib/spatial/prepared-scenes.test.ts src/lib/spatial/truth-contract.test.ts src/lib/spatial/proof.test.ts src/lib/spatial/transaction.test.ts src/lib/spatial/receipt.test.ts src/app/page.test.tsx
```

### E1 — same-SHA desktop twice

```powershell
npm run check
$releaseSha = git rev-parse HEAD
if (git status --porcelain=v1) { throw 'Release tree is not clean before Playwright.' }
$env:CI = '1'
try {
  npx playwright test e2e/authority-proof.spec.ts --project=chromium --workers=1
  if ((git rev-parse HEAD) -ne $releaseSha) { throw 'SHA changed after desktop pass 1.' }
  if (git status --porcelain=v1) { throw 'Worktree changed after desktop pass 1.' }
  npx playwright test e2e/authority-proof.spec.ts --project=chromium --workers=1
  if ((git rev-parse HEAD) -ne $releaseSha) { throw 'SHA changed after desktop pass 2.' }
  if (git status --porcelain=v1) { throw 'Worktree changed after desktop pass 2.' }
} finally {
  Remove-Item Env:CI -ErrorAction SilentlyContinue
}
git diff --check
git log -1 --format=%H
```

The existing harness already uses production build/start, one worker, `reuseExistingServer: false`, and isolated `testInfo.outputPath`; do not rebuild it.

### E2 — NO_HOST local-production evidence

```powershell
npm run build
npm run start -- -p 3211
```

In a clean browser at `http://localhost:3211`, run the explicit offline flow, reset, and repeat. Confirm zero proposal fetch, Web Crypto success, forced Canvas failure with semantic proof intact, and inline receipt. Localhost is a secure-context exception for Web Crypto development/rehearsal ([W3C Web Cryptography Level 2](https://www.w3.org/TR/WebCryptoAPI/), Working Draft published 2025-04-22; accessed 2026-07-18). Record:

```powershell
git log -1 --format=%H
git status --porcelain=v1
git ls-files | Select-String -Pattern '(^|/)(\.env|\.env\.local)$'
```

Do not publish localhost, substitute the repository URL into a live-app field, or claim an HTTPS deployment.

## E3 script-to-selector/copy acceptance matrix

Every row must resolve uniquely in this order against the E1 SHA.

| Cue | Exact selector/copy | Acceptance |
|---|---|---|
| Offline mode | `getByRole('switch', { name: /offline proof mode/i })` | Click; `aria-checked=true`; no `/api/proposals` request |
| Pass A | `getByRole('button', { name: /clarify and check/i })`; heading **Geometry is computable. Authority is not.**; **Prepared typed proposal** | One click freezes action and shows `confirmation_required`; no 18 cm text |
| Measurement | `#bookcase-width` has read-only value `100`; `getByRole('button', { name: /record measurement/i })` | Record button is disabled before attestation |
| Required attestation | `getByRole('checkbox', { name: /I measured this 100 cm value/i }).check()` | Checkbox checked; Record button becomes enabled; then click Record |
| Proof | Heading **Only evidence authority changed.**; `MATCH` count 2; authority `1 FIELD` | Exact shipped/tested headline; no alternate normalized headline required |
| Pass B | `getByRole('button', { name: /rerun unchanged proposal/i })`; heading **40 cm fails. 18 cm passes.** | 18 cm appears only after this action |
| Commit | `getByRole('button', { name: /accept 18 cm alternative/i })`; heading **The checked alternative is now canonical.** | Commit succeeds once |
| Receipt | **Five authorizing bases**; **Prepared fallback · no model request**; five IDs, policy/hash, attestation, proof hashes, review, table diff | Visible receipt agrees with backend/provider/script |
| Reset | `getByRole('button', { name: /reset proof/i })` | Checkbox clears; Record is disabled again; flow repeats |

Minimum automated sequence:

```ts
const recordMeasurement = page.getByRole('button', { name: /record measurement/i });
await expect(recordMeasurement).toBeDisabled();
await page.getByRole('checkbox', { name: /I measured this 100 cm value/i }).check();
await expect(recordMeasurement).toBeEnabled();
await recordMeasurement.click();
await expect(page.getByText('Only evidence authority changed.')).toBeVisible();
```

## Verbatim demo script — target 2:15, hard maximum <3:00

The recorded path is explicit offline mode from the local production build. It does not imply hosted delivery or live Terra.

| Time | On-screen action | Verbatim narration |
|---:|---|---|
| 0:00–0:14 | Show Interiorin, authority ledger, measured dining room, and demo policy. | “Interiorin is an evidence-aware spatial studio. This is a disclosed prepared dining-room proof, not a scan or survey, and its demo policy is early decision support—not construction certification.” |
| 0:14–0:32 | Turn **Offline proof mode** on; click **Clarify and check**; point to **Prepared typed proposal**. | “I’m using the prepared offline parser, so the proof does not depend on Wi-Fi. The request is to move the table forty centimetres while preserving a ninety-centimetre path and protecting the bookcase. Deterministic code—not a model—owns authority and geometry.” |
| 0:32–0:51 | Point to **Geometry is computable. Authority is not.**, the 100 cm visual estimate, and absence of any alternative. | “The geometry is computable, but one required width is only a visual estimate. Pass A returns confirmation required without calling the solver. Nothing moves, and no maximum is exposed.” |
| 0:51–1:12 | Point to read-only 100 cm. Show disabled **Record measurement**; check **I measured this 100 cm value for this session.**; show enabled button; click it. | “The value is already one hundred centimetres. I explicitly attest that I measured this value for this session, then record it. One thousand stays one thousand millimetres; only this width’s authority changes from observed-unverified to user-declared.” |
| 1:12–1:31 | Point to **Only evidence authority changed.**, geometry `MATCH`, transaction `MATCH`, authority `1 FIELD`. | “The browser hashes both decisions. Geometry matches. The exact frozen transaction matches. Only evidence authority changed, in the single allowed width fact. That is the causal proof.” |
| 1:31–1:49 | Click **Rerun unchanged proposal**; point to **40 cm fails. 18 cm passes.**, preview, and semantic result. | “Now the identical request may reach the integer solver. Forty centimetres would violate the path, but the maximum checked move is eighteen centimetres. The 3D preview and semantic result agree.” |
| 1:49–2:02 | Click **Accept 18 cm alternative**; point to canonical status. | “I accept the checked alternative. Only the table’s x-position changes—from nine hundred twenty to eleven hundred millimetres.” |
| 2:02–2:15 | Point to inline receipt headings and diff. | “The receipt shows all five authorizing bases, prepared fallback truth, policy and proof hashes, session attestation, required professional review, and the one-field scene diff. An estimate may block a decision; it may never authorize one.” |

### E3 rehearsal protocol

1. Run the selector matrix against the E1 SHA; recording is blocked by any missing/duplicate selector or copy mismatch.
2. Reset and run once with network disabled; verify offline makes no proposal fetch.
3. Verify the Record button disabled → checkbox checked → enabled → click sequence exactly.
4. Run a 375 px manual smoke for causal order, focus, wrapping, and receipt legibility; this is not a mobile release claim.
5. Force Canvas failure outside the timed take; semantic proof and receipt remain operable.
6. Complete three consecutive exact-script runs between 2:05 and 2:25 without missed state, early result, provider/host overclaim, or WebGL dependency.
7. Freeze narration only after these pass; E4 records from a clean local-production profile tied to the E1 SHA.

## Submission checklist

### Repository / README / evidence

- [ ] Public repository opens incognito and release evidence records full final SHA, starting baseline `b1b392f9bde820f492de2215a6c486451f38d0d3`, and `NO_HOST`.
- [ ] README states Node/setup/check/local-production commands, prepared fixture, offline provider, conditional Terra boundary, deterministic authority/solver ownership, session-only receipt, professional-review limit, and interior-only judged scope.
- [ ] README distinguishes pre-existing product work from the Build Week causal delta and records Codex/GPT-5.6 collaboration evidence required by the official rules.
- [ ] `.env.example` contains names only; no `.env`, key, token, full response, or credential is tracked.
- [ ] Final `npm run check`, test count, desktop pass 1/pass 2, same SHA, and empty status evidence are recorded.
- [ ] Reproducible local production instructions and recorded video are supplied; no live deployment URL/claim appears.

### Video

- [ ] Exact checkbox-first script used; target ≤2:25 and hard duration <3:00.
- [ ] 1080p copy/receipt are readable; captions and audio reviewed; no secrets/test chrome.
- [ ] Video shows prepared/offline provider truth and does not imply hosted delivery.
- [ ] Public/unlisted video opens without login in incognito and has stable title/thumbnail.

### Devpost

- [ ] One-liner: **“Interiorin will not let an unverified fact authorize a fit-sensitive spatial change.”**
- [ ] Problem, user, five-fact causal mechanism, deterministic implementation, prepared-data disclosure, GPT-5.6/Codex role, and professional-review boundary are clear.
- [ ] “What’s new” names the final SHA and exact Build Week delta.
- [ ] Technology copy says GPT-5.6 can clarify typed proposals; deterministic code owns dependencies, authority, hashing, solver, outcome, and commit.
- [ ] No claim of hosted runtime, real capture, arbitrary spaces, exterior runtime, professional verification, persistence/moat, voice workflow, generated presentation, mobile release, or live Terra.
- [ ] Repo, video, local setup/test route, and any required fields pass incognito. Never enter localhost as public URL or relabel repo as a live app.

### Essential screenshots only

- [ ] If useful/required: one Pass-A withheld/attestation image and one Pass-B/receipt image from the E1 SHA.
- [ ] Drop images entirely when optional and time/risk rises; extra 375/Canvas/receipt/design images remain cut.
- [ ] No secret/test chrome; accurate alt text/captions.

### E5/E6 lock

- [ ] Title consistently uses **Interiorin**; “Groundline” is internal only if mentioned.
- [ ] README, Devpost, video, provider, `NO_HOST`, test evidence, and final SHA agree.
- [ ] Repo/video links and local instructions pass final incognito QA.
- [ ] Submission saved and confirmation captured by **Jul 21 17:00 Toronto**.
- [ ] E6 17:00–20:00 is only upload/link/form recovery; never code, canary, screenshots, hosting, or new claims.

## Buffer policy

B1, B2, and B3 are genuinely unassigned. Before using one, record the failed E-checkpoint, evidence, narrow repair, owner, and maximum draw. B1 protects conformance/release; B2 protects local delivery/rehearsal/capture; B3 protects required media/link/form work. Reserve cannot fund hosting, live Terra, mobile, optional screenshots, design packet, R3F polish, or roadmap scope. If unused, it remains rest.

Sleep and meals remain protected when a gate fails. The final three-hour E6 guard is additional calendar protection, not part of the six focused contingency hours:

```text
26 h named mandatory focus
+ 6 h genuinely unassigned focus contingency (18.75%)
+ 4 × 7.5 h protected sleep
+ explicit meals/breaks/wind-down
+ final 3 h upload/link/form recovery guard
```

## Post-submission Interiorin roadmap — objective preserved, not implemented

The submission wedge does not replace the user's full Interiorin objective. After E6, Interiorin remains a studio for **real empty and existing interiors and real exterior sites**, honest source-aware 3D, instant reasoned options, bounded voice refinement, named versions/comparison, generated presentation derivatives, and homeowner-to-professional handoff. None is claimed in this release.

1. **Real interior and exterior intake:** guided photos/video, measurements, plans, keep lists, parcel/site records, and professional inputs. Preserve source, freshness, uncertainty, jurisdiction, and authority. Exterior separately covers boundaries, grade/drainage, utilities, setbacks, climate, sunlight, soil, planting, structures, and local rules.
2. **Honest 3D:** editable scenes visibly distinguish measured, homeowner-declared, observed, inferred, and generated elements; semantic facts survive renderer failure. Photorealism never becomes measurement or professional truth.
3. **Instant reasoned options:** several bounded layouts/site options with constraints, trade-offs, blocked facts, rule references, and review needs. Interior and exterior get separately validated rule packs.
4. **Voice via ElevenLabs where useful:** bounded intake, clarification, navigation, and refinement with confirmation of consequential actions and keyboard/touch parity. Voice alone never grants authority.
5. **Gemini / Nano Banana presentation derivatives where useful:** clearly labelled moodboards, concept renders, material stories, and presentation variants linked to an approved factual/version state; never geometric, code, or buildability evidence.
6. **Named versions and factual comparison:** persistent projects, named alternatives, semantic diffs, trade-off comparison, undo as a new transaction, source freshness, unresolved facts, review state, and exportable receipts.
7. **Homeowner/pro handoff:** package intake, chosen version, alternatives, provenance, open questions, and receipts for designers, architects, contractors, landscape designers, surveyors, or engineers; add authenticated, scoped professional review without premature certification.
8. **Validation before breadth:** test each module with homeowners and relevant professionals. Share stable IDs, authority bases, frozen transactions, policies, provider truth, proofs, versions, and receipts, but never reuse the dining-room solver as an exterior safety system.

## Release definition of done

E0–E5 must pass in order on one final SHA and the precommitted `NO_HOST`/offline path. The selector test and recorded demo must visibly check the attestation before Record becomes enabled and use the exact headline **Only evidence authority changed.** The six contingency hours, four sleep blocks, and final E6 guard stay protected under their policies. If selected-action identity, five literal facts, width-only authority, solver-zero Pass A, pre-B non-disclosure, same-SHA desktop evidence, local-production resilience, visible receipt truth, or final claim agreement fails, the causal submission is not release-ready regardless of polish.
