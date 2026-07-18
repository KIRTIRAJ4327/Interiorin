# Interiorin — Material Ledger Studio design system

## Foundation

Mood: tactile, archival, inhabited, exact, quietly premium, source-aware. Surveyor’s Margins is limited to dimensions, hatching, indexed callouts, and causal proof. Surfaces are flat and editorial; spatial geometry/material specimens provide richness.

### Color

| Token | Value | Contract |
|---|---:|---|
| canvas / surface / modelGround | `#F4F0E7` / `#FBFAF6` / `#E8E0D3` | paper, work surface, spatial stage |
| ink / graphite | `#202923` / `#5A625C` | primary / secondary text |
| charcoal / inverse | `#252824` / `#FBFAF6` | receipt dock, 14.28:1 |
| verified / declared | `#35624F` / `#2F596A` | measured / user-declared-focus |
| observed / inferred / danger | `#9B4835` / `#7A5810` / `#8C3028` | uncertainty, assumption, destructive |
| controlBoundary / selectedStroke | `#4D554F` / `#2F596A` | ≥5.81:1 on canvas/surface/model |
| rule / ruleSoft | `#A79E91` / `#D8D0C3` | decoration only; never control/data identification |
| material.oak / material.bookcloth | `#8A6E52` / `#6F5B47` | prepared R3F materials only |
| scrim | `rgba(20,24,21,.56)` | modal isolation |

Control background is surface; disabled background/foreground is modelGround/ink and includes `Unavailable` plus not-allowed cursor. Evidence chips show first 12 hash characters + 44 px Copy; receipt hashes show full wrapping values without ellipsis.

### Authority and status grammar

| State | Icon | Structure | Required text |
|---|---|---|---|
| Verified/measured | BadgeCheck | solid 4 px verified rule | `Measured/verified` |
| User-declared | UserRoundCheck | double 3 px declared rule | `User-declared` |
| Observed-unverified | Eye | dashed 2 px observed rule | `Observed-unverified` |
| Inferred | Triangle | 8 px diagonal hatch | `Inferred` |
| Generated | Image | dotted frame | `Presentation only` |
| Blocked | CircleSlash2 | observed boundary + reason block | cause + recovery |
| Offline | WifiOff | charcoal disclosure | `Prepared fallback · no model request` |

Color is never the only indicator. Product status is persistent text: `Design horizon · not in this release` or `Verified release slice · prepared interior proof`.

## Typography

| Role | Family | Desktop | Mobile |
|---|---|---|---|
| Display | Newsreader, Georgia, serif | 56/500/1.04 | 40/500/1.08 |
| H1 | Newsreader, Georgia, serif | 40/500/1.10 | 32/500/1.15 |
| H2 | Newsreader, Georgia, serif | 28/500/1.18 | 24/500/1.22 |
| H3 | IBM Plex Sans, Arial, sans-serif | 20/600/1.30 | same |
| Body | IBM Plex Sans, Arial, sans-serif | 16/400/1.55 | same |
| Body strong | IBM Plex Sans, Arial, sans-serif | 16/600/1.45 | same |
| Small / meta | IBM Plex Sans, Arial, sans-serif | 14/400/1.45; 12/600/1.35/.02em | same |
| Evidence | IBM Plex Mono, Consolas, monospace | 13/500/1.45 tabular | same |

Use `font-display: swap`. Reading measure ≤760 px/70 characters desktop and 58 characters mobile. Serif = human meaning; sans = instruction; mono = evidence only.

## Geometry and layout

- Spacing: 4/8/12/16/24/32/48/64 px.
- Radius: 0/2/6/10/999 px; round only for switch tracks/status dots.
- Essential border: 1 px controlBoundary; selected directional rule: 4 px declared; focus: 3 px declared + 2 px surface offset.
- Shadows: none by default; overlay `0 18px 48px rgba(20,24,21,.18)`; menu `0 8px 24px rgba(20,24,21,.14)`.
- Lucide icons: 16/20/24 px, 1.75 px stroke. Interactive targets ≥44×44 px, gaps ≥8 px.
- Breakpoints: 375/768/1024/1440 px; app max 1600 px.
- Desktop: 216 px rail, 64 px project bar, 12 columns/24 px gutters; workbench stage 7, semantic rail 5.
- Tablet: 72 px rail and 58/42 stacked regions. Mobile: semantic content before 3D; no page horizontal scroll.
- Mobile DOM/tab order: skip link → project controls → main → visually bottom-fixed four-label nav. Reserve `calc(72px + env(safe-area-inset-bottom))`.
- Z: base 0, sticky 20, popover 40, sheet 80, dialog 100, toast 120, skip 200.

## Component rules

- Editorial plates use rules/crops, not card lift. No default hover transform.
- Native headings, lists, tables, fieldsets, buttons, file inputs, and links are the semantic substrate.
- 3D, image comparison, tabs, and sheets supplement rather than hide blocking facts.
- Dialogs trap focus, have Cancel/Close, and return focus. Confirmation is reserved for canonical/destructive actions.
- Fact tables use row/column headers; mobile transforms to criterion/value stacks without horizontal page scrolling.
- Voice always has text input, visible Stop, editable transcript, typed action, and ordinary confirmation.
- Generated derivatives retain source Version, provider metadata, and presentation-only label.
- Exact attachment recovery is `Replace file` / `Remove attachment`.

## Motion

Press/fast/base/emphasis/stagger = 100/150/220/300/40 ms. Enter `cubic-bezier(.16,1,.3,1)`; exit `cubic-bezier(.4,0,1,1)`; state `cubic-bezier(.2,0,0,1)`. Transform/opacity only; exits are shorter. Data appears before animation. Reduced motion removes translation, camera interpolation, FLIP, scrub, and stagger; allow immediate state or ≤100 ms opacity. Skeletons reserve bounds and never shimmer.

Authority reveal crossfades row structure at 300 ms. Pass-B ghost is always declared opacity `.28`, never instantiated pre-B. Receipt may reveal four already-present groups at 40 ms stagger.

## Accessibility and contrast

Ink/canvas 13.16:1; graphite/canvas 5.53:1; ink/surface 14.33:1; graphite/surface 6.03:1; inverse/charcoal 14.28:1; verified/declared/observed/inferred/danger on surface 6.68/7.29/5.96/6.22/7.83:1. controlBoundary on canvas/surface/model 6.77/7.37/5.88:1; selectedStroke 6.70/7.29/5.81:1. Rule tokens are decorative because they are below 3:1.

Provide skip link, H1 focus after routes, Back restoration, 200% zoom, screen-reader labels, polite progress, alert errors, 375 px and landscape support, safe areas, keyboard drag alternatives, and semantic equivalents for every Canvas state. WebGL failure cannot remove proof, facts, actions, comparison, or receipt.

## R3F visual contract

Prepared room 5200×4000×2700 mm; table 1600×900×750 at x920,z2000, material.oak roughness .78; bookcase 1000×350×1800 at x3300,z350, material.bookcloth roughness .84; metalness 0. Camera perspective fov38, near .1/far50, `[4.8,4.2,6.8]` targeting `[2.6,.75,2]`. Hemisphere .9, directional 1.6 at `[4,7,5]`, contact shadow .12. Selected stroke 3 px. Ghost declared `.28` only post-B. Orbit polar 35–78°, azimuth ±55°, distance 5.2–8.8; pan and auto-orbit disabled. Controls are labelled rotate, zoom in/out, reset, semantic scene, all 44 px.

## Banned patterns

Purple/violet gradients; glassmorphism/HUD/neon; default shadcn; bento or three-card feature grids; chat-first blank canvas; luxury-real-estate styling; CAD/GIS cosplay; faux paper/tape/handwriting; emoji/sparkles/generic AI icons; pill-badge soup; fake confidence, hashes, seals, metrics, social proof; 10–11 px microtype; hover-only or color-only truth; Canvas-only controls; continuous orbit/cinematic tours/confetti; generated image as geometry, evidence, review, or buildability; exterior recolored green without exterior facts.
