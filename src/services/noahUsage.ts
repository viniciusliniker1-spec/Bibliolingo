export const NOAH_DAILY_QUESTION_LIMIT = 10;

const STORAGE_KEY = "bibliolingo:noah-daily-usage";

interface DailyUsage {
  date: string;
  count: number;
}

function localDateKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function readUsage(): DailyUsage {
  const today = localDateKey();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<DailyUsage>;
    if (parsed.date === today && Number.isInteger(parsed.count) && Number(parsed.count) >= 0) {
      return { date: today, count: Number(parsed.count) };
    }
  } catch {
    // Armazenamento indisponível: a sessão continua sem bloquear o app.
  }
  return { date: today, count: 0 };
}

export function noahQuestionsRemaining() {
  return Math.max(0, NOAH_DAILY_QUESTION_LIMIT - readUsage().count);
}

export function registerNoahQuestion() {
  const usage = readUsage();
  const next = { ...usage, count: Math.min(NOAH_DAILY_QUESTION_LIMIT, usage.count + 1) };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // O limite do Worker continua protegendo o backend quando o storage é bloqueado.
  }
  return Math.max(0, NOAH_DAILY_QUESTION_LIMIT - next.count);
}
