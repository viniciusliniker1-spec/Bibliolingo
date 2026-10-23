import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { journeyBooks } from "../../../src/content/catalog";
import { Screen } from "../../components/Screen";
import { SceneBanner } from "../../components/SceneBanner";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";
import { mobileSceneAssets } from "../../assets/sceneAssets";

export default function TracksScreen() {
  const router = useRouter();
  const { progress } = useMobileProgress();
  const completed = useMemo(
    () => new Set([...progress.completedLessonIds, ...progress.completedCheckpointIds]),
    [progress.completedLessonIds, progress.completedCheckpointIds]
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View>
        <Text style={styles.eyebrow}>JORNADA BÍBLICA</Text>
        <Text style={styles.title}>Livros da Bíblia</Text>
        <Text style={styles.subtitle}>Escolha um livro. A jornada principal mantém sua posição, mesmo ao estudar outro livro.</Text>
      </View>
      <SceneBanner source={mobileSceneAssets.tracks} eyebrow="TRILHAS" title="Jardim do aprendizado" accessibilityLabel="Jardim representando as trilhas de aprendizagem bíblica" />
      <FlatList
        style={styles.listFill}
        data={journeyBooks}
        numColumns={2}
        keyExtractor={(book) => book.id}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        renderItem={({ item, index }) => {
          const ids = item.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);
          const completedCount = ids.filter((id) => completed.has(id)).length;
          const progressText = completedCount + "/" + ids.length + " atividades";
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${item.title}, ${progressText}`}
              onPress={() => router.push({ pathname: "/book/[bookId]", params: { bookId: item.id } })}
              style={({ pressed }) => [styles.book, pressed && styles.pressed]}
            >
              <View style={styles.badge}><Text style={styles.badgeText}>{item.shortTitle}</Text></View>
              <View style={styles.bookText}><Text style={styles.bookNumber}>Livro {index + 1}</Text><Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text><Text style={styles.bookMeta}>{progressText}</Text></View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen:{paddingBottom:0},eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900",marginTop:spacing.xs},subtitle:{color:colors.muted,fontSize:15,lineHeight:22,marginTop:spacing.xs},
  listFill:{flex:1},list:{gap:spacing.sm,paddingBottom:spacing.xl},columns:{gap:spacing.sm},book:{flex:1,minHeight:112,flexDirection:"row",alignItems:"center",gap:spacing.sm,padding:spacing.sm,borderRadius:radius.md,borderColor:colors.border,borderWidth:1,backgroundColor:colors.surface},
  pressed:{transform:[{scale:.98}],opacity:.9},badge:{width:40,height:40,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"#ffe3a3"},badgeText:{color:colors.goldDark,fontWeight:"900",fontSize:12},bookText:{flex:1},bookNumber:{color:colors.muted,fontSize:9},bookTitle:{color:colors.navy,fontSize:14,fontWeight:"900",lineHeight:18},bookMeta:{color:colors.muted,fontSize:10,marginTop:3},chevron:{color:colors.tealDark,fontSize:22}
});
