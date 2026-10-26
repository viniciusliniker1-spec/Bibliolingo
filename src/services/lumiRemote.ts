import { normalizeLumiItem, type LumiAccountState, type LumiCategory, type LumiInventoryEntry, type LumiTransaction } from "../domain/lumi";
import { getWebAuthConfiguration, type AuthSession } from "../auth/supabaseAuth";

function access(session: AuthSession, contentType = "application/json") {
  const config = getWebAuthConfiguration();
  if (!config) throw new Error("A conta online não está configurada.");
  return { config, headers: { apikey: config.publishableKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": contentType } };
}
async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => undefined) as T | { message?: string; error?: string } | undefined;
  if (!response.ok) {
    const message = (data as { message?: string; error?: string } | undefined)?.message ?? (data as { error?: string } | undefined)?.error ?? "Não foi possível concluir.";
    if (/insufficient-lumi-coins/i.test(message)) throw new Error("Saldo insuficiente de moedas Lumi.");
    if (/item-locked/i.test(message)) throw new Error("Este item ainda está bloqueado.");
    throw new Error(message);
  }
  return data as T;
}
export async function fetchWebLumiState(session: AuthSession): Promise<LumiAccountState> {
  const { config, headers } = access(session); const user = encodeURIComponent(session.user.id);
  const [wallet, items, inventory, equipment, transactions, profile] = await Promise.all([
    json<Array<{ balance: number }>>(await fetch(`${config.url}/rest/v1/user_lumi_wallets?user_id=eq.${user}&select=balance&limit=1`, { headers })),
    json<Array<Record<string, unknown>>>(await fetch(`${config.url}/rest/v1/lumi_items?active=eq.true&select=*&order=layer_order.asc`, { headers })),
    json<Array<{ item_id: string; acquired_at: string; acquisition_type: LumiInventoryEntry["acquisitionType"] }>>(await fetch(`${config.url}/rest/v1/user_lumi_inventory?user_id=eq.${user}&select=item_id,acquired_at,acquisition_type`, { headers })),
    json<Array<{ category: LumiCategory; item_id: string; updated_at: string }>>(await fetch(`${config.url}/rest/v1/user_lumi_equipment?user_id=eq.${user}&select=category,item_id,updated_at`, { headers })),
    json<Array<{ id: string; amount: number; transaction_type: string; source_event_id: string; item_id?: string; balance_after: number; created_at: string }>>(await fetch(`${config.url}/rest/v1/lumi_transactions?user_id=eq.${user}&select=*&order=created_at.desc&limit=50`, { headers })),
    json<Array<{ profile_photo_path?: string }>>(await fetch(`${config.url}/rest/v1/profiles?user_id=eq.${user}&select=profile_photo_path&limit=1`, { headers }))
  ]);
  return {
    balance: Number(wallet[0]?.balance ?? 0), items: items.map(normalizeLumiItem),
    inventory: inventory.map(x => ({ itemId:x.item_id, acquiredAt:x.acquired_at, acquisitionType:x.acquisition_type })),
    equipment: equipment.map(x => ({ category:x.category, itemId:x.item_id, updatedAt:x.updated_at })),
    transactions: transactions.map((x):LumiTransaction => ({ id:x.id, amount:x.amount, transactionType:x.transaction_type, sourceEventId:x.source_event_id, itemId:x.item_id, balanceAfter:x.balance_after, createdAt:x.created_at })),
    profilePhotoPath: profile[0]?.profile_photo_path
  };
}
async function rpc(session: AuthSession, name: string, body: Record<string, unknown>) {
  const { config, headers } = access(session);
  return json(await fetch(`${config.url}/rest/v1/rpc/${name}`, { method:"POST", headers, body:JSON.stringify(body) }));
}
export async function purchaseWebLumiItem(session:AuthSession,itemId:string){return rpc(session,"purchase_lumi_item",{p_item_id:itemId,p_request_id:crypto.randomUUID()});}
export async function equipWebLumiItem(session:AuthSession,itemId:string){await rpc(session,"equip_lumi_item",{p_item_id:itemId});}
export async function unequipWebLumiCategory(session:AuthSession,category:LumiCategory){await rpc(session,"unequip_lumi_category",{p_category:category});}
export async function uploadWebProfilePhoto(session:AuthSession,blob:Blob){
  if(blob.type!=="image/jpeg") throw new Error("A foto processada precisa estar em JPEG.");
  if(blob.size>2*1024*1024) throw new Error("A foto processada precisa ter no máximo 2 MB.");
  const path=`${session.user.id}/profile.jpg`; const {config,headers}=access(session,"image/jpeg");
  await json(await fetch(`${config.url}/storage/v1/object/profile-photos/${path}`,{method:"POST",headers:{...headers,"x-upsert":"true","cache-control":"3600"},body:blob}));
  await rpc(session,"set_profile_photo_path",{p_path:path}); return path;
}
export async function removeWebProfilePhoto(session:AuthSession,path?:string){
  const {config,headers}=access(session); if(path) await fetch(`${config.url}/storage/v1/object/profile-photos/${path}`,{method:"DELETE",headers});
  await rpc(session,"set_profile_photo_path",{p_path:null});
}
export async function getWebProfilePhotoUrl(session:AuthSession,path?:string){
  if(!path)return undefined; const {config,headers}=access(session);
  const result=await json<{signedURL?:string;signedUrl?:string}>(await fetch(`${config.url}/storage/v1/object/sign/profile-photos/${path}`,{method:"POST",headers,body:JSON.stringify({expiresIn:3600})}));
  const signed=result.signedURL??result.signedUrl; return signed?.startsWith("http")?signed:signed?`${config.url}/storage/v1${signed}`:undefined;
}
