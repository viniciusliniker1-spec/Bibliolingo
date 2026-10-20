import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native";
import { AuthEntry } from "../components/AuthEntry";
import { Screen } from "../components/Screen";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { colors } from "../theme/tokens";

export default function EntryScreen() {
  const auth = useMobileAuth();

  if (auth.loading) {
    return (
      <Screen scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.teal} size="large" />
      </Screen>
    );
  }

  if (auth.session || auth.guestMode) {
    return <Redirect href="/(tabs)" />;
  }

  return <AuthEntry />;
}
