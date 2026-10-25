/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  return {
    base: loadEnv(mode, ".", "VITE_").VITE_BASE ?? "/",
    plugins: [react()],
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["./src/test-setup.ts"],
      coverage: {
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/main.tsx", "src/test-setup.ts", "src/**/*.test.tsx"],
        thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
  };
});
