import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const saved = { key: process.env.OPENAI_API_KEY, enabled: process.env.ENABLE_LIVE_OPENAI, canary: process.env.OPENAI_CANARY_RESPONSE_ID };
afterEach(() => { process.env.OPENAI_API_KEY = saved.key; process.env.ENABLE_LIVE_OPENAI = saved.enabled; process.env.OPENAI_CANARY_RESPONSE_ID = saved.canary; });

describe("paired refinement route", () => {
  it("returns the deterministic clarification without a live key", async () => {
    delete process.env.OPENAI_API_KEY; process.env.ENABLE_LIVE_OPENAI = "true"; process.env.OPENAI_CANARY_RESPONSE_ID = "resp_test";
    const response = await POST(new Request("http://localhost/api/refine", { method: "POST", body: JSON.stringify({ transcript: "Move it over", fallbackQuestion: "Name a visible object and distance.", context: { objects: [], zones: [] } }) }));
    const body = await response.json();
    expect(body.mode).toBe("prepared_fallback");
    expect(body.clarification).toBe("Name a visible object and distance.");
    expect(JSON.stringify(body)).not.toMatch(/system|chain.of.thought/i);
  });
  it("rejects oversized or unbounded context before any provider call", async () => {
    const response = await POST(new Request("http://localhost/api/refine", { method: "POST", body: JSON.stringify({ transcript: "x", fallbackQuestion: "Ask.", context: { objects: [], zones: [] } }) }));
    expect(response.status).toBe(400);
  });
});
