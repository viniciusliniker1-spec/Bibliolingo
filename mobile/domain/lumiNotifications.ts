/**
 * Lembretes com a voz da Lumi. Cada categoria tem várias versões; a escolhida
 * varia pelo dia, para o aluno não ver sempre a mesma frase.
 * O humor brinca com as histórias, nunca com Deus, Jesus ou a fé de alguém.
 *
 * Variáveis: {nome}, {dias} (sequência), {revisoes}, {licao}.
 */
import { stableHash } from "./lessonPlan";

export type LumiReminderKind = "daily" | "streak" | "streakRisk" | "inactivity" | "review" | "morning" | "missed" | "grumpy" | "crying";

export interface LumiReminderCopy { title: string; body: string }

export const LUMI_REMINDERS: Record<LumiReminderKind, LumiReminderCopy[]> = {
  morning: [
    { title: "Bom dia, {nome}! ☀️", body: "As misericórdias se renovam cada manhã. Que tal uma lição com o café?" },
    { title: "Lumi acordou animada 🐑", body: "“{licao}” está te esperando. Leva poucos minutos!" }
  ],
  daily: [
    { title: "Lumi passou aqui 👋", body: "Sua próxima lição, “{licao}”, está prontinha. Bora?" },
    { title: "Hora da Palavra, {nome}!", body: "Davi venceu com uma pedrinha. Você vence com uma lição." },
    { title: "Só 5 minutinhos?", body: "Noé esperou 40 dias de chuva. Sua lição leva bem menos que isso." },
    { title: "Saudade de estudar com você", body: "Abre o Bibliolingo que eu te mostro o caminho." }
  ],
  streak: [
    { title: "🔥 {dias} dias seguidos!", body: "Bora manter? Uma lição hoje e a chama continua acesa." },
    { title: "Sua sequência está esperando", body: "Mais constante que o maná de cada manhã: estuda comigo hoje?" },
    { title: "{nome}, falta só a lição de hoje", body: "Um passo por dia, como Neemias reconstruindo o muro." }
  ],
  streakRisk: [
    { title: "😮 Sua sequência de {dias} dias acaba hoje!", body: "Ainda dá tempo! Uma lição rapidinha e ela continua." },
    { title: "Última chamada, {nome}!", body: "Até as virgens prudentes tinham óleo de reserva. Salve sua sequência com uma lição." }
  ],
  review: [
    { title: "{revisoes} revisões esperando você", body: "Revisar no momento certo fixa de vez. E cada acerto devolve corações!" },
    { title: "Lembra disso?", body: "Separei {revisoes} perguntas que você está quase esquecendo." }
  ],
  // Humor da Lumi quando o aluno some: nublada (2 dias), bravinha (3–4) e chorando (5+).
  missed: [
    { title: "🌧️ Dia nublado sem você, {nome}", body: "Sua ofensiva apagou, mas recomeçar é fácil: uma lição e o sol volta." },
    { title: "A Lumi ficou na chuva esperando 🌧️", body: "Até Elias viu a nuvem pequenininha e correu. Corre pra cá também?" }
  ],
  grumpy: [
    { title: "😤 Ei, {nome}! Cadê você?", body: "Tô bravinha… de brincadeira. Uma lição curtinha e fazemos as pazes." },
    { title: "Lumi de braços cruzados 😤", body: "Jonas também fugiu, e olha no que deu! Volta pra trilha?" }
  ],
  crying: [
    { title: "😭 Tô morrendo de saudade, {nome}", body: "Sem culpa: a jornada continua de onde parou. Volta comigo?" },
    { title: "A Lumi chorou um rio Jordão 😭", body: "Um estudo de 5 minutos já seca essas lágrimas." }
  ],
  inactivity: [
    { title: "Zzz… a Lumi cochilou te esperando", body: "Volta quando puder: sua jornada continua exatamente de onde parou." },
    { title: "O filho pródigo voltou e teve festa 🎉", body: "Volta também, {nome}? Sem culpa, só alegria." },
    { title: "Tô com saudades, {nome}", body: "Uma lição curtinha e a gente retoma juntos." }
  ]
};

export function fillReminder(text: string, vars: Record<string, string | number | undefined>) {
  return text
    .replace(/\{(\w+)\}/g, (match, key: string) => (vars[key] === undefined || vars[key] === "" ? "" : String(vars[key])))
    .replace(/\s+([,!?.])/g, "$1")
    .replace(/“”/g, "a próxima lição")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Escolhe uma versão estável para o dia (seed) e preenche as variáveis. */
export function lumiReminder(kind: LumiReminderKind, seed: string, vars: Record<string, string | number | undefined>): LumiReminderCopy {
  const options = LUMI_REMINDERS[kind];
  const pick = options[stableHash(kind + seed) % options.length];
  const name = vars.nome ? vars : { ...vars, nome: "" };
  return { title: fillReminder(pick.title, name).replace(/^,\s*/, "").replace(/,\s*!/, "!"), body: fillReminder(pick.body, name) };
}

/** Soma minutos a um horário "HH:MM", dando a volta no dia. */
export function shiftTime(time: string, deltaMinutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const total = ((((Number.isFinite(hour) ? hour : 19) * 60 + (Number.isFinite(minute) ? minute : 0) + deltaMinutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export const REMINDER_TIME_PRESETS = [
  { id: "morning", label: "Manhã", time: "07:30" },
  { id: "lunch", label: "Almoço", time: "12:30" },
  { id: "afternoon", label: "Tarde", time: "17:30" },
  { id: "night", label: "Noite", time: "20:00" }
] as const;
