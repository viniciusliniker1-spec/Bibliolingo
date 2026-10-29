import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SyncEvent } from "../../src/sync/types";
import { scopedStorageKey, storageClaimKey } from "./accountScope";

const METADATA_KEY = "@bibliolingo/sync-metadata/v1";
const DEVICE_KEY = "@bibliolingo/device-id/v1";

export interface MobileSyncMetadata {
  pendingEvents: SyncEvent[];
  lastServerSequence: number;
  lastSyncedAt?: string;
}

const initial: MobileSyncMetadata = { pendingEvents: [], lastServerSequence: 0 };

async function readOwnedMetadata(userId?: string) {
  const key = scopedStorageKey(METADATA_KEY, userId);
  const owned = await AsyncStorage.getItem(key);
  if (owned || !userId) return owned;
  const claimedBy = await AsyncStorage.getItem(storageClaimKey(METADATA_KEY));
  if (claimedBy && claimedBy !== userId) return null;
  const legacy = await AsyncStorage.getItem(METADATA_KEY);
  if (!legacy) return null;
  await AsyncStorage.setItem(key, legacy);
  await AsyncStorage.setItem(storageClaimKey(METADATA_KEY), userId);
  return legacy;
}

export async function loadMobileSyncMetadata(userId?: string): Promise<MobileSyncMetadata> {
  try {
    const raw = await readOwnedMetadata(userId);
    return raw ? { ...initial, ...JSON.parse(raw) } : { ...initial };
  } catch {
    return { ...initial };
  }
}

export async function saveMobileSyncMetadata(value: MobileSyncMetadata, userId?: string) {
  await AsyncStorage.setItem(scopedStorageKey(METADATA_KEY, userId), JSON.stringify(value));
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
