# Forge handoff — `20260718-spatial-design-studio`

## Run header

| Field | Recorded value |
|---|---|
| Run ID | `20260718-spatial-design-studio` |
| Input date | 2026-07-18 |
| Started | 2026-07-18 01:20:00 EDT (America/Toronto) |
| Last state update | 2026-07-18 05:35:53 EDT |
| External deadline | Tuesday, 2026-07-21, 5:00 PM PT / 8:00 PM Toronto; working project and public demo under three minutes required ([OpenAI Build Week rules](https://openai.devpost.com/rules), page current; accessed 2026-07-18) |
| Research | Completed: four lanes and synthesis |
| Ideation loop | **APPROVE**, iteration 3; scores `8/7/7/7/8`, total 37/50 |
| Solution loop | **APPROVE**, iteration 2; scores `7/7/8/8/7`, total 37/50 |
| Plan loop | **APPROVE**, iteration 3; five scores of 9/10, total 45/50 |
| Run state at handoff | `running`; handoff generator in progress. All pre-design loops are approved, but release execution E0–E5 is not recorded complete. |
| Product repository | `E:/Personal Project/Interiorin` · [GitHub repository](https://github.com/KIRTIRAJ4327/Interiorin) |
| Current recorded product commit | `b1b392f9bde820f492de2215a6c486451f38d0d3` (`b1b392f`) |

### Raw intent — verbatim

> Build a real application that lets a homeowner, renter, architect, or designer show an empty or existing **interior or exterior** space and immediately understand what it could become. The product should derive a navigable spatial model, create coherent design directions, recommend choices that fit the space, and let the person refine the result conversationally—especially by voice. Every accepted change should remain grounded in known geometry and objects, become reversible, and be saveable as named options that can be compared before money or construction effort is committed.

Source: [research brief](../00-intake/research-brief.md).

## ⚠ Flags and unresolved findings — read before design

### State flags, verbatim

- `ideation n=2 original generator stalled twice without an artifact; reassigned to a fresh ideator`
- `Groundline is a working mechanism name with architecture/engineering conflicts; public product name remains Interiorin pending final naming check`
- `Hackathon submission slice is interior-only; the user's expanded Interiorin product objective still includes exterior after the judged proof is reliable`

Source: [state.json](../state.json).

### Findings that remain live despite loop approval

- **Naming:** the final uniqueness review found existing architecture, engineering/CAD, construction-audit, and trade-AI uses of “Groundline.” Treat **Interiorin** as the public product name; retain “Groundline” only as an internal mechanism label pending a final name-conflict check ([final uniqueness verdict](../02-ideation/verdict-idea-v3.md)).
- **Narrow novelty:** validation, constraints, provenance, history, diffs, and evidence states are prior art. The approved distinction is only the identical residential transaction changing permitted outcome solely after a recorded measurement-authority event. Renovaitor is the closest newly found residential neighbor ([Renovaitor](https://renovaitor.com/), publication date n.d.; accessed 2026-07-18).
- **No current moat:** the authority enum and hand-written rules are explicitly copyable. A consented professional-correction corpus and held-out policy calibration are a post-deadline hypothesis, not a current asset or result.
- **Evidence status:** `b1b392f` is a clean pushed baseline with supplied green evidence, but the approved plan still requires E0–E5 release conformance, same-SHA checks, local-production resilience, rehearsal, media, claim reconciliation, and submission. Do not present the run itself as released.
- **Submission truth:** the approved branch is **NO_HOST**. Vercel authentication existed, but no linked repository or authorized project was confirmed. The judged path is local production with explicit offline/prepared fallback; it must not claim a public runtime URL or live Terra.
- **Product objective versus implementation:** real intake, arbitrary rooms/sites, exterior runtime, honest general-purpose 3D, multiple reasoned options, ElevenLabs voice, Gemini/Nano Banana derivatives, persistence, named comparison, and homeowner/pro handoff are **not implemented in this release**. They are the design objective and post-submission roadmap.
- **⚠ UNRESOLVED — design loop exhausted:** `04-design/design-document-v3.md` is the highest-scoring design (57/70): IA, flows, specification, direction, anti-slop, and accessibility all meet the 8/10 threshold, but its embedded 953-word §12 Claude prompt scored 7/10 because the 600–1000-word cap could not also carry every exact screen-state string and every secondary token. Final standalone Claude/Codex prompts must compile from the full document, not copy §12 alone ([v3 design verdict](../04-design/verdict-design-v3.md)).

## Agent-by-agent chronicle

### 0. Intake / research brief

**Mission:** translate the raw request into a research contract with a real deadline, explicit truth boundaries, and an interior-plus-exterior product objective.

- Defined the product as a grounded loop from real space → editable model → explained recommendation → conversational refinement → comparable decision.
- Required empty and existing **interior and exterior** intake, but prohibited the claim that one photograph yields survey-grade geometry.
- Required canonical scene state to remain separate from optional generated imagery; voice must resolve through a bounded action layer.
- Set the actual deadline to 2026-07-21 and required a coherent submission slice plus an executable application, not a document-only prototype.
- Required evaluation of ElevenLabs, current image-generation/editing APIs, 21st.dev, `ui-ux-pro`, and `elite-frontend-design` without prematurely locking the architecture.

Artifact: [research brief](../00-intake/research-brief.md).

### 1. Competitor scanner

**Mission:** map commercial products, adjacent tools, research, hackathon projects, and open-source foundations that overlap capture, editable 3D, generation, voice, comparison, and handoff.

- Found photo-to-concept imagery and plan-to-editable-3D already crowded: REimagineHome/Remodel AI/HomeGPT occupy image redesign, while Planner 5D/Homestyler/Coohom/RoomSketcher/Houzz Pro occupy editable planning ([Planner 5D](https://support.planner5d.com/en/articles/15458561/about-ai-studio), published 2026-06-11; [Homestyler](https://www.homestyler.com/forum/view/2068896705599979522), published 2026-06-22; accessed 2026-07-18).
- Separated capture infrastructure—magicplan, Polycam, Matterport, Canvas, RoomPlan—from decision-support products; those tools document measurement/model/export rather than the full generative decision loop ([Apple RoomPlan](https://developer.apple.com/augmented-reality/roomplan/), publication date n.d.; [Canvas](https://support.canvas.io/article/8-what-does-all-of-this-cost), updated 2026-01-15; accessed 2026-07-18).
- Found partial overlaps for voice, history, comparison, and professional workflows, including Planner 5D, Fifi Designs, Home Design 3D, and Houzz Pro; no checked source verified their conjunction in one released residential workflow.
- Identified bounded search gaps: per-element geometry provenance, one canonical interior/exterior representation, voice plus named factual branches, render-to-scene provenance, and structured version diffs. These were search observations, never absence proofs.
- Flagged active open-source building blocks such as open3dFloorplan, Arcada, SuperSplat, and LiteReality, while distinguishing scene/editing infrastructure from an end-user decision product.

Artifact: [competitor scan](../01-research/competitors.md).

### 2. Market analyst

**Mission:** size the relevant decision market, map users and pricing norms, and identify where value and timing concentrate.

- Located value at the homeowner–independent-professional decision moment: the homeowner feels uncertainty; designers, remodelers, and design-build firms are the plausible repeat users/payers. Exact willingness to pay for this product remained unvalidated.
- Recorded professional-adjacent pricing substantially above pure image tools, supporting—but not proving—a seat/project model for professionals and project packs for homeowners.
- Found meaningful renovation stakes: Houzz reported $20,000 median 2025 renovation spend in its selected user sample, and NAHB reported more than 128,000 remodeling firms in Q1 2025 ([Houzz](https://www.houzz.com/magazine/2026-u-s-houzz-and-home-study-renovation-trends-stsetivw-vs~185090855), published 2026-04-22; [NAHB](https://www.nahb.org/news-and-economics/press-releases/2026/05/remodeling-sector-sees-solid-growth-as-nahb-kicks-off-national-home-remodeling-month), published 2026-05-04; accessed 2026-07-18).
- Identified enabling tailwinds in browser voice, natural-language image editing, and mobile spatial capture; kept each provider downstream of the product mechanism ([ElevenLabs WebRTC](https://elevenlabs.io/blog/conversational-ai-webrtc), published 2025-07-21; [Google Gemini 2.5 Flash Image](https://developers.googleblog.com/introducing-gemini-2.5-flash-image/), published 2025-08-26; accessed 2026-07-18).
- Preserved headwinds: price sensitivity, photo-only trust failures, compliance/transparency work, and lack of exact retention or conversion evidence.

Artifact: [market analysis lane](../01-research/market.md).

### 3. Hackathon intelligence

**Mission:** identify the target event, judging constraints, prior winning patterns, saturated ideas, and the strongest judge-facing proof.

- Identified OpenAI Build Week and **Apps for Your Life** as the best-fit track; confirmed the July 21 deadline, working-project requirement, Codex/GPT-5.6 evidence, repository, and public video under three minutes ([official rules](https://openai.devpost.com/rules), page current; accessed 2026-07-18).
- Found that winning spatial demos show one causal transformation with inspectable state; AI changes product state while deterministic methods own geometry/facts ([ONICS](https://devpost.com/software/onics), posted 2026-03-18; [VRoom](https://devpost.com/software/vroom-cm18hl), posted 2025-10-18; accessed 2026-07-18).
- Marked one-photo restyling, prompt-to-3D, generic “agent teams,” voice dictation, XR spectacle, and cinematic fly-throughs without state as saturated patterns.
- Recommended a three-minute chain of truth boundary, spatial state, reasoned options, bounded voice action, saved factual comparison, and a concise technical reveal.
- Warned that claiming accurate editable 3D from one image would create a credibility failure; relevant winners used explicit primitives, multiple views, or visible approximation.

Artifact: [hackathon intelligence](../01-research/hackathon-intel.md).

### 4. Problem miner

**Mission:** mine current user/community/research evidence for concrete pains and translate them into product jobs and truth constraints.

- Found the repeated pain as a broken trust chain: users cannot visualize fit, image generators produce spatially inconsistent fiction, and accurate planners impose excessive setup.
- Interior and exterior reports showed ignored retained objects, broken scale, mutated boundaries, and implausible placement ([Apple App Store reviews](https://apps.apple.com/us/app/interior-ai-room-design/id6702028299?platform=iphone&see-all=reviews), reviews dated 2025; [landscaping report](https://www.reddit.com/r/landscaping/comments/1s2wg1t/tool_to_help_me_visualize_my_landscaping/), published 2026-03-25; accessed 2026-07-18).
- Ranked constraint preservation, empty-space visualization, low-friction intake, controllable edits, and homeowner/pro communication above generic style inspiration.
- Proposed a hybrid spatial twin: photo/plan/guided views plus a scale anchor, known objects/zones, optional concept imagery, bounded actions, and named comparable versions.
- Required professional-review flags and rejected claims about survey accuracy, structures, drainage, utilities, property boundaries, code, or buildability.

Artifact: [problem mining](../01-research/problems.md).

### 5. Research synthesizer

**Mission:** reconcile the four lanes into a decision-grade market position and ranked opportunity set.

- Synthesized the opening as the decision layer joining calibrated canonical state, disclosed assumptions, reasoned options, bounded actions, factual comparison, and professional handoff—not “AI interior/exterior design.”
- Selected independent residential professionals as likely repeat users/payers and homeowners as co-users; the core JTBD is to create two constraint-aware possibilities, revise without losing truth, and hand unresolved questions onward.
- Preserved contradictions: instant versus accurate, canonical 3D versus photoreal delight, consumer pain versus professional payment, and shared interior/exterior primitives versus separate domain rule packs.
- Ranked the calibrated empty-space option studio first, followed by client/pro handoff, bounded voice editing, exterior review flags, and render provenance.
- Initially recommended a polished interior case plus a lighter exterior proof for deadline realism. The later uniqueness verdict resolved this tension by cutting exterior entirely from the judged slice while preserving it in the product objective.
- Kept market claims bounded: no exact incidence, retention, professional WTP, capture threshold, exterior data reliability, or residential voice demand was established.

Artifact: [research synthesis](../01-research/market-analysis.md).

### 6. Ideator — iterations 1–3

**Mission:** turn the synthesis into one evidence-grounded, judge-repeatable concept.

- **v1:** proposed Groundline as truth-bearing branches over a calibrated interior/exterior baseline, with voice, comparison, handoff, and image derivatives all derived from a canonical scene. Its broad “validated diff” novelty collided with existing validation, versioning, provenance, and handoff systems. Artifact: [idea v1](../02-ideation/idea-v1.md).
- **v2:** narrowed novelty to pre-commit truth checks, made interior the submitted product, reduced exterior to a brief replay, removed provider novelty, defined categorical outcomes, and centered one adversarial 40 cm table move. Fresh research found Agentic Designer already owned proposal → verification → adjustment before commit. Artifact: [idea v2](../02-ideation/idea-v2.md).
- **v3:** narrowed again to evidence-authority gating; removed pseudo-probabilities; used categorical authority states; cut exterior, voice, imagery, capture, persistence, and comparison from submission; and made the demo a controlled A/B where only authority changes. Artifact: [idea v3](../02-ideation/idea-v3.md).
- The final submission promise became one prepared interior transaction: the same geometry and request are blocked while a required width is observed/unverified, then yield an exact 18 cm limited move after the unchanged value becomes user-declared.
- The full Interiorin vision remained explicitly post-deadline, with no claim that the fixed authority enum is a moat.

### 7. Uniqueness critic — three verdicts

**Mission:** independently search for prior art and approve only a concept whose exact distinction survives nearest-neighbor attack.

- **v1 — REVISE, 30/50:** `problem_reality 8`, `differentiation 6`, `competitor_overlap 5`, `wedge_defensibility 5`, `hackathon_novelty 6`. VRoom, MeshMerge, DesignTrace, Speckle, and Remodel My Home invalidated broad novelty claims around validation, diffs, branches, traceability, history, voice, and handoff.

  > “narrow the judge claim to: ‘Groundline checks an AI-proposed spatial change against fact-status-labelled reality before it can commit.’”

  Artifact: [idea verdict v1](../02-ideation/verdict-idea-v1.md).

- **v2 — REVISE, 30/50:** the same scores. The narrowed pre-commit claim collided with Agentic Designer; numeric confidence was uncalibrated; the 18 cm scenario did not prove authority changed the outcome. The critic required categorical authority and an identical-transaction A/B.

  > “Groundline will not let an unverified fact authorize a fit-sensitive spatial change.”

  Artifact: [idea verdict v2](../02-ideation/verdict-idea-v2.md).

- **v3 — APPROVE, 37/50:** `8/7/7/7/8`. Renovaitor, magicplan, Impulse, and evidence-bound authorization literature were conceded. Approval attached only to the residential mutation-time A/B contract.

  > “visibly hash or diff the typed transaction and geometry before both passes, then highlight the authority event as the sole changed field.”

  Artifact: [idea verdict v3](../02-ideation/verdict-idea-v3.md).

### 8. Solution architect — iterations 1–2

**Mission:** translate the approved A/B contract into an executable architecture and a credible deadline slice.

- **v1:** designed dependency discovery before authority evaluation, an integer-millimetre solver, canonical hash projections, event/receipt contracts, prepared R3F workbench, proposal route, and fallback. It overbuilt consent/review/undo surfaces, lacked a client-executable hash boundary, and did not enumerate every numeric authority basis. Artifact: [solution v1](../02-ideation/solution-v1.md).
- **v2:** chose browser `crypto.subtle` and awaited proof states; enumerated five exact facts; scoped the only authority event to `bookcase.width_mm`; required the selected adapter action to be frozen and reused through A/proof/B/commit/receipt.
- Replaced ambiguous scope labels with `EXISTS / BUILD / CONDITIONAL / STUB / CUT`, made live `gpt-5.6-terra` conditional on an exact envelope and genuine response ID, and kept explicit offline mode independent.
- Reduced the demo to 2:15 with semantic proof outside the Canvas boundary and complete pre-B denial of every 18 cm/180 mm equivalent.
- Cut voice, image generation, arbitrary intake, exterior, persistence, catalogs, costs, CAD/BIM, certification, and 21st.dev work from the judged architecture.

Artifact: [solution v2](../02-ideation/solution-v2.md).

### 9. Solution critic — two verdicts

**Mission:** attack mechanism correctness, feasibility, provider truth, demo resilience, and scope honesty against the real repository.

- **v1 — REVISE, 32/50:** `implementation_feasibility 5`, `demoability 6`, `novelty_of_approach 8`, `judge_appeal 7`, `scope_honesty 6`. The 180 mm math and authority-before-solver sequence were sound, but the as-written build was estimated at 41–67 hours and the proof/authority contracts were incomplete.

  > “choose an executable hash boundary: browser `crypto.subtle.digest` with awaited proof state or a server proof endpoint.”

  Artifact: [solution verdict v1](../02-ideation/verdict-solution-v1.md).

- **v2 — APPROVE, 37/50:** `7/7/8/8/7`. All six architecture findings closed. The critic independently confirmed the stack claims and found the remaining risks to be release execution: stale baseline arithmetic and nondeterministic parallel Playwright timeouts despite screenshots reaching committed state.

  > “feed the exact stored provider/fallback action into pass A, all six proof digests, pass B, commit, and receipt, with identity plus byte-equality tests.”

  Artifact: [solution verdict v2](../02-ideation/verdict-solution-v2.md).

### 10. Planner — iterations 1–3

**Mission:** turn the approved solution into a deadline-backed, dependency-ordered build/release plan with cut lines, evidence gates, and an executable demo script.

- **v1:** planned the interior-only causal slice but used an obsolete baseline, underestimated integration/media/hosting work, left capacity scenarios unresolved, and did not fully align tests, provider truth, deployment fallback, and script selectors. Artifact: [plan v1](../03-plan/plan-v1.md).
- **v2:** rebased to clean pushed `b1b392f`; credited landed causal/provider/receipt/attestation work; shifted from rebuild to conformance; selected one-builder capacity; made HOST/NO_HOST explicit; preserved exact facts, solver-zero Pass A, no-leak checks, and same-SHA desktop evidence. Its script still omitted the required checkbox and the schedule sat at the optimistic edge. Artifact: [plan v2](../03-plan/plan-v2.md).
- **v3:** selected C-high with 26 mandatory hours plus 6 unassigned contingency, protected four 7.5-hour sleep blocks, precommitted NO_HOST, and normalized E0–E6 meanings across schedule, gates, commands, script, and submission.
- The executable 2:15 script uses explicit offline mode, the real checkbox-first attestation, shipped proof headline, delayed 18 cm reveal, commit, and visible receipt.
- The post-submission roadmap restores the complete Interiorin objective without claiming it in the judged release.

Artifact: [plan v3](../03-plan/plan-v3.md).

### 11. Plan critic — three verdicts

**Mission:** audit schedule realism, cut lines, risk order, demo executability, and dependency sanity.

- **v1 — REVISE, 30/50:** `schedule_realism 5`, `cut_lines 7`, `risk_frontloading 7`, `demo_script 6`, `dependency_sanity 5`. It required a current clean pin, realistic 17–30 hour remaining envelope plus contingency, complete causal/provider invariants, same-SHA browser evidence, truthful no-host fallback, and 5.5–9 hours for media/submission.

  > “select a concrete one-worker capacity scenario, correct the package minimum from 14 h to 14.5 h, and reconcile the schedule with the critic’s 17–30 h remaining mandatory envelope plus 4–6 h contingency.”

  Artifact: [plan verdict v1](../03-plan/verdict-plan-v1.md).

- **v2 — REVISE, 33/50:** `6/8/8/5/6`. Most v1 gaps closed, but the baseline pin, E-numbering, checkbox-first script, proof headline, and branch-specific time allocations still needed correction.

  > “add the tested checkbox action `getByRole('checkbox', { name: /I measured this 100 cm value/i }).check()` before **Record measurement**.”

  Artifact: [plan verdict v2](../03-plan/verdict-plan-v2.md).

- **v3 — APPROVE, 45/50:** five scores of 9/10. The critic accepted exact arithmetic, protected contingency/sleep, precommitted NO_HOST, causal-first cuts, executable offline script, and unambiguous E0→E6 chain.

  > “record the two reset runs, zero-fetch observation, Web Crypto result, Canvas-fallback result, final SHA, and empty status as separate release evidence.”

  Artifact: [plan verdict v3](../03-plan/verdict-plan-v3.md).

## Approved artifacts — faithful condensations

### Approved idea (129 words)

Groundline is an evidence-authority gate for fit-sensitive residential changes. GPT-5.6 may clarify a homeowner’s language into a visible typed transaction, but deterministic code alone discovers dependencies, evaluates authority, solves geometry, and mutates the scene. In the judged proof, a prepared dining-room request asks to move a table 40 cm while preserving a 90 cm path and a protected bookcase. Pass A sees the required 1,000 mm bookcase width as `observed_unverified`, returns `confirmation_required`, and withholds any actionable alternative. The homeowner deliberately attests to the same 1,000 mm value; geometry and transaction stay unchanged while only that fact becomes `user_declared`. Pass B may then expose the maximum-valid 18 cm move and commit it with a source-linked receipt and professional-review flag. Exterior and the broader product are not submission claims. Source: [approved idea](../02-ideation/idea-v3.md).

**Differentiation sentence — VERBATIM, protected from drift:**

> **Groundline will not let an unverified fact authorize a fit-sensitive spatial change.**

### Approved solution (142 words)

The submission is a prepared, interior-only Next.js/React/R3F proof. One selected offline-or-live adapter result creates the deep-frozen transaction reused by Pass A, six browser SHA-256 digests, Pass B, commit, and receipt. Dependency discovery must return exactly five millimetre facts: table center/width, bookcase center/width, and path minimum clearance. Pass A cannot call the solver; only `bookcase.width_mm` changes authority, while its value and bookcase height/depth remain byte-equal. Only after proof-valid Pass B may deterministic integer geometry reveal 180 mm and move table x from 920 to 1,100 mm. A semantic numeric proof remains operable outside Canvas failure. The inline receipt exposes facts, provider truth, policy/hash, attestation, proof digests, review status, and one-field diff. Live Terra is conditional; explicit offline prepared fallback is valid. Capture, exterior, voice, imagery, persistence, and professional verification are cut. Source: [approved solution](../02-ideation/solution-v2.md).

### Approved plan (146 words)

Begin from clean pushed `b1b392f` and execute one stable chain: E0 conformance, E1 same-SHA desktop assertion, E2 NO_HOST local-production resilience, E3 selector-exact rehearsal, E4 media/package, E5 reconciliation/submission, and E6 recovery-only guard. One builder has 32 focused hours: 26 named mandatory plus three unassigned two-hour reserves; four 7.5-hour sleep blocks remain protected. Hosting and live Terra are pre-cut. E2 must separately evidence two reset runs, offline zero-fetch, Web Crypto, Canvas fallback with semantic proof, visible receipt, final SHA, and empty status. The 2:15 recording uses explicit offline mode, shows Record disabled, checks the real 100 cm attestation, records the unchanged value, displays “Only evidence authority changed.”, reveals 18 cm only after rerun, commits, and ends on the receipt. README, video, Devpost, repository, NO_HOST status, provider mode, and SHA must agree before the 17:00 Toronto lock. Source: [approved plan](../03-plan/plan-v3.md).

## Current implementation and submission truth

At recorded baseline `b1b392f9bde820f492de2215a6c486451f38d0d3`, `HEAD == origin/main` and the worktree were reported clean. Supplied verification recorded:

- `npm run check` green with lint, typecheck, **10 test files / 29 tests**, and production build.
- Production desktop Chromium and Pixel 7 E2E **2/2** green, plus an additional desktop receipt run.
- Exact five `_mm` fact IDs shared by proof and receipt; width-only authority transition; unchanged height/depth canonical bytes.
- One deep-frozen selected provider action with identity/canonical-value evidence through proof and receipt; an injected solver spy at zero calls in Pass A.
- DOM, accessibility, and Canvas-prop denial of the 180 mm result before valid Pass B; visible inline receipt evidence.
- Exact live envelope enforcement for `gpt-5.6-terra` plus genuine response ID/canary configuration; aliases or missing IDs force truthful fallback.
- Required checkbox “I measured this 100 cm value for this session.” gates Record; reset clears the attestation; component and production E2E cover it.

These are supplied baseline checks, not a completed E0–E5 release record. The approved submission path remains **NO_HOST + local production + explicit offline prepared fallback**. Its receipt/copy must say **Prepared fallback · no model request**. Public evidence is repository, reproducible local instructions, and recorded video; no live application URL, live Terra use, real capture, exterior runtime, voice, or broad product capability may be claimed. Source: [approved plan baseline and gates](../03-plan/plan-v3.md).

## Distilled design context — standalone (≤500 words)

**Product one-liner:** Interiorin is a source-aware spatial design studio that helps people explore what a real space could become without letting guesses masquerade as fit, measurement, or professional truth. The protected internal differentiation sentence is: **“Groundline will not let an unverified fact authorize a fit-sensitive spatial change.”**

**Users:** Homeowners/renters need to understand an empty or existing room, facade, patio, balcony, yard, or unfinished space before spending. Independent interior designers, architects, landscape designers, remodelers, contractors, and small design teams are the likely repeat professional users and handoff recipients; payer and willingness-to-pay remain unvalidated.

**Mechanism:** Maintain canonical, editable spatial facts with stable IDs and explicit source/authority (`measured/verified`, homeowner-declared, observed-unverified, inferred, generated). Language and voice compile to inspectable typed actions; deterministic rules own authority, geometry, constraints, outcomes, and commits. Photoreal presentation is downstream and labelled. Interior and exterior share safe primitives but use separately validated rule packs.

**Demo moment / current truth:** The implemented judged slice is only a prepared interior dining room at `b1b392f`, shown through NO_HOST local production and explicit offline fallback. A 40 cm table request is blocked because one unchanged 100 cm width is only observed; the user attests to measuring that same value; hashes show geometry and transaction match while one authority field changes; only then may the solver reveal an 18 cm safe alternative, commit it, and show a receipt. Do not imply real intake, general 3D, exterior, voice, multiple options, persistence, or professional review is already shipped.

**The three core flows that the full product design must support:**

1. **Intake → honest spatial baseline:** accept guided photos/video, measurements, plans, existing-object/keep lists, and—for exteriors—parcel/site and professional inputs. Produce navigable, editable interior or exterior 3D that visibly distinguishes measured, declared, observed, inferred, and generated facts, requests missing evidence, and remains usable semantically if rendering fails.
2. **Reasoned options → bounded refinement:** generate several instant, materially different layouts/site options with fit, constraints, trade-offs, blocked facts, rule references, and review needs. Let users refine by direct manipulation, keyboard/touch, and ElevenLabs voice where useful; consequential changes require visible confirmation. Gemini/Nano Banana may create labelled moodboards, concept renders, material stories, and presentation variants linked to the approved factual version—never geometry or buildability evidence.
3. **Name → compare → hand off:** save persistent named alternatives; compare semantic changes, reasons, trade-offs, source freshness, unresolved facts, review state, and presentation derivatives; undo through a new transaction; package the selected version, alternatives, provenance, receipts, and open questions for scoped homeowner/pro review without implying certification.

**Tone and interface constraints:** editorial spatial workbench, calm and exact rather than futuristic spectacle; truth before delight; 3D beside semantic proof, not instead of it. Avoid generic AI gradients, purple shadcn dashboards, and feature-inventory chrome. Use progressive disclosure for homeowners, professional density on demand, persistent prepared/provider/review labels, text+icon+border states, semantic tables, strong focus/contrast, 44 px controls, keyboard/touch parity, reduced motion, and clear recovery. Generated imagery must be visibly labelled and never silently alter canonical boundaries, openings, objects, grade, drainage, utilities, property lines, or code status.
