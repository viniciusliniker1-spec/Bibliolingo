import {
  SocialError, SocialUnavailableError, toLeaderboard, toProfile, toSearchResult,
  type Leaderboard, type LeaderboardRow, type ProfileRow, type SearchRow, type SocialMe, type SocialProfile, type SocialScope, type SocialSearchResult
} from "../domain/social";
import { getMobileAuthConfig, type MobileAuthSession } from "./auth";

/** Chama uma função do servidor (PostgREST /rpc). Erros do servidor viram SocialError com o código. */
async function rpc<T>(session: MobileAuthSession, name: string, body: Record<string, unknown> = {}): Promise<T> {
  const config = getMobileAuthConfig();
  if (!config) throw new SocialUnavailableError("A conta online não está configurada.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: config.publishableKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  if (!response.ok) {
    const error = (data ?? {}) as { code?: string; message?: string };
    // A função ainda não existe no servidor: a migration do ranking não foi aplicada.
    if (error.code === "PGRST202" || error.code === "42883" || /could not find the function/i.test(error.message ?? "")) {
      throw new SocialUnavailableError("O ranking ainda não está disponível no servidor.");
    }
    throw new SocialError(error.message ?? "unknown", error.message ?? "unknown");
  }
  return data as T;
}

export async function fetchSocialMe(session: MobileAuthSession): Promise<SocialMe | undefined> {
  const rows = await rpc<SocialMe[]>(session, "social_my_profile");
  return rows[0];
}

export function joinSocial(session: MobileAuthSession, handle: string, visible = true) {
  return rpc<{ handle: string; visible: boolean }[]>(session, "social_set_profile", { p_handle: handle, p_visible: visible }).then((rows) => rows[0]);
}

export async function fetchLeaderboard(session: MobileAuthSession, scope: SocialScope, limit = 50): Promise<Leaderboard> {
  return toLeaderboard(await rpc<LeaderboardRow[]>(session, "social_leaderboard", { p_scope: scope, p_limit: limit }));
}

export async function fetchSocialProfile(session: MobileAuthSession, userId: string): Promise<SocialProfile | undefined> {
  const rows = await rpc<ProfileRow[]>(session, "social_profile", { p_user_id: userId });
  return rows[0] ? toProfile(rows[0]) : undefined;
}

export async function searchStudents(session: MobileAuthSession, query: string): Promise<SocialSearchResult[]> {
  return (await rpc<SearchRow[]>(session, "social_search", { p_query: query })).map(toSearchResult);
}

export const followStudent = (session: MobileAuthSession, userId: string) => rpc<null>(session, "social_follow", { p_user_id: userId });
export const unfollowStudent = (session: MobileAuthSession, userId: string) => rpc<null>(session, "social_unfollow", { p_user_id: userId });
export const reportStudent = (session: MobileAuthSession, userId: string, reason: string) => rpc<null>(session, "social_report", { p_user_id: userId, p_reason: reason });
