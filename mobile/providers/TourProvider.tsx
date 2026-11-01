import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AppTour } from "../components/AppTour";

type TargetRef = (node: View | null) => void;

interface TourApi {
  /** Ref para marcar um elemento real da tela como alvo do tour. */
  targetRef: (id: string) => TargetRef;
  getTarget: (id: string) => View | undefined;
  start: () => void;
  active: boolean;
}

const noop: TargetRef = () => undefined;
const TourContext = createContext<TourApi>({ targetRef: () => noop, getTarget: () => undefined, start: () => undefined, active: false });

export function TourProvider({ children, onFinish }: { children: ReactNode; onFinish: () => void }) {
  const nodes = useRef(new Map<string, View>());
  const refs = useRef(new Map<string, TargetRef>());
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
  const start = useCallback(() => setActive(true), []);
  const api = useMemo(() => ({ targetRef, getTarget, start, active }), [targetRef, getTarget, start, active]);

  return (
    <TourContext.Provider value={api}>
      <View style={styles.fill}>
        {children}
        {active ? <AppTour getTarget={getTarget} onDone={() => { setActive(false); onFinish(); }} /> : null}
      </View>
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);
/** Marca o elemento como alvo do tour (funciona fora do tour também: sem efeito). */
export const useTourTarget = (id: string) => useContext(TourContext).targetRef(id);

const styles = StyleSheet.create({ fill: { flex: 1 } });
