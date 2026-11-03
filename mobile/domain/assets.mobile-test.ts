/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const mobileRoot = path.resolve(__dirname, "..");
const generatedDir = path.join(mobileRoot, "assets/generated");
const sourceDirs = ["app", "assets", "components", "domain", "hooks", "providers", "services", "theme"];
// Limite por imagem empacotada; os masters em design-assets chegam a 3 MB.
const MAX_IMAGE_BYTES = 256 * 1024;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "generated" ? [] : sourceFiles(full);
    return /\.(ts|tsx|js)$/.test(entry.name) && !entry.name.includes(".mobile-test.") ? [full] : [];
  });
}

const files = sourceDirs.flatMap((dir) => {
  try {
    return sourceFiles(path.join(mobileRoot, dir));
  } catch {
    return [];
  }
});

describe("assets empacotados no app", () => {
  it("nunca referenciam os masters de design-assets", () => {
    const offenders = files.filter((file) => readFileSync(file, "utf8").includes("design-assets/"));
    expect(offenders.map((file) => path.relative(mobileRoot, file))).toEqual([]);
  });

  it("apontam para derivados existentes e leves", () => {
    const required = files.flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(/require\("([^"]+\.png)"\)/g)].map((match) =>
        path.resolve(path.dirname(file), match[1])
      )
    );
    expect(required.length).toBeGreaterThan(0);
    const problems = required.flatMap((image) => {
      const relative = path.relative(mobileRoot, image);
      if (!image.startsWith(generatedDir + path.sep)) return [relative + ": fora de assets/generated"];
      try {
        const bytes = statSync(image).size;
        return bytes > MAX_IMAGE_BYTES ? [`${relative}: ${bytes} bytes`] : [];
      } catch {
        return [relative + ": ausente (rode npm run assets:generate)"];
      }
    });
    expect(problems).toEqual([]);
  });

  it("empacota animações da Lumi apenas da pasta própria e com tamanho controlado", () => {
    const animationsDir = path.join(mobileRoot, "assets/lumi-animations");
    const required = files.flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(/require\("([^"]+\.webp)"\)/g)].map((match) =>
        path.resolve(path.dirname(file), match[1])
      )
    );
    expect(required.length).toBeGreaterThanOrEqual(6);
    const problems = required.flatMap((animation) => {
      const relative = path.relative(mobileRoot, animation);
      if (!animation.startsWith(animationsDir + path.sep)) return [relative + ": fora de assets/lumi-animations"];
      try {
        const bytes = statSync(animation).size;
        return bytes > 900 * 1024 ? [`${relative}: ${bytes} bytes`] : [];
      } catch {
        return [relative + ": ausente (rode mobile/scripts/lumi-animations/build.py)"];
      }
    });
    expect(problems).toEqual([]);
  });
});
