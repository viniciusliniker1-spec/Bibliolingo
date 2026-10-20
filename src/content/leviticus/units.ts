import {
  buildPentateuchUnits,
  type PentateuchUnitSeed
} from "../pentateuch/buildPentateuchUnits";

const seeds: PentateuchUnitSeed[] = [
  {
    id: "leviticus-u01",
    title: "Aproximar-se de Deus",
    subtitle: "Ofertas, comunhão e reparação em Levítico 1–7",
    chapters: [1, 2, 3, 4, 5, 6, 7],
    lessons: [
      {
        title: "Holocausto e oferta de cereais",
        subtitle: "Entrega, gratidão e adoração voluntária",
        reference: ["Levítico 1–2", 1, 1, 2, 16],
        concept: ["lev-offerings-dedication", "Entrega e gratidão nas ofertas"],
        teaching: "Levítico começa com instruções para quem deseja trazer uma oferta. O holocausto expressa entrega completa; a oferta de cereais apresenta o fruto do trabalho com azeite e incenso. Diferentes possibilidades econômicas tornam a aproximação acessível.",
        application: "Esses ritos pertencem à aliança de Israel e não devem ser reproduzidos mecanicamente por cristãos. Eles ensinam que adoração envolve a vida oferecida, gratidão concreta e cuidado para que condição econômica não exclua pessoas.",
        keyPoints: ["A oferta podia variar conforme os recursos", "Entrega e gratidão alcançam corpo e trabalho"],
        quiz: ["Que possibilidade mostra atenção a quem possuía menos recursos?", ["Somente gado era aceito", "Também aves podiam ser oferecidas", "A oferta era dispensada", "Apenas sacerdotes ofertavam"], 1, "Levítico 1 apresenta gado, rebanho ou aves, reconhecendo diferentes condições econômicas."],
        fill: ["A oferta de cereais representava também o fruto do", "humano.", ["trabalho", "exército", "palácio", "deserto"], 0, "Farinha, azeite e incenso ligam adoração àquilo que o trabalho produz."]
      },
      {
        title: "Oferta de comunhão",
        subtitle: "Paz, gratidão e refeição compartilhada",
        reference: ["Levítico 3; 7:11–36", 3, 1, 7, 36],
        concept: ["lev-peace-offering", "Comunhão celebrada diante de Deus"],
        teaching: "A oferta de comunhão, também chamada oferta pacífica, podia acompanhar gratidão, voto ou oferta voluntária. Parte era entregue no altar, parte sustentava os sacerdotes e parte era comida pelo ofertante em comunhão.",
        application: "A refeição mostra que paz com Deus possui dimensão comunitária. Gratidão que ignora partilha e cuidado com quem serve perde um aspecto importante do sinal.",
        keyPoints: ["A oferta celebrava paz e gratidão", "A refeição incluía partilha"],
        quiz: ["Qual elemento distinguia a oferta de comunhão?", ["Era sempre escondida", "Incluía uma refeição compartilhada", "Não envolvia gratidão", "Era feita somente no deserto"], 1, "A distribuição da oferta permitia participação do altar, dos sacerdotes e do ofertante."],
        fill: ["A oferta pacífica podia expressar", "por uma bênção recebida.", ["gratidão", "vingança", "medo de Faraó", "censo"], 0, "Levítico 7 menciona explicitamente a oferta de ação de graças."]
      },
      {
        title: "Pecado, culpa e confissão",
        subtitle: "Responsabilidade por ações intencionais ou inadvertidas",
        reference: ["Levítico 4–5", 4, 1, 5, 19],
        concept: ["lev-sin-guilt", "Confissão, perdão e responsabilidade"],
        teaching: "As ofertas pelo pecado e pela culpa tratam de violações que contaminam relações e santuário. O texto reconhece pecados inadvertidos, mas ainda chama a pessoa a reconhecer, confessar e buscar reparação quando toma consciência.",
        application: "Ignorar o dano por não ter sido planejado não restaura quem sofreu. Arrependimento bíblico inclui verdade, confissão e ações reparadoras, confiando na misericórdia que torna restauração possível.",
        keyPoints: ["Pecado inadvertido ainda requer resposta", "Confissão acompanha a busca por perdão"],
        quiz: ["O que a pessoa deveria fazer ao reconhecer sua culpa?", ["Escondê-la", "Confessá-la e trazer a oferta prevista", "Culpar o sacerdote", "Sair do acampamento para sempre"], 1, "Levítico 5:5 une reconhecimento da culpa e confissão do pecado."],
        fill: ["Tomar consciência do dano chama à", "e à reparação.", ["confissão", "celebração", "indiferença", "fuga"], 0, "A passagem não trata ignorância anterior como razão para manter o erro oculto."]
      },
      {
        title: "Restituição e serviço contínuo",
        subtitle: "O altar aceso e o dano reparado",
        reference: ["Levítico 6–7", 6, 1, 7, 38],
        concept: ["lev-restitution-service", "Reparação e fidelidade no serviço"],
        teaching: "Fraude, roubo ou retenção de bens exigiam devolver o que foi tomado e acrescentar reparação. Ao mesmo tempo, os sacerdotes deveriam manter o fogo do altar e cumprir cuidadosamente sua responsabilidade.",
        application: "Ritual não substitui justiça. Reconciliação com Deus não é desculpa para conservar vantagem obtida contra o próximo; ela produz restituição e serviço perseverante.",
        keyPoints: ["O bem tomado precisava ser devolvido", "O fogo do altar era mantido continuamente"],
        quiz: ["Além de trazer oferta, o que fazia quem prejudicou o próximo?", ["Guardava o bem", "Restituía o dano com acréscimo", "Mudava de cidade", "Esperava o jubileu"], 1, "Levítico 6 exige devolução e compensação antes de tratar a culpa como resolvida."],
        fill: ["O fogo sobre o altar deveria permanecer", ".", ["aceso", "oculto", "apagado", "frio"], 0, "O cuidado contínuo do fogo simboliza serviço atento e regular."]
      }
    ]
  },
  {
    id: "leviticus-u02",
    title: "Chamados ao serviço santo",
    subtitle: "Consagração, glória e discernimento em Levítico 8–10",
    chapters: [8, 9, 10],
    lessons: [
      {
        title: "Consagração dos sacerdotes",
        subtitle: "Lavagem, vestes, unção e responsabilidade pública",
        reference: ["Levítico 8", 8, 1, 8, 36],
        concept: ["lev-priestly-ordination", "Consagração para servir"],
        teaching: "Arão e seus filhos são consagrados diante de toda a congregação. Lavagem, vestes, unção e sacrifícios deixam claro que o sacerdócio não é autopromoção: ele nasce de chamado e preparação para representar o povo.",
        application: "Liderança espiritual exige transparência, formação e responsabilidade comunitária. Símbolos de honra nunca anulam a necessidade de purificação e obediência.",
        keyPoints: ["A consagração acontece diante da comunidade", "Autoridade sacerdotal é recebida para servir"],
        quiz: ["Onde ocorreu a consagração de Arão e seus filhos?", ["Em segredo", "Diante da congregação", "No palácio", "Fora do acampamento sem testemunhas"], 1, "Moisés reúne a congregação à entrada da tenda para o rito público."],
        fill: ["A liderança sacerdotal foi separada para", ".", ["servir", "enriquecer", "governar o Egito", "evitar o povo"], 0, "As vestes e a unção acompanham uma vocação de serviço santo."]
      },
      {
        title: "A glória aparece",
        subtitle: "Bênção, sacrifício e resposta do povo",
        reference: ["Levítico 9", 9, 1, 9, 24],
        concept: ["lev-glory-worship", "Presença de Deus e adoração"],
        teaching: "Após a preparação, Arão oferece sacrifícios por si e pelo povo, abençoa a congregação e a glória do SENHOR aparece. O fogo consome a oferta, e o povo responde com júbilo e reverência.",
        application: "A adoração bíblica reúne alegria e santo temor. A manifestação não exalta o ministro, mas confirma a presença de Deus e leva toda a comunidade a responder.",
        keyPoints: ["O sacerdote também necessita de expiação", "O povo responde com alegria e reverência"],
        quiz: ["Como o povo reagiu quando o fogo consumiu a oferta?", ["Fugiu para o Egito", "Jubilou e se prostrou", "Escolheu outro sacerdote", "Ignorou o acontecimento"], 1, "Levítico 9:24 mantém juntos o clamor de alegria e a prostração."],
        fill: ["A glória que apareceu dirigiu a atenção para", ".", ["Deus", "Arão apenas", "o ouro", "Moisés apenas"], 0, "O centro da cena é a presença divina confirmando o culto ordenado."]
      },
      {
        title: "Fogo não autorizado",
        subtitle: "Nadabe, Abiú e a seriedade do ministério",
        reference: ["Levítico 10:1–7", 10, 1, 10, 7],
        concept: ["lev-unauthorized-fire", "Santidade e responsabilidade ministerial"],
        teaching: "Nadabe e Abiú oferecem fogo que não lhes fora ordenado e morrem diante do SENHOR. A narrativa é severa e não oferece todos os detalhes, mas enfatiza a responsabilidade de quem se aproxima como representante santo.",
        application: "A passagem não autoriza líderes a usar medo para controlar comunidades. Ela adverte que privilégio ministerial aumenta responsabilidade e que culto não deve ser manipulado segundo capricho pessoal.",
        keyPoints: ["Os sacerdotes agem sem ordem recebida", "Proximidade ministerial aumenta responsabilidade"],
        quiz: ["Qual problema o texto identifica na oferta de Nadabe e Abiú?", ["Era pequena demais", "Não havia sido ordenada", "Foi oferecida por estrangeiros", "Usou cereal"], 1, "Levítico 10 chama o fogo de estranho ou não autorizado diante do SENHOR."],
        fill: ["O privilégio de liderar aumenta a", "de agir com fidelidade.", ["responsabilidade", "impunidade", "riqueza", "fama"], 0, "A severidade da cena está ligada à posição representativa dos sacerdotes."]
      },
      {
        title: "Discernir e ensinar",
        subtitle: "Santo, comum, puro e impuro",
        reference: ["Levítico 10:8–20", 10, 8, 10, 20],
        concept: ["lev-priestly-discernment", "Discernimento e ensino responsável"],
        teaching: "Os sacerdotes deveriam evitar embriaguez no serviço, distinguir entre santo e comum, puro e impuro, e ensinar os estatutos ao povo. Arão também dialoga com Moisés sobre uma decisão tomada em luto.",
        application: "Discernimento espiritual combina clareza moral, sobriedade, ensino e escuta das circunstâncias humanas. Regras não dispensam conversa responsável quando há sofrimento.",
        keyPoints: ["Sobriedade protege o discernimento", "Ensinar a comunidade faz parte do serviço"],
        quiz: ["Qual tarefa de ensino é dada aos sacerdotes?", ["Ensinar os estatutos do SENHOR", "Ensinar táticas egípcias", "Ocultar a lei", "Contar apenas genealogias"], 0, "Levítico 10:11 inclui explicitamente o ensino entre as responsabilidades sacerdotais."],
        fill: ["Os sacerdotes deveriam distinguir o santo do", ".", ["comum", "bonito", "antigo", "caro"], 0, "A distinção orienta o povo a reconhecer diferentes esferas de vida e culto."]
      }
    ]
  },
  {
    id: "leviticus-u03",
    title: "Pureza e restauração",
    subtitle: "Corpo, comunidade e retorno ao convívio em Levítico 11–15",
    chapters: [11, 12, 13, 14, 15],
    lessons: [
      {
        title: "Alimentos e identidade",
        subtitle: "Animais puros, impuros e uma vida distinta",
        reference: ["Levítico 11", 11, 1, 11, 47],
        concept: ["lev-food-purity", "Pureza alimentar e identidade"],
        teaching: "Levítico classifica animais permitidos e proibidos para Israel. As distinções formam a identidade cotidiana de um povo chamado à santidade; impureza ritual não é o mesmo que culpa moral pessoal.",
        application: "Cristãos interpretam essas leis à luz do Novo Testamento e não devem usá-las para desprezar culturas ou pessoas. O princípio formativo permanece: até hábitos diários podem expressar pertencimento a Deus.",
        keyPoints: ["Pureza ritual não equivale automaticamente a pecado", "A mesa participa da formação comunitária"],
        quiz: ["Qual objetivo o final do capítulo associa às distinções alimentares?", ["Acumular riqueza", "Distinguir entre puro e impuro", "Copiar o Egito", "Eliminar toda agricultura"], 1, "Levítico 11:47 resume a função de distinguir animais e orientar a santidade de Israel."],
        fill: ["As práticas alimentares ajudavam a formar a", "de Israel.", ["identidade", "marinha", "arquitetura", "monarquia"], 0, "A alimentação diária se tornava parte da vida de um povo separado para Deus."]
      },
      {
        title: "Nascimento e cuidado",
        subtitle: "Purificação depois do parto",
        reference: ["Levítico 12", 12, 1, 12, 8],
        concept: ["lev-childbirth-purity", "Nascimento, vulnerabilidade e acesso"],
        teaching: "Após o parto, a mulher atravessava um período ritual antes de retornar plenamente ao santuário. O sangue e a transição corporal pertencem ao sistema de pureza, sem declarar que dar à luz seja pecado.",
        application: "Leitura responsável não deve envergonhar maternidade nem corpo feminino. A provisão de uma oferta menor para quem não podia pagar mostra preocupação com acesso dentro do sistema antigo.",
        keyPoints: ["Parto não é apresentado como falha moral", "Há alternativa de oferta para famílias pobres"],
        quiz: ["Que alternativa existia para quem não podia oferecer um cordeiro?", ["Nenhuma", "Duas aves", "Somente farinha", "Um boi emprestado"], 1, "Levítico 12:8 permite rolas ou pombinhos, provisão usada também pela família de Jesus."],
        fill: ["A impureza após o parto era uma condição", ", não culpa moral.", ["ritual", "criminosa", "militar", "econômica"], 0, "O capítulo regula acesso e tempo de recuperação dentro do sistema de pureza."]
      },
      {
        title: "Examinar e reintegrar",
        subtitle: "Afecções de pele, casas e responsabilidade comunitária",
        reference: ["Levítico 13–14", 13, 1, 14, 57],
        concept: ["lev-diagnosis-restoration", "Cuidado, exame e reintegração"],
        teaching: "Sacerdotes examinavam alterações de pele, tecidos e casas, estabelecendo períodos de observação. O termo tradicionalmente traduzido por lepra abrange várias condições. Levítico 14 prevê ritos de retorno quando o problema cessa.",
        application: "O texto não oferece diagnóstico médico moderno. Seu movimento de examinar, proteger e reintegrar desafia comunidades a evitar tanto negligência quanto estigma permanente contra quem adoece.",
        keyPoints: ["O diagnóstico podia exigir observação", "A restauração incluía retorno à comunidade"],
        quiz: ["O que acontecia quando uma condição precisava de confirmação?", ["Condenação imediata", "Período de observação e novo exame", "Exílio definitivo", "Nenhuma avaliação"], 1, "Os capítulos repetem quarentena breve e reavaliação antes de decisões permanentes."],
        fill: ["O objetivo após a cura incluía a", "da pessoa.", ["reintegração", "expulsão eterna", "coroação", "viagem ao Egito"], 0, "Levítico 14 descreve como alguém podia ser declarado puro e retornar ao convívio."]
      },
      {
        title: "Fluxos corporais",
        subtitle: "Limites, higiene ritual e dignidade",
        reference: ["Levítico 15", 15, 1, 15, 33],
        concept: ["lev-bodily-discharges", "Corpo, limites e pureza ritual"],
        teaching: "Fluxos masculinos e femininos geravam impureza ritual temporária e exigiam lavagem, espera e, em certos casos, oferta. O capítulo trata o corpo de ambos os sexos dentro de uma estrutura de acesso ao santuário.",
        application: "Impureza não deve ser confundida com inferioridade humana. O texto pode formar respeito por limites corporais, higiene e cuidado, sem transformar processos naturais em motivo de vergonha.",
        keyPoints: ["Homens e mulheres aparecem nas regras", "A condição ritual era temporária"],
        quiz: ["Como o capítulo trata a impureza ligada a fluxos corporais?", ["Como identidade permanente", "Como condição ritual temporária", "Como crime político", "Como falta de fé sempre"], 1, "Lavagem e passagem do tempo mostram que a condição não define permanentemente a pessoa."],
        fill: ["Processos corporais não anulam a", "da pessoa.", ["dignidade", "memória", "família", "linguagem"], 0, "Uma leitura responsável distingue regulação ritual e valor humano."]
      }
    ]
  },
  {
    id: "leviticus-u04",
    title: "Expiação e vida",
    subtitle: "O Dia da Expiação e a santidade do sangue em Levítico 16–17",
    chapters: [16, 17],
    lessons: [
      {
        title: "Uma vez por ano",
        subtitle: "Purificação do santuário e do povo",
        reference: ["Levítico 16:1–19", 16, 1, 16, 19],
        concept: ["lev-day-atonement", "Dia da Expiação"],
        teaching: "No Dia da Expiação, o sumo sacerdote entra no Santo dos Santos com preparação cuidadosa. Sacrifícios tratam o pecado do sacerdote, do povo e a contaminação acumulada no santuário.",
        application: "O rito mostra que pecado não é apenas sentimento privado; ele afeta relações e vida comunitária. A tradição cristã lê sua linguagem em diálogo com a obra de Cristo, sem apagar seu sentido original em Israel.",
        keyPoints: ["O sacerdote busca expiação também por si", "O santuário é purificado da contaminação acumulada"],
        quiz: ["Com que frequência o rito central era realizado?", ["Todos os dias", "Uma vez por ano", "A cada sete anos", "Somente no Egito"], 1, "Levítico 16 estabelece uma celebração anual solene de purificação e expiação."],
        fill: ["O sumo sacerdote entrava no lugar santíssimo com cuidadosa", ".", ["preparação", "pressa", "improvisação", "exibição"], 0, "Banho, vestes e sacrifícios precediam a entrada no espaço mais santo."]
      },
      {
        title: "Dois bodes",
        subtitle: "Perdão e remoção da culpa",
        reference: ["Levítico 16:20–34", 16, 20, 16, 34],
        concept: ["lev-scapegoat", "Remoção simbólica dos pecados"],
        teaching: "Um bode é oferecido, enquanto sobre o outro são confessadas as iniquidades de Israel antes de ele ser enviado ao deserto. Os dois movimentos comunicam purificação e remoção da culpa para longe do acampamento.",
        application: "Confissão nomeia o mal; remoção anuncia que o povo não precisa carregar a culpa como identidade eterna. Perdão não encobre vítimas nem elimina reparação, mas abre futuro restaurado.",
        keyPoints: ["Os pecados são confessados sobre o bode", "A culpa é simbolicamente levada para longe"],
        quiz: ["O que acontecia ao bode vivo depois da confissão?", ["Era coroado", "Era enviado ao deserto", "Voltava ao rebanho", "Era levado ao Egito"], 1, "O envio representa a remoção das transgressões para uma terra solitária."],
        fill: ["A confissão", "o pecado em vez de escondê-lo.", ["nomeia", "celebra", "multiplica", "esquece"], 0, "Arão confessa as iniquidades antes do gesto simbólico de remoção."]
      },
      {
        title: "A vida está no sangue",
        subtitle: "Sacrifício, alimento e respeito pela vida",
        reference: ["Levítico 17", 17, 1, 17, 16],
        concept: ["lev-blood-life", "Vida, sangue e expiação"],
        teaching: "O sangue não deveria ser consumido porque representa a vida dada por Deus e foi designado para expiação no altar. A caça também exigia derramar e cobrir o sangue, reconhecendo que vida animal não é posse banal.",
        application: "A regra pertence ao sistema sacrificial de Israel, mas comunica reverência pela vida. Alimentação e culto devem resistir à violência tratada como coisa sem valor.",
        keyPoints: ["O sangue representa a vida", "A vida recebida é tratada com reverência"],
        quiz: ["Por que Israel não deveria consumir sangue?", ["Porque não tinha sabor", "Porque a vida está no sangue", "Porque pertencia a Faraó", "Porque era usado como moeda"], 1, "Levítico 17:11 fundamenta a proibição na relação entre sangue, vida e expiação."],
        fill: ["O sangue aponta para a", "que pertence a Deus.", ["vida", "riqueza", "terra", "coroa"], 0, "A restrição forma reverência pelo dom da vida."]
      },
      {
        title: "Culto íntegro",
        subtitle: "Um só altar e uma comunidade reconciliada",
        reference: ["Levítico 16–17", 16, 1, 17, 16],
        concept: ["lev-integrated-worship", "Adoração, reconciliação e lealdade"],
        teaching: "Os capítulos unem purificação anual e orientação para levar sacrifícios ao lugar designado, evitando cultos rivais. A aproximação de Deus envolve lealdade, confissão e restauração da comunidade.",
        application: "Prática religiosa não pode ser separada de verdade e reconciliação. Adoração íntegra recusa duplicidade: aproxima-se de Deus enquanto enfrenta o dano que o pecado produz.",
        keyPoints: ["A expiação restaura acesso e comunidade", "Lealdade impede cultos concorrentes"],
        quiz: ["Que dimensões aparecem juntas nesses capítulos?", ["Somente arquitetura", "Confissão, expiação e lealdade", "Comércio e guerra", "Genealogia e agricultura apenas"], 1, "Levítico 16–17 conecta purificação, remoção da culpa e culto dirigido ao SENHOR."],
        fill: ["Adoração íntegra reúne culto e", ".", ["reconciliação", "aparência", "isolamento", "poder"], 0, "O sistema visa restaurar relação com Deus e vida comunitária."]
      }
    ]
  },
  {
    id: "leviticus-u05",
    title: "Santidade no cotidiano",
    subtitle: "Amor, justiça, festas e aliança em Levítico 18–27",
    chapters: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    lessons: [
      {
        title: "Limites que protegem relações",
        subtitle: "Sexualidade, poder e identidade de aliança",
        reference: ["Levítico 18; 20", 18, 1, 20, 27],
        concept: ["lev-relational-boundaries", "Limites relacionais e santidade"],
        teaching: "Levítico 18 e 20 delimitam relações sexuais dentro da estrutura familiar e comunitária de Israel, confrontando incesto, exploração e práticas associadas aos povos vizinhos. Algumas penas pertencem à legislação civil antiga de Israel.",
        application: "A leitura cristã responsável distingue princípio moral, contexto jurídico antigo e aplicação pastoral. Esses textos nunca autorizam violência privada, humilhação ou tratamento desumano de pessoas.",
        keyPoints: ["Limites enfrentam abuso e desordem relacional", "Lei civil antiga não autoriza violência moderna"],
        quiz: ["Que distinção é necessária ao aplicar esses capítulos hoje?", ["Nenhuma distinção", "Princípio moral, contexto antigo e cuidado pastoral", "Somente o idioma", "Apenas o valor econômico"], 1, "Interpretar responsavelmente exige reconhecer o contexto da aliança israelita e a dignidade humana."],
        fill: ["Textos de santidade não autorizam tratamento", "de pessoas.", ["desumano", "justo", "cuidadoso", "misericordioso"], 0, "Aplicação cristã deve preservar verdade e amor ao próximo."]
      },
      {
        title: "Amar o próximo",
        subtitle: "Santidade no campo, no tribunal e nas relações",
        reference: ["Levítico 19", 19, 1, 19, 37],
        concept: ["lev-love-neighbor", "Amor ao próximo e santidade prática"],
        teaching: "O chamado sede santos alcança colheita, salários, pessoas com deficiência, tribunal, fala e relações. Deixar espigas ao pobre e estrangeiro, pagar o trabalhador e amar o próximo mostram santidade incorporada.",
        application: "Jesus destaca o mandamento de amar o próximo. Santidade não é isolamento orgulhoso; é vida moldada pelo caráter de Deus em justiça, verdade, generosidade e reconciliação.",
        keyPoints: ["Santidade alcança economia e fala", "O amor ao próximo resume relações concretas"],
        quiz: ["Quem deveria ser beneficiado pelas bordas não colhidas do campo?", ["Somente sacerdotes", "Pobre e estrangeiro", "Somente proprietários", "Exército"], 1, "Levítico 19:9–10 transforma a colheita em espaço de provisão para vulneráveis."],
        fill: ["Amarás o teu", "como a ti mesmo.", ["próximo", "palácio", "ouro", "exército"], 0, "Levítico 19:18 liga santidade à forma de tratar outras pessoas."]
      },
      {
        title: "Tempos santos",
        subtitle: "Sábado, festas e memória comunitária",
        reference: ["Levítico 23–24", 23, 1, 24, 23],
        concept: ["lev-sacred-calendar", "Tempo, memória e adoração"],
        teaching: "Sábado, Páscoa, Semanas, Trombetas, Expiação e Tabernáculos organizam o ano em torno da ação de Deus, colheita, descanso e memória. Lâmpadas e pães mantêm sinais contínuos no santuário; Levítico 24 também trata justiça comunitária.",
        application: "Calendários formam desejos. Separar tempo para descanso, gratidão, arrependimento e memória resiste a uma vida governada apenas por produtividade.",
        keyPoints: ["As festas recontam a relação com Deus", "Descanso e celebração moldam a comunidade"],
        quiz: ["O que a Festa dos Tabernáculos lembrava?", ["Os palácios egípcios", "A habitação em tendas após a saída do Egito", "A coroação de Saul", "A construção de Jerusalém"], 1, "Levítico 23 conecta a festa à memória da jornada de Israel."],
        fill: ["O calendário sagrado cria ritmos de memória, festa e", ".", ["descanso", "acúmulo", "conquista", "silêncio obrigatório"], 0, "O sábado e as festas interrompem a produção para cultivar aliança."]
      },
      {
        title: "Liberdade e fidelidade",
        subtitle: "Ano sabático, jubileu, bênçãos e votos",
        reference: ["Levítico 25–27", 25, 1, 27, 34],
        concept: ["lev-jubilee-covenant", "Jubileu, aliança e pertença"],
        teaching: "A terra descansa no sétimo ano; no jubileu, propriedade e liberdade são restauradas, pois a terra pertence a Deus e Israel não deve voltar à escravidão. Levítico 26 apresenta bênçãos e advertências; o livro termina regulando votos.",
        application: "O jubileu confronta acúmulo permanente e lembra que pessoas não são mercadoria. Mesmo quando a história de Israel não realiza plenamente o ideal, ele oferece imaginação moral de descanso, liberdade e restauração.",
        keyPoints: ["A terra pertence a Deus", "O jubileu limita perda permanente e servidão"],
        quiz: ["Qual afirmação fundamenta a devolução da terra?", ["A terra pertence ao rei", "A terra pertence a Deus", "A terra não tem valor", "A terra pertence ao exército"], 1, "Levítico 25:23 declara que Israel é peregrino e a terra pertence ao SENHOR."],
        fill: ["No jubileu se proclamava", "na terra.", ["liberdade", "guerra", "fome", "tributo"], 0, "Levítico 25:10 associa o jubileu à libertação e ao retorno."]
      }
    ]
  }
];

export const leviticusUnits = buildPentateuchUnits("leviticus", "Levítico", seeds);
