import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { parentGateQuestion } from "../../domain/kids";

/**
 * Portão dos pais: uma conta simples que criança pequena não resolve de cabeça.
 * Protege a saída do modo criança e as configurações.
 */
export function ParentGate({ visible, onPass, onCancel }: { visible: boolean; onPass: () => void; onCancel: () => void }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000));
  const [wrong, setWrong] = useState(false);
  const question = useMemo(() => parentGateQuestion(seed), [seed]);
  const choose = (value: number) => {
    if (value === question.answer) { setWrong(false); setSeed(Math.floor(Math.random() * 1000)); onPass(); }
    else { setWrong(true); setSeed(Math.floor(Math.random() * 1000)); }
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>SÓ PARA ADULTOS</Text>
          <Text style={styles.title}>Quanto é {question.text}?</Text>
          {wrong ? <Text style={styles.wrong}>Resposta errada. Tente esta outra.</Text> : null}
          <View style={styles.options}>
            {question.options.map((option) => (
              <Pressable key={option} accessibilityRole="button" onPress={() => choose(option)} style={({ pressed }) => [styles.option, pressed && { opacity: 0.8 }]}>
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancel}><Text style={styles.cancelText}>Voltar</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "rgba(10,20,40,0.7)" },
  card: { alignSelf: "stretch", alignItems: "center", gap: 12, padding: 24, borderRadius: 28, backgroundColor: "#ffffff" },
  eyebrow: { color: "#7a5af5", fontSize: 12, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: "#1d2340", fontSize: 26, fontWeight: "900" },
  wrong: { color: "#d64561", fontSize: 14, fontWeight: "800" },
  options: { flexDirection: "row", gap: 10, marginTop: 6 },
  option: { width: 80, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#eef0ff", borderWidth: 2, borderBottomWidth: 5, borderColor: "#c9cdf5" },
  optionText: { color: "#1d2340", fontSize: 24, fontWeight: "900" },
  cancel: { minHeight: 44, justifyContent: "center", marginTop: 4 },
  cancelText: { color: "#6b7090", fontSize: 15, fontWeight: "800" }
});
