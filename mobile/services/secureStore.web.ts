/**
 * Na web não existe cofre do sistema: a sessão e as preferências ficam no localStorage do navegador
 * (o mesmo que qualquer site com login usa). Mesma interface do expo-secure-store para o resto do app.
 */
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 0;

const prefix = "@bibliolingo/secure/";

function storage(): Storage | undefined {
  try { return globalThis.localStorage; } catch { return undefined; }
}

export async function getItemAsync(key: string): Promise<string | null> {
  return storage()?.getItem(prefix + key) ?? null;
}

export async function setItemAsync(key: string, value: string, _options?: unknown): Promise<void> {
  storage()?.setItem(prefix + key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  storage()?.removeItem(prefix + key);
}
