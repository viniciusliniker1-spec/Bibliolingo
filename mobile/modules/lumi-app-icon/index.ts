import { requireOptionalNativeModule } from "expo";

interface LumiAppIconModule {
  getIcon(): string | null;
  setIcon(id: string): boolean;
}

/** Só existe no Android (e em builds que incluem o módulo); nos demais casos fica indisponível. */
const native = requireOptionalNativeModule<LumiAppIconModule>("LumiAppIcon");

export const appIconAvailable = Boolean(native);

export function getAppIcon(): string | null {
  try { return native?.getIcon() ?? null; } catch { return null; }
}

export function setAppIcon(id: string): boolean {
  try { return native?.setIcon(id) ?? false; } catch { return false; }
}
