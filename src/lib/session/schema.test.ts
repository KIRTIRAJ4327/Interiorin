import { describe, expect, it } from "vitest";
import { studioCommandSchema, studioEventSchema } from "./schema";

describe("paired studio contracts", () => {
  it("requires revision and idempotency on every command", () => {
    expect(studioCommandSchema.safeParse({ type: "generate_options" }).success).toBe(false);
    expect(studioCommandSchema.parse({
      type: "generate_options",
      idempotencyKey: crypto.randomUUID(),
      expectedRevision: 0,
      clientTimestamp: new Date().toISOString(),
    }).type).toBe("generate_options");
  });

  it("rejects audit events with unknown types", () => {
    expect(studioEventSchema.safeParse({
      id: 1,
      sessionId: crypto.randomUUID(),
      eventType: "chain_of_thought",
      actorRole: "controller",
      payload: {},
      createdAt: new Date().toISOString(),
    }).success).toBe(false);
  });
});

