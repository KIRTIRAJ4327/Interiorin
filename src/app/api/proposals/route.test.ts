import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalApiKey = process.env.OPENAI_API_KEY;
const originalLiveFlag = process.env.ENABLE_LIVE_OPENAI;

function proposalRequest() {
  return new Request("http://localhost/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request: "Move the dining table 40 cm toward the bookcase." }),
  });
}

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;

  if (originalLiveFlag === undefined) delete process.env.ENABLE_LIVE_OPENAI;
  else process.env.ENABLE_LIVE_OPENAI = originalLiveFlag;
});

describe("proposal provider gate", () => {
  it("uses the disclosed prepared fallback when no API key exists", async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.ENABLE_LIVE_OPENAI = "true";

    const response = await POST(proposalRequest());
    const envelope = await response.json();

    expect(envelope.mode).toBe("prepared_fallback");
    expect(envelope.disclosure).toContain("OPENAI_API_KEY is not configured");
  });

  it("does not call a live provider until the canary flag is explicitly enabled", async () => {
    process.env.OPENAI_API_KEY = "test-key-that-must-not-be-used";
    process.env.ENABLE_LIVE_OPENAI = "false";

    const response = await POST(proposalRequest());
    const envelope = await response.json();

    expect(envelope.mode).toBe("prepared_fallback");
    expect(envelope.disclosure).toContain("live OpenAI is disabled");
    expect(envelope.requestId).toBeUndefined();
  });
});
