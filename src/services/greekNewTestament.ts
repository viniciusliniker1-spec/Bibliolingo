import { robinsonCodeToGreek } from "../content/greek/betaCode";\n\nconst phoneticLetters: Record<string, string> = {\n a:"a",b:"b",g:"g",d:"d",e:"e",z:"z",h:"ē",q:"th",i:"i",k:"k",l:"l",\n m:"m",n:"n",c:"ch",o:"o",p:"p",r:"r",s:"s",t:"t",u:"y",f:"ph",x:"x",y:"ps",w:"ō",v:"s"\n};\n\nexport function robinsonCodeToPhonetic(value: string) {\n return [...value].map((character) => phoneticLetters[character.toLowerCase()] ?? character).join("");\n}

export interface GreekVerseWord {
 position:number;
 form:string;
 transliteration:string;
 strong:string;
 morphology:string;
}

const SOURCE_REVISION="7fd4d02c3e5adebd379ebfbc824040820dde10fc";
const SOURCE_BASE="https://raw.githubusercontent.com/byztxt/greektext-textus-receptus/"+SOURCE_REVISION+"/parsed/";
const bookFiles:Record<string,string>={
 Matt:"MT.UTR",Mark:"MR.UTR",Luke:"LU.UTR",John:"JOH.UTR",Acts:"AC.UTR",Rom:"RO.UTR",
 "1Cor":"1CO.UTR","2Cor":"2CO.UTR",Gal:"GA.UTR",Eph:"EPH.UTR",Phil:"PHP.UTR",Col:"COL.UTR",
 "1Thess":"1TH.UTR","2Thess":"2TH.UTR","1Tim":"1TI.UTR","2Tim":"2TI.UTR",Titus:"TIT.UTR",
 Phlm:"PHM.UTR",Heb:"HEB.UTR",Jas:"JAS.UTR","1Pet":"1PE.UTR","2Pet":"2PE.UTR",
 "1John":"1JO.UTR","2John":"2JO.UTR","3John":"3JO.UTR",Jude:"JUDE.UTR",Rev:"RE.UTR"
};
const cache=new Map<string,Map<string,GreekVerseWord[]>>();

export function parseGreekNewTestamentBook(content:string){
 const normalized=content.replace(/\r/g,"").replace(/\n(?!\d+:\d+\s)/g," ");
 const verses=new Map<string,GreekVerseWord[]>();
 for(const line of normalized.split("\n")){
  const heading=line.match(/^(\d+):(\d+)\s+(.*)$/);
  if(!heading) continue;
  const words:GreekVerseWord[]=[];
  const wordPattern=/(\S+)\s+(\d+)(?:\s+\d+)*\s+\{([^}]+)\}/g;
  let match:RegExpExecArray|null;
  while((match=wordPattern.exec(heading[3]))){
   const transliteration=match[1];
   words.push({
    position:words.length+1,
    form:robinsonCodeToGreek(transliteration),
    transliteration,
    strong:"G"+match[2].padStart(4,"0"),
    morphology:match[3]
   });
  }
  verses.set(heading[1]+":"+heading[2],words);
 }
 return verses;
}

export function hasGreekNewTestamentBook(osis:string){return Boolean(bookFiles[osis]);}

export async function loadGreekVerse(osis:string,chapter:number,verse:number,signal?:AbortSignal){
 const file=bookFiles[osis];
 if(!file) throw new Error("O estudo no grego está disponível somente no Novo Testamento.");
 let book=cache.get(osis);
 if(!book){
  const response=await fetch(SOURCE_BASE+file,{cache:"force-cache",signal});
  if(!response.ok) throw new Error("Não foi possível carregar o texto grego deste livro.");
  book=parseGreekNewTestamentBook(await response.text());
  if(!book.size) throw new Error("O arquivo grego recebido é inválido.");
  cache.set(osis,book);
 }
 const words=book.get(chapter+":"+verse);
 if(!words?.length) throw new Error("Este versículo não foi localizado na edição grega.");
 return words;
}

export const GREEK_NT_SOURCE={
 title:"Textus Receptus de Robinson",
 license:"Domínio público",
 url:"https://github.com/byztxt/greektext-textus-receptus",
 note:"Texto grego, números Strong e morfologia. A ordem das palavras não é um alinhamento automático com a tradução portuguesa."
} as const;
