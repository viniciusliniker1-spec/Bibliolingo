import {
  buildPentateuchUnits,
  type PentateuchUnitSeed
} from "../pentateuch/buildPentateuchUnits";

const seeds: PentateuchUnitSeed[] = [
  {
    id: "numbers-u01",
    title: "Um povo organizado",
    subtitle: "Censo, acampamento e bênção em Números 1–6",
    chapters: [1, 2, 3, 4, 5, 6],
    lessons: [
      {
        title: "Contados para a jornada",
        subtitle: "O primeiro censo e a responsabilidade coletiva",
        reference: ["Números 1", 1, 1, 1, 54],
        concept: ["num-first-census", "Censo e responsabilidade comunitária"],
        teaching: "No Sinai, Israel conta os homens aptos para o serviço militar por tribos e famílias. Os levitas ficam fora dessa contagem porque recebem responsabilidade específica sobre o tabernáculo.",
        application: "O censo não reduz pessoas a números; organiza responsabilidades numa comunidade prestes a caminhar. Estrutura deve servir à missão e ao cuidado, não ao controle impessoal.",
        keyPoints: ["A contagem é organizada por tribos", "Os levitas recebem outra responsabilidade"],
        quiz: ["Por que os levitas não entraram no censo militar?", ["Eram estrangeiros", "Foram separados para o serviço do tabernáculo", "Já estavam em Canaã", "Não tinham famílias"], 1, "Números 1 reserva a tribo de Levi para guardar e transportar o santuário."],
        fill: ["O censo preparava o povo para a", "pelo deserto.", ["jornada", "volta ao Egito", "monarquia", "colheita"], 0, "A organização antecede a partida do Sinai."]
      },
      {
        title: "Ao redor da presença",
        subtitle: "A ordem do acampamento",
        reference: ["Números 2", 2, 1, 2, 34],
        concept: ["num-camp-order", "Presença de Deus no centro"],
        teaching: "As tribos acampam em grupos ao redor da tenda do encontro, cada uma sob seu estandarte. O tabernáculo permanece no centro, e a ordem de marcha preserva identidade e coordenação.",
        application: "A disposição comunica teologia: a presença de Deus, não força militar ou líder humano, ocupa o centro. Comunidades saudáveis organizam sua vida ao redor do que confessam como essencial.",
        keyPoints: ["Cada tribo possui lugar e estandarte", "O tabernáculo fica no centro"],
        quiz: ["O que ocupava o centro do acampamento?", ["A tenda de Faraó", "O tabernáculo", "Os rebanhos", "O exército de Judá"], 1, "A tenda do encontro no centro torna visível a presença que organiza o povo."],
        fill: ["A ordem do acampamento colocava a presença de Deus no", ".", ["centro", "limite", "passado", "mercado"], 0, "A geografia do acampamento expressa a prioridade da aliança."]
      },
      {
        title: "Levitas e cuidado do sagrado",
        subtitle: "Famílias diferentes, serviços diferentes",
        reference: ["Números 3–4", 3, 1, 4, 49],
        concept: ["num-levite-service", "Diversidade de serviços levíticos"],
        teaching: "Gersonitas, coatitas e meraritas recebem tarefas distintas no cuidado e transporte da tenda. Objetos santos são preparados antes do transporte, e ninguém deve ultrapassar limites que colocariam vidas em risco.",
        application: "Missão compartilhada não significa função idêntica. Clareza de responsabilidade, preparação e limites protegem pessoas e evitam que serviço espiritual se torne improvisação perigosa.",
        keyPoints: ["Cada família levítica tem uma tarefa", "Limites protegem quem transporta os objetos"],
        quiz: ["Qual princípio organiza o trabalho das famílias levíticas?", ["Todas fazem tudo", "Cada família recebe responsabilidades específicas", "Somente Arão trabalha", "As tarefas são sorteadas diariamente"], 1, "Números 3–4 distribui objetos e partes do tabernáculo entre as famílias."],
        fill: ["Diversidade de função pode servir à mesma", ".", ["missão", "rivalidade", "riqueza", "fuga"], 0, "As tarefas diferentes convergem no cuidado do santuário."]
      },
      {
        title: "Santidade e bênção",
        subtitle: "Reparação, voto nazireu e a face de Deus",
        reference: ["Números 5–6", 5, 1, 6, 27],
        concept: ["num-holiness-blessing", "Santidade, reparação e bênção sacerdotal"],
        teaching: "A vida do acampamento inclui confissão e restituição. O voto nazireu permite dedicação voluntária por um período. A seção culmina na bênção sacerdotal que pede proteção, graça, presença e paz.",
        application: "Algumas leis refletem estruturas antigas e exigem cuidado crítico, especialmente procedimentos que expõem mulheres vulneráveis. O centro formativo permanece: verdade, reparação, dedicação e a paz que vem da face de Deus.",
        keyPoints: ["Confissão inclui restituição", "A bênção termina com paz"],
        quiz: ["Qual palavra encerra a bênção sacerdotal?", ["Guerra", "Paz", "Riqueza", "Censo"], 1, "Números 6:26 pede que o SENHOR levante o rosto e dê paz."],
        fill: ["O SENHOR faça resplandecer o seu", "sobre ti.", ["rosto", "exército", "palácio", "rio"], 0, "A imagem comunica favor e presença pessoal de Deus."]
      }
    ]
  },
  {
    id: "numbers-u02",
    title: "Preparados para partir",
    subtitle: "Dedicação, Páscoa, nuvem e trombetas em Números 7–10",
    chapters: [7, 8, 9, 10],
    lessons: [
      {
        title: "Ofertas das tribos",
        subtitle: "Dedicação compartilhada do altar",
        reference: ["Números 7", 7, 1, 7, 89],
        concept: ["num-altar-dedication", "Participação igual na dedicação"],
        teaching: "Cada líder tribal apresenta a mesma oferta em um dia distinto para a dedicação do altar. A repetição longa valoriza cada tribo sem transformar diferença de status em oferta superior.",
        application: "Comunidades podem honrar participação sem criar competição religiosa. Repetir cada contribuição pelo nome comunica que serviço fiel não é invisível.",
        keyPoints: ["Cada tribo recebe um dia", "As ofertas têm valor equivalente"],
        quiz: ["Como as ofertas dos líderes tribais se comparavam?", ["Uma tribo dava muito mais", "Eram equivalentes", "Somente Levi ofertava", "Eram secretas"], 1, "O capítulo repete a mesma lista para cada líder, destacando participação igual."],
        fill: ["A repetição honra a participação de", "tribo.", ["cada", "nenhuma", "uma única", "estrangeira"], 0, "Cada líder e tribo é mencionado individualmente."]
      },
      {
        title: "Luz e serviço",
        subtitle: "Candelabro e dedicação dos levitas",
        reference: ["Números 8", 8, 1, 8, 26],
        concept: ["num-levites-dedicated", "Serviço levítico dedicado"],
        teaching: "As lâmpadas iluminam diante do candelabro, e os levitas são purificados e apresentados como oferta viva da comunidade para o serviço da tenda. O trabalho possui início, maturidade e limites.",
        application: "Serviço espiritual não é propriedade pessoal. A comunidade reconhece, sustenta e recebe o trabalho; limites de idade lembram que vocação também inclui transição e cuidado.",
        keyPoints: ["Os levitas representam o povo no serviço", "O trabalho possui limites e etapas"],
        quiz: ["Para que os levitas foram separados?", ["Para governar o Egito", "Para servir na tenda do encontro", "Para possuir todas as terras", "Para substituir Moisés"], 1, "Números 8 apresenta os levitas como dedicados ao serviço do santuário."],
        fill: ["A luz do candelabro deveria brilhar para a", ".", ["frente", "terra", "porta do Egito", "retaguarda"], 0, "As lâmpadas eram dispostas para iluminar diante do candelabro."]
      },
      {
        title: "Páscoa no caminho",
        subtitle: "Inclusão, segunda oportunidade e direção da nuvem",
        reference: ["Números 9", 9, 1, 9, 23],
        concept: ["num-passover-cloud", "Memória e direção no deserto"],
        teaching: "Israel celebra a Páscoa no Sinai. Pessoas ritualmente impedidas perguntam como participar e recebem uma segunda data. A nuvem sobre o tabernáculo indica quando permanecer e quando partir.",
        application: "Fidelidade à memória da libertação inclui buscar caminhos responsáveis de participação. A nuvem ensina paciência: avançar e esperar podem ser igualmente obedientes.",
        keyPoints: ["Há uma segunda oportunidade para a Páscoa", "A nuvem determina partida e permanência"],
        quiz: ["O que indicava o momento de partir?", ["O medo do povo", "A nuvem se levantando", "A lua cheia apenas", "Uma ordem egípcia"], 1, "Israel partia quando a nuvem se levantava da tenda."],
        fill: ["À ordem do SENHOR acampavam e à ordem do SENHOR", ".", ["partiam", "lutavam", "voltavam", "plantavam"], 0, "Números 9 repete a dependência da direção divina."]
      },
      {
        title: "As trombetas e a partida",
        subtitle: "Comunicação, memória e ordem de marcha",
        reference: ["Números 10", 10, 1, 10, 36],
        concept: ["num-trumpets-departure", "Partida ordenada e parceria"],
        teaching: "Trombetas de prata comunicam assembleia, partida, batalha e celebração. O povo deixa o Sinai em ordem. Moisés convida Hobabe a acompanhá-los e compartilhar o bem prometido.",
        application: "Uma jornada coletiva precisa de comunicação clara e espaço para experiência complementar. Moisés reconhece que liderança pode receber ajuda de quem conhece o terreno.",
        keyPoints: ["Sons diferentes comunicam ações", "Moisés convida Hobabe a cooperar"],
        quiz: ["Que função as trombetas não possuíam?", ["Convocar a assembleia", "Sinalizar partida", "Acompanhar celebrações", "Substituir toda liderança"], 3, "As trombetas serviam à comunicação e memória, não eliminavam discernimento e liderança."],
        fill: ["Moisés convidou Hobabe a participar da", ".", ["jornada", "escravidão", "rebelião", "coroação"], 0, "O convite reconhece sua experiência e oferece participação na promessa."]
      }
    ]
  },
  {
    id: "numbers-u03",
    title: "Crise no caminho",
    subtitle: "Queixas, liderança e a recusa da terra em Números 11–14",
    chapters: [11, 12, 13, 14],
    lessons: [
      {
        title: "Peso compartilhado",
        subtitle: "Queixa por carne e setenta anciãos",
        reference: ["Números 11", 11, 1, 11, 35],
        concept: ["num-elders-burden", "Liderança compartilhada em crise"],
        teaching: "O povo idealiza a comida do Egito e despreza o maná. Moisés confessa que não consegue carregar sozinho o peso, e Deus reparte o Espírito sobre setenta anciãos. A provisão de carne também vem acompanhada de juízo sobre desejo desordenado.",
        application: "Exaustão de liderança deve ser reconhecida antes de se tornar colapso. Compartilhar responsabilidade é resposta espiritual, enquanto nostalgia pode apagar o custo real da antiga escravidão.",
        keyPoints: ["Moisés admite seu limite", "O Espírito capacita outros líderes"],
        quiz: ["Como Deus responde ao peso declarado por Moisés?", ["Manda-o trabalhar mais sozinho", "Capacita setenta anciãos", "Envia-o ao Egito", "Remove todo o povo"], 1, "O Espírito que estava sobre Moisés é repartido para que outros carreguem o fardo."],
        fill: ["Liderança saudável aprende a", "responsabilidade.", ["compartilhar", "esconder", "vender", "abandonar"], 0, "Os anciãos ajudam a sustentar o povo."]
      },
      {
        title: "Miriã, Arão e Moisés",
        subtitle: "Crítica, poder e restauração",
        reference: ["Números 12", 12, 1, 12, 16],
        concept: ["num-miriam-aaron", "Autoridade, crítica e intercessão"],
        teaching: "Miriã e Arão questionam Moisés, e o conflito envolve casamento e autoridade profética. Deus defende a missão de Moisés; Miriã sofre uma afecção e fica fora do acampamento, mas Moisés clama por sua cura e o povo espera seu retorno.",
        application: "O capítulo não torna líderes imunes a toda avaliação, mas denuncia disputa motivada por poder. A intercessão de Moisés e a espera do povo impedem que disciplina signifique abandono definitivo.",
        keyPoints: ["A disputa envolve autoridade", "Moisés intercede e a comunidade espera"],
        quiz: ["Como Moisés reage à aflição de Miriã?", ["Celebra", "Clama a Deus por sua cura", "Parte sem ela", "Pede sua morte"], 1, "Números 12:13 registra a breve e intensa oração de Moisés."],
        fill: ["O povo não partiu até Miriã ser", ".", ["recolhida", "esquecida", "coroada", "julgada no Egito"], 0, "A jornada comunitária aguarda a reintegração dela."]
      },
      {
        title: "A terra observada",
        subtitle: "Doze espias e duas leituras da realidade",
        reference: ["Números 13", 13, 1, 13, 33],
        concept: ["num-spies", "Fé e interpretação da realidade"],
        teaching: "Doze representantes exploram Canaã e concordam sobre a fertilidade e os desafios. Dez transformam obstáculos em conclusão de impossibilidade; Calebe chama o povo a confiar que pode avançar.",
        application: "Fé não nega cidades fortes nem riscos. Ela interpreta fatos à luz da presença e promessa de Deus, enquanto medo pode ampliar inimigos e diminuir a própria identidade.",
        keyPoints: ["Os espias veem os mesmos fatos", "As conclusões revelam confiança ou medo"],
        quiz: ["Em que os espias concordaram?", ["A terra era estéril", "A terra era fértil e havia cidades fortes", "Não havia habitantes", "O Egito estava vazio"], 1, "O conflito não está nos dados básicos, mas na interpretação e resposta."],
        fill: ["Calebe procurou", "o povo diante de Moisés.", ["animar", "dispersar", "vender", "esconder"], 0, "Ele convida a subir e possuir a terra."]
      },
      {
        title: "A geração que recuou",
        subtitle: "Rebelião, intercessão e consequência",
        reference: ["Números 14", 14, 1, 14, 45],
        concept: ["num-wilderness-judgment", "Incredulidade, intercessão e consequência"],
        teaching: "O povo propõe voltar ao Egito e ameaça seus líderes. Moisés intercede apelando ao caráter paciente e misericordioso de Deus. A comunidade é poupada da destruição imediata, mas a geração rebelde não entra na terra; uma tentativa presunçosa de avançar também fracassa.",
        application: "Perdão não significa ausência de toda consequência. Há diferença entre confiança obediente e presunção que usa a promessa depois de rejeitar a direção de Deus.",
        keyPoints: ["Moisés intercede pelo povo", "Perdão e consequência aparecem juntos"],
        quiz: ["Em que Moisés fundamenta sua intercessão?", ["Na força militar", "No caráter misericordioso de Deus", "Na riqueza de Israel", "Na ajuda egípcia"], 1, "Ele cita a paciência e o amor leal revelados por Deus."],
        fill: ["A tentativa tardia de subir sem a presença divina foi", ".", ["derrotada", "abençoada", "secreta", "celebrada"], 0, "Presunção não substitui obediência."]
      }
    ]
  },
  {
    id: "numbers-u04",
    title: "Santidade entre rebeliões",
    subtitle: "Memória, sacerdócio e transição em Números 15–20",
    chapters: [15, 16, 17, 18, 19, 20],
    lessons: [
      {
        title: "Lembrar para obedecer",
        subtitle: "Ofertas, pecados e franjas nas vestes",
        reference: ["Números 15", 15, 1, 15, 41],
        concept: ["num-tassels-memory", "Memória visível e obediência"],
        teaching: "Depois do fracasso, leis sobre ofertas reafirmam que ainda haverá futuro na terra. O capítulo distingue pecados inadvertidos de rebeldia deliberada e ordena franjas com cordão azul para lembrar os mandamentos.",
        application: "Graça abre futuro sem chamar rebeldia de inocência. Práticas de memória podem ajudar desejos e ações a permanecer alinhados ao compromisso assumido.",
        keyPoints: ["As leis pressupõem futuro após o juízo", "As franjas lembram a aliança"],
        quiz: ["Qual era a função do cordão azul nas franjas?", ["Mostrar riqueza", "Lembrar os mandamentos", "Marcar soldados", "Indicar idade"], 1, "O sinal visível deveria lembrar o povo de obedecer e não seguir desejos infiéis."],
        fill: ["A memória da graça deveria conduzir à", ".", ["obediência", "arrogância", "vingança", "nostalgia"], 0, "O capítulo liga lembrança, identidade e prática."]
      },
      {
        title: "A rebelião de Corá",
        subtitle: "Ambição, juízo e intercessão",
        reference: ["Números 16", 16, 1, 16, 50],
        concept: ["num-korah", "Autoridade e rebelião de Corá"],
        teaching: "Corá, Datã, Abirão e outros desafiam a liderança, usando a santidade de toda a comunidade para reivindicar posição. O confronto termina em juízo severo; Moisés e Arão repetidamente intercedem para que a congregação não seja destruída.",
        application: "A afirmação de igualdade pode ser usada para encobrir ambição. Ao mesmo tempo, a narrativa não oferece licença a líderes modernos para silenciar perguntas; autoridade deve ser examinada pelo chamado ao serviço, não por autoproteção.",
        keyPoints: ["O discurso coletivo encobre disputa por posição", "Moisés e Arão intercedem pela comunidade"],
        quiz: ["Que atitude de Moisés contrasta com a ambição dos rebeldes?", ["Acumular riqueza", "Prostrar-se e interceder", "Fugir ao Egito", "Recusar qualquer diálogo"], 1, "Moisés se prostra e busca de Deus discernimento e misericórdia."],
        fill: ["Autoridade bíblica é chamada primeiro ao", ".", ["serviço", "privilégio", "segredo", "lucro"], 0, "O conflito expõe a diferença entre vocação e busca de posição."]
      },
      {
        title: "O cajado que floresceu",
        subtitle: "Confirmação do sacerdócio e deveres",
        reference: ["Números 17–18", 17, 1, 18, 32],
        concept: ["num-aaron-staff", "Sacerdócio confirmado e responsável"],
        teaching: "Doze cajados são colocados diante do testemunho; o de Arão floresce, produz botões e amêndoas. O sinal encerra a disputa, enquanto Números 18 define deveres e sustento de sacerdotes e levitas.",
        application: "Autoridade confirmada continua cercada de deveres. Sustento comunitário não transforma ministério em propriedade; quem recebe ofertas também presta serviço e responde pela santidade do encargo.",
        keyPoints: ["O cajado de Arão floresce", "Privilégio sacerdotal vem com responsabilidade"],
        quiz: ["O que aconteceu ao cajado de Arão?", ["Quebrou", "Floresceu e produziu amêndoas", "Virou ouro", "Foi perdido"], 1, "O sinal vivo confirmou a escolha da casa de Levi para o serviço."],
        fill: ["Dom e sustento não eliminam a", "ministerial.", ["responsabilidade", "alegria", "família", "memória"], 0, "Números 18 detalha encargos juntamente com provisão."]
      },
      {
        title: "Água da rocha e mudança de geração",
        subtitle: "Purificação, luto e o erro de Moisés",
        reference: ["Números 19–20", 19, 1, 20, 29],
        concept: ["num-transition-meribah", "Purificação, liderança e consequência"],
        teaching: "A novilha vermelha provê água de purificação diante da morte. Miriã morre; quando falta água, Moisés fere a rocha e fala de modo que não santifica Deus diante do povo. Ele e Arão não conduzirão a comunidade para dentro da terra.",
        application: "Longa fidelidade não torna liderança imune a responsabilidade. A passagem também marca luto e transição: Deus continua provendo mesmo quando líderes centrais chegam ao fim de sua missão.",
        keyPoints: ["A morte exige ritos de purificação", "Moisés enfrenta consequência por seu ato"],
        quiz: ["Por que Moisés não entraria na terra?", ["Porque voltou ao Egito", "Porque não santificou Deus diante do povo em Meribá", "Porque recusou água", "Porque era levita"], 1, "Números 20 relaciona a consequência à falha pública de confiança e representação."],
        fill: ["Mesmo em transição de líderes, Deus continuou a", "água.", ["prover", "esconder", "vender", "negar"], 0, "A provisão alcança o povo apesar da falha de Moisés."]
      }
    ]
  },
  {
    id: "numbers-u05",
    title: "Bênção em meio ao perigo",
    subtitle: "Serpentes, Balaão e nova geração em Números 21–27",
    chapters: [21, 22, 23, 24, 25, 26, 27],
    lessons: [
      {
        title: "Olhar e viver",
        subtitle: "A serpente de bronze no caminho",
        reference: ["Números 21", 21, 1, 21, 35],
        concept: ["num-bronze-serpent", "Juízo, cura e confiança"],
        teaching: "Após nova queixa, serpentes atingem o povo. Quando confessam, Deus ordena que Moisés levante uma serpente de bronze; quem olha para o sinal vive. O capítulo também registra avanços e vitórias na jornada.",
        application: "O objeto não possui poder autônomo; ele aponta para a provisão recebida pela confiança. Mais tarde, quando virou ídolo, precisou ser destruído. Sinais servem à fé, não substituem Deus.",
        keyPoints: ["O povo confessa sua rebelião", "Olhar o sinal acompanha a cura"],
        quiz: ["O que fazia quem era mordido para viver?", ["Voltava ao Egito", "Olhava para a serpente levantada", "Oferecia ouro", "Entrava no tabernáculo"], 1, "Números 21:8–9 liga o olhar obediente à preservação da vida."],
        fill: ["Um sinal recebido não deve se transformar em", ".", ["ídolo", "memória", "ensino", "gratidão"], 0, "A serpente aponta para Deus; não deve tomar seu lugar."]
      },
      {
        title: "Balaão não pode amaldiçoar",
        subtitle: "Deus transforma intenção hostil em bênção",
        reference: ["Números 22–24", 22, 1, 24, 25],
        concept: ["num-balaam-blessing", "Bênção soberana sobre Israel"],
        teaching: "Balaque contrata Balaão para amaldiçoar Israel. A jumenta percebe o mensageiro que o vidente não vê, e Balaão aprende que só pode falar o que Deus permitir. Em vez de maldição, pronuncia bênçãos.",
        application: "Dom espiritual não garante caráter maduro. A narrativa usa ironia para humilhar pretensão e afirmar que a bênção de Deus não pode ser comprada ou manipulada por poder político.",
        keyPoints: ["A jumenta vê antes do vidente", "As maldições pretendidas tornam-se bênçãos"],
        quiz: ["O que Balaão declara sobre suas palavras?", ["Pode dizer qualquer coisa por dinheiro", "Só pode dizer o que Deus colocar em sua boca", "Balaque decide tudo", "A jumenta falará por ele sempre"], 1, "Embora ambíguo em suas motivações, Balaão reconhece o limite imposto por Deus."],
        fill: ["Balaque tentou comprar uma", "contra Israel.", ["maldição", "aliança", "colheita", "cidade"], 0, "O plano político-religioso é repetidamente frustrado."]
      },
      {
        title: "Peor e zelo perigoso",
        subtitle: "Infidelidade, juízo e leitura responsável",
        reference: ["Números 25", 25, 1, 25, 18],
        concept: ["num-peor", "Infidelidade em Baal-Peor"],
        teaching: "Israel se envolve com Baal-Peor, e a crise mistura idolatria, relações e praga. Fineias age violentamente e recebe reconhecimento dentro do contexto antigo por interromper a profanação.",
        application: "A cena não autoriza violência religiosa privada hoje. Deve ser lida dentro da teocracia antiga e do restante do cânon, reconhecendo a seriedade da infidelidade sem transformar zelo em justificativa para agressão.",
        keyPoints: ["A crise central é infidelidade de aliança", "O episódio não licencia violência contemporânea"],
        quiz: ["Qual é o problema de aliança destacado no início do capítulo?", ["Falta de tendas", "Adesão ao culto de Baal-Peor", "Ausência de censo", "Recusa do maná"], 1, "O povo participa dos sacrifícios e se liga a Baal-Peor."],
        fill: ["Zelo religioso nunca deve justificar violência", "na aplicação cristã.", ["privada", "simbólica", "antiga", "literária"], 0, "O contexto jurídico de Israel não pode ser transferido diretamente para ações individuais."]
      },
      {
        title: "Herança e sucessão",
        subtitle: "Filhas de Zelofeade e Josué comissionado",
        reference: ["Números 26–27", 26, 1, 27, 23],
        concept: ["num-inheritance-succession", "Justiça na herança e liderança sucessora"],
        teaching: "Um segundo censo mostra a nova geração. As filhas de Zelofeade apresentam seu caso e recebem direito à herança familiar. Moisés pede um líder para que o povo não fique como ovelhas sem pastor, e Josué é comissionado publicamente.",
        application: "A lei responde a uma reivindicação justa trazida por mulheres, mostrando que ouvir casos concretos pode aperfeiçoar a prática comunitária. Sucessão saudável prepara outro líder antes da partida do anterior.",
        keyPoints: ["As filhas são ouvidas e recebem herança", "Josué é comissionado diante do povo"],
        quiz: ["Como Deus responde ao pedido das filhas de Zelofeade?", ["Rejeita sem ouvir", "Afirma que elas têm razão", "Envia-as ao Egito", "Entrega tudo aos levitas"], 1, "Números 27 reconhece a justiça da reivindicação e ajusta a regra de herança."],
        fill: ["Josué foi comissionado de maneira", "diante da congregação.", ["pública", "secreta", "militar apenas", "provisória sem testemunhas"], 0, "A imposição de mãos diante do sacerdote e do povo prepara a transição."]
      }
    ]
  },
  {
    id: "numbers-u06",
    title: "Prontos para herdar",
    subtitle: "Adoração, votos, memória e limites em Números 28–36",
    chapters: [28, 29, 30, 31, 32, 33, 34, 35, 36],
    lessons: [
      {
        title: "Ritmo de ofertas",
        subtitle: "Dias, semanas e festas diante de Deus",
        reference: ["Números 28–29", 28, 1, 29, 40],
        concept: ["num-offering-calendar", "Adoração ordenada no tempo"],
        teaching: "Ofertas diárias, semanais, mensais e festivas organizam o calendário. A repetição sustenta memória e culto comunitário quando Israel se prepara para viver na terra.",
        application: "Ritmos regulares impedem que devoção dependa apenas de emoção. Para cristãos, a forma sacrificial não continua do mesmo modo, mas disciplina, gratidão e memória permanecem formativas.",
        keyPoints: ["O culto possui ritmos diários e anuais", "As festas recontam a relação de aliança"],
        quiz: ["O que as ofertas regulares organizavam?", ["Apenas o exército", "O tempo de adoração da comunidade", "A moeda egípcia", "As fronteiras de Moabe"], 1, "Números 28–29 percorre dias, sábados, meses e festas."],
        fill: ["Ritmos espirituais ajudam a formar a", ".", ["fidelidade", "pressa", "competição", "fama"], 0, "Regularidade sustenta memória além de momentos excepcionais."]
      },
      {
        title: "Palavras com peso",
        subtitle: "Votos, estruturas familiares e responsabilidade",
        reference: ["Números 30", 30, 1, 30, 16],
        concept: ["num-vows", "Votos e responsabilidade pela palavra"],
        teaching: "Votos feitos ao SENHOR não deveriam ser tratados levianamente. O capítulo também reflete estruturas patriarcais em que pai ou marido podia confirmar ou anular determinados votos de mulheres.",
        application: "O princípio de integridade na palavra permanece, enquanto a aplicação precisa reconhecer o contexto social antigo e afirmar plena dignidade e agência das mulheres. Autoridade não deve ser usada para silenciar ou controlar.",
        keyPoints: ["Promessas a Deus exigem seriedade", "As estruturas familiares refletem o mundo antigo"],
        quiz: ["Qual princípio abre o capítulo?", ["Votos podem ser esquecidos", "A palavra empenhada deve ser cumprida", "Somente reis podem prometer", "Promessas não têm efeito"], 1, "Números 30:2 ordena não violar a palavra dada."],
        fill: ["Integridade trata a palavra dada com", ".", ["seriedade", "desprezo", "ironia", "segredo"], 0, "O capítulo alerta contra compromissos religiosos impensados."]
      },
      {
        title: "Guerra e acomodação",
        subtitle: "Midiã e as tribos a leste do Jordão",
        reference: ["Números 31–32", 31, 1, 32, 42],
        concept: ["num-war-east-tribes", "Guerra antiga e compromisso comunitário"],
        teaching: "A guerra contra Midiã contém violência difícil e pertence ao cenário de juízo nacional antigo, não a um modelo para a igreja. Rúben, Gade e metade de Manassés pedem terras a leste, mas assumem ajudar as demais tribos antes de se estabelecer.",
        application: "Textos de guerra exigem lamento, contexto e proibição de imitação religiosa. Números 32 também ensina que buscar segurança própria não deve abandonar o compromisso com o bem da comunidade.",
        keyPoints: ["A guerra antiga não é missão da igreja", "As tribos orientais prometem ajudar as demais"],
        quiz: ["Que compromisso as tribos orientais assumiram?", ["Voltar ao Egito", "Lutar ao lado das outras tribos antes de se estabelecer", "Abandonar o gado", "Construir outro tabernáculo"], 1, "Elas poderiam receber a terra desde que não desencorajassem nem abandonassem seus irmãos."],
        fill: ["Interesse próprio deve considerar o bem da", ".", ["comunidade", "riqueza", "fronteira", "guerra"], 0, "Moisés confronta a possibilidade de acomodação sem solidariedade."]
      },
      {
        title: "Memória, terra e justiça",
        subtitle: "Etapas, fronteiras, cidades de refúgio e herança",
        reference: ["Números 33–36", 33, 1, 36, 13],
        concept: ["num-land-justice", "Memória da jornada e justiça na terra"],
        teaching: "A lista das etapas preserva a memória desde o Egito. Fronteiras e líderes organizam a distribuição da terra. Cidades levíticas e de refúgio distinguem homicídio intencional de morte acidental; a herança das filhas de Zelofeade é protegida dentro da tribo.",
        application: "Entrar na terra requer memória e instituições de justiça. Proteção ao acusado e investigação não eliminam responsabilidade; impedem vingança imediata de substituir julgamento.",
        keyPoints: ["A jornada é registrada por etapas", "Cidades de refúgio limitam vingança precipitada"],
        quiz: ["Qual função tinham as cidades de refúgio?", ["Guardar tesouros", "Proteger quem causou morte acidental até julgamento", "Treinar exércitos", "Substituir o tabernáculo"], 1, "Números 35 cria espaço para distinguir intenção antes da punição."],
        fill: ["A justiça exige investigar a", "do ato.", ["intenção", "riqueza", "tribo apenas", "aparência"], 0, "A diferença entre acidente e homicídio orienta o julgamento."]
      }
    ]
  }
];

export const numbersUnits = buildPentateuchUnits("numbers", "Números", seeds);
