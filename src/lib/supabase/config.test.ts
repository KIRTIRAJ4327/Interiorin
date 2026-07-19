import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabasePublicConfig, getSupabaseSecretConfig } from "./config";

describe("verified Supabase configuration gate", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("keeps the honest same-device fallback when live pairing is not enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_LIVE_SUPABASE", "false");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("exposes live configuration only when every required value is present", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_LIVE_SUPABASE", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
    vi.stubEnv("SUPABASE_SECRET_KEY", "server-test-key");
    vi.stubEnv("SESSION_TOKEN_PEPPER", "test-pepper");
    expect(getSupabasePublicConfig()).toEqual({ url: "https://example.supabase.co", publishableKey: "public-test-key" });
    expect(getSupabaseSecretConfig()).toMatchObject({ secretKey: "server-test-key", tokenPepper: "test-pepper" });
  });
});
