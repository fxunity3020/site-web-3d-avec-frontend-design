import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", trace: "off" },
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "ordi", use: { viewport: { width: 1440, height: 900 } } },
    { name: "tel", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
