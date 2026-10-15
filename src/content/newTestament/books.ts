import { buildExpansionUnits, chapterRange, type ExpansionUnit, type ExpansionTopic } from "../oldTestament/buildExpansionUnits";
import type { Unit } from "../../types/content";

interface TopicSpec {
  title: string;
  start: number;
  end: number;
  teaching: string;
}

interface UnitSpec {
  title: string;
  subtitle: string;
  start: number;
  end: number;
  topics: [TopicSpec, TopicSpec, TopicSpec, TopicSpec];
}

export interface NewTestamentBookSpec {
  id: string;
  title: string;
  shortTitle: string;
  chapterCount: number;
  rationale: string;
  units: UnitSpec[];
}

export const NEW_TESTAMENT_SPECS: NewTestamentBookSpec[] = [
  {
    "id": "matthew",
    "title": "Mateus",
    "shortTitle": "Mt",
    "chapterCount": 28,
    "rationale": "Evangelho extenso, organizado em grandes blocos narrativos e discursos de Jesus.",
    "units": [
      {
        "title": "O Rei prometido",
        "subtitle": "Origem, infância e preparação do Messias",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "Genealogia e promessa",
            "start": 1,
            "end": 1,
            "teaching": "A genealogia apresenta Jesus como filho de Davi e de Abraão e inclui pessoas que revelam a amplitude da graça de Deus."
          },
          {
            "title": "Nascimento e Emanuel",
            "start": 1,
            "end": 2,
            "teaching": "Os relatos do nascimento unem ação divina, obediência de José, adoração dos magos e oposição de Herodes."
          },
          {
            "title": "João Batista e o reino",
            "start": 3,
            "end": 3,
            "teaching": "João chama ao arrependimento e prepara o caminho; o batismo de Jesus inaugura publicamente sua missão."
          },
          {
            "title": "Tentação e início do ministério",
            "start": 4,
            "end": 4,
            "teaching": "Jesus resiste à tentação pela fidelidade à Palavra e anuncia o reino enquanto chama os primeiros discípulos."
          }
        ]
      },
      {
        "title": "O ensino do Reino",
        "subtitle": "Sermão do Monte e justiça do discípulo",
        "start": 5,
        "end": 7,
        "topics": [
          {
            "title": "Bem-aventuranças e identidade",
            "start": 5,
            "end": 5,
            "teaching": "As bem-aventuranças descrevem a vida sob o reino, e sal e luz expressam a vocação pública dos discípulos."
          },
          {
            "title": "Justiça que alcança o coração",
            "start": 5,
            "end": 5,
            "teaching": "Jesus aprofunda a Lei ao tratar ira, reconciliação, fidelidade, verdade e amor aos inimigos."
          },
          {
            "title": "Piedade diante do Pai",
            "start": 6,
            "end": 6,
            "teaching": "Esmola, oração, jejum e confiança são orientados ao Pai, não à busca de reconhecimento humano."
          },
          {
            "title": "Discernimento e obediência",
            "start": 7,
            "end": 7,
            "teaching": "O sermão termina com discernimento, oração perseverante e a imagem de construir sobre a prática das palavras de Jesus."
          }
        ]
      },
      {
        "title": "Autoridade e missão",
        "subtitle": "Sinais do Reino e envio dos Doze",
        "start": 8,
        "end": 10,
        "topics": [
          {
            "title": "Autoridade que restaura",
            "start": 8,
            "end": 8,
            "teaching": "Curas e libertações mostram a autoridade compassiva de Jesus sobre doença, natureza e forças opressoras."
          },
          {
            "title": "Perdão e chamado",
            "start": 9,
            "end": 9,
            "teaching": "Jesus perdoa, chama Mateus e acolhe pessoas marginalizadas, confrontando fronteiras religiosas excludentes."
          },
          {
            "title": "Compaixão pelas multidões",
            "start": 9,
            "end": 9,
            "teaching": "A missão nasce da compaixão de Jesus por pessoas cansadas e desamparadas como ovelhas sem pastor."
          },
          {
            "title": "Envio, oposição e fidelidade",
            "start": 10,
            "end": 10,
            "teaching": "Os Doze são enviados com dependência, coragem e consciência de que testemunhar o reino pode trazer resistência."
          }
        ]
      },
      {
        "title": "Respostas ao Reino",
        "subtitle": "Dúvidas, controvérsias e parábolas",
        "start": 11,
        "end": 13,
        "topics": [
          {
            "title": "Jesus e a dúvida de João",
            "start": 11,
            "end": 11,
            "teaching": "Jesus responde a João apontando para obras do reino e convida os cansados a encontrar descanso nele."
          },
          {
            "title": "Misericórdia e sábado",
            "start": 12,
            "end": 12,
            "teaching": "Conflitos sobre o sábado revelam que misericórdia e o bem humano pertencem ao propósito da Lei."
          },
          {
            "title": "O semeador e os solos",
            "start": 13,
            "end": 13,
            "teaching": "A parábola do semeador chama a ouvir com perseverança e explica respostas diferentes à mensagem do reino."
          },
          {
            "title": "Reino presente e consumação",
            "start": 13,
            "end": 13,
            "teaching": "Joio, mostarda, fermento e rede mostram crescimento discreto, valor incomparável e juízo futuro."
          }
        ]
      },
      {
        "title": "O Messias e sua comunidade",
        "subtitle": "Identidade de Jesus, cruz e relações",
        "start": 14,
        "end": 18,
        "topics": [
          {
            "title": "Pão, tempestade e fé",
            "start": 14,
            "end": 14,
            "teaching": "Jesus alimenta a multidão e encontra os discípulos no mar, revelando provisão e autoridade em meio ao medo."
          },
          {
            "title": "Confissão e caminho da cruz",
            "start": 15,
            "end": 16,
            "teaching": "Após debates sobre pureza, Pedro confessa Jesus; o Messias anuncia sofrimento e redefine discipulado pela cruz."
          },
          {
            "title": "Transfiguração e serviço",
            "start": 17,
            "end": 17,
            "teaching": "A transfiguração confirma a identidade de Jesus, enquanto o retorno ao vale exige fé, serviço e humildade."
          },
          {
            "title": "Cuidado, correção e perdão",
            "start": 18,
            "end": 18,
            "teaching": "A comunidade do reino protege os pequenos, busca quem se perde, corrige visando restauração e perdoa generosamente."
          }
        ]
      },
      {
        "title": "O Rei em Jerusalém",
        "subtitle": "Discipulado, confrontos e denúncia profética",
        "start": 19,
        "end": 23,
        "topics": [
          {
            "title": "Aliança, crianças e riqueza",
            "start": 19,
            "end": 19,
            "teaching": "Jesus ensina sobre fidelidade conjugal, acolhe crianças e expõe como a riqueza pode dominar o coração."
          },
          {
            "title": "Grandeza como serviço",
            "start": 20,
            "end": 20,
            "teaching": "A graça do reino desafia comparação e mérito; o Filho do Homem modela liderança servidora e entrega de si."
          },
          {
            "title": "Entrada e autoridade",
            "start": 21,
            "end": 22,
            "teaching": "Jesus entra em Jerusalém, purifica o templo e responde a debates sobre autoridade, lealdade e ressurreição."
          },
          {
            "title": "Ai dos líderes hipócritas",
            "start": 23,
            "end": 23,
            "teaching": "A denúncia contra escribas e fariseus confronta vaidade, abuso espiritual e incoerência entre ensino e prática."
          }
        ]
      },
      {
        "title": "Paixão e ressurreição",
        "subtitle": "Vigilância, entrega, cruz e missão",
        "start": 24,
        "end": 28,
        "topics": [
          {
            "title": "Vigilância e esperança",
            "start": 24,
            "end": 25,
            "teaching": "O discurso escatológico chama à fidelidade perseverante, ao serviço responsável e ao cuidado dos vulneráveis."
          },
          {
            "title": "Ceia, Getsêmani e prisão",
            "start": 26,
            "end": 26,
            "teaching": "Na última ceia e no jardim, Jesus interpreta sua morte, ora em angústia e permanece obediente diante da traição."
          },
          {
            "title": "Crucificação e sepultamento",
            "start": 27,
            "end": 27,
            "teaching": "O julgamento injusto e a cruz revelam rejeição humana, entrega de Jesus e sinais que apontam para sua identidade."
          },
          {
            "title": "Ressurreição e grande comissão",
            "start": 28,
            "end": 28,
            "teaching": "O Ressuscitado encontra seus discípulos e os envia a fazer discípulos entre todas as nações sob sua autoridade."
          }
        ]
      }
    ]
  },
  {
    "id": "mark",
    "title": "Marcos",
    "shortTitle": "Mc",
    "chapterCount": 16,
    "rationale": "Narrativa dinâmica da autoridade de Jesus, do discipulado incompreendido e da cruz.",
    "units": [
      {
        "title": "Autoridade do Filho de Deus",
        "subtitle": "Início do evangelho e conflitos na Galileia",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "Boa notícia e chamado",
            "start": 1,
            "end": 1,
            "teaching": "Marcos inicia com João, o batismo, a tentação e o chamado dos discípulos para seguir Jesus."
          },
          {
            "title": "Autoridade para perdoar e restaurar",
            "start": 2,
            "end": 2,
            "teaching": "Curas, perdão e refeições com pecadores confrontam sistemas que impedem pessoas de se aproximar de Deus."
          },
          {
            "title": "Uma nova família ao redor de Jesus",
            "start": 3,
            "end": 3,
            "teaching": "O chamado dos Doze e as controvérsias mostram que ouvir e fazer a vontade de Deus redefine pertencimento."
          },
          {
            "title": "Parábolas e poder sobre o caos",
            "start": 4,
            "end": 4,
            "teaching": "Jesus ensina por parábolas e acalma a tempestade, unindo mistério do reino e autoridade sobre o medo."
          }
        ]
      },
      {
        "title": "Sinais e incompreensão",
        "subtitle": "Poder compassivo e aprendizagem dos discípulos",
        "start": 5,
        "end": 8,
        "topics": [
          {
            "title": "Libertação, cura e vida",
            "start": 5,
            "end": 5,
            "teaching": "Jesus restaura um homem oprimido, cura uma mulher e levanta a filha de Jairo, atravessando impureza e desespero."
          },
          {
            "title": "Missão em meio à rejeição",
            "start": 6,
            "end": 6,
            "teaching": "A rejeição em Nazaré, o envio dos Doze e a morte de João mostram o custo da missão fiel."
          },
          {
            "title": "Pureza e pão para todos",
            "start": 7,
            "end": 8,
            "teaching": "Jesus desloca a pureza para o coração, acolhe uma mulher gentia e alimenta multidões além das fronteiras de Israel."
          },
          {
            "title": "A confissão e a cruz",
            "start": 8,
            "end": 8,
            "teaching": "Pedro reconhece o Cristo, mas precisa aprender que o caminho messiânico passa por sofrimento e discipulado sacrificial."
          }
        ]
      },
      {
        "title": "No caminho para Jerusalém",
        "subtitle": "Glória, serviço e fidelidade",
        "start": 9,
        "end": 12,
        "topics": [
          {
            "title": "Transfiguração e fé",
            "start": 9,
            "end": 9,
            "teaching": "A glória no monte não elimina a necessidade de descer, servir e depender de Deus diante do sofrimento."
          },
          {
            "title": "O primeiro e o servo",
            "start": 10,
            "end": 10,
            "teaching": "Jesus acolhe crianças, confronta riqueza e ensina que grandeza no reino significa servir."
          },
          {
            "title": "Entrada, templo e figueira",
            "start": 11,
            "end": 11,
            "teaching": "A chegada a Jerusalém combina esperança messiânica com juízo profético sobre culto sem fruto."
          },
          {
            "title": "Debates e o maior mandamento",
            "start": 12,
            "end": 12,
            "teaching": "Jesus responde a armadilhas, afirma amor a Deus e ao próximo e elogia a entrega da viúva."
          }
        ]
      },
      {
        "title": "A cruz e o anúncio",
        "subtitle": "Vigilância, paixão e ressurreição",
        "start": 13,
        "end": 16,
        "topics": [
          {
            "title": "Perseverar em tempos difíceis",
            "start": 13,
            "end": 13,
            "teaching": "Jesus prepara os discípulos para crises sem alimentar especulação, chamando-os à vigilância fiel."
          },
          {
            "title": "Unção, ceia e Getsêmani",
            "start": 14,
            "end": 14,
            "teaching": "Amor generoso, traição e medo cercam Jesus, que interpreta a ceia e permanece fiel na oração."
          },
          {
            "title": "O Rei crucificado",
            "start": 15,
            "end": 15,
            "teaching": "Marcos apresenta a ironia da realeza de Jesus na cruz e o reconhecimento inesperado do centurião."
          },
          {
            "title": "O túmulo vazio e a missão",
            "start": 16,
            "end": 16,
            "teaching": "As mulheres encontram o túmulo vazio e recebem o anúncio de que Jesus ressuscitou e vai adiante dos discípulos."
          }
        ]
      }
    ]
  },
  {
    "id": "luke",
    "title": "Lucas",
    "shortTitle": "Lc",
    "chapterCount": 24,
    "rationale": "Evangelho amplo, atento à história da salvação, ao Espírito e às pessoas marginalizadas.",
    "units": [
      {
        "title": "Promessa e preparação",
        "subtitle": "Nascimento de João e Jesus, infância e início",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "Anúncios e respostas de fé",
            "start": 1,
            "end": 1,
            "teaching": "Zacarias e Maria recebem anúncios divinos; o cântico de Maria celebra a reversão promovida pela graça."
          },
          {
            "title": "Nascimento e boa notícia",
            "start": 2,
            "end": 2,
            "teaching": "O nascimento de Jesus é anunciado a pastores, e Simeão e Ana reconhecem a salvação preparada para os povos."
          },
          {
            "title": "João e o batismo de Jesus",
            "start": 3,
            "end": 3,
            "teaching": "João exige frutos de arrependimento; o batismo e a genealogia situam Jesus na missão de Deus para a humanidade."
          },
          {
            "title": "Tentação e programa em Nazaré",
            "start": 4,
            "end": 4,
            "teaching": "Jesus vence a tentação e anuncia libertação, graça e cumprimento das Escrituras, provocando admiração e resistência."
          }
        ]
      },
      {
        "title": "O Reino entre os vulneráveis",
        "subtitle": "Chamado, cura, perdão e compaixão",
        "start": 5,
        "end": 8,
        "topics": [
          {
            "title": "Chamado e redes lançadas",
            "start": 5,
            "end": 5,
            "teaching": "A pesca maravilhosa leva Pedro ao reconhecimento e ao chamado; Jesus também toca impuros e perdoa pecados."
          },
          {
            "title": "Amor aos inimigos",
            "start": 6,
            "end": 6,
            "teaching": "Jesus forma uma comunidade marcada por misericórdia, generosidade e coerência entre palavras e ações."
          },
          {
            "title": "Fé, perdão e compaixão",
            "start": 7,
            "end": 7,
            "teaching": "O centurião, a viúva de Naim e a mulher que unge Jesus revelam fé e graça em lugares inesperados."
          },
          {
            "title": "Ouvir, frutificar e confiar",
            "start": 8,
            "end": 8,
            "teaching": "Parábolas, libertação e curas mostram que ouvir a Palavra produz perseverança em meio ao medo."
          }
        ]
      },
      {
        "title": "Identidade e discipulado",
        "subtitle": "Missão, oração e caminho da cruz",
        "start": 9,
        "end": 12,
        "topics": [
          {
            "title": "Confissão, cruz e transfiguração",
            "start": 9,
            "end": 9,
            "teaching": "A identidade de Jesus é ligada ao sofrimento, e o discipulado exige renúncia e escuta do Filho."
          },
          {
            "title": "O bom samaritano",
            "start": 10,
            "end": 10,
            "teaching": "A missão dos setenta e a parábola do samaritano ampliam o próximo e unem anúncio, misericórdia e escuta."
          },
          {
            "title": "Oração e liberdade interior",
            "start": 11,
            "end": 11,
            "teaching": "Jesus ensina a orar, confronta hipocrisia e chama a uma vida iluminada por dentro."
          },
          {
            "title": "Vigilância sem ansiedade",
            "start": 12,
            "end": 12,
            "teaching": "A confiança no cuidado do Pai liberta da avareza e orienta o discípulo a servir com prontidão."
          }
        ]
      },
      {
        "title": "A graça que busca",
        "subtitle": "Arrependimento, mesa e alegria pela restauração",
        "start": 13,
        "end": 16,
        "topics": [
          {
            "title": "Arrependimento e reino em crescimento",
            "start": 13,
            "end": 13,
            "teaching": "Jesus chama ao arrependimento e mostra o reino como semente e fermento que avançam de modo discreto."
          },
          {
            "title": "Humildade e convite aos excluídos",
            "start": 14,
            "end": 14,
            "teaching": "À mesa, Jesus confronta busca de honra e convida a acolher quem não pode retribuir."
          },
          {
            "title": "Perdidos e encontrados",
            "start": 15,
            "end": 15,
            "teaching": "Ovelha, moeda e filhos perdidos revelam a iniciativa e a alegria de Deus na restauração."
          },
          {
            "title": "Dinheiro, fidelidade e o próximo",
            "start": 16,
            "end": 16,
            "teaching": "Jesus relaciona administração, riqueza e responsabilidade, culminando na história do rico e Lázaro."
          }
        ]
      },
      {
        "title": "O Rei se aproxima",
        "subtitle": "Fé perseverante, salvação e chegada a Jerusalém",
        "start": 17,
        "end": 20,
        "topics": [
          {
            "title": "Gratidão, fé e Reino",
            "start": 17,
            "end": 17,
            "teaching": "A cura dos dez leprosos destaca gratidão, enquanto Jesus corrige expectativas simplistas sobre o reino."
          },
          {
            "title": "Oração, justiça e humildade",
            "start": 18,
            "end": 18,
            "teaching": "A viúva persistente e o fariseu com o publicano ensinam perseverança e dependência da misericórdia."
          },
          {
            "title": "Zaqueu e o Rei que serve",
            "start": 19,
            "end": 19,
            "teaching": "A salvação alcança Zaqueu com frutos concretos, e Jesus entra em Jerusalém como Rei humilde."
          },
          {
            "title": "Autoridade e fidelidade pública",
            "start": 20,
            "end": 20,
            "teaching": "Conflitos no templo tratam autoridade, responsabilidade diante de Deus e esperança da ressurreição."
          }
        ]
      },
      {
        "title": "Paixão, ressurreição e testemunho",
        "subtitle": "Últimos ensinos, cruz e caminho de Emaús",
        "start": 21,
        "end": 24,
        "topics": [
          {
            "title": "Vigilância e generosidade",
            "start": 21,
            "end": 21,
            "teaching": "A oferta da viúva e o discurso sobre Jerusalém chamam a uma fidelidade que persevera sem ostentação."
          },
          {
            "title": "Ceia e serviço",
            "start": 22,
            "end": 22,
            "teaching": "Jesus interpreta pão e cálice, ora por Pedro e redefine grandeza como serviço em meio à crise."
          },
          {
            "title": "Inocência, perdão e cruz",
            "start": 23,
            "end": 23,
            "teaching": "Lucas ressalta a inocência de Jesus, sua compaixão e a esperança oferecida mesmo durante a crucificação."
          },
          {
            "title": "Emaús e missão",
            "start": 24,
            "end": 24,
            "teaching": "O Ressuscitado abre as Escrituras, parte o pão e envia testemunhas fortalecidas pela promessa do Espírito."
          }
        ]
      }
    ]
  },
  {
    "id": "john",
    "title": "João",
    "shortTitle": "Jo",
    "chapterCount": 21,
    "rationale": "Evangelho teologicamente denso, estruturado por sinais, discursos e a revelação do Filho.",
    "units": [
      {
        "title": "O Verbo e os primeiros sinais",
        "subtitle": "Identidade de Jesus, novo nascimento e adoração",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "O Verbo se fez carne",
            "start": 1,
            "end": 1,
            "teaching": "O prólogo apresenta o Verbo eterno, criador e encarnado, e João Batista aponta para Jesus."
          },
          {
            "title": "Sinais e zelo pela casa do Pai",
            "start": 2,
            "end": 2,
            "teaching": "Caná manifesta a glória de Jesus, e a purificação do templo aponta para sua autoridade e corpo."
          },
          {
            "title": "Novo nascimento e amor de Deus",
            "start": 3,
            "end": 3,
            "teaching": "Jesus ensina Nicodemos sobre nascer do Espírito e relaciona salvação à iniciativa amorosa de Deus."
          },
          {
            "title": "Água viva e adoração",
            "start": 4,
            "end": 4,
            "teaching": "Com a mulher samaritana, Jesus atravessa barreiras e anuncia adoração em espírito e verdade."
          }
        ]
      },
      {
        "title": "Vida no Filho",
        "subtitle": "Autoridade, pão da vida e água viva",
        "start": 5,
        "end": 8,
        "topics": [
          {
            "title": "O Filho dá vida e julga",
            "start": 5,
            "end": 5,
            "teaching": "A cura no sábado conduz a um discurso sobre a obra conjunta do Pai e do Filho em dar vida."
          },
          {
            "title": "Pão da vida",
            "start": 6,
            "end": 6,
            "teaching": "Depois da multiplicação, Jesus chama a buscar o alimento que permanece e apresenta-se como pão da vida."
          },
          {
            "title": "Água viva no meio da festa",
            "start": 7,
            "end": 7,
            "teaching": "Em contexto de conflito, Jesus convida os sedentos a vir a ele e fala do Espírito."
          },
          {
            "title": "Luz, liberdade e verdade",
            "start": 8,
            "end": 8,
            "teaching": "Jesus se apresenta como luz do mundo e confronta uma liberdade baseada apenas em origem religiosa."
          }
        ]
      },
      {
        "title": "Sinais diante da incredulidade",
        "subtitle": "Cegueira, pastoreio e vida sobre a morte",
        "start": 9,
        "end": 12,
        "topics": [
          {
            "title": "O cego que passa a ver",
            "start": 9,
            "end": 9,
            "teaching": "A cura do cego de nascença expõe cegueira espiritual e o custo de confessar Jesus."
          },
          {
            "title": "O bom pastor",
            "start": 10,
            "end": 10,
            "teaching": "Jesus contrasta seu cuidado sacrificial com líderes que exploram ou abandonam o rebanho."
          },
          {
            "title": "Lázaro e a ressurreição",
            "start": 11,
            "end": 11,
            "teaching": "Jesus chora diante da morte e chama Lázaro para fora, sinal que intensifica tanto fé quanto oposição."
          },
          {
            "title": "A hora da glorificação",
            "start": 12,
            "end": 12,
            "teaching": "A entrada em Jerusalém e o grão que morre anunciam que a glória de Jesus se revela em sua entrega."
          }
        ]
      },
      {
        "title": "Amor, Espírito e permanência",
        "subtitle": "Discurso de despedida e oração de Jesus",
        "start": 13,
        "end": 17,
        "topics": [
          {
            "title": "Lava-pés e novo mandamento",
            "start": 13,
            "end": 13,
            "teaching": "Jesus serve seus discípulos e ordena um amor que torne sua comunidade reconhecível."
          },
          {
            "title": "O caminho e o Consolador",
            "start": 14,
            "end": 14,
            "teaching": "Jesus consola os discípulos, promete o Espírito e relaciona amor com obediência."
          },
          {
            "title": "Videira, amizade e testemunho",
            "start": 15,
            "end": 15,
            "teaching": "Permanecer em Cristo produz fruto, amor e coragem diante da oposição."
          },
          {
            "title": "Tristeza transformada e oração",
            "start": 16,
            "end": 17,
            "teaching": "Jesus promete a ação do Espírito e ora pela unidade, santidade e missão de seus seguidores."
          }
        ]
      },
      {
        "title": "Cruz, ressurreição e missão",
        "subtitle": "O Rei entrega a vida e restaura discípulos",
        "start": 18,
        "end": 21,
        "topics": [
          {
            "title": "Prisão e julgamento",
            "start": 18,
            "end": 18,
            "teaching": "Jesus enfrenta prisão e interrogatórios com autoridade serena, enquanto Pedro experimenta sua fragilidade."
          },
          {
            "title": "Está consumado",
            "start": 19,
            "end": 19,
            "teaching": "A crucificação é apresentada como entrega soberana; o texto registra morte real e sepultamento."
          },
          {
            "title": "Maria, Tomé e a fé pascal",
            "start": 20,
            "end": 20,
            "teaching": "O Ressuscitado chama Maria pelo nome, envia discípulos e encontra a dúvida honesta de Tomé."
          },
          {
            "title": "Pesca, mesa e restauração",
            "start": 21,
            "end": 21,
            "teaching": "À margem do mar, Jesus provê, restaura Pedro e chama novamente ao seguimento."
          }
        ]
      }
    ]
  },
  {
    "id": "acts",
    "title": "Atos",
    "shortTitle": "At",
    "chapterCount": 28,
    "rationale": "Segundo volume de Lucas, acompanhando o Espírito e a expansão do testemunho até Roma.",
    "units": [
      {
        "title": "O Espírito forma a Igreja",
        "subtitle": "Ascensão, Pentecostes e vida comunitária",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "Promessa e testemunho",
            "start": 1,
            "end": 1,
            "teaching": "Jesus promete poder do Espírito para o testemunho e ascende; a comunidade espera em oração."
          },
          {
            "title": "Pentecostes e anúncio",
            "start": 2,
            "end": 2,
            "teaching": "O Espírito é derramado, Pedro anuncia Jesus ressuscitado e uma comunidade de ensino, comunhão e partilha surge."
          },
          {
            "title": "Cura e chamado ao arrependimento",
            "start": 3,
            "end": 3,
            "teaching": "A cura no templo se torna ocasião para apontar para Jesus e convocar à conversão."
          },
          {
            "title": "Coragem diante da oposição",
            "start": 4,
            "end": 4,
            "teaching": "Pedro e João testemunham diante das autoridades, e a igreja ora por ousadia em vez de segurança."
          }
        ]
      },
      {
        "title": "Santidade, serviço e perseguição",
        "subtitle": "Crises internas e avanço da Palavra",
        "start": 5,
        "end": 8,
        "topics": [
          {
            "title": "Verdade e integridade comunitária",
            "start": 5,
            "end": 5,
            "teaching": "Ananias e Safira mostram a gravidade da mentira, enquanto os apóstolos perseveram sob pressão."
          },
          {
            "title": "Serviço organizado e Estêvão",
            "start": 6,
            "end": 6,
            "teaching": "A igreja responde a uma desigualdade prática e reconhece pessoas para servir; Estêvão testemunha com sabedoria."
          },
          {
            "title": "Estêvão e a história de Israel",
            "start": 7,
            "end": 7,
            "teaching": "O discurso de Estêvão relembra a resistência à ação de Deus e culmina em seu martírio."
          },
          {
            "title": "Samaria e o eunuco",
            "start": 8,
            "end": 8,
            "teaching": "A perseguição espalha o evangelho, alcançando samaritanos e um oficial etíope por direção do Espírito."
          }
        ]
      },
      {
        "title": "Conversões e fronteiras abertas",
        "subtitle": "Saulo, Cornélio e Antioquia",
        "start": 9,
        "end": 12,
        "topics": [
          {
            "title": "Saulo encontra Jesus",
            "start": 9,
            "end": 9,
            "teaching": "O perseguidor é confrontado pelo Ressuscitado, acolhido por Ananias e transformado em testemunha."
          },
          {
            "title": "Cornélio e a inclusão dos gentios",
            "start": 10,
            "end": 10,
            "teaching": "Deus prepara Pedro e Cornélio, derramando o Espírito antes que barreiras humanas sejam reafirmadas."
          },
          {
            "title": "Antioquia e uma igreja missionária",
            "start": 11,
            "end": 11,
            "teaching": "A comunidade reconhece a graça entre gentios e Antioquia se torna centro de ensino e generosidade."
          },
          {
            "title": "Oposição, oração e livramento",
            "start": 12,
            "end": 12,
            "teaching": "Herodes persegue a igreja, Pedro é libertado e o poder imperial não impede o avanço da Palavra."
          }
        ]
      },
      {
        "title": "Primeira missão e concílio",
        "subtitle": "Evangelho entre os povos e discernimento comum",
        "start": 13,
        "end": 16,
        "topics": [
          {
            "title": "Enviados pelo Espírito",
            "start": 13,
            "end": 13,
            "teaching": "A igreja em Antioquia envia Barnabé e Saulo, que anunciam Jesus em contextos judeus e gentios."
          },
          {
            "title": "Fé, perseverança e liderança",
            "start": 14,
            "end": 14,
            "teaching": "A missão enfrenta oposição, fortalece discípulos e estabelece presbíteros nas novas comunidades."
          },
          {
            "title": "O concílio de Jerusalém",
            "start": 15,
            "end": 15,
            "teaching": "A igreja discerne que gentios não precisam tornar-se judeus para receber a graça, preservando comunhão e santidade."
          },
          {
            "title": "Macedônia, Lídia e o carcereiro",
            "start": 16,
            "end": 16,
            "teaching": "O Espírito redireciona a missão, e pessoas de posições diversas formam a igreja em Filipos."
          }
        ]
      },
      {
        "title": "O evangelho no mundo greco-romano",
        "subtitle": "Atenas, Corinto e Éfeso",
        "start": 17,
        "end": 20,
        "topics": [
          {
            "title": "Bereia e Atenas",
            "start": 17,
            "end": 17,
            "teaching": "A Palavra é examinada em Bereia, e Paulo dialoga em Atenas partindo do contexto sem diluir o chamado ao arrependimento."
          },
          {
            "title": "Corinto e perseverança",
            "start": 18,
            "end": 18,
            "teaching": "Paulo trabalha, ensina e recebe encorajamento; Priscila e Áquila ajudam Apolo a compreender com mais precisão."
          },
          {
            "title": "Éfeso e transformação pública",
            "start": 19,
            "end": 19,
            "teaching": "O evangelho confronta práticas mágicas e interesses econômicos ligados à idolatria."
          },
          {
            "title": "Despedida aos presbíteros",
            "start": 20,
            "end": 20,
            "teaching": "Paulo resume seu ministério e chama líderes a vigiar, servir e cuidar do rebanho sem ganância."
          }
        ]
      },
      {
        "title": "Testemunho em cadeias",
        "subtitle": "Jerusalém, defesas e vocação",
        "start": 21,
        "end": 24,
        "topics": [
          {
            "title": "Chegada a Jerusalém",
            "start": 21,
            "end": 21,
            "teaching": "Paulo busca unidade, enfrenta acusações e usa sua prisão como ocasião de testemunho."
          },
          {
            "title": "Relato da conversão e cidadania",
            "start": 22,
            "end": 22,
            "teaching": "Paulo narra seu encontro com Jesus e usa legitimamente sua cidadania diante de abuso."
          },
          {
            "title": "Esperança da ressurreição",
            "start": 23,
            "end": 23,
            "teaching": "Diante do conselho e de uma conspiração, Paulo mantém o foco na esperança da ressurreição."
          },
          {
            "title": "Justiça diante de Félix",
            "start": 24,
            "end": 24,
            "teaching": "Paulo responde a acusações e fala sobre justiça, domínio próprio e juízo."
          }
        ]
      },
      {
        "title": "Até os confins",
        "subtitle": "Apelos, naufrágio e chegada a Roma",
        "start": 25,
        "end": 28,
        "topics": [
          {
            "title": "Apelo a César",
            "start": 25,
            "end": 25,
            "teaching": "Paulo usa o processo legal para evitar manipulação e levar seu testemunho a Roma."
          },
          {
            "title": "Testemunho diante de Agripa",
            "start": 26,
            "end": 26,
            "teaching": "Paulo conta sua vocação e apresenta a ressurreição como cumprimento da esperança profética."
          },
          {
            "title": "Tempestade, coragem e cuidado",
            "start": 27,
            "end": 27,
            "teaching": "No naufrágio, Paulo combina confiança em Deus com decisões práticas para preservar vidas."
          },
          {
            "title": "O evangelho em Roma",
            "start": 28,
            "end": 28,
            "teaching": "Atos termina com Paulo anunciando o reino em Roma com liberdade, apesar de suas cadeias."
          }
        ]
      }
    ]
  },
  {
    "id": "romans",
    "title": "Romanos",
    "shortTitle": "Rm",
    "chapterCount": 16,
    "rationale": "Carta central para compreender pecado, graça, fé, nova vida, Israel e ética cristã.",
    "units": [
      {
        "title": "O evangelho e a justiça de Deus",
        "subtitle": "Necessidade universal e justificação pela fé",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "O evangelho revela a justiça de Deus",
            "start": 1,
            "end": 1,
            "teaching": "Paulo apresenta o evangelho como poder de Deus e descreve a desordem produzida pela rejeição da verdade."
          },
          {
            "title": "Judeus e gentios sob o pecado",
            "start": 2,
            "end": 3,
            "teaching": "Privilégio religioso não elimina responsabilidade; todos carecem da glória e dependem da graça."
          },
          {
            "title": "Justificados gratuitamente",
            "start": 3,
            "end": 3,
            "teaching": "A justiça de Deus é recebida pela fé em Jesus, excluindo vanglória e estabelecendo a graça."
          },
          {
            "title": "Abraão, fé e promessa",
            "start": 4,
            "end": 4,
            "teaching": "Abraão é apresentado como pai dos que creem antes da circuncisão, fortalecendo a unidade entre povos."
          }
        ]
      },
      {
        "title": "Nova humanidade em Cristo",
        "subtitle": "Paz, união com Cristo, Lei e Espírito",
        "start": 5,
        "end": 8,
        "topics": [
          {
            "title": "Paz com Deus e esperança",
            "start": 5,
            "end": 5,
            "teaching": "A justificação produz paz, esperança e uma nova humanidade em Cristo, contrastada com Adão."
          },
          {
            "title": "Unidos à morte e ressurreição",
            "start": 6,
            "end": 6,
            "teaching": "A graça não autoriza permanência no pecado; o batismo aponta para uma vida oferecida a Deus."
          },
          {
            "title": "A Lei e o conflito humano",
            "start": 7,
            "end": 7,
            "teaching": "Paulo descreve a bondade da Lei e a incapacidade do pecado humano, preparando o anúncio da vida no Espírito."
          },
          {
            "title": "Vida no Espírito e esperança",
            "start": 8,
            "end": 8,
            "teaching": "Nenhuma condenação, adoção, auxílio do Espírito e esperança da criação sustentam os que estão em Cristo."
          }
        ]
      },
      {
        "title": "Israel e a fidelidade de Deus",
        "subtitle": "Eleição, responsabilidade e misericórdia",
        "start": 9,
        "end": 11,
        "topics": [
          {
            "title": "Angústia de Paulo por Israel",
            "start": 9,
            "end": 9,
            "teaching": "Paulo lamenta por Israel e defende a fidelidade da promessa, recorrendo à história da eleição e da misericórdia."
          },
          {
            "title": "A palavra da fé",
            "start": 10,
            "end": 10,
            "teaching": "Cristo é o alvo da Lei, a salvação é anunciada a todos, e ouvir exige mensageiros."
          },
          {
            "title": "Remanescente e oliveira",
            "start": 11,
            "end": 11,
            "teaching": "A incredulidade não significa rejeição total; gentios são advertidos contra arrogância na imagem da oliveira."
          },
          {
            "title": "Misericórdia para todos",
            "start": 11,
            "end": 11,
            "teaching": "Paulo encerra a seção contemplando o propósito de Deus de alcançar judeus e gentios com misericórdia."
          }
        ]
      },
      {
        "title": "Culto em toda a vida",
        "subtitle": "Comunidade, consciência, missão e unidade",
        "start": 12,
        "end": 16,
        "topics": [
          {
            "title": "Corpo, dons e amor sincero",
            "start": 12,
            "end": 12,
            "teaching": "O culto racional envolve mente renovada, serviço com dons e amor que vence o mal com o bem."
          },
          {
            "title": "Autoridades e amor ao próximo",
            "start": 13,
            "end": 13,
            "teaching": "Paulo trata responsabilidades públicas sem absolutizar governos e resume a Lei no amor."
          },
          {
            "title": "Fortes e fracos na fé",
            "start": 14,
            "end": 15,
            "teaching": "Diferenças de consciência devem ser tratadas sem desprezo, buscando edificação e acolhimento mútuo."
          },
          {
            "title": "Missão, cooperação e mulheres no evangelho",
            "start": 15,
            "end": 16,
            "teaching": "Paulo explica seus planos e saúda uma ampla rede de cooperadores, mostrando missão como trabalho comunitário."
          }
        ]
      }
    ]
  },
  {
    "id": "1-corinthians",
    "title": "1 Coríntios",
    "shortTitle": "1Co",
    "chapterCount": 16,
    "rationale": "Carta extensa que corrige divisões e forma a igreja em santidade, amor, culto e esperança.",
    "units": [
      {
        "title": "A cruz e a comunidade",
        "subtitle": "Divisões, liderança e maturidade",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "A palavra da cruz",
            "start": 1,
            "end": 1,
            "teaching": "A cruz confronta orgulho, status e sabedoria usada para competição dentro da igreja."
          },
          {
            "title": "Sabedoria revelada pelo Espírito",
            "start": 2,
            "end": 2,
            "teaching": "Paulo distingue a sabedoria de Deus da autopromoção e aponta para a ação do Espírito."
          },
          {
            "title": "Cooperadores no campo de Deus",
            "start": 3,
            "end": 3,
            "teaching": "Líderes são servos; Deus dá o crescimento, e a comunidade é templo que deve ser cuidada."
          },
          {
            "title": "Mordomia e humildade apostólica",
            "start": 4,
            "end": 4,
            "teaching": "Os apóstolos são administradores e exemplos de serviço, não celebridades para alimentar facções."
          }
        ]
      },
      {
        "title": "Santidade e liberdade responsável",
        "subtitle": "Corpo, casamento e consciência",
        "start": 5,
        "end": 8,
        "topics": [
          {
            "title": "Disciplina visando restauração",
            "start": 5,
            "end": 5,
            "teaching": "A igreja deve enfrentar pecado grave com verdade e responsabilidade, sem orgulho moralista."
          },
          {
            "title": "Conflitos, corpo e pertencimento",
            "start": 6,
            "end": 6,
            "teaching": "Litígios e imoralidade contradizem a identidade de quem foi lavado e cujo corpo pertence ao Senhor."
          },
          {
            "title": "Casamento, solteirice e vocação",
            "start": 7,
            "end": 7,
            "teaching": "Paulo responde pastoralmente a diferentes estados de vida, valorizando fidelidade e serviço."
          },
          {
            "title": "Conhecimento governado pelo amor",
            "start": 8,
            "end": 8,
            "teaching": "A liberdade cristã considera a consciência do irmão; conhecimento sem amor pode ferir."
          }
        ]
      },
      {
        "title": "Missão, mesa e dons",
        "subtitle": "Renúncia, ceia e vida comunitária",
        "start": 9,
        "end": 12,
        "topics": [
          {
            "title": "Direitos renunciados pelo evangelho",
            "start": 9,
            "end": 9,
            "teaching": "Paulo abre mão de direitos legítimos para remover obstáculos e participar da missão."
          },
          {
            "title": "Advertências do deserto",
            "start": 10,
            "end": 10,
            "teaching": "A história de Israel alerta contra idolatria e presunção, e a mesa do Senhor exige lealdade."
          },
          {
            "title": "Ceia sem humilhação",
            "start": 11,
            "end": 11,
            "teaching": "A ceia é corrompida quando reproduz desigualdade; discernir o corpo inclui esperar e acolher."
          },
          {
            "title": "Um corpo, muitos dons",
            "start": 12,
            "end": 12,
            "teaching": "O Espírito distribui dons diversos para o bem comum, sem permitir superioridade ou exclusão."
          }
        ]
      },
      {
        "title": "Amor, ressurreição e generosidade",
        "subtitle": "O caminho excelente e a esperança final",
        "start": 13,
        "end": 16,
        "topics": [
          {
            "title": "O caminho do amor",
            "start": 13,
            "end": 13,
            "teaching": "Dons e conhecimento perdem valor sem amor paciente, verdadeiro e perseverante."
          },
          {
            "title": "Culto inteligível e edificante",
            "start": 14,
            "end": 14,
            "teaching": "Dons no culto devem edificar a comunidade com ordem, compreensão e participação responsável."
          },
          {
            "title": "A ressurreição dos mortos",
            "start": 15,
            "end": 15,
            "teaching": "A ressurreição de Cristo fundamenta o evangelho e garante a esperança corporal do povo de Deus."
          },
          {
            "title": "Coleta, vigilância e cooperação",
            "start": 16,
            "end": 16,
            "teaching": "Generosidade planejada, firmeza amorosa e reconhecimento de cooperadores encerram a carta."
          }
        ]
      }
    ]
  },
  {
    "id": "2-corinthians",
    "title": "2 Coríntios",
    "shortTitle": "2Co",
    "chapterCount": 13,
    "rationale": "Carta marcada por reconciliação, fragilidade apostólica, generosidade e defesa do ministério.",
    "units": [
      {
        "title": "Consolo e nova aliança",
        "subtitle": "Sofrimento, perdão e ministério do Espírito",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "Consolo em toda tribulação",
            "start": 1,
            "end": 1,
            "teaching": "Deus consola Paulo para que ele também console outros; sofrimento e esperança são compartilhados."
          },
          {
            "title": "Perdão e restauração",
            "start": 2,
            "end": 2,
            "teaching": "A disciplina não deve se tornar crueldade; quando há resposta, a comunidade é chamada a confirmar amor."
          },
          {
            "title": "Ministros da nova aliança",
            "start": 3,
            "end": 3,
            "teaching": "A suficiência vem de Deus, e o ministério do Espírito transforma pessoas à imagem do Senhor."
          },
          {
            "title": "Tesouro em vasos de barro",
            "start": 4,
            "end": 4,
            "teaching": "A fragilidade do mensageiro impede que o poder seja confundido com autopromoção humana."
          }
        ]
      },
      {
        "title": "Reconciliação e generosidade",
        "subtitle": "Nova criação, santidade e oferta",
        "start": 5,
        "end": 9,
        "topics": [
          {
            "title": "Nova criação e reconciliação",
            "start": 5,
            "end": 5,
            "teaching": "Em Cristo há nova criação, e a igreja recebe o ministério de anunciar e praticar reconciliação."
          },
          {
            "title": "Integridade em meio às aflições",
            "start": 6,
            "end": 7,
            "teaching": "Paulo abre o coração, chama à santidade e se alegra com a tristeza que produz arrependimento."
          },
          {
            "title": "A graça de contribuir",
            "start": 8,
            "end": 8,
            "teaching": "As igrejas da Macedônia exemplificam generosidade; Cristo é o padrão, e a administração deve ser transparente."
          },
          {
            "title": "Semear com alegria",
            "start": 9,
            "end": 9,
            "teaching": "A oferta é voluntária, planejada e capaz de produzir gratidão a Deus e cuidado entre comunidades."
          }
        ]
      },
      {
        "title": "Poder aperfeiçoado na fraqueza",
        "subtitle": "Autoridade, espinho e exame comunitário",
        "start": 10,
        "end": 13,
        "topics": [
          {
            "title": "Armas que não são carnais",
            "start": 10,
            "end": 10,
            "teaching": "Paulo defende autoridade para edificar e rejeita critérios de aparência e comparação."
          },
          {
            "title": "Falsos apóstolos e serviço custoso",
            "start": 11,
            "end": 11,
            "teaching": "A lista de sofrimentos desmonta modelos triunfalistas de liderança e expõe manipulação religiosa."
          },
          {
            "title": "Graça suficiente",
            "start": 12,
            "end": 12,
            "teaching": "O espinho impede exaltação, e o poder de Cristo se manifesta na fraqueza dependente."
          },
          {
            "title": "Examinai-vos e buscai restauração",
            "start": 13,
            "end": 13,
            "teaching": "A carta termina chamando ao autoexame, à maturidade, à paz e à comunhão trinitária."
          }
        ]
      }
    ]
  },
  {
    "id": "galatians",
    "title": "Gálatas",
    "shortTitle": "Gl",
    "chapterCount": 6,
    "rationale": "Carta breve e densa sobre o evangelho da graça, fé, liberdade e vida no Espírito.",
    "units": [
      {
        "title": "Um só evangelho",
        "subtitle": "Autoridade apostólica e justificação pela fé",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Nenhum outro evangelho",
            "start": 1,
            "end": 1,
            "teaching": "Paulo rejeita mensagens que acrescentem requisitos à graça e narra a origem divina de seu chamado."
          },
          {
            "title": "Unidade e confronto em Antioquia",
            "start": 2,
            "end": 2,
            "teaching": "A missão aos gentios é reconhecida, e Paulo confronta uma prática que negava a verdade do evangelho."
          },
          {
            "title": "Justificados pela fé em Cristo",
            "start": 2,
            "end": 2,
            "teaching": "A justiça não vem das obras da Lei, e a vida cristã é descrita como participação na vida do Filho."
          },
          {
            "title": "Promessa antes da Lei",
            "start": 3,
            "end": 3,
            "teaching": "Abraão recebeu a promessa pela fé; a Lei tem papel pedagógico, mas não substitui a promessa."
          }
        ]
      },
      {
        "title": "Liberdade que serve",
        "subtitle": "Filiação, Espírito e nova criação",
        "start": 4,
        "end": 6,
        "topics": [
          {
            "title": "Filhos e herdeiros",
            "start": 4,
            "end": 4,
            "teaching": "Deus envia o Filho e o Espírito para libertar da escravidão e formar uma relação filial."
          },
          {
            "title": "Permanecei firmes na liberdade",
            "start": 5,
            "end": 5,
            "teaching": "A liberdade não é licença para egoísmo; a fé atua pelo amor e resiste a novos jugos."
          },
          {
            "title": "Fruto do Espírito",
            "start": 5,
            "end": 5,
            "teaching": "Obras da carne e fruto do Espírito descrevem caminhos comunitários opostos, não uma lista para vanglória."
          },
          {
            "title": "Levar as cargas e semear",
            "start": 6,
            "end": 6,
            "teaching": "A vida no Espírito restaura com mansidão, carrega fardos e persevera em fazer o bem."
          }
        ]
      }
    ]
  },
  {
    "id": "ephesians",
    "title": "Efésios",
    "shortTitle": "Ef",
    "chapterCount": 6,
    "rationale": "Carta densa sobre a obra de Deus em Cristo, a unidade da igreja e a nova maneira de viver.",
    "units": [
      {
        "title": "Uma nova humanidade",
        "subtitle": "Bênçãos em Cristo, graça e reconciliação",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Bênçãos e propósito em Cristo",
            "start": 1,
            "end": 1,
            "teaching": "A abertura celebra eleição, adoção, redenção e o propósito de reunir todas as coisas em Cristo."
          },
          {
            "title": "Salvos pela graça para boas obras",
            "start": 2,
            "end": 2,
            "teaching": "A salvação é dom, não motivo de vanglória, e cria pessoas destinadas a uma vida de boas obras."
          },
          {
            "title": "Cristo derruba o muro",
            "start": 2,
            "end": 2,
            "teaching": "Judeus e gentios são reconciliados em um só corpo, formando uma nova humanidade e habitação de Deus."
          },
          {
            "title": "O mistério e a oração de Paulo",
            "start": 3,
            "end": 3,
            "teaching": "A inclusão dos gentios manifesta a sabedoria de Deus, e Paulo ora por compreensão do amor de Cristo."
          }
        ]
      },
      {
        "title": "Andar de modo digno",
        "subtitle": "Unidade, santidade, relações e batalha espiritual",
        "start": 4,
        "end": 6,
        "topics": [
          {
            "title": "Um corpo e dons para maturidade",
            "start": 4,
            "end": 4,
            "teaching": "A unidade é cultivada com humildade, e dons equipam todo o corpo para crescer em Cristo."
          },
          {
            "title": "Despindo o velho modo de viver",
            "start": 4,
            "end": 5,
            "teaching": "Verdade, trabalho honesto, perdão, amor e sabedoria substituem práticas que ferem a comunidade."
          },
          {
            "title": "Relações transformadas pela submissão a Cristo",
            "start": 5,
            "end": 6,
            "teaching": "Família e trabalho são examinados sob o senhorio de Cristo, confrontando dominação e exigindo cuidado responsável."
          },
          {
            "title": "A armadura de Deus",
            "start": 6,
            "end": 6,
            "teaching": "A resistência cristã depende da verdade, justiça, paz, fé, salvação, Palavra e oração."
          }
        ]
      }
    ]
  },
  {
    "id": "philippians",
    "title": "Filipenses",
    "shortTitle": "Fp",
    "chapterCount": 4,
    "rationale": "Carta curta, porém densa em cristologia, alegria, parceria missionária e perseverança.",
    "units": [
      {
        "title": "Alegria e mente de Cristo",
        "subtitle": "Evangelho, humildade e contentamento",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "Parceria e avanço do evangelho",
            "start": 1,
            "end": 1,
            "teaching": "Paulo agradece a parceria da igreja e interpreta suas cadeias como oportunidade de testemunho."
          },
          {
            "title": "A mente de Cristo",
            "start": 2,
            "end": 2,
            "teaching": "O hino cristológico apresenta a humildade e exaltação de Jesus como padrão para a comunidade."
          },
          {
            "title": "Conhecer Cristo e prosseguir",
            "start": 3,
            "end": 3,
            "teaching": "Paulo rejeita confiança em credenciais e busca participar de Cristo, avançando para o alvo."
          },
          {
            "title": "Alegria, oração e contentamento",
            "start": 4,
            "end": 4,
            "teaching": "Paz, pensamento virtuoso, reconciliação e contentamento sustentam uma igreja generosa."
          }
        ]
      }
    ]
  },
  {
    "id": "colossians",
    "title": "Colossenses",
    "shortTitle": "Cl",
    "chapterCount": 4,
    "rationale": "Carta breve centrada na supremacia e suficiência de Cristo e na nova vida comunitária.",
    "units": [
      {
        "title": "Cristo é suficiente",
        "subtitle": "Supremacia, discernimento e nova vida",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "A supremacia do Filho",
            "start": 1,
            "end": 1,
            "teaching": "Cristo é imagem de Deus, agente da criação, cabeça da igreja e reconciliador pela cruz."
          },
          {
            "title": "Enraizados em Cristo",
            "start": 2,
            "end": 2,
            "teaching": "A igreja é advertida contra filosofias e práticas que prometem plenitude fora de Cristo."
          },
          {
            "title": "Buscar as coisas do alto",
            "start": 3,
            "end": 3,
            "teaching": "A união com Cristo implica abandonar vícios, vestir virtudes e formar uma comunidade sem antigas barreiras."
          },
          {
            "title": "Palavra, oração e testemunho",
            "start": 3,
            "end": 4,
            "teaching": "Relações domésticas, oração perseverante e fala graciosa integram a nova vida."
          }
        ]
      }
    ]
  },
  {
    "id": "1-thessalonians",
    "title": "1 Tessalonicenses",
    "shortTitle": "1Ts",
    "chapterCount": 5,
    "rationale": "Carta pastoral que une conversão, santidade, esperança na ressurreição e vida comunitária.",
    "units": [
      {
        "title": "Uma igreja que persevera",
        "subtitle": "Conversão, cuidado pastoral e firmeza",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Fé, amor e esperança",
            "start": 1,
            "end": 1,
            "teaching": "A conversão dos tessalonicenses torna-se exemplo de abandono dos ídolos e espera pelo Filho."
          },
          {
            "title": "Ministério com ternura e integridade",
            "start": 2,
            "end": 2,
            "teaching": "Paulo descreve cuidado semelhante ao de mãe e pai, rejeitando bajulação e exploração."
          },
          {
            "title": "Saudade, oposição e alegria",
            "start": 2,
            "end": 2,
            "teaching": "A separação não rompe o vínculo pastoral; a perseverança da igreja é a alegria de seus missionários."
          },
          {
            "title": "Timóteo fortalece a fé",
            "start": 3,
            "end": 3,
            "teaching": "Timóteo confirma a firmeza da comunidade, e Paulo ora por amor crescente e santidade."
          }
        ]
      },
      {
        "title": "Santidade e esperança",
        "subtitle": "Vida que agrada a Deus e o Dia do Senhor",
        "start": 4,
        "end": 5,
        "topics": [
          {
            "title": "Santificação no corpo e no amor",
            "start": 4,
            "end": 4,
            "teaching": "A vontade de Deus inclui santidade sexual, amor fraternal e uma vida responsável."
          },
          {
            "title": "Esperança para os que morreram",
            "start": 4,
            "end": 4,
            "teaching": "A ressurreição de Jesus fundamenta consolo e esperança para os cristãos falecidos."
          },
          {
            "title": "Filhos da luz",
            "start": 5,
            "end": 5,
            "teaching": "O Dia do Senhor chama à vigilância, sobriedade, fé, amor e esperança, não ao pânico."
          },
          {
            "title": "Cuidar da comunidade e discernir",
            "start": 5,
            "end": 5,
            "teaching": "A carta termina com respeito, paciência, oração, gratidão e exame responsável das profecias."
          }
        ]
      }
    ]
  },
  {
    "id": "2-thessalonians",
    "title": "2 Tessalonicenses",
    "shortTitle": "2Ts",
    "chapterCount": 3,
    "rationale": "Carta curta sobre perseverança, discernimento escatológico e trabalho responsável.",
    "units": [
      {
        "title": "Perseverança até a vinda",
        "subtitle": "Esperança sem alarmismo e fidelidade cotidiana",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Fé em meio à perseguição",
            "start": 1,
            "end": 1,
            "teaching": "Paulo agradece o crescimento da fé e encoraja uma comunidade que sofre sem romantizar sua dor."
          },
          {
            "title": "Não vos perturbeis facilmente",
            "start": 2,
            "end": 2,
            "teaching": "A igreja não deve ser abalada por mensagens alarmistas sobre o Dia do Senhor."
          },
          {
            "title": "Firmes na verdade e no amor",
            "start": 2,
            "end": 2,
            "teaching": "A resposta ao engano é permanecer na tradição apostólica e confiar na consolação de Deus."
          },
          {
            "title": "Trabalho, disciplina e paz",
            "start": 3,
            "end": 3,
            "teaching": "Esperar por Cristo não justifica ociosidade; a comunidade corrige com firmeza fraterna e busca paz."
          }
        ]
      }
    ]
  },
  {
    "id": "1-timothy",
    "title": "1 Timóteo",
    "shortTitle": "1Tm",
    "chapterCount": 6,
    "rationale": "Carta pastoral com ensino sobre doutrina, culto, liderança, cuidado e uso das riquezas.",
    "units": [
      {
        "title": "Doutrina e vida comunitária",
        "subtitle": "Evangelho, oração e liderança",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Sã doutrina e misericórdia",
            "start": 1,
            "end": 1,
            "teaching": "Paulo combate especulações e apresenta sua própria transformação como exemplo da misericórdia de Cristo."
          },
          {
            "title": "Oração por todos",
            "start": 2,
            "end": 2,
            "teaching": "A igreja é chamada a orar por todas as pessoas e a viver com paz e testemunho público."
          },
          {
            "title": "Homens e mulheres no culto",
            "start": 2,
            "end": 2,
            "teaching": "As instruções refletem desafios locais e exigem interpretação responsável, sem transformar dominação cultural em ideal eterno."
          },
          {
            "title": "Caráter de líderes e diáconos",
            "start": 3,
            "end": 3,
            "teaching": "Liderança é avaliada por caráter, maturidade, hospitalidade e boa reputação, não apenas habilidade."
          }
        ]
      },
      {
        "title": "Piedade e responsabilidade",
        "subtitle": "Cuidado, dinheiro e bom combate",
        "start": 4,
        "end": 6,
        "topics": [
          {
            "title": "Treinados na piedade",
            "start": 4,
            "end": 4,
            "teaching": "O bom ministro rejeita mitos, cultiva exemplo e dedica-se ao ensino com perseverança."
          },
          {
            "title": "Família da fé e pessoas vulneráveis",
            "start": 5,
            "end": 5,
            "teaching": "A igreja organiza cuidado com viúvas, presbíteros e diferentes gerações com justiça e discernimento."
          },
          {
            "title": "Piedade com contentamento",
            "start": 6,
            "end": 6,
            "teaching": "O amor ao dinheiro é denunciado, e riqueza deve ser transformada em generosidade e esperança em Deus."
          },
          {
            "title": "Combate a boa batalha",
            "start": 6,
            "end": 6,
            "teaching": "Timóteo é chamado a guardar a fé, buscar virtudes e preservar o depósito recebido."
          }
        ]
      }
    ]
  },
  {
    "id": "2-timothy",
    "title": "2 Timóteo",
    "shortTitle": "2Tm",
    "chapterCount": 4,
    "rationale": "Carta final e intensa sobre perseverança, Escritura, discipulado e fidelidade no sofrimento.",
    "units": [
      {
        "title": "Guardar o bom depósito",
        "subtitle": "Coragem, Escritura e perseverança ministerial",
        "start": 1,
        "end": 4,
        "topics": [
          {
            "title": "Reavivar o dom sem vergonha",
            "start": 1,
            "end": 1,
            "teaching": "Timóteo é encorajado a testemunhar com coragem e guardar o evangelho pelo Espírito."
          },
          {
            "title": "Transmitir a pessoas fiéis",
            "start": 2,
            "end": 2,
            "teaching": "O ministério multiplica discípulos e exige resistência, manejo correto da Palavra e mansidão."
          },
          {
            "title": "Escrituras que tornam sábio",
            "start": 3,
            "end": 3,
            "teaching": "Em tempos difíceis, Timóteo deve permanecer no aprendizado que o conduz à salvação e equipa para toda boa obra."
          },
          {
            "title": "Pregar a Palavra e completar a carreira",
            "start": 4,
            "end": 4,
            "teaching": "Paulo chama à sobriedade e fidelidade e interpreta sua vida como oferta próxima do fim."
          }
        ]
      }
    ]
  },
  {
    "id": "titus",
    "title": "Tito",
    "shortTitle": "Tt",
    "chapterCount": 3,
    "rationale": "Carta curta que conecta doutrina saudável, liderança e boas obras no contexto de Creta.",
    "units": [
      {
        "title": "A graça educa para boas obras",
        "subtitle": "Liderança, vida comunitária e renovação",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Presbíteros e ensino confiável",
            "start": 1,
            "end": 1,
            "teaching": "Tito deve estabelecer líderes de caráter capazes de ensinar e responder ao erro."
          },
          {
            "title": "Doutrina que se torna vida",
            "start": 2,
            "end": 2,
            "teaching": "Diferentes gerações são chamadas a uma conduta que torne o ensino de Deus visível e atraente."
          },
          {
            "title": "A graça que educa",
            "start": 2,
            "end": 2,
            "teaching": "A graça não apenas perdoa; ela forma uma vida sensata, justa e piedosa enquanto aguardamos Cristo."
          },
          {
            "title": "Lavagem da regeneração e boas obras",
            "start": 3,
            "end": 3,
            "teaching": "A salvação nasce da misericórdia de Deus e produz prontidão para o bem, sem brigas inúteis."
          }
        ]
      }
    ]
  },
  {
    "id": "philemon",
    "title": "Filemom",
    "shortTitle": "Fm",
    "chapterCount": 1,
    "rationale": "Bilhete de um capítulo cuja densidade ética exige atenção à reconciliação e fraternidade.",
    "units": [
      {
        "title": "Recebe-o como irmão",
        "subtitle": "Evangelho, reconciliação e transformação das relações",
        "start": 1,
        "end": 1,
        "topics": [
          {
            "title": "Amor que refrigera corações",
            "start": 1,
            "end": 1,
            "teaching": "Paulo agradece pela fé e pelo amor de Filemom, criando base pastoral para seu pedido."
          },
          {
            "title": "Apelo em vez de coerção",
            "start": 1,
            "end": 1,
            "teaching": "Paulo prefere apelar pelo amor, revelando uma liderança que busca resposta voluntária."
          },
          {
            "title": "Onésimo, útil e irmão",
            "start": 1,
            "end": 1,
            "teaching": "Onésimo não deve ser reduzido a sua condição social; em Cristo é recebido como irmão amado."
          },
          {
            "title": "Reconciliação com responsabilidade",
            "start": 1,
            "end": 1,
            "teaching": "Paulo se oferece para assumir a dívida e espera que o evangelho transforme concretamente a relação."
          }
        ]
      }
    ]
  },
  {
    "id": "hebrews",
    "title": "Hebreus",
    "shortTitle": "Hb",
    "chapterCount": 13,
    "rationale": "Sermão-carta teologicamente denso sobre Cristo, sacerdócio, nova aliança, fé e perseverança.",
    "units": [
      {
        "title": "O Filho e a grande salvação",
        "subtitle": "Supremacia de Cristo e fidelidade",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Deus falou pelo Filho",
            "start": 1,
            "end": 1,
            "teaching": "O Filho é apresentado como revelação culminante, agente da criação e superior aos anjos."
          },
          {
            "title": "Não negligenciar tão grande salvação",
            "start": 2,
            "end": 2,
            "teaching": "A encarnação e o sofrimento de Jesus o tornam irmão e sumo sacerdote capaz de socorrer."
          },
          {
            "title": "Jesus maior que Moisés",
            "start": 3,
            "end": 3,
            "teaching": "Cristo é fiel sobre a casa de Deus, e a comunidade é advertida contra um coração endurecido."
          },
          {
            "title": "Hoje, se ouvirdes sua voz",
            "start": 3,
            "end": 3,
            "teaching": "A memória do deserto transforma o presente em oportunidade de confiança e perseverança."
          }
        ]
      },
      {
        "title": "Descanso e sacerdócio",
        "subtitle": "Palavra penetrante e acesso ao trono da graça",
        "start": 4,
        "end": 6,
        "topics": [
          {
            "title": "Entrar no descanso de Deus",
            "start": 4,
            "end": 4,
            "teaching": "A promessa do descanso permanece e exige fé obediente, não mera proximidade religiosa."
          },
          {
            "title": "Aproximar-se com confiança",
            "start": 4,
            "end": 5,
            "teaching": "Jesus é sumo sacerdote compassivo, chamado por Deus e capaz de compreender fraquezas."
          },
          {
            "title": "Maturidade além dos fundamentos",
            "start": 5,
            "end": 6,
            "teaching": "A comunidade é chamada a crescer, discernir e perseverar sem repetir indefinidamente os fundamentos."
          },
          {
            "title": "Esperança como âncora",
            "start": 6,
            "end": 6,
            "teaching": "A promessa e o juramento de Deus sustentam uma esperança segura que entra além do véu."
          }
        ]
      },
      {
        "title": "Nova aliança e sacrifício eficaz",
        "subtitle": "Melquisedeque, santuário e obra de Cristo",
        "start": 7,
        "end": 10,
        "topics": [
          {
            "title": "Sacerdócio segundo Melquisedeque",
            "start": 7,
            "end": 7,
            "teaching": "O sacerdócio de Jesus é permanente e capaz de salvar plenamente os que se aproximam de Deus."
          },
          {
            "title": "Uma aliança superior",
            "start": 8,
            "end": 8,
            "teaching": "A nova aliança prometida por Jeremias envolve lei no coração, relacionamento e perdão."
          },
          {
            "title": "Santuário e consciência",
            "start": 9,
            "end": 9,
            "teaching": "Cristo entra no verdadeiro santuário e oferece a si mesmo, purificando a consciência para servir."
          },
          {
            "title": "Uma oferta suficiente",
            "start": 10,
            "end": 10,
            "teaching": "O sacrifício de Cristo é apresentado como decisivo, levando à confiança, comunhão e perseverança."
          }
        ]
      },
      {
        "title": "Fé que persevera",
        "subtitle": "Testemunhas, disciplina e culto aceitável",
        "start": 11,
        "end": 13,
        "topics": [
          {
            "title": "Pela fé",
            "start": 11,
            "end": 11,
            "teaching": "A galeria de testemunhas mostra confiança perseverante em promessas ainda não plenamente vistas."
          },
          {
            "title": "Correr olhando para Jesus",
            "start": 12,
            "end": 12,
            "teaching": "A vida de fé é corrida comunitária, sustentada pelo exemplo de Jesus e pela disciplina formadora de Deus."
          },
          {
            "title": "Um reino inabalável",
            "start": 12,
            "end": 12,
            "teaching": "A nova aliança chama à gratidão e ao culto reverente diante de um reino que não pode ser abalado."
          },
          {
            "title": "Amor fraternal e fidelidade",
            "start": 13,
            "end": 13,
            "teaching": "Hospitalidade, cuidado com presos, integridade, generosidade e louvor expressam a fé perseverante."
          }
        ]
      }
    ]
  },
  {
    "id": "james",
    "title": "Tiago",
    "shortTitle": "Tg",
    "chapterCount": 5,
    "rationale": "Carta sapiencial que integra fé, perseverança, fala, justiça e oração.",
    "units": [
      {
        "title": "Fé provada e praticada",
        "subtitle": "Sabedoria, parcialidade e obras",
        "start": 1,
        "end": 2,
        "topics": [
          {
            "title": "Perseverança e sabedoria",
            "start": 1,
            "end": 1,
            "teaching": "Provações podem formar maturidade, e sabedoria deve ser pedida a Deus com confiança."
          },
          {
            "title": "Ouvir e praticar a Palavra",
            "start": 1,
            "end": 1,
            "teaching": "A religião coerente controla a fala, cuida dos vulneráveis e transforma o ouvir em prática."
          },
          {
            "title": "Sem acepção de pessoas",
            "start": 2,
            "end": 2,
            "teaching": "Favorecer ricos contradiz a fé no Senhor da glória e viola o amor ao próximo."
          },
          {
            "title": "Fé que se torna ação",
            "start": 2,
            "end": 2,
            "teaching": "Tiago confronta uma profissão de fé sem obras de misericórdia, não a confiança viva que produz obediência."
          }
        ]
      },
      {
        "title": "Sabedoria do alto",
        "subtitle": "Fala, humildade, justiça e oração",
        "start": 3,
        "end": 5,
        "topics": [
          {
            "title": "O poder da língua",
            "start": 3,
            "end": 3,
            "teaching": "A fala pode orientar ou incendiar; mestres recebem responsabilidade especial."
          },
          {
            "title": "Sabedoria pacífica e humilde",
            "start": 3,
            "end": 4,
            "teaching": "A sabedoria do alto produz paz, enquanto ambição e desejos desordenados geram conflitos."
          },
          {
            "title": "Riqueza e paciência",
            "start": 5,
            "end": 5,
            "teaching": "Exploração econômica é denunciada, e os irmãos são chamados à paciência até a vinda do Senhor."
          },
          {
            "title": "Oração que restaura",
            "start": 5,
            "end": 5,
            "teaching": "Sofrimento, alegria, doença e pecado são levados a Deus em uma comunidade de oração e cuidado."
          }
        ]
      }
    ]
  },
  {
    "id": "1-peter",
    "title": "1 Pedro",
    "shortTitle": "1Pe",
    "chapterCount": 5,
    "rationale": "Carta pastoral para comunidades sob pressão, unindo esperança, santidade e testemunho.",
    "units": [
      {
        "title": "Esperança viva e povo santo",
        "subtitle": "Nova identidade e testemunho",
        "start": 1,
        "end": 2,
        "topics": [
          {
            "title": "Nova geração para uma esperança viva",
            "start": 1,
            "end": 1,
            "teaching": "A ressurreição de Jesus fundamenta esperança e herança preservada em meio às provações."
          },
          {
            "title": "Sede santos em toda conduta",
            "start": 1,
            "end": 1,
            "teaching": "A graça futura orienta uma vida santa, reverente e marcada por amor fraternal."
          },
          {
            "title": "Pedras vivas e sacerdócio",
            "start": 2,
            "end": 2,
            "teaching": "A comunidade é casa espiritual e povo chamado a anunciar as virtudes de Deus."
          },
          {
            "title": "Testemunho entre as nações",
            "start": 2,
            "end": 2,
            "teaching": "A boa conduta responde à calúnia sem confundir submissão responsável com aprovação de abuso."
          }
        ]
      },
      {
        "title": "Sofrer fazendo o bem",
        "subtitle": "Esperança pública, serviço e pastoreio",
        "start": 3,
        "end": 5,
        "topics": [
          {
            "title": "Responder com mansidão e respeito",
            "start": 3,
            "end": 3,
            "teaching": "A esperança cristã deve ser explicada com consciência limpa, sem agressividade."
          },
          {
            "title": "Cristo sofreu e venceu",
            "start": 3,
            "end": 4,
            "teaching": "O sofrimento de Cristo orienta resistência ao pecado e solidariedade comunitária."
          },
          {
            "title": "Dons, hospitalidade e provação",
            "start": 4,
            "end": 4,
            "teaching": "A proximidade do fim motiva amor, hospitalidade, serviço e confiança durante o sofrimento."
          },
          {
            "title": "Pastorear sem dominar",
            "start": 5,
            "end": 5,
            "teaching": "Líderes cuidam por exemplo, todos se revestem de humildade e resistem firmes ao adversário."
          }
        ]
      }
    ]
  },
  {
    "id": "2-peter",
    "title": "2 Pedro",
    "shortTitle": "2Pe",
    "chapterCount": 3,
    "rationale": "Carta curta sobre crescimento, falsos mestres e esperança responsável na vinda de Cristo.",
    "units": [
      {
        "title": "Crescer e permanecer firmes",
        "subtitle": "Virtude, discernimento e esperança",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Participantes da natureza divina",
            "start": 1,
            "end": 1,
            "teaching": "A graça fornece recursos para crescer em virtude, conhecimento, domínio próprio e amor."
          },
          {
            "title": "Testemunhas e palavra profética",
            "start": 1,
            "end": 1,
            "teaching": "Pedro relaciona o testemunho apostólico à palavra profética, que não nasce de vontade humana."
          },
          {
            "title": "Falsos mestres e exploração",
            "start": 2,
            "end": 2,
            "teaching": "Ensinos destrutivos são reconhecidos por ganância, arrogância e sedução, não apenas por discurso."
          },
          {
            "title": "O Dia do Senhor e a paciência",
            "start": 3,
            "end": 3,
            "teaching": "A aparente demora é interpretada como paciência salvadora e chama a uma vida santa e esperançosa."
          }
        ]
      }
    ]
  },
  {
    "id": "1-john",
    "title": "1 João",
    "shortTitle": "1Jo",
    "chapterCount": 5,
    "rationale": "Carta circular densa sobre encarnação, comunhão, amor, verdade e segurança em Cristo.",
    "units": [
      {
        "title": "Andar na luz",
        "subtitle": "Comunhão, perdão e discernimento",
        "start": 1,
        "end": 2,
        "topics": [
          {
            "title": "A vida foi manifestada",
            "start": 1,
            "end": 1,
            "teaching": "O testemunho apostólico afirma a realidade histórica e encarnada de Jesus como base da comunhão."
          },
          {
            "title": "Confessar e receber perdão",
            "start": 1,
            "end": 1,
            "teaching": "Andar na luz inclui reconhecer pecados e confiar na fidelidade de Deus para perdoar e purificar."
          },
          {
            "title": "Obedecer e amar",
            "start": 2,
            "end": 2,
            "teaching": "Conhecer Deus não é apenas afirmar algo; aparece na obediência e no amor aos irmãos."
          },
          {
            "title": "Discernir anticristos e permanecer",
            "start": 2,
            "end": 2,
            "teaching": "A comunidade deve permanecer no ensino sobre Cristo e na unção recebida diante de separações enganosas."
          }
        ]
      },
      {
        "title": "Deus é amor e vida",
        "subtitle": "Identidade, confiança e testemunho",
        "start": 3,
        "end": 5,
        "topics": [
          {
            "title": "Filhos de Deus praticam justiça",
            "start": 3,
            "end": 3,
            "teaching": "A esperança de ver Cristo purifica e produz amor concreto, não indiferença ao necessitado."
          },
          {
            "title": "Provar os espíritos",
            "start": 4,
            "end": 4,
            "teaching": "Confessar Jesus encarnado e discernir o fruto do ensino protege a comunidade do engano."
          },
          {
            "title": "Deus é amor",
            "start": 4,
            "end": 4,
            "teaching": "O amor nasce da iniciativa de Deus e expulsa o medo servil, tornando visível quem ninguém vê."
          },
          {
            "title": "Testemunho e segurança da vida eterna",
            "start": 5,
            "end": 5,
            "teaching": "A fé no Filho vence o mundo, sustenta a oração e oferece segurança sem tolerar idolatria."
          }
        ]
      }
    ]
  },
  {
    "id": "2-john",
    "title": "2 João",
    "shortTitle": "2Jo",
    "chapterCount": 1,
    "rationale": "Bilhete de um capítulo que equilibra amor, verdade, hospitalidade e discernimento.",
    "units": [
      {
        "title": "Verdade e amor com discernimento",
        "subtitle": "Permanecer no ensino de Cristo",
        "start": 1,
        "end": 1,
        "topics": [
          {
            "title": "A verdade que permanece",
            "start": 1,
            "end": 1,
            "teaching": "O amor da comunidade é inseparável da verdade recebida e compartilhada."
          },
          {
            "title": "Andar no mandamento do amor",
            "start": 1,
            "end": 1,
            "teaching": "O mandamento antigo continua atual: amar significa andar segundo a vontade de Deus."
          },
          {
            "title": "Confessar Jesus vindo em carne",
            "start": 1,
            "end": 1,
            "teaching": "A encarnação é critério essencial contra ensinamentos que dissolvem a identidade de Cristo."
          },
          {
            "title": "Hospitalidade sem cumplicidade",
            "start": 1,
            "end": 1,
            "teaching": "A generosidade cristã exige discernimento para não financiar uma missão que nega o evangelho."
          }
        ]
      }
    ]
  },
  {
    "id": "3-john",
    "title": "3 João",
    "shortTitle": "3Jo",
    "chapterCount": 1,
    "rationale": "Bilhete de um capítulo sobre hospitalidade missionária, abuso de liderança e bom testemunho.",
    "units": [
      {
        "title": "Cooperadores da verdade",
        "subtitle": "Hospitalidade, liderança e exemplo",
        "start": 1,
        "end": 1,
        "topics": [
          {
            "title": "Alegria por andar na verdade",
            "start": 1,
            "end": 1,
            "teaching": "João celebra uma fidelidade que se torna visível na vida cotidiana de Gaio."
          },
          {
            "title": "Hospitalidade aos missionários",
            "start": 1,
            "end": 1,
            "teaching": "Acolher e sustentar obreiros fiéis torna a comunidade cooperadora da verdade."
          },
          {
            "title": "Diótrefes e o poder abusivo",
            "start": 1,
            "end": 1,
            "teaching": "A ambição de primazia, a difamação e a exclusão de pessoas são confrontadas como abuso espiritual."
          },
          {
            "title": "Demétrio e o bom testemunho",
            "start": 1,
            "end": 1,
            "teaching": "O caráter reconhecido pela comunidade e pela verdade oferece um modelo positivo de liderança."
          }
        ]
      }
    ]
  },
  {
    "id": "jude",
    "title": "Judas",
    "shortTitle": "Jd",
    "chapterCount": 1,
    "rationale": "Carta de um capítulo, intensa em discernimento, perseverança e misericórdia.",
    "units": [
      {
        "title": "Batalhar pela fé com misericórdia",
        "subtitle": "Erro, perseverança e esperança",
        "start": 1,
        "end": 1,
        "topics": [
          {
            "title": "A fé entregue aos santos",
            "start": 1,
            "end": 1,
            "teaching": "Judas chama a proteger o evangelho diante de pessoas que transformam graça em licença."
          },
          {
            "title": "Memória como advertência",
            "start": 1,
            "end": 1,
            "teaching": "Exemplos bíblicos e tradicionais alertam contra rebelião, arrogância e exploração."
          },
          {
            "title": "Edificar-se e permanecer no amor",
            "start": 1,
            "end": 1,
            "teaching": "A resposta ao erro inclui oração no Espírito, perseverança no amor e espera pela misericórdia."
          },
          {
            "title": "Misericórdia com discernimento",
            "start": 1,
            "end": 1,
            "teaching": "A comunidade cuida de pessoas em dúvida e perigo sem reproduzir o comportamento destrutivo que combate."
          }
        ]
      }
    ]
  },
  {
    "id": "revelation",
    "title": "Apocalipse",
    "shortTitle": "Ap",
    "chapterCount": 22,
    "rationale": "Livro apocalíptico e profético denso, que requer atenção literária, pastoral e canônica.",
    "units": [
      {
        "title": "O Cordeiro entre as igrejas",
        "subtitle": "Visão de Cristo e cartas às sete comunidades",
        "start": 1,
        "end": 3,
        "topics": [
          {
            "title": "Jesus Cristo revelado",
            "start": 1,
            "end": 1,
            "teaching": "João apresenta o testemunho de Jesus e vê o Filho do Homem presente entre os candeeiros."
          },
          {
            "title": "Éfeso, Esmirna e Pérgamo",
            "start": 2,
            "end": 2,
            "teaching": "As mensagens unem elogio, correção e promessa, chamando ao primeiro amor, fidelidade e resistência à acomodação."
          },
          {
            "title": "Tiatira, Sardes e Filadélfia",
            "start": 2,
            "end": 3,
            "teaching": "Cristo confronta tolerância ao mal e aparência sem vida, mas encoraja serviço e perseverança."
          },
          {
            "title": "Laodiceia e o convite à comunhão",
            "start": 3,
            "end": 3,
            "teaching": "A autossuficiência é exposta, e Cristo chama ao arrependimento e à comunhão restaurada."
          }
        ]
      },
      {
        "title": "O trono e o Cordeiro",
        "subtitle": "Adoração, selos e testemunho",
        "start": 4,
        "end": 7,
        "topics": [
          {
            "title": "O trono de Deus",
            "start": 4,
            "end": 4,
            "teaching": "A visão desloca o centro do poder dos impérios para o Criador adorado por toda a criação."
          },
          {
            "title": "O Cordeiro digno",
            "start": 5,
            "end": 5,
            "teaching": "Somente o Cordeiro morto e vivo pode abrir o livro, unindo vitória e sacrifício."
          },
          {
            "title": "Os selos e o sofrimento do mundo",
            "start": 6,
            "end": 6,
            "teaching": "Conquista, guerra, fome e morte revelam a violência da história sem serem celebradas como ideal divino."
          },
          {
            "title": "Selados e uma multidão de todas as nações",
            "start": 7,
            "end": 7,
            "teaching": "Deus conhece seu povo, e a visão culmina em uma multidão internacional consolada pelo Cordeiro."
          }
        ]
      },
      {
        "title": "Trombetas e testemunhas",
        "subtitle": "Juízo parcial, intercessão e missão profética",
        "start": 8,
        "end": 11,
        "topics": [
          {
            "title": "Silêncio, oração e trombetas",
            "start": 8,
            "end": 8,
            "teaching": "As orações dos santos entram na cena do juízo, e as trombetas alertam com alcance limitado."
          },
          {
            "title": "Abismo e dureza humana",
            "start": 9,
            "end": 9,
            "teaching": "Imagens de devastação expõem poderes destrutivos e a resistência humana ao arrependimento."
          },
          {
            "title": "O livrinho doce e amargo",
            "start": 10,
            "end": 10,
            "teaching": "A palavra profética é recebida com alegria e dor, preparando João para continuar testemunhando."
          },
          {
            "title": "As duas testemunhas e o reino",
            "start": 11,
            "end": 11,
            "teaching": "O testemunho fiel enfrenta violência, mas Deus vindica suas testemunhas e anuncia seu reino."
          }
        ]
      },
      {
        "title": "Conflito por trás dos impérios",
        "subtitle": "Mulher, dragão e bestas",
        "start": 12,
        "end": 14,
        "topics": [
          {
            "title": "A mulher, o filho e o dragão",
            "start": 12,
            "end": 12,
            "teaching": "A visão apresenta o conflito espiritual em torno do Messias e do povo de Deus."
          },
          {
            "title": "Bestas e poder idolátrico",
            "start": 13,
            "end": 13,
            "teaching": "As bestas simbolizam poder político e propaganda religiosa que exigem lealdade absoluta."
          },
          {
            "title": "O Cordeiro e os fiéis",
            "start": 14,
            "end": 14,
            "teaching": "O Cordeiro está com os seus, e mensagens angélicas chamam à perseverança e denunciam Babilônia."
          },
          {
            "title": "Colheita e responsabilidade",
            "start": 14,
            "end": 14,
            "teaching": "As imagens de colheita afirmam que violência e idolatria não escaparão para sempre ao juízo."
          }
        ]
      },
      {
        "title": "Taças e Babilônia",
        "subtitle": "Queda do sistema sedutor e violento",
        "start": 15,
        "end": 18,
        "topics": [
          {
            "title": "O cântico dos vencedores",
            "start": 15,
            "end": 15,
            "teaching": "Antes das taças, os vencedores adoram a justiça de Deus com linguagem do êxodo."
          },
          {
            "title": "As sete taças",
            "start": 16,
            "end": 16,
            "teaching": "Os juízos intensificam a denúncia contra um mundo que persiste em violência e blasfêmia."
          },
          {
            "title": "Babilônia desmascarada",
            "start": 17,
            "end": 17,
            "teaching": "A cidade prostituta representa luxo, poder e perseguição sustentados pela sedução imperial."
          },
          {
            "title": "Sai dela, povo meu",
            "start": 18,
            "end": 18,
            "teaching": "A queda de Babilônia convoca o povo de Deus a não participar de sua economia de exploração."
          }
        ]
      },
      {
        "title": "Vitória do Cordeiro",
        "subtitle": "Juízo, milênio e derrota do mal",
        "start": 19,
        "end": 20,
        "topics": [
          {
            "title": "As bodas do Cordeiro",
            "start": 19,
            "end": 19,
            "teaching": "A queda da opressão conduz à adoração e à imagem de comunhão entre o Cordeiro e seu povo."
          },
          {
            "title": "O cavaleiro fiel e verdadeiro",
            "start": 19,
            "end": 19,
            "teaching": "Cristo vence com justiça e verdade, contrastando com a propaganda violenta das bestas."
          },
          {
            "title": "O milênio e suas interpretações",
            "start": 20,
            "end": 20,
            "teaching": "A visão do milênio deve ser lida com humildade diante de interpretações cristãs históricas diferentes."
          },
          {
            "title": "Juízo final e fim da morte",
            "start": 20,
            "end": 20,
            "teaching": "O mal é definitivamente julgado, e a própria morte perde seu poder diante de Deus."
          }
        ]
      },
      {
        "title": "Nova criação",
        "subtitle": "Jerusalém renovada e convite final",
        "start": 21,
        "end": 22,
        "topics": [
          {
            "title": "Novo céu e nova terra",
            "start": 21,
            "end": 21,
            "teaching": "A esperança cristã culmina em criação renovada, presença de Deus e fim de luto, dor e morte."
          },
          {
            "title": "A Nova Jerusalém",
            "start": 21,
            "end": 21,
            "teaching": "A cidade simboliza o povo de Deus em beleza, segurança e abertura às nações."
          },
          {
            "title": "Rio da vida e cura das nações",
            "start": 22,
            "end": 22,
            "teaching": "Éden é restaurado e ampliado: água, árvore, serviço e visão de Deus marcam a vida eterna."
          },
          {
            "title": "Eis que venho e o convite",
            "start": 22,
            "end": 22,
            "teaching": "O livro termina com promessa, advertência e convite gratuito a quem tem sede."
          }
        ]
      }
    ]
  }
] as NewTestamentBookSpec[];

function passageLabel(bookTitle: string, start: number, end: number) {
  return bookTitle + " " + (start === end ? start : start + "–" + end);
}

function toExpansionUnit(book: NewTestamentBookSpec, unit: UnitSpec, index: number): ExpansionUnit {
  const unitNumber = String(index + 1).padStart(2, "0");
  const topics = unit.topics.map((topic): ExpansionTopic => [
    topic.title,
    passageLabel(book.title, topic.start, topic.end),
    topic.start,
    topic.end,
    topic.teaching,
    "A formação cristã recebe este ensino no contexto do livro, responde com fé obediente, amor ao próximo e discernimento, sem transformar descrição ou símbolo em regra isolada."
  ]) as [ExpansionTopic, ExpansionTopic, ExpansionTopic, ExpansionTopic];

  return {
    id: book.id + "-u" + unitNumber,
    title: unit.title,
    subtitle: unit.subtitle,
    chapters: chapterRange(unit.start, unit.end),
    topics
  };
}

export interface NewTestamentJourneyBook {
  id: string;
  title: string;
  shortTitle: string;
  chapterCount: number;
  units: Unit[];
}

export const newTestamentBooks: NewTestamentJourneyBook[] = NEW_TESTAMENT_SPECS.map((book) => ({
  id: book.id,
  title: book.title,
  shortTitle: book.shortTitle,
  chapterCount: book.chapterCount,
  units: buildExpansionUnits(
    book.id,
    book.title,
    book.units.map((unit, index) => toExpansionUnit(book, unit, index))
  )
}));

export const NEW_TESTAMENT_TARGET_TOTALS = {
  books: NEW_TESTAMENT_SPECS.length,
  chapters: NEW_TESTAMENT_SPECS.reduce((total, book) => total + book.chapterCount, 0),
  units: NEW_TESTAMENT_SPECS.reduce((total, book) => total + book.units.length, 0),
  lessons: NEW_TESTAMENT_SPECS.reduce((total, book) => total + book.units.length * 4, 0)
};
