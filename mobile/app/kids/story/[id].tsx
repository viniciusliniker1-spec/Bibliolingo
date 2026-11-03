import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LumiCharacter } from "../../../components/LumiCharacter";
import { Icon } from "../../../components/navigation/Icons";
import { KidsSceneArt } from "../../../components/kids/KidsSceneArt";
import { kidsStoryById, type KidsActivity } from "../../../content/kids/stories";
import { planFor, starsFor } from "../../../domain/kids";
import { stableHash } from "../../../domain/lessonPlan";
import { useFeedbackEffects } from "../../../hooks/useFeedbackEffects";
import { useMobileProgress } from "../../../providers/MobileProgressProvider";
import { saveKidsStars } from "../../../services/kidsProgress";
import { kidsSay, kidsStop } from "../../../services/kidsVoice";
import { KIDS_PRAISE, KIDS_TRUE_FALSE, KIDS_TRY_AGAIN, kidsCongrats } from "../../../domain/kidsNarration";
import { KIDS } from "../../../components/kids/theme";

type Phase = { kind: "scene"; index: number } | { kind: "activity"; index: number } | { kind: "verse" } | { kind: "done" };


/** História do modo criança: cenas narradas → atividades de toque → versículo → comemoração. */
export default function KidsStoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id: string }>();
  const story = kidsStoryById.get(params.id ?? "") ?? kidsStoryById.get("criacao")!;
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const age = progress.settings.kidsMode?.age ?? "6-8";
  const plan = useMemo(() => planFor(story, age), [story, age]);
  const [phase, setPhase] = useState<Phase>({ kind: "scene", index: 0 });
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState(0);
  const [narration, setNarration] = useState(plan.autoNarrate);
  const artWidth = Math.min(width - 32, 520);

  const sceneText = (index: number) => (plan.sceneText === "short" ? story.scenes[index].short : story.scenes[index].text);

  useEffect(() => {
    if (phase.kind === "scene" && narration) void kidsSay(sceneText(phase.index));
    if (phase.kind === "verse" && narration) void kidsSay(story.verse.text, 0.85);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => kidsStop(), []);

  const totalSteps = story.scenes.length + plan.activities.length + 1;
  const stepNow = phase.kind === "scene" ? phase.index : phase.kind === "activity" ? story.scenes.length + phase.index : phase.kind === "verse" ? totalSteps - 1 : totalSteps;

  const next = () => {
    kidsStop();
    playFeedback("select");
    if (phase.kind === "scene") setPhase(phase.index + 1 < story.scenes.length ? { kind: "scene", index: phase.index + 1 } : plan.activities.length ? { kind: "activity", index: 0 } : { kind: "verse" });
    else if (phase.kind === "activity") setPhase(phase.index + 1 < plan.activities.length ? { kind: "activity", index: phase.index + 1 } : { kind: "verse" });
    else if (phase.kind === "verse") {
      const earned = starsFor(mistakes);
      setStars(earned);
      void saveKidsStars(story.id, earned);
      playFeedback("complete");
      void kidsSay(kidsCongrats(earned));
      setPhase({ kind: "done" });
    }
  };
  const back = () => {
    kidsStop();
    if (phase.kind === "scene" && phase.index > 0) setPhase({ kind: "scene", index: phase.index - 1 });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar às histórias" onPress={() => { kidsStop(); router.back(); }} hitSlop={10} style={styles.roundBtn}><Icon name="close" size={22} color={KIDS.muted} /></Pressable>
        <View style={styles.dots}>{Array.from({ length: totalSteps }, (_, i) => <View key={i} style={[styles.dot, i < stepNow && styles.dotDone, i === stepNow && styles.dotNow]} />)}</View>
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: narration }} accessibilityLabel="Narração" onPress={() => { if (narration) kidsStop(); setNarration(!narration); }} style={[styles.roundBtn, narration && styles.roundBtnOn]}>
          <Icon name="volume" size={20} color={narration ? "#ffffff" : KIDS.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 120 }]}>
        {phase.kind === "scene" ? (
          <>
            <KidsSceneArt scene={story.scenes[phase.index]} width={artWidth} />
            <Text style={[styles.sceneText, plan.sceneText === "short" && styles.sceneTextBig]}>{sceneText(phase.index)}</Text>
          </>
        ) : phase.kind === "activity" ? (
          <ActivityView key={phase.index} activity={plan.activities[phase.index]} seed={story.id + phase.index} narration={narration}
            onMistake={() => setMistakes((n) => n + 1)} onSolved={next} playFeedback={playFeedback} />
        ) : phase.kind === "verse" ? (
          <View style={styles.verseCard}>
            <Text style={styles.verseLabel}>VERSÍCULO PARA GUARDAR NO CORAÇÃO</Text>
            <Text style={styles.verseText}>“{story.verse.text}”</Text>
            <Text style={styles.verseRef}>{story.verse.ref}</Text>
            <Pressable accessibilityRole="button" onPress={() => void kidsSay(story.verse.text, 0.7)} style={styles.repeat}>
              <Icon name="volume" size={22} color={KIDS.cta} /><Text style={styles.repeatText}>Repita comigo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.done}>
            <LumiCharacter mood="achievement" motion="celebrating" style={styles.doneLumi} accessibilityLabel="Lumi comemorando" />
            <Text style={styles.doneTitle}>Parabéns!</Text>
            <View style={styles.bigStars}>{[1, 2, 3].map((n) => <Icon key={n} name="star" size={54} color={n <= stars ? KIDS.star : KIDS.starOff} />)}</View>
            <Pressable accessibilityRole="button" accessibilityLabel="Ver meu álbum de figurinhas" onPress={() => router.replace("/kids/album")} style={[styles.sticker, { backgroundColor: story.color }]}>
              <Text style={styles.stickerEmoji} allowFontScaling={false}>{story.cover}</Text>
              <View style={styles.flexShrink}>
                <Text style={styles.stickerLabel}>NOVA FIGURINHA!</Text>
                <Text style={styles.stickerTitle}>{story.title}</Text>
              </View>
            </Pressable>
            <View style={styles.family}>
              <Text style={styles.familyLabel}>PARA CONVERSAR EM FAMÍLIA</Text>
              <Text style={styles.familyText}>{story.family}</Text>
              <Text style={styles.parentsNote}>Para os pais: {story.bigStory}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => { setMistakes(0); setPhase({ kind: "scene", index: 0 }); }} style={styles.secondary}><Text style={styles.secondaryText}>Ouvir de novo</Text></Pressable>
          </View>
        )}
      </ScrollView>

      {/* Navegação com botões grandes (sem gestos) */}
      {phase.kind === "scene" || phase.kind === "verse" || phase.kind === "done" ? (
        <View style={[styles.navBar, { paddingBottom: insets.bottom + 12 }]}>
          {phase.kind === "scene" ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Ouvir de novo" onPress={() => void kidsSay(sceneText(phase.index))} style={styles.navSide}><Icon name="volume" size={28} color={KIDS.cta} /></Pressable>
          ) : phase.kind === "done" ? null : <View style={styles.navSpacer} />}
          {phase.kind === "scene" && phase.index > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={back} style={styles.navSide}><Icon name="chevronLeft" size={30} color={KIDS.muted} /></Pressable>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityLabel={phase.kind === "done" ? "Voltar às histórias" : "Próximo"} onPress={phase.kind === "done" ? () => router.back() : next} style={({ pressed }) => [styles.navNext, pressed && { transform: [{ translateY: 3 }] }]}>
            {phase.kind === "done" ? <Text style={styles.navNextText}>Mais histórias</Text> : <Icon name="chevronRight" size={36} color="#ffffff" strokeWidth={3} />}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ActivityView({ activity, seed, narration, onMistake, onSolved, playFeedback }: {
  activity: KidsActivity; seed: string; narration: boolean; onMistake: () => void; onSolved: () => void; playFeedback: ReturnType<typeof useFeedbackEffects>;
}) {
  const [wrong, setWrong] = useState<number>();
  const [right, setRight] = useState<number>();
  const [placed, setPlaced] = useState<number[]>([]);
  const [praise, setPraise] = useState<string>();
  const shake = useRef(new Animated.Value(0)).current;
  const promptLines = activity.type === "truefalse" ? [KIDS_TRUE_FALSE, activity.statement] : [activity.question];
  const order = useMemo(() => activity.type === "order" ? [0, 1, 2].sort((a, b) => stableHash(seed + a) - stableHash(seed + b)) : [], [activity, seed]);

  useEffect(() => { if (narration) void kidsSay(promptLines); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const miss = (index: number) => {
    onMistake(); setWrong(index); playFeedback("wrong");
    Animated.sequence([-10, 10, -8, 8, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 50, useNativeDriver: true }))).start();
    void kidsSay(KIDS_TRY_AGAIN);
    setTimeout(() => setWrong(undefined), 500);
  };
  const win = (index: number, extra?: string) => {
    const cheer = KIDS_PRAISE[stableHash(seed) % KIDS_PRAISE.length];
    const text = extra ?? cheer;
    setRight(index); setPraise(text); playFeedback("correct"); void kidsSay(extra ? [cheer, extra] : cheer);
    setTimeout(onSolved, extra ? 3400 : 1400);
  };

  return (
    <Animated.View style={[styles.activity, { transform: [{ translateX: shake }] }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Ouvir a pergunta" onPress={() => void kidsSay(promptLines)} style={styles.questionRow}>
        <Icon name="volume" size={24} color={KIDS.cta} />
        <Text style={styles.question}>{activity.type === "truefalse" ? `Certo ou errado? ${activity.statement}` : activity.question}</Text>
      </Pressable>

      {activity.type === "pick" ? (
        <View style={styles.cards}>
          {activity.options.map((option, i) => (
            <Pressable key={i} accessibilityRole="button" accessibilityLabel={option.label} disabled={right !== undefined}
              onPress={() => { if (i === activity.answer) win(i); else miss(i); }}
              style={[styles.card, wrong === i && styles.cardWrong, right === i && styles.cardRight]}>
              <Text style={styles.cardEmoji} allowFontScaling={false}>{option.emoji}</Text>
              <Text style={styles.cardLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : activity.type === "order" ? (
        <View style={styles.cards}>
          {order.map((itemIndex) => {
            const item = activity.items[itemIndex];
            const position = placed.indexOf(itemIndex);
            return (
              <Pressable key={itemIndex} accessibilityRole="button" accessibilityLabel={item.label} disabled={position >= 0 || right !== undefined}
                onPress={() => {
                  void kidsSay(item.label);
                  if (itemIndex === placed.length) { const nextPlaced = [...placed, itemIndex]; setPlaced(nextPlaced); playFeedback("select"); if (nextPlaced.length === 3) win(itemIndex); }
                  else miss(itemIndex);
                }}
                style={[styles.card, position >= 0 && styles.cardRight, wrong === itemIndex && styles.cardWrong]}>
                {position >= 0 ? <View style={styles.orderBadge}><Text style={styles.orderBadgeText}>{position + 1}</Text></View> : null}
                <Text style={styles.cardEmoji} allowFontScaling={false}>{item.emoji}</Text>
                <Text style={styles.cardLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.tfRow}>
          {[true, false].map((value, i) => (
            <Pressable key={String(value)} accessibilityRole="button" accessibilityLabel={value ? "Certo" : "Errado"} disabled={right !== undefined}
              onPress={() => (value === activity.answer ? win(i, activity.explain) : miss(i))}
              style={[styles.tf, { backgroundColor: value ? KIDS.goodSoft : KIDS.badSoft, borderColor: value ? KIDS.good : KIDS.bad }, wrong === i && styles.cardWrong, right === i && styles.cardRight]}>
              <Text style={styles.tfEmoji} allowFontScaling={false}>{value ? "👍" : "👎"}</Text>
              <Text style={[styles.cardLabel, { color: value ? KIDS.good : KIDS.bad }]}>{value ? "Certo" : "Errado"}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {praise ? <Text style={styles.praise}>🎉 {praise}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS.ground },
  top: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingBottom: 8 },
  roundBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.card, borderWidth: 1.5, borderColor: KIDS.line },
  roundBtnOn: { backgroundColor: KIDS.cta, borderColor: KIDS.cta },
  dots: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 5, justifyContent: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: KIDS.line },
  dotDone: { backgroundColor: KIDS.star },
  dotNow: { width: 22, backgroundColor: KIDS.cta },
  body: { padding: 16, gap: 18, alignItems: "center" },
  sceneText: { color: KIDS.text, fontSize: 23, lineHeight: 33, fontWeight: "800", textAlign: "center", paddingHorizontal: 6 },
  sceneTextBig: { fontSize: 30, lineHeight: 40 },
  activity: { alignSelf: "stretch", gap: 18 },
  questionRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 22, backgroundColor: KIDS.card, borderWidth: 2, borderColor: KIDS.line },
  question: { flex: 1, color: KIDS.text, fontSize: 22, lineHeight: 30, fontWeight: "900" },
  cards: { gap: 12 },
  card: { flexDirection: "row", alignItems: "center", gap: 16, minHeight: 92, paddingHorizontal: 18, borderRadius: 24, backgroundColor: KIDS.card, borderWidth: 3, borderBottomWidth: 7, borderColor: KIDS.line },
  cardWrong: { borderColor: KIDS.bad, backgroundColor: KIDS.badSoft },
  cardRight: { borderColor: KIDS.good, backgroundColor: KIDS.goodSoft },
  cardEmoji: { fontSize: 52 },
  cardLabel: { color: KIDS.text, fontSize: 22, fontWeight: "900" },
  orderBadge: { position: "absolute", right: 14, top: 14, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.good },
  orderBadgeText: { color: "#ffffff", fontSize: 18, fontWeight: "900" },
  tfRow: { flexDirection: "row", gap: 12 },
  tf: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 22, borderRadius: 26, borderWidth: 3, borderBottomWidth: 7 },
  tfEmoji: { fontSize: 64 },
  praise: { color: KIDS.good, fontSize: 24, fontWeight: "900", textAlign: "center" },
  verseCard: { alignSelf: "stretch", alignItems: "center", gap: 12, padding: 24, borderRadius: 28, backgroundColor: KIDS.card, borderWidth: 3, borderColor: KIDS.star },
  verseLabel: { color: KIDS.cta, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textAlign: "center" },
  verseText: { color: KIDS.text, fontSize: 26, lineHeight: 36, fontWeight: "900", textAlign: "center" },
  verseRef: { color: KIDS.muted, fontSize: 16, fontWeight: "800" },
  repeat: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, minHeight: 52, borderRadius: 26, backgroundColor: "#f1edff", marginTop: 6 },
  repeatText: { color: KIDS.cta, fontSize: 17, fontWeight: "900" },
  done: { alignSelf: "stretch", alignItems: "center", gap: 12 },
  doneLumi: { width: 170, height: 160 },
  doneTitle: { color: KIDS.text, fontSize: 32, fontWeight: "900" },
  bigStars: { flexDirection: "row", gap: 6 },
  sticker: { flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "stretch", padding: 14, borderRadius: 22, borderWidth: 4, borderColor: "#ffffff", transform: [{ rotate: "-2deg" }] },
  stickerEmoji: { fontSize: 48 },
  flexShrink: { flexShrink: 1 },
  stickerLabel: { color: "#ffffff", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  stickerTitle: { color: "#ffffff", fontSize: 19, fontWeight: "900" },
  family: { alignSelf: "stretch", gap: 6, padding: 18, borderRadius: 24, backgroundColor: KIDS.card, borderWidth: 2, borderColor: KIDS.line },
  familyLabel: { color: KIDS.cta, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  familyText: { color: KIDS.text, fontSize: 19, lineHeight: 27, fontWeight: "800" },
  parentsNote: { color: KIDS.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  secondary: { minHeight: 52, paddingHorizontal: 24, borderRadius: 26, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: KIDS.line },
  secondaryText: { color: KIDS.text, fontSize: 16, fontWeight: "900" },
  navBar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingTop: 12, backgroundColor: KIDS.ground },
  navSide: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.card, borderWidth: 2, borderBottomWidth: 5, borderColor: KIDS.line },
  navSpacer: { width: 68 },
  navNext: { flex: 1, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.cta, borderBottomWidth: 7, borderBottomColor: KIDS.ctaShadow },
  navNextText: { color: "#ffffff", fontSize: 20, fontWeight: "900" }
});
