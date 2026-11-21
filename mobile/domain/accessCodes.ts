import type { UserSettings } from "../../src/types/progress";

/**
 * Código da turma para liberar a Formação Pastoral Nazarena.
 * Protege só a navegação (fica no app); para conteúdo confidencial, validar no servidor.
 */
export const FORMATION_ACCESS_CODE = "12345";

export function isFormationCode(code: string) {
  return code.trim() === FORMATION_ACCESS_CODE;
}

export function isFormationUnlocked(settings: Pick<UserSettings, "formationUnlocked">) {
  return settings.formationUnlocked === true;
}
