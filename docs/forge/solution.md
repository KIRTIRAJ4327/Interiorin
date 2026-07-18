# Groundline — solution architecture v2

**Run:** `20260718-spatial-design-studio`  
**Iteration:** 2  
**Approved idea:** `idea-v3.md`  
**Prior solution verdict:** `verdict-solution-v1.md` — `REVISE`  
**Inspected product commit:** `b25b90f21751d9f1bd87caebc383ef7d771034fd`  
**Submission deadline:** July 21, 2026, 5:00 PM Pacific Time  
**Dependency/source access date:** 2026-07-18 unless stated otherwise

## Findings addressed

| # | Solution-v1 finding | What changed in v2 |
|---:|---|---|
| 1 | Add availability/effort and cut overbuilt policy, consent, review, undo, receipt, and health surfaces | Added a current-commit effort and availability audit, dated cut milestones, and an automatic low-availability cut ladder. Correction reuse, consent withdrawal, reviewer identity, undo-as-transaction, receipt self-hash, and the health endpoint are **CUT**. The slice retains one policy hash, one scoped session attestation, `professionalReview.required/status=unreviewed`, provider truth, A/B proof, a basic inline receipt, and one-field commit diff. |
| 2 | Choose an executable SHA-256 boundary and narrow the “only field” claim | Pinned proof execution to the existing browser `globalThis.crypto.subtle.digest("SHA-256", …)` path and awaited proof state. The UI claim is exactly **“Normalized decision inputs differ only by authority.”** The full source/attestation event is shown separately and is not described as a one-field raw audit diff. |
| 3 | Enumerate authority bases for all five solver inputs | Added exact records for `table.center_x_mm`, `table.width_mm`, `bookcase.center_x_mm`, `bookcase.width_mm`, and `path.minimum_clearance_mm`. Each receipt basis uses an immutable `initial_source` or the one `authority_event`; no prepared fact is forced to have an event ID. |
| 4 | Replace REAL with EXISTS/BUILD/CONDITIONAL/STUB/CUT, update baseline, and make Terra conditional | The scope ledger now uses only those five labels. Baseline is clean commit `b25b90f`, which the task input reports green for lint, typecheck, 15 tests, and production build. GPT-5.6 Terra remains **CONDITIONAL** until an exact-schema credentialed canary returns a real OpenAI response ID. |
| 5 | Shorten the demo, remove extra interactions, add offline mode and WebGL resilience | Demo target is 2:15. One **Clarify + freeze transaction** action also runs pass A; the receipt appears inline after commit. A persistent mode control makes offline deterministic operation explicit. Canvas is wrapped in an error boundary, while the DOM numeric proof stays mounted regardless of WebGL. |
| 6 | Make the 1,000 mm same-value authority transition legible and prevent an early 180 mm leak | Pass A labels `1,000 mm` as a **visual estimate from the prepared capture**. The event shows `1,000 → 1,000 mm` unchanged while source and authority change to a homeowner tape declaration. Pass A is required to contain no `180 mm`, `18 cm`, or equivalent alternative in visible content, hidden/a11y DOM, Canvas labels, or live regions. |

## Decision

Do not redesign the system described in v1. Finish only the remaining causal slice around the mechanism already present at `b25b90f`:

1. Freeze and reuse the actual proposal produced by the selected provider path.
2. Move solver authorization from broad scene provenance to five explicit fact-level authority bases.
3. Make the 1,000 mm visual-estimate → homeowner-declared event exact and scoped to bookcase width.
4. Extend the existing browser hash proof and inline receipt to reference those five bases and one minimal policy.
5. Shorten and harden the existing R3F workbench with explicit offline mode, an error boundary, an always-mounted DOM numeric proof, and pass-A leak tests.

Everything else is cut, stubbed, or deferred. GPT-5.6 remains responsible only for clarification into the typed proposal. Categorical authority, dependency discovery, proof hashing, integer geometry, maximum-valid calculation, outcome, and commit remain deterministic code.

## Current product audit and remaining delta

The inspected repository is clean at commit `b25b90f21751d9f1bd87caebc383ef7d771034fd`. The task input reports `npm run lint`, `npm run typecheck`, all 15 current tests, and `npm run build` green. Source inspection confirms the following implemented behavior:

- homeowner measurement becomes `user_declared`, not `verified`;
- `confirmation_required` returns before `effectiveAction` or the solver path exists;
- integer-millimetre edge-clearance math uses the 3,200 mm bookcase center and yields the exact 180 mm maximum;
- browser `crypto.subtle` hashes canonical geometry, transaction, and authority projections;
- a changed measurement fails the A/B proof closed;
- the proof panel, prepared R3F scene, guarded commit, and inline basic receipt render in the real UI;
- `POST /api/proposals` uses OpenAI structured parsing and a labelled deterministic fallback;
- the current page test already asserts that pass A does not render “18 cm”;
- the latest workspace update also reports an explicit offline toggle, a Canvas error fallback, and passing desktop/mobile Playwright flows; these must be retained and pinned in the next clean freeze commit.

The remaining issues are narrow but load-bearing:

- authority projection is still object/dimensions-level rather than the five numeric solver facts;
- the current measurement UI asks for 40 cm depth while the solver consumes 1,000 mm width;
- scene `dimensions.provenance` promotes all bookcase dimensions together rather than one width fact;
- proof and rerun use a module-level demo action instead of the exact proposal action frozen from the selected provider;
- the route defaults to the `gpt-5.6` alias, not a proven `gpt-5.6-terra` canary, and the envelope lacks a real response ID;
- Terra labelling still needs the exact canary/response-ID boundary even though explicit offline selection now exists;
- the Canvas fallback exists, but the five-fact semantic numeric proof must remain mounted outside that boundary;
- the basic receipt lacks policy hash, the five authority bases, session attestation, provider truth, proof hashes, and the exact one-field commit diff.

## Delivery constraint, availability, and effort audit

The official Build Week deadline is July 21, 2026 at 5:00 PM PT, and the rules/FAQ require documented Codex and/or GPT-5.6 work for pre-existing projects; they do not require a live runtime Terra call ([official rules](https://openai.devpost.com/rules), [official FAQ](https://openai.devpost.com/details/faqs); accessed 2026-07-18).

**ASSUMPTION:** one builder. Actual focused availability through the July 20, 5:00 PM PT feature freeze is still unknown. No additional engineer, designer, API budget, credentialed Terra tier, or pre-authorized backup host has been declared. The causal slice is credible with approximately 18–26 focused hours remaining before freeze, including four hours of protected integration contingency. The plan must automatically apply the cut ladder below if actual availability is lower; full-auto does not wait for a human gate.

### Remaining effort from `b25b90f`

| Work package | Existing leverage | Remaining focused effort | Exit evidence | Hard cut |
|---|---|---:|---|---|
| Five fact-level bases + exact transition | Current authority enum, early gate, scene fixture, proof projection | 3–5 h | Pass A has four authorized initial bases plus one unauthorized visual estimate; pass B changes only `bookcase.width_mm` to `user_declared` | No general event ledger, correction workflow, or multi-fact editor |
| Freeze actual provider proposal + provider truth | Current Zod route, deterministic fallback, explicit offline toggle, one-button check | 1.5–2.5 h | A and B transaction bytes come from the same frozen returned action; offline selection makes no network call | No arbitrary command history, retries UI, or health endpoint |
| DOM proof, width/source transition, normalized claim | Existing polished workbench, R3F Canvas/error fallback, proof panel | 2.5–4 h | Numeric proof remains mounted through Canvas failure; pass A withholds alternative; event shows `1000 → 1000 mm` | No new dashboard shell, modal receipt, decorative motion, or 21st.dev dependency |
| Basic receipt/policy/fact bases | Existing commit receipt | 2–3 h | Inline receipt validates policy hash, five bases, provider truth, attestation, proof hashes, review flag, and table-x diff | No reuse consent, withdrawal, reviewer fields, undo transaction, receipt hash, download styling |
| Focused verification | Existing 15 green tests | 3–5 h | Kernel/fact-basis tests, pass-A DOM leak assertion, invalid proof, offline flow, Canvas failure, receipt diff; lint/typecheck/tests/build green | No broad browser/device matrix; one Chromium E2E is enough |
| Deploy, clean-browser rehearsal, video, README/submission evidence | Existing Next.js build and screenshots | 4–6 h | HTTPS URL, offline rehearsal at ≤2:15, optional live canary evidence, clean commit, video and setup disclosure | No host migration unless an already-authorized Node host exists |
| **Mandatory causal slice total** |  | **14.5–25.5 h** | All must-pass mechanism and delivery evidence | Cut ladder below protects the proof first |
| Terra canary, if credentials exist | Current live Responses route | **0.5–1.5 h, parallel/conditional** | Exact `gpt-5.6-terra` structured response plus real response ID recorded | Failure disables live option; never blocks the offline mechanism |

### Availability cut ladder

| Focused time available before freeze | Automatic scope |
|---:|---|
| ≥22 h | Build every mandatory item; attempt Terra canary in parallel; perform one offline and one live-if-proven rehearsal. |
| 16–21 h | Keep all causal/a11y items; disable live runtime unless canary already passes; cut extra receipt styling, responsive polish beyond 375/1024, and all nonessential animations. |
| 12–15 h | Ship offline mode as the only stage path; retain the already-built structured route as repository evidence; implement fact bases, pass-A no-leak, DOM proof, error boundary, receipt essentials, focused tests, deployment/video. |
| <12 h | Preserve only: five bases, frozen transaction, authority-only proof, 180 mm solver, offline provider truth, always-mounted DOM proof, commit diff, and release checks. Cut any R3F polish changes beyond the error boundary. If those invariants cannot all pass, do not claim the causal proof ready. |

### Exact milestones and cut decisions

| Deadline | Must be true | Automatic cut if missed |
|---|---|---|
| **July 18, 5:00 PM PT — causal contract freeze** | Five facts, authority-basis union, width-only event, minimal policy, frozen-action contract, and basic receipt fields are fixed in tests/types. | Cut live Terra UI and all optional styling immediately. |
| **July 19, 12:00 PM PT — kernel complete** | Pass A cannot call solver; A/B hashes match geometry+transaction; exact authority projection changes one fact; B returns 180 mm; receipt names all five bases. | Stop all visual refinement; use existing workbench and DOM-first proof only. |
| **July 19, 8:00 PM PT — judge path complete** | Explicit offline mode, one clarify+freeze action, width/source transition, normalized proof language, Canvas boundary, always-mounted DOM proof, inline receipt. | Cut live mode from stage path, micro-motion, receipt decoration, and secondary responsive variants. |
| **July 20, 12:00 PM PT — verification complete** | Lint, typecheck, focused tests, one offline E2E/no-WebGL route, and production build pass from a clean commit. | No new code except release-blocking fixes. Use recorded offline demo even if Terra works intermittently. |
| **July 20, 5:00 PM PT — feature freeze** | HTTPS deployment, clean-browser 2:15 rehearsal, video capture, README/new-work/provider/prepared-scene disclosures. | Freeze code. Remaining 24 hours are submission, upload, link validation, and recovery only. |

## The demo moment — 2:15 target

### Beat-by-beat judge experience

| Time | Presenter action | Visible result | Why it matters |
|---:|---|---|---|
| 0:00–0:10 | Opens the prepared dining-room proof. | Persistent labels: **Prepared demo scene**, **Offline deterministic mode** or **Live GPT-5.6 Terra — canary verified**, and **Demo-authored fit policy — professional review required**. | Truth before spectacle. |
| 0:10–0:25 | Shows the request and clicks the single **Clarify + freeze transaction** button. | The selected adapter produces `move(table, +x, 400 mm)`, the action is deep-frozen once, transaction hash appears, and pass A runs automatically. If offline is selected, no network request occurs. | One clarification interaction; the model/parser cannot mutate or authorize. |
| 0:25–0:43 | Points to pass A. | `confirmation_required`. The source row reads **Bookcase width: 1,000 mm — visual estimate from prepared capture — observed, unverified**. Maximum-valid output says **WITHHELD — supporting fact lacks authority**. No ghost and no 180/18 content exists anywhere in visual or a11y DOM. | Groundline refuses to calculate an actionable alternative from the estimate. |
| 0:43–1:02 | Types `100 cm`, checks/activates **I measured this width for this session**, then records it. | Source transition renders beside the unchanged value: `1,000 → 1,000 mm · unchanged`; `visual estimate → homeowner tape measurement`; `observed_unverified → user_declared`. | The value did not change; only its scoped source/authority did. |
| 1:02–1:24 | Lets the awaited browser proof settle. | Header: **Normalized decision inputs differ only by authority.** Geometry bytes/hash match; frozen transaction bytes/hash match; dependency-authority projection changes exactly `bookcase.width_mm`. The full appended session event is shown separately. | **First gasp:** a falsifiable causal A/B proof, not a confidence badge. |
| 1:24–1:44 | Clicks **Re-run identical transaction**. | Pass B now exposes: `3200 - 500 - 900 - 700 - 920 = 180 mm`. The R3F ghost appears at +180 mm; the always-mounted DOM proof announces the same result. | **Second gasp:** only after authority exists can deterministic code calculate the exact maximum. |
| 1:44–2:02 | Clicks **Commit 18 cm checked alternative**. | Canonical table moves from x=920 to x=1,100 mm. Semantic scene diff lists only `table.position.x: 920 → 1100 mm`; bookcase remains protected and unchanged. | The checked result becomes product state. |
| 2:02–2:15 | Points to the receipt already inline. | Requested 400 mm; committed 180 mm; five fact bases; policy version/hash; provider truth; session attestation; review `required / unreviewed`; equal pre-commit geometry+transaction hashes; one-field commit diff. | The proof ends in an inspectable transaction, not prose. |

The presenter does not open a receipt, freeze a second time, wait through a failing live call, or navigate away. Offline mode is a first-class explicit option, not a silent recovery. If a live canary has passed, the live label includes the exact model and response ID; if the live call falls back, the label changes immediately to offline fallback and the receipt preserves that truth.

## Architecture — remaining causal slice

```text
┌──────────────────────── Existing Next.js proof workbench ───────────────────────┐
│ Provider mode: [Offline deterministic] [Live Terra if canary-proven]            │
│ Request → one Clarify + freeze action → FrozenTransaction                       │
│                                                                                 │
│ Canonical prepared scene (EXISTS)        Five SolverFact records (BUILD)        │
│ ├─ integer-mm geometry projection        ├─ 4 authorized initial_source bases   │
│ └─ R3F rendering                         └─ bookcase.width visual estimate       │
│                                                                                 │
│ Pass A dependency gate (EXISTS + narrow BUILD)                                  │
│ └─ unauthorized width → confirmation_required; solver unreachable               │
│                                                                                 │
│ Session attestation → one EvidenceTransition (BUILD)                            │
│ └─ same 1000 mm; source + authority become homeowner/user_declared              │
│                                                                                 │
│ Browser proof kernel (EXISTS + narrow BUILD)                                    │
│ ├─ crypto.subtle SHA-256 geometry + frozen transaction                          │
│ ├─ five-fact authority projection                                               │
│ └─ fail closed unless exact one-fact transition                                 │
│                                                                                 │
│ Pass B integer-mm solver (EXISTS) → limited 180 mm → guarded commit (EXISTS)    │
│                                                                                 │
│ Always-mounted DOM numeric proof + Canvas ErrorBoundary (BUILD)                 │
│ Inline BasicReceipt (BUILD)                                                     │
└──────────────────────────────┬──────────────────────────────────────────────────┘
                               │ only when explicit live mode selected
                    POST /api/proposals (EXISTS)
                               │
                    GPT-5.6 Terra (CONDITIONAL)
```

No database, event service, correction corpus, auth provider, voice service, image generator, analytics pipeline, or health endpoint enters the submission architecture.

### Data flow and invariants

1. Load one immutable prepared scene, one minimal local policy, and five solver fact records.
2. The user chooses an explicit provider mode. Offline mode invokes the local deterministic grammar directly and performs no fetch. Live mode is enabled only after the exact Terra canary gate.
3. The one clarification action parses/validates a proposal, converts it once to a `SceneAction`, constructs a `FrozenTransaction`, computes its transaction digest, deep-freezes it, and stores it. Pass A uses this stored action immediately.
4. Dependency discovery returns exactly five fact IDs. The evaluator checks the separate fact-basis map before the solver. Scene-level provenance remains descriptive metadata and no longer stands in for solver authorization.
5. Pass A sees `bookcase.width_mm=observed_unverified`; it returns without `effectiveAction`, without solver invocation, and without rendering any alternative content.
6. A deliberate session attestation appends one in-memory `EvidenceTransition`. It changes no scene value, geometry, transaction, or policy.
7. `buildAuthorityProof` uses the same scene object and same frozen transaction for A/B, then hashes a reduced five-fact projection. It is valid only when geometry and transaction hashes match and exactly one authority entry changes as specified.
8. Pass B uses the same frozen transaction and the new authority map. The existing integer solver returns the analytical 180 mm maximum.
9. Explicit acceptance commits the checked action. A basic receipt is rendered inline. Reload/reset clears the session; persistence is not implied.

## Exact remaining typed contracts

### Proposal API and provider truth

The existing structured proposal body remains intentionally small. The remaining change makes execution mode and provider evidence exact.

```ts
const proposalRequestSchema = z.object({
  request: z.string().trim().min(3).max(500),
  executionMode: z.enum(["offline_deterministic", "live_gpt56_terra"]),
}).strict();

const resolvedProposalSchema = z.object({
  status: z.literal("resolved"),
  summary: z.string().trim().min(1).max(220),
  operation: z.literal("move_object"),
  targetId: z.literal("table"),
  requestedDeltaCm: z.literal(40),
  axis: z.literal("x"),
  constraintIds: z.tuple([
    z.literal("path-clearance"),
    z.literal("bookcase-bounds-review"),
  ]),
}).strict();

const proposalProviderSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("offline_deterministic"),
    parserVersion: z.literal("prepared-move-v1"),
    label: z.literal("Offline deterministic parser · no model call"),
  }),
  z.object({
    mode: z.literal("live_gpt56_terra"),
    model: z.literal("gpt-5.6-terra"),
    responseId: z.string().min(1),
    label: z.literal("Live OpenAI GPT-5.6 Terra · proposal only"),
  }),
  z.object({
    mode: z.literal("offline_after_live_failure"),
    attemptedModel: z.literal("gpt-5.6-terra"),
    reason: z.enum(["timeout", "rate_limited", "refusal", "invalid_output", "upstream_error"]),
    parserVersion: z.literal("prepared-move-v1"),
    label: z.literal("Offline fallback after live failure · no model result used"),
  }),
]);

const proposalEnvelopeSchema = z.object({
  result: z.union([resolvedProposalSchema, needsClarificationSchema]),
  provider: proposalProviderSchema,
}).strict();
```

The route keeps Zod Structured Outputs and known IDs. `OPENAI_MODEL` is fixed to `gpt-5.6-terra` for the conditional canary/deployment; no broad `gpt-5.6` alias is labelled Terra. The live envelope may exist only when OpenAI returned a real `response.id`. Offline explicit mode bypasses the route or instructs it to skip OpenAI; it cannot be labelled live.

The official model page confirms `gpt-5.6-terra`, Responses, and Structured Outputs support, but also says the free tier is unsupported; this is why live access is conditional ([OpenAI model page](https://developers.openai.com/api/docs/models/gpt-5.6-terra); accessed 2026-07-18).

### Frozen transaction

```ts
type FrozenTransaction = Readonly<{
  schemaVersion: "groundline.transaction/1";
  sceneId: "prepared-dining-room";
  action: Readonly<{
    type: "move_object";
    objectId: "table";
    positionMm: Readonly<{ x: 1320; y: 0; z: 0 }>;
  }>;
  policyRef: Readonly<{
    id: "groundline.interior-fit";
    version: "1.0.0";
    hash: `sha256:${string}`;
  }>;
}>;
```

Provider metadata and response IDs stay outside the transaction hash. They prove how intent was parsed; they do not change the decision request. Pass A, proof, pass B, and receipt all reference this same stored value. The current module-level `demoAction` may remain only as an offline parser fixture, never as a substitute for the frozen returned action.

### Five solver facts and authority bases

```ts
type SolverFactId =
  | "table.center_x_mm"
  | "table.width_mm"
  | "bookcase.center_x_mm"
  | "bookcase.width_mm"
  | "path.minimum_clearance_mm";

type Authority =
  | "verified"
  | "user_declared"
  | "observed_unverified"
  | "inferred"
  | "generated";

type AuthorityBasis =
  | {
      kind: "initial_source";
      sourceRef: string;
      sourceLabel: string;
      authority: "verified" | "user_declared" | "observed_unverified";
    }
  | {
      kind: "authority_event";
      eventId: string;
      sourceRef: string;
      sourceLabel: string;
      authority: "user_declared";
    };

type SolverFact = Readonly<{
  factId: SolverFactId;
  valueMm: number;
  basis: AuthorityBasis;
}>;
```

The prepared A/B set is exact:

| Solver fact | Value | Pass-A authority basis | Pass-B authority basis | Solver use |
|---|---:|---|---|---|
| `table.center_x_mm` | 920 mm | `initial_source`, `user_declared`, `prepared.homeowner-baseline-v1` | unchanged | Current moving-object center |
| `table.width_mm` | 1,400 mm | `initial_source`, `user_declared`, `prepared.homeowner-baseline-v1` | unchanged | Moving half-width = 700 mm |
| `bookcase.center_x_mm` | 3,200 mm | `initial_source`, `user_declared`, `prepared.homeowner-baseline-v1` | unchanged | Protected anchor center |
| `bookcase.width_mm` | 1,000 mm | `initial_source`, `observed_unverified`, `prepared.visual-estimate-v1` | `authority_event`, `user_declared`, session tape event | Protected half-width = 500 mm |
| `path.minimum_clearance_mm` | 900 mm | `initial_source`, `user_declared`, `prepared.homeowner-constraint-v1` | unchanged | Required ordered edge gap |

“Prepared” is always visible in these source labels. `user_declared` means the fixture represents a homeowner assertion for the demo; it is not survey or professional verification.

The normalized authority projection hashes only sorted `{factId, authority}` records. The full basis/source data belongs in the receipt and event display. This lets the causal proof say only authority changed without pretending the raw event contains only one field.

### The one permitted evidence transition

```ts
type EvidenceTransition = Readonly<{
  schemaVersion: "groundline.evidence-transition/1";
  eventId: string;
  factId: "bookcase.width_mm";
  valueBeforeMm: 1000;
  valueAfterMm: 1000;
  sourceBefore: {
    kind: "visual_estimate";
    ref: "prepared.visual-estimate-v1";
    label: "Visual estimate from prepared capture";
  };
  sourceAfter: {
    kind: "homeowner_tape_measurement";
    ref: string;
    label: "Measured by homeowner with tape in this session";
  };
  authorityBefore: "observed_unverified";
  authorityAfter: "user_declared";
  attestation: "I measured this width for this session";
  policyRef: { id: "groundline.interior-fit"; version: "1.0.0"; hash: string };
  recordedAt: string;
}>;
```

The form accepts exactly 100 cm for this authority-only demo. A different value is a correction, changes geometry, invalidates the proof, and instructs the presenter to reset; it is not silently coerced. There is no correction-reuse consent, withdrawal workflow, or professional promotion in this slice.

### Minimal policy and basic receipt

```ts
type DemoPolicy = Readonly<{
  schemaVersion: "groundline.policy/1";
  id: "groundline.interior-fit";
  version: "1.0.0";
  status: "demo_authored_unendorsed";
  authorizingStates: readonly ["verified", "user_declared"];
  requiredFactIds: readonly SolverFactId[];
  ruleIds: readonly ["ordered_edge_clearance_v1"];
  disclaimer: "Early decision support; not survey, code, structural, or construction certification.";
  hash: `sha256:${string}`; // browser SHA-256 of canonical body excluding hash
}>;

type BasicReceipt = Readonly<{
  schemaVersion: "groundline.receipt/2";
  id: string;
  sceneId: "prepared-dining-room";
  decision: "limited";
  requestedAction: FrozenTransaction["action"];
  committedAction: Readonly<{
    type: "move_object";
    objectId: "table";
    positionMm: Readonly<{ x: 1100; y: 0; z: 0 }>;
  }>;
  provider: z.infer<typeof proposalProviderSchema>;
  policyRef: DemoPolicy;
  factBases: readonly [
    SolverFact, SolverFact, SolverFact, SolverFact, SolverFact
  ];
  sessionAttestation: Pick<EvidenceTransition,
    "eventId" | "factId" | "attestation" | "sourceAfter" | "recordedAt"
  >;
  proof: {
    geometryBefore: ProjectionDigest;
    geometryAfterAuthorityEvent: ProjectionDigest;
    transactionBefore: ProjectionDigest;
    transactionAfterAuthorityEvent: ProjectionDigest;
    authorityBefore: ProjectionDigest;
    authorityAfter: ProjectionDigest;
  };
  professionalReview: {
    required: true;
    status: "unreviewed";
    reason: "User-declared dimension requires professional review before purchase or construction";
  };
  beforeCommitGeometryHash: `sha256:${string}`;
  afterCommitGeometryHash: `sha256:${string}`;
  sceneDiff: readonly [{
    entityId: "table";
    field: "position.x_mm";
    before: 920;
    after: 1100;
  }];
  createdAt: string;
}>;
```

The receipt is displayed inline and exists only in session memory. It is not self-hashed, downloadable, undoable, professionally signed, or persisted.

## Proof execution boundary

The browser is the single proof execution boundary. Existing `canonicalBytes()` recursively sorts object keys and stable-ID arrays, encodes JSON with `TextEncoder`, and awaits `globalThis.crypto.subtle.digest("SHA-256", bytes)`. Web Cryptography exposes `SubtleCrypto` in secure contexts and includes the digest operation, so the deployment must use HTTPS; localhost remains the local rehearsal path ([W3C Web Cryptography](https://www.w3.org/TR/WebCryptoAPI/); accessed 2026-07-18).

The awaited UI state is exact:

```text
evidence_recording
  → proof_pending (buttons disabled; aria-live announces “Checking unchanged inputs”)
  → proof_valid | proof_invalid
      ├─ invalid: pass B disabled, no 180 content, show reset path
      └─ valid: enable “Re-run identical transaction”
```

Pass B may not enable merely because the measurement handler returned. It waits for all six digests and the allowlisted fact diff. Proof validity requires:

```ts
geometryA.hash === geometryB.hash
transactionA.hash === transactionB.hash
authorityDiff === [{
  factId: "bookcase.width_mm",
  before: "observed_unverified",
  after: "user_declared",
}]
```

The proof panel headline is **“Normalized decision inputs differ only by authority.”** Beneath it, a separate **Recorded session event** panel shows actor/source/time/attestation and the unchanged 1,000 mm value. It never says the raw record changed by one field.

## Deterministic solver and visibility contract

The existing analytical solver is retained:

```text
anchor left edge    = 3200 - (1000 / 2) = 2700 mm
maximum table center = 2700 - 900 - (1400 / 2) = 1100 mm
maximum delta        = 1100 - 920 = 180 mm
```

All five values come from the enumerated facts above. Dependency discovery occurs before numerical calculation. The solver receives an `AuthorizedSolverContext` only when every basis is `verified` or `user_declared`.

### Pass-A non-disclosure invariant

Before proof-valid pass B, the application must not compute or render the maximum-valid delta. Specifically, the pass-A React tree, accessibility tree, Canvas labels, `aria-label`, `aria-describedby`, `aria-live`, visually hidden text, DOM numeric table, tooltips, pre-rendered receipt, and ghost geometry contain none of:

- `180 mm`, `18 cm`, `+180`, `+18`;
- “maximum valid 18” or equivalent prose;
- a preview position of x=1,100 mm;
- an enabled commit action.

The always-mounted DOM numeric proof may show the five input facts and the requested 400 mm. Its result cell reads **“Withheld — bookcase width is observed/unverified.”** Only after pass B does that same cell contain `180 mm` and the equation. Current test coverage already rejects “18 cm” in pass A; extend it to all equivalent strings, accessible names/descriptions, and the preview/commit controls.

## Status ledger: EXISTS / BUILD / CONDITIONAL / STUB / CUT

| Status | Capability | Exact boundary |
|---|---|---|
| **EXISTS** | Prepared interior scene and real R3F workbench | Canonical room, table, 3,200 mm bookcase, proof panel, decision states, and guarded commit are implemented at `b25b90f`. |
| **EXISTS** | Early authority gate | Pass A returns `confirmation_required` without `effectiveAction`; tests cover the leak. |
| **EXISTS** | Integer-mm edge solver | Existing AABB edge calculation yields x=1,100 mm / +180 mm after authority. |
| **EXISTS** | Browser SHA-256 proof | Canonical geometry/transaction/authority projections, `crypto.subtle`, equal hashes, one allowlisted transition, and fail-closed changed-geometry test exist. |
| **EXISTS** | Structured proposal route and labelled fallback | `POST /api/proposals` uses OpenAI `responses.parse`/Zod and falls back truthfully. |
| **EXISTS** | Explicit offline toggle, Canvas fallback, desktop/mobile Playwright paths | Latest workspace verification reports these resilience paths implemented and passing; freeze them in the next clean commit. |
| **EXISTS** | Green build baseline | Task input records lint, typecheck, 15 tests, and production build green at the inspected commit. |
| **BUILD** | Five fact-level authority bases | Replace broad object/dimensions projection for the solver with the exact five records and basis union. |
| **BUILD** | Actual frozen proposal reuse | Store the selected adapter's returned action once and use it for A, proof, B, and receipt. |
| **BUILD** | Exact 1,000 mm width transition | Replace the current 40 cm depth control and whole-dimensions promotion with the width-only source/authority event. |
| **BUILD** | Complete the shortened proof UI | Reuse the offline toggle/Canvas fallback; add single frozen-action reuse, normalized claim, separate full event, always-mounted five-fact DOM proof, and inline extended receipt. |
| **BUILD** | Focused tests and release evidence | Five bases, async proof state, pass-A a11y leak, Canvas crash, offline E2E, receipt diff, and final clean checks. |
| **CONDITIONAL** | Live GPT-5.6 Terra runtime | Enabled only after exact structured canary returns a real response ID. Paid access is not assumed and does not block offline mechanism or eligibility. |
| **STUB** | Scene acquisition | Hand-authored fixture labelled prepared; no photo reconstruction or measurement extraction. |
| **STUB** | Professional review | Receipt says `required / unreviewed`; no reviewer identity, signature, portal, or certification. |
| **STUB** | Persistence | Session state only; reset/reload clears event and receipt. |
| **CUT** | Correction reuse, withdrawal, reviewer fields, undo transaction, receipt self-hash, health endpoint | Removed from submission contract and UI. |
| **CUT** | Exterior submission capability | The broader product retains an exterior objective, but no exterior fixture/rule/demo ships now. |
| **CUT** | Voice, image generation, arbitrary capture, catalogs, costs, CAD/BIM, code/buildability | None enters the causal slice. |
| **CUT** | 21st.dev runtime or component work | Existing design is sufficient; auth/quota/component review would add no mechanism value. |

## Stack and verified load-bearing dependencies

| Choice | Use in this slice | Verification and consequence |
|---|---|---|
| Next.js 16 / React 19 / TypeScript | Existing UI and single proposal Route Handler | Next.js Route Handlers support POST with Web Request/Response APIs and keep unprefixed environment variables server-side ([Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [environment variables](https://nextjs.org/docs/15/app/guides/environment-variables); accessed 2026-07-18). Keep `OPENAI_API_KEY` server-only. |
| OpenAI SDK + GPT-5.6 Terra | Conditional proposal clarification only | Official docs list Terra Responses and Structured Outputs support, pricing, rate limits, and no free tier ([model page](https://developers.openai.com/api/docs/models/gpt-5.6-terra); accessed 2026-07-18). Canary/access is a condition, not an assumption. |
| Zod 4 | Existing proposal validation; extend receipt/fact schemas | Zod 4 is stable and supports parsing plus JSON Schema conversion ([Zod docs](https://zod.dev/), [JSON Schema](https://zod.dev/json-schema); accessed 2026-07-18). No new schema package. |
| Web Crypto `SubtleCrypto.digest` | Existing client-side SHA-256 proof | W3C defines `SubtleCrypto` for secure contexts and the digest operation ([Web Cryptography](https://www.w3.org/TR/WebCryptoAPI/); accessed 2026-07-18). HTTPS/local secure-context rehearsal is mandatory. |
| React error boundary + R3F Canvas fallback | Catch Canvas render/context failures without losing proof | React documents error boundaries via `getDerivedStateFromError`/`componentDidCatch`; R3F documents `Canvas.fallback` for unsupported GL, so use both ([React Component](https://react.dev/reference/react/Component), [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas); accessed 2026-07-18). The numeric DOM proof is outside the boundary. |
| Vercel or an already-authorized Node host | HTTPS demo and server route | Vercel Hobby has demo-scale functions but is personal/non-commercial only; account/project suitability and cold start remain release checks ([Vercel Hobby](https://vercel.com/docs/plans/hobby); accessed 2026-07-18). Do not start a host migration as contingency. |

## UI/UX and design handoff

Retain the existing Interiorin design system and proof-workbench composition. Do not generate a new dashboard shell. The remaining design work serves causal legibility and accessibility:

- Keep provider mode, prepared-scene label, policy status, and review requirement persistent and readable at video resolution.
- Use one primary action per state: **Clarify + freeze transaction**, **Record session measurement**, **Re-run identical transaction**, **Commit 18 cm checked alternative**.
- Render the five-fact numeric table outside the Canvas error boundary. It is semantic HTML with a caption and explicit authority/source cells, not a screenshot or chart.
- Canvas fallback says **3D view unavailable; the checked numeric proof remains below**. It must not imply geometry failed.
- After each async action, move programmatic focus to the new state heading only when needed; announce proof pending/valid/invalid in `aria-live="polite"` without repeating hashes.
- Use text + icon + border for authority states, never color alone. Keep full hashes copyable in an expandable inline disclosure, but show byte equality and abbreviated hashes in the main proof.
- The source transition is a three-row factual comparison, not animation theater. Reduced-motion mode swaps immediately; otherwise a 150–250 ms crossfade is enough.
- At 375 px, causal order is provider → request → pass A → source transition → proof → pass B → commit/receipt. No nested horizontal scrolling; hashes wrap or use a copy control.
- Minimum 44 px controls, visible focus, 4.5:1 text contrast, visible labels/helper errors, and keyboard completion remain release criteria.

This applies the ui-ux-pro priorities to the existing page; it does not regenerate its established visual direction.

## Focused verification

### Must-pass unit/contract tests

1. Dependency discovery returns the exact five fact IDs, no more and no fewer.
2. Each pass-A fact has a valid `initial_source` basis; only `bookcase.width_mm` is non-authorizing.
3. Homeowner event changes exactly `bookcase.width_mm` from `observed_unverified` to `user_declared` and preserves 1,000 mm.
4. A 999 mm or 1,001 mm entry changes geometry, invalidates proof, and never enables pass B.
5. Pass A returns before the solver; a spy verifies zero solver calls and no effective action.
6. Geometry and frozen transaction bytes/hashes are equal A/B; five-fact authority hashes differ by exactly the allowed width authority.
7. The frozen action returned by offline/live adapter is the same value used by A, proof, B, and receipt; no module fixture substitutes after freeze.
8. All five facts authorized produces the exact 180 mm alternative and exact 900 mm postcondition.
9. Commit changes only `table.position.x` from 920 to 1,100 mm.
10. Basic receipt names all five bases and their basis kinds, one policy version/hash, provider truth, event/attestation, `required/unreviewed`, proof hashes, and the one scene diff; excluded fields are absent.

### Must-pass UI/E2E tests

- Explicit offline mode makes no `/api/proposals` network call and displays **no model call**.
- Live mode is disabled/unavailable until canary configuration is true; a successful live envelope must include model `gpt-5.6-terra` and a response ID.
- The one clarify+freeze action freezes the proposal and automatically displays pass A.
- In pass A, `document.body`, accessible names/descriptions, live regions, and mocked Canvas props contain no `18 cm`, `180 mm`, `+18`, `+180`, x=1,100 preview, or enabled commit control.
- Always-mounted DOM proof reads **Withheld** in pass A and `180 mm` only after proof-valid pass B.
- Proof pending disables rerun; proof invalid keeps pass B disabled and offers reset.
- Forced Canvas render error shows the error-boundary fallback while the five-fact DOM proof remains complete and operable.
- Receipt appears automatically after commit; no open-modal action exists.
- One offline Chromium E2E completes in ≤2:15 during rehearsal; keyboard and 375 px paths remain complete.

Release still requires lint, typecheck, all unit/component tests, the focused E2E, production build, clean Git status, HTTPS smoke, README/provider/prepared-data/new-work disclosures, and a recorded offline fallback demo.

## Risk register — top five

| Rank | Risk | Impact | Mitigation / trigger |
|---:|---|---|---|
| 1 | Terra credentials/model access are absent or unstable | A claimed live provider could fail on stage or be mislabeled. | Terra is **CONDITIONAL**. Enable only after an exact-schema canary returns a real response ID; keep explicit offline mode as the default safe path; rules do not make runtime Terra a blocker. |
| 2 | The UI freezes one action but proof/B/receipt reuse the hard-coded fixture | This invalidates the “identical transaction” claim even if hashes happen to match. | Store one `FrozenTransaction` from the chosen adapter and require it as the input to A, proof, B, and receipt. Add object/value identity tests and remove later use of `demoAction`. |
| 3 | Broad scene provenance still hides an unauthorized solver input | The solver can consume `bookcase.center_x` or another number without a testable basis. | Separate the five-fact authority map from scene metadata; dependency-set equality is a test; receipt lists basis kind/source for every fact. |
| 4 | Web Crypto or WebGL fails in the judge browser | Proof hashing could stall, or the scene could disappear. | HTTPS/localhost only; awaited proof error state; Canvas `fallback` plus React error boundary; always-mounted DOM numeric proof remains the authoritative presentation. |
| 5 | Unknown builder availability or late deployment consumes contingency | The causal slice may be green locally but unrehearsed/unsubmitted. | Use the automatic availability cut ladder and dated milestones; freeze July 20 at 5 PM PT; live mode, styling, and secondary responsiveness cut before mechanism/tests/deployment. |

## Broader Interiorin objective after submission

This interior-only submission is a wedge, not the full product definition. Interiorin's larger objective remains a trustworthy interior **and exterior** spatial design studio with guided intake, calibration, reasoned options, bounded voice/keyboard refinement, named versions, factual comparison, and professional handoff.

After submission, reuse only the pieces that genuinely generalize: stable fact IDs, explicit authority bases, typed frozen transactions, versioned policy references, provider truth, proof projections, and basic receipts. Do not reuse the one-axis interior solver as an exterior rule system. Exterior drainage, grading, utilities, boundaries, climate, planting suitability, local code, and construction decisions require separate authoritative data and professional workflows. No exterior capability, professional certification, durable audit trail, or correction-derived moat is claimed in the July 21 submission.
