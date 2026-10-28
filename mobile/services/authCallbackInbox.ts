import { isMobileAuthCallback, parseAuthCallback } from "./authCore";

export interface AuthCallbackEntry {
  readonly id: number;
  readonly url: string;
  readonly receivedAt: number;
}

// Tokens stay only in memory, never in router params, logs or AsyncStorage.
// The native intent may arrive before the callback screen/provider mounts.
export function createAuthCallbackInbox<T>(now = Date.now, ttlMs = 120_000) {
  let sequence = 0;
  let current: AuthCallbackEntry | undefined;
  let completion: Promise<T> | undefined;
  const listeners = new Set<(entry: AuthCallbackEntry | undefined) => void>();

  const clear = () => {
    current = undefined;
    completion = undefined;
    for (const listener of listeners) listener(undefined);
  };
  const get = () => {
    if (current && now() - current.receivedAt >= ttlMs) clear();
    return current;
  };
  const capture = (url?: string | null) => {
    if (!url || !isMobileAuthCallback(url)) return undefined;
    const parsed = parseAuthCallback(url);
    if (!parsed.accessToken && !parsed.refreshToken && !parsed.error && !parsed.code) return undefined;
    const previous = get();
    if (previous?.url === url) return previous;
    completion = undefined;
    current = { id: ++sequence, url, receivedAt: now() };
    for (const listener of listeners) listener(current);
    return current;
  };
  const subscribe = (listener: (entry: AuthCallbackEntry | undefined) => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };

  return {
    get, capture, clear, subscribe,
    complete(url: string, process: (url: string) => Promise<T>): Promise<T> {
      const entry = capture(url);
      if (!entry) return Promise.reject(new Error("O link não contém um retorno de autenticação válido. Inicie o login novamente."));
      if (!completion) completion = Promise.resolve().then(() => process(entry.url));
      return completion;
    },
    wait(timeoutMs: number): Promise<AuthCallbackEntry | undefined> {
      const pending = get();
      if (pending) return Promise.resolve(pending);
      return new Promise((resolve) => {
        const unsubscribe = subscribe((entry) => {
          if (!entry) return;
          clearTimeout(timer);
          unsubscribe();
          resolve(entry);
        });
        const timer = setTimeout(() => { unsubscribe(); resolve(undefined); }, timeoutMs);
      });
    }
  };
}

export const authCallbackInbox = createAuthCallbackInbox<string | undefined>();
