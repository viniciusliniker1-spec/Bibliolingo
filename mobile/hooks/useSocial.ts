import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { rankStatus, SocialUnavailableError, socialErrorMessage, type Leaderboard, type SocialMe, type SocialScope } from "../domain/social";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { fetchLeaderboard, fetchSocialMe, joinSocial } from "../services/socialRemote";

export type SocialStatus = "loading" | "no-account" | "guest" | "unavailable" | "not-joined" | "ready" | "error";

/** Estado do social: conta, participação e ranking da semana (geral ou de amigos). */
export function useSocial(scope: SocialScope = "global", limit = 50) {
  const auth = useMobileAuth();
  const session = auth.session;
  const [status, setStatus] = useState<SocialStatus>("loading");
  const [me, setMe] = useState<SocialMe>();
  const [board, setBoard] = useState<Leaderboard>();
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const request = useRef(0);

  const load = useCallback(async (silent = false) => {
    const current = ++request.current;
    if (!auth.configured) { setStatus("no-account"); return; }
    if (!session) { setStatus("guest"); return; }
    if (silent) setRefreshing(true); else setStatus((value) => (value === "ready" ? value : "loading"));
    try {
      const profile = await fetchSocialMe(session);
      if (current !== request.current) return;
      setMe(profile);
      if (!profile || !profile.visible || profile.suspended) {
        setBoard(undefined);
        setStatus(profile?.suspended ? "error" : "not-joined");
        setMessage(profile?.suspended ? "Sua participação no ranking está suspensa." : "");
        return;
      }
      const next = await fetchLeaderboard(session, scope, limit);
      if (current !== request.current) return;
      setBoard(next);
      setStatus("ready");
      setMessage("");
    } catch (error) {
      if (current !== request.current) return;
      if (error instanceof SocialUnavailableError) { setStatus("unavailable"); return; }
      setMessage(socialErrorMessage(error));
      setStatus((value) => (value === "ready" ? value : "error"));
    } finally {
      if (current === request.current) setRefreshing(false);
    }
  }, [auth.configured, session, scope, limit]);

  useEffect(() => { void load(); }, [load]);
  useFocusEffect(useCallback(() => { void load(true); }, [load]));

  const join = useCallback(async (handle: string) => {
    if (!session) throw new Error("no-session");
    await joinSocial(session, handle, true);
    await load();
  }, [session, load]);

  const leave = useCallback(async () => {
    if (!session || !me) return;
    await joinSocial(session, me.handle, false);
    await load();
  }, [session, me, load]);

  return { status, me, board, message, refreshing, reload: () => load(true), join, leave, myStatus: board ? rankStatus(board.entries, scope) : undefined };
}
