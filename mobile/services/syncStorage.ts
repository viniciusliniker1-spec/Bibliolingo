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
    ?? "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
      const random = Math.floor(Math.random() * 16);
      return (token === "x" ? random : (random & 0x3) | 0x8).toString(16);
    });
  await AsyncStorage.setItem(DEVICE_KEY, next);
  return next;
}
