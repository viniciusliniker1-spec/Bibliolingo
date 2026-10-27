import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root=path.resolve(process.cwd(),"assets/lumi/skins");
const expected=["lumi_base.png","lumi_oculos.png","lumi_hiphop.png","lumi_eva_folhas.png","lumi_moises.png","lumi_levitico.png","lumi_numeros.png","lumi_deuteronomio.png"];
let failed=false;

function inspect(file){
 const b=fs.readFileSync(file);
 if(b.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")throw new Error("assinatura PNG inválida");
 let p=8,width=0,height=0,bitDepth=0,colorType=-1,trns=false;const idat=[];
 while(p<b.length){const len=b.readUInt32BE(p);const type=b.subarray(p+4,p+8).toString("ascii");const data=b.subarray(p+8,p+8+len);p+=12+len;
  if(type==="IHDR"){width=data.readUInt32BE(0);height=data.readUInt32BE(4);bitDepth=data[8];colorType=data[9];}
  if(type==="tRNS")trns=[...data].some(x=>x<255);if(type==="IDAT")idat.push(data);if(type==="IEND")break;
 }
 let transparent=trns;
 if(bitDepth===8&&(colorType===6||colorType===4)){const channels=colorType===6?4:2;const rowBytes=width*channels;const raw=zlib.inflateSync(Buffer.concat(idat));let prev=Buffer.alloc(rowBytes);let offset=0;
  for(let y=0;y<height&&!transparent;y++){const filter=raw[offset++];const row=Buffer.from(raw.subarray(offset,offset+rowBytes));offset+=rowBytes;
   for(let x=0;x<rowBytes;x++){const a=x>=channels?row[x-channels]:0,bv=prev[x],c=x>=channels?prev[x-channels]:0;let value=row[x];if(filter===1)value=(value+a)&255;else if(filter===2)value=(value+bv)&255;else if(filter===3)value=(value+Math.floor((a+bv)/2))&255;else if(filter===4){const q=a+bv-c,pa=Math.abs(q-a),pb=Math.abs(q-bv),pc=Math.abs(q-c);value=(value+(pa<=pb&&pa<=pc?a:pb<=pc?bv:c))&255;}row[x]=value;}
   for(let x=channels-1;x<rowBytes;x+=channels)if(row[x]<255){transparent=true;break;}prev=row;
  }
 }
 return {width,height,bitDepth,colorType,transparent,size:b.length};
}
for(const name of expected){const file=path.join(root,name);if(!fs.existsSync(file)){const pending=name==="lumi_base.png";console[pending?"warn":"error"]((pending?"PENDENTE":"AUSENTE")+": "+name);if(!pending)failed=true;continue;}try{const m=inspect(file);console.log(name+": "+m.width+"x"+m.height+", "+m.size+" bytes, alpha real="+m.transparent);if(!m.width||!m.height||!m.transparent){console.error("INVALIDO: "+name+" precisa de dimensões válidas e transparência real");failed=true;}}catch(e){console.error("INVALIDO: "+name+": "+e.message);failed=true;}}
if(failed)process.exit(1);
