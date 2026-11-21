import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LumiEquipmentEntry } from "../../src/domain/lumi";

/**
 * Guarda no aparelho a última skin equipada confirmada pelo servidor, para que a
 * Lumi apareça com ela nas conclusões mesmo offline ou logo ao abrir o app.
 */
const PREFIX = "bibliolingo.lumi.equipment.v1";

export async function loadCachedLumiEquipment(ownerId: string): Promise<LumiEquipmentEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(`${PREFIX}:${ownerId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LumiEquipmentEntry[];
    return Array.isArray(parsed)
      ? parsed.filter((entry) => entry && typeof entry.itemId === "string" && typeof entry.category === "string")
      : [];
  } catch {
    return [];
  }
}

export async function saveCachedLumiEquipment(ownerId: string, equipment: LumiEquipmentEntry[]) {
  try {
    await AsyncStorage.setItem(`${PREFIX}:${ownerId}`, JSON.stringify(equipment));
  } catch {
    // Cache é só conveniência: o servidor continua sendo a fonte da verdade.
  }
}
