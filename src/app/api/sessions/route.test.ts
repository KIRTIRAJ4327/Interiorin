import { afterEach, describe, expect, it } from "vitest";
import { sessionCreateEnvelopeSchema, sessionJoinEnvelopeSchema } from "@/lib/session/schema";
import { POST as createSession } from "./route";
import { POST as joinSession } from "./[sessionId]/join/route";

const saved = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  secret: process.env.SUPABASE_SECRET_KEY,
  pepper: process.env.SESSION_TOKEN_PEPPER,
};

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = saved.url;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = saved.key;
  process.env.SUPABASE_SECRET_KEY = saved.secret;
  process.env.SESSION_TOKEN_PEPPER = saved.pepper;
});

describe("paired session fallback", () => {
  it("creates a disclosed same-device pairing envelope when Supabase is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SESSION_TOKEN_PEPPER;
    const response = await createSession(new Request("http://localhost:3000/api/sessions", { method: "POST" }));
    const body = sessionCreateEnvelopeSchema.parse(await response.json());
    expect(response.status).toBe(200);
    expect(body.mode).toBe("same_device");
    expect(body.disclosure).toContain("Same-device demo mode");
    expect(body.joinUrl).toContain(`/control/${body.sessionId}`);
  });

  it("joins locally without pretending the devices are cloud-paired", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SESSION_TOKEN_PEPPER;
    const sessionId = crypto.randomUUID();
    const response = await joinSession(
      new Request(`http://localhost:3000/api/sessions/${sessionId}/join`, { method: "POST", body: JSON.stringify({ token: "x".repeat(32) }) }),
      { params: Promise.resolve({ sessionId }) },
    );
    const body = sessionJoinEnvelopeSchema.parse(await response.json());
    expect(body.mode).toBe("same_device");
    expect(body.disclosure).toContain("browser origin");
  });
});
