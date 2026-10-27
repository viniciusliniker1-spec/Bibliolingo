import type { BibleAnnotation, BibleLocation, UserProfile, UserSettings } from "../../src/types/progress";
import { getMobileAuthConfig, type MobileAuthSession } from "./auth";

export interface MobileAccountState {
  profile: Partial<UserProfile>;
  settings: Partial<UserSettings>;
  bibleAnnotations: Record<string, BibleAnnotation>;
  bibleLocation?: BibleLocation;
  learnedGreekLexemeIds: string[];
  updatedAt?: string;
}

function headers(session: MobileAuthSession) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online não está configurada.");
  return {
    config,
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    }
  };
}

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => undefined) as T | { message?: string } | undefined;
  if (!response.ok) throw new Error((data as { message?: string } | undefined)?.message ?? "Não foi possível sincronizar os dados da conta.");
  return data as T;
}

export async function fetchMobileAccountState(session: MobileAuthSession): Promise<MobileAccountState | undefined> {
  const { config, headers: authHeaders } = headers(session);
  const userId = encodeURIComponent(session.user.id);
  const rows = await parse<Array<{
    learning_profile?: Partial<UserProfile>;
    app_settings?: Partial<UserSettings>;
    bible_annotations?: Record<string, BibleAnnotation>;
    bible_location?: BibleLocation;
    learned_greek_lexeme_ids?: string[];
    updated_at?: string;
  }>>(await fetch(
    `${config.url}/rest/v1/user_account_state?user_id=eq.${userId}&select=learning_profile,app_settings,bible_annotations,bible_location,learned_greek_lexeme_ids,updated_at&limit=1`,
    { headers: authHeaders }
  ));
  const row = rows[0];
  if (!row) return undefined;
  return {
    profile: row.learning_profile ?? {},
    settings: row.app_settings ?? {},
    bibleAnnotations: row.bible_annotations ?? {},
    bibleLocation: row.bible_location,
    learnedGreekLexemeIds: row.learned_greek_lexeme_ids ?? [],
    updatedAt: row.updated_at
  };
}

export async function saveMobileAccountState(session: MobileAuthSession, state: MobileAccountState) {
  const { config, headers: authHeaders } = headers(session);
  await parse(await fetch(`${config.url}/rest/v1/rpc/save_mobile_account_state`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      p_learning_profile: state.profile,
      p_app_settings: state.settings,
      p_bible_annotations: state.bibleAnnotations,
      p_bible_location: state.bibleLocation ?? null,
      p_learned_greek_lexeme_ids: state.learnedGreekLexemeIds
    })
  }));
}
