import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // Tests run against a local PostgreSQL database; use the client generated
      // from prisma/schema.test.prisma instead of the MySQL production client.
      "@prisma/client": path.resolve(__dirname, "node_modules/.prisma/test-client"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    pool: "forks",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**", "app/api/**", "hooks/**", "components/**"],
      exclude: ["node_modules", "tests", "prisma"],
    },
  },
})
