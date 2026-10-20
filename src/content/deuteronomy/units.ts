import {
  buildPentateuchUnits,
  type PentateuchUnitSeed
} from "../pentateuch/buildPentateuchUnits";

const seeds: PentateuchUnitSeed[] = [
  {
    id: "deuteronomy-u01",
    title: "Lembrar para avançar",
    subtitle: "Moisés relembra a jornada em Deuteronômio 1–4",
    chapters: [1, 2, 3, 4],
    lessons: [
      {
        title: "O medo em Cades",
        subtitle: "Liderança compartilhada e a recusa da terra",
        reference: ["Deuteronômio 1", 1, 1, 1, 46],
        concept: ["deut-kadesh-memory", "Memória do medo e da incredulidade"],
        teaching: "Moisés relembra a nomeação de líderes e o envio dos espias. Apesar da boa terra, o povo interpreta a jornada como hostilidade de Deus e se recusa a subir. A geração sofre a consequência de sua incredulidade.",
        application: "Memória espiritual não serve para nostalgia, mas para aprender. Recontar fracassos com honestidade ajuda a nova geração a reconhecer como medo distorce o caráter de Deus.",
        keyPoints: ["A liderança foi compartilhada", "O medo reinterpretou a bondade de Deus"],
        quiz: ["Como o povo interpretou a saída do Egito durante a crise?", ["Como amor de Deus", "Como se Deus os odiasse", "Como plano de Josué", "Como vitória de Faraó"], 1, "Deuteronômio 1:27 expõe a leitura distorcida produzida pelo medo."],
        fill: ["A memória dos erros deveria formar a nova", ".", ["geração", "pirâmide", "fronteira", "moeda"], 0, "Moisés ensina quem não viveu diretamente todos os acontecimentos."]
      },
      {
        title: "Deus também conduz outros povos",
        subtitle: "Edom, Moabe, Amom e os limites da conquista",
        reference: ["Deuteronômio 2", 2, 1, 2, 37],
        concept: ["deut-nations-boundaries", "Providência e limites entre povos"],
        teaching: "Israel recebe ordem para não tomar as terras dadas a Edom, Moabe e Amom. A narrativa reconhece que outros povos também possuem histórias, territórios e movimentos providenciais antes da vitória sobre Seom.",
        application: "Eleição não significa que Deus só age na história de um grupo. Limites dados por Deus confrontam a ideia de que promessa autoriza expansão sem restrição.",
        keyPoints: ["Israel deve respeitar territórios de parentes", "A providência alcança histórias além de Israel"],
        quiz: ["Que ordem Israel recebeu sobre Edom?", ["Conquistar tudo", "Não contender pela terra dada aos descendentes de Esaú", "Destruir suas cidades", "Tomar água sem pagar"], 1, "Deuteronômio 2 limita Israel e manda comprar alimento e água."],
        fill: ["A promessa não elimina os", "estabelecidos por Deus.", ["limites", "caminhos", "rios", "nomes"], 0, "Israel não recebe autorização indiscriminada sobre qualquer território."]
      },
      {
        title: "A obra continua sem Moisés",
        subtitle: "Vitórias, repartição e Josué encorajado",
        reference: ["Deuteronômio 3", 3, 1, 3, 29],
        concept: ["deut-moses-transition", "Transição de liderança e continuidade"],
        teaching: "Moisés relembra vitórias a leste, distribui territórios e reforça o compromisso das tribos orientais. Ele pede para atravessar o Jordão, mas recebe ordem de preparar e fortalecer Josué.",
        application: "Líderes fiéis também encontram limites. Maturidade inclui investir na continuidade da missão quando outra pessoa conduzirá a próxima etapa.",
        keyPoints: ["As tribos orientais mantêm compromisso coletivo", "Moisés deve fortalecer Josué"],
        quiz: ["Que tarefa Moisés recebe em relação a Josué?", ["Escondê-lo", "Encorajá-lo e fortalecê-lo", "Enviá-lo ao Egito", "Retirar sua autoridade"], 1, "Deuteronômio 3:28 prepara Josué para conduzir o povo."],
        fill: ["A missão de Deus é maior que um único", ".", ["líder", "rio", "exército", "livro"], 0, "A sucessão mostra continuidade além da vida ministerial de Moisés."]
      },
      {
        title: "Guardar e ensinar",
        subtitle: "Uma sabedoria vivida diante das nações",
        reference: ["Deuteronômio 4", 4, 1, 4, 49],
        concept: ["deut-torah-witness", "Obediência, ensino e testemunho"],
        teaching: "Israel deve ouvir, praticar e não acrescentar nem retirar da instrução. As leis seriam testemunho de sabedoria diante das nações. Como não viu forma alguma no Horebe, o povo não deve fabricar imagens de Deus.",
        application: "Verdade recebida exige prática e transmissão às próximas gerações. Deus não pode ser reduzido a objeto manipulável; revelação produz reverência, justiça e testemunho.",
        keyPoints: ["Ouvir inclui praticar e ensinar", "Deus não é reduzido a uma imagem"],
        quiz: ["O que as nações reconheceriam ao observar as leis praticadas?", ["Fraqueza militar", "Sabedoria e entendimento", "Riqueza egípcia", "Ausência de Deus"], 1, "Deuteronômio 4 relaciona a vida justa de Israel a testemunho público."],
        fill: ["Israel deveria ensinar as palavras aos filhos e aos", ".", ["netos", "inimigos apenas", "reis egípcios", "mercadores"], 0, "A memória da aliança atravessa gerações."]
      }
    ]
  },
  {
    id: "deuteronomy-u02",
    title: "Amar de todo o coração",
    subtitle: "Mandamentos, Shemá e graça em Deuteronômio 5–11",
    chapters: [5, 6, 7, 8, 9, 10, 11],
    lessons: [
      {
        title: "A aliança renovada",
        subtitle: "As Dez Palavras para a nova geração",
        reference: ["Deuteronômio 5", 5, 1, 5, 33],
        concept: ["deut-ten-words", "Mandamentos e liberdade"],
        teaching: "Moisés repete os Dez Mandamentos à geração que entrará na terra. O sábado é fundamentado na memória da escravidão: servos e estrangeiros também descansam porque Israel foi libertado.",
        application: "A obediência nasce da graça que liberta e forma relações. Descanso não é luxo de quem possui poder; é proteção contra reproduzir a lógica de Faraó.",
        keyPoints: ["A nova geração assume a aliança", "O sábado inclui trabalhadores e estrangeiros"],
        quiz: ["Que razão Deuteronômio dá para o sábado?", ["A riqueza de Canaã", "A memória da escravidão e libertação", "O desejo de Faraó", "A falta de colheita"], 1, "Deuteronômio 5 liga o descanso à experiência de ter sido escravo no Egito."],
        fill: ["Quem foi liberto não deve reproduzir a lógica da", ".", ["escravidão", "festa", "aliança", "memória"], 0, "O descanso compartilhado transforma memória em prática social."]
      },
      {
        title: "Ouve, Israel",
        subtitle: "Amor inteiro e ensino no cotidiano",
        reference: ["Deuteronômio 6", 6, 1, 6, 25],
        concept: ["deut-shema", "Shemá e amor integral"],
        teaching: "O Shemá chama Israel a ouvir que o SENHOR é único e a amá-lo de todo coração, alma e força. As palavras devem estar no coração, ser ensinadas aos filhos e acompanhar casa, caminho, manhã e noite.",
        application: "Formação espiritual acontece por repetição significativa na vida comum, não apenas em encontros religiosos. Amor a Deus integra afeto, decisão, corpo, recursos e memória.",
        keyPoints: ["Ouvir conduz a amar e obedecer", "A fé é ensinada no cotidiano"],
        quiz: ["Onde as palavras deveriam estar antes de serem ensinadas?", ["Somente em pedras", "No coração", "No palácio", "No Egito"], 1, "Deuteronômio 6:6 coloca a palavra no coração de quem ensina."],
        fill: ["Amarás o SENHOR de todo o teu", ".", ["coração", "campo", "exército", "ouro"], 0, "O mandamento convoca a pessoa inteira à lealdade."]
      },
      {
        title: "Escolhidos pela graça",
        subtitle: "Eleição, memória e o perigo do orgulho",
        reference: ["Deuteronômio 7–9", 7, 1, 9, 29],
        concept: ["deut-gracious-election", "Eleição graciosa e humildade"],
        teaching: "Israel não foi escolhido por ser mais numeroso nem recebe a terra por justiça própria. Deus ama por fidelidade à promessa. O maná ensinou dependência, e a memória do bezerro de ouro impede orgulho espiritual.",
        application: "Eleição é vocação graciosa, não certificado de superioridade. Prosperidade pode produzir esquecimento; lembrar dependência e fracasso protege gratidão e responsabilidade.",
        keyPoints: ["A escolha não se baseia em grandeza", "A terra não é prêmio por justiça própria"],
        quiz: ["Segundo Deuteronômio 7, por que Deus escolheu Israel?", ["Porque era o maior povo", "Por amor e fidelidade à promessa", "Porque nunca pecou", "Porque possuía exército superior"], 1, "O texto nega mérito numérico e fundamenta a escolha no amor fiel de Deus."],
        fill: ["Nem só de pão vive o ser humano, mas de toda", "de Deus.", ["palavra", "cidade", "arma", "riqueza"], 0, "A experiência do maná ensinou dependência da palavra divina."]
      },
      {
        title: "Circuncidar o coração",
        subtitle: "Temor, amor e cuidado com o estrangeiro",
        reference: ["Deuteronômio 10–11", 10, 1, 11, 32],
        concept: ["deut-heart-covenant", "Coração transformado e amor obediente"],
        teaching: "Deus pede temor, amor, serviço e obediência para o bem do povo. Circuncidar o coração significa abandonar teimosia. O Deus grande faz justiça ao órfão e à viúva e ama o estrangeiro, portanto Israel também deve amá-lo.",
        application: "Espiritualidade interior produz ética pública. Na tradição wesleyana, graça transforma disposições e capacita amor santo que alcança quem está fora dos círculos de proteção.",
        keyPoints: ["A obediência é para o bem do povo", "Amar Deus inclui amar o estrangeiro"],
        quiz: ["Que razão é dada para amar o estrangeiro?", ["Ele sempre é rico", "Israel também foi estrangeiro no Egito", "Ele não precisa de justiça", "Somente sacerdotes o fariam"], 1, "A memória da vulnerabilidade deve gerar empatia e cuidado."],
        fill: ["Circuncidar o", "significa abandonar a dureza.", ["coração", "campo", "altar", "estandarte"], 0, "Deuteronômio usa linguagem interior para falar de resposta fiel."]
      }
    ]
  },
  {
    id: "deuteronomy-u03",
    title: "Adoração e generosidade",
    subtitle: "Um povo distinto em Deuteronômio 12–16",
    chapters: [12, 13, 14, 15, 16],
    lessons: [
      {
        title: "O lugar da adoração",
        subtitle: "Lealdade, alegria e cuidado com os levitas",
        reference: ["Deuteronômio 12", 12, 1, 12, 32],
        concept: ["deut-central-worship", "Adoração leal e comunitária"],
        teaching: "Israel deve destruir centros idólatras e levar ofertas ao lugar escolhido por Deus. A adoração inclui comer com alegria diante do SENHOR e não abandonar os levitas que não possuem herança territorial.",
        application: "Lealdade de culto não significa individualismo austero. Alegria, partilha e sustento de quem serve fazem parte da resposta comunitária a Deus.",
        keyPoints: ["Israel não deve copiar cultos destrutivos", "A celebração inclui levitas e famílias"],
        quiz: ["Que atitude deveria acompanhar as refeições diante de Deus?", ["Medo de Faraó", "Alegria", "Competição", "Silêncio obrigatório"], 1, "Deuteronômio 12 repete o convite a alegrar-se diante do SENHOR."],
        fill: ["Adoração fiel também cuida de quem", "a comunidade.", ["serve", "explora", "abandona", "conquista"], 0, "O levita não deveria ser desamparado."]
      },
      {
        title: "Discernir lealdades",
        subtitle: "Falsos sinais, alimentação e dízimos",
        reference: ["Deuteronômio 13–14", 13, 1, 14, 29],
        concept: ["deut-discernment-generosity", "Discernimento e generosidade"],
        teaching: "Mesmo um sinal impressionante não valida quem conduz a outros deuses. As leis alimentares marcam identidade, enquanto o dízimo trienal sustenta levita, estrangeiro, órfão e viúva.",
        application: "Experiência espiritual deve ser avaliada pela fidelidade a Deus e por seus frutos. Devoção também se mede pela mesa e pela forma como recursos alcançam pessoas vulneráveis.",
        keyPoints: ["Sinais não substituem discernimento", "Dízimos incluem provisão social"],
        quiz: ["Quem participava do dízimo armazenado nas cidades?", ["Somente reis", "Levita, estrangeiro, órfão e viúva", "Apenas soldados", "Somente proprietários"], 1, "Deuteronômio 14:28–29 liga adoração e cuidado social."],
        fill: ["Um sinal não valida ensino que afasta da", "a Deus.", ["fidelidade", "colheita", "cidade", "música"], 0, "Deuteronômio 13 testa o profeta pela direção de sua lealdade."]
      },
      {
        title: "Mãos abertas",
        subtitle: "Remissão de dívidas e liberdade de servos",
        reference: ["Deuteronômio 15", 15, 1, 15, 23],
        concept: ["deut-open-hand", "Generosidade e libertação econômica"],
        teaching: "No sétimo ano, dívidas são remitidas e servos hebreus libertados com provisão generosa. A proximidade do ano de remissão não deveria endurecer a mão contra o pobre.",
        application: "A lei confronta cálculos que usam regras futuras para negar ajuda presente. Pobreza não é ocasião para culpa automática, mas chamado a abrir mão e criar caminhos de liberdade.",
        keyPoints: ["A dívida não deveria se tornar prisão permanente", "O servo liberto recebe recursos para recomeçar"],
        quiz: ["Como o servo deveria ser enviado ao sair livre?", ["De mãos vazias", "Com provisão generosa", "Com nova dívida", "Para outro senhor"], 1, "Deuteronômio 15 manda suprir liberalmente a pessoa libertada."],
        fill: ["Não endurecerás o coração nem fecharás a", "ao pobre.", ["mão", "porta do templo", "cidade", "memória"], 0, "A imagem da mão aberta resume generosidade ativa."]
      },
      {
        title: "Festas e justiça",
        subtitle: "Memória da libertação e juízes imparciais",
        reference: ["Deuteronômio 16", 16, 1, 16, 22],
        concept: ["deut-festivals-justice", "Celebração inclusiva e justiça"],
        teaching: "Páscoa, Semanas e Tabernáculos celebram a ação de Deus e incluem filhos, servos, levitas e vulneráveis. Juízes devem rejeitar parcialidade e suborno: justiça, somente justiça, deve ser buscada.",
        application: "Celebração que exclui vulneráveis contradiz a memória da libertação. Culto e tribunal são avaliados pelo mesmo Deus que deseja alegria compartilhada e decisões íntegras.",
        keyPoints: ["As festas incluem toda a casa e vulneráveis", "Juízes não aceitam suborno"],
        quiz: ["Que frase resume a tarefa dos juízes?", ["Poder somente poder", "Justiça, somente justiça", "Riqueza acima de tudo", "Vitória a qualquer preço"], 1, "Deuteronômio 16:20 intensifica o chamado a perseguir justiça."],
        fill: ["A alegria das festas deveria ser", ".", ["compartilhada", "secreta", "vendida", "restrita aos ricos"], 0, "A lista de participantes inclui pessoas sem terra e proteção próprias."]
      }
    ]
  },
  {
    id: "deuteronomy-u04",
    title: "Liderança sob a Palavra",
    subtitle: "Reis, profetas, justiça e guerra em Deuteronômio 17–21",
    chapters: [17, 18, 19, 20, 21],
    lessons: [
      {
        title: "O rei que lê",
        subtitle: "Poder limitado pela instrução",
        reference: ["Deuteronômio 17", 17, 1, 17, 20],
        concept: ["deut-king-under-law", "Realeza submetida à Palavra"],
        teaching: "Juízes tratam casos difíceis, e o futuro rei recebe limites: não multiplicar cavalos, esposas ou riqueza, nem levar o povo de volta ao Egito. Ele deve copiar e ler a lei todos os dias.",
        application: "Poder político não fica acima da verdade. A liderança é protegida da arrogância por limites, aprendizagem contínua e memória de que irmãos possuem igual dignidade.",
        keyPoints: ["O rei não está acima da lei", "Leitura constante combate orgulho"],
        quiz: ["O que o rei deveria fazer com uma cópia da lei?", ["Guardá-la sem abrir", "Lê-la todos os dias", "Vendê-la aos sacerdotes", "Levá-la ao Egito"], 1, "A leitura diária deveria ensiná-lo a temer a Deus e não se elevar sobre os irmãos."],
        fill: ["O poder do rei era", "pela aliança.", ["limitado", "absoluto", "secreto", "herdado do Egito"], 0, "Acúmulo militar, econômico e dinástico recebe limites explícitos."]
      },
      {
        title: "Sacerdotes e profetas",
        subtitle: "Sustento, discernimento e a palavra de Deus",
        reference: ["Deuteronômio 18", 18, 1, 18, 22],
        concept: ["deut-prophet-priest", "Ministério e discernimento profético"],
        teaching: "Levitas recebem sustento no serviço. Israel não deve buscar adivinhação, mas ouvir o profeta que Deus levantar. A mensagem profética é testada por fidelidade e verdade, não apenas por pretensão espiritual.",
        application: "Fome por orientação pode abrir espaço à manipulação. Discernimento testa conteúdo, fruto e veracidade, enquanto sustento ministerial não compra autoridade incontestável.",
        keyPoints: ["Práticas de adivinhação são rejeitadas", "Profecia precisa ser discernida"],
        quiz: ["Que sinal revela uma palavra presunçosa segundo o capítulo?", ["Ela é longa", "Não se cumpre", "É dita em público", "Usa poesia"], 1, "Deuteronômio 18:22 afirma que palavra não realizada não veio do SENHOR."],
        fill: ["Pretensão espiritual precisa de", ".", ["discernimento", "medo", "silêncio", "pagamento"], 0, "O povo não deveria aceitar toda voz religiosa sem avaliação."]
      },
      {
        title: "Refúgio e testemunhas",
        subtitle: "Proteção contra vingança e condenação apressada",
        reference: ["Deuteronômio 19", 19, 1, 19, 21],
        concept: ["deut-refuge-witnesses", "Processo justo e verdade"],
        teaching: "Cidades de refúgio protegem quem causa morte sem intenção até que o caso seja examinado. Uma só testemunha não basta para condenar, e falso testemunho recebe consequência correspondente.",
        application: "Justiça exige processo, evidência e distinção de intenção. A urgência por punir não pode substituir investigação, e usar mentira para destruir alguém é violência contra a comunidade.",
        keyPoints: ["Refúgio impede vingança imediata", "Acusação exige testemunhas suficientes"],
        quiz: ["Quantas testemunhas bastavam para condenar alguém por si só?", ["Uma", "Nenhuma testemunha única bastava", "Qualquer criança", "Somente o rei"], 1, "Deuteronômio 19:15 exige duas ou três testemunhas."],
        fill: ["Processo justo protege contra condenação", ".", ["apressada", "verdadeira", "pública", "antiga"], 0, "Refúgio e testemunhas criam espaço para apurar fatos."]
      },
      {
        title: "Guerra com limites",
        subtitle: "Medo, árvores e casos difíceis",
        reference: ["Deuteronômio 20–21", 20, 1, 21, 23],
        concept: ["deut-war-dignity", "Limites da guerra e dignidade humana"],
        teaching: "As leis de guerra pertencem à realidade nacional antiga e incluem dispensas, ofertas de paz em certos conflitos e proteção a árvores frutíferas. Deuteronômio 21 trata mortes não resolvidas, família e dignidade até na punição.",
        application: "Esses textos não autorizam guerra religiosa da igreja. Mesmo dentro de um mundo violento, limites revelam que inimigo, criação e corpo humano não são objetos disponíveis à destruição sem freios.",
        keyPoints: ["A igreja não recebe missão de conquista armada", "Até a guerra antiga recebe limites"],
        quiz: ["Que árvores não deveriam ser destruídas num cerco?", ["Árvores frutíferas", "Todas as árvores", "Somente cedros", "Nenhuma árvore existia"], 0, "Deuteronômio 20:19 distingue árvores que alimentam e proíbe cortá-las."],
        fill: ["A violência antiga não se torna modelo para a missão da", ".", ["igreja", "colheita", "família", "cidade"], 0, "A leitura cristã passa pelo ensino e exemplo de Cristo."]
      }
    ]
  },
  {
    id: "deuteronomy-u05",
    title: "Santidade nas pequenas coisas",
    subtitle: "Vizinho, trabalho e gratidão em Deuteronômio 22–26",
    chapters: [22, 23, 24, 25, 26],
    lessons: [
      {
        title: "Não passar adiante",
        subtitle: "Bens perdidos, segurança e cuidado do próximo",
        reference: ["Deuteronômio 22", 22, 1, 22, 30],
        concept: ["deut-neighbor-care", "Responsabilidade pelo bem do próximo"],
        teaching: "Encontrar animal ou objeto perdido exige devolução, não indiferença. O parapeito no terraço previne acidentes. Outras regras marcam distinções sociais antigas e tratam sexualidade dentro da legislação de Israel.",
        application: "Amor ao próximo inclui agir antes do dano e não fingir que uma necessidade não foi vista. Leis difíceis devem ser lidas com contexto e compromisso inequívoco com segurança e dignidade das vítimas.",
        keyPoints: ["O bem perdido deve ser devolvido", "Prevenção de acidentes é dever moral"],
        quiz: ["Por que construir um parapeito no terraço?", ["Para decorar", "Para evitar culpa por uma queda", "Para guardar ofertas", "Para contar animais"], 1, "Deuteronômio 22:8 transforma segurança doméstica em responsabilidade pelo próximo."],
        fill: ["Não poderás", "o bem perdido do teu irmão.", ["ignorar", "devolver", "guardar", "proteger"], 0, "O texto proíbe passar adiante como se não tivesse visto."]
      },
      {
        title: "Santidade no acampamento",
        subtitle: "Dignidade, fugitivos e compromissos",
        reference: ["Deuteronômio 23", 23, 1, 23, 25],
        concept: ["deut-camp-dignity", "Santidade, acolhimento e responsabilidade"],
        teaching: "Regras sobre assembleia e higiene refletem a organização do acampamento antigo. Um escravo fugitivo não deveria ser devolvido ao senhor nem oprimido. Votos e empréstimos também recebem limites.",
        application: "A proteção do fugitivo contrasta com sistemas que tratam pessoas como propriedade absoluta. Santidade inclui higiene, palavra responsável e abrigo contra exploração.",
        keyPoints: ["O fugitivo não deve ser entregue ao opressor", "Santidade alcança práticas concretas do acampamento"],
        quiz: ["Como Israel deveria tratar o escravo que fugiu para seu meio?", ["Devolvê-lo imediatamente", "Permitir que habitasse sem opressão", "Vendê-lo", "Expulsá-lo ao deserto"], 1, "Deuteronômio 23:15–16 oferece proteção incomum ao fugitivo."],
        fill: ["Santidade inclui proteger quem busca", "da opressão.", ["refúgio", "riqueza", "guerra", "fama"], 0, "A pessoa fugitiva deveria escolher onde morar sem ser maltratada."]
      },
      {
        title: "Salários, penhores e justiça",
        subtitle: "Proteções para quem vive vulnerável",
        reference: ["Deuteronômio 24–25", 24, 1, 25, 19],
        concept: ["deut-worker-justice", "Justiça econômica e dignidade"],
        teaching: "Leis regulam divórcio, penhores, sequestro, salário diário, colheita e tribunais. O trabalhador pobre deve receber no mesmo dia; roupa essencial não pode ser retida, e sobras da colheita ficam para vulneráveis.",
        application: "Deus se importa com prazos, contratos e práticas que parecem pequenas. Justiça não é apenas punir crimes graves; é impedir que poder econômico transforme necessidade em exploração.",
        keyPoints: ["Salário não deve ser retido", "Penhores não podem destruir a sobrevivência"],
        quiz: ["Quando o trabalhador pobre deveria receber seu salário?", ["No fim do ano", "No mesmo dia", "Depois de sete anos", "Somente após a colheita"], 1, "Deuteronômio 24:15 reconhece que sua vida depende daquele pagamento."],
        fill: ["A lei protege o trabalhador contra a", "econômica.", ["exploração", "memória", "festa", "migração"], 0, "Pagamento pontual e limites ao penhor protegem pessoas vulneráveis."]
      },
      {
        title: "Minha história diante de Deus",
        subtitle: "Primícias, dízimos e confissão comunitária",
        reference: ["Deuteronômio 26", 26, 1, 26, 19],
        concept: ["deut-firstfruits-confession", "Gratidão, memória e partilha"],
        teaching: "Ao levar primícias, o israelita recita a história: antepassado peregrino, opressão, clamor, libertação e terra recebida. O dízimo do terceiro ano alcança levita, estrangeiro, órfão e viúva.",
        application: "Gratidão bíblica conta uma história na qual o bem recebido é graça, não conquista isolada. A memória verdadeira abre a mesa e os recursos para outras pessoas.",
        keyPoints: ["A oferta é acompanhada por narrativa", "A partilha inclui pessoas vulneráveis"],
        quiz: ["Que acontecimento central a confissão das primícias recorda?", ["A construção de Babel", "A libertação do Egito", "A coroação de Davi", "O exílio babilônico"], 1, "A fórmula reconta opressão, clamor e libertação antes de celebrar a colheita."],
        fill: ["Gratidão transforma memória em", ".", ["partilha", "orgulho", "segredo", "competição"], 0, "Primícias e dízimos ligam reconhecimento de Deus ao cuidado comunitário."]
      }
    ]
  },
  {
    id: "deuteronomy-u06",
    title: "Escolhe, pois, a vida",
    subtitle: "Renovação, sucessão e esperança em Deuteronômio 27–34",
    chapters: [27, 28, 29, 30, 31, 32, 33, 34],
    lessons: [
      {
        title: "Bênção e advertência",
        subtitle: "A aliança levada a sério",
        reference: ["Deuteronômio 27–28", 27, 1, 28, 68],
        concept: ["deut-blessings-curses", "Consequências da fidelidade e rebelião"],
        teaching: "A lei é escrita e proclamada na entrada da terra. Bênçãos descrevem vida ordenada sob a aliança; maldições retratam a desintegração causada pela rebelião, culminando na reversão do êxodo.",
        application: "Essas bênçãos não oferecem fórmula simples em que todo sofrimento prova pecado pessoal. Elas pertencem à aliança nacional e alertam que escolhas coletivas produzem consequências históricas reais.",
        keyPoints: ["A entrada na terra inclui compromisso público", "A desobediência ameaça reverter a libertação"],
        quiz: ["Qual imagem encerra a longa seção de maldições?", ["Novo jardim", "Retorno ao Egito", "Construção do templo", "Coroação de Josué"], 1, "Deuteronômio 28:68 apresenta o retorno ao Egito como reversão trágica da salvação."],
        fill: ["As bênçãos e maldições pertencem à aliança", "de Israel.", ["nacional", "secreta", "romana", "individual apenas"], 0, "Aplicá-las exige respeitar seu contexto histórico e comunitário."]
      },
      {
        title: "A palavra está perto",
        subtitle: "Coração renovado e escolha da vida",
        reference: ["Deuteronômio 29–30", 29, 1, 30, 20],
        concept: ["deut-choose-life", "Graça restauradora e escolha da vida"],
        teaching: "A aliança inclui a geração presente e futura. Depois de exílio e retorno, Deus promete circuncidar o coração para que o povo ame. A palavra não está distante; vida e morte são colocadas diante de Israel.",
        application: "A graça que transforma o coração não elimina resposta humana; torna possível amar e escolher fielmente. Essa combinação dialoga profundamente com a ênfase wesleyana em graça preveniente e resposta responsável.",
        keyPoints: ["Deus promete transformação interior", "Israel é chamado a escolher a vida"],
        quiz: ["Onde Moisés diz que a palavra está?", ["Além do mar somente", "Perto, na boca e no coração", "Escondida dos líderes", "No Egito"], 1, "Deuteronômio 30:14 afirma acessibilidade para que a palavra seja praticada."],
        fill: ["Escolhe, pois, a", "para que vivas.", ["vida", "riqueza", "guerra", "fama"], 0, "O apelo final une amor, obediência e apego a Deus."]
      },
      {
        title: "Josué e a canção",
        subtitle: "Coragem, leitura pública e testemunho",
        reference: ["Deuteronômio 31–32", 31, 1, 32, 52],
        concept: ["deut-joshua-song", "Sucessão, memória e testemunho"],
        teaching: "Moisés encoraja Josué e entrega a lei para leitura pública regular, incluindo crianças e estrangeiros. A canção testemunha a fidelidade de Deus e a instabilidade do povo, preservando memória para futuras crises.",
        application: "Transição saudável oferece coragem, palavra e práticas de memória ao sucessor. Comunidades não dependem apenas de carisma; precisam de histórias e textos que corrijam esquecimento.",
        keyPoints: ["A lei seria lida a toda a assembleia", "A canção preserva memória para o futuro"],
        quiz: ["Quem deveria ouvir a leitura pública da lei?", ["Somente sacerdotes", "Homens, mulheres, crianças e estrangeiros", "Somente guerreiros", "Apenas Josué"], 1, "Deuteronômio 31:12 inclui toda a comunidade na aprendizagem."],
        fill: ["Sê forte e", "é a palavra dada a Josué.", ["corajoso", "rico", "silencioso", "severo"], 0, "A coragem se apoia na presença de Deus que acompanha a missão."]
      },
      {
        title: "Bênção e morte de Moisés",
        subtitle: "O fim de uma vida e a continuidade da promessa",
        reference: ["Deuteronômio 33–34", 33, 1, 34, 12],
        concept: ["deut-moses-finale", "Bênção, legado e continuidade"],
        teaching: "Moisés abençoa as tribos, contempla a terra do monte Nebo e morre. Deus o sepulta, o povo lamenta e Josué assume cheio de sabedoria. O livro honra a singularidade de Moisés sem dizer que a promessa morreu com ele.",
        application: "Legado fiel abençoa pessoas e prepara continuidade. O luto é legítimo, mas a missão de Deus segue por novas mãos; nenhum líder humano é o centro definitivo da história.",
        keyPoints: ["Israel lamenta Moisés", "Josué assume preparado para liderar"],
        quiz: ["Quem sucedeu Moisés na liderança?", ["Arão", "Josué", "Calebe", "Eleazar"], 1, "Deuteronômio 34:9 afirma que Josué estava cheio de espírito de sabedoria."],
        fill: ["A morte de um líder não encerra a", "de Deus.", ["promessa", "memória", "terra", "família"], 0, "A narrativa termina com transição e expectativa, não com abandono."]
      }
    ]
  }
];

export const deuteronomyUnits = buildPentateuchUnits("deuteronomy", "Deuteronômio", seeds);
