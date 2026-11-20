import { describe, expect, it } from "vitest";
import { COLLECTIBLES } from "./chestRewards";
import { ALBUM_ACHIEVEMENT_ID, albumProgress, isAlbumComplete, withAlbumAchievement } from "./albumAchievement";

const all = Object.fromEntries(COLLECTIBLES.map((card) => [card.id, 1]));

describe("conquista do álbum", () => {
  it("só completa com todas as cartas, ignorando as figurinhas antigas e ids desconhecidos", () => {
    expect(albumProgress(undefined)).toEqual({ have: 0, total: COLLECTIBLES.length });
    expect(isAlbumComplete(undefined)).toBe(false);
    const almost = { ...all }; delete almost[COLLECTIBLES[0].id];
    expect(isAlbumComplete(almost)).toBe(false);
    expect(isAlbumComplete({ ...almost, pomba: 3, "mestra-da-palavra": 1 })).toBe(false);
    expect(isAlbumComplete(all)).toBe(true);
    expect(albumProgress({ ...all, pomba: 1 }).have).toBe(COLLECTIBLES.length);
  });

  it("registra a conquista uma única vez, sem alterar o resto", () => {
    const base = { xp: 7, earnedAchievementIds: ["01"], lumiWallet: { stickers: all } };
    const done = withAlbumAchievement(base);
    expect(done.earnedAchievementIds).toEqual(["01", ALBUM_ACHIEVEMENT_ID]);
    expect(done.xp).toBe(7);
    expect(withAlbumAchievement(done)).toBe(done);
    const incomplete = { earnedAchievementIds: ["01"], lumiWallet: { stickers: { joinha: 2 } } };
    expect(withAlbumAchievement(incomplete)).toBe(incomplete);
  });
});
