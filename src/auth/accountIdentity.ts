export interface AccountIdentityUser {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    display_name?: string;
    [key: string]: unknown;
  };
}

export function normalizeAccountUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._]/g, "")
    .replace(/[._]{2,}/g, ".")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, 24);
}

export function getAccountUsername(user: AccountIdentityUser) {
  const candidates = [
    typeof user.user_metadata?.username === "string" ? user.user_metadata.username : "",
    typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "",
    user.email?.split("@")[0] ?? "",
    "estudante." + user.id.slice(0, 6)
  ];
  return candidates.map(normalizeAccountUsername).find(Boolean) ?? "estudante";
}

export function accountUsernameError(value: string) {
  if (value.length < 3) return "Use pelo menos 3 caracteres.";
  if (value.length > 24) return "Use no máximo 24 caracteres.";
  if (normalizeAccountUsername(value) !== value) {
    return "Use apenas letras minúsculas sem acento, números, ponto ou sublinhado.";
  }
  return undefined;
}
