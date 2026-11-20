import { describe, expect, it } from "vitest";
import seed from "../content/devotionals/seed.json";
import { DEFAULT_DEVOTIONAL_SOURCES, devotionalSources, fetchDevotionalFromSources } from "./devotionalSources";

const ok = (body: unknown) => ({ ok: true, json: async () => body });
const html = { ok: true, json: async () => { throw new SyntaxError("Unexpected token <"); } };

describe("fontes do devocional", () => {
  it("usa o GitHub primeiro e deixa a Vercel como reserva", () => {
    expect(DEFAULT_DEVOTIONAL_SOURCES[0]).toContain("raw.githubusercontent.com");
    expect(DEFAULT_DEVOTIONAL_SOURCES.at(-1)).toContain("vercel.app");
  });

  it("coloca fontes próprias na frente, sem repetir, e a mesma origem por último", () => {
    const list = devotionalSources("https://exemplo.com/d/, " + DEFAULT_DEVOTIONAL_SOURCES[0], "/devotionals");
    expect(list[0]).toBe("https://exemplo.com/d");
    expect(list.filter((item) => item === DEFAULT_DEVOTIONAL_SOURCES[0])).toHaveLength(1);
    expect(list.at(-1)).toBe("/devotionals");
  });

  it("pula fonte que devolve HTML, 404 ou erro de rede e usa a próxima", async () => {
    const calls: string[] = [];
    const fetchFn = async (url: string) => {
      calls.push(url);
      if (url.startsWith("https://a")) return html;
      if (url.startsWith("https://b")) return { ok: false, json: async () => ({}) };
      if (url.startsWith("https://c")) throw new Error("rede");
      return ok(seed);
    };
    const found = await fetchDevotionalFromSources("2026-11-19", ["https://a", "https://b", "https://c", "https://d"], fetchFn);
    expect(found?.title).toBe("A graça que chega antes de você");
    expect(calls).toHaveLength(4);
    expect(calls[3]).toBe("https://d/2026-11-19.json");
  });

  it("recusa arquivo de outra data e devolve undefined quando nenhuma fonte serve", async () => {
    expect(await fetchDevotionalFromSources("2026-11-20", ["https://a"], async () => ok(seed))).toBeUndefined();
    expect(await fetchDevotionalFromSources("2026-11-19", [], async () => ok(seed))).toBeUndefined();
  });
});
