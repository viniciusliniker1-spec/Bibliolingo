import type { LumiMoodId } from "../domain/lumiMood";

/** Poses da Lumi por humor (derivados gerados por scripts/generate-assets.mjs). */
export const lumiMoodAssets: Record<LumiMoodId, number> = {
  brava: require("./generated/moods/lumi_mood_brava.png"),
  chorando: require("./generated/moods/lumi_mood_chorando.png"),
  pedindo: require("./generated/moods/lumi_mood_pedindo.png"),
  chuva: require("./generated/moods/lumi_mood_chuva.png"),
  sono: require("./generated/moods/lumi_mood_sono.png"),
  confusa: require("./generated/moods/lumi_mood_confusa.png"),
  surpresa: require("./generated/moods/lumi_mood_surpresa.png"),
  ideia: require("./generated/moods/lumi_mood_ideia.png"),
  lupa: require("./generated/moods/lumi_mood_lupa.png"),
  escrevendo: require("./generated/moods/lumi_mood_escrevendo.png"),
  notebook: require("./generated/moods/lumi_mood_notebook.png"),
  checklist: require("./generated/moods/lumi_mood_checklist.png"),
  progresso: require("./generated/moods/lumi_mood_progresso.png"),
  calendario: require("./generated/moods/lumi_mood_calendario.png"),
  trofeu: require("./generated/moods/lumi_mood_trofeu.png"),
  coroa: require("./generated/moods/lumi_mood_coroa.png"),
  amor: require("./generated/moods/lumi_mood_amor.png"),
  pulo: require("./generated/moods/lumi_mood_pulo.png")
};
