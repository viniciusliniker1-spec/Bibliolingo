import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { journeyBooks, orderedActivityIds } from "../../../src/content/catalog";
import { isBookActivityUnlocked, isJourneyActivityUnlocked, nextBookActivityId } from "../../../src/domain/unlocks";
import { mobileSceneAssets } from "../../assets/sceneAssets";
import { ProgressBar } from "../../components/ProgressBar";
import { SceneBanner } from "../../components/SceneBanner";
import { Screen } from "../../components/Screen";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

type StudyMode = "canonical" | "individual";

export default function BookScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { progress } = useMobileProgress();
  const [mode, setMode] = useState<StudyMode>("canonical");
  const book = journeyBooks.find((item) => item.id === bookId);

  if (!book) {
    return <Screen><Text style={styles.title}>Livro não encontrado</Text><Text style={styles.subtitle}>Volte às trilhas e escolha um livro disponível.</Text></Screen>;
  }

  const bookIds = book.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);
  const completedCount = bookIds.filter((id) => progress.completedLessonIds.includes(id) || progress.completedCheckpointIds.includes(id)).length;
  const firstIndividualPending = nextBookActivityId(bookIds, progress.completedLessonIds, progress.completedCheckpointIds);

  const openActivity = (activityId: string) => {
    const canonicalUnlocked = isJourneyActivityUnlocked(activityId, orderedActivityIds, progress.completedLessonIds, progress.completedCheckpointIds);
    const individualUnlocked = isBookActivityUnlocked(activityId, bookIds, progress.completedLessonIds, progress.completedCheckpointIds);
    const navigate = (journeyMode: StudyMode, id = activityId) => router.push({
      pathname: "/lesson/[activityId]",
      params: { activityId: id, journeyMode, journeyBookId: book.id }
    });

    if (mode === "canonical" && !canonicalUnlocked) {
      Alert.alert(
        "Como deseja estudar?",
        "Esta atividade ainda está bloqueada na jornada principal. Você pode continuar a jornada ou estudar este livro de forma independente.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Continuar jornada", onPress: () => router.replace("/") },
          {
            text: "Estudar livro",
            onPress: () => {
              setMode("individual");
              if (individualUnlocked) navigate("individual");
              else if (firstIndividualPending) {
                Alert.alert("Sequência do livro", "Vamos começar pela próxima atividade disponível deste livro.", [
                  { text: "Começar", onPress: () => navigate("individual", firstIndividualPending) }
                ]);
              }
            }
          }
        ]
      );
      return;
    }
    if (mode === "individual" && !individualUnlocked) {
      Alert.alert("Atividade ainda bloqueada", "No estudo individual, conclua as atividades anteriores deste livro primeiro.", [
        { text: "OK" },
        ...(firstIndividualPending ? [{ text: "Ir para a próxima", onPress: () => navigate("individual", firstIndividualPending) }] : [])
      ]);
      return;
    }
    navigate(mode);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TRILHA DO LIVRO</Text><Text style={styles.title}>{book.title}</Text>
        <Text style={styles.subtitle}>{completedCount}/{bookIds.length} atividades concluídas</Text>
        <ProgressBar value={completedCount / bookIds.length} />
      </View>
      <SceneBanner source={mobileSceneAssets.route} eyebrow="ROTA DE APRENDIZADO" title={`Avance por ${book.title}`} accessibilityLabel={`Portal da jornada de ${book.title}`} />
      <View style={styles.modeBox}>
        <Text style={styles.modeTitle}>Modo de estudo</Text>
        <View style={styles.segment}>
          {(["canonical", "individual"] as const).map((item) => (
            <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: mode === item }}
              onPress={() => setMode(item)} style={[styles.segmentButton, mode === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, mode === item && styles.segmentTextActive]}>{item === "canonical" ? "Jornada" : "Livro individual"}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.modeHelp}>{mode === "canonical" ? "Segue a ordem dos 66 livros e os desbloqueios da jornada principal." : "Avança apenas dentro deste livro, sem alterar os desbloqueios da jornada principal."}</Text>
      </View>

      {book.units.map((unit, unitIndex) => {
        const activities = [...unit.lessons, unit.checkpoint];
        const unitCompleted = activities.filter((item) => progress.completedLessonIds.includes(item.id) || progress.completedCheckpointIds.includes(item.id)).length;
        return <View key={unit.id} style={styles.unit}>
          <View style={styles.unitHeader}><View style={styles.unitNumber}><Text style={styles.unitNumberText}>{unitIndex + 1}</Text></View>
            <View style={styles.flex}><Text style={styles.unitTitle}>{unit.title}</Text><Text style={styles.unitSubtitle}>{unit.subtitle}</Text></View>
            <Text style={styles.unitProgress}>{unitCompleted}/{activities.length}</Text></View>
          <View style={styles.nodes}>{activities.map((activity, activityIndex) => {
            const checkpoint = !("steps" in activity);
            const completed = checkpoint ? progress.completedCheckpointIds.includes(activity.id) : progress.completedLessonIds.includes(activity.id);
            const unlocked = mode === "canonical"
              ? isJourneyActivityUnlocked(activity.id, orderedActivityIds, progress.completedLessonIds, progress.completedCheckpointIds)
              : isBookActivityUnlocked(activity.id, bookIds, progress.completedLessonIds, progress.completedCheckpointIds);
            return <Pressable key={activity.id} accessibilityRole="button" accessibilityState={{ disabled: !unlocked }}
              accessibilityLabel={`${activity.title}, ${completed ? "concluída" : unlocked ? "disponível" : "bloqueada"}`}
              onPress={() => openActivity(activity.id)}
              style={({ pressed }) => [styles.activity, completed && styles.completed, !unlocked && styles.locked, pressed && styles.pressed]}>
              <View style={[styles.node, checkpoint && styles.checkpointNode, completed && styles.completedNode]}><Text style={styles.nodeText}>{completed ? "✓" : checkpoint ? "★" : activityIndex + 1}</Text></View>
              <View style={styles.flex}><Text style={[styles.activityTitle, !unlocked && styles.lockedText]}>{activity.title}</Text>
                <Text style={styles.activitySubtitle}>{checkpoint ? "Checkpoint" : `${activity.estimatedMinutes} min`}</Text></View>
              <Text style={styles.stateText}>{completed ? "Feita" : unlocked ? "Começar" : "Bloqueada"}</Text>
            </Pressable>;
          })}</View>
        </View>;
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header:{gap:spacing.sm},eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},subtitle:{color:colors.muted,fontSize:15,lineHeight:22},
  modeBox:{gap:spacing.sm,padding:spacing.md,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,backgroundColor:colors.surface},modeTitle:{color:colors.navy,fontWeight:"900"},
  segment:{flexDirection:"row",padding:4,borderRadius:radius.full,backgroundColor:"#dfe9ee"},segmentButton:{flex:1,minHeight:44,alignItems:"center",justifyContent:"center",paddingHorizontal:spacing.sm,borderRadius:radius.full},
  segmentActive:{backgroundColor:colors.navy},segmentText:{color:colors.navy,fontSize:13,fontWeight:"800"},segmentTextActive:{color:colors.surface},modeHelp:{color:colors.muted,fontSize:13,lineHeight:19},
  unit:{backgroundColor:colors.surface,borderRadius:radius.lg,borderColor:colors.border,borderWidth:1,overflow:"hidden"},unitHeader:{flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.lg,backgroundColor:colors.navy},
  unitNumber:{width:34,height:34,borderRadius:17,alignItems:"center",justifyContent:"center",backgroundColor:colors.teal},unitNumberText:{color:colors.navy,fontWeight:"900"},unitTitle:{color:colors.surface,fontSize:17,fontWeight:"900"},
  unitSubtitle:{color:"#cddbe4",fontSize:13,marginTop:2},unitProgress:{color:colors.gold,fontWeight:"900"},nodes:{padding:spacing.md,gap:spacing.sm},activity:{minHeight:72,flexDirection:"row",alignItems:"center",gap:spacing.md,borderRadius:radius.md,padding:spacing.sm},
  completed:{backgroundColor:"#fff7df"},locked:{opacity:.55},pressed:{backgroundColor:"#e5f7f4"},node:{width:52,height:52,borderRadius:26,alignItems:"center",justifyContent:"center",backgroundColor:colors.teal},
  checkpointNode:{backgroundColor:colors.gold},completedNode:{backgroundColor:colors.gold},nodeText:{color:colors.navy,fontWeight:"900",fontSize:18},flex:{flex:1},activityTitle:{color:colors.navy,fontSize:15,fontWeight:"800"},
  activitySubtitle:{color:colors.muted,fontSize:12,marginTop:3},lockedText:{color:colors.muted},stateText:{color:colors.tealDark,fontSize:12,fontWeight:"800"}
});