import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView } from "react-native";
import { AppTour } from "../components/AppTour";

type TargetRef = (node: View | null) => void;
interface Scroller { view?: ScrollView | null; offset: number }

interface TourApi {
  /** Ref para marcar um elemento real da tela como alvo do tour. */
  targetRef: (id: string) => TargetRef;
  getTarget: (id: string) => View | undefined;
  /** Rola a tela registrada com `useTourScroll` em `dy` pixels (para mostrar um alvo). */
  scrollBy: (name: string, dy: number) => boolean;
  scrollRef: (name: string) => { ref: (view: ScrollView | null) => void; onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void };
  start: () => void;
  active: boolean;
}

const noop: TargetRef = () => undefined;
const TourContext = createContext<TourApi>({
  targetRef: () => noop, getTarget: () => undefined, scrollBy: () => false,
  scrollRef: () => ({ ref: () => undefined, onScroll: () => undefined }), start: () => undefined, active: false
});

export function TourProvider({ children, onFinish }: { children: ReactNode; onFinish: () => void }) {
  const nodes = useRef(new Map<string, View>());
  const refs = useRef(new Map<string, TargetRef>());
  const scrollers = useRef(new Map<string, Scroller>());
  const scrollHandlers = useRef(new Map<string, ReturnType<TourApi["scrollRef"]>>());
  const [active, setActive] = useState(false);

  const targetRef = useCallback((id: string) => {
    let ref = refs.current.get(id);
    if (!ref) {
      ref = (node) => { if (node) nodes.current.set(id, node); else nodes.current.delete(id); };
      refs.current.set(id, ref);
    }
    return ref;
  }, []);
  const getTarget = useCallback((id: string) => nodes.current.get(id), []);
  const scrollRef = useCallback((name: string) => {
    let handlers = scrollHandlers.current.get(name);
    if (!handlers) {
      const entry: Scroller = scrollers.current.get(name) ?? { offset: 0 };
      scrollers.current.set(name, entry);
      handlers = {
        ref: (view) => { entry.view = view; },
        onScroll: (event) => { entry.offset = event.nativeEvent.contentOffset.y; }
      };
      scrollHandlers.current.set(name, handlers);
    }
    return handlers;
  }, []);
  const scrollBy = useCallback((name: string, dy: number) => {
    const entry = scrollers.current.get(name);
    if (!entry?.view) return false;
    const y = Math.max(0, entry.offset + dy);
    entry.view.scrollTo({ y, animated: true });
    entry.offset = y;
    return true;
  }, []);
  const start = useCallback(() => setActive(true), []);
  const api = useMemo(() => ({ targetRef, getTarget, scrollBy, scrollRef, start, active }), [targetRef, getTarget, scrollBy, scrollRef, start, active]);

  return (
    <TourContext.Provider value={api}>
      <View style={styles.fill}>
        {children}
        {active ? <AppTour getTarget={getTarget} scrollBy={scrollBy} onDone={() => { setActive(false); onFinish(); }} /> : null}
      </View>
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);
/** Marca o elemento como alvo do tour (funciona fora do tour também: sem efeito). */
export const useTourTarget = (id: string) => useContext(TourContext).targetRef(id);
/** Liga uma ScrollView ao tour, para ele rolar até alvos fora da tela. Use `ref` e `onScroll` (com scrollEventThrottle). */
export const useTourScroll = (name: string) => useContext(TourContext).scrollRef(name);

const styles = StyleSheet.create({ fill: { flex: 1 } });
