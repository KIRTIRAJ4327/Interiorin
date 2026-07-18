import { describe, expect, it } from "vitest";
import { createPairingCredential, deterministicUuid, digestPairingToken } from "./security";

describe("session credentials", () => {
  it("creates display-safe codes and stores only a digest", () => {
    const first = createPairingCredential();
    const second = createPairingCredential();
    expect(first.code).toMatch(/^[A-Z2-9]{6}$/);
    expect(first.token).not.toBe(second.token);
    expect(digestPairingToken(first.token, "test-pepper")).not.toContain(first.token);
  });

  it("derives a stable fallback session UUID", () => {
    expect(deterministicUuid("same-device")).toBe(deterministicUuid("same-device"));
  });
});
