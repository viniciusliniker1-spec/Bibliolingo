/** Utilidades da busca bíblica: normalização e trechos com o termo em destaque. */
export const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export interface Highlighted { text: string; match: boolean }

/** Divide o texto marcando as ocorrências do termo (sem acento e sem maiúsculas). */
export function highlightMatches(text: string, query: string): Highlighted[] {
  const q = normalizeSearch(query.trim());
  if (!q) return [{ text, match: false }];
  const plain = normalizeSearch(text);
  const parts: Highlighted[] = [];
  let from = 0;
  for (let at = plain.indexOf(q); at >= 0; at = plain.indexOf(q, at + q.length)) {
    if (at > from) parts.push({ text: text.slice(from, at), match: false });
    parts.push({ text: text.slice(at, at + q.length), match: true });
    from = at + q.length;
  }
  if (from < text.length) parts.push({ text: text.slice(from), match: false });
  return parts.length ? parts : [{ text, match: false }];
}

/** Trecho ao redor da 1ª ocorrência, para versículos longos. */
export function snippet(text: string, query: string, radius = 70) {
  const at = normalizeSearch(text).indexOf(normalizeSearch(query.trim()));
  if (at < 0 || text.length <= radius * 2) return text;
  const start = Math.max(0, at - radius);
  const end = Math.min(text.length, at + query.length + radius);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
}

export function isLexiconQuery(value: string) {
  return /^([gh]\s*)?\d+$/i.test(value.trim()) || /^[Ͱ-Ͽἀ-῿֐-׿]/.test(value.trim());
}

export function pushRecent(list: readonly string[], query: string, max = 6) {
  const clean = query.trim();
  if (!clean) return [...list];
  return [clean, ...list.filter((item) => normalizeSearch(item) !== normalizeSearch(clean))].slice(0, max);
}
