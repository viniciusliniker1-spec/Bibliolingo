import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AppState } from "../types/progress";
import { migrateState } from "./migrations";

interface BibliolingoDB extends DBSchema {
  appState: {
    key: "current";
    value: unknown;
  };
}

let databasePromise: Promise<IDBPDatabase<BibliolingoDB>> | undefined;

function database() {
  if (!databasePromise) {
    databasePromise = openDB<BibliolingoDB>("bibliolingo", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("appState")) {
          db.createObjectStore("appState");
        }
      }
    });
  }
  return databasePromise;
}

export async function loadState(): Promise<AppState | undefined> {
  const db = await database();
  return migrateState(await db.get("appState", "current"));
}

export async function saveState(state: AppState): Promise<void> {
  const db = await database();
  const transaction = db.transaction("appState", "readwrite");
  await transaction.store.put(state, "current");
  await transaction.done;
}

export async function replaceState(state: AppState): Promise<void> {
  const db = await database();
  const transaction = db.transaction("appState", "readwrite");
  await transaction.store.clear();
  await transaction.store.put(state, "current");
  await transaction.done;
}
