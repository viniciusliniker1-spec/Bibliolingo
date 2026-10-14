const betaLetters: Record<string,string> = {
 a:"α",b:"β",g:"γ",d:"δ",e:"ε",z:"ζ",h:"η",q:"θ",i:"ι",k:"κ",l:"λ",
 m:"μ",n:"ν",c:"ξ",o:"ο",p:"π",r:"ρ",s:"σ",t:"τ",u:"υ",f:"φ",x:"χ",y:"ψ",w:"ω"
};
const robinsonLetters:Record<string,string>={...betaLetters,c:"χ",x:"ξ",v:"ς"};
const marks: Record<string,string> = {")":"\u0313","(":"\u0314","/":"\u0301","\\":"\u0300","=":"\u0342","+":"\u0308","|":"\u0345"};

export function betaCodeToGreek(value:string){
 const units:string[]=[]; let pending=""; let uppercase=false; let lastWasLetter=false;
 for(const character of value){
  if(character==="*"){uppercase=true;lastWasLetter=false;continue;}
  if(marks[character]){
   if(lastWasLetter&&units.length) units[units.length-1]+=marks[character];
   else pending+=marks[character];
   continue;
  }
  const base=betaLetters[character.toLowerCase()];
  if(base){
   let greek=uppercase?base.toLocaleUpperCase("el"):base;
   units.push(greek+pending); pending=""; uppercase=false; lastWasLetter=true; continue;
  }
  units.push(pending+character); pending=""; uppercase=false; lastWasLetter=false;
 }
 return (units.join("")+pending).normalize("NFC");
}

export function robinsonCodeToGreek(value:string){
 return [...value].map((character)=>robinsonLetters[character.toLowerCase()]??character).join("").normalize("NFC");
}

export function betaHeadword(value:string){
 return betaCodeToGreek(value.split(",")[0].trim());
}

export function betaTransliteration(value:string){
 return value.split(",")[0].replace(/[*)(/\\=+|]/g,"").trim();
}
