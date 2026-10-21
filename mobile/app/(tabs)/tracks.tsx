import { useEffect, useMemo, useState } from "react";
import { FlatList, InteractionManager, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { bibleBooks } from "../../../src/content/bible/catalog";
import { Screen } from "../../components/Screen";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { loadMobileCurriculum } from "../../services/mobileCurriculum";
import { colors, radius, spacing } from "../../theme/tokens";

type LoadedBook = Awaited<ReturnType<typeof loadMobileCurriculum>>["journeyBooks"][number];

const lightweightBooks = bibleBooks.map((book) => ({
  id: book.id === "song" ? "song-of-songs" : book.id,
  title: book.name,
  shortTitle: book.abbreviation
}));

export default function TracksScreen() {
  const router = useRouter();
  const { progress } = useMobileProgress();
  const [loadedBooks, setLoadedBooks] = useState<LoadedBook[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const visibleAt = globalThis.performance?.now?.() ?? Date.now();
    console.info("[BibliolingoPerf] trails_lightweight_visible_ms=0");
    const task = InteractionManager.runAfterInteractions(() => {
      void loadMobileCurriculum()
        .then((catalog) => {
          if (!active) return;
          setLoadedBooks(catalog.journeyBooks);
          console.info("[BibliolingoPerf] trails_progress_ready_ms=" + Math.round((globalThis.performance?.now?.() ?? Date.now()) - visibleAt));
        })
        .catch(() => {
          if (active) setLoadFailed(true);
        });
    });
    return () => {
      active = false;
      task.cancel();
    };
  }, []);

  const exactProgress = useMemo(() => {
    if (!loadedBooks) return new Map<string, { completed: number; total: number }>();
    const completed = new Set([...progress.completedLessonIds, ...progress.completedCheckpointIds]);
    return new Map(loadedBooks.map((book) => {
      const ids = book.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);
      return [book.id, { completed: ids.filter((id) => completed.has(id)).length, total: ids.length }];
    }));
  }, [loadedBooks, progress.completedLessonIds, progress.completedCheckpointIds]);

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View>
        <Text style={styles.eyebrow}>JORNADA BÍBLICA</Text>
        <Text style={styles.title}>Livros da Bíblia</Text>
        <Text style={styles.subtitle}>Escolha um livro. A jornada principal mantém sua posição, mesmo ao estudar outro livro.</Text>
      </View>
      <FlatList
        style={styles.listFill}
        data={lightweightBooks}
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
          const counts = exactProgress.get(item.id);
          const progressText = counts
            ? counts.completed + "/" + counts.total + " atividades"
            : loadFailed ? "Progresso indisponível" : "Carregando progresso…";
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
