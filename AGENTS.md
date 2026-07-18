# Interiorin — implementation policy

## Product goal

Build a trustworthy spatial design studio for interiors and exteriors. A person can provide an empty or existing space, understand a calibrated 3D approximation, generate reasoned design directions, refine known scene objects by voice or keyboard, save named options, and compare what actually changed.

## Non-negotiables

1. Never claim survey, structural, drainage, code, product-availability, or buildability certainty from an image.
2. Keep canonical geometry and scene state separate from optional generated presentation images.
3. Every agent or voice action must resolve through a bounded, validated action layer and produce a visible receipt or explicit refusal.
4. API keys remain server-side. Browser code receives only provider-issued short-lived tokens where supported.
5. Prepared demo data is labeled; no silent fallback or fake success.
6. All meaningful states need keyboard parity, visible focus, reduced-motion behavior, and mobile reflow.
7. Follow the approved documents under `docs/`. When implementation discovers a material contradiction, write an ADR in `docs/decisions/` instead of silently drifting.
8. Run lint, type checks, tests, and a production build before calling a milestone complete.

## Repository boundaries

- `src/` — application code.
- `public/` — licensed/static application assets.
- `tests/` — behavior, accessibility, and integration tests.
- `docs/` — approved product/design/architecture artifacts and decision records.
- The Forge orchestrator and raw research remain in the separate `forge` repository.

