import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BibleAnnotation, BibleLocation, UserProfile, UserSettings } from "../../src/types/progress";
import type { MobileProgress } from "../types/progress";
import { getMobileAuthConfig, type MobileAuthSession } from "./auth";

export interface MobileAccountState {
  profile: Partial<UserProfile>;
  settings: Partial<UserSettings>;
  bibleAnnotations: Record<string, BibleAnnotation>;
  bibleLocation?: BibleLocation;
  learnedGreekLexemeIds: string[];
  progressSnapshot?: MobileProgress;
  progressUpdatedAt?: string;
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
    progress_snapshot?: MobileProgress;
    progress_updated_at?: string;
    updated_at?: string;
  }>>(await fetch(
    `${config.url}/rest/v1/user_account_state?user_id=eq.${userId}&select=learning_profile,app_settings,bible_annotations,bible_location,learned_greek_lexeme_ids,progress_snapshot,progress_updated_at,updated_at&limit=1`,
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
    progressSnapshot: row.progress_snapshot?.schemaVersion === 1 ? row.progress_snapshot : undefined,
    progressUpdatedAt: row.progress_updated_at,
    updatedAt: row.updated_at
  };
}

export async function saveMobileProgressSnapshot(
  session: MobileAuthSession,
  snapshot: MobileProgress,
  clientUpdatedAt: string
) {
  const { config, headers: authHeaders } = headers(session);
  await parse(await fetch(`${config.url}/rest/v1/rpc/save_mobile_progress_snapshot`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      p_snapshot: snapshot,
      p_client_updated_at: clientUpdatedAt
    })
  }));
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


const PENDING_ACCOUNT_STATE_KEY = "bibliolingo.account-state.pending.v1";

function pendingKey(userId: string) {
  return `${PENDING_ACCOUNT_STATE_KEY}:${userId}`;
}

export async function queueMobileAccountState(userId: string, state: MobileAccountState) {
  await AsyncStorage.setItem(pendingKey(userId), JSON.stringify(state));
}

export async function loadPendingMobileAccountState(userId: string) {
  const raw = await AsyncStorage.getItem(pendingKey(userId));
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as MobileAccountState;
  } catch {
    await AsyncStorage.removeItem(pendingKey(userId));
    return undefined;
  }
}

export async function flushPendingMobileAccountState(session: MobileAuthSession) {
  const pending = await loadPendingMobileAccountState(session.user.id);
  if (!pending) return false;
  await saveMobileAccountState(session, pending);
  if (pending.progressSnapshot && pending.progressUpdatedAt) {
    await saveMobileProgressSnapshot(session, pending.progressSnapshot, pending.progressUpdatedAt);
  }
  await AsyncStorage.removeItem(pendingKey(session.user.id));
  return true;
}
