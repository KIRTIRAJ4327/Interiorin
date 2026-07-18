# ADR 0001 — paired Phone Controller and Studio Wall

**Status:** accepted  
**Date:** 2026-07-18

## Decision

Interiorin will expose a private, mobile-first Phone Controller and a public Studio Wall backed by one canonical session. The server owns canonical mutation. The phone submits requests and explicit confirmations; the wall visualizes options, the 3D model, the Decision Trace, comparisons, and the architect review sheet.

Supabase anonymous Auth, Postgres, private Realtime channels, and private Storage are the primary real-device transport. Membership rows tied to `auth.uid()` authorize session access. BroadcastChannel plus localStorage is a disclosed same-device fallback and test adapter; it is never described as cross-device.

## Consequences

- Every accepted mutation is revision-checked, idempotent, deterministically validated, persisted, receipted, and broadcast.
- Realtime payloads contain display-safe structured events, never photos, secrets, prompts, or chain-of-thought.
- User-entered measurements remain the metric authority; image analysis remains non-metric observation.
- `/studio` remains the combined fallback and regression surface.
- Concept rendering and phone-side 3D are not part of the deadline hero journey.

