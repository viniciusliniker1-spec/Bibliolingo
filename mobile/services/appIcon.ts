import AsyncStorage from "@react-native-async-storage/async-storage";
import { iconForAccess, recordAccess, type AccessState } from "../domain/lumiAppIcon";
import { appIconAvailable, getAppIcon, setAppIcon } from "../modules/lumi-app-icon";

const KEY = "@bibliolingo/app-icon/v1";

async function load(): Promise<AccessState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AccessState>) : {};
    return {
      lastOpen: typeof parsed.lastOpen === "string" ? parsed.lastOpen : undefined,
      streak: typeof parsed.streak === "number" && parsed.streak > 0 ? parsed.streak : 0
    };
  } catch {
    return { streak: 0 };
  }
}

/** Marca que o aluno abriu o app hoje. */
export async function recordAppOpen(now = new Date()): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(recordAccess(await load(), now)));
  } catch {
    // Sem armazenamento, o ícone só deixa de evoluir.
  }
}

/**
 * Coloca na tela inicial o ícone que corresponde aos acessos até agora.
 * Chamado quando o app vai para segundo plano e pela tarefa periódica: trocar o ícone com
 * o app aberto faz alguns launchers fechá-lo.
 */
export async function syncAppIcon(now = new Date()): Promise<void> {
  if (!appIconAvailable) return;
  const wanted = iconForAccess(await load(), now);
  if (getAppIcon() !== wanted) setAppIcon(wanted);
}
