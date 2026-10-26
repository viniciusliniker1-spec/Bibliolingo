import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileLumi } from "../providers/MobileLumiProvider";
import { colors, radius, spacing } from "../theme/tokens";

export function ProfilePhotoEditor() {
  const auth = useMobileAuth();
  const lumi = useMobileLumi();
  const [previewUri, setPreviewUri] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => setPreviewUri(undefined), [lumi.profilePhotoUrl, auth.session?.user.id]);

  const choosePhoto = async () => {
    setNotice("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setNotice("Permita o acesso às fotos para escolher sua imagem de perfil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });
    if (result.canceled || !result.assets[0]) return;
    const processed = await manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 768, height: 768 } }],
      { compress: 0.78, format: SaveFormat.JPEG }
    );
    setPreviewUri(processed.uri);
    setNotice("Confira a prévia e toque em salvar.");
  };

  const save = async () => {
    if (!previewUri) return;
    setBusy(true);
    setNotice("");
    try {
      await lumi.uploadPhoto(previewUri);
      setPreviewUri(undefined);
      setNotice("Foto sincronizada com sua conta.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível salvar a foto.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setNotice("");
    try {
      await lumi.removePhoto();
      setPreviewUri(undefined);
      setNotice("Foto removida. A imagem padrão voltou a ser usada.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível remover a foto.");
    } finally {
      setBusy(false);
    }
  };

  const displayName = auth.session?.user.user_metadata?.display_name ?? auth.session?.user.email ?? "Estudante";
  const shownUri = previewUri ?? lumi.profilePhotoUrl;

  return <View style={styles.card}>
    <View style={styles.photoWrap}>
      {shownUri
        ? <Image source={{ uri: shownUri }} style={styles.photo} accessibilityLabel={previewUri ? "Prévia da nova foto de perfil" : "Foto de perfil"} />
        : <View style={styles.fallback} accessibilityLabel="Imagem de perfil padrão"><Text style={styles.initial}>{displayName.slice(0, 1).toUpperCase()}</Text></View>}
    </View>
    <View style={styles.copy}>
      <Text style={styles.title}>Foto de perfil</Text>
      <Text style={styles.help}>A foto identifica sua conta. A Lumi continua sendo sua personagem nas trilhas.</Text>
      <View style={styles.actions}>
        <Action label={shownUri ? "Trocar foto" : "Escolher foto"} disabled={busy} onPress={() => void choosePhoto()} />
        {previewUri ? <Action label={busy ? "Salvando…" : "Salvar"} primary disabled={busy} onPress={() => void save()} /> : null}
        {!previewUri && lumi.profilePhotoUrl ? <Action label="Remover" disabled={busy} onPress={() => void remove()} /> : null}
        {previewUri ? <Action label="Cancelar" disabled={busy} onPress={() => setPreviewUri(undefined)} /> : null}
      </View>
      <Text style={styles.privacy}>Recorte quadrado, prévia circular e compressão antes do envio. Máximo de 2 MB processados.</Text>
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
    </View>
  </View>;
}

function Action({ label, onPress, disabled, primary }: { label: string; onPress: () => void; disabled: boolean; primary?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.actionPrimary, (pressed || disabled) && styles.actionPressed]}>
    <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: "#10272b", borderWidth: 1, borderColor: "#24484c" },
  photoWrap: { width: 112, height: 112, borderRadius: 56, overflow: "hidden", borderWidth: 3, borderColor: "#f2c766", backgroundColor: "#dff4ee" },
  photo: { width: "100%", height: "100%" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.tealDark },
  initial: { color: "#effaf4", fontSize: 42, fontWeight: "900" },
  copy: { flex: 1, gap: spacing.sm },
  title: { color: "#effaf4", fontSize: 20, fontWeight: "900" },
  help: { color: "#c8dbd7", fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  action: { minHeight: 40, justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1, borderColor: "#88aaa4" },
  actionPrimary: { backgroundColor: "#f2c766", borderColor: "#f2c766" },
  actionPressed: { opacity: 0.65 },
  actionText: { color: "#effaf4", fontSize: 12, fontWeight: "900" },
  actionTextPrimary: { color: "#10272b" },
  privacy: { color: "#9eb9b4", fontSize: 10, lineHeight: 15 },
  notice: { color: "#f2c766", fontSize: 11, fontWeight: "700" }
});
