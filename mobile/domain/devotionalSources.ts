import { parseDevotional, type Devotional } from "./devotional";

const RAW = "https://raw.githubusercontent.com/viniciusliniker1-spec/Bibliolingo";

/**
 * De onde baixar o devocional do dia, em ordem. O GitHub (arquivo bruto) atualiza a cada commit do
 * gerador, sem depender de um novo deploy do site; a Vercel fica como reserva.
 */
export const DEFAULT_DEVOTIONAL_SOURCES = [
  `${RAW}/main/mobile/public/devotionals`,
  `${RAW}/feature/bible-study-workspace-v1/mobile/public/devotionals`,
  "https://bibliolingo-mobile.vercel.app/devotionals"
];

/** Fontes finais: EXPO_PUBLIC_DEVOTIONAL_BASE_URL (lista separada por vírgula) vem primeiro, depois as padrão. */
export function devotionalSources(custom?: string, sameOrigin?: string): string[] {
  const own = (custom ?? "").split(",").map((item) => item.trim().replace(/\/$/, "")).filter(Boolean);
  return [...new Set([...own, ...DEFAULT_DEVOTIONAL_SOURCES, ...(sameOrigin ? [sameOrigin] : [])])];
}

type FetchLike = (url: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

/**
 * Tenta cada fonte até achar um devocional válido da data pedida. Resposta que não é JSON
 * (ex.: a página inicial devolvida por um site em modo SPA), 404, erro de rede e data trocada
 * passam para a próxima fonte.
 */
export async function fetchDevotionalFromSources(date: string, sources: string[], fetchFn: FetchLike, timeoutMs = 6000): Promise<Devotional | undefined> {
  for (const base of sources) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchFn(`${base}/${date}.json`, { signal: controller.signal, headers: { accept: "application/json" } });
      if (!response.ok) continue;
      const parsed = parseDevotional(await response.json());
      if (parsed && parsed.date === date) return parsed;
    } catch {
      // próxima fonte
    } finally {
      clearTimeout(timer);
    }
  }
  return undefined;
}
