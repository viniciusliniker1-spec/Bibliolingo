import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useLumi } from "../../lumi/LumiContext";

export function ProfilePhotoEditor(){
 const auth=useAuth();const lumi=useLumi();const input=useRef<HTMLInputElement>(null);const [source,setSource]=useState<string>();const [scale,setScale]=useState(1);const [x,setX]=useState(0);const [y,setY]=useState(0);const [busy,setBusy]=useState(false);const [notice,setNotice]=useState("");
 useEffect(()=>()=>{if(source)URL.revokeObjectURL(source);},[source]);
 const select=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];event.target.value="";if(!file)return;if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>12*1024*1024){setNotice("Escolha JPEG, PNG ou WebP de até 12 MB.");return;}if(source)URL.revokeObjectURL(source);setSource(URL.createObjectURL(file));setScale(1);setX(0);setY(0);setNotice("Ajuste escala e posição antes de salvar.");};
 const save=async()=>{if(!source)return;setBusy(true);try{const image=new Image();image.src=source;await image.decode();const canvas=document.createElement("canvas");canvas.width=768;canvas.height=768;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Seu navegador não permitiu processar a imagem.");const base=Math.max(768/image.width,768/image.height)*scale;const w=image.width*base,h=image.height*base;ctx.drawImage(image,(768-w)/2+x*3.84,(768-h)/2+y*3.84,w,h);const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",.8));if(!blob)throw new Error("Não foi possível preparar a foto.");await lumi.uploadPhoto(blob);URL.revokeObjectURL(source);setSource(undefined);setNotice("Foto sincronizada com sua conta.");}catch(e){setNotice(e instanceof Error?e.message:"Não foi possível salvar.");}finally{setBusy(false);}};
 const name=auth.session?.user.user_metadata?.display_name??auth.session?.user.email??"Estudante";const shown=source??lumi.profilePhotoUrl;
 if(!auth.session)return null;
 return <section className="profile-photo-card">
  <div className="profile-photo-preview">{shown?<img src={shown} alt={source?"Prévia da nova foto":"Foto de perfil"} style={source?{transform:`translate(${x}px,${y}px) scale(${scale})`}:undefined}/>:<span>{name.slice(0,1).toUpperCase()}</span>}</div>
  <div className="profile-photo-copy"><h2>Foto de perfil</h2><p>A foto identifica sua conta. A Lumi continua sendo sua personagem nas trilhas.</p>
   {source?<div className="photo-controls"><label>Escala<input type="range" min="1" max="3" step=".05" value={scale} onChange={e=>setScale(Number(e.target.value))}/></label><label>Horizontal<input type="range" min="-100" max="100" value={x} onChange={e=>setX(Number(e.target.value))}/></label><label>Vertical<input type="range" min="-100" max="100" value={y} onChange={e=>setY(Number(e.target.value))}/></label></div>:null}
   <div className="photo-actions"><button className="small-button" onClick={()=>input.current?.click()}>{shown?"Trocar foto":"Escolher foto"}</button>{source?<button className="primary-button" disabled={busy} onClick={()=>void save()}>{busy?"Salvando…":"Salvar"}</button>:null}{!source&&lumi.profilePhotoUrl?<button className="text-button" disabled={busy} onClick={()=>void lumi.removePhoto()}>Remover</button>:null}</div>
   <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={select}/><small>JPEG, PNG ou WebP. O arquivo final é recortado e comprimido para JPEG.</small>{notice?<p role="status">{notice}</p>:null}
  </div>
 </section>;
}
