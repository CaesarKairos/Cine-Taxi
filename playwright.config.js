import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 600000,
  use: {
    baseURL: process.env.STUDIO_URL || "http://127.0.0.1:5173",
    viewport: { width: 1440, height: 1100 },
    launchOptions: { args: ["--disable-gpu", "--enable-unsafe-swiftshader"] },
  },
  workers: 1,
  reporter: "list",
});
