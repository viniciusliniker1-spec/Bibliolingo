import { buildExpansionUnits, chapterRange, type ExpansionTopic, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
type T=[string,string,number,number,string]; type U=[string,string,string,number,number,string,[T,T,T,T]];
const data:U[]=[
["isaiah-u02","O Santo chama um povo","Pecado, justiça e vocação em Isaías 1–6",1,6,"Santidade verdadeira produz arrependimento, justiça e missão.",[
["Culto e justiça","Isaías 1",1,1,"Deus rejeita celebrações que convivem com violência e chama Jerusalém a defender o vulnerável."],
["A montanha e o dia do Senhor","Isaías 2",2,2,"Nações aprenderão os caminhos de Deus e transformarão armas, enquanto orgulho humano será abatido."],
["A vinha sem justiça","Isaías 3–5",3,5,"Liderança corrupta e ganância produzem frutos amargos na vinha cuidadosamente plantada por Deus."],
["Santo, santo, santo","Isaías 6",6,6,"Isaías vê o Rei, confessa impureza, recebe purificação e responde ao chamado profético."]
]],
["isaiah-u03","Emanuel e o reino de paz","A crise siro-efraimita em Isaías 7–12",7,12,"Promessas de presença e governo justo confrontam medo e alianças infiéis.",[
["O sinal de Emanuel","Isaías 7",7,7,"Acaz teme inimigos e recebe um sinal de que Deus está com seu povo, mas prefere segurança política."],
["Luz na Galileia","Isaías 8–9",8,9,"Trevas de invasão são contrastadas com a esperança de uma criança cujo governo traz justiça e paz."],
["A Assíria e o remanescente","Isaías 10",10,10,"O império usado como instrumento torna-se responsável por arrogância, e um remanescente retornará."],
["O rebento de Jessé","Isaías 11–12",11,12,"O rei cheio do Espírito julga com justiça, reúne dispersos e conduz a criação à paz."]
]],
["isaiah-u04","Oráculos contra as nações","Impérios, cidades e orgulho em Isaías 13–23",13,23,"Deus julga violência e arrogância dentro e fora de Judá.",[
["Babilônia e a queda do opressor","Isaías 13–14",13,14,"A potência orgulhosa que aterroriza povos também cairá sob o governo de Deus."],
["Moabe, Damasco e Cuxe","Isaías 15–18",15,18,"Lamento e juízo alcançam povos vizinhos sem apagar compaixão pelas vítimas da guerra."],
["Egito e caminhos entre povos","Isaías 19–20",19,20,"O Egito é confrontado, mas a visão termina imaginando Egito, Assíria e Israel adorando juntos."],
["Babilônia, Edom e Tiro","Isaías 21–23",21,23,"Sentinelas anunciam quedas e expõem a fragilidade de comércio, prazer e poder."]
]],
["isaiah-u05","A cidade forte e o banquete","Juízo cósmico e esperança em Isaías 24–27",24,27,"O chamado pequeno apocalipse de Isaías une crise universal e esperança de restauração.",[
["A terra devastada","Isaías 24",24,24,"A violência da aliança quebrada atinge terra, cidade e habitantes, sem deixar elite protegida."],
["Um banquete para todos","Isaías 25",25,25,"Deus prepara banquete para os povos, remove o véu e promete destruir a morte."],
["Confiança na rocha eterna","Isaías 26",26,26,"Um cântico celebra cidade segura e paz para a mente firme, enquanto espera justiça."],
["Leviatã e a vinha restaurada","Isaías 27",27,27,"O caos é vencido, a vinha volta a ser cuidada e dispersos são reunidos para adorar."]
]],
["isaiah-u06","A falsa segurança é removida","Ais, caminho santo e restauração em Isaías 28–35",28,35,"Judá é chamado a trocar alianças manipuladoras por confiança e justiça.",[
["Pedra angular em Sião","Isaías 28",28,28,"Líderes embriagados e alianças com a morte contrastam com a pedra segura colocada por Deus."],
["Lábios e coração","Isaías 29",29,29,"Religião decorada esconde coração distante, mas Deus promete que humildes voltarão a alegrar-se."],
["Ai dos que descem ao Egito","Isaías 30–31",30,31,"Cavalos egípcios parecem segurança, porém o Santo chama o povo a descanso e arrependimento."],
["Deserto florescendo","Isaías 32–35",32,35,"Justiça, Espírito e caminho santo transformam deserto em rota de retorno para os resgatados."]
]],
["isaiah-u07","Ezequias entre Assíria e Babilônia","Narrativa histórica em Isaías 36–39",36,39,"A confiança vence uma ameaça, mas o orgulho prepara outra.",[
["A propaganda de Rabsaqué","Isaías 36",36,36,"O oficial assírio distorce fatos e usa medo para separar Jerusalém de sua confiança em Deus."],
["A carta estendida diante de Deus","Isaías 37",37,37,"Ezequias ora, Isaías responde e a cidade é poupada da arrogância de Senaqueribe."],
["Doença, oração e sinal","Isaías 38",38,38,"Ezequias lamenta sua enfermidade, recebe mais anos e transforma recuperação em cântico."],
["Tesouros mostrados","Isaías 39",39,39,"O rei exibe sua riqueza aos babilônios e ouve que tesouros e descendentes serão levados."]
]],
["isaiah-u08","Consolai o meu povo","Novo êxodo e soberania em Isaías 40–48",40,48,"O Criador prepara retorno do exílio e desmascara ídolos incapazes.",[
["Preparai o caminho","Isaías 40",40,40,"A voz anuncia consolo, e o Criador que mede os céus fortalece cansados que nele esperam."],
["Servo e justiça às nações","Isaías 41–42",41,42,"Deus sustenta seu servo para estabelecer justiça sem esmagar a cana quebrada."],
["Criado, resgatado e chamado pelo nome","Isaías 43–45",43,45,"Israel é chamado a testemunhar, e Ciro é usado para abrir caminho mesmo sem conhecer plenamente Deus."],
["Sai da Babilônia","Isaías 46–48",46,48,"Ídolos precisam ser carregados, mas Deus carrega seu povo e convoca uma saída renovada."]
]],
["isaiah-u09","O Servo e a boa notícia","Missão, sofrimento e aliança em Isaías 49–55",49,55,"A restauração de Israel torna-se luz para as nações por meio do Servo.",[
["Luz para as nações","Isaías 49",49,49,"A missão do Servo alcança as extremidades e consola Sião que se sentia esquecida."],
["O discípulo que sofre","Isaías 50–52",50,52,"O Servo ouve como discípulo, enfrenta rejeição e anuncia boas-novas do reinado de Deus."],
["Ferido por nossas transgressões","Isaías 53",53,53,"O cântico apresenta sofrimento inocente e restauração, lidos pelos cristãos à luz de Jesus."],
["Vinde às águas","Isaías 54–55",54,55,"A aliança de paz e o convite gratuito chamam sedentos a receber vida e retornar a Deus."]
]],
["isaiah-u10","Jejum, sábado e comunidade","Justiça pós-exílica em Isaías 56–59",56,59,"Restauração verdadeira acolhe fiéis e transforma práticas sociais.",[
["Casa de oração para todos","Isaías 56",56,56,"Estrangeiros e eunucos fiéis recebem lugar e nome na comunidade de adoração."],
["Consolo para o contrito","Isaías 57",57,57,"Idolatria é exposta, mas o Alto e Sublime habita também com quem possui coração humilde."],
["O jejum que Deus escolhe","Isaías 58",58,58,"Culto verdadeiro solta opressões, reparte pão e transforma ruínas em caminhos habitáveis."],
["Pecados fazem separação","Isaías 59",59,59,"Mentira e violência destroem justiça, e Deus intervém quando não encontra quem a estabeleça."]
]],
["isaiah-u11","Levanta-te e resplandece","Glória, boas-novas e novo nome em Isaías 60–62",60,62,"Sião restaurada torna-se sinal de luz, justiça e alegria entre as nações.",[
["Nações caminham para a luz","Isaías 60",60,60,"A glória de Deus nasce sobre Sião e povos trazem recursos para uma cidade antes abandonada."],
["Boas-novas aos quebrantados","Isaías 61",61,61,"O ungido anuncia liberdade, consolo e reconstrução; Jesus retoma o texto em Nazaré."],
["Vestes de salvação","Isaías 61:10–11",61,61,"Justiça brota como jardim e a comunidade responde à ação divina com alegria."],
["Um novo nome","Isaías 62",62,62,"Sião não será chamada abandonada; sentinelas persistem até que sua justiça resplandeça."]
]],
["isaiah-u12","O Senhor vem e faz novas todas as coisas","Juízo, oração e nova criação em Isaías 63–66",63,66,"O livro termina entre memória da violência, intercessão e esperança cósmica.",[
["O guerreiro e a misericórdia lembrada","Isaías 63",63,63,"A imagem severa do juízo conduz à recordação do amor leal e da presença divina na história."],
["Ah, se fendesses os céus","Isaías 64",64,64,"A comunidade confessa pecado e pede que o Oleiro não abandone a obra de suas mãos."],
["Encontrado por quem não buscava","Isaías 65",65,65,"Juízo e graça culminam na promessa de novos céus, nova terra e vida restaurada."],
["Toda carne virá adorar","Isaías 66",66,66,"Deus rejeita culto hipócrita, consola como mãe e reúne nações para ver sua glória."]
]]
];
const units:ExpansionUnit[]=data.map(([id,title,subtitle,start,end,formation,topics])=>({id,title,subtitle,chapters:chapterRange(start,end),topics:topics.map(([t,l,s,e,i])=>[t,l,s,e,i,formation] as ExpansionTopic) as ExpansionUnit["topics"]}));
export const isaiahExpandedUnits=buildExpansionUnits("isaiah","Isaías",units);
