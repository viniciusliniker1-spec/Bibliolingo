import { beforeEach, describe, expect, it } from "vitest";
import { deleteItemAsync, getItemAsync, setItemAsync } from "./secureStore.web";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
  keys() { return [...this.data.keys()]; }
}

describe("armazenamento seguro na web", () => {
  let storage: MemoryStorage;
  beforeEach(() => {
    storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  });

  it("guarda, lê e apaga com a mesma interface do expo-secure-store", async () => {
    expect(await getItemAsync("sessao")).toBeNull();
    await setItemAsync("sessao", "abc", { keychainAccessible: 0 });
    expect(await getItemAsync("sessao")).toBe("abc");
    expect(storage.keys()).toEqual(["@bibliolingo/secure/sessao"]);
    await deleteItemAsync("sessao");
    expect(await getItemAsync("sessao")).toBeNull();
  });

  it("não quebra quando o navegador bloqueia o armazenamento", async () => {
    Object.defineProperty(globalThis, "localStorage", { get() { throw new Error("bloqueado"); }, configurable: true });
    expect(await getItemAsync("x")).toBeNull();
    await expect(setItemAsync("x", "1")).resolves.toBeUndefined();
    await expect(deleteItemAsync("x")).resolves.toBeUndefined();
  });
});
