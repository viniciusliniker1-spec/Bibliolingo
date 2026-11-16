import type { ImageSourcePropType } from "react-native";

export const mobileSceneAssets = {
  welcome: require("./generated/01_boas_vindas_noturnas.png") as ImageSourcePropType,
  tracks: require("./generated/02_jardim_do_aprendizado.png") as ImageSourcePropType,
  journey: require("./generated/03_caminho_da_jornada.png") as ImageSourcePropType,
  study: require("./generated/04_biblioteca_do_conhecimento.png") as ImageSourcePropType,
  goals: require("./generated/05_horizonte_dos_propositos.png") as ImageSourcePropType,
  consistency: require("./generated/06_santuario_da_constancia.png") as ImageSourcePropType,
  route: require("./generated/07_portal_da_jornada.png") as ImageSourcePropType
} as const;

/** Fundo da trilha de cada livro do Pentateuco (os demais livros usam o fundo padrão). */
export const routeBackgrounds: Partial<Record<string, ImageSourcePropType>> = {
  genesis: require("./routes/genesis.webp") as ImageSourcePropType,
  exodus: require("./routes/exodus.webp") as ImageSourcePropType,
  leviticus: require("./routes/leviticus.webp") as ImageSourcePropType,
  numbers: require("./routes/numbers.webp") as ImageSourcePropType,
  deuteronomy: require("./routes/deuteronomy.webp") as ImageSourcePropType,
  joshua: require("./routes/joshua.webp") as ImageSourcePropType,
  judges: require("./routes/judges.webp") as ImageSourcePropType,
  ruth: require("./routes/ruth.webp") as ImageSourcePropType,
  "1-samuel": require("./routes/1-samuel.webp") as ImageSourcePropType,
  "2-samuel": require("./routes/2-samuel.webp") as ImageSourcePropType,
  "1-kings": require("./routes/1-kings.webp") as ImageSourcePropType,
  "2-kings": require("./routes/2-kings.webp") as ImageSourcePropType,
  "1-chronicles": require("./routes/1-chronicles.webp") as ImageSourcePropType,
  "2-chronicles": require("./routes/2-chronicles.webp") as ImageSourcePropType,
  ezra: require("./routes/ezra.webp") as ImageSourcePropType,
  nehemiah: require("./routes/nehemiah.webp") as ImageSourcePropType,
  esther: require("./routes/esther.webp") as ImageSourcePropType,
  job: require("./routes/job.webp") as ImageSourcePropType,
  psalms: require("./routes/psalms.webp") as ImageSourcePropType,
  proverbs: require("./routes/proverbs.webp") as ImageSourcePropType,
  ecclesiastes: require("./routes/ecclesiastes.webp") as ImageSourcePropType,
  "song-of-songs": require("./routes/song-of-songs.webp") as ImageSourcePropType,
  isaiah: require("./routes/isaiah.webp") as ImageSourcePropType
};
