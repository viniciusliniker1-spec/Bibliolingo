import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SyncEvent } from "../../src/sync/types";

const METADATA_KEY = "@bibliolingo/sync-metadata/v1";
const DEVICE_KEY = "@bibliolingo/device-id/v1";

export interface MobileSyncMetadata {
  pendingEvents: SyncEvent[];
  lastServerSequence: number;
  lastSyncedAt?: string;
}

const initial: MobileSyncMetadata = { pendingEvents: [], lastServerSequence: 0 };

export async function loadMobileSyncMetadata(): Promise<MobileSyncMetadata> {
  try {
    const raw = await AsyncStorage.getItem(METADATA_KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

export async function saveMobileSyncMetadata(value: MobileSyncMetadata) {
  await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(value));
}

export async function getMobileDeviceId() {
  const existing = await AsyncStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const next = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(DEVICE_KEY, next);
  return next;
}
