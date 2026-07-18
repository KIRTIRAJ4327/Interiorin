import { beforeEach, describe, expect, it, vi } from "vitest";
import { BroadcastChannelSessionTransport } from "./transport";

describe("same-device session transport", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("BroadcastChannel", undefined);
  });

  it("persists the controller join for refresh recovery", async () => {
    const sessionId = crypto.randomUUID();
    const controller = new BroadcastChannelSessionTransport(sessionId, "controller");
    await controller.connect();
    const snapshot = await controller.recover();
    expect(snapshot.status).toBe("active");
    expect(snapshot.members.map((member) => member.role)).toContain("controller");
    expect(snapshot.events.at(-1)?.eventType).toBe("controller_joined");
  });
});
