/**
 * Motor de sons do app: um único conjunto de players, criado uma vez e reaproveitado por todas as telas.
 *
 * Antes cada tela criava 12 players próprios. Com várias telas abertas ao mesmo tempo (abas + lição +
 * resultado…) o Android esgotava os players nativos e, com o tempo, o app ficava mudo. Aqui:
 *  - existe no máximo um player por som, para o app inteiro;
 *  - se tocar falhar, o player é recriado e a tentativa é repetida;
 *  - depois de um tempo em segundo plano os players são recriados (o sistema pode tê-los liberado);
 *  - o modo de áudio é configurado uma vez, para o som não tomar o foco de outros apps.
 *
 * A fábrica de players entra por parâmetro, o que deixa a lógica testável sem o módulo nativo.
 */
export type FeedbackSound =
  | "correct" | "wrong" | "complete" | "checkpoint" | "start" | "noah" | "select" | "achievement"
  | "combo1" | "combo2" | "combo3" | "match" | "chest";

export interface SoundPlayer {
  seekTo(seconds: number): Promise<void>;
  play(): void;
  remove(): void;
}

export interface SoundEngineDeps {
  sources: Record<FeedbackSound, number>;
  create: (source: number) => SoundPlayer;
  configure?: () => Promise<void>;
  now?: () => number;
}

/** Tempo em segundo plano a partir do qual os players são recriados. */
export const REFRESH_AFTER_BACKGROUND_MS = 20_000;

export function createSoundEngine({ sources, create, configure, now = Date.now }: SoundEngineDeps) {
  const players = new Map<FeedbackSound, SoundPlayer>();
  let configured: Promise<void> | undefined;
  let backgroundedAt: number | undefined;

  const ensureConfigured = () => {
    if (!configure) return Promise.resolve();
    configured ??= configure().catch(() => { configured = undefined; });
    return configured;
  };

  const drop = (kind: FeedbackSound) => {
    const player = players.get(kind);
    players.delete(kind);
    try { player?.remove(); } catch { /* já liberado */ }
  };

  const get = (kind: FeedbackSound) => {
    let player = players.get(kind);
    if (!player) {
      player = create(sources[kind]);
      players.set(kind, player);
    }
    return player;
  };

  const attempt = async (kind: FeedbackSound) => {
    const player = get(kind);
    await player.seekTo(0);
    player.play();
  };

  return {
    /** Toca um som; se falhar, recria o player e tenta mais uma vez. */
    async play(kind: FeedbackSound) {
      try {
        await ensureConfigured();
        await attempt(kind);
        return true;
      } catch {
        drop(kind);
        try { await attempt(kind); return true; } catch { drop(kind); return false; }
      }
    },
    /** Cria os players aos poucos (depois da abertura) para o primeiro som não atrasar. */
    preload(kinds: readonly FeedbackSound[] = Object.keys(sources) as FeedbackSound[]) {
      void ensureConfigured();
      for (const kind of kinds) { try { get(kind); } catch { /* tenta de novo ao tocar */ } }
    },
    /** Descarta todos os players; serão recriados quando precisar. */
    reset() {
      for (const kind of [...players.keys()]) drop(kind);
    },
    onBackground() { backgroundedAt = now(); },
    onForeground() {
      const since = backgroundedAt;
      backgroundedAt = undefined;
      if (since !== undefined && now() - since >= REFRESH_AFTER_BACKGROUND_MS) this.reset();
    },
    /** Quantos players existem agora (para testes). */
    size: () => players.size
  };
}
