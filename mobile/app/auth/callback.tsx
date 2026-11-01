import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { mobileFeedbackAssets } from "../../assets/feedbackAssets";
import { colors, spacing } from "../../theme/tokens";

export default function AuthCallbackScreen() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => router.replace("/"), 900);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.screen}>
      <Image source={mobileFeedbackAssets.loading} style={styles.lumi} resizeMode="contain" accessibilityLabel="Lumi concluindo sua entrada" />
      <ActivityIndicator size="small" color={colors.teal} />
      <Text style={styles.title}>Concluindo sua entrada…</Text>
      <Text style={styles.body}>Aguarde enquanto o Bibliolingo recebe a confirmação da sua conta.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,alignItems:"center",justifyContent:"center",gap:spacing.md,padding:spacing.xl,backgroundColor:colors.background},
  lumi:{width:150,height:138},
  title:{color:colors.navy,fontSize:22,fontWeight:"900",textAlign:"center"},
  body:{color:colors.muted,fontSize:15,lineHeight:22,textAlign:"center"}
});
