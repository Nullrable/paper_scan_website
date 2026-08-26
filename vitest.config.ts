import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest config — pure utility testing only.
 *
 * We deliberately do NOT load the Astro integration here. The tests target
 * `src/utils/*.ts` and `src/content/config.ts` — files that don't need a
 * full Astro build to evaluate.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/utils/**/*.ts"],
      // config.ts is excluded — it imports astro:content which only runs
      // inside Astro's build pipeline. Its schema is exercised by
      // tests/blog-schema.test.ts via a mirrored Zod definition.
      exclude: ["src/content/config.ts"],
      thresholds: {
        // Pure utilities — high bar.
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
      },
    },
  },
});
