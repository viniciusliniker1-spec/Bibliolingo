import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import morphhbImport from "morphhb";

const root=path.resolve(process.cwd(),"assets/original");
const hebDir=path.join(root,"heb"),grcDir=path.join(root,"grc");
await mkdir(hebDir,{recursive:true});await mkdir(grcDir,{recursive:true});
const morphhb=morphhbImport?.default??morphhbImport;
const normalize=value=>String(value).toLowerCase().replace(/[^a-z0-9]/g,"");
const sourceEntries=Object.entries(morphhb).filter(([,value])=>Array.isArray(value));
const books=[["Gen",["Genesis","Gen"]],["Exod",["Exodus","Exod","Exo"]],["Lev",["Leviticus","Lev"]],["Num",["Numbers","Num"]],["Deut",["Deuteronomy","Deut"]],["Josh",["Joshua","Josh"]],["Judg",["Judges","Judg"]],["Ruth",["Ruth"]],["1Sam",["1 Samuel","1Sam","I Samuel"]],["2Sam",["2 Samuel","2Sam","II Samuel"]],["1Kgs",["1 Kings","1Kgs","I Kings"]],["2Kgs",["2 Kings","2Kgs","II Kings"]],["1Chr",["1 Chronicles","1Chr","I Chronicles"]],["2Chr",["2 Chronicles","2Chr","II Chronicles"]],["Ezra",["Ezra"]],["Neh",["Nehemiah","Neh"]],["Esth",["Esther","Esth"]],["Job",["Job"]],["Ps",["Psalms","Psalm","Ps"]],["Prov",["Proverbs","Prov"]],["Eccl",["Ecclesiastes","Eccl"]],["Song",["Song of Songs","Song","Canticles"]],["Isa",["Isaiah","Isa"]],["Jer",["Jeremiah","Jer"]],["Lam",["Lamentations","Lam"]],["Ezek",["Ezekiel","Ezek"]],["Dan",["Daniel","Dan"]],["Hos",["Hosea","Hos"]],["Joel",["Joel"]],["Amos",["Amos"]],["Obad",["Obadiah","Obad"]],["Jonah",["Jonah"]],["Mic",["Micah","Mic"]],["Nah",["Nahum","Nah"]],["Hab",["Habakkuk","Hab"]],["Zeph",["Zephaniah","Zeph"]],["Hag",["Haggai","Hag"]],["Zech",["Zechariah","Zech"]],["Mal",["Malachi","Mal"]]];
for(let index=0;index<books.length;index++){
 const [osis,aliases]=books[index];
 const wanted=new Set(aliases.map(normalize));
 const found=sourceEntries.find(([key])=>wanted.has(normalize(key)))??sourceEntries[index];
 if(!found||!Array.isArray(found[1]))throw new Error("Livro OSHB ausente: "+osis);
 await writeFile(path.join(hebDir,osis+".dat"),JSON.stringify({book:osis,chapters:found[1]}));
}
const GREEK_REVISION="7fd4d02c3e5adebd379ebfbc824040820dde10fc";
const greekFiles=[["Matt","MT.UTR"],["Mark","MR.UTR"],["Luke","LU.UTR"],["John","JOH.UTR"],["Acts","AC.UTR"],["Rom","RO.UTR"],["1Cor","1CO.UTR"],["2Cor","2CO.UTR"],["Gal","GA.UTR"],["Eph","EPH.UTR"],["Phil","PHP.UTR"],["Col","COL.UTR"],["1Thess","1TH.UTR"],["2Thess","2TH.UTR"],["1Tim","1TI.UTR"],["2Tim","2TI.UTR"],["Titus","TIT.UTR"],["Phlm","PHM.UTR"],["Heb","HEB.UTR"],["Jas","JAS.UTR"],["1Pet","1PE.UTR"],["2Pet","2PE.UTR"],["1John","1JO.UTR"],["2John","2JO.UTR"],["3John","3JO.UTR"],["Jude","JUDE.UTR"],["Rev","RE.UTR"]];
await Promise.all(greekFiles.map(async([osis,file])=>{
 const url="https://raw.githubusercontent.com/byztxt/greektext-textus-receptus/"+GREEK_REVISION+"/parsed/"+file;
 const response=await fetch(url);if(!response.ok)throw new Error("Falha no texto grego: "+osis);
 await writeFile(path.join(grcDir,osis+".dat"),await response.text());
}));
const DODSON_REVISION="74f70358d4acfaf2f980bf2feb58ab7115cbbcbc";
const dodson=await fetch("https://raw.githubusercontent.com/biblicalhumanities/Dodson-Greek-Lexicon/"+DODSON_REVISION+"/dodson.csv");
if(!dodson.ok)throw new Error("Falha no léxico grego");
await writeFile(path.join(root,"dodson.dat"),await dodson.text());
const HEBREW_LEXICON_REVISION="21c9add13bc727d3a951361778e97e3ff7afd1ce";
const lexResponse=await fetch("https://raw.githubusercontent.com/openscriptures/HebrewLexicon/"+HEBREW_LEXICON_REVISION+"/HebrewStrong.xml");
if(!lexResponse.ok)throw new Error("Falha no léxico hebraico");
const xml=await lexResponse.text();
const decode=value=>String(value??"").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g," ").trim();
const entries=[];
for(const match of xml.matchAll(/<entry\b[^>]*\bid=["']?H?(\d+)["']?[^>]*>([\s\S]*?)<\/entry>/gi)){
 const id="H"+match[1].padStart(4,"0"),body=match[2];
 const word=body.match(/<w\b([^>]*)>([\s\S]*?)<\/w>/i);
 const attrs=word?.[1]??"",lemma=decode(word?.[2]??"");
 const xlit=attrs.match(/xlit=["']([^"']+)["']/i)?.[1]??"";
 const pron=attrs.match(/pron=["']([^"']+)["']/i)?.[1]??"";
 const definition=decode(body.match(/<def\b[^>]*>([\s\S]*?)<\/def>/i)?.[1]??body.match(/<meaning\b[^>]*>([\s\S]*?)<\/meaning>/i)?.[1]??"");
 const usage=decode(body.match(/<usage\b[^>]*>([\s\S]*?)<\/usage>/i)?.[1]??"");
 entries.push({id,strong:id,lemma,transliteration:xlit,pronunciation:pron,definition,usage,language:/aramaic|xml:lang=["']arc/i.test(body)?"arc":"hbo",search:(id+" "+lemma+" "+xlit+" "+definition+" "+usage).toLowerCase()});
}
if(entries.length<5000)throw new Error("Léxico hebraico incompleto: "+entries.length);
await writeFile(path.join(root,"hebrew-lexicon.dat"),JSON.stringify(entries));
await writeFile(path.join(root,"SOURCES.json"),JSON.stringify({
 oshb:{revision:"3d15126fb1ef74867fc1434be1942e837932691f",license:"WLC: domínio público; lema e morfologia: CC BY 4.0",attribution:"Open Scriptures Hebrew Bible Project"},
 greek:{revision:GREEK_REVISION,license:"Domínio público",title:"Textus Receptus de Robinson"},
 lexicon:{revision:HEBREW_LEXICON_REVISION,license:"CC BY 4.0; BDB e Strong em domínio público",attribution:"Open Scriptures Hebrew Bible Project"},
 dodson:{revision:DODSON_REVISION,license:"CC BY-SA 4.0"}
},null,2));
console.log("Pacote linguístico embutido:",books.length,"livros AT,",greekFiles.length,"livros NT,",entries.length,"entradas hebraicas/aramaicas");
