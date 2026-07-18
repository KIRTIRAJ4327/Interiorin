import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalApiKey = process.env.OPENAI_API_KEY;
const originalLiveFlag = process.env.ENABLE_LIVE_OPENAI;
const originalModel = process.env.OPENAI_MODEL;
const originalCanaryResponseId = process.env.OPENAI_CANARY_RESPONSE_ID;

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

  if (originalModel === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = originalModel;

  if (originalCanaryResponseId === undefined) delete process.env.OPENAI_CANARY_RESPONSE_ID;
  else process.env.OPENAI_CANARY_RESPONSE_ID = originalCanaryResponseId;
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
    process.env.OPENAI_API_KEY = "x";
    process.env.ENABLE_LIVE_OPENAI = "false";

    const response = await POST(proposalRequest());
    const envelope = await response.json();

    expect(envelope.mode).toBe("prepared_fallback");
    expect(envelope.disclosure).toContain("live OpenAI is disabled");
    expect(envelope.requestId).toBeUndefined();
  });

  it("rejects an arbitrary model alias before constructing a live client", async () => {
    process.env.OPENAI_API_KEY = "x";
    process.env.ENABLE_LIVE_OPENAI = "true";
    process.env.OPENAI_MODEL = "some-other-model";
    process.env.OPENAI_CANARY_RESPONSE_ID = "canary-id";

    const response = await POST(proposalRequest());
    const envelope = await response.json();

    expect(envelope.mode).toBe("prepared_fallback");
    expect(envelope.disclosure).toContain("unsupported live model");
  });

  it("stays offline when no durable canary response is recorded", async () => {
    process.env.OPENAI_API_KEY = "x";
    process.env.ENABLE_LIVE_OPENAI = "true";
    process.env.OPENAI_MODEL = "gpt-5.6-terra";
    delete process.env.OPENAI_CANARY_RESPONSE_ID;

    const response = await POST(proposalRequest());
    const envelope = await response.json();

    expect(envelope.mode).toBe("prepared_fallback");
    expect(envelope.disclosure).toContain("no durable Terra canary evidence");
  });
});
