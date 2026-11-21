import { COLLECTIBLES } from "./chestRewards";

/**
 * Conquista do álbum de cartas da Lumi. Só existe no app (o álbum é do app), então fica fora da lista
 * de conquistas compartilhada com a web. O id entra em `earnedAchievementIds` ao completar, e assim
 * rende as moedas de uma conquista e sincroniza como qualquer outra.
 */
export const ALBUM_ACHIEVEMENT_ID = "lumi-album-completo";
export const ALBUM_ACHIEVEMENT_TITLE = "Álbum Completo";

export function albumProgress(stickers: Readonly<Record<string, number>> | undefined) {
  const have = COLLECTIBLES.filter((card) => (stickers?.[card.id] ?? 0) > 0).length;
  return { have, total: COLLECTIBLES.length };
}

export function isAlbumComplete(stickers: Readonly<Record<string, number>> | undefined) {
  const { have, total } = albumProgress(stickers);
  return total > 0 && have >= total;
}

export const albumAchievementDescription = () => `Reúna as ${COLLECTIBLES.length} cartas da Lumi no álbum.`;

/** Acrescenta a conquista quando o álbum está completo (sem mexer em nada se não estiver ou já tiver). */
export function withAlbumAchievement<T extends { earnedAchievementIds: string[]; lumiWallet?: { stickers?: Record<string, number> } }>(progress: T): T {
  if (!isAlbumComplete(progress.lumiWallet?.stickers) || progress.earnedAchievementIds.includes(ALBUM_ACHIEVEMENT_ID)) return progress;
  return { ...progress, earnedAchievementIds: [...progress.earnedAchievementIds, ALBUM_ACHIEVEMENT_ID] };
}
