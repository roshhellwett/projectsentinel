import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "app/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.test.*",
        "**/*.spec.*",
        "**/types/**",
        "**/*.d.ts",
        "node_modules",
        ".next",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
