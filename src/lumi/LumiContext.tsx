import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { LumiAccountState, LumiCategory } from "../domain/lumi";
import { equipWebLumiItem, fetchWebLumiState, getWebProfilePhotoUrl, purchaseWebLumiItem, removeWebProfilePhoto, unequipWebLumiCategory, uploadWebProfilePhoto } from "../services/lumiRemote";
import { useAuth } from "../auth/AuthContext";

const EMPTY:LumiAccountState={balance:0,items:[],inventory:[],equipment:[],transactions:[]};
interface LumiValue{state:LumiAccountState;loading:boolean;error?:string;profilePhotoUrl?:string;refresh:()=>Promise<void>;purchase:(id:string)=>Promise<void>;equip:(id:string)=>Promise<void>;unequip:(category:LumiCategory)=>Promise<void>;uploadPhoto:(blob:Blob)=>Promise<void>;removePhoto:()=>Promise<void>}
const Context=createContext<LumiValue|null>(null);
export function LumiProvider({children}:PropsWithChildren){
 const auth=useAuth();const [state,setState]=useState(EMPTY);const [loading,setLoading]=useState(false);const [error,setError]=useState<string>();const [profilePhotoUrl,setProfilePhotoUrl]=useState<string>();
 const refresh=useCallback(async()=>{if(!auth.session){setState(EMPTY);setProfilePhotoUrl(undefined);return;}setLoading(true);setError(undefined);try{const next=await fetchWebLumiState(auth.session);setState(next);setProfilePhotoUrl(await getWebProfilePhotoUrl(auth.session,next.profilePhotoPath));}catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar a Loja Lumi.");}finally{setLoading(false);}},[auth.session]);
 useEffect(()=>{void refresh();const listener=()=>void refresh();window.addEventListener("bibliolingo:lumi-changed",listener);return()=>window.removeEventListener("bibliolingo:lumi-changed",listener);},[refresh]);
 const requireSession=useCallback(()=>{if(!auth.session)throw new Error("Entre na sua conta para usar a Loja Lumi.");return auth.session;},[auth.session]);
 const value=useMemo<LumiValue>(()=>({state,loading,error,profilePhotoUrl,refresh,
  purchase:async id=>{await purchaseWebLumiItem(requireSession(),id);await refresh();},
  equip:async id=>{await equipWebLumiItem(requireSession(),id);await refresh();},
  unequip:async category=>{await unequipWebLumiCategory(requireSession(),category);await refresh();},
  uploadPhoto:async blob=>{await uploadWebProfilePhoto(requireSession(),blob);await refresh();},
  removePhoto:async()=>{await removeWebProfilePhoto(requireSession(),state.profilePhotoPath);await refresh();}
 }),[state,loading,error,profilePhotoUrl,refresh,requireSession]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLumi(){const value=useContext(Context);if(!value)throw new Error("useLumi deve estar dentro de LumiProvider");return value;}
