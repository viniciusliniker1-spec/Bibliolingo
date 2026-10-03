import { CONTENT_VERSION } from "../config/gamification";
import { initialState } from "../state/initialState";
import type { AppState } from "../types/progress";

export function migrateState(raw: unknown): AppState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const candidate = raw as Partial<AppState> & { schemaVersion?: number };

  if (candidate.schemaVersion === 1) {
    return {
      ...initialState,
      ...candidate,
      contentVersion: Math.max(candidate.contentVersion ?? 1, CONTENT_VERSION),
      profile: { ...initialState.profile, ...candidate.profile },
      settings: { ...initialState.settings, ...candidate.settings }
    } as AppState;
  }

  if (candidate.schemaVersion === 0) {
    return {
      ...initialState,
      ...candidate,
      schemaVersion: 1,
      contentVersion: CONTENT_VERSION,
      profile: { ...initialState.profile, ...candidate.profile },
      settings: { ...initialState.settings, ...candidate.settings },
      storageRevision: (candidate.storageRevision ?? 0) + 1
    } as AppState;
  }

  return undefined;
}
