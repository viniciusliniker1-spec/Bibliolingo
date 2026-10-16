import { openDB } from "idb";
import type { SyncMetadata } from "./types";

const DATABASE = "bibliolingo-sync";
const STORE = "metadata";
const METADATA_KEY = "current";
const DEVICE_KEY = "device";

const initial: SyncMetadata = {
  cursor: { lastServerSequence: 0 },
  pendingEvents: [],
  status: "local-only"
};

async function database() {
  return openDB(DATABASE, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    }
  });
}

export async function loadSyncMetadata(): Promise<SyncMetadata> {
  const stored = await (await database()).get(STORE, METADATA_KEY) as SyncMetadata | undefined;
  return stored ?? initial;
}

export async function saveSyncMetadata(metadata: SyncMetadata) {
  await (await database()).put(STORE, metadata, METADATA_KEY);
}

export async function getWebDeviceId() {
  const db = await database();
  const existing = await db.get(STORE, DEVICE_KEY) as string | undefined;
  if (existing) return existing;
  const next = globalThis.crypto?.randomUUID?.()
    ?? "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
      const random = Math.floor(Math.random() * 16);
      return (token === "x" ? random : (random & 0x3) | 0x8).toString(16);
    });
  await db.put(STORE, next, DEVICE_KEY);
  return next;
}
