import { afterEach, describe, expect, it } from "vitest";
import { clearRateLimitsForTests, consumeRateLimit } from "./rate-limit";

describe("bounded provider session requests", () => {
  afterEach(clearRateLimitsForTests);

  it("rejects requests after the configured window limit", () => {
    expect(consumeRateLimit("voice:test", 2, 1_000, 0).allowed).toBe(true);
    expect(consumeRateLimit("voice:test", 2, 1_000, 10).allowed).toBe(true);
    expect(consumeRateLimit("voice:test", 2, 1_000, 20)).toMatchObject({ allowed: false, retryAfterSeconds: 1 });
    expect(consumeRateLimit("voice:test", 2, 1_000, 1_001).allowed).toBe(true);
  });
});
