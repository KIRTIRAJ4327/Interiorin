# Interiorin — design document

Run: `20260718-spatial-design-studio` · Version: v3 · Direction: Material Ledger Studio · Target level: Elite Frontend Design Level 6

## Findings addressed

| # | `verdict-design-v2` finding | v3 resolution |
|---:|---|---|
| 1 | F2.R contained duplicate/contradictory proof contracts. | F2.R now has one canonical digest/relationship/receipt/R3F block; ghost opacity is `.28`; evidence rows truncate to 12 hex with copy while receipt hashes wrap fully; oak/bookcloth are tokens. |
| 2 | Mobile tab order conflicted with visual order. | Mobile DOM is skip/project controls → `<main>` → visually bottom-fixed nav; route activation still focuses H1, announces route, preserves history/Back, and reserves safe-area space. |
| 3 | Attachment recovery labels conflicted. | Flow 3, F3.3, and §12 all use exactly `Replace file` and `Remove attachment`. |
| 4 | §12 omitted tokens and decisive state copy. | §12 remains 600–1000 words, includes the omitted metrics/tokens and exact screen recovery copy, and carries the single corrected proof contract. |

**Document truth boundary.** This specification covers the complete Interiorin product objective as a **design horizon** and marks the only current executable experience as the **verified release slice**. “Verified” here means the prepared, interior-only authority proof already evidenced at source commit `b1b392f`; it does not mean the Forge run has completed release E0–E5, is hosted, or is professionally certified. Real intake, arbitrary interior/exterior scenes, general-purpose 3D, multiple options, ElevenLabs voice, Gemini/Nano Banana derivatives, persistence, comparison, and professional handoff are designed below but are not shipped claims.

## 1. Product frame

**One-liner, verbatim from the handoff:** “Build a real application that lets a homeowner, renter, architect, or designer show an empty or existing **interior or exterior** space and immediately understand what it could become. The product should derive a navigable spatial model, create coherent design directions, recommend choices that fit the space, and let the person refine the result conversationally—especially by voice. Every accepted change should remain grounded in known geometry and objects, become reversible, and be saveable as named options that can be compared before money or construction effort is committed.”

**Primary users.** Homeowners and renters making a spatial decision are the co-users; independent residential designers, architects, remodelers, landscape designers, surveyors, and engineers receive scoped handoffs or use the denser evidence view. Professional roles are never collapsed into one interchangeable “expert.”

**Differentiating mechanism.** A canonical spatial baseline keeps every fact, object, source, authority state, constraint, typed action, version, derivative, and receipt linked. A request may be understandable yet remain blocked when a required fact lacks authority. Voice, touch, keyboard, and direct manipulation all compile into the same `propose → inspect → preview → confirm → commit → receipt` contract. Generated imagery is a labelled derivative of a factual version, never geometry or buildability evidence.

**Undeniable demo moment.** In the verified prepared dining-room proof, geometry and the frozen `+40 cm` transaction hash remain `MATCH`; only `bookcase.width_mm` changes from `observed_unverified` to `user_declared`, with its value unchanged at `1,000 mm`. Only after that event does the identical request reach the integer solver and reveal the bounded `+18 cm` alternative. The semantic proof remains complete if WebGL fails.

## 2. Design direction

### Decision

Commit to **Material Ledger Studio**: tactile, archival, inhabited, exact, quietly premium, and source-aware. The interface is a residential project folio wrapped around a live spatial evidence ledger. **Surveyor’s Margins is a minor proof grammar only**: dimension strings, indexed callouts, a single dashed-to-double authority rule, and restrained hatching. It does not become a CAD ribbon, blueprint theme, or handwriting effect.

The elite progression target is **Level 6 — iterate and polish**. The upstream work supplies curated references, product patterns, and an inspected implementation. Level 6 is appropriate because the work is to synthesize, diverge, and specify the premium margins. Level 7 is restricted to honest, user-controlled 3D; no shader spectacle, autonomous camera tour, or implied scan precision.

### Reference synthesis

| Reference | Borrow | Refuse |
|---|---|---|
| [Material Bank brand guide](https://brandguide.materialbank.com/) (publication date n.d.; accessed 2026-07-18) | Cream/ink confidence, physical specimen framing, disciplined project organization | Commerce blocks and anonymous luxury materials |
| [The Modern House Journal](https://themodernhouse.com/journal/) (current entries dated through 2026-07-08; accessed 2026-07-18) | Serif/sans tension, lived-space language, strong editorial crop, calm negative space | Real-estate prestige language and image-as-proof |
| [Rayon floor-plan creation](https://www.rayon.design/use-cases/floor-plan-creation) (publication date n.d.; accessed 2026-07-18) | Fine plan linework, controlled hatches, compact tools around a generous canvas | Dense expert-only tool ribbons or CAD mimicry |
| [Morpholio Trace](https://www.morpholioapps.com/trace/) (publication date n.d.; accessed 2026-07-18) | One annotation layer, dimension strings, visible distinction between source and interpretation | Fake handwriting, skeuomorphic rulers, blueprint wallpaper |
| [Speckle version control](https://docs.speckle.systems/workspaces/versions) (updated 2026-05-04; accessed 2026-07-18) | Connected geometry, metadata, immutable versions, and review history | Pretending Interiorin is a CAD/BIM interchange system |

The component research truth is explicit: the 21st.dev `magic` MCP was not callable. Components are mapped to the official web findings in `patterns.md`, including the [21st.dev ReUI Stepper](https://21st.dev/community/components/reui/stepper/vertical) (published 2025-07-05; accessed 2026-07-18) and [Motion Primitives Image Comparison](https://21st.dev/community/components/ibelick/image-comparison) (published 2024-11-21; accessed 2026-07-18). No MCP-generated component output is claimed.

### Anti-slop law

Interiorin must not look like a purple AI dashboard, stock shadcn inventory, glass HUD, bento feature grid, chat-first blank canvas, luxury-property brochure, faux-paper scrapbook, or CAD cosplay. No generic sparkles, emoji icons, confidence percentages, fake hashes, invented metrics, continuous orbit, confetti, pill-badge soup, tiny uppercase microtype, hover-only truth, or color-only authority. A generated render never outranks the fact ledger. Exterior is not an interior screen recolored green.

### Why this wins with judges

ASSUMPTION: a quiet authored workbench with one sharp causal transition will read more credibly in a sub-three-minute demo than visual spectacle. Material Ledger Studio makes the mechanism visible at video scale: an archival evidence row changes structure while the scene and transaction remain fixed, then a bounded spatial result appears. The interface supports the judging pattern found upstream—one causal transformation with inspectable state—without exaggerating what the prepared release proves ([OpenAI Build Week rules](https://openai.devpost.com/rules), page current; accessed 2026-07-18).

## 3. Design tokens

These tokens are locked. Screen and component specifications below reference token names only; no component may introduce an ad-hoc value.

### 3.1 Color

| Token | Hex | Use | Tested contrast |
|---|---:|---|---:|
| `color.canvas` | `#F4F0E7` | App canvas / paper | `ink` 13.16:1; `graphite` 5.53:1; `declared` 6.70:1 |
| `color.surface` | `#FBFAF6` | Primary working surface | `ink` 14.33:1; `graphite` 6.03:1 |
| `color.modelGround` | `#E8E0D3` | 2D/3D stage | `ink` 11.43:1 |
| `color.ink` | `#202923` | Primary text, decisive dark control | 13.16:1 on canvas; 14.33:1 on surface |
| `color.graphite` | `#5A625C` | Secondary copy, generated authority | 5.53:1 on canvas; 6.03:1 on surface |
| `color.charcoal` | `#252824` | Receipt/evidence dock | `inverse` 14.28:1 |
| `color.inverse` | `#FBFAF6` | Text on charcoal/semantic fills | 14.28:1 on charcoal |
| `color.verified` | `#35624F` | Measured/verified fact | 6.68:1 on surface; inverse text 6.68:1 |
| `color.declared` | `#2F596A` | User-declared, link, focus, primary accent | 7.29:1 on surface; inverse text 7.29:1 |
| `color.observed` | `#9B4835` | Observed-unverified and blocking evidence | 5.96:1 on surface; inverse text 5.96:1 |
| `color.inferred` | `#7A5810` | Inferred/assumed | 6.22:1 on surface |
| `color.danger` | `#8C3028` | Destructive action or unrecoverable error | 7.83:1 on surface; inverse text 7.83:1 |
| `color.rule` | `#A79E91` | Structural 1 px rule; never body text | decorative only |
| `color.ruleSoft` | `#D8D0C3` | Quiet dividers, skeleton blocks | decorative only |
| `color.scrim` | `rgba(20,24,21,.56)` | Dialog/sheet isolation | foreground modal remains surface/ink |
| `color.controlBoundary` | `#4D554F` | Required field, radio, button, resize handle, and data boundary | 6.77:1 canvas; 7.37:1 surface; 5.88:1 model ground |
| `color.selectedStroke` | `#2F596A` | Required selected-object/data stroke | 6.70:1 canvas; 7.29:1 surface; 5.81:1 model ground |
| `color.controlBg` | `#FBFAF6` | Enabled control fill | ink 14.33:1 |
| `color.disabledBg` / `color.disabledFg` | `#E8E0D3` / `#202923` | Disabled control with text `Unavailable` and `not-allowed` cursor | 11.43:1; never opacity-only |
| `material.oak` | `#8A6E52` | Prepared table material only | non-text material |
| `material.bookcloth` | `#6F5B47` | Prepared bookcase material only | non-text material |

Functional states always combine label + Lucide icon + structure: verified uses `BadgeCheck` and a solid 4 px left rule; declared uses `UserRoundCheck` and a double 3 px rule; observed uses `Eye` and a dashed 2 px rule; inferred uses `Triangle` and a diagonal hatch at 8 px; generated uses `Image` and a dotted frame plus “Presentation only.” Blocked uses `CircleSlash2`, observed color, and explicit reason text. Offline uses `WifiOff`, charcoal, and “Prepared fallback · no model request.” No semantic role is communicated by color alone.

The system has one light paper theme and one purposeful inverse evidence surface, not a user-facing dark theme in this version. This prevents an untested theme from weakening evidence contrast.

### 3.2 Typography

Families load with `font-display: swap`; only the normal/medium/semibold weights below are requested.

| Token | Family | Size / weight / line height | Use |
|---|---|---|---|
| `type.display` | Newsreader, Georgia, serif | 56 / 500 / 1.04; mobile 40 / 500 / 1.08 | Project-level opening only |
| `type.h1` | Newsreader, Georgia, serif | 40 / 500 / 1.10; mobile 32 / 500 / 1.15 | Screen title |
| `type.h2` | Newsreader, Georgia, serif | 28 / 500 / 1.18; mobile 24 / 500 / 1.22 | Named option/major section |
| `type.h3` | IBM Plex Sans, Arial, sans-serif | 20 / 600 / 1.30 | Panel/region title |
| `type.body` | IBM Plex Sans, Arial, sans-serif | 16 / 400 / 1.55 | Instructions and explanations |
| `type.bodyStrong` | IBM Plex Sans, Arial, sans-serif | 16 / 600 / 1.45 | Decisions and controls |
| `type.small` | IBM Plex Sans, Arial, sans-serif | 14 / 400 / 1.45 | Secondary metadata; never below 14 for essential copy |
| `type.meta` | IBM Plex Sans, Arial, sans-serif | 12 / 600 / 1.35, .02em | Short nonessential captions only |
| `type.mono` | IBM Plex Mono, Consolas, monospace | 13 / 500 / 1.45, tabular numerals | Dimensions, fact IDs, hashes, timestamps |

Paragraphs stop at 70 characters on desktop and 58 on mobile. Serif names human meaning; sans carries instructions; mono carries evidence only. Evidence chips show the first 12 hex characters with a 44 px `Copy full digest`; receipt hashes render fully, wrap anywhere, and never ellipsize.

### 3.3 Geometry, spacing, and layers

- Spacing: `space.1=4`, `space.2=8`, `space.3=12`, `space.4=16`, `space.6=24`, `space.8=32`, `space.12=48`, `space.16=64` px.
- Radii: `radius.none=0`, `radius.xs=2`, `radius.sm=6`, `radius.md=10`, `radius.round=999` px. Round is limited to switch tracks and status dots. Panels use `sm`; dialogs use `md`; ledgers and plates may use `none`.
- Borders: `border.hairline=1px solid ruleSoft`; `border.rule=1px solid rule`; `border.selected=4px solid declared`; authority variants follow the grammar above.
- Essential controls and data marks use `border.control=1px solid controlBoundary`; selected Canvas/data marks use `selectedStroke`. `rule` and `ruleSoft` are exclusively decorative page rhythm and skeleton fill: they never identify a field, radio row, button, resize handle, focus state, data series, or selection.
- Elevation: flat by default. `shadow.overlay=0 18px 48px rgba(20,24,21,.18)` is reserved for dialogs/sheets; `shadow.menu=0 8px 24px rgba(20,24,21,.14)` for menus. Cards do not lift on hover.
- Icons: Lucide only, `icon.sm=16`, `icon.md=20`, `icon.lg=24`, 1.75 px stroke. Icons sit inside 44 × 44 px controls when interactive.
- Targets: every pointer/touch control is at least 44 × 44 px with 8 px separation; form controls are at least 44 px high.
- Breakpoints: `bp.phone=375`, `bp.tablet=768`, `bp.workbench=1024`, `bp.wide=1440` px. Layout max width is 1600 px; long reading regions max at 760 px.
- Layers: `z.base=0`, `z.sticky=20`, `z.popover=40`, `z.sheet=80`, `z.dialog=100`, `z.toast=120`, `z.skip=200`.

### 3.4 Motion

| Token | Value | Intent |
|---|---|---|
| `motion.instant` | 0 ms | Reduced-motion state replacement |
| `motion.press` | 100 ms | Press feedback; opacity/state layer only |
| `motion.fast` | 150 ms | Hover/focus/color/border |
| `motion.base` | 220 ms | Selection, inspector, ledger insertion |
| `motion.emphasis` | 300 ms | One proof reveal or shared-element transition |
| `motion.stagger` | 40 ms | Maximum four receipt groups |
| `ease.enter` | cubic-bezier(.16,1,.3,1) | Decelerating reveal |
| `ease.exit` | cubic-bezier(.4,0,1,1) | Faster dismissal |
| `ease.state` | cubic-bezier(.2,0,0,1) | Cause-and-effect state change |

Only opacity and transform animate. Data appears before motion. Exit duration is 150 ms; enter is 220–300 ms. Under `prefers-reduced-motion: reduce`, translation, camera interpolation, FLIP, scrub, and stagger are removed; state is immediate with a 100 ms opacity cue at most.

## 4. Information architecture

### 4.1 Object model

`Project` contains one or more `Space` objects. A Space has `spaceKind` (`interior` or `exterior`), `occupancy` (`empty` or `existing`), `EvidenceSource[]`, `Fact[]`, `ObjectOrZone[]`, a `CanonicalBaseline`, and unresolved `ReviewNeed[]`. Every Fact has value, unit, source, captured date, authority (`verified_measured`, `user_declared`, `observed_unverified`, `inferred`, `generated_presentation`), freshness, and dependent object/policy IDs. A `Policy` evaluates a frozen `TypedAction`. An accepted action creates an immutable `Version`, `Receipt`, and factual `Diff`; undo is a reversing Version. A named `DesignOption` branches from a Version and owns rationale, trade-offs, checks, review needs, and `PresentationDerivative[]`. A derivative records provider, generated-at time, source version, prompt/action summary, credential metadata when available, and a persistent truth label. A `HandoffPackage` scopes recipient role, included versions/sources/receipts, questions, limitations, and `ReviewResponse[]`.

### 4.2 Navigation

Desktop uses a 216 px project folio rail: Interiorin wordmark, project switcher, then the four destination labels `Evidence`, `Studio`, `Compare`, `Handoff`; `Project record` and `Settings` sit below a rule. The active item uses a 4 px declared rule, semibold label, and icon. A 64 px top project bar holds breadcrumb, current space, release-status disclosure, undo-as-new-version, and account/help.

At 768–1023 px, the rail becomes a 72 px icon-plus-tooltip rail; labels remain in accessible names. Below 768 px, it becomes a four-item bottom navigation with icon and label: `Evidence`, `Studio`, `Compare`, `Handoff`. The top bar keeps project/space and a labelled overflow. Bottom content padding includes `calc(72px + env(safe-area-inset-bottom))`. Deep URLs are `/projects/:projectId/evidence/:spaceId`, `/studio/:optionId`, `/compare?a=&b=`, `/versions`, `/handoff/:packageId`, and `/proof/prepared-dining-room`.

**Entry, return, and state contract.** `/projects` exposes `New project`; F1.1 `Cancel` returns there and focuses `New project`. A dirty intake offers `Save draft and leave`, `Leave without saving`, and `Stay`; `Resume evidence mission` restores the first incomplete task, fields, uploads, and scroll. Studio exposes a visible release-slice plate with `Open prepared proof`; the Help menu repeats that control. F2.R `Back to Studio` restores Studio scroll/selected option and focuses `Open prepared proof`. F2.2’s project bar and F3.1’s chooser band expose `Version history`; `/versions?from=studio|compare` returns through a labelled `Back to Studio` or `Back to Compare`, restores selected option/difference and scroll, and focuses `Version history`. F3.4 is an external signed-link shell without app navigation: recipient `Close review` returns to a safe invitation referrer or neutral `Review closed` page; authenticated sender `Return to Interiorin project` opens F3.3 and focuses `Package preview`. Browser Back never mutates state.

On mobile, DOM/tab/visual reading order is skip link → project controls → `<main>` → bottom navigation. The navigation appears after main in DOM and is visually fixed at the viewport bottom; content reserves `calc(72px + env(safe-area-inset-bottom))` so it obscures nothing. Destination activation saves route state in `history.state`, moves focus to the new H1, and announces the route. Browser Back restores prior selection/filter/draft/scroll and trigger focus when that trigger still exists.

### 4.3 Screen inventory and delivery status

| ID | Screen | Purpose | Status shown in chrome |
|---|---|---|---|
| F1.1 | Project folio & intake choice | Create an empty/existing interior/exterior project and choose evidence route | **Design horizon · not in this release** |
| F1.2 | Evidence mission | Collect guided capture, upload, measurements, keep list, and professional records | **Design horizon · not in this release** |
| F1.3 | Baseline review | Inspect source-aware 2D/3D, facts, objects/zones, and gaps before accepting baseline | **Design horizon · not in this release** |
| F2.1 | Reasoned option studio | Generate and choose 2–4 materially distinct directions with rationale | **Design horizon · not in this release** |
| F2.2 | Option workbench & action confirmation | Refine via keyboard, touch, text, or bounded ElevenLabs voice through one typed contract | **Design horizon · not in this release** |
| F2.3 | Presentation derivative plate | View labelled Gemini/Nano Banana imagery linked to a factual version | **Design horizon · not in this release** |
| F2.R | Prepared authority proof | Execute the current dining-room A/B, commit, and inspect receipt | **Verified release slice · prepared interior proof** |
| F3.1 | Factual compare | Compare two named options semantically and spatially | **Design horizon · not in this release** |
| F3.2 | Version ledger | Navigate immutable named versions and semantic diffs | **Design horizon · not in this release** |
| F3.3 | Handoff builder | Scope facts, alternatives, questions, sources, and recipient role | **Design horizon · not in this release** |
| F3.4 | Reviewer package | Review a read-only connected package and respond within a named scope | **Design horizon · not in this release** |

## 5. User flows

Exactly three product flows organize the complete objective. The executable demo is a first-class branch inside Flow 2, not a fourth product flow.

### Flow 1 — real space to honest baseline

1. **F1.1 → Define the project.** User enters `Cedar House kitchen` or `Back patio`, selects `Interior`/`Exterior` and `Empty`/`Existing`. System writes the project brief without assigning evidence authority.
2. **F1.1 → Choose evidence routes.** User selects guided capture, photos/video, plan/survey, manual measurements, keep list, or professional record. System explains what each source can and cannot establish.
3. **F1.2 → Complete mission tasks.** Interior tasks cover boundaries, openings, fixed elements, scale anchor, and retained objects. Exterior tasks separately cover boundary source, grade/drainage observations, utilities, setbacks, sunlight/climate, soil/planting, structures, and jurisdictional questions. System shows coverage and source-specific gaps, never a fake accuracy score.
4. **F1.3 → Review baseline.** User inspects model/2D plan and semantic fact ledger, corrects source interpretation, marks keep/move/remove, and explicitly accepts unresolved gaps for the intended decision.
5. **F1.3 → Accept baseline.** System creates a versioned canonical baseline and routes to F2.1. “Ready for concepts” means sufficient for this decision, not surveyed or buildable.

**First-run/empty:** “No spaces yet. Start with what you have—photos, a plan, measurements, or a guided capture.” **Error:** retain uploads/draft and identify the failed task. **Offline:** manual entry and queued local files remain available; cloud interpretation is paused. **Blocked:** no baseline acceptance until a scale anchor exists for fit-sensitive decisions or the user narrows the decision to non-fit presentation work.

**Control and recovery:** `Save draft and leave` resumes at the first incomplete task. `Remove north-wall.jpg` confirms: `Remove this source? Three interpreted facts will return to unresolved.` `Replace file` processes the replacement before retiring the prior source. Reopening an accepted baseline creates `Baseline correction draft`; `Discard corrections` leaves the accepted version untouched; acceptance creates a new baseline version.

### Flow 2 — baseline to materially distinct, reasoned refinement

1. **F2.1 → Request directions.** User states intent, priorities, retained objects, style/material preferences, and decision boundary. System produces 2–4 named directions only when they differ materially; otherwise it says why it cannot honestly diversify.
2. **F2.1 → Inspect reasons.** Selecting `Clear Passage`, `Host Eight`, or `Quiet Work Corner` synchronizes the semantic reason rows and spatial view. Each option shows meaningful changes, fit checks, trade-offs, blocked facts, rule references, review needs, and derivative count.
3. **F2.2 → Refine.** Keyboard/touch/text/voice yields the same typed action card. ElevenLabs voice may transcribe and clarify, but it cannot grant authority. User inspects exact affected objects/facts and ghost/text diff.
4. **F2.2 → Confirm.** Consequential actions require a normal visible button/dialog. System either blocks with a source-specific recovery, proposes a bounded alternative, or previews the requested action.
5. **F2.2 → Commit.** Accepted action creates a named immutable version and receipt. A reversal creates another version.
6. **F2.3 → Generate a presentation derivative.** Gemini/Nano Banana imagery remains in a separate plate labelled `Generated presentation · not spatial or buildability evidence`, linked to source version and provider metadata.

**Verified executable demo path — F2.R:** Open prepared dining-room proof → enable `Offline proof mode` → `Clarify and check` → observe “Geometry is computable. Authority is not.” with no 18 cm leak → check “I measured this 100 cm value for this session.” → enable and click `Record measurement` → inspect “Only evidence authority changed.” with `MATCH / MATCH / 1 FIELD` → `Rerun unchanged proposal` → reveal “40 cm fails. 18 cm passes.” → `Accept 18 cm alternative` → inspect canonical receipt. Canvas failure still leaves every action and proof in semantic HTML.

**Empty:** no options until a baseline and decision brief exist. **Generation error:** preserve brief and allow retry; do not show partial options as finished. **Blocked:** name missing authority and the exact recovery. **Offline:** F2.R uses prepared fallback with zero proposal request; horizon option generation/voice/derivatives clearly pause.

**Control and recovery:** `Cancel generation` preserves the brief; `Retry generation` reuses the same baseline and brief. `Stop compiling` preserves transcript/request. A failed commit says `Version service did not confirm the commit. The canonical scene is unchanged and your preview is preserved.` Actions are `Retry commit`, `Save action draft`, and `Discard preview`.

### Flow 3 — named decision to factual comparison and scoped handoff

1. **F3.1 → Select two named options.** System shows semantic columns for intent, object/zone changes, fit, trade-offs, freshness, unresolved facts, review state, and derivatives. Other options stay in a chooser.
2. **F3.1 → Inspect a difference.** Selecting `Minimum path` focuses the corresponding row and object in both synchronized views; `Next difference` provides keyboard/touch parity. Canvas failure leaves the table complete.
3. **F3.2 → Inspect lineage.** User sees author/source, parent, timestamp/time zone, receipt, provider truth, and grouped factual diff. Undo creates a reversing version.
4. **F3.3 → Build handoff.** User chooses recipient role, scope, two alternatives, selected version, source files, unresolved questions, receipts, and generated derivatives.
5. **F3.4 → Review.** Recipient responds `Comment`, `Needs changes`, or `Reviewed for [scope]`. The system never offers generic “Approved.” Comments attach to stable object/fact IDs and also appear in a plain list.

**Empty:** “Name and save at least two options to compare.” **Error:** preserve package draft and show which attachment failed. **Blocked:** sending is blocked until recipient role, review scope, limitations, and unresolved questions are acknowledged. **Offline:** comparison and local export remain readable; invitations/comments queue or remain unavailable with explicit copy.

**Control and recovery:** `Discard package draft` confirms and returns to Compare. A failed attachment retains its slot and offers `Replace file` / `Remove attachment`. Version load offers `Retry version` / `Open metadata only` / `Return to Compare`. Permission errors distinguish expired, revoked, and identity-mismatch links and offer `Sign in as invited email`, `Request access from sender`, or `Close review`. Sender and recipient return through the controls in §4.2.

## 6. Screen specifications

### 6.0 Shared shell and state contract

At ≥1024 px, screens use `216 px folio rail / minmax(0,1fr)` beneath a 64 px project bar. Workbench screens use a 12-column content grid with `space.6` gutters; the spatial stage spans 7 columns and semantic rail 5, with a visible keyboard-operable separator only when resizing is enabled. At 768–1023 px, regions stack 58/42 vertically. Below 768 px, the semantic decision region comes before the 3D enhancement; no horizontal page scroll is allowed.

Every screen places its delivery-status line directly below the breadcrumb in `type.small`, never in a tooltip. Shared state rules apply everywhere: **hover** changes rule/ink within `motion.fast` without lift; **focus** uses a 3 px declared outline plus 2 px surface offset; **active/pressed** adds a 10% ink state layer within `motion.press`; **loading under 300 ms** retains prior content, while longer work uses dimensioned skeletons and status text; **empty** names what is absent and gives one primary next action; **error** states cause + recovery beside the failed region and focuses the first error after submit; **blocked** retains the desired action but replaces commit with an exact requirement; **offline** uses a persistent, non-modal charcoal strip and describes retained functionality. Disabled controls retain readable ink and state text; opacity is never the only cue.

### F1.1 — Project folio & intake choice

**Status:** Design horizon · not in this release. **Purpose:** begin with the user’s real evidence, not an AI prompt.

**Desktop layout.** An 8-column editorial form sits left; a 4-column “What your sources can establish” ledger sits right and stays sticky. Title: `Start with the space you have.` The first field group contains project name, `Interior / Exterior`, `Empty / Existing`, and decision intent. A two-column source list follows: `Guided capture`, `Photos or video`, `Plan or survey`, `Measurements`, `Keep list`, `Professional records`. Footer action: `Create evidence mission`.

**Mobile.** One column in visual and DOM order: project fields → source list → source limits → CTA. Segmented controls become stacked radio rows with 44 px height.

**Data/source.** User-entered Project/Space data only. No automatic authority is assigned. The source explainer is product policy content.

**States and copy.** Default helper: `Choose every source you can provide. You can add more later.` Hover/focus follows shared contract. Loading: `Creating your evidence mission…`. Empty project name error: `Name this project so versions and handoffs stay identifiable.` File-only route blocked without decision intent: `Tell us what decision you are preparing; evidence sufficiency depends on it.` Offline: `Offline drafting · files stay on this device until connection returns.` Existing project collision: `“Cedar House kitchen” already exists. Open it or use a different name.`

### F1.2 — Evidence mission

**Status:** Design horizon · not in this release. **Purpose:** collect interior/exterior evidence through visible tasks and gaps.

**Desktop layout.** A 280 px task rail uses a semantic `<ol>` adapted from the 21st.dev ReUI Stepper. The center 7 columns host the active capture/upload/manual-entry task; the right 3 columns show `Source limits`, current authority, privacy, and coverage summary. Interior and exterior use separate task schemas, not skins. The persistent footer has `Save draft` and one primary `Review evidence` action.

**Mobile.** The task rail becomes an expandable ordered list above the active task. Camera/upload area uses `min-height: 42dvh`; textual instructions remain below it. Footer is sticky above safe area.

**Data/source.** Camera/LiDAR when supported, uploaded user files, manual fields, device timestamps, imported plan/survey metadata, and user-labelled professional records. System-derived interpretations remain `observed_unverified` or `inferred` until a valid authority event.

**Task engine.** State is `not_started → active → uploading|processing → complete`; optional tasks may become `skipped(reason)`; failures expose `retry|replace|remove`; `Reopen` returns a complete task to active and marks dependents `needs_review`. Required tasks cannot skip.

Interior order: `I00 Permissions/privacy` (required for capture/upload: camera permission, local/cloud processing consent, retention `project|delete after interpretation`); `I10 Space frame` (required: label 1–80 chars, empty/existing, decision intent); `I20 Boundaries` (required for fit: wall IDs, integer length 300–30,000 mm; ceiling 1,800–10,000 mm when vertical fit); `I30 Openings` (required for existing: type, wall ID, offset 0–wall length, width 100–10,000 mm, height 100–5,000 mm or unknown); `I40 Fixed/retained objects` (required existing: label, keep/move/remove, width/depth/height 10–10,000 mm or unresolved); `I50 Scale anchor` (required fit-sensitive: fact/object, integer 10–30,000 mm, source and authority); `I60 Source-limit review` (required acknowledgement).

Exterior order: `E00 Permissions/privacy`; `E10 Site zone` (label, empty/existing, decision); `E20 Boundary source` (required for placement: survey/parcel upload or `approximate only`, jurisdiction/address privacy); `E30 Grade/drainage observations` (required for ground work: slope direction, standing-water yes/no/unknown, source/date; never a determination); `E40 Utilities/structures` (required for placement/excavation: known/unknown list and source); `E50 Setbacks/jurisdiction` (required for structures: jurisdiction and supplied fact or unresolved professional review); `E60 Environment` (required for planting/shade: sun 0–24 hours, climate source, soil/plant notes); `E70 Scale anchor` (I50 validation); `E80 Source-limit review`.

Uploads accept JPEG/PNG/HEIC/WebP ≤20 MB each/40 images, MP4/MOV ≤250 MB each/5 videos, and PDF ≤50 MB each/10 documents. MIME and extension must agree; zero-byte, password-protected, and malware-check failures reject. Camera copy: `Camera blocked by browser. Allow access in site settings or continue with uploads/manual measurements.` Privacy/retention appears before capture; removal cancels queued cloud processing. `Review evidence` enables only when all route-required tasks are complete, at least one source exists, fit-sensitive missions have a scale anchor, no required task is processing/error/needs_review, and I60/E80 is acknowledged.

**States and copy.** Default task: `Capture the north wall and both openings.` Hover identifies task without relying on color. Focus moves into the task heading after selection. Loading: fixed-aspect preview plus `Processing 3 of 7 images. Your draft is saved.` Empty: `No evidence added to this task.` Error: `We lost camera tracking. Return to the doorway marker, or add photos and measurements instead.` Unsupported sensor: `Guided depth capture is unavailable on this device. Continue with photos, plan, or manual measurements.` Blocked: `A scale anchor is required before fit-sensitive options can be checked.` Offline: manual measurements and local camera capture continue; `Cloud interpretation paused. 7 files queued.` Exterior-specific warning: `Observed grade is not a drainage, boundary, utility, setback, or code determination.`

### F1.3 — Baseline review

**Status:** Design horizon · not in this release. **Purpose:** approve the interpreted baseline and unresolved facts for the declared decision.

**Desktop layout.** Seven-column model/2D stage left; five-column ledger right. Stage header has line tabs `3D`, `2D`, `Source` and controls `Fit view`, `Objects`, `Semantic view`. Blocking status and selected fact remain above tabs so they cannot be hidden. The right rail contains `Baseline summary`, native fact table, object/zone list, unresolved questions, and footer `Accept baseline for concepts`.

**Mobile.** `Baseline summary` and blockers come first, followed by line tabs. The default is semantic facts; 3D is user-opened. Fact details use a bottom sheet but blockers stay inline.

**Data/source.** CanonicalBaseline interpretation plus original EvidenceSources, Fact authority/freshness, object/zone IDs, and product policy dependencies.

**States and copy.** Default headline: `Review what the baseline knows—and what it does not.` Selected fact links model and row. Loading: `Building an interpretable baseline…`; no scanning animation. Empty: `This source did not establish any boundaries.` Error: `The model could not render. Your facts, sources, and baseline controls are still available below.` Blocked: `Cannot accept for “Fit a dining table”: room scale is unresolved.` Recovery: `Add one known measurement`. Offline: semantic baseline remains editable; remote interpretation is marked paused. Accepted state: `Baseline v1 is ready for concepts · 3 unresolved questions remain.`

### F2.1 — Reasoned option studio

**Status:** Design horizon · not in this release. **Purpose:** produce a small set of materially distinct, named directions.

**Desktop layout.** A full-width decision brief occupies the first 4 columns; a horizontally aligned but non-carousel option deck occupies 8. Each option is an editorial plate, not a floating card: project index, serif name, intent, three meaningful changes, two trade-offs, one blocker/review line, and `Inspect direction`. Below, a shared comparison strip normalizes `fit`, `retained objects`, `unresolved facts`, and `review needs`.

**Mobile.** Brief collapses after submission. Options form a vertical radio list; the normalized comparison appears one criterion at a time, not horizontal scroll.

**Data/source.** Accepted baseline/version, user brief, deterministic policy checks, provider proposal result, and domain-specific rule pack. Provider truth is shown per generation. No fake diversity score.

**States and copy.** Empty: `No directions yet. Finish the baseline and describe the decision you need to make.` Loading: `Developing distinct directions from Baseline v1…` with `Cancel generation`. Success names: `Clear Passage`, `Host Eight`, `Quiet Work Corner`. Insufficient diversity: `The current facts support one materially distinct layout. Add flexibility or resolve the blocked wall width before generating more.` Error: `The proposal service timed out before any complete direction was returned. Your brief and Baseline v1 are unchanged.` Actions: `Retry generation` / `Edit brief`. Blocked: `Exterior structure placement is withheld until boundary, setback, and utility questions are reviewed.` Offline: `Option generation unavailable offline.` with `Open prepared proof`.

### F2.2 — Option workbench & action confirmation

**Status:** Design horizon · not in this release. **Purpose:** refine one named option through a common bounded action contract.

**Desktop layout.** Seven-column stage and five-column reason/action rail. Persistent top line: option name, source version, review state, provider truth. Rail order is `Why this direction` → `Objects and facts` → `Action composer` → `Typed action` → `Preview / blocked result` → `Commit`. Text field label: `Describe one change`. Voice button label: `Start voice input`; it never auto-starts. Direct manipulation writes into the same typed action region.

**Mobile.** Semantic rail precedes stage. Voice/text composer is not fixed over content; a bottom action bar opens it as a full-height sheet with visible `Stop listening`, transcript, editable request, and `Review typed action`.

**Data/source.** Selected immutable option version, stable object/fact IDs, user text or ElevenLabs transcript, tool-schema result, dependency/policy output, ghost preview, and eventual receipt. Voice cannot modify Fact authority.

**States and copy.** Default: `Describe one spatial change. Nothing commits until you review it.` Listening: `Listening… Say “stop” or use the stop button.` Processing: `Turning your request into an inspectable action…`. Typed result: `Move dining table +400 mm on x. Keep path ≥900 mm. Protect bookcase.` Clarification: `Which table do you mean: dining table or side table?` Blocked: `This move depends on an observed-only bookcase width. Measure it or ask for a non-fit presentation change.` Preview: `Preview only · table x +180 mm · canonical scene unchanged.` Error: `Voice connection ended. Your transcript is preserved; continue by keyboard.` Offline: text/manual actions that can be evaluated locally remain; voice and new model clarification show `Unavailable offline`. Confirmation dialog: `Commit “table x +180 mm” to Clear Passage? This creates Version 4 and leaves professional review unresolved.` Buttons `Cancel` and `Commit as Version 4`.

### F2.3 — Presentation derivative plate

**Status:** Design horizon · not in this release. **Purpose:** present Gemini/Nano Banana visual derivatives without laundering them into canonical truth.

**Desktop layout.** A 7-column image plate with fixed 4:3 ratio sits beside a 5-column provenance caption. The label is pinned above, outside the image: `Generated presentation · not spatial or buildability evidence`. Caption shows source version, provider/model family, generated time, action/prompt summary, content credential/SynthID status when returned, and `Open factual option`. A keyboard-operable two-up comparison is default; slider is secondary.

**Mobile.** Static two-up images stack with full labels; slider is hidden because it adds no essential information. Captions precede share/download.

**Data/source.** Gemini/Nano Banana response asset and metadata linked to a named factual Version. Google documents conversational image generation/editing and SynthID for generated images ([Gemini image generation](https://ai.google.dev/gemini-api/docs/image-generation), updated 2026-07-16; accessed 2026-07-18). Interiorin’s truth label remains required regardless of provider metadata.

**States and copy.** Empty: `No presentation derivative for Version 3.` Loading: `Creating a presentation image from Version 3…` with fixed aspect ratio. Error: `Image generation failed. Version 3 and its factual comparison are unchanged.` Blocked: `Generate from a named factual version first.` Offline: `Generated presentations require a connection.` Mismatch audit: `This image may not preserve the west window. It remains presentation only.` Hover/focus reveal no hidden truth; all provenance is persistent.

### F2.R — Prepared authority proof

**Status:** Verified release slice · prepared interior proof · local production / NO_HOST branch · session-only · professional review `unreviewed`. **Purpose:** execute the judged causal proof without implying roadmap features.

**Desktop layout.** A 64 px disclosure bar contains `Prepared dining-room proof`, provider mode, policy boundary, and reset. Beneath, a 5/7 split places the semantic proof first in DOM and the prepared R3F dining room second visually on wide screens. Semantic order: request → Pass A outcome → read-only `100 cm` bookcase width → attestation checkbox → disabled/enabled Record button → six-digest proof block → Pass B action/result → commit → inline charcoal receipt. The 3D stage shows prepared geometry and a ghost only after valid Pass B.

**Mobile.** One column: provider disclosure, request, outcome, measurement/attestation, proof, result, receipt, then collapsible 3D enhancement. Controls remain ≥44 px and receipt rows wrap without truncating fact IDs.

**Data/source.** Prepared dining-room scene; frozen selected adapter action; exact facts `bookcase.center_x_mm`, `bookcase.width_mm`, `path.minimum_clearance_mm`, `table.center_x_mm`, `table.width_mm`; browser `crypto.subtle` digests; deterministic authority/policy/solver; prepared fallback disclosure; session attestation; receipt. No real capture, persistence, voice, generated image, exterior, or professional review data exists.

**Canonical digest and relationship contract.** Await SHA-256 over UTF-8 canonical JSON with sorted keys/fact IDs and integer millimetres for exactly six rows: `Geometry · Pass A input` (scene geometry before authority event); `Geometry · Pass B input` (identical pre-solver geometry); `Transaction · Pass A` (frozen +400 mm request and constraints); `Transaction · Pass B` (byte-identical frozen transaction); `Authority · Pass A` (five sorted `{factId,valueMm,authority,sourceEventId}` tuples); `Authority · Pass B` (same tuples after the event). Each hash row has only `Pending | Hashed | Error`, shows first 12 hex characters, and has a 44 px `Copy full digest`. Below them, separately compute `Geometry MATCH | MISMATCH`, `Transaction MATCH | MISMATCH`, and `Authority 1 FIELD | MISMATCH`; Authority passes only when `bookcase.width_mm.authority/sourceEventId` is the sole changed tuple field and its value remains 1,000 mm. All six rows must be Hashed and all three relationship summaries must pass before enabling the solver. Error copy: `Proof failed at [row or relationship]. Reset; no solver or commit ran.`

**Canonical receipt.** Order: version ID and timestamp/time zone; requested `+400 mm`; committed `+180 mm`; outcome; policy ID/version/full hash; provider `Prepared fallback · no model request`; session attestation/event ID/time; `Five authorizing bases` in literal order `bookcase.center_x_mm`, `bookcase.width_mm`, `path.minimum_clearance_mm`, `table.center_x_mm`, `table.width_mm`, each with value mm, authority, source type/event, captured/session time; all six full proof hashes; three relationship summaries; professional review `unreviewed`; scene diff `table.position.x_mm 920 → 1100`; limitation. Receipt IDs/hashes render fully, wrap anywhere, never ellipsize, and include 44 px copy controls.

**Canonical prepared R3F.** Millimetres map to metres. Room 5,200×4,000×2,700 mm; floor `modelGround`, two cutaway walls `surface`, 1 px `ink` edges. Table 1,600×900×750 mm at x=920,z=2,000 uses `material.oak`, roughness .78; bookcase 1,000×350×1,800 mm at x=3,300,z=350 uses `material.bookcloth`, roughness .84; metalness 0. Initial x clearance 1,080 mm; +180 leaves 900. Perspective fov 38, near .1, far 50, position `[4.8,4.2,6.8]`, target `[2.6,.75,2]`; hemisphere .9, directional 1.6 at `[4,7,5]`, contact shadow .12. Selection uses 3 px `selectedStroke`; the valid ghost is `declared` at opacity `.28` with dashed outline and is not instantiated pre-B. Orbit polar 35–78°, azimuth ±55°, distance 5.2–8.8 m; pan/auto-orbit disabled. Labelled 44 px controls: `Rotate view`, `Zoom in`, `Zoom out`, `Reset view`, `Open semantic scene`; arrows rotate 5°, +/- zoom; reduced motion removes camera interpolation.

**States and copy.** Initial: `Interiorin will not let an unverified fact authorize a fit-sensitive spatial change.` Offline switch label: `Offline proof mode`. Pass A loading: `Checking dependencies and authority…`; result: `Geometry is computable. Authority is not.` and `Prepared typed proposal`. Record remains disabled with helper `Attest that you measured this value for this session.` Checkbox: `I measured this 100 cm value for this session.` Proof loading: `Hashing unchanged geometry, transaction, and authority…`; success: `Only evidence authority changed.` with `Geometry MATCH`, `Transaction MATCH`, `Authority 1 FIELD`. Pass B loading: `Running the unchanged proposal through the integer solver…`; result: `40 cm fails. 18 cm passes.` Commit success: `The checked alternative is now canonical.` Receipt heading: `Five authorizing bases`; provider: `Prepared fallback · no model request`. Reset restores the checkbox and disables Record. Error: `Proof validation failed. Reset and rerun; no scene change was committed.` Canvas error: `3D view unavailable. Continue with the complete semantic proof.` The 18 cm equivalent is absent from DOM, accessible names, Canvas props, ghosts, and animation setup before proof-valid Pass B.

### F3.1 — Factual compare

**Status:** Design horizon · not in this release. **Purpose:** compare exactly two named options as decisions, not screenshots.

**Desktop layout.** Option chooser occupies a 64 px band. Two synchronized 3D/2D panes consume the upper 44dvh; a native semantic table below uses row headers and named option column headers. Persistent rows: intent, meaningful changes, minimum path, retained objects, trade-offs, source freshness, unresolved facts, review state, and derivatives. `Previous difference` and `Next difference` bracket a `3 of 8 differences` status.

**Mobile.** Semantic comparison leads. Each criterion becomes a heading followed by Option A and B values; difference navigation updates one criterion at a time. Static labelled views follow. No uncontrolled horizontal scroll.

**Data/source.** Two immutable DesignOption/Version records, policy results, Fact freshness, receipts, and linked derivatives.

**States and copy.** Empty: `Name and save at least two options to compare.` Loading: `Aligning Clear Passage and Host Eight…`. Error: `Spatial views could not synchronize. The factual table is still complete.` Blocked: `These options use different baseline versions. Rebase or compare facts without synchronized geometry.` Offline: persisted local comparison remains; missing remote attachments are labelled. Selected row copy: `Minimum path · 900 mm in both options · source: measured room width, 2026-07-18.`

### F3.2 — Version ledger

**Status:** Design horizon · not in this release. **Purpose:** preserve named lineage, receipts, provider truth, and reversibility.

**Desktop layout.** A 320 px ordered timeline left; selected version record right with serif name, parent, author/source, timestamp/time zone, message, grouped factual diff, receipt, review state, derivative links, and actions `Compare` / `Create reversing version`. No node graph.

**Mobile.** Timeline is an ordered disclosure list; selecting a version opens its record inline and moves focus to its heading.

**Data/source.** Persistent immutable Version records and Receipts; not session-only state.

**States and copy.** Empty: `No named versions yet. Commit a checked action to create the first one.` Loading: `Loading version history…` with `Cancel loading` returning to origin. Error: `Version 4 could not load because its receipt attachment is unavailable.` Actions: `Retry version` / `Open metadata only` / `Return to Compare`. Conflict: `This project changed elsewhere. Refresh before creating a new version; nothing was overwritten.` Offline: cached history is read-only unless local-first persistence is explicitly available. Reversal dialog: `Create Version 6 that reverses table x 1100 → 920 mm? Version 5 remains in history.`

### F3.3 — Handoff builder

**Status:** Design horizon · not in this release. **Purpose:** assemble a scoped homeowner-to-professional request.

**Desktop layout.** A 7-column form and 5-column package preview. Fieldsets: recipient role, review scope, selected version, included alternative, unresolved questions, evidence/receipts, presentation derivatives, privacy/expiry, message. Preview lists limitations before attachments. Primary action: `Create review package`.

**Mobile.** Form precedes preview; a sticky `Review package` action opens a full-screen summary before creation.

**Data/source.** User selections from versions, facts, sources, receipts, derivatives, and role/scope taxonomy. No system-generated certification.

**States and copy.** Empty question helper: `Ask the reviewer to resolve a decision, not to “approve everything.”` Loading: `Creating a read-only review package…`. Validation error: `Choose the reviewer’s role and the exact scope you are requesting.` Attachment error: `Site survey.pdf failed the file check.` Actions: `Replace file` / `Remove attachment`. Blocked: `3 unresolved safety questions are not acknowledged.` Offline: `Package draft saved locally. Invitations require a connection.` Success: `Review package created · no professional response yet.`

### F3.4 — Reviewer package

**Status:** Design horizon · not in this release. **Purpose:** let a named recipient review evidence and alternatives within a declared scope.

**Desktop layout.** Read-only package header gives project, sender, recipient role, scope, expiry, and status `Awaiting review`. Main column contains selected version, two-option compare, unresolved questions, and sources/receipts; a 360 px comment rail lists object/fact-linked threads. Response controls are `Comment`, `Needs changes`, `Reviewed for [scope]`.

**Mobile.** Document outline, content, then comment list. Object-linked annotations always have a plain list equivalent. Response controls appear after limitations, not fixed over content.

**Data/source.** Immutable package snapshot, stable IDs, scoped reviewer identity, comments, and response event.

**States and copy.** Loading: `Opening the review package…` with `Cancel opening`. Expired: `This package expired on July 31, 2026.` Actions `Request a new link from sender` / `Close review`. Identity mismatch: `This link was issued to maya@example.com, but you are signed in as another account.` Actions `Sign in as invited email` / `Request access from sender` / `Close review`. Revoked copy names sender revocation. Empty comments: `No review comments yet.` Offline: cached package is read-only; new comments cannot submit. Response confirmation: `Record “Reviewed for furniture layout only”? This does not certify structure, code, utilities, drainage, boundaries, procurement, or buildability.`

## 7. Component inventory

| Component | Source pattern | Props / states | Screens | Cost and truth note |
|---|---|---|---|---|
| `DeliveryStatusLine` | Custom | `verifiedSlice | designHorizon`, provider, hosting, persistence, review | All | Low; always visible, never a badge-only tooltip |
| `EvidenceMissionStepper` | 21st.dev ReUI vertical Stepper, restyled | tasks, authority, optional reason, active/complete/error | F1.2 | Medium; semantic `<ol>` and 44 px rows required |
| `EvidenceDropZone` | React Spectrum DropZone/FileTrigger behavior | idle, drag, upload, progress, type/size/privacy error | F1.1–F1.2 | Medium; native file input fallback |
| `SpatialSemanticSplit` | shadcn/base Resizable behavioral reference + custom CSS | min panes, keyboard handle, stacked fallback | F1.3, F2.2, F2.R | Medium; do not add dependency for verified slice unless needed |
| `LineTabs` | shadcn/base Tabs + WAI tabs behavior | selected, hover, focus, disabled; arrow/Home/End | F1.3, F2.3 | Low; blockers remain outside inactive panels |
| `AuthorityMark` | Custom + Lucide | verified, declared, observed, inferred, generated | All evidence screens | Low; label/icon/rule/pattern always combined |
| `FactLedger` | shadcn/base Table behavior, native `<table>` | loading, empty, selected, stale, error, dependency link | F1.3, F2.2, F2.R | Low–medium; mobile stacked semantics |
| `ReasonPlate` | Custom editorial plate | name, intent, changes, tradeoffs, blockers, selected | F2.1 | Medium; no generic card lift or carousel-only use |
| `TypedActionCard` | Custom | source mode, exact params, affected IDs, blocked/preview/ready | F2.2, F2.R | Medium; common contract for all inputs |
| `VoiceComposer` | Custom over ElevenLabs horizon integration | idle, permission, listening, processing, interrupted, transcript, offline | F2.2 | High; text/keyboard parity and visible stop required |
| `InspectorSheet` | Existing Radix Dialog + shadcn Sheet pattern | open/close, unsaved confirm, focus return | F1.3, F2.2 | Low–medium; blockers never live only in sheet |
| `CommitDialog` | shadcn Alert Dialog + WAI modal pattern | action, affected facts, unresolved review, pending/error | F2.2, F3.2 | Low; only consequential actions |
| `DerivativePlate` | 21st.dev Motion Primitives Image Comparison, heavily adapted | two-up/slider, labels, keyboard position, metadata, mismatch | F2.3 | Medium; default static two-up; presentation-only label persistent |
| `ProofDigestBlock` | Custom | pending, valid, mismatch, error; copy hash | F2.R | Low; six awaited digests and no early result leak |
| `SemanticCompare` | Native table / stacked definition list | two versions, difference nav, empty/error | F3.1 | Medium; primary compare, not Canvas |
| `VersionTimeline` | Custom ordered list inspired by Speckle/GitHub | current, parent, expanded, conflict, offline | F3.2 | High due persistence, not visual complexity |
| `ReviewPackageForm` | Native fieldsets + Radix primitives | draft, validation, upload, blocked, success | F3.3 | High due permissions/export |
| `ToastRegion` | Custom | polite success, persistent error; 3–5 s dismiss for success | All | Low; never steals focus |

## 8. Interaction and motion

| Beat | Trigger and motion | Token | Why it earns cost | Reduced motion |
|---|---|---|---|---|
| Authority-only reveal | Valid attestation inserts the declared rule over the old observed rule; one 6 px-to-0 ledger settle, then `MATCH / MATCH / 1 FIELD` crossfade | `emphasis`, `ease.state` | Central causal proof | Immediate row replacement and focus move; no translation |
| Pass-B ghost | Valid proof + rerun reveals the table ghost at +180 mm; opacity 0→.28 and transform to checked position | `base`, `ease.enter` | Spatially connects semantic result | Static ghost at .28 appears; text result is primary |
| Reason ↔ object link | Select reason row; unrelated model objects/rows reduce to .45 opacity, target outline appears | `base`, `ease.state` | Connects explanation to space | Immediate outline and text `Focused object` |
| Voice crystallization | Final transcript becomes a stable TypedActionCard via one shared-element transform | `emphasis`, `ease.enter` | Shows voice compiling into bounded state | Transcript replaced immediately; focus moves to card heading |
| Option to compare | Selected ReasonPlate identity becomes compare column via Motion layout | `emphasis`, `ease.enter` | Maintains option identity | Instant route change with heading focus |
| Receipt assembly | Four groups—request, bases, proof/provider, diff—fade in with 40 ms stagger after commit | `base` + `stagger` | Clarifies causal order without theater | All groups present immediately |

Use the repository’s existing Motion dependency. Do not add GSAP for the verified slice. GSAP Flip is permitted later only if synchronized option-to-compare continuity cannot be expressed with current Motion; licensing availability is not a reason to animate. Camera control is always user-driven and interruptible. No animation blocks input or withholds state.

## 9. Accessibility

All essential text pairs meet WCAG AA: ink/canvas 13.16:1, graphite/canvas 5.53:1, ink/surface 14.33:1, graphite/surface 6.03:1, inverse/charcoal 14.28:1, verified/surface 6.68:1, declared/surface 7.29:1, observed/surface 5.96:1, inferred/surface 6.22:1, danger/surface 7.83:1. Data strokes and non-text focus/selection boundaries maintain at least 3:1 against adjacent surfaces. Browser zoom is never disabled. Text scales to 200% without clipping; mobile body stays 16 px.

**Keyboard and focus order.** A skip link targets `<main>`. Desktop order is project bar → primary nav → delivery status → H1 → content. Mobile order is skip link → project controls → main delivery status/H1/content → visually bottom-fixed primary nav. Route activation focuses H1 and announces the destination; Back restores history state, scroll, and trigger focus. Flow 1 follows project fields, source routes, ordered mission tasks, active task, fact ledger, baseline CTA. Flow 2 follows brief, option radio list, reasons, composer, voice stop/transcript, action card, preview, commit, receipt; Canvas follows semantic controls. F2.R follows offline switch, Clarify, outcome, attestation checkbox, Record, six hashes, three relationship summaries, Rerun, result, Accept, receipt, Reset. Flow 3 follows chooser, difference controls, table, spatial views, version history, handoff fields, preview, create/send.

Tabs use Left/Right, Home/End. Resizable separators have `role=separator`, orientation, value, arrow-key increments, and a reset shortcut. Canvas objects always have semantic list/property equivalents and visible `Focus in model` controls. Dragging has directional move buttons and keyboard increments; drag never commits. Comparison rows and chart-like views have native table/definition-list fallbacks. Live progress uses `aria-live=polite`; blocking/form errors use `role=alert`; toasts do not steal focus. Dialogs trap focus, have a labelled close/cancel route, and return focus to trigger. Destructive/reversing actions require confirmation.

Every target is at least 44 × 44 px with 8 px spacing. Touch does not depend on hover, precision handles, swipe, or gesture-only controls. Bottom navigation respects safe-area insets. At 375 px and landscape, sticky bars reserve content space and no essential content scrolls horizontally. `prefers-reduced-motion` behavior is defined in §3.4 and §8.

## 10. Voice and content style

### Tone

Calm, exact, domestic, and candid. State what is known, who supplied it, what remains unresolved, and the next recovery. Use short active sentences. Never flatter, anthropomorphize the system, or imply professional authority. A block is a useful decision boundary, not a failure celebration.

### Terminology

| Use | Never use |
|---|---|
| Interiorin | Groundline as public product name |
| baseline, factual version | digital twin when accuracy is not established |
| measured/verified | guaranteed accurate, certified |
| user-declared | verified by AI |
| observed-unverified | probably accurate, 92% confidence |
| inferred | smart measurement |
| generated presentation | render proof, spatial truth |
| checked alternative | optimized solution, safest choice |
| reviewed for furniture layout | approved, professionally verified |
| prepared fallback · no model request | AI mode, live Terra |
| create reversing version | erase history, undo overwrite |
| review need | compliance issue unless sourced and applicable |

### Microcopy and voice parity

Prefer cause + boundary + recovery: `This move depends on an observed-only width. Measure it or choose a non-fit presentation change.` Use exact units and object names: `table x +180 mm`, not `move it a bit`. Generated imagery always says: `Generated presentation · not spatial or buildability evidence · derived from Clear Passage v3.`

Voice never auto-starts, attests a measurement, changes authority, or becomes the only confirmation route. States are visible: `Microphone off`, `Listening`, `Processing`, `Speaking`, `Connection ended`. A user can stop, edit the transcript, inspect the typed action, and confirm with the same normal button available to keyboard/touch users. Spoken `yes` may navigate to the confirmation surface but does not commit a consequential mutation without the configured equivalent explicit control and accessible confirmation record.

## 11. Out of scope

This document deliberately does **not** design or imply construction certification, autonomous professional authority, automatic measurement attestation, permit/code approval, structural/MEP analysis, drainage/utility/property-boundary determination, surveying, legal advice, safety guarantees, autonomous purchasing, pricing/cost estimating, procurement, contractor marketplace, material ordering, CAD/BIM authoring or interchange, fabrication drawings, photoreal-render accuracy claims, multi-user real-time co-editing, enterprise administration, or a proprietary “moat” claim.

The complete user roadmap is **not erased**: real empty/existing interior and exterior intake, honest general-purpose spatial baselines, distinct reasoned options, bounded ElevenLabs voice, labelled Gemini/Nano Banana derivatives, persistence, named comparison, and scoped homeowner/pro handoff are designed as the horizon in §§4–10. They remain excluded from the verified release claim until implemented and validated. The judged release remains the single prepared interior proof, offline/prepared provider path, session-only state, and `unreviewed` professional status. No hosted runtime, live Terra, arbitrary space, mobile release, or exterior runtime is claimed.

## 12. Claude Design build prompt

Design and implement Interiorin, an evidence-aware residential spatial studio for homeowners, renters, and independent residential professionals. The full product lets a person show an empty or existing interior or exterior space, build an honest source-aware baseline, receive materially distinct reasoned directions, refine them by keyboard, touch, text, or bounded voice, save immutable named versions, compare factual differences, and prepare a scoped professional handoff. Maintain a hard truth boundary: the only current verified release slice is a prepared interior dining-room authority proof at commit `b1b392f`, local-production/NO_HOST, session-only, offline prepared fallback, and professional review `unreviewed`. Every roadmap screen must visibly say `Design horizon · not in this release`; the proof screen says `Verified release slice · prepared interior proof`.

Use Material Ledger Studio: tactile, archival, inhabited, exact, quietly premium, source-aware; Surveyor’s Margins only for dimensions, hatching, and the authority proof. Reject purple/glass/HUD/default-shadcn/bento/chat-first/luxury/CAD styling, fake confidence/hashes, emoji/sparkles, pill soup, continuous camera motion, and render-as-proof.

Tokens: canvas/surface/model `#F4F0E7/#FBFAF6/#E8E0D3`, ink/graphite `#202923/#5A625C`, charcoal/inverse `#252824/#FBFAF6`, verified/declared/observed/inferred/danger `#35624F/#2F596A/#9B4835/#7A5810/#8C3028`, boundary `#4D554F`, selected/focus `#2F596A`, decorative rules `#A79E91/#D8D0C3`, oak/bookcloth `#8A6E52/#6F5B47`, scrim `rgba(20,24,21,.56)`. Authority is label+Lucide+solid 4 px/double 3 px/dashed 2 px/8 px hatch/dotted frame. Newsreader/Georgia: display 56/500/1.04 (mobile 40/1.08), H1 40/500/1.10 (32/1.15), H2 28/500/1.18 (24/1.22); IBM Plex Sans/Arial: H3 20/600/1.30, body 16/400/1.55, bodyStrong 16/600/1.45, small 14/400/1.45, meta 12/600/1.35/.02em; IBM Plex Mono/Consolas 13/500/1.45 tabular. Space 4/8/12/16/24/32/48/64; radii 0/2/6/10/999 round; Lucide 16/20/24 at 1.75 px. Targets ≥44 px, gap ≥8; essential border 1 px boundary, selection 4 px, focus 3 px+2 offset; reading measure 760. Breakpoints 375/768/1024/1440, max 1600. Shadows overlay/menu `0 18px 48px rgba(20,24,21,.18)`/`0 8px 24px rgba(20,24,21,.14)`; z named base/sticky/popover/sheet/dialog/toast/skip `0/20/40/80/100/120/200`. Motion press/fast/base/emphasis/stagger `100/150/220/300/40` ms; enter `cubic-bezier(.16,1,.3,1)`, exit `(.4,0,1,1)`, state `(.2,0,0,1)`; transform/opacity only, reduced immediate.

Build exactly three flows across 11 screens. **F1.1 Project Folio:** eight-column form/four-column source-limit ledger, mobile stacked; user data fields are name, Interior/Exterior, Empty/Existing, intent, evidence routes. Copy `Start with the space you have.` Handle duplicate-name, offline draft, and dirty Cancel with save/leave/stay.

**F1.2 Evidence Mission:** 280 px ordered stepper, active task, source/privacy ledger; mobile tasks above sticky Review. Interior tasks are permissions, frame, boundaries, openings, retained objects, scale anchor, limits; exterior adds boundary, grade/drainage, utilities, setbacks, environment. Validate integer mm and route requirements; uploads are image 20 MB, video 250 MB, PDF 50 MB. Support permission denial, remove/replace/reopen. Review enables only when required tasks, one source, fit scale, no processing/error, and limits acknowledgement pass.

**F1.3 Baseline Review:** seven-column 3D/2D/Source stage plus five-column fact/object/gap rail; mobile facts first. Data is interpreted baseline linked to original evidence. Copy `Review what the baseline knows—and what it does not.` Canvas failure preserves facts; correction creates a new baseline version.

**F2.1 Option Studio:** four-column brief/eight-column editorial plates; mobile vertical radio list. Data is accepted baseline, brief, provider proposal, deterministic checks. Show 2–4 distinct names. Timeout says cause and offers Retry/Edit; Cancel preserves brief; offline exposes `Open prepared proof`.

**F2.2 Option Workbench:** seven-column stage/five-column reason/action rail; mobile semantic rail and composer sheet. Data is immutable option, stable IDs, ElevenLabs transcript/tool schema, policy, receipt. Provide Start/Stop voice, transcript edit, TypedActionCard, preview, Commit, Version history. Failed commit preserves preview and offers Retry/Save draft/Discard.

**F2.3 Derivative Plate:** 4:3 image seven columns/provenance five; mobile static two-up then caption. Data is Gemini/Nano Banana asset/metadata tied to Version. Persist `Generated presentation · not spatial or buildability evidence`; failure leaves facts unchanged and offers Retry/Return; offline blocks.

**F2.R Prepared Proof:** semantic five columns/R3F seven; mobile proof before 3D. Pass A blocks; attestation enables Record. Six Geometry A/B, Transaction A/B, Authority A/B hashes each show `Pending|Hashed|Error`, first 12 hex plus 44 px Copy; separate summaries must be `Geometry MATCH`, `Transaction MATCH`, `Authority 1 FIELD`. All hashes and relationships pass before solver; no 18 cm equivalent exists pre-B. Then `40 cm fails. 18 cm passes.` Receipt shows version/time, requested 400, committed 180, policy/provider/attestation; five literal fact IDs, six full wrapping hashes, summaries, unreviewed, diff 920→1100, limitation. R3F room 5200×4000×2700, table 1600×900×750 x920, bookcase 1000×350×1800 x3300, fov38 camera `[4.8,4.2,6.8]`, lights .9/1.6, declared ghost `.28` only post-B; bounded orbit, no pan/auto-orbit, labelled controls. Error: `Proof failed at [row or relationship]. Reset; no solver or commit ran.`

**F3.1 Compare:** chooser, synchronized views, native two-column table; mobile one criterion then static images. Data is two immutable versions/checks. Preserve selected difference through Version history; Canvas/baseline mismatch retains factual compare and recovery.

**F3.2 Version Ledger:** 320 px ordered timeline plus record; mobile disclosures. Data is persistent versions/receipts. Show parent/source/time/diff/review; load failure offers Retry/metadata/Compare; reversal creates a version; Back restores trigger focus.

**F3.3 Handoff Builder:** seven-column fieldsets/five-column preview; mobile form then full-screen preview. Data is versions, sources, receipts, derivatives, role/scope. Require limitations/questions; confirm discard; error `Site survey.pdf failed the file check.` with `Replace file` / `Remove attachment`; offline `Package draft saved locally. Invitations require a connection.`

**F3.4 Reviewer Package:** external no-app-nav document plus 360 px comments; mobile outline/content/comments. Data is signed package/reviewer events. State exact expired/revoked/identity cause with Sign in/Request access/Close; sender returns to project. Responses are Comment, Needs changes, Reviewed for scope—never Approved.

Map behavior to official patterns: a restyled 21st.dev ReUI vertical stepper for Evidence Mission; React Spectrum DropZone/FileTrigger behavior for uploads; shadcn/base Resizable and Tabs behavior for workbench regions; native shadcn-style Tables for facts/compare; existing Radix Dialog plus Sheet and Alert Dialog behavior for inspectors and consequential confirmation; a heavily adapted 21st.dev Motion Primitives image comparison with static two-up default; existing Motion and Lucide. Do not claim the unavailable 21st.dev magic MCP was used.

Desktop uses a 216 px rail, 64 px bar, 12 columns; tablet stacks. Mobile DOM/tab order is skip/project controls → main → visually bottom-fixed four-label nav, with safe-area content reserve. Route activation focuses H1/announces; Back restores history, scroll, selection, trigger focus. Render each named loading/empty/error/blocked/offline recovery, plus hover/focus. Preserve native tables/lists, drag/Canvas/voice parity, 200% zoom, 375 px/landscape, reduced motion. Data precedes animation; WebGL failure never removes facts, actions, compare, or receipt.
