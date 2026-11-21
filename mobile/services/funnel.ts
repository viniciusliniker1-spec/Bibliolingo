import AsyncStorage from "@react-native-async-storage/async-storage";
import { EMPTY_FUNNEL, recordEvent, recordOpen, type FunnelEvent, type FunnelState } from "../domain/funnel";

const KEY = "@bibliolingo/funnel/v1";
let writes: Promise<unknown> = Promise.resolve();

export async function loadFunnel(): Promise<FunnelState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<FunnelState>) : {};
    return {
      events: parsed.events && typeof parsed.events === "object" ? parsed.events : {},
      openDays: Array.isArray(parsed.openDays) ? parsed.openDays.filter((day): day is string => typeof day === "string") : []
    };
  } catch {
    return EMPTY_FUNNEL;
  }
}

function update(change: (state: FunnelState) => FunnelState) {
  // Gravações em fila: dois eventos seguidos não se atropelam.
  writes = writes.then(async () => {
    try {
      const next = change(await loadFunnel());
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Métrica é opcional: falhar aqui nunca deve atrapalhar o app.
    }
  });
  return writes;
}

export const trackOpen = () => update((state) => recordOpen(state));
export const trackEvent = (event: FunnelEvent) => update((state) => recordEvent(state, event));
