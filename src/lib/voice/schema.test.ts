import { describe, expect, it } from "vitest";
import { voiceBriefSchema, voiceRefinementSchema, voiceSessionEnvelopeSchema } from "./schema";

describe("bounded voice contracts", () => {
  it("accepts a complete concise homeowner brief", () => {
    expect(voiceBriefSchema.safeParse({ purpose: "Read and host friends", feeling: "Warm and calm", mustKeep: "Clear balcony access", improveOrAvoid: "Avoid bulky storage" }).success).toBe(true);
  });

  it("rejects extra tool authority and oversized refinements", () => {
    expect(voiceBriefSchema.safeParse({ purpose: "Read", feeling: "Calm", mustKeep: "Door", improveOrAvoid: "Clutter", approve: true }).success).toBe(false);
    expect(voiceRefinementSchema.safeParse({ transcript: "x".repeat(501) }).success).toBe(false);
  });

  it("accepts only secure short-lived provider URLs", () => {
    expect(voiceSessionEnvelopeSchema.safeParse({ signedUrl: "wss://api.elevenlabs.io/session", expiresInSeconds: 900, initialization: { stage: "brief" } }).success).toBe(true);
    expect(voiceSessionEnvelopeSchema.safeParse({ signedUrl: "https://example.com", expiresInSeconds: 900, initialization: {} }).success).toBe(false);
  });
});
