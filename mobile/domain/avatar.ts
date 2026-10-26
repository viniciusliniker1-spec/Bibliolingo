export const AVATAR_SCHEMA_VERSION=1 as const;
export const avatarPresentations=["masculino","feminino"] as const;
export const avatarSkinTones=[
 {id:"skin_01",label:"Marfim",color:"#f8d9c4"},{id:"skin_02",label:"Claro",color:"#edc3a5"},
 {id:"skin_03",label:"Dourado",color:"#dca57d"},{id:"skin_04",label:"Moreno claro",color:"#c98b62"},
 {id:"skin_05",label:"Moreno",color:"#aa6d49"},{id:"skin_06",label:"Castanho",color:"#875237"},
 {id:"skin_07",label:"Escuro",color:"#633a29"},{id:"skin_08",label:"Profundo",color:"#43271f"}
] as const;
export const avatarHairColors=[
 {id:"black",label:"Preto",color:"#1e2025"},{id:"brown",label:"Castanho",color:"#5a3828"},
 {id:"blonde",label:"Loiro",color:"#c99b45"},{id:"red",label:"Ruivo",color:"#943f2d"}
] as const;
export const avatarEyeColors=[
 {id:"eyes_brown",label:"Castanhos",color:"#4e342e"},{id:"eyes_dark",label:"Escuros",color:"#1d252b"},
 {id:"eyes_green",label:"Verdes",color:"#3d7259"},{id:"eyes_blue",label:"Azuis",color:"#396a91"}
] as const;
export const avatarOutfits=[
 {id:"outfit_basic",label:"Básica",color:"#0b7f75",accent:"#f2b84b"},{id:"outfit_navy",label:"Marinho",color:"#10243e",accent:"#d8f2ee"},
 {id:"outfit_gold",label:"Dourada",color:"#c98b2e",accent:"#fff3cf"},{id:"outfit_rose",label:"Rosé",color:"#9e5264",accent:"#ffe5eb"},
 {id:"outfit_sky",label:"Azul",color:"#397ca0",accent:"#e4f4fb"},{id:"outfit_olive",label:"Oliva",color:"#657341",accent:"#f0f1d7"}
] as const;
export const avatarAccessories=[
 {id:"none",label:"Nenhum"},{id:"cap",label:"Boné"},{id:"glasses",label:"Óculos"},{id:"chain",label:"Corrente"},{id:"backpack",label:"Mochila"}
] as const;
export const avatarHairStyles={
 masculino:Array.from({length:10},(_,index)=>({id:`hair_m_${String(index+1).padStart(2,"0")}`,label:`Penteado ${index+1}`})),
 feminino:Array.from({length:10},(_,index)=>({id:`hair_f_${String(index+1).padStart(2,"0")}`,label:`Penteado ${index+1}`}))
} as const;
export type AvatarPresentation=typeof avatarPresentations[number];
export interface AvatarSelection{schemaVersion:1;presentation:AvatarPresentation;skinToneId:string;hairStyleId:string;hairColorId:string;eyeColorId:string;outfitId:string;accessoryId:string;updatedAt:string}
export const neutralAvatar:AvatarSelection={schemaVersion:1,presentation:"masculino",skinToneId:"skin_04",hairStyleId:"hair_m_01",hairColorId:"brown",eyeColorId:"eyes_brown",outfitId:"outfit_basic",accessoryId:"none",updatedAt:""};
const has=(items:readonly {id:string}[],id:unknown)=>typeof id==="string"&&items.some(item=>item.id===id);
export function normalizeAvatar(value:unknown):AvatarSelection{
 const candidate=value&&typeof value==="object"?value as Partial<AvatarSelection>:{};
 const presentation:AvatarPresentation=candidate.presentation==="feminino"?"feminino":"masculino";
 const styles=avatarHairStyles[presentation];
 return {schemaVersion:1,presentation,
  skinToneId:has(avatarSkinTones,candidate.skinToneId)?candidate.skinToneId!:neutralAvatar.skinToneId,
  hairStyleId:has(styles,candidate.hairStyleId)?candidate.hairStyleId!:styles[0].id,
  hairColorId:has(avatarHairColors,candidate.hairColorId)?candidate.hairColorId!:neutralAvatar.hairColorId,
  eyeColorId:has(avatarEyeColors,candidate.eyeColorId)?candidate.eyeColorId!:neutralAvatar.eyeColorId,
  outfitId:has(avatarOutfits,candidate.outfitId)?candidate.outfitId!:neutralAvatar.outfitId,
  accessoryId:has(avatarAccessories,candidate.accessoryId)?candidate.accessoryId!:neutralAvatar.accessoryId,
  updatedAt:typeof candidate.updatedAt==="string"?candidate.updatedAt:""};
}
export function selectPresentation(current:AvatarSelection,presentation:AvatarPresentation):AvatarSelection{
 const prefix=presentation==="feminino"?"hair_f_":"hair_m_";return {...current,presentation,hairStyleId:current.hairStyleId.startsWith(prefix)?current.hairStyleId:avatarHairStyles[presentation][0].id};
}
