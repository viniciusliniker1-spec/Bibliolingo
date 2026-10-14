export interface GreekLexeme {
  id: string;
  strong: string;
  lemma: string;
  transliteration: string;
  pronunciation: string;
  partOfSpeech: string;
  meanings: string[];
  morphology: string;
  forms: string[];
  examples: { reference: string; form: string; note: string }[];
  source: { title: string; url: string; license: string; attribution: string };
}

const tbesgSource={title:"TBESG — Translators Brief lexicon of Extended Strong’s for Greek",url:"https://github.com/STEPBible/STEPBible-Data",license:"CC BY 4.0",attribution:"STEP Bible / Tyndale House Cambridge"};
const dodsonSource={title:"Dodson Greek Lexicon",url:"https://github.com/biblicalhumanities/Dodson-Greek-Lexicon",license:"CC0 1.0 · domínio público",attribution:"Jeffrey Dodson / Biblical Humanities"};
export const greekLexiconSources=[tbesgSource,dodsonSource] as const;
const E=(strong:string,lemma:string,transliteration:string,pronunciation:string,partOfSpeech:string,meanings:string[],morphology:string,forms:string[],examples:GreekLexeme["examples"],source:GreekLexeme["source"]=tbesgSource):GreekLexeme=>({id:strong.toLowerCase(),strong,lemma,transliteration,pronunciation,partOfSpeech,meanings,morphology,forms,examples,source});
export const greekLexicon:GreekLexeme[]=[
E("G0025","ἀγαπάω","agapaō","a-ga-PÁ-o","verbo",["amar","demonstrar amor"],"Verbo; lema na 1ª pessoa singular do presente ativo",["ἀγαπᾷ","ἠγάπησεν"],[{reference:"João 3:16",form:"ἠγάπησεν",note:"aoristo indicativo ativo, 3ª singular"}]),
E("G0026","ἀγάπη","agapē","a-GÁ-pe","substantivo feminino",["amor","cuidado comprometido"],"Substantivo feminino da 1ª declinação",["ἀγάπη","ἀγάπην","ἀγάπῃ"],[{reference:"1 Coríntios 13:1",form:"ἀγάπην",note:"acusativo singular"}]),
E("G0032","ἄγγελος","angelos","ÂN-gue-los","substantivo masculino",["mensageiro","anjo"],"Substantivo masculino da 2ª declinação",["ἄγγελος","ἀγγέλου","ἄγγελον"],[{reference:"Mateus 1:20",form:"ἄγγελος",note:"nominativo singular"}]),
E("G0040","ἅγιος","hagios","HÁ-gui-os","adjetivo",["santo","separado para Deus"],"Adjetivo de três terminações",["ἅγιος","ἁγία","ἅγιον"],[{reference:"Marcos 1:24",form:"ἅγιος",note:"nominativo masculino singular"}]),
E("G0444","ἄνθρωπος","anthrōpos","ÂN-thro-pos","substantivo masculino",["ser humano","pessoa","homem conforme o contexto"],"Substantivo masculino da 2ª declinação",["ἄνθρωπος","ἀνθρώπου","ἀνθρώπους"],[{reference:"João 1:6",form:"ἄνθρωπος",note:"nominativo singular"}]),
E("G0746","ἀρχή","archē","ar-CHÊ","substantivo feminino",["começo","origem","governo ou autoridade conforme o contexto"],"Substantivo feminino da 1ª declinação",["ἀρχή","ἀρχῇ","ἀρχαί"],[{reference:"João 1:1",form:"ἀρχῇ",note:"dativo singular após ἐν"}]),
E("G1510","εἰμί","eimi","ei-MÍ","verbo",["ser","estar","existir conforme a construção"],"Verbo irregular e copulativo",["εἰμί","ἐστίν","ἦν","ἐστε"],[{reference:"João 1:1",form:"ἦν",note:"imperfeito indicativo ativo, 3ª singular"}]),
E("G1577","ἐκκλησία","ekklēsia","ek-kle-SÍ-a","substantivo feminino",["assembleia","congregação","igreja"],"Substantivo feminino da 1ª declinação",["ἐκκλησία","ἐκκλησίας","ἐκκλησίᾳ"],[{reference:"Mateus 16:18",form:"ἐκκλησίαν",note:"acusativo singular"}]),
E("G1680","ἐλπίς","elpis","el-PÍS","substantivo feminino",["esperança","expectativa"],"Substantivo feminino da 3ª declinação",["ἐλπίς","ἐλπίδος","ἐλπίδι"],[{reference:"Tito 1:2",form:"ἐλπίδι",note:"dativo singular"}]),
E("G2098","εὐαγγέλιον","euangelion","eu-an-GUÉ-li-on","substantivo neutro",["boa notícia","evangelho"],"Substantivo neutro da 2ª declinação",["εὐαγγέλιον","εὐαγγελίου"],[{reference:"Marcos 1:1",form:"εὐαγγελίου",note:"genitivo singular"}]),
E("G2222","ζωή","zōē","zo-Ê","substantivo feminino",["vida"],"Substantivo feminino da 1ª declinação",["ζωή","ζωῆς","ζωήν"],[{reference:"João 1:4",form:"ζωή",note:"nominativo singular"}]),
E("G2316","θεός","theos","the-ÓS","substantivo masculino",["Deus","divindade ou deus conforme o contexto"],"Substantivo da 2ª declinação; uso contextual do artigo",["θεός","θεοῦ","θεῷ","θεόν"],[{reference:"João 1:1",form:"θεόν",note:"acusativo singular após πρός"}]),
E("G2424","Ἰησοῦς","Iēsous","i-e-SÚS","nome próprio",["Jesus","Josué em contextos específicos"],"Nome próprio masculino com flexão irregular",["Ἰησοῦς","Ἰησοῦ","Ἰησοῦν"],[{reference:"Mateus 1:21",form:"Ἰησοῦν",note:"acusativo singular"}]),
E("G2532","καί","kai","kai","conjunção",["e","também","até, conforme o contexto"],"Conjunção coordenativa",["καί","κἀγώ"],[{reference:"João 1:1",form:"καί",note:"conecta a terceira cláusula"}]),
E("G2962","κύριος","kyrios","KÝ-ri-os","substantivo masculino",["senhor","mestre","Senhor como título divino conforme o contexto"],"Substantivo masculino da 2ª declinação",["κύριος","κυρίου","κύριον"],[{reference:"Filipenses 2:11",form:"κύριος",note:"predicativo nominativo"}]),
E("G3056","λόγος","logos","LÓ-gos","substantivo masculino",["palavra","mensagem","discurso","razão ou prestação de contas conforme o contexto"],"Substantivo masculino da 2ª declinação",["λόγος","λόγου","λόγῳ","λόγον"],[{reference:"João 1:1",form:"λόγος",note:"nominativo singular"}]),
E("G3341","μετάνοια","metanoia","me-TÁ-noi-a","substantivo feminino",["arrependimento","mudança de mente e direção"],"Substantivo feminino da 1ª declinação",["μετάνοια","μετανοίας","μετάνοιαν"],[{reference:"Marcos 1:4",form:"μετανοίας",note:"genitivo singular"}]),
E("G4100","πιστεύω","pisteuō","pis-TEU-o","verbo",["crer","confiar","depositar fé"],"Verbo; o complemento e a preposição delimitam a construção",["πιστεύω","πιστεύων","ἐπίστευσεν"],[{reference:"João 3:16",form:"πιστεύων",note:"particípio presente ativo nominativo singular"}]),
E("G4102","πίστις","pistis","PÍS-tis","substantivo feminino",["fé","confiança","fidelidade conforme o contexto"],"Substantivo feminino da 3ª declinação",["πίστις","πίστεως","πίστει"],[{reference:"Efésios 2:8",form:"πίστεως",note:"genitivo singular após διά"}]),
E("G4151","πνεῦμα","pneuma","PNEU-ma","substantivo neutro",["espírito","sopro","vento conforme o contexto"],"Substantivo neutro da 3ª declinação",["πνεῦμα","πνεύματος","πνεύματι"],[{reference:"João 3:8",form:"πνεῦμα",note:"a repetição explora sentidos relacionados no discurso"}]),
E("G4991","σωτηρία","sōtēria","so-te-RÍ-a","substantivo feminino",["salvação","livramento","preservação"],"Substantivo feminino da 1ª declinação",["σωτηρία","σωτηρίας","σωτηρίᾳ"],[{reference:"Lucas 1:69",form:"σωτηρίας",note:"genitivo singular"}]),
E("G5485","χάρις","charis","CHÁ-ris","substantivo feminino",["graça","favor","benevolência","gratidão conforme o contexto"],"Substantivo feminino da 3ª declinação",["χάρις","χάριτος","χάριτι"],[{reference:"Efésios 2:8",form:"χάριτι",note:"dativo singular"}]),
E("G0080","ἀδελφός","adelphos","a-del-FÓS","substantivo masculino",["irmão","membro da mesma comunidade de fé"],"Substantivo masculino da 2ª declinação",["ἀδελφός","ἀδελφοῦ","ἀδελφόν"],[{reference:"Mateus 4:18",form:"ἀδελφὸν",note:"acusativo singular"}],dodsonSource),
E("G0932","βασιλεία","basileia","ba-si-LEI-a","substantivo feminino",["reinado","soberania","reino"],"Substantivo feminino da 1ª declinação",["βασιλεία","βασιλείας","βασιλείαν"],[{reference:"Marcos 1:15",form:"βασιλεία",note:"nominativo singular"}],dodsonSource),
E("G1343","δικαιοσύνη","dikaiosynē","di-kai-o-SÝ-ne","substantivo feminino",["justiça","retidão"],"Substantivo feminino da 1ª declinação",["δικαιοσύνη","δικαιοσύνης","δικαιοσύνην"],[{reference:"Mateus 6:33",form:"δικαιοσύνην",note:"acusativo singular"}],dodsonSource),
E("G1656","ἔλεος","eleos","É-le-os","substantivo neutro",["misericórdia","compaixão"],"Substantivo neutro da 3ª declinação",["ἔλεος","ἐλέους","ἐλέει"],[{reference:"Lucas 1:50",form:"ἔλεος",note:"nominativo singular"}],dodsonSource),
E("G2041","ἔργον","ergon","ÉR-gon","substantivo neutro",["obra","trabalho","ação"],"Substantivo neutro da 2ª declinação",["ἔργον","ἔργου","ἔργοις"],[{reference:"Efésios 2:10",form:"ἔργοις",note:"dativo plural"}],dodsonSource),
E("G2889","κόσμος","kosmos","KÓS-mos","substantivo masculino",["mundo","universo","humanidade conforme o contexto"],"Substantivo masculino da 2ª declinação",["κόσμος","κόσμου","κόσμον"],[{reference:"João 3:16",form:"κόσμον",note:"acusativo singular"}],dodsonSource),
E("G3551","νόμος","nomos","NÓ-mos","substantivo masculino",["lei","costume","Lei de Moisés conforme o contexto"],"Substantivo masculino da 2ª declinação",["νόμος","νόμου","νόμον"],[{reference:"Romanos 7:12",form:"νόμος",note:"nominativo singular"}],dodsonSource),
E("G3772","οὐρανός","ouranos","u-ra-NÓS","substantivo masculino",["céu","firmamento"],"Substantivo masculino da 2ª declinação",["οὐρανός","οὐρανοῦ","οὐρανοῖς"],[{reference:"Mateus 6:9",form:"οὐρανοῖς",note:"dativo plural"}],dodsonSource),
E("G4335","προσευχή","proseuchē","pro-seu-CHÊ","substantivo feminino",["oração","lugar de oração conforme o contexto"],"Substantivo feminino da 1ª declinação",["προσευχή","προσευχῆς","προσευχήν"],[{reference:"Atos 16:13",form:"προσευχὴν",note:"acusativo singular"}],dodsonSource),
E("G4561","σάρξ","sarx","SÁRKS","substantivo feminino",["carne","corpo","natureza humana conforme o contexto"],"Substantivo feminino da 3ª declinação",["σάρξ","σαρκός","σάρκα"],[{reference:"João 1:14",form:"σὰρξ",note:"nominativo singular"}],dodsonSource),
E("G5207","υἱός","huios","hui-ÓS","substantivo masculino",["filho","descendente"],"Substantivo masculino da 2ª declinação",["υἱός","υἱοῦ","υἱόν"],[{reference:"Mateus 3:17",form:"υἱός",note:"nominativo singular"}],dodsonSource),
E("G5590","ψυχή","psychē","psy-CHÊ","substantivo feminino",["vida","alma","pessoa ou ser interior conforme o contexto"],"Substantivo feminino da 1ª declinação",["ψυχή","ψυχῆς","ψυχήν"],[{reference:"Marcos 8:35",form:"ψυχὴν",note:"acusativo singular"}],dodsonSource)
];
