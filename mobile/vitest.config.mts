import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["domain/**/*.mobile-test.ts", "services/**/*.test.ts"],
    environment: "node"
  }
});
