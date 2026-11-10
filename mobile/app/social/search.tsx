import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../../components/navigation/Icons";
import { LumiAvatar } from "../../components/social/LumiAvatar";
import { formatXp, levelOf, socialErrorMessage, type SocialSearchResult } from "../../domain/social";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { followStudent, searchStudents, unfollowStudent } from "../../services/socialRemote";
import type { Palette } from "../../theme/tokens";

/** Buscar alunos pelo começo do @usuário ou do nome e seguir direto da lista. */
export default function StudentSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { session } = useMobileAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SocialSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const term = query.trim().replace(/^@/, "");

  useEffect(() => {
    if (!session || term.length < 2) { setResults([]); setMessage(""); setLoading(false); return; }
    let current = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try { const found = await searchStudents(session, term); if (current) { setResults(found); setMessage(""); } }
      catch (failure) { if (current) setMessage(socialErrorMessage(failure)); }
      finally { if (current) setLoading(false); }
    }, 350);
    return () => { current = false; clearTimeout(timer); };
  }, [session, term]);

  const toggle = async (item: SocialSearchResult) => {
    if (!session) return;
    setResults((list) => list.map((entry) => entry.userId === item.userId ? { ...entry, isFollowing: !entry.isFollowing } : entry));
    try { if (item.isFollowing) await unfollowStudent(session, item.userId); else await followStudent(session, item.userId); }
    catch (failure) {
      setResults((list) => list.map((entry) => entry.userId === item.userId ? { ...entry, isFollowing: item.isFollowing } : entry));
      setMessage(socialErrorMessage(failure));
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Buscar alunos" }} />
      <View style={styles.searchBox}>
        <Icon name="search" size={18} color={palette.textMuted} />
        <TextInput accessibilityLabel="Buscar alunos" autoFocus value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false}
          placeholder="@usuário ou nome" placeholderTextColor={palette.textMuted} style={styles.input} />
        {loading ? <ActivityIndicator color={palette.accent} /> : null}
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={(item) => item.userId}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 30 }]}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>{term.length < 2 ? "Digite pelo menos 2 letras do @usuário ou do nome." : "Ninguém encontrado. Só aparecem alunos que entraram no ranking."}</Text> : null}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}, @${item.handle}`} onPress={() => router.push({ pathname: "/social/[id]", params: { id: item.userId } })} style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
            <LumiAvatar skinId={item.skinId} size={46} />
            <View style={styles.flex}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>@{item.handle} · nível {levelOf(item.totalXp)} · {formatXp(item.totalXp)} XP</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={item.isFollowing ? "Deixar de seguir" : "Seguir"} onPress={() => void toggle(item)} hitSlop={6} style={[styles.follow, item.isFollowing && styles.following]}>
              <Text style={[styles.followText, item.isFollowing && { color: palette.text }]}>{item.isFollowing ? "Seguindo" : "Seguir"}</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, margin: 16, marginBottom: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 2, borderColor: p.line, backgroundColor: p.card },
  input: { flex: 1, minHeight: 50, color: p.text, fontSize: 16, fontWeight: "700" },
  message: { color: p.error, fontSize: 13, fontWeight: "800", marginHorizontal: 16, marginBottom: 6 },
  list: { paddingHorizontal: 16, gap: 8 },
  empty: { color: p.textMuted, fontSize: 14, textAlign: "center", paddingVertical: 40, paddingHorizontal: 20, lineHeight: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  name: { color: p.text, fontSize: 15, fontWeight: "900" },
  meta: { color: p.textMuted, fontSize: 12, fontWeight: "700" },
  follow: { minWidth: 86, minHeight: 38, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, borderRadius: 12, backgroundColor: p.cta, borderBottomWidth: 3, borderBottomColor: p.ctaShadow },
  following: { backgroundColor: p.ground, borderWidth: 1.5, borderColor: p.line, borderBottomWidth: 1.5 },
  followText: { color: p.ctaText, fontSize: 13, fontWeight: "900" }
});
