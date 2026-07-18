import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

function analysisRequest(file: File = new File(["image"], "room.jpg", { type: "image/jpeg" })) {
  const body = new FormData();
  body.set("source", file);
  body.set("kind", "interior");
  body.set("condition", "existing");
  body.set("intent", "Create a flexible living and gathering space.");
  return new Request("http://localhost/api/space-analysis", { method: "POST", body });
}

afterEach(() => {
  if (originalKey === undefined) delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  else process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
});

describe("visual source analysis provider boundary", () => {
  it("returns a disclosed non-authorizing fallback when the provider key is absent", async () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const response = await POST(analysisRequest());
    const envelope = await response.json();

    expect(response.status).toBe(200);
    expect(envelope.status).toBe("provider_unavailable");
    expect(envelope.disclosure).toContain("no Google Generative AI key");
    expect(envelope.analysis).toBeUndefined();
  });

  it("rejects unsupported source media before any provider call", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "not-used";
    const response = await POST(analysisRequest(new File(["text"], "notes.txt", { type: "text/plain" })));
    const envelope = await response.json();

    expect(response.status).toBe(413);
    expect(envelope.status).toBe("invalid_source");
  });
});

