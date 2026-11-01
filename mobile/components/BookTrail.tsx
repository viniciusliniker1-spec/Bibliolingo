import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTourTarget } from "../providers/TourProvider";
import { ActivityIndicator, Image, InteractionManager, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { toLocalDateKey } from "../../src/domain/streak";
import { nextJourneyActivityId } from "../../src/domain/unlocks";
import { mobileSceneAssets } from "../assets/sceneAssets";
import { buildTrailModel, type TrailMode, type TrailNode } from "../domain/trailModel";
import { detectProgressEvent, type LumiEvent, type ProgressSnapshot } from "../domain/lumiBehavior";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import type { Palette } from "../theme/tokens";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import { LUMI_COMPANION_WIDTH, LumiTrailCompanion, type LumiTrigger } from "./LumiTrailCompanion";
import { Icon } from "./navigation/Icons";
import { HeartsGate } from "./HeartsGate";
import { isOutOfHearts } from "../domain/hearts";

type Catalog = typeof import("../../src/content/catalog");

/** A saudação de boas-vindas acontece uma vez por abertura do app. */
let greetedThisSession = false;

interface Props {
  /** Livro aberto pela lista de livros. Sem valor: livro atual da jornada (aba Trilha). */
  bookId?: string;
}

export function BookTrail({ bookId }: Props) {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const auth = useMobileAuth();
  const { progress, hydrated } = useMobileProgress();
  const [catalog, setCatalog] = useState<Catalog>();
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState<TrailMode>("canonical");
  const [sheetId, setSheetId] = useState<string>();
  const [activityKey, setActivityKey] = useState(0);
  const [trigger, setTrigger] = useState<LumiTrigger>();
  const scrollRef = useRef<ScrollView>(null);
  const scrolledFor = useRef<string | undefined>(undefined);
  const inTabs = !bookId;
  const touch = useCallback(() => setActivityKey((key) => key + 1), []);

  useLightStatusBar();

  // O catálogo é grande: carrega depois da primeira renderização para não travar a abertura.
  useEffect(() => {
    let active = true;
    const task = InteractionManager.runAfterInteractions(() => {
      import("../../src/content/catalog")
        .then((module) => { if (active) setCatalog(module); })
        .catch((cause) => { if (active) setLoadError(cause instanceof Error ? cause.message : "Não foi possível abrir a trilha."); });
    });
    return () => { active = false; task.cancel(); };
  }, []);

  const journeyNextId = useMemo(() => catalog
    ? nextJourneyActivityId(catalog.orderedActivityIds, progress.completedLessonIds, progress.completedCheckpointIds)
    : undefined, [catalog, progress.completedLessonIds, progress.completedCheckpointIds]);

  const book = useMemo(() => {
    if (!catalog) return undefined;
    if (bookId) return catalog.journeyBooks.find((item) => item.id === bookId);
    return (journeyNextId ? catalog.getBookForActivity(journeyNextId) : undefined) ?? catalog.journeyBooks[0];
  }, [catalog, bookId, journeyNextId]);

  const model = useMemo(() => (catalog && book ? buildTrailModel({
    book,
    orderedActivityIds: catalog.orderedActivityIds,
    completedLessonIds: progress.completedLessonIds,
    completedCheckpointIds: progress.completedCheckpointIds,
    mode,
    width
  }) : undefined), [catalog, book, progress.completedLessonIds, progress.completedCheckpointIds, mode, width]);

  const bookComplete = Boolean(model && model.completed === model.total);
  const restingEvent: LumiEvent = model?.current ? (model.current.checkpoint ? "checkpoint" : "idle") : bookComplete ? "concluido" : "idle";
  const journeyNextTitle = journeyNextId && catalog ? catalog.getActivity(journeyNextId)?.title : undefined;
  const displayName = (auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "";
  const currentUnitNodes = model?.current ? model.nodes.filter((node) => node.unitIndex === model.current!.unitIndex && !node.checkpoint) : [];
  const vars = {
    nome: displayName.split(" ")[0] || "amigo",
    licao: model?.current?.title ?? journeyNextTitle,
    livro: model?.bookTitle,
    caps: model?.currentUnit?.chaptersLabel ?? model?.bookTitle,
    dias: progress.streak,
    faltam: currentUnitNodes.filter((node) => node.state !== "done").length,
    minutos: model?.current?.minutes ?? 8
  };

  // Primeira fala: boas-vindas na abertura do app; depois, a fala de espera.
  useEffect(() => {
    if (!model || trigger) return;
    const first = !greetedThisSession;
    greetedThisSession = true;
    setTrigger({ event: first ? "abrir" : restingEvent, id: 1 });
  }, [model, trigger, restingEvent]);

  // Conclusões, checkpoints e sequências viram reações da Lumi.
  const previous = useRef<ProgressSnapshot | undefined>(undefined);
  useEffect(() => {
    if (!hydrated) return;
    const snapshot = { lessons: progress.completedLessonIds.length, checkpoints: progress.completedCheckpointIds.length, streak: progress.streak };
    const event = detectProgressEvent(previous.current, snapshot);
    previous.current = snapshot;
    if (event) setTrigger((current) => ({ event, id: (current?.id ?? 0) + 1 }));
  }, [hydrated, progress.completedLessonIds.length, progress.completedCheckpointIds.length, progress.streak]);

  const anchor = model?.current ?? (model ? (bookComplete ? model.nodes[model.nodes.length - 1] : model.nodes[0]) : undefined);

  // Leva a trilha até o próximo passo.
  useEffect(() => {
    if (!anchor || scrolledFor.current === anchor.id) return;
    scrolledFor.current = anchor.id;
    const timer = setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, anchor.y - 260), animated: true }), 120);
    return () => clearTimeout(timer);
  }, [anchor]);

  const [heartsGate, setHeartsGate] = useState(false);
  const start = useCallback((activityId: string) => {
    if (!model) return;
    setSheetId(undefined);
    // Sem corações: primeiro a revisão, que devolve corações a cada acerto.
    if (isOutOfHearts(progress)) { setHeartsGate(true); return; }
    router.push({ pathname: "/lesson/[activityId]", params: { activityId, journeyMode: mode, journeyBookId: model.bookId } });
  }, [model, mode, router, progress]);

  if (!hydrated || !model) {
    return (
      <View style={[styles.fill, styles.center, { paddingTop: insets.top }]}>
        {loadError ? <Text style={styles.loadingText}>{loadError}</Text> : <><ActivityIndicator color={trail.accent} size="large" /><Text style={styles.loadingText}>Preparando sua trilha…</Text></>}
        {catalog && bookId && !book ? <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Voltar aos livros</Text></Pressable> : null}
      </View>
    );
  }

  const todayXp = progress.activity[toLocalDateKey(new Date())]?.xp ?? 0;
  const dailyGoal = Math.max(1, progress.profile.dailyGoal);
  const sheetNode = sheetId ? model.nodes.find((node) => node.id === sheetId) : undefined;
  const unit = model.currentUnit;
  const unitDone = unit ? unit.completed : model.completed;
  const unitTotal = unit ? unit.total : model.total;
  const lumiLeft = anchor
    ? Math.max(4, Math.min(width - LUMI_COMPANION_WIDTH - 4,
      anchor.companionSide === "right" ? anchor.x + anchor.size / 2 + 6 : anchor.x - anchor.size / 2 - 6 - LUMI_COMPANION_WIDTH))
    : 4;
  const lumiTop = anchor ? Math.max(0, anchor.y - 178) : 0;

  const cta = model.current
    ? { label: model.current.checkpoint ? `Fazer checkpoint · ${unit?.chaptersLabel ?? model.bookTitle}` : `Continuar · ${model.current.title}`, onPress: () => start(model.current!.id) }
    : bookComplete
      ? { label: "Escolher o próximo livro", onPress: () => router.push("/tracks") }
      : mode === "canonical"
        ? { label: `Estudar ${model.bookTitle} separadamente`, onPress: () => setMode("individual") }
        : { label: "Voltar à jornada", onPress: () => router.navigate("/") };

  const tourBook = useTourTarget("trail-book");
  const tourStats = useTourTarget("trail-stats");
  const tourCta = useTourTarget("trail-continue");
  return (
    <View style={styles.fill}>
      {/* Topo: livro atual (abre a lista de livros) e indicadores */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        {!inTabs ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.iconButton} hitSlop={6}>
            <Icon name="back" size={22} color={trail.text} />
          </Pressable>
        ) : null}
        <Pressable ref={inTabs ? tourBook : undefined} accessibilityRole="button" accessibilityLabel={`${model.bookTitle}. Trocar de livro`} onPress={() => router.push("/tracks")} style={styles.bookChip}>
          <Icon name="book" size={18} color={trail.xp} strokeWidth={2.2} />
          <Text style={styles.bookChipText} numberOfLines={1}>{model.bookTitle}</Text>
          <Icon name="chevronDown" size={14} color={trail.textMuted} strokeWidth={2.6} />
        </Pressable>
        <View ref={inTabs ? tourStats : undefined} collapsable={false} style={styles.stats}>
          <View style={styles.stat} accessible accessibilityLabel={`Sequência de ${progress.streak} dias`}><Icon name="flame" size={19} color={trail.streak} /><Text style={[styles.statText, { color: trail.streakText }]}>{progress.streak}</Text></View>
          <View style={styles.stat} accessible accessibilityLabel={`${progress.xp} pontos de experiência`}><Icon name="star" size={19} color={trail.xp} /><Text style={[styles.statText, { color: trail.xp }]}>{progress.xp}</Text></View>
          {progress.settings.heartsEnabled ? <View style={styles.stat} accessible accessibilityLabel={`${progress.hearts} corações`}><Icon name="heart" size={19} color={trail.heart} /><Text style={[styles.statText, { color: trail.heartText }]}>{progress.hearts}</Text></View> : null}
        </View>
      </View>

      {/* Unidade atual */}
      <View style={styles.unitCard}>
        <Image source={mobileSceneAssets.journey} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={styles.unitScrim} />
        <View style={styles.unitContent}>
          <Text style={styles.unitEyebrow} numberOfLines={1}>{unit ? `UNIDADE ${unit.index} · ${unit.chaptersLabel.toUpperCase()}` : model.bookTitle.toUpperCase()}</Text>
          <Text style={styles.unitTitle} numberOfLines={1}>{unit?.title ?? (bookComplete ? "Livro concluído" : "Ainda não chegou a vez deste livro")}</Text>
          <Text style={styles.unitSubtitle} numberOfLines={1}>{unit?.subtitle ?? (bookComplete ? "Você concluiu todas as etapas." : journeyNextTitle ? `Na jornada, o próximo passo é “${journeyNextTitle}”.` : "")}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: unitTotal, now: unitDone }}>
              <View style={[styles.progressFill, { width: `${unitTotal ? Math.round((unitDone / unitTotal) * 100) : 0}%` }]} />
            </View>
            <Text style={styles.progressText}>{unitDone} de {unitTotal}</Text>
          </View>
        </View>
      </View>
      <View style={styles.goalRow} accessible accessibilityLabel={`Meta de hoje: ${Math.min(todayXp, dailyGoal)} de ${dailyGoal} XP`}>
        <Text style={styles.goalLabel}>Meta de hoje</Text>
        <View style={styles.goalTrack}><View style={[styles.goalFill, { width: `${Math.round(Math.min(1, todayXp / dailyGoal) * 100)}%` }]} /></View>
        <Text style={styles.goalValue}>{Math.min(todayXp, dailyGoal)}/{dailyGoal} XP</Text>
      </View>
      {mode === "individual" ? (
        <Pressable accessibilityRole="button" onPress={() => setMode("canonical")} style={styles.modePill}>
          <Text style={styles.modePillText}>Estudo individual de {model.bookTitle} · <Text style={styles.modePillLink}>voltar à jornada</Text></Text>
        </Pressable>
      ) : null}

      {/* Caminho */}
      <ScrollView ref={scrollRef} style={styles.fill} showsVerticalScrollIndicator={false} onScrollBeginDrag={touch}>
        <View style={{ height: model.height }}>
          <Svg width={width} height={model.height} style={StyleSheet.absoluteFill}>
            <Path d={model.pathAll} fill="none" stroke={trail.line} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 18" />
            {model.pathDone ? <Path d={model.pathDone} fill="none" stroke={trail.xp} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 18" /> : null}
          </Svg>

          {model.units.filter((card) => card.inline).map((card) => (
            <View key={card.id} style={[styles.unitDivider, { top: card.y }, card.locked && styles.unitDividerLocked]} accessible accessibilityLabel={`Unidade ${card.index}, ${card.title}, ${card.locked ? "bloqueada" : `${card.completed} de ${card.total} concluídas`}`}>
              <Text style={styles.dividerEyebrow} numberOfLines={1}>UNIDADE {card.index} · {card.chaptersLabel.toUpperCase()}</Text>
              <Text style={styles.dividerTitle} numberOfLines={1}>{card.title}</Text>
              <Text style={styles.dividerMeta} numberOfLines={1}>{card.locked ? "Conclua a unidade anterior para liberar" : `${card.completed} de ${card.total} concluídas`}</Text>
            </View>
          ))}

          {model.nodes.map((node) => <TrailNodeButton key={node.id} node={node} onPress={() => { touch(); setSheetId(node.id); }} />)}

          {anchor ? (
            <LumiTrailCompanion
              trigger={trigger}
              restingEvent={restingEvent}
              vars={vars}
              activityKey={activityKey}
              reduceMotion={Boolean(progress.settings.reduceMotionEnabled)}
              style={[styles.lumi, { left: lumiLeft, top: lumiTop }]}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Próximo passo sempre à mão */}
      <View style={[styles.ctaBar, !inTabs && { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable ref={inTabs ? tourCta : undefined} accessibilityRole="button" onPress={() => { touch(); cta.onPress(); }} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
          <Icon name="play" size={18} color={trail.ctaText} />
          <Text style={styles.ctaText} numberOfLines={1}>{cta.label}</Text>
        </Pressable>
      </View>

      <HeartsGate visible={heartsGate} maxHearts={progress.settings.maxHearts} onClose={() => setHeartsGate(false)} onReview={() => { setHeartsGate(false); router.push("/review"); }} />

      <TrailSheet
        node={sheetNode}
        mode={mode}
        bookTitle={model.bookTitle}
        unitLabel={sheetNode ? model.units[sheetNode.unitIndex]?.chaptersLabel : undefined}
        blockingTitle={mode === "canonical" ? journeyNextTitle : model.current?.title}
        onClose={() => setSheetId(undefined)}
        onStart={start}
        onStudyBook={() => { setMode("individual"); setSheetId(undefined); }}
        onGoToNext={() => {
          setSheetId(undefined);
          if (model.current) setSheetId(model.current.id);
          else router.navigate("/");
        }}
      />
    </View>
  );
}

function TrailNodeButton({ node, onPress }: { node: TrailNode; onPress: () => void }) {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  const done = node.state === "done";
  const current = node.state === "current";
  const locked = node.state === "locked";
  const tourRef = useTourTarget("trail-current");
  const background = done ? trail.xp : current || node.state === "available" ? trail.cta : trail.node;
  const ring = done ? "#ffd98f" : current ? trail.accent : node.state === "available" ? "#4fc9b9" : trail.line;
  const lip = done ? "#9a6410" : current || node.state === "available" ? trail.ctaShadow : trail.nodeShadow;
  const stateLabel = done ? "concluída" : current ? "próximo passo" : locked ? "bloqueada" : "disponível";
  const icon = done ? <Icon name="check" size={30} color="#10243e" strokeWidth={3.2} />
    : node.checkpoint ? <Icon name="shield" size={30} color={locked ? trail.lockIcon : "#ffffff"} />
      : locked ? <Icon name="lock" size={24} color={trail.lockIcon} strokeWidth={2.6} />
        : <Icon name="book" size={28} color="#ffffff" />;
  return (
    <View style={[styles.nodeWrap, { left: node.x - node.size / 2, top: node.y - node.size / 2, width: node.size }]} pointerEvents="box-none">
      <Pressable
        ref={current ? tourRef : undefined}
        accessibilityRole="button"
        accessibilityLabel={`${node.checkpoint ? "Checkpoint" : `Lição ${node.lessonNumber}`}: ${node.title}, ${stateLabel}`}
        accessibilityHint="Mostra a prévia da atividade"
        onPress={onPress}
        style={({ pressed }) => [{ width: node.size, height: node.size + 6 }, pressed && { transform: [{ translateY: 3 }] }]}
      >
        <View style={[styles.nodeLip, { width: node.size, height: node.size, borderRadius: node.size / 2, backgroundColor: lip }]} />
        <View style={[styles.node, { width: node.size, height: node.size, borderRadius: node.size / 2, backgroundColor: background, borderColor: ring }]}>{icon}</View>
      </Pressable>
      {current ? <View style={styles.startTag}><Text style={styles.startTagText}>COMEÇAR</Text></View> : null}
    </View>
  );
}

interface SheetProps {
  node?: TrailNode;
  mode: TrailMode;
  bookTitle: string;
  unitLabel?: string;
  blockingTitle?: string;
  onClose: () => void;
  onStart: (id: string) => void;
  onStudyBook: () => void;
  onGoToNext: () => void;
}

function TrailSheet({ node, mode, bookTitle, unitLabel, blockingTitle, onClose, onStart, onStudyBook, onGoToNext }: SheetProps) {
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const locked = node?.state === "locked";
  const done = node?.state === "done";
  return (
    <Modal visible={Boolean(node)} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar prévia" style={styles.sheetBackdrop} onPress={onClose} />
      {node ? (
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]} accessibilityViewIsModal>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetTop}>
            <Text style={[styles.sheetKind, node.checkpoint && { color: "#9a6410" }]}>{node.checkpoint ? "CHECKPOINT" : `LIÇÃO ${node.lessonNumber}`}</Text>
            <Text style={styles.sheetMeta}>{done ? "Concluída" : locked ? "Bloqueada" : `${node.minutes} min`}</Text>
          </View>
          <Text style={styles.sheetTitle}>{node.title}</Text>
          <Text style={styles.sheetBody}>{node.subtitle}</Text>
          <Text style={styles.sheetReference}>{node.referenceLabel ?? unitLabel}</Text>
          {locked ? (
            <Text style={styles.sheetHint}>
              {mode === "canonical"
                ? `Na jornada principal, conclua primeiro “${blockingTitle ?? "a etapa anterior"}”. Se preferir, estude ${bookTitle} separadamente, sem perder sua posição na jornada.`
                : `Conclua “${blockingTitle ?? "a etapa anterior"}” para chegar até aqui.`}
            </Text>
          ) : null}
          {!locked ? (
            <Pressable accessibilityRole="button" onPress={() => onStart(node.id)} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
              <Text style={styles.ctaText}>{done ? "Revisar lição" : node.checkpoint ? "Começar checkpoint" : "Começar lição"}</Text>
            </Pressable>
          ) : (
            <>
              <Pressable accessibilityRole="button" onPress={onGoToNext} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
                <Text style={styles.ctaText}>Ir para o próximo passo</Text>
              </Pressable>
              {mode === "canonical" ? (
                <Pressable accessibilityRole="button" onPress={onStudyBook} style={styles.sheetSecondary}>
                  <Text style={styles.sheetSecondaryText}>Estudar {bookTitle} separadamente</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      ) : null}
    </Modal>
  );
}

const makeStyles = (trail: Palette) => StyleSheet.create({
  fill: { flex: 1, backgroundColor: trail.ground },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: trail.textMuted, fontSize: 15, fontWeight: "700", textAlign: "center", paddingHorizontal: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22 },
  bookChip: { flexShrink: 1, flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: trail.line, backgroundColor: trail.card },
  bookChipText: { flexShrink: 1, color: trail.text, fontSize: 15, fontWeight: "800" },
  stats: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 12 },
  stat: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { fontSize: 15, fontWeight: "900" },
  unitCard: { height: 112, marginHorizontal: 16, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: trail.line },
  unitScrim: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(9, 24, 41, 0.74)" },
  unitContent: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, justifyContent: "space-between" },
  unitEyebrow: { color: "#7fe3d5", fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  unitTitle: { color: "#ffffff", fontSize: 20, fontWeight: "900" },
  unitSubtitle: { color: "#d3e0ec", fontSize: 13, fontWeight: "700" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.18)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: "#f2b84b" },
  progressText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, marginTop: 10 },
  goalLabel: { color: trail.textMuted, fontSize: 12, fontWeight: "800" },
  goalTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: trail.card, overflow: "hidden" },
  goalFill: { height: "100%", borderRadius: 3, backgroundColor: trail.accent },
  goalValue: { color: trail.text, fontSize: 12, fontWeight: "900" },
  modePill: { alignSelf: "center", marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, minHeight: 36, borderRadius: 18, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  modePillText: { color: trail.textMuted, fontSize: 12, fontWeight: "700" },
  modePillLink: { color: trail.accent, fontWeight: "900" },
  unitDivider: { position: "absolute", left: 16, right: 16, height: 92, borderRadius: 18, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, gap: 2 },
  unitDividerLocked: { opacity: 0.8 },
  dividerEyebrow: { color: trail.textMuted, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  dividerTitle: { color: trail.text, fontSize: 17, fontWeight: "900" },
  dividerMeta: { color: trail.textMuted, fontSize: 12, fontWeight: "700" },
  nodeWrap: { position: "absolute", alignItems: "center" },
  nodeLip: { position: "absolute", top: 6, left: 0 },
  node: { position: "absolute", top: 0, left: 0, borderWidth: 4, alignItems: "center", justifyContent: "center" },
  startTag: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: trail.accent },
  startTagText: { color: trail.ctaText, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  lumi: { position: "absolute", zIndex: 5 },
  ctaBar: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: trail.ground, borderTopWidth: 1, borderTopColor: trail.divider },
  cta: { minHeight: 54, borderRadius: 16, backgroundColor: trail.cta, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, borderBottomWidth: 5, borderBottomColor: trail.ctaShadow },
  ctaPressed: { borderBottomWidth: 2, marginTop: 3 },
  ctaText: { color: trail.ctaText, fontSize: 16, fontWeight: "900", flexShrink: 1 },
  secondaryButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16 },
  secondaryText: { color: trail.accent, fontWeight: "800" },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(4, 12, 22, 0.6)" },
  sheet: { backgroundColor: trail.sheet, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 10, gap: 12 },
  sheetHandle: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: "#c9d5df", marginBottom: 6 },
  sheetTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetKind: { color: "#0b7f75", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  sheetMeta: { color: "#4f6378", fontSize: 13, fontWeight: "800" },
  sheetTitle: { color: "#10243e", fontSize: 24, fontWeight: "900" },
  sheetBody: { color: "#3b4f64", fontSize: 15, fontWeight: "700", lineHeight: 21 },
  sheetReference: { color: "#0b7f75", fontSize: 13, fontWeight: "800" },
  sheetHint: { color: "#3b4f64", fontSize: 14, lineHeight: 20, padding: 12, borderRadius: 12, backgroundColor: "#e8eef3" },
  sheetSecondary: { minHeight: 50, borderRadius: 16, borderWidth: 2, borderColor: "#10243e", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  sheetSecondaryText: { color: "#10243e", fontSize: 15, fontWeight: "900" }
});
