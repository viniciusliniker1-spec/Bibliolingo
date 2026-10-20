import type { AppState } from "../types/progress";
import { journeyBooks } from "../content/catalog";
import { getLevelProgress } from "./gamification";

export type AchievementCondition =
  | { type: "lessons"; count: number }
  | { type: "xp"; amount: number }
  | { type: "perfect-lessons"; count: number }
  | { type: "checkpoint"; id: string }
  | { type: "streak"; days: number }
  | { type: "prompts"; promptType: string; count: number }
  | { type: "greek-lexemes"; count: number };

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first-step", title: "Primeiros passos", description: "Conclua sua primeira lição.", icon: "✦", condition: { type: "lessons", count: 1 } },
  { id: "perfect-lesson", title: "Coração atento", description: "Conclua uma lição sem errar.", icon: "◆", condition: { type: "perfect-lessons", count: 1 } },
  { id: "one-hundred-xp", title: "Sede de aprender", description: "Alcance 100 XP.", icon: "⚡", condition: { type: "xp", amount: 100 } },
  { id: "unit-one", title: "O princípio", description: "Supere o checkpoint de Gênesis 1–3.", icon: "★", condition: { type: "checkpoint", id: "genesis-u01-checkpoint" } },
  { id: "genesis-complete", title: "No princípio", description: "Conclua todos os checkpoints de Gênesis.", icon: "◈", condition: { type: "checkpoint", id: "genesis-u10-checkpoint" } },
  { id: "exodus-complete", title: "Libertos para servir", description: "Conclua todos os checkpoints de Êxodo.", icon: "◇", condition: { type: "checkpoint", id: "exodus-u08-checkpoint" } },
  { id: "leviticus-complete", title: "Sede santos", description: "Conclua todos os checkpoints de Levítico.", icon: "✧", condition: { type: "checkpoint", id: "leviticus-u05-checkpoint" } },
  { id: "numbers-complete", title: "No deserto", description: "Conclua todos os checkpoints de Números.", icon: "⌁", condition: { type: "checkpoint", id: "numbers-u06-checkpoint" } },
  { id: "deuteronomy-complete", title: "Escolhe a vida", description: "Conclua todos os checkpoints de Deuteronômio.", icon: "◉", condition: { type: "checkpoint", id: "deuteronomy-u06-checkpoint" } },
  { id: "pentateuch-complete", title: "Pentateuco", description: "Conclua a jornada pelos cinco livros de Moisés.", icon: "⬟", condition: { type: "checkpoint", id: "deuteronomy-u06-checkpoint" } },
  { id: "joshua-complete", title: "Forte e corajoso", description: "Conclua todos os checkpoints de Josué.", icon: "◫", condition: { type: "checkpoint", id: "joshua-u05-checkpoint" } },
  { id: "judges-complete", title: "Ciclos rompidos", description: "Conclua todos os checkpoints de Juízes.", icon: "⚖", condition: { type: "checkpoint", id: "judges-u05-checkpoint" } },
  { id: "ruth-complete", title: "Amor leal", description: "Conclua todos os checkpoints de Rute.", icon: "❋", condition: { type: "checkpoint", id: "ruth-u02-checkpoint" } },
  { id: "first-samuel-complete", title: "Coração que ouve", description: "Conclua todos os checkpoints de 1 Samuel.", icon: "◖", condition: { type: "checkpoint", id: "1-samuel-u06-checkpoint" } },
  { id: "second-samuel-complete", title: "Reino e aliança", description: "Conclua todos os checkpoints de 2 Samuel.", icon: "♔", condition: { type: "checkpoint", id: "2-samuel-u06-checkpoint" } },
  { id: "early-history-complete", title: "Da terra ao reino", description: "Conclua Josué, Juízes, Rute e os livros de Samuel.", icon: "✺", condition: { type: "checkpoint", id: "2-samuel-u06-checkpoint" } },
  { id: "first-kings-complete", title: "O reino dividido", description: "Conclua as seis unidades de 1 Reis.", icon: "♜", condition: { type: "checkpoint", id: "1-kings-u06-checkpoint" } },
  { id: "second-kings-complete", title: "Até o exílio", description: "Conclua as seis unidades de 2 Reis.", icon: "♜", condition: { type: "checkpoint", id: "2-kings-u06-checkpoint" } },
  { id: "kingdoms-complete", title: "Reis e profetas", description: "Percorra a história dos reinos até o exílio.", icon: "♜", condition: { type: "checkpoint", id: "2-kings-u06-checkpoint" } },
  { id: "chronicles-complete", title: "Memória e templo", description: "Conclua os dois livros de Crônicas.", icon: "▦", condition: { type: "checkpoint", id: "2-chronicles-u07-checkpoint" } },
  { id: "ezra-nehemiah-complete", title: "Reconstrução", description: "Conclua Esdras e Neemias.", icon: "▤", condition: { type: "checkpoint", id: "nehemiah-u04-checkpoint" } },
  { id: "esther-complete", title: "Para um tempo como este", description: "Conclua as três unidades de Ester.", icon: "✦", condition: { type: "checkpoint", id: "esther-u03-checkpoint" } },
  { id: "restoration-complete", title: "Reconstruir e permanecer", description: "Conclua Crônicas, Esdras, Neemias e Ester.", icon: "▦", condition: { type: "checkpoint", id: "esther-u03-checkpoint" } },
  { id: "psalms-complete", title: "Tudo quanto respira", description: "Conclua as quinze unidades de Salmos.", icon: "♫", condition: { type: "checkpoint", id: "psalms-u15-checkpoint" } },
  { id: "wisdom-complete", title: "Coração sábio", description: "Conclua os cinco livros poéticos e sapienciais.", icon: "❖", condition: { type: "checkpoint", id: "song-of-songs-u01-checkpoint" } },
  { id: "isaiah-complete", title: "Eis-me aqui", description: "Conclua as doze unidades de Isaías.", icon: "◭", condition: { type: "checkpoint", id: "isaiah-u12-checkpoint" } },
  { id: "jeremiah-complete", title: "Palavra no coração", description: "Conclua as onze unidades de Jeremias.", icon: "◭", condition: { type: "checkpoint", id: "jeremiah-u11-checkpoint" } },
  { id: "ezekiel-complete", title: "O Senhor está ali", description: "Conclua as dez unidades de Ezequiel.", icon: "◭", condition: { type: "checkpoint", id: "ezekiel-u10-checkpoint" } },
  { id: "daniel-complete", title: "Fiel entre impérios", description: "Conclua as quatro unidades de Daniel.", icon: "◭", condition: { type: "checkpoint", id: "daniel-u04-checkpoint" } },
  { id: "major-prophets-complete", title: "Vozes de esperança", description: "Conclua os cinco Profetas Maiores.", icon: "◭", condition: { type: "checkpoint", id: "daniel-u04-checkpoint" } },
  { id: "minor-prophets-complete", title: "Os Doze", description: "Conclua a jornada dos Profetas Menores.", icon: "✹", condition: { type: "checkpoint", id: "malachi-u01-checkpoint" } },
  { id: "old-testament-complete", title: "Antiga Aliança", description: "Conclua os 39 livros do Antigo Testamento.", icon: "📜", condition: { type: "checkpoint", id: "malachi-u01-checkpoint" } },
  { id: "new-testament-complete", title: "Nova Aliança", description: "Conclua os 27 livros do Novo Testamento.", icon: "✝", condition: { type: "checkpoint", id: "revelation-u06-checkpoint" } },
  { id: "whole-bible-complete", title: "Toda a Escritura", description: "Conclua a jornada bíblica de Gênesis a Apocalipse.", icon: "📖", condition: { type: "checkpoint", id: "revelation-u06-checkpoint" } },
  { id: "deepen-genesis-one", title: "Raízes profundas", description: "Conclua o checkpoint avançado de Gênesis 1.", icon: "⌁", condition: { type: "checkpoint", id: "deepen-genesis-u01-checkpoint" } },
  { id: "formation-first-subject", title: "Chamado em formação", description: "Conclua a primeira matéria da Formação Pastoral.", icon: "N", condition: { type: "checkpoint", id: "manual-exam" } },
  { id: "formation-complete", title: "Preparado para servir", description: "Conclua o simulado final da Formação Pastoral.", icon: "✦", condition: { type: "checkpoint", id: "formation-final-exam" } },
  { id: "faithful-three", title: "Fiel na caminhada", description: "Estude por três dias seguidos.", icon: "🔥", condition: { type: "streak", days: 3 } },
  { id: "greek-alphabet", title: "Alfa e Ômega", description: "Conclua a primeira unidade de Grego Bíblico.", icon: "Α", condition: { type: "checkpoint", id: "greek-u01-checkpoint" } },
  { id: "greek-grammar", title: "Leitor em formação", description: "Conclua Estrutura nominal.", icon: "λ", condition: { type: "checkpoint", id: "greek-u04-checkpoint" } },
  { id: "greek-course", title: "Koiné I", description: "Conclua as oito unidades introdutórias.", icon: "Ω", condition: { type: "checkpoint", id: "greek-u08-checkpoint" } },
  { id: "greek-lexicon-ten", title: "Caçador de palavras", description: "Aprenda dez verbetes gregos.", icon: "Λ", condition: { type: "greek-lexemes", count: 10 } },
  { id: "preacher", title: "Pregador", description: "Gere dez prompts de esboço.", icon: "♢", condition: { type: "prompts", promptType: "sermon", count: 10 } }
];

function met(state: AppState, condition: AchievementCondition): boolean {
  switch (condition.type) {
    case "lessons": return state.completedLessonIds.length >= condition.count;
    case "xp": return state.xp >= condition.amount;
    case "perfect-lessons": return state.perfectLessonIds.length >= condition.count;
    case "checkpoint": return state.completedCheckpointIds.includes(condition.id);
    case "streak": return state.streak >= condition.days;
    case "prompts": return (state.promptsGenerated[condition.promptType] ?? 0) >= condition.count;
    case "greek-lexemes": return state.learnedGreekLexemeIds.length >= condition.count;
  }
}

export type ApprovedAchievementId =
  | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10"
  | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20"
  | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30";

export type ApprovedAchievementRule =
  | { type: "lessons"; count: number }
  | { type: "best-streak"; days: number }
  | { type: "books"; count: number }
  | { type: "testament"; testament: "old" | "new" | "all" }
  | { type: "checkpoint"; id: string }
  | { type: "correct-streak"; count: number }
  | { type: "level"; level: number }
  | { type: "instrumentation"; key: "bible-chapters" | "topic-service" | "topic-missions" | "topic-prayer" | "noah-questions" | "regular-routes" | "route-mastery" | "formation-entitlement" }
  | { type: "platinum" };

export interface ApprovedAchievementDefinition {
  id: ApprovedAchievementId;
  title: string;
  description: string;
  rule: ApprovedAchievementRule;
  secret?: boolean;
  optional?: boolean;
}

export const MAX_LEVEL = 50;

export const APPROVED_ACHIEVEMENTS: ApprovedAchievementDefinition[] = [
  { id:"01", title:"Primeiros Passos", description:"Concluir a primeira lição.", rule:{type:"lessons",count:1} },
  { id:"02", title:"Leitor Fiel", description:"Concluir 10 lições.", rule:{type:"lessons",count:10} },
  { id:"03", title:"Semana Ativa", description:"Estudar 7 dias consecutivos.", rule:{type:"best-streak",days:7} },
  { id:"04", title:"Fogo Contínuo", description:"Estudar 30 dias consecutivos.", rule:{type:"best-streak",days:30} },
  { id:"05", title:"Disciplina", description:"Estudar 50 dias consecutivos.", rule:{type:"best-streak",days:50} },
  { id:"06", title:"Foco", description:"Concluir 25 lições.", rule:{type:"lessons",count:25} },
  { id:"07", title:"Explorador", description:"Concluir um livro bíblico.", rule:{type:"books",count:1} },
  { id:"08", title:"Historiador", description:"Concluir 5 livros bíblicos.", rule:{type:"books",count:5} },
  { id:"09", title:"Conhecimento Fundamental", description:"Concluir a Formação Pastoral.", rule:{type:"instrumentation",key:"formation-entitlement"}, secret:true, optional:true },
  { id:"10", title:"Estudioso do Grego", description:"Concluir a rota de Grego Bíblico.", rule:{type:"checkpoint",id:"greek-u08-checkpoint"} },
  { id:"11", title:"Mente Afiada", description:"Acertar 50 questões distintas consecutivas.", rule:{type:"correct-streak",count:50} },
  { id:"12", title:"Precisão", description:"Acertar 100 questões distintas consecutivas.", rule:{type:"correct-streak",count:100} },
  { id:"13", title:"Campeão", description:"Concluir 100 lições.", rule:{type:"lessons",count:100} },
  { id:"14", title:"Palavra Viva", description:"Ler 10 capítulos bíblicos.", rule:{type:"instrumentation",key:"bible-chapters"} },
  { id:"15", title:"Coração de Servo", description:"Concluir uma lição curricular sobre serviço.", rule:{type:"instrumentation",key:"topic-service"} },
  { id:"16", title:"Missionário", description:"Concluir uma lição curricular sobre missões.", rule:{type:"instrumentation",key:"topic-missions"} },
  { id:"17", title:"Vida de Oração", description:"Concluir uma lição curricular sobre oração.", rule:{type:"instrumentation",key:"topic-prayer"} },
  { id:"18", title:"Curioso", description:"Fazer 20 perguntas confirmadas ao Professor Noah.", rule:{type:"instrumentation",key:"noah-questions"} },
  { id:"19", title:"Interativo", description:"Fazer 50 perguntas confirmadas ao Professor Noah.", rule:{type:"instrumentation",key:"noah-questions"} },
  { id:"20", title:"Aprendiz Dedicado", description:"Concluir 50 lições.", rule:{type:"lessons",count:50} },
  { id:"21", title:"Mestre da Palavra", description:"Concluir 200 lições.", rule:{type:"lessons",count:200} },
  { id:"22", title:"Persistente", description:"Estudar 100 dias consecutivos.", rule:{type:"best-streak",days:100} },
  { id:"23", title:"Conquistador", description:"Concluir 500 lições.", rule:{type:"lessons",count:500} },
  { id:"24", title:"Guia", description:"Concluir todos os livros do Novo Testamento.", rule:{type:"testament",testament:"new"} },
  { id:"25", title:"Raízes Profundas", description:"Concluir todos os livros do Antigo Testamento.", rule:{type:"testament",testament:"old"} },
  { id:"26", title:"Conhecimento Completo", description:"Concluir toda a Bíblia.", rule:{type:"testament",testament:"all"} },
  { id:"27", title:"Discípulo Fiel", description:"Concluir todas as rotas regulares de estudo.", rule:{type:"instrumentation",key:"regular-routes"} },
  { id:"28", title:"Referência", description:`Alcançar o nível máximo (${MAX_LEVEL}).`, rule:{type:"level",level:MAX_LEVEL} },
  { id:"29", title:"Mestre Bíblico", description:"Obter 100% de aproveitamento em uma rota.", rule:{type:"instrumentation",key:"route-mastery"} },
  { id:"30", title:"Lenda do Bibliolingo", description:"Concluir 100% dos requisitos regulares do aplicativo.", rule:{type:"platinum"} }
];

export type AchievementState = Pick<AppState,
  "completedLessonIds" | "completedCheckpointIds" | "bestStreak" | "attempts" | "xp" | "earnedAchievementIds"
>;

function isBookComplete(state: AchievementState, book: (typeof journeyBooks)[number]): boolean {
  return book.units.every((unit) =>
    unit.lessons.every((lesson) => state.completedLessonIds.includes(lesson.id)) &&
    state.completedCheckpointIds.includes(unit.checkpoint.id)
  );
}

function completedBooks(state: AchievementState) {
  return journeyBooks.filter((book) => isBookComplete(state, book));
}

function distinctCorrectStreak(state: AchievementState): number {
  const ordered = [...state.attempts].sort((a,b) => a.answeredAt.localeCompare(b.answeredAt));
  const uniqueQuestions = new Set<string>();
  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    const attempt = ordered[index];
    if (!attempt.correct) break;
    uniqueQuestions.add(attempt.questionId);
  }
  return uniqueQuestions.size;
}

export function achievementProgress(state: AchievementState, achievement: ApprovedAchievementDefinition): { current:number; target:number; supported:boolean } {
  const rule = achievement.rule;
  switch (rule.type) {
    case "lessons": return { current:new Set(state.completedLessonIds).size, target:rule.count, supported:true };
    case "best-streak": return { current:state.bestStreak, target:rule.days, supported:true };
    case "books": return { current:completedBooks(state).length, target:rule.count, supported:true };
    case "checkpoint": return { current:state.completedCheckpointIds.includes(rule.id) ? 1 : 0, target:1, supported:true };
    case "correct-streak": return { current:distinctCorrectStreak(state), target:rule.count, supported:true };
    case "level": return { current:getLevelProgress(state.xp).level, target:rule.level, supported:true };
    case "testament": {
      const start = rule.testament === "new" ? 39 : 0;
      const end = rule.testament === "old" ? 39 : journeyBooks.length;
      const scope = rule.testament === "all" ? journeyBooks : journeyBooks.slice(start,end);
      return { current:scope.filter((book)=>isBookComplete(state,book)).length, target:scope.length, supported:true };
    }
    case "instrumentation": return { current:0, target:1, supported:false };
    case "platinum": {
      const regular = APPROVED_ACHIEVEMENTS.filter((item)=>!item.secret && item.id!=="30");
      const current = regular.filter((item)=>isApprovedAchievementMet(state,item)).length;
      return { current, target:regular.length, supported:true };
    }
  }
}

export function isApprovedAchievementMet(state: AchievementState, achievement: ApprovedAchievementDefinition): boolean {
  if (achievement.rule.type === "instrumentation") return false;
  const progress = achievementProgress(state,achievement);
  return progress.supported && progress.target > 0 && progress.current >= progress.target;
}

export function visibleApprovedAchievements(options?: { formationEntitled?: boolean }): ApprovedAchievementDefinition[] {
  return APPROVED_ACHIEVEMENTS.filter((item)=>!item.secret || options?.formationEntitled === true);
}

export function evaluateAchievements(state: AppState): string[] {
  const legacy = ACHIEVEMENTS.filter((achievement) => met(state, achievement.condition)).map((achievement) => achievement.id);
  const approved = APPROVED_ACHIEVEMENTS.filter((achievement) => !achievement.secret && isApprovedAchievementMet(state, achievement)).map((achievement) => achievement.id);
  return [...legacy, ...approved];
}
