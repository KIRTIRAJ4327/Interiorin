# ADR 0002 — Reopen bounded voice and visual reveal

**Status:** Accepted  
**Date:** 2026-07-19

## Context

The credential-free release deliberately cut ElevenLabs voice and generated presentation imagery. The paired Phone Controller, canonical room, deterministic action resolver, Decision Trace, named comparison, and architect concept handoff are now implemented and green. The remaining hackathon story benefits from a concise real-phone voice guide and one explicit in-room presentation reveal without changing the authority model.

## Decision

Reopen two provider-backed capabilities behind independent feature and credential gates:

1. ElevenLabs provides optional, authenticated speech-to-speech guidance and final transcripts. Its client tools may draft a brief, submit a refinement transcript, or read a capped summary. They cannot approve, mutate, save, export, generate imagery, or delete.
2. Google Gemini image generation provides an explicit presentation derivative compiled from trusted canonical state. The derivative is revision-linked, privately stored, visibly disclosed as unmeasured, and never used as geometry or validation evidence.

The phone remains the input and approval surface. The wall remains the canonical visualization, Decision Trace, comparison, and review surface. Typed input and the combined `/studio` route remain fallbacks.

## Consequences

- Provider failures degrade to typed input and canonical 3D without mutation.
- Raw API keys, room images, signed URLs, and unvalidated provider payloads never enter Realtime events.
- The existing session revision, idempotency, deterministic checks, receipts, version comparison, and handoff contracts remain authoritative.
- ElevenCreative may be used to benchmark prompts manually; the deployed application uses a provider adapter and direct Gemini API until a supported ElevenCreative programmatic API exists.
- Kitchen/generalized room kits, phone 3D, GLTF, structural inference, photogrammetry, collaboration, and decorative expansion remain out of scope.
