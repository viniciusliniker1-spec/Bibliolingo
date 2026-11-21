import { describe, expect, it } from "vitest";
import { createSoundEngine, REFRESH_AFTER_BACKGROUND_MS, type FeedbackSound, type SoundPlayer } from "./soundEngine";

const KINDS: FeedbackSound[] = ["correct", "wrong", "complete", "checkpoint", "start", "noah", "select", "achievement", "combo1", "combo2", "combo3", "match", "chest"];
const sources = Object.fromEntries(KINDS.map((kind, index) => [kind, index])) as Record<FeedbackSound, number>;

function setup(options: { failFirstPlays?: number } = {}) {
  let created = 0;
  let removed = 0;
  let plays = 0;
  let failures = options.failFirstPlays ?? 0;
  let clock = 0;
  const engine = createSoundEngine({
    sources,
    create: () => {
      created += 1;
      const player: SoundPlayer = {
        seekTo: async () => { if (failures > 0) { failures -= 1; throw new Error("player liberado"); } },
        play: () => { plays += 1; },
        remove: () => { removed += 1; }
      };
      return player;
    },
    now: () => clock
  });
  return { engine, stats: () => ({ created, removed, plays }), advance: (ms: number) => { clock += ms; } };
}

describe("motor de sons", () => {
  it("reaproveita o mesmo player: tocar muitas vezes não cria players novos", async () => {
    const { engine, stats } = setup();
    for (let i = 0; i < 200; i += 1) await engine.play("select");
    expect(stats().created).toBe(1);
    expect(stats().plays).toBe(200);
    expect(engine.size()).toBe(1);
  });

  it("no máximo um player por som, não importa quantas telas usem", async () => {
    const { engine, stats } = setup();
    for (let screen = 0; screen < 13; screen += 1) for (const kind of KINDS) await engine.play(kind);
    expect(stats().created).toBe(KINDS.length);
  });

  it("se o player falhar, recria e toca na segunda tentativa", async () => {
    const { engine, stats } = setup({ failFirstPlays: 1 });
    expect(await engine.play("correct")).toBe(true);
    expect(stats().created).toBe(2);
    expect(stats().removed).toBe(1);
    expect(stats().plays).toBe(1);
  });

  it("se falhar duas vezes devolve false e se recupera na próxima vez", async () => {
    const { engine, stats } = setup({ failFirstPlays: 2 });
    expect(await engine.play("wrong")).toBe(false);
    expect(engine.size()).toBe(0);
    expect(await engine.play("wrong")).toBe(true);
    expect(stats().plays).toBe(1);
  });

  it("depois de muito tempo em segundo plano recria os players; um intervalo curto não", async () => {
    const { engine, stats, advance } = setup();
    await engine.play("start");
    engine.onBackground(); advance(5_000); engine.onForeground();
    expect(engine.size()).toBe(1);
    engine.onBackground(); advance(REFRESH_AFTER_BACKGROUND_MS); engine.onForeground();
    expect(engine.size()).toBe(0);
    await engine.play("start");
    expect(stats().created).toBe(2);
    expect(stats().removed).toBe(1);
  });

  it("preload cria só o que foi pedido", () => {
    const { engine, stats } = setup();
    engine.preload(["select", "correct"]);
    expect(stats().created).toBe(2);
    engine.reset();
    expect(engine.size()).toBe(0);
  });
});
