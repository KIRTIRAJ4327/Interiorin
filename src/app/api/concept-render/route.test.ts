import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

function renderRequest(file: File = new File(["image"], "room.jpg", { type: "image/jpeg" })) {
  const body = new FormData();
  body.set("source", file);
  body.set("brief", JSON.stringify({ option: "Clear Passage", objects: ["sofa", "table"] }));
  return new Request("http://localhost/api/concept-render", { method: "POST", body });
}

afterEach(() => {
  if (originalKey === undefined) delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  else process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
});

describe("in-space concept provider boundary", () => {
  it("preserves the canonical path when no image provider key exists", async () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const response = await POST(renderRequest());
    const envelope = await response.json();

    expect(response.status).toBe(200);
    expect(envelope.status).toBe("provider_unavailable");
    expect(envelope.disclosure).toContain("canonical 3D option remains usable");
    expect(envelope.imageDataUrl).toBeUndefined();
  });

  it("rejects a PDF because presentation editing requires a source image", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "not-used";
    const response = await POST(renderRequest(new File(["pdf"], "plan.pdf", { type: "application/pdf" })));
    const envelope = await response.json();

    expect(response.status).toBe(400);
    expect(envelope.status).toBe("invalid_source");
  });
});

