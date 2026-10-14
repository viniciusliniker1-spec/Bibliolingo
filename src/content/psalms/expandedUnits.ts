import { buildHistoricalUnits, type HistoricalLessonSeed, type HistoricalUnitSeed } from "../historical/buildHistoricalUnits";

type Topic=[title:string,label:string,start:number,end:number,teaching:string,formation:string];
type PsalmUnit=[id:string,title:string,subtitle:string,start:number,end:number,topics:Topic[]];

const units:PsalmUnit[]=[
["psalms-u02","Dois caminhos e a oração perseguida","Salmos 1–10: sabedoria, realeza e confiança",1,10,[
["Dois caminhos","Salmos 1–2",1,2,"O Saltério abre contrastando o caminho nutrido pela instrução de Deus com a rebelião das nações diante do seu Ungido.","Sabedoria pessoal e governo de Deus formam a porta de entrada da oração bíblica."],
["Quando os adversários se multiplicam","Salmos 3–4",3,4,"Davi transforma perigo, acusações e noite inquieta em oração confiante, sem negar a ameaça.","A confiança permite descansar porque a segurança final vem de Deus."],
["Clamor por justiça","Salmos 5–7",5,7,"Orações da manhã pedem direção e justiça enquanto o salmista entrega a Deus acusações e violência.","A pessoa ferida pode pedir justiça sem tomar para si a vingança."],
["Majestade e vulnerabilidade","Salmos 8–10",8,10,"A majestade do Criador dá dignidade aos humanos, enquanto o clamor seguinte pergunta por que o pobre sofre nas mãos do arrogante.","Dignidade humana e defesa do vulnerável pertencem à mesma visão de Deus."]
]],
["psalms-u03","Refúgio em tempos de crise","Salmos 11–20: verdade, criação e confiança",11,20,[
["Fundamentos abalados","Salmos 11–12",11,12,"Quando estruturas parecem desmoronar, o salmista olha para o governo justo de Deus e denuncia palavras falsas.","Fé não ignora a crise dos fundamentos; procura verdade e justiça."],
["Até quando?","Salmos 13–14",13,14,"O lamento repete até quando e passa do abandono sentido à confiança, enquanto o Salmo 14 denuncia corrupção universal.","Perguntas honestas podem caminhar para memória e confiança."],
["Quem habitará?","Salmos 15–17",15,17,"A proximidade de Deus é relacionada a integridade, verdade e justiça, e o orante pede proteção contra agressores.","Culto e caráter não podem ser separados."],
["Criação que testemunha","Salmos 18–20",18,20,"Um cântico celebra libertação, e o Salmo 19 une testemunho dos céus, instrução divina e exame do coração.","A criação e a Palavra conduzem à humildade, não ao orgulho."]
]],
["psalms-u04","O Pastor e o Rei","Salmos 21–30: sofrimento, cuidado e gratidão",21,30,[
["O clamor do abandonado","Salmos 21–22",21,22,"A celebração real é seguida pelo profundo clamor do Salmo 22, que os Evangelhos relacionam ao sofrimento de Jesus.","O lamento pode expressar abandono e ainda terminar em louvor comunitário."],
["Pastor, hóspede e Rei","Salmos 23–24",23,24,"Deus é Pastor que guia e anfitrião que acolhe; o Rei da glória entra em seu domínio santo.","Cuidado pessoal e soberania universal se encontram na adoração."],
["Ensina-me o teu caminho","Salmos 25–27",25,27,"Confissão, pedido de direção e desejo de contemplar Deus formam uma espiritualidade de aprendizado e coragem.","Esperar em Deus inclui pedir perdão, direção e um coração firme."],
["Da súplica à dança","Salmos 28–30",28,30,"Pedidos por socorro dão lugar ao louvor pelo poder de Deus e à gratidão de quem foi tirado do pranto.","A celebração lembra a dor atravessada em vez de apagá-la."]
]],
["psalms-u05","Confissão e esperança","Salmos 31–41: perdão, espera e cuidado",31,41,[
["Em tuas mãos","Salmos 31–32",31,32,"O refúgio em Deus acompanha a alegria do perdão recebido após o peso do silêncio e da culpa.","Confessar abre espaço para verdade, proteção e novo caminho."],
["Louvor e temor","Salmos 33–34",33,34,"A comunidade louva o Criador soberano, e o testemunho convida a provar que o Senhor é bom.","Temor de Deus forma gratidão, verdade e cuidado com a fala."],
["O justo em um mundo injusto","Salmos 35–37",35,37,"Lamentos contra perseguidores culminam no chamado a não invejar malfeitores, mas esperar e praticar o bem.","A espera bíblica é ativa: recusa inveja e persevera na justiça."],
["Fragilidade e cuidado do pobre","Salmos 38–41",38,41,"Doença, culpa e traição aparecem em orações vulneráveis; o primeiro livro termina chamando feliz quem considera o necessitado.","Espiritualidade madura inclui corpo, relações e compaixão social."]
]],
["psalms-u06","Sede de Deus entre as nações","Salmos 42–50: ausência, reino e culto verdadeiro",42,50,[
["Por que estás abatida?","Salmos 42–43",42,43,"A alma sedenta conversa consigo mesma entre lembrança, abatimento e esperança de voltar à presença de Deus.","Esperança pode ser repetida antes que as emoções mudem."],
["Derrota e cântico real","Salmos 44–45",44,45,"A comunidade lamenta uma derrota que não consegue explicar, seguida por um cântico de casamento real.","O Saltério preserva tensão entre dor nacional e esperança no rei."],
["Deus é nosso refúgio","Salmos 46–48",46,48,"Em meio ao caos, Deus é refúgio, reina sobre as nações e torna Sião sinal de sua presença.","Segurança não está nos muros, mas no Deus presente com seu povo."],
["Riqueza e culto julgados","Salmos 49–50",49,50,"A riqueza não resgata ninguém da morte, e Deus confronta culto formal separado de gratidão e obediência.","Dinheiro e ritual não podem comprar vida nem substituir fidelidade."]
]],
["psalms-u07","Um coração renovado","Salmos 51–60: arrependimento e refúgio",51,60,[
["Cria em mim um coração puro","Salmos 51–52",51,52,"A confissão pede limpeza e espírito renovado, contrastando com a arrogância de quem confia na maldade.","Arrependimento busca transformação interior, não apenas alívio das consequências."],
["Quando Deus parece ausente","Salmos 53–55",53,55,"Corrupção, ameaça e traição levam o orante a lançar seu fardo sobre Deus.","A dor causada por alguém próximo pode ser nomeada diante de Deus."],
["Lágrimas contadas","Salmos 56–58",56,58,"Medo e perseguição são enfrentados pela confiança de que Deus conhece as lágrimas e julga com justiça.","Coragem não é ausência de medo, mas confiança dentro dele."],
["Cânticos em território hostil","Salmos 59–60",59,60,"O salmista pede livramento de inimigos e a comunidade lamenta derrota, buscando restauração.","Orações de conflito precisam ser lidas no contexto antigo e não como licença para violência cristã."]
]],
["psalms-u08","Rocha mais alta","Salmos 61–70: espera, alegria e socorro",61,70,[
["Leva-me à rocha","Salmos 61–62",61,62,"Longe e enfraquecido, o orante pede abrigo e aprende a esperar silenciosamente em Deus.","Poder e riqueza não merecem a confiança que pertence a Deus."],
["Sede e louvor","Salmos 63–65",63,65,"A busca por Deus no deserto se abre em louvor, perdão e gratidão pela terra regada.","Desejo espiritual e gratidão pela criação podem habitar a mesma oração."],
["Venham e vejam","Salmos 66–68",66,68,"A comunidade narra livramentos e pede que a bênção alcance as nações; Deus é Pai dos órfãos e defensor das viúvas.","Louvor missionário inclui cuidado concreto com vulneráveis."],
["O zelo e o pedido urgente","Salmos 69–70",69,70,"O sofrimento por causa do zelo aparece em linguagem intensa, e o pedido final reduz-se a um urgente vem depressa.","Deus acolhe tanto orações extensas quanto clamores breves."]
]],
["psalms-u09","Da crise ao santuário","Salmos 71–80: memória e restauração",71,80,[
["Fé até a velhice","Salmos 71–72",71,72,"Uma oração pede amparo na velhice e o cântico por Salomão descreve um rei que defende pobres e necessitados.","Legado fiel une testemunho entre gerações e justiça pública."],
["Quase tropecei","Salmos 73–74",73,74,"A inveja dos arrogantes muda quando o salmista entra no santuário; depois, a comunidade lamenta a devastação do lugar santo.","Adoração reorganiza a percepção sem negar perdas históricas."],
["Deus julga com justiça","Salmos 75–77",75,77,"Deus abate orgulho, mas a angústia ainda pergunta se sua misericórdia terminou e encontra apoio na memória do êxodo.","Recordar atos de Deus sustenta a fé quando respostas imediatas faltam."],
["Conte à próxima geração","Salmos 78–80",78,80,"A história de Israel é recontada com rebeliões e graça, seguida por lamento e refrão: restaura-nos.","Memória honesta prepara novas gerações melhor que uma história idealizada."]
]],
["psalms-u10","Ouvir hoje","Salmos 81–90: aliança, justiça e eternidade",81,90,[
["Se meu povo ouvisse","Salmos 81–82",81,82,"A festa recorda libertação e lamenta a recusa em ouvir; Deus julga governantes que favorecem injustos.","Escuta da aliança deve produzir defesa do fraco e do órfão."],
["Paz, justiça e presença","Salmos 83–85",83,85,"A ameaça das nações é levada a Deus, enquanto o peregrino deseja sua casa e a restauração aproxima justiça e paz.","A paz bíblica não ignora justiça nem a presença de Deus."],
["Ensina-me o teu caminho","Salmos 86–88",86,88,"Orações pedem coração indiviso e celebram Sião entre os povos, mas o Salmo 88 termina na escuridão sem resolução.","A Bíblia preserva lamentos que não alcançam alívio imediato."],
["De eternidade a eternidade","Salmos 89–90",89,90,"A crise da promessa davídica encontra a oração de Moisés sobre a eternidade de Deus e a brevidade humana.","Contar os dias conduz à sabedoria e ao pedido de que Deus confirme nosso trabalho."]
]],
["psalms-u11","O Senhor reina","Salmos 91–100: proteção, justiça e adoração",91,100,[
["Abrigo do Altíssimo","Salmos 91–92",91,92,"A proteção divina é celebrada sem oferecer licença para testar Deus; o justo floresce para anunciar sua fidelidade.","Promessas de proteção devem formar confiança, não presunção."],
["Mais poderoso que as águas","Salmos 93–95",93,95,"Salmos de reinado proclamam Deus acima do caos e convidam à adoração, advertindo para não endurecer o coração hoje.","Louvor verdadeiro inclui escuta presente e perseverança."],
["Cantai ao Senhor","Salmos 96–98",96,98,"Toda a terra é chamada a cantar porque Deus vem julgar com justiça e fidelidade.","Missão e adoração anunciam boas-novas a todos os povos."],
["Santo e bom","Salmos 99–100",99,100,"O Rei santo ama a justiça, e o povo entra em sua presença com gratidão porque pertence ao Pastor.","Santidade e bondade fundamentam reverência alegre."]
]],
["psalms-u12","Misericórdia que permanece","Salmos 101–110: governo, fragilidade e Messias",101,110,[
["Integridade dentro de casa","Salmos 101–102",101,102,"O rei promete governar com integridade, seguido pela oração de um aflito cuja força se consumiu.","Responsabilidade pública e vulnerabilidade pessoal aparecem lado a lado."],
["Bendize, ó minha alma","Salmos 103–104",103,104,"O perdão e a compaixão são celebrados junto ao cuidado de Deus por toda a criação.","Gratidão lembra benefícios recebidos e amplia atenção ao mundo criado."],
["Lembrai e dai graças","Salmos 105–106",105,106,"Dois salmos históricos recordam fidelidade divina e repetidas rebeliões humanas.","Memória comunitária precisa celebrar graça e confessar fracassos."],
["Libertos para contar","Salmos 107–108",107,108,"Pessoas em diferentes perigos clamam e são libertas; a comunidade é chamada a considerar o amor leal de Deus.","Testemunhos diversos se unem em gratidão pública."],
["O Rei e Sacerdote","Salmos 109–110",109,110,"Um lamento imprecativo entrega acusação a Deus, e o Salmo 110 anuncia governo real e sacerdotal retomado no Novo Testamento.","Textos difíceis exigem contexto; a esperança messiânica não autoriza vingança pessoal."]
]],
["psalms-u13","Aleluia e Palavra","Salmos 111–120: sabedoria, Páscoa e peregrinação",111,120,[
["Temor e louvor","Salmos 111–113",111,113,"As obras de Deus conduzem ao temor que inicia a sabedoria, e o Senhor exaltado se inclina para levantar o pobre.","Grandeza divina se revela também em cuidado com quem está no pó."],
["Do êxodo à gratidão","Salmos 114–116",114,116,"O êxodo mostra a criação respondendo ao Libertador; ídolos são impotentes e o orante agradece por livramento pessoal.","O Deus vivo ouve, age e merece amor, ao contrário dos ídolos fabricados."],
["A pedra rejeitada","Salmos 117–118",117,118,"O salmo mais curto convoca as nações, e o seguinte celebra amor leal, vitória e a pedra rejeitada tornada principal.","A comunidade cristã lê a pedra e a entrada festiva à luz de Jesus."],
["Amor pela instrução","Salmos 119–120",119,120,"O grande poema alfabético celebra a Palavra em aflição; o primeiro cântico de peregrinação pede paz entre pessoas mentirosas.","Amar a Escritura prepara o peregrino para viver com verdade."]
]],
["psalms-u14","Cânticos de peregrinação","Salmos 121–135: subida, comunidade e bênção",121,135,[
["Socorro e alegria de subir","Salmos 121–124",121,124,"O peregrino recebe cuidado no caminho, alegra-se com Jerusalém e reconhece que escapou porque Deus estava com seu povo.","Peregrinação une proteção pessoal, culto comunitário e gratidão."],
["Como o monte Sião","Salmos 125–128",125,128,"Confiança, restauração, trabalho e família são apresentados como dons sob o temor do Senhor.","Bênção não é fórmula de prosperidade, mas vida recebida e compartilhada."],
["Das profundezas","Salmos 129–132",129,132,"Memórias de opressão levam ao clamor por redenção; humildade e promessa davídica orientam a espera.","Esperar no Senhor combina confissão, quietude e esperança comunitária."],
["Unidade e louvor","Salmos 133–135",133,135,"A união fraterna é comparada a óleo e orvalho, e os servos do templo convocam Israel ao louvor.","Comunhão é bênção preciosa, não uniformidade imposta."]
]],
["psalms-u15","Grande aleluia","Salmos 136–150: exílio, confiança e louvor final",136,150,[
["Seu amor dura para sempre","Salmos 136–139",136,139,"O refrão de amor leal relembra a história; o exílio lamenta Sião, e a oração reconhece que Deus conhece profundamente cada pessoa.","Memória, dor e autoconhecimento podem ser levados ao Deus de amor persistente."],
["Livra-me do mal","Salmos 140–142",140,142,"Perseguição e isolamento produzem pedidos urgentes para que Deus guarde a fala e ouça quem não encontra refúgio humano.","A oração oferece abrigo sem transformar sofrimento em licença para revidar."],
["Ensina-me e sustenta-me","Salmos 143–145",143,145,"O servo pede direção, reconhece a fragilidade humana e chega ao louvor do reino compassivo de Deus.","Dependência diária floresce em testemunho entre gerações."],
["Tudo quanto respira","Salmos 146–150",146,150,"Os aleluias finais recusam confiança em príncipes, celebram o Criador que faz justiça e convocam toda a criação ao louvor.","O Saltério termina orientando cada respiração para a adoração."]
]]
];

function seed([id,title,subtitle,start,end,topics]:PsalmUnit):HistoricalUnitSeed{
  return {id,title,subtitle,chapters:Array.from({length:end-start+1},(_,i)=>start+i),lessons:topics.map((topic,index)=>{
    const [lessonTitle,label,chapterStart,chapterEnd,teaching,formation]=topic;
    const alternatives=topics.filter((_,i)=>i!==index).map((item)=>item[0]);
    const [d1,d2,d3]=alternatives;
    return {
      title:lessonTitle,
      reference:[label,chapterStart,1,chapterEnd],
      concept:["psalms-"+id+"-c"+String(index+1).padStart(2,"0"),lessonTitle],
      teaching,
      formation,
      question:["Qual é a ênfase central de "+label+"?",lessonTitle,d1,d2,d3,teaching],
      fill:["A seção estudada destaca ",lessonTitle,".",d1,d2,d3,formation]
    };
  })};
}

export const psalmsExpandedUnits=buildHistoricalUnits("psalms","Salmos",units.map(seed));
