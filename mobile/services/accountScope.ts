const ACCOUNT_SEGMENT = "account";

export function normalizeStorageOwner(userId?: string) {
  const value = userId?.trim();
  return value || undefined;
}

export function scopedStorageKey(baseKey: string, userId?: string) {
  const owner = normalizeStorageOwner(userId);
  return owner ? `${baseKey}/${ACCOUNT_SEGMENT}/${owner}` : baseKey;
}

export function storageClaimKey(baseKey: string) {
  return `${baseKey}/legacy-claim/v1`;
}
