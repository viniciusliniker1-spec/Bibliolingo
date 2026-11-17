import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { journeyBooks } from "../../src/content/catalog";

const mobileRoot = path.resolve(__dirname, "..");
const source = readFileSync(path.join(mobileRoot, "assets/sceneAssets.ts"), "utf8");
const mapped = new Map(
  [...source.matchAll(/^\s+"?([a-z0-9-]+)"?: require\("\.\/routes\/([^"]+\.webp)"\)/gm)].map((m) => [m[1], m[2]])
);

describe("fundos de trilha por livro", () => {
  it("todo livro da jornada tem fundo próprio", () => {
    const missing = journeyBooks.map((book) => book.id).filter((id) => !mapped.has(id));
    expect(missing).toEqual([]);
  });

  it("não há fundo para livro que não existe", () => {
    const ids = new Set(journeyBooks.map((book) => book.id));
    expect([...mapped.keys()].filter((id) => !ids.has(id))).toEqual([]);
  });

  it("cada arquivo existe, é único e tem tamanho controlado", () => {
    const files = [...mapped.values()];
    expect(new Set(files).size).toBe(files.length);
    for (const file of files) {
      const full = path.join(mobileRoot, "assets/routes", file);
      expect(existsSync(full), file).toBe(true);
      expect(readFileSync(full).byteLength, file).toBeLessThan(400 * 1024);
    }
  });
});
