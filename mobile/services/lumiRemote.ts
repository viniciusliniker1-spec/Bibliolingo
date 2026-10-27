import { File } from "expo-file-system";
import {
  normalizeLumiItem,
  type LumiAccountState,
  type LumiCategory,
  type LumiEquipmentEntry,
  type LumiInventoryEntry,
  type LumiTransaction
} from "../../src/domain/lumi";
import { getMobileAuthConfig, type MobileAuthSession } from "./auth";

function authHeaders(session: MobileAuthSession, contentType = "application/json") {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online não está configurada.");
  return {
    config,
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": contentType
    }
  };
}

async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => undefined) as T | { message?: string; error?: string } | undefined;
  if (!response.ok) {
    const message = (data as { message?: string; error?: string } | undefined)?.message
      ?? (data as { error?: string } | undefined)?.error
      ?? "Não foi possível carregar a personalização da Lumi.";
    if (/insufficient-lumi-coins/i.test(message)) throw new Error("Saldo insuficiente de moedas Lumi.");
    if (/item-locked/i.test(message)) throw new Error("Este item ainda está bloqueado.");
    if (/item-not-owned/i.test(message)) throw new Error("Este item ainda não pertence à sua conta.");
    throw new Error(message);
  }
  return data as T;
}

interface InventoryRow {
  item_id: string;
  acquired_at: string;
  acquisition_type: LumiInventoryEntry["acquisitionType"];
}
interface EquipmentRow {
  category: LumiCategory;
  item_id: string;
  updated_at: string;
}
const reconciledUsers = new Set<string>();

interface TransactionRow {
  id: string;
  amount: number;
  transaction_type: string;
  source_event_id: string;
  item_id?: string;
  balance_after: number;
  created_at: string;
}

export async function fetchMobileLumiState(session: MobileAuthSession): Promise<LumiAccountState> {
  const { config, headers } = authHeaders(session);
  if (!reconciledUsers.has(session.user.id)) {
    const response = await fetch(`${config.url}/rest/v1/rpc/reconcile_lumi_rewards`, {
      method: "POST",
      headers,
      body: "{}"
    });
    if (response.ok) reconciledUsers.add(session.user.id);
    else if (response.status !== 404) await json(response);
  }
  const user = encodeURIComponent(session.user.id);
  const common = { headers };
  const [wallet, items, inventory, equipment, transactions, profile] = await Promise.all([
    json<Array<{ balance: number }>>(await fetch(
      `${config.url}/rest/v1/user_lumi_wallets?user_id=eq.${user}&select=balance&limit=1`, common
    )),
    json<Array<Record<string, unknown>>>(await fetch(
      `${config.url}/rest/v1/lumi_items?active=eq.true&select=*&order=layer_order.asc`, common
    )),
    json<InventoryRow[]>(await fetch(
      `${config.url}/rest/v1/user_lumi_inventory?user_id=eq.${user}&select=item_id,acquired_at,acquisition_type`, common
    )),
    json<EquipmentRow[]>(await fetch(
      `${config.url}/rest/v1/user_lumi_equipment?user_id=eq.${user}&select=category,item_id,updated_at`, common
    )),
    json<TransactionRow[]>(await fetch(
      `${config.url}/rest/v1/lumi_transactions?user_id=eq.${user}&select=*&order=created_at.desc&limit=50`, common
    )),
    json<Array<{ profile_photo_path?: string }>>(await fetch(
      `${config.url}/rest/v1/profiles?user_id=eq.${user}&select=profile_photo_path&limit=1`, common
    ))
  ]);
  return {
    balance: Number(wallet[0]?.balance ?? 0),
    items: items.map(normalizeLumiItem),
    inventory: inventory.map((row) => ({
      itemId: row.item_id,
      acquiredAt: row.acquired_at,
      acquisitionType: row.acquisition_type
    })),
    equipment: equipment.map((row) => ({
      category: row.category,
      itemId: row.item_id,
      updatedAt: row.updated_at
    })),
    transactions: transactions.map((row): LumiTransaction => ({
      id: row.id,
      amount: row.amount,
      transactionType: row.transaction_type,
      sourceEventId: row.source_event_id,
      itemId: row.item_id,
      balanceAfter: row.balance_after,
      createdAt: row.created_at
    })),
    profilePhotoPath: profile[0]?.profile_photo_path
  };
}

export async function purchaseMobileLumiItem(session: MobileAuthSession, itemId: string) {
  const { config, headers } = authHeaders(session);
  const requestId = globalThis.crypto?.randomUUID?.() ?? `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
  return json<Array<{ balance: number; acquired: boolean }>>(await fetch(
    `${config.url}/rest/v1/rpc/purchase_lumi_item`,
    { method: "POST", headers, body: JSON.stringify({ p_item_id: itemId, p_request_id: requestId }) }
  ));
}

export async function equipMobileLumiItem(session: MobileAuthSession, itemId: string) {
  const { config, headers } = authHeaders(session);
  await json(await fetch(`${config.url}/rest/v1/rpc/equip_lumi_item`, {
    method: "POST", headers, body: JSON.stringify({ p_item_id: itemId })
  }));
}

export async function unequipMobileLumiCategory(session: MobileAuthSession, category: LumiCategory) {
  const { config, headers } = authHeaders(session);
  await json(await fetch(`${config.url}/rest/v1/rpc/unequip_lumi_category`, {
    method: "POST", headers, body: JSON.stringify({ p_category: category })
  }));
}

export async function rewardMobileLumiEvent(session: MobileAuthSession, eventId: string) {
  const { config, headers } = authHeaders(session);
  return json<Array<{ balance: number; credited: number }>>(await fetch(
    `${config.url}/rest/v1/rpc/reward_lumi_learning_event`,
    { method: "POST", headers, body: JSON.stringify({ p_event_id: eventId }) }
  ));
}

async function assertJpeg(file: File) {
  if (!file.exists) throw new Error("A foto processada não foi encontrada.");
  if (file.size > 2 * 1024 * 1024) throw new Error("A foto precisa ter no máximo 2 MB após a compressão.");
  const bytes = await file.bytes();
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    throw new Error("A imagem processada não é um JPEG válido.");
  }
}

export async function uploadMobileProfilePhoto(session: MobileAuthSession, uri: string) {
  const file = new File(uri);
  await assertJpeg(file);
  const path = `${session.user.id}/profile.jpg`;
  const { config, headers } = authHeaders(session, "image/jpeg");
  await json(await fetch(
    `${config.url}/storage/v1/object/profile-photos/${path}`,
    {
      method: "POST",
      headers: { ...headers, "x-upsert": "true", "cache-control": "3600" },
      body: file
    }
  ));
  await json(await fetch(`${config.url}/rest/v1/rpc/set_profile_photo_path`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ p_path: path })
  }));
  return path;
}

export async function removeMobileProfilePhoto(session: MobileAuthSession, path?: string) {
  const auth = authHeaders(session);
  if (path) {
    await fetch(`${auth.config.url}/storage/v1/object/profile-photos/${path}`, {
      method: "DELETE",
      headers: auth.headers
    });
  }
  await json(await fetch(`${auth.config.url}/rest/v1/rpc/set_profile_photo_path`, {
    method: "POST",
    headers: auth.headers,
    body: JSON.stringify({ p_path: null })
  }));
}

export async function getMobileProfilePhotoUrl(session: MobileAuthSession, path?: string) {
  if (!path) return undefined;
  const { config, headers } = authHeaders(session);
  const result = await json<{ signedURL?: string; signedUrl?: string }>(await fetch(
    `${config.url}/storage/v1/object/sign/profile-photos/${path}`,
    { method: "POST", headers, body: JSON.stringify({ expiresIn: 3600 }) }
  ));
  const signed = result.signedURL ?? result.signedUrl;
  if (!signed) return undefined;
  const absolute = signed.startsWith("http") ? signed : `${config.url}/storage/v1${signed}`;
  return `${absolute}${absolute.includes("?") ? "&" : "?"}v=${Date.now()}`;
}
