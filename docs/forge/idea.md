# Groundline — evidence authority for spatial changes

**Iteration:** 3  
**Run:** `20260718-spatial-design-studio`  
**Evidence access date:** 2026-07-18 for every linked source below.

## Findings addressed

| Critic finding | What changed |
|---|---|
| Pre-commit validation collides with Agentic Designer | The judge sentence now claims only evidence-authority gating, exactly: “Groundline will not let an unverified fact authorize a fit-sensitive spatial change.” Agentic Designer's stepwise validation before commit is explicitly conceded. |
| Numeric confidences were unsupported pseudo-probabilities | Removed every decimal and threshold. The contract now uses `verified`, `user_declared`, `observed_unverified`, `inferred`, and `generated`, with explicit permissions, promotions, and revocations. |
| The demo did not prove that authority changes the outcome | Rebuilt it as an A/B test of the identical transaction. An `observed_unverified` bookcase bound causes `confirmation_required`; entering the matching measurement changes only authority, then unlocks the maximum-valid 18 cm `limited` alternative. |
| The nearest-neighbor set was incomplete | Added and conceded Agentic Designer, FloorPlanCheck, Higharc, and Drafted; every contrast is narrowed to evidence authority at mutation time. |
| The fixed enum was not defensible | Explicitly says it is copyable and not a present moat. Added a post-deadline professional-correction record and calibration loop, with no claim that a dataset or advantage exists today. |

## One-liner

**Groundline will not let an unverified fact authorize a fit-sensitive spatial change.**

## 30-second pitch

A homeowner asks Groundline to move a dining table 40 centimetres while preserving a 90-centimetre path and a protected bookcase. GPT-5.6 clarifies that request into a visible typed transaction but cannot mutate the room. On the first run, Groundline refuses to calculate an actionable fit from the merely observed bookcase bound and asks for one measurement. The user enters the same bound; no geometry or request changes, only its authority. The identical transaction now yields a deterministic maximum-valid move of 18 centimetres. Groundline commits that limited alternative with a receipt showing which declared facts authorized it and what still requires professional review.

## The problem

### Who and severity

The primary co-user is a homeowner making an early furnishing or remodel decision. The likely repeat user is an independent residential designer or remodeler reviewing that decision. **ASSUMPTION:** the professional is the payer; willingness to pay for this exact authority-gating workflow is unvalidated.

The pain is not a shortage of attractive concepts. It is that proposals can silently treat guesses as facts:

- An empty-apartment user could not visualize the whole room and prioritized fit and layout before decor; landscape practitioners separately report difficulty translating 2D plans into scale and volume ([Reddit r/Interiordesigntips](https://www.reddit.com/r/Interiordesigntips/comments/1qh9cqx/the_biggest_mistake_i_made_furnishing_my_first/), published 2026-01-19; [Reddit r/landscapedesign](https://www.reddit.com/r/landscapedesign/comments/1rxle2y/do_homeowners_struggle_to_visualize_landscaping/), published 2026-03-19; accessed 2026-07-18).
- Interior-app reviews report ignored layouts, retained-item requests, and physically impossible placements; an exterior user reported mutated bed geometry, added objects, and broken scale despite detailed annotations ([Apple App Store reviews](https://apps.apple.com/us/app/interior-ai-room-design/id6702028299?platform=iphone&see-all=reviews), reviews dated 2025-06-06 to 2025-10-24; [Reddit r/landscaping](https://www.reddit.com/r/landscaping/comments/1s2wg1t/tool_to_help_me_visualize_my_landscaping/), published 2026-03-25; accessed 2026-07-18).
- Accurate planners impose setup friction: review aggregation surfaces hours of measurement entry, irregular-room problems, scale errors, collisions, crashes, and restrictive catalogs. This supports qualitative failure themes, not incidence ([Appsupports](https://appsupports.co/1076159017/home-planner-ai-room-design/negative-reviews), surfaced 2026; accessed 2026-07-18).
- Houzz's selected respondent sample reported a $20,000 median 2025 renovation spend and 37% of budget setters exceeding budget. This establishes meaningful stakes among those respondents, not causation or population prevalence ([Houzz & Home Study](https://www.houzz.com/magazine/2026-u-s-houzz-and-home-study-renovation-trends-stsetivw-vs~185090855), published 2026-04-22; accessed 2026-07-18).

**Severity:** high when a guessed dimension reaches purchasing or construction; moderate evidence for the exact workflow; unknown incidence, retention, payer identity, and willingness to pay. A 2025 architecture study supports rapid AI ideation paired with continuing professional feasibility judgment, not replacement of that judgment ([Schneider, Kılıç, and Stockhammer](https://arxiv.org/abs/2411.15061), first submitted 2024-11-22, revised 2025-01-15; accessed 2026-07-18).

## The mechanism: evidence-authority gating

**Judge-repeatable differentiation:** **Groundline will not let an unverified fact authorize a fit-sensitive spatial change.**

Groundline does not claim pre-commit geometric validation. Agentic Designer already frames interior layout as proposal → geometric verification → adjustment and validates before placement commit. Nor does Groundline claim confirmed-plan checking, evidence-linked reports, persistent constraints, or grounded residential geometry: FloorPlanCheck, Higharc, and Drafted already establish those surfaces ([Agentic Designer](https://doi.org/10.1109/TPAMI.2026.3711762), published 2026; [FloorPlanCheck](https://floorplancheck.com/), publication date n.d.; [Higharc](https://www.higharc.com/blog/ai-layout-at-higharc-tokenizing-buildings), published 2026-04; [Y Combinator — Drafted](https://www.ycombinator.com/companies/drafted), Spring 2026 company profile; accessed 2026-07-18).

The one mechanism is an **authority state machine** in front of the geometry solver. A constraint may be geometrically computable yet forbidden from authorizing a fit-sensitive commit. “Unverified” in the judge sentence means `observed_unverified`, `inferred`, or `generated`; a `user_declared` value is authorized only for the exact session assertion and is not represented as survey-grade or professionally verified.

### Authority contract

| Authority state | May authorize | May not authorize |
|---|---|---|
| `verified` | Fit-sensitive checks within the verified fact's scope; preservation and collision rules | Any claim outside the evidence scope, including code or construction certification |
| `user_declared` | Fit-sensitive checks using the exact dimension, path minimum, target identity, or lock deliberately entered by the user; the receipt retains a professional-review flag | Hidden dimensions, broader geometry, or professional accuracy |
| `observed_unverified` | Presence, visual preview, candidate collision warning, and a request for the missing measurement | A fit-sensitive commit or maximum-valid alternative |
| `inferred` | Ranking, preview, clarification, and evidence requests | Mutation authority or silent promotion |
| `generated` | A typed candidate operation and rationale for deterministic evaluation | Establishing a fact, changing authority, or approving itself |

Allowed transitions are explicit and event-backed:

- `inferred → observed_unverified` only when the user identifies the element in a source view; this still cannot authorize fit.
- `inferred` or `observed_unverified → user_declared` only through a deliberate value entry or attestation whose scope is stored with the fact.
- `user_declared → verified` only when a professional or accepted measurement source verifies that same scoped value.
- `generated` never promotes itself; new user or professional evidence creates a separate fact and supersedes the proposal's unsupported field.
- Any authoritative fact becomes `observed_unverified` when withdrawn, contradicted, stale for the decision, or corrected; dependent transactions return to review.

There are four deterministic outcomes:

| Outcome | Authority condition | Scene effect |
|---|---|---|
| `accepted` | Every fit-sensitive dependency is `verified` or scoped `user_declared`, and all rules pass | Commit the requested delta with source-linked receipt |
| `limited` | Dependencies are authorized, the request fails a rule, and a non-zero maximum-valid delta passes | Offer the exact alternative; commit only after user acceptance |
| `confirmation_required` | Geometry is computable but any fit-sensitive dependency is `observed_unverified`, `inferred`, or ambiguous | No mutation and no actionable fit claim; request the exact missing evidence |
| `refused` | The operation is forbidden, violates a protected element with no valid alternative, or needs a fact Groundline cannot certify | No mutation; name the rule and unavailable authority |

GPT-5.6 has one visible role: clarify language and displayed context into a typed proposal such as `move(table_01, toward=wall_north, requested_delta_cm=40)`. The user can inspect or correct it. Deterministic code exclusively owns authority transitions, rule evaluation, maximum-valid search, outcomes, and scene mutation.

## The submitted product

The submission is **interior-only**: one prepared living/dining baseline, one table move axis, one entered path constraint, one protected bookcase, the five authority states, and the four outcomes. Comparison/export are optional serializations of the receipt after the A/B proof works.

Exterior is cut from the submission and demo. The future architecture can reuse stable IDs, authority transitions, typed proposals, and transaction outcomes with separate exterior rules, but buyer need and authoritative site data are not established. No exterior capability is implied by the judged build.

Photorealism, voice, arbitrary capture/reconstruction, catalogs, cost, collaboration, CAD/BIM, and certification are also cut.

## Why now

Recent user evidence shows generated interior and exterior concepts still mutate retained geometry, while current research positions professional feasibility review as a complement to rapid AI ideation ([Apple App Store reviews](https://apps.apple.com/us/app/interior-ai-room-design/id6702028299?platform=iphone&see-all=reviews), reviews dated 2025-06-06 to 2025-10-24; [Reddit r/landscaping](https://www.reddit.com/r/landscaping/comments/1s2wg1t/tool_to_help_me_visualize_my_landscaping/), published 2026-03-25; [Schneider, Kılıç, and Stockhammer](https://arxiv.org/abs/2411.15061), revised 2025-01-15; accessed 2026-07-18). Meanwhile, Agentic Designer, Higharc, and Drafted show that constraint-aware residential generation/editing is arriving now, making the missing governance question—what evidence is allowed to authorize those constraints—timely rather than making constraint checking itself novel ([Agentic Designer](https://doi.org/10.1109/TPAMI.2026.3711762), published 2026; [Higharc](https://www.higharc.com/blog/ai-layout-at-higharc-tokenizing-buildings), published 2026-04; [Y Combinator — Drafted](https://www.ycombinator.com/companies/drafted), Spring 2026; accessed 2026-07-18).

## Why it can win the hackathon

OpenAI Build Week equally weights technological implementation, coherent design, credible impact, and idea quality/novelty, with technology breaking ties; it requires a runnable project and public demo under three minutes ([official rules](https://openai.devpost.com/rules), page current 2026-07-18; accessed 2026-07-18).

The demo provides one controlled causal contrast rather than a feature tour: the same typed transaction and same geometry produce different outcomes solely because an evidence event changes authority. GPT-5.6's clarification is visible, the state transition is inspectable, and deterministic code prevents a plausible-looking but unauthorized mutation. ONICS and VRoom already demonstrate judge appeal for model reasoning paired with deterministic geometry and recoverable spatial state; Groundline adopts those patterns while making the A/B authority gate its only novelty claim ([ONICS](https://devpost.com/software/onics), posted 2026-03-18; [VRoom](https://devpost.com/software/vroom-cm18hl), posted 2025-10-18; accessed 2026-07-18).

## Nearest neighbors

1. **Agentic Designer:** already verifies and adjusts generated interior placements before commit; Groundline claims only that a check cannot authorize fit unless each supporting fact has `verified` or scoped `user_declared` authority ([IEEE DOI](https://doi.org/10.1109/TPAMI.2026.3711762), published 2026; accessed 2026-07-18).
2. **FloorPlanCheck:** already uses human-confirmed plan facts, evidence-tied flow/conflict checks, confidence notes, professional-confirmation flags, and designer-ready reports; Groundline's narrower difference is an explicit authority transition changing the outcome of an attempted mutation at transaction time ([FloorPlanCheck](https://floorplancheck.com/), publication date n.d.; accessed 2026-07-18).
3. **Higharc:** already generates and edits BIM-native residential layouts while evaluating circulation, overlap, and clearance; Groundline does not claim grounded constraints, only that approximate homeowner intake cannot authorize fit until evidence enters an allowed state ([Higharc](https://www.higharc.com/blog/ai-layout-at-higharc-tokenizing-buildings), published 2026-04; accessed 2026-07-18).
4. **Drafted:** already persists user-defined footprints, lot boundaries, room relationships, and area constraints across residential generation; Groundline's only distinction is refusing a mutation when its required fact is merely observed or inferred, then recording the evidence event that unlocks it ([Y Combinator — Drafted](https://www.ycombinator.com/companies/drafted), Spring 2026 company profile and launch post; accessed 2026-07-18).

VRoom, MeshMerge, DesignTrace, and Speckle remain conceded prior art for validation/history/rollback, semantic diffs/reports, branched provenance/rationale, and object traceability respectively ([VRoom](https://devpost.com/software/vroom-cm18hl), posted 2025-10-18; [MeshMerge](https://devpost.com/software/meshmerge), posted 2026-02-09; [DesignTrace paper](https://xiaohanp.github.io/pdf/CHI_26_DesignTrace.pdf), published 2026-04; [Speckle](https://speckle.systems/present-and-review-models/), publication date n.d.; accessed 2026-07-18).

## Independence check

Three fresh search frames on 2026-07-18 tested (1) fact authority in AI spatial change, (2) residential evidence gating before mutation, and (3) user-confirmed measurements before fit-sensitive edits. They reinforced that validation, constraints, and user confirmation are crowded. They also surfaced Impulse, an industrial-CAD product claiming evidence-backed physical state, asking when uncertain, and measuring changes before commit; Groundline therefore does not claim evidence-bearing engineering workflows broadly ([Impulse](https://www.impulse.build/), publication date n.d.; accessed 2026-07-18).

No checked result exposed the exact residential A/B contract in which unchanged geometry and an unchanged transaction move from `confirmation_required` to an authorized alternative solely through a recorded authority transition. This is a bounded search result, not proof that no private or unindexed implementation exists.

## Demo moment: authority is the only variable

The prepared baseline stores `path_min_cm=90` as `user_declared`, `protect(bookcase_01)=true` as `user_declared`, and the visually estimated bookcase bound as `observed_unverified`.

**Pass A — blocked:**

1. The presenter asks: “Move the dining table 40 centimetres toward the wall; keep the 90-centimetre path and do not touch the bookcase.”
2. GPT-5.6 displays the resolved typed transaction. Deterministic geometry can see that the bookcase bound matters, but its authority state cannot support fit.
3. Outcome: `confirmation_required`. Nothing moves. Groundline asks for one measurement: the bookcase face-to-wall reference used by this move.

**Evidence event:** the presenter enters the measured value, which matches the existing observed coordinate. Groundline records `observed_unverified → user_declared`. The scene coordinates, path, lock, target, and requested 40 cm transaction remain byte-for-byte unchanged.

**Pass B — authorized but limited:**

4. The presenter reruns the identical transaction. The full 40 cm still violates the declared path/protected bound.
5. Because every fit-sensitive dependency is now authorized, deterministic search may expose the maximum-valid 18 cm alternative. Outcome: `limited`.
6. The presenter accepts 18 cm. The receipt records requested 40 cm, committed 18 cm, the authority transition, the rules invoked, and a professional flag on the user-declared measurement.

The A/B screen highlights a single changed field—authority—so an ordinary constraint checker cannot be mistaken for the product claim.

## Post-deadline defensibility path

The fixed enum and hand-written transition rules are copyable and are **not** a current moat. After submission, and only with professional participation and appropriate consent, each verification/correction record must pair:

- the original fact value/geometry, authority state, source type, and capture method;
- the unchanged typed proposal and Groundline outcome;
- the professional's verified or corrected measurement and disposition.

Those paired records can measure correction rates by fact type and capture method, then calibrate future transition rules—for example, which capture methods may create `verified` facts, which must stay `observed_unverified`, and when a `user_declared` fact still requires professional confirmation. Rule changes must be versioned and evaluated on held-out professional corrections before deployment. **ASSUMPTION:** a sufficiently large, consented correction corpus could become a defensibility asset; no such dataset, calibration result, learning advantage, or moat exists for the submission.

The first measurable professional outcome is **first-pass verification rate**: committed receipts verified without correcting any supporting spatial fact divided by committed receipts reviewed. The correction rate by source/capture method is the input to later calibration, not evidence of present accuracy.

## Delivery constraint and cut line

**Hard deadline:** **July 21, 2026 at 5:00 PM PT / 8:00 PM Toronto.** The event requires a working project using Codex and GPT-5.6, repository/session evidence, and an under-three-minute public demo ([OpenAI Build Week](https://openai.devpost.com/), page current 2026-07-18; [official rules](https://openai.devpost.com/rules), page current 2026-07-18; accessed 2026-07-18).

**ASSUMPTION:** team size, baseline code, hardware, assets, and credentials are unknown. Protect only the interior A/B: one prepared scene, one typed GPT-5.6 proposal, categorical authority states and transitions, `confirmation_required`, measurement entry, deterministic 18 cm maximum-valid search, `limited`, commit, and receipt. Exterior and the post-deadline data loop are not submission scope. Comparison/export ship only after this causal proof is reliable.

## Discarded candidates

1. **Constraint Preflight — validate every AI room edit before commit.** Dropped because Agentic Designer already publishes proposal, geometric verification, adjustment, and validation before each placement commit ([Agentic Designer](https://doi.org/10.1109/TPAMI.2026.3711762), published 2026; accessed 2026-07-18).
2. **Verified Plan Brief — confirm plan facts, report conflicts, and export professional review.** Dropped because FloorPlanCheck already claims human-confirmed facts, evidence-linked issues, confidence notes, professional flags, and designer-ready reports ([FloorPlanCheck](https://floorplancheck.com/), publication date n.d.; accessed 2026-07-18).

## Bottom line

The submission is one falsifiable proof: with geometry and intent held constant, an observed guess blocks the move; one deliberate measurement changes only evidence authority and unlocks the 18 cm maximum-valid alternative.
