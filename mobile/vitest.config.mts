import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["domain/**/*.mobile-test.ts"],
    environment: "node"
  }
});
