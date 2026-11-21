import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { journeyBooks } from "../../src/content/catalog";
import { isLumiSkinId } from "../../src/domain/lumi";
import { BIBLE_SKINS, bibleSkinByBook, bibleSkinById } from "./bibleSkins";
import { bookActivityIds } from "./bookCompletion";
import { EMPTY_WALLET, LUMI_SKINS, equipSkin, grantBookSkins, mergeWallets, ownsSkin, purchaseSkin, skinState, spentCoins, unlockedBibleSkinIds, walletBalance, type WalletProgress } from "./lumiWallet";

const registry = readFileSync(path.resolve(__dirname, "../assets/lumiSkinAssets.ts"), "utf8");
const progressWith = (lessons: string[], checkpoints: string[], extra: Partial<WalletProgress> = {}): WalletProgress => ({ completedLessonIds: lessons, completedCheckpointIds: checkpoints, earnedAchievementIds: [], ...extra });
/** Marca como feitas todas as etapas de um livro (lições e checkpoints). */
function finish(bookId: string) {
  const book = journeyBooks.find((item) => item.id === bookId)!;
  const checkpointIds = new Set(book.units.map((unit) => unit.checkpoint.id));
  const ids = bookActivityIds(book);
  return { lessons: ids.filter((id) => !checkpointIds.has(id)), checkpoints: ids.filter((id) => checkpointIds.has(id)) };
}

describe("skins da Bíblia", () => {
  it("são 64, uma por livro da jornada (menos Lamentações e Ezequiel, ainda sem arte), com ids válidos e únicos", () => {
    expect(BIBLE_SKINS).toHaveLength(64);
    expect(new Set(BIBLE_SKINS.map((skin) => skin.skinId)).size).toBe(64);
    expect(new Set(BIBLE_SKINS.map((skin) => skin.bookId)).size).toBe(64);
    const journeyIds = journeyBooks.map((book) => book.id);
    for (const skin of BIBLE_SKINS) {
      expect(isLumiSkinId(skin.skinId), skin.skinId).toBe(true);
      expect(journeyIds, skin.bookId).toContain(skin.bookId);
      expect(skin.title, skin.bookId).toBe(journeyBooks.find((book) => book.id === skin.bookId)!.title);
    }
    expect(BIBLE_SKINS.some((skin) => skin.bookId === "lamentations" || skin.bookId === "ezekiel")).toBe(false);
    // a ordem segue a da Bíblia e o Antigo Testamento vem antes do Novo
    expect(BIBLE_SKINS.map((skin) => skin.bookId)).toEqual(journeyIds.filter((id) => BIBLE_SKINS.some((skin) => skin.bookId === id)));
    expect(BIBLE_SKINS.filter((skin) => skin.testament === "old")).toHaveLength(37);
    expect(BIBLE_SKINS.filter((skin) => skin.testament === "new")).toHaveLength(27);
  });

  it("cada skin tem imagem gerada, registrada no app e listada no manifesto", () => {
    const manifest = JSON.parse(readFileSync(path.resolve(__dirname, "../assets/generated/manifest.json"), "utf8")) as { name: string }[];
    for (const skin of BIBLE_SKINS) {
      const file = skin.skinId === "lumi_eva" ? "lumi_eva_folhas.png" : `${skin.skinId}.png`;
      expect(existsSync(path.resolve(__dirname, "../assets/generated/skins", file)), skin.skinId).toBe(true);
      expect(registry, skin.skinId).toContain(`${skin.skinId}: require("./generated/skins/${file}")`);
      expect(manifest.some((entry) => entry.name === `skins/${file}`), skin.skinId).toBe(true);
    }
  });

  it("no catálogo da loja são sem preço e só abrem com o livro concluído", () => {
    const bible = LUMI_SKINS.filter((skin) => bibleSkinById(skin.id));
    expect(bible).toHaveLength(64);
    for (const skin of bible) { expect(skin.price).toBe(0); expect(skin.free).toBe(true); expect(skin.requirementLabel).toMatch(/^Conclua /); }
    // as skins com preço (Intelectual e Hip-Hop) continuam à venda
    expect(LUMI_SKINS.find((skin) => skin.id === "lumi_oculos")?.price).toBe(100);
  });

  it("libera ao concluir todas as etapas do livro e não antes", () => {
    const joshua = finish("joshua");
    expect(unlockedBibleSkinIds(journeyBooks, progressWith([], []))).toEqual([]);
    const almost = progressWith(joshua.lessons.slice(1), joshua.checkpoints);
    expect(unlockedBibleSkinIds(journeyBooks, almost)).toEqual([]);
    const done = progressWith(joshua.lessons, joshua.checkpoints);
    expect(unlockedBibleSkinIds(journeyBooks, done)).toEqual(["lumi_joshua"]);
    const ruth = finish("ruth");
    expect(unlockedBibleSkinIds(journeyBooks, progressWith([...joshua.lessons, ...ruth.lessons], [...joshua.checkpoints, ...ruth.checkpoints]))).toEqual(["lumi_joshua", "lumi_ruth"]);
  });

  it("livros sem skin (Lamentações) não liberam nada, e as 5 primeiras mantêm a conquista antiga", () => {
    const lam = finish("lamentations");
    expect(unlockedBibleSkinIds(journeyBooks, progressWith(lam.lessons, lam.checkpoints))).toEqual([]);
    expect(unlockedBibleSkinIds(journeyBooks, progressWith([], [], { earnedAchievementIds: ["exodus-complete"] }))).toEqual(["lumi_moises"]);
    expect(bibleSkinByBook("exodus")?.skinId).toBe("lumi_moises");
  });

  it("a liberação é sem custo, aparece como posse de preço zero e pode ser equipada", () => {
    const progress = progressWith([], [], { lumiWallet: EMPTY_WALLET });
    const skin = LUMI_SKINS.find((item) => item.id === "lumi_joshua")!;
    expect(skinState(skin, progress)).toBe("locked");
    const wallet = grantBookSkins(EMPTY_WALLET, ["lumi_joshua", "lumi_oculos", "inventada"], new Date("2026-11-21T10:00:00Z"));
    // só entra skin da Bíblia; skin paga não é liberada por aqui
    expect(wallet.purchases).toEqual([{ itemId: "lumi_joshua", price: 0, at: "2026-11-21T10:00:00.000Z", source: "book" }]);
    expect(ownsSkin(wallet, "lumi_joshua")).toBe(true);
    expect(skinState(skin, progressWith([], [], { lumiWallet: wallet }))).toBe("owned");
    expect(equipSkin(wallet, "lumi_joshua")?.equippedSkinId).toBe("lumi_joshua");
    // sem custo: o saldo de moedas não muda
    expect(spentCoins(wallet)).toBe(0);
    expect(walletBalance(progressWith([], [], { lumiWallet: wallet }))).toBe(0);
  });

  it("não repete o que já foi liberado e não dá para comprar skin da Bíblia, nem com moedas de sobra", () => {
    const wallet = grantBookSkins(EMPTY_WALLET, ["lumi_joshua"]);
    expect(grantBookSkins(wallet, ["lumi_joshua"])).toBe(wallet);
    const rich = progressWith(Array.from({ length: 400 }, (_, i) => `l${i}`), []);
    const result = purchaseSkin(rich, "lumi_judges");
    expect(result).toEqual({ ok: false, reason: "locked", requirement: "Conclua Juízes" });
  });

  it("as skins liberadas acompanham a conta ao juntar dois aparelhos", () => {
    const a = grantBookSkins(EMPTY_WALLET, ["lumi_joshua"], new Date("2026-11-21T10:00:00Z"));
    const b = grantBookSkins(EMPTY_WALLET, ["lumi_judges"], new Date("2026-11-22T10:00:00Z"));
    const merged = mergeWallets(a, b);
    expect(merged.purchases.map((purchase) => purchase.itemId)).toEqual(["lumi_joshua", "lumi_judges"]);
  });
});
