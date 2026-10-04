import { CONTENT_VERSION } from "../config/gamification";
import { initialState } from "../state/initialState";
import type { AppState, BibleAnnotation, BibleLocation } from "../types/progress";

type StateCandidate = Partial<Omit<AppState, "schemaVersion">> & {
  schemaVersion?: number;
  bibleAnnotations?: unknown;
  bibleLocation?: unknown;
};

function validAnnotations(value: unknown): Record<string, BibleAnnotation> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, BibleAnnotation>;
}

function validLocation(value: unknown): BibleLocation | undefined {
  if (!value || typeof value !== "object") return undefined;
  const location = value as Partial<BibleLocation>;
  if (
    typeof location.translationId !== "string" ||
    typeof location.bookOsis !== "string" ||
    typeof location.chapter !== "number"
  ) {
    return undefined;
  }
  return location as BibleLocation;
}

export function migrateState(raw: unknown): AppState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const candidate = raw as StateCandidate;
  if (![0, 1, 2, 3].includes(candidate.schemaVersion ?? -1)) return undefined;

  const migrated = candidate.schemaVersion !== 3;
  return {
    ...initialState,
    ...candidate,
    schemaVersion: 3,
    contentVersion: Math.max(candidate.contentVersion ?? 1, CONTENT_VERSION),
    profile: { ...initialState.profile, ...candidate.profile },
    settings: { ...initialState.settings, ...candidate.settings },
    bibleAnnotations: validAnnotations(candidate.bibleAnnotations),
    bibleLocation: validLocation(candidate.bibleLocation),
    storageRevision: (candidate.storageRevision ?? 0) + (migrated ? 1 : 0)
  } as AppState;
}
