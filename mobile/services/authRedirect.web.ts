import * as Linking from "expo-linking";

/** Na web a volta do login é a própria página do site (com o caminho base do GitHub Pages). */
export function authRedirectUrl() {
  return Linking.createURL("auth/callback");
}
