import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3211",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm run build && npx next start -p 3211",
    env: {
      ...process.env,
      // Keep the release journey deterministic even when a developer's local
      // provider flags are enabled in .env. Live-provider canaries run
      // separately and never make the core browser suite depend on quota.
      NEXT_PUBLIC_ENABLE_CONCEPT_RENDER: "false",
      NEXT_PUBLIC_ENABLE_LIVE_SUPABASE: "false",
    },
    url: "http://localhost:3211",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
