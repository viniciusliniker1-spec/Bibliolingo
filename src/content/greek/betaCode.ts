const letters: Record<string,string> = {
 a:"α",b:"β",g:"γ",d:"δ",e:"ε",z:"ζ",h:"η",q:"θ",i:"ι",k:"κ",l:"λ",
 m:"μ",n:"ν",c:"ξ",o:"ο",p:"π",r:"ρ",s:"σ",t:"τ",u:"υ",f:"φ",x:"χ",y:"ψ",w:"ω"
};
const marks: Record<string,string> = {")":"\u0313","(":"\u0314","/":"\u0301","\\":"\u0300","=":"\u0342","+":"\u0308","|":"\u0345"};

export function betaCodeToGreek(value:string){
 let result=""; let pending=""; let uppercase=false;
 for(let index=0;index<value.length;index+=1){
  const character=value[index];
  if(character==="*"){uppercase=true;continue;}
  if(marks[character]){pending+=marks[character];continue;}
  const base=letters[character.toLowerCase()];
  if(base){
   const next=value.slice(index+1).match(/[a-z]/i)?.[0];
   const finalSigma=character.toLowerCase()==="s"&&!next;
   let greek=finalSigma?"ς":base;
   if(uppercase) greek=greek.toLocaleUpperCase("el");
   result+=greek+pending; pending=""; uppercase=false; continue;
  }
  result+=pending+character; pending=""; uppercase=false;
 }
 return (result+pending).normalize("NFC");
}

export function betaHeadword(value:string){
 return betaCodeToGreek(value.split(",")[0].trim());
}

export function betaTransliteration(value:string){
 return value.split(",")[0].replace(/[*)(/\\=+|]/g,"").trim();
}
