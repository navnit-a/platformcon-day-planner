import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/layout",
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:4173",
  },
  webServer: {
    command: "npm run build && npx vite preview --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
