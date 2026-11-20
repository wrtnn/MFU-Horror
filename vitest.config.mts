import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "next/image": path.resolve(root, "test/mocks/next-image.tsx"),
      "next/link": path.resolve(root, "test/mocks/next-link.tsx"),
      "next/navigation": path.resolve(root, "test/mocks/next-navigation.ts"),
      "@": root,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "config/**/*.ts",
        "hooks/**/*.ts",
        "systems/**/*.ts",
      ],
      exclude: ["**/*.test.{ts,tsx}", "app/layout.tsx", "app/globals.css"],
    },
  },
});
