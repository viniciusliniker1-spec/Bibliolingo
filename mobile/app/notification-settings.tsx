import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import {
  defaultStudyNotificationPreferences,
  type StudyNotificationPreferences
} from "../../src/services/notificationPolicy";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import {
  loadMobileNotificationPreferences,
  saveMobileNotificationPreferences
} from "../services/notificationPreferences";
import { colors, radius, spacing } from "../theme/tokens";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import {
  cancelMobileStudyNotifications,
  reconcileMobileStudyNotifications
} from "../services/mobileNotifications";

const categories = [
  ["daily", "Lembrete diário", "Não aparece quando a meta diária já foi cumprida."],
  ["streak", "Sequência", "Não aparece quando você já estudou naquele dia."],
  ["inactivity", "Retomar os estudos", "Após três dias sem atividade, sem linguagem de culpa."],
  ["review", "Revisões", "Quando existirem conteúdos na fila inteligente."]
] as const;

export default function NotificationSettingsScreen() {
  const { progress } = useMobileProgress();
  const [preferences, setPreferences] = useState(defaultStudyNotificationPreferences);
  const [notice, setNotice] = useState("");
  useEffect(() => { void loadMobileNotificationPreferences().then(setPreferences); }, []);
  const update = <K extends keyof StudyNotificationPreferences>(key: K, value: StudyNotificationPreferences[K]) =>
    setPreferences((current) => ({ ...current, [key]: value }));

  return (
    <Screen>
      <Text style={styles.eyebrow}>LEMBRETES SEM PRESSÃO</Text>
      <Text style={styles.title}>Notificações</Text>
      <Text style={styles.body}>Escolha as categorias e um horário de silêncio. Nenhuma preferência é enviada ao Professor Noah.</Text>
      <View style={styles.card}>
        <Row title="Permitir lembretes" note="Controle principal de todas as categorias" value={preferences.enabled} onValueChange={(value) => update("enabled", value)} />
        {categories.map(([key, title, note]) => <Row key={key} title={title} note={note} value={preferences[key]} disabled={!preferences.enabled} onValueChange={(value) => update(key, value)} />)}
      </View>
      <View style={styles.card}>
        <TimeField label="Horário principal" value={preferences.time} onChangeText={(value) => update("time", value)} />
        <TimeField label="Silêncio a partir de" value={preferences.quietStart} onChangeText={(value) => update("quietStart", value)} />
        <TimeField label="Silêncio até" value={preferences.quietEnd} onChangeText={(value) => update("quietEnd", value)} />
      </View>
      <PrimaryButton onPress={async () => {
        await saveMobileNotificationPreferences(preferences);
        if (!preferences.enabled) {
          await cancelMobileStudyNotifications();
          setNotice("Notificações desativadas e programações removidas.");
          return;
        }
        const result = await reconcileMobileStudyNotifications(progress, preferences, {
          requestPermission: true
        });
        setNotice(
          result.status === "permission-required"
            ? "O Android não concedeu permissão. Você pode liberá-la nas configurações do aplicativo."
            : result.scheduled > 0
              ? "1 lembrete local programado. Ao alterar as preferências, o anterior é substituído."
              : "Preferências salvas. Nenhum aviso é necessário neste momento."
        );
      }}>Salvar e programar</PrimaryButton>
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
      <Text style={styles.limit}>Os avisos são locais e gratuitos. O Android pode exigir que a otimização de bateria seja ajustada. Push remoto não está ativado.</Text>
    </Screen>
  );
}
function Row({title,note,...props}:{title:string;note:string;value:boolean;disabled?:boolean;onValueChange:(value:boolean)=>void}){return <View style={styles.row}><View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.note}>{note}</Text></View><Switch {...props} trackColor={{false:colors.border,true:colors.teal}} /></View>}
function TimeField({label,...props}:{label:string;value:string;onChangeText:(value:string)=>void}){return <View style={styles.field}><Text style={styles.rowTitle}>{label}</Text><TextInput {...props} maxLength={5} keyboardType="numbers-and-punctuation" placeholder="19:00" style={styles.input} /></View>}
const styles=StyleSheet.create({
  eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},body:{color:colors.text,fontSize:16,lineHeight:24},
  card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.md},
  row:{minHeight:64,flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:spacing.md},copy:{flex:1,gap:spacing.xs},
  rowTitle:{color:colors.navy,fontWeight:"900"},note:{color:colors.muted,lineHeight:20},field:{gap:spacing.xs},
  input:{minHeight:48,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,paddingHorizontal:spacing.md,color:colors.navy,fontSize:16},
  notice:{padding:spacing.md,borderRadius:radius.md,backgroundColor:"#e8f7f4",color:colors.tealDark},
  limit:{color:colors.muted,fontSize:13,lineHeight:19}
});
